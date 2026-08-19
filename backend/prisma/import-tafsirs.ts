/**
 * Download every official tafsir into Postgres (served by our API afterwards).
 *
 * Prefers Quran Foundation when QF_CLIENT_ID / QF_CLIENT_SECRET are set;
 * otherwise uses the public Quran.com Content API.
 *
 *   cd backend && npm run tafsir:import
 *   npm run tafsir:import -- --langs=en,ar,ur
 *   npm run tafsir:import -- --catalog-only
 */
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const PUBLIC_API = 'https://api.quran.com/api/v4';
const QF_API = process.env.QF_API_BASE_URL || 'https://apis.quran.foundation';
const AUTH_BASE = process.env.QF_AUTH_BASE_URL || 'https://oauth2.quran.foundation';
const BATCH_SIZE = 2000;
const PER_PAGE = 50;

type TafsirResource = {
  id: number;
  name: string;
  slug: string | null;
  language_name: string;
  author_name?: string | null;
};

const LANGUAGE_CODES: Record<string, string> = {
  english: 'en', arabic: 'ar', urdu: 'ur', persian: 'fa', french: 'fr', german: 'de',
  spanish: 'es', italian: 'it', dutch: 'nl', russian: 'ru', turkish: 'tr', indonesian: 'id',
  malay: 'ms', bengali: 'bn', pashto: 'ps', hindi: 'hi', chinese: 'zh', bosnian: 'bs',
  albanian: 'sq', kurdish: 'ku', kazakh: 'kk', uzbek: 'uz', tajik: 'tg', somali: 'so',
  malayalam: 'ml', tamil: 'ta', japanese: 'ja', korean: 'ko', portuguese: 'pt',
};

const languageCode = (name: string) => {
  const key = (name || '').toLowerCase().trim();
  return LANGUAGE_CODES[key] || key.replace(/[^a-z]/g, '').slice(0, 10) || 'und';
};

let accessToken = '';

async function qfHeaders() {
  if (!process.env.QF_CLIENT_ID || !process.env.QF_CLIENT_SECRET) return null;
  if (!accessToken) {
    const response = await axios.post<{ access_token: string }>(
      `${AUTH_BASE}/oauth2/token`,
      'grant_type=client_credentials&scope=content',
      {
        auth: { username: process.env.QF_CLIENT_ID, password: process.env.QF_CLIENT_SECRET },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 15_000,
      },
    );
    accessToken = response.data.access_token;
  }
  return {
    'x-auth-token': accessToken,
    'x-client-id': process.env.QF_CLIENT_ID,
    Accept: 'application/json',
  };
}

async function getResources(): Promise<TafsirResource[]> {
  const qf = await qfHeaders();
  if (qf) {
    const response = await axios.get<{ tafsirs: TafsirResource[] }>(
      `${QF_API}/content/api/v4/resources/tafsirs`,
      { headers: qf, timeout: 30_000 },
    );
    return response.data.tafsirs ?? [];
  }
  const response = await axios.get<{ tafsirs: TafsirResource[] }>(
    `${PUBLIC_API}/resources/tafsirs`,
    { timeout: 30_000 },
  );
  return response.data.tafsirs ?? [];
}

async function fetchChapter(resourceId: number, chapter: number, page: number) {
  const qf = await qfHeaders();
  const url = qf
    ? `${QF_API}/content/api/v4/tafsirs/${resourceId}/by_chapter/${chapter}`
    : `${PUBLIC_API}/tafsirs/${resourceId}/by_chapter/${chapter}`;
  const response = await axios.get<{
    tafsirs?: Array<{ verse_key: string; text: string }>;
    pagination?: { next_page: number | null; total_pages: number };
  }>(url, {
    params: { per_page: PER_PAGE, page },
    headers: qf ?? undefined,
    timeout: 120_000,
  });
  return response.data;
}

async function main() {
  const resources = await getResources();
  if (!resources.length) throw new Error('No tafsir resources returned');

  const langsArg =
    process.argv.find((arg) => arg.startsWith('--langs='))?.slice('--langs='.length) ||
    process.argv.find((arg) => arg.startsWith('--lang='))?.slice('--lang='.length);
  const langFilters = langsArg
    ? langsArg.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
    : null;
  const selected = langFilters
    ? resources.filter((resource) => langFilters.includes(languageCode(resource.language_name)))
    : resources;
  if (!selected.length) throw new Error('No tafsir resources match the language filter');

  console.log(
    `Found ${resources.length} tafsir sources; importing ${selected.length}` +
      (langFilters ? ` for ${langFilters.join(', ')}` : ' (all languages)') +
      '.',
  );

  const sourceByExternalId = new Map<number, number>();
  for (const resource of selected) {
    const slug = (resource.slug && resource.slug.trim()) || `qf-${resource.id}`;
    const source = await prisma.tafsirSource.upsert({
      where: { slug },
      update: {
        name: resource.name,
        languageCode: languageCode(resource.language_name),
        author: resource.author_name ?? null,
        externalId: resource.id,
      },
      create: {
        name: resource.name,
        languageCode: languageCode(resource.language_name),
        slug,
        author: resource.author_name ?? null,
        externalId: resource.id,
      },
    });
    sourceByExternalId.set(resource.id, source.id);
  }

  if (process.argv.includes('--catalog-only')) {
    console.log(`Updated metadata for ${selected.length} tafsir sources.`);
    return;
  }

  let processed = 0;
  for (const resource of selected) {
    const sourceId = sourceByExternalId.get(resource.id);
    if (!sourceId) continue;
    console.log(`→ ${resource.name} (${resource.id})`);

    for (let chapter = 1; chapter <= 114; chapter += 1) {
      const surah = await prisma.surah.findUnique({
        where: { number: chapter },
        select: { id: true },
      });
      if (!surah) continue;
      const ayahs = await prisma.ayah.findMany({
        where: { surahId: surah.id },
        select: { id: true, number: true },
      });
      const ayahByNumber = new Map(ayahs.map((ayah) => [ayah.number, ayah.id]));
      const rows: Array<{ ayahId: number; sourceId: number; text: string }> = [];

      let page = 1;
      let totalPages = 1;
      while (page <= totalPages) {
        const data = await fetchChapter(resource.id, chapter, page);
        totalPages = data.pagination?.total_pages || 1;
        for (const item of data.tafsirs ?? []) {
          const ayahNumber = Number(String(item.verse_key).split(':')[1]);
          const ayahId = ayahByNumber.get(ayahNumber);
          const text = (item.text || '').trim();
          if (!ayahId || !text) continue;
          rows.push({ ayahId, sourceId, text });
        }
        page += 1;
      }

      for (let offset = 0; offset < rows.length; offset += BATCH_SIZE) {
        await prisma.tafsir.createMany({
          data: rows.slice(offset, offset + BATCH_SIZE),
          skipDuplicates: true,
        });
      }
      processed += rows.length;
      console.log(`  Surah ${chapter}/114: ${rows.length} entries`);
    }
  }

  console.log(`Done. Stored ${processed} tafsir rows from ${selected.length} sources.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
