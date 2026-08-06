import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const API_BASE = process.env.QF_API_BASE_URL || 'https://apis.quran.foundation';
const AUTH_BASE = process.env.QF_AUTH_BASE_URL || 'https://oauth2.quran.foundation';
const BATCH_SIZE = 5000;

type TranslationResource = {
  id: number;
  name: string;
  slug: string | null;
  language_name: string;
};

let accessToken = '';

async function authenticate() {
  if (accessToken) return accessToken;
  if (!process.env.QF_CLIENT_ID || !process.env.QF_CLIENT_SECRET) {
    throw new Error('QF_CLIENT_ID and QF_CLIENT_SECRET are required');
  }
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
  return accessToken;
}

const headers = async () => ({
  'x-auth-token': await authenticate(),
  'x-client-id': process.env.QF_CLIENT_ID!,
  Accept: 'application/json',
});

const stripHtml = (text: string) => text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'translation';

const LANGUAGE_CODES: Record<string, string> = {
  english: 'en', arabic: 'ar', urdu: 'ur', persian: 'fa', french: 'fr', german: 'de',
  spanish: 'es', italian: 'it', dutch: 'nl', russian: 'ru', turkish: 'tr', indonesian: 'id',
  malay: 'ms', bengali: 'bn', pashto: 'ps', hindi: 'hi', punjabi: 'pa', sindhi: 'sd',
  chinese: 'zh', japanese: 'ja', korean: 'ko', portuguese: 'pt', swahili: 'sw', tamil: 'ta',
  telugu: 'te', malayalam: 'ml', marathi: 'mr', gujarati: 'gu', kannada: 'kn', nepali: 'ne',
  thai: 'th', vietnamese: 'vi', hebrew: 'he', polish: 'pl', ukrainian: 'uk', czech: 'cs',
  romanian: 'ro', albanian: 'sq', bosnian: 'bs', serbian: 'sr', croatian: 'hr',
  bulgarian: 'bg', macedonian: 'mk', somali: 'so', hausa: 'ha', yoruba: 'yo', amharic: 'am',
  finnish: 'fi', swedish: 'sv', norwegian: 'no', lithuanian: 'lt', tagalog: 'tl', filipino: 'fil',
  uzbek: 'uz', kazakh: 'kk', tajik: 'tg', kurdish: 'ku', azeri: 'az', tatar: 'tt',
};
const languageCode = (resource: TranslationResource) => {
  const name = (resource.language_name || '').toLowerCase().trim();
  return LANGUAGE_CODES[name] || name.replace(/[^a-z]/g, '').slice(0, 10) || 'unknown';
};

const resourceSlug = (resource: TranslationResource) => {
  if (resource.slug) return resource.slug;
  const lang = languageCode(resource);
  return `${lang}-${slugify(resource.name)}-${resource.id}`;
};

async function getResources() {
  const response = await axios.get<{ translations: TranslationResource[] }>(
    `${API_BASE}/content/api/v4/resources/translations`,
    { headers: await headers(), timeout: 30_000 },
  );
  return response.data.translations ?? [];
}

async function main() {
  const resources = await getResources();
  if (!resources.length) throw new Error('No translation resources returned');

  const langFilter = process.argv.find((arg) => arg.startsWith('--lang='))?.slice('--lang='.length);
  const selected = langFilter
    ? resources.filter((resource) => languageCode(resource) === langFilter)
    : resources;
  if (!selected.length) throw new Error(langFilter ? `No translations for language "${langFilter}"` : 'No translation resources returned');
  console.log(`Found ${resources.length} official translations${langFilter ? `; importing ${selected.length} for ${langFilter}` : ''}.`);

  const translatorByResource = new Map<number, number>();
  for (const resource of selected) {
    const slug = resourceSlug(resource);
    const translator = await prisma.translator.upsert({
      where: { slug },
      update: { name: resource.name, languageCode: languageCode(resource) },
      create: { name: resource.name, languageCode: languageCode(resource), slug },
    });
    translatorByResource.set(resource.id, translator.id);
  }

  if (process.argv.includes('--catalog-only')) {
    console.log(`Updated metadata for ${selected.length} translation resources.`);
    return;
  }

  const resourceIds = selected.map((resource) => resource.id).join(',');
  let processed = 0;
  for (let chapterNumber = 1; chapterNumber <= 114; chapterNumber += 1) {
    const surah = await prisma.surah.findUnique({ where: { number: chapterNumber }, select: { id: true } });
    if (!surah) continue;
    const ayahs = await prisma.ayah.findMany({ where: { surahId: surah.id }, select: { id: true, number: true } });
    const ayahByNumber = new Map(ayahs.map((ayah) => [ayah.number, ayah.id]));

    const response = await axios.get<{
      verses: Array<{
        verse_number: number;
        translations: Array<{ resource_id: number; text: string }>;
      }>;
    }>(`${API_BASE}/content/api/v4/verses/by_chapter/${chapterNumber}`, {
      params: {
        translations: resourceIds,
        translation_fields: 'resource_name,language_id,resource_id',
        per_page: 300,
      },
      headers: await headers(),
      timeout: 120_000,
    });

    const rows: Array<{ ayahId: number; translatorId: number; text: string }> = [];
    for (const verse of response.data.verses ?? []) {
      const ayahId = ayahByNumber.get(verse.verse_number);
      if (!ayahId) continue;
      for (const translation of verse.translations ?? []) {
        const translatorId = translatorByResource.get(translation.resource_id);
        const text = stripHtml(translation.text || '');
        if (translatorId && text) rows.push({ ayahId, translatorId, text });
      }
    }

    for (let offset = 0; offset < rows.length; offset += BATCH_SIZE) {
      await prisma.ayahTranslation.createMany({ data: rows.slice(offset, offset + BATCH_SIZE), skipDuplicates: true });
    }
    processed += rows.length;
    console.log(`Surah ${chapterNumber}/114: ${rows.length} translations (${processed} processed)`);
  }
  console.log(`Done. Processed ${processed} verse translations from ${selected.length} resources.`);
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
