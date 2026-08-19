/**
 * Download Hadith, Quran Reflect lessons, and related Q&A for every ayah
 * into Postgres. The API then serves the reader from our database.
 *
 *   cd backend && npm run study:import
 *   npm run study:import -- --kinds=hadith,related
 *   npm run study:import -- --force
 */
import { PrismaClient, Prisma } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const QF_API = process.env.QF_API_BASE_URL || 'https://apis.quran.foundation';
const AUTH_BASE = process.env.QF_AUTH_BASE_URL || 'https://oauth2.quran.foundation';
const LESSON_LANGUAGE_IDS = [2, 1, 5, 7, 6, 4, 3];
const FORCE = process.argv.includes('--force');
const kindsArg = process.argv.find((arg) => arg.startsWith('--kinds='))?.slice('--kinds='.length);
const KINDS = new Set(
  (kindsArg || 'hadith,related,lesson')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
);

const tokens = new Map<string, { token: string; expiresAt: number }>();

async function token(scope: string) {
  const cached = tokens.get(scope);
  if (cached && Date.now() < cached.expiresAt) return cached.token;
  if (!process.env.QF_CLIENT_ID || !process.env.QF_CLIENT_SECRET) {
    throw new Error('QF_CLIENT_ID and QF_CLIENT_SECRET are required');
  }
  const response = await axios.post<{ access_token: string; expires_in: number }>(
    `${AUTH_BASE}/oauth2/token`,
    `grant_type=client_credentials&scope=${encodeURIComponent(scope)}`,
    {
      auth: { username: process.env.QF_CLIENT_ID, password: process.env.QF_CLIENT_SECRET },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 15_000,
    },
  );
  tokens.set(scope, {
    token: response.data.access_token,
    expiresAt: Date.now() + Math.max(60, response.data.expires_in - 60) * 1000,
  });
  return response.data.access_token;
}

async function qfGet<T>(path: string, params: Record<string, unknown>, scope = 'content'): Promise<T> {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const response = await axios.get<T>(`${QF_API}${path}`, {
        params,
        headers: {
          'x-auth-token': await token(scope),
          'x-client-id': process.env.QF_CLIENT_ID!,
          Accept: 'application/json',
        },
        timeout: 60_000,
      });
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401) {
        tokens.delete(scope);
        continue;
      }
      if (status === 429 || status >= 500 || !status) {
        await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
        continue;
      }
      if (status === 404) return {} as T;
      throw error;
    }
  }
  return {} as T;
}

async function save(ayahId: number, kind: string, language: string, payload: unknown) {
  await prisma.ayahStudySnapshot.upsert({
    where: { ayahId_kind_language: { ayahId, kind, language } },
    update: { payload: payload as Prisma.InputJsonValue },
    create: { ayahId, kind, language, payload: payload as Prisma.InputJsonValue },
  });
}

async function already(ayahId: number, kind: string, language: string) {
  if (FORCE) return false;
  const row = await prisma.ayahStudySnapshot.findUnique({
    where: { ayahId_kind_language: { ayahId, kind, language } },
    select: { id: true },
  });
  return Boolean(row);
}

async function importHadith(ayahId: number, verseKey: string, language: 'en' | 'ar') {
  if (await already(ayahId, 'hadith', language)) return;
  const hadiths: unknown[] = [];
  let page = 1;
  let hasMore = true;
  while (hasMore && page <= 20) {
    const data = await qfGet<{ hadiths?: unknown[]; has_more?: boolean }>(
      `/content/api/v4/hadith_references/by_ayah/${encodeURIComponent(verseKey)}/hadiths`,
      { language, page, limit: 10 },
    );
    hadiths.push(...(data.hadiths ?? []));
    hasMore = Boolean(data.has_more);
    page += 1;
  }
  await save(ayahId, 'hadith', language, { hadiths });
}

async function importRelated(ayahId: number, verseKey: string, language: 'en' | 'ar') {
  if (await already(ayahId, 'related', language)) return;
  const questions: unknown[] = [];
  let page = 1;
  let total = Infinity;
  while (questions.length < total && page <= 20) {
    const data = await qfGet<{ questions?: unknown[]; totalCount?: number }>(
      `/content/api/v4/answers/by_ayah/${encodeURIComponent(verseKey)}`,
      { language, page, pageSize: 10 },
    );
    const batch = data.questions ?? [];
    questions.push(...batch);
    total = typeof data.totalCount === 'number' ? data.totalCount : questions.length;
    if (!batch.length) break;
    page += 1;
  }
  await save(ayahId, 'related', language, { questions, totalCount: questions.length });
}

async function importLessons(ayahId: number, surahNumber: number, ayahNumber: number, languageId: number) {
  const language = String(languageId);
  if (await already(ayahId, 'lesson', language)) return;
  const posts: unknown[] = [];
  let page = 1;
  let pages = 1;
  while (page <= pages && page <= 10) {
    const data = await qfGet<{ data?: unknown[]; pages?: number; total?: number }>(
      '/quran-reflect/v1/posts/feed',
      {
        tab: 'qdc',
        languages: languageId,
        page,
        limit: 20,
        'filter[references][0][chapterId]': surahNumber,
        'filter[references][0][from]': ayahNumber,
        'filter[references][0][to]': ayahNumber,
        'filter[postTypeIds]': 2,
        'filter[verifiedOnly]': true,
      },
      'post.read',
    );
    posts.push(...(data.data ?? []));
    pages = Math.max(1, data.pages || 1);
    page += 1;
  }
  await save(ayahId, 'lesson', language, { data: posts, total: posts.length });
}

async function main() {
  const ayahs = await prisma.ayah.findMany({
    select: { id: true, number: true, surah: { select: { number: true } } },
    orderBy: [{ surahId: 'asc' }, { number: 'asc' }],
  });
  console.log(`Importing verse study content for ${ayahs.length} ayahs (${[...KINDS].join(', ')}).`);
  let done = 0;
  for (const ayah of ayahs) {
    const verseKey = `${ayah.surah.number}:${ayah.number}`;
    if (KINDS.has('hadith')) {
      await importHadith(ayah.id, verseKey, 'en');
      await importHadith(ayah.id, verseKey, 'ar');
    }
    if (KINDS.has('related')) {
      await importRelated(ayah.id, verseKey, 'en');
      await importRelated(ayah.id, verseKey, 'ar');
    }
    if (KINDS.has('lesson')) {
      for (const languageId of LESSON_LANGUAGE_IDS) {
        await importLessons(ayah.id, ayah.surah.number, ayah.number, languageId);
      }
    }
    done += 1;
    if (done % 25 === 0 || ayah.number === 1) {
      console.log(`  ${verseKey} (${done}/${ayahs.length})`);
    }
  }
  console.log(`Done. Stored study snapshots for ${done} ayahs.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
