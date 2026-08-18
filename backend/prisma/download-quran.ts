/**
 * Download full Quran (114 surahs + ayahs + English translation) from Quran.com API.
 * Skips when DB already has a complete ayah set (~6236), unless FORCE=1.
 * Also skips individual surahs that already have their full ayah count (resume-safe).
 *
 * Usage:
 *   npx ts-node prisma/download-quran.ts
 *   FORCE=1 npx ts-node prisma/download-quran.ts
 */
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import Redis from 'ioredis';

const prisma = new PrismaClient();
const API = 'https://api.quran.com/api/v4';
const EXPECTED_AYAHS = 6236;
const TRANSLATION_ID = 20; // Sahih International
const FORCE = process.env.FORCE === '1' || process.argv.includes('--force');
const METADATA_ONLY = process.env.METADATA_ONLY === '1' || process.argv.includes('--metadata-only');

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function getJson<T>(url: string, retries = 4): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.get<T>(url, { timeout: 60_000 });
      return res.data;
    } catch (err) {
      lastErr = err;
      await sleep(800 * (i + 1));
    }
  }
  throw lastErr;
}

async function ensureTranslator() {
  return prisma.translator.upsert({
    where: { slug: 'en-sahih-international' },
    update: {},
    create: {
      name: 'Sahih International',
      languageCode: 'en',
      slug: 'en-sahih-international',
    },
  });
}

async function ensureReciter() {
  return prisma.reciter.upsert({
    where: { slug: 'abdul-basit-murattal' },
    update: {},
    create: {
      name: 'Abdul Basit Abdul Samad',
      nameArabic: 'عبد الباسط عبد الصمد',
      slug: 'abdul-basit-murattal',
      style: 'Murattal',
      baseUrl: 'https://everyayah.com/data/Abdul_Basit_Murattal_64kbps',
      isDefault: true,
      sortOrder: 1,
    },
  });
}

type VerseRow = {
  id: number;
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
  text_uthmani_tajweed?: string;
  juz_number?: number;
  hizb_number?: number;
  ruku_number?: number;
  manzil_number?: number;
  page_number?: number;
};

async function fetchChapterVerses(chapterNumber: number): Promise<VerseRow[]> {
  const verses: VerseRow[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const data = await getJson<{
      verses: VerseRow[];
      pagination: { current_page: number; next_page: number | null; total_pages: number };
    }>(
      `${API}/verses/by_chapter/${chapterNumber}?language=en&words=false&per_page=50&page=${page}&fields=text_uthmani,text_uthmani_tajweed,verse_number,juz_number,hizb_number,ruku_number,manzil_number,page_number`
    );
    verses.push(...data.verses);
    totalPages = data.pagination.total_pages;
    page = data.pagination.next_page ?? totalPages + 1;
  } while (page <= totalPages);
  return verses;
}

async function fetchChapterTranslations(chapterNumber: number): Promise<string[]> {
  const data = await getJson<{ translations: { text: string }[] }>(
    `${API}/quran/translations/${TRANSLATION_ID}?chapter_number=${chapterNumber}`
  );
  return (data.translations || []).map((t) => stripHtml(t.text));
}

async function downloadFullQuran() {
  console.log('--- Full Quran download ---');

  const existing = await prisma.ayah.count();
  const existingTranslations = await prisma.ayahTranslation.count({
    where: { translator: { slug: 'en-sahih-international' } },
  });
  const existingTajweed = await prisma.ayah.count({ where: { textTajweed: { not: null } } });
  const existingMetadata = await prisma.ayah.count({
    where: { page: { gt: 0 }, numberInQuran: { gt: 0 } },
  });
  console.log(`Current ayah count: ${existing}; Sahih translations: ${existingTranslations}; Tajweed: ${existingTajweed}; metadata: ${existingMetadata}`);
  if (!FORCE && METADATA_ONLY && existingMetadata >= EXPECTED_AYAHS) {
    console.log('Quran navigation metadata already present. Skipping.');
    return;
  }
  if (!FORCE && !METADATA_ONLY && existing >= EXPECTED_AYAHS && existingTranslations >= EXPECTED_AYAHS && existingTajweed >= EXPECTED_AYAHS && existingMetadata >= EXPECTED_AYAHS) {
    console.log('Quran text, translations, and Tajweed data already present. Skipping (use FORCE=1 to re-download).');
    return;
  }

  const chaptersRes = await getJson<{
    chapters: Array<{
      id: number;
      name_arabic: string;
      name_simple: string;
      name_complex: string;
      revelation_place: string;
      revelation_order: number;
      verses_count: number;
    }>;
  }>(`${API}/chapters?language=en`);
  const chapters = chaptersRes.chapters;
  console.log(`Found ${chapters.length} surahs.`);

  const translator = await ensureTranslator();
  const reciter = await ensureReciter();

  for (const ch of chapters) {
    process.stdout.write(`Surah ${ch.id} ${ch.name_simple}... `);

    const surah = await prisma.surah.upsert({
      where: { number: ch.id },
      update: {
        nameArabic: ch.name_arabic,
        nameSimple: ch.name_simple,
        nameComplex: ch.name_complex,
        revelationPlace: ch.revelation_place,
        revelationOrder: ch.revelation_order,
        numberOfAyahs: ch.verses_count,
      },
      create: {
        number: ch.id,
        nameArabic: ch.name_arabic,
        nameSimple: ch.name_simple,
        nameComplex: ch.name_complex,
        revelationPlace: ch.revelation_place,
        revelationOrder: ch.revelation_order,
        numberOfAyahs: ch.verses_count,
      },
    });

    const have = await prisma.ayah.count({ where: { surahId: surah.id } });
    const translated = await prisma.ayahTranslation.count({
      where: { ayah: { surahId: surah.id }, translatorId: translator.id },
    });
    const tajweed = await prisma.ayah.count({
      where: { surahId: surah.id, textTajweed: { not: null } },
    });
    const metadata = await prisma.ayah.count({
      where: { surahId: surah.id, page: { gt: 0 }, numberInQuran: { gt: 0 } },
    });
    if (!FORCE && metadata >= ch.verses_count && (METADATA_ONLY || (have >= ch.verses_count && translated >= ch.verses_count && tajweed >= ch.verses_count))) {
      console.log(`already have ${metadata} navigation metadata rows, skip`);
      continue;
    }

    process.stdout.write('downloading... ');
    const [verses, translations] = await Promise.all([
      fetchChapterVerses(ch.id),
      METADATA_ONLY ? Promise.resolve([]) : fetchChapterTranslations(ch.id),
    ]);

    for (let i = 0; i < verses.length; i++) {
      const v = verses[i];
      const ayah = await prisma.ayah.upsert({
        where: { surahId_number: { surahId: surah.id, number: v.verse_number } },
        update: {
          textUthmani: v.text_uthmani,
          textTajweed: v.text_uthmani_tajweed ?? null,
          numberInQuran: v.id,
          juz: v.juz_number ?? null,
          hizb: v.hizb_number ?? null,
          ruku: v.ruku_number ?? null,
          manzil: v.manzil_number ?? null,
          page: v.page_number ?? null,
        },
        create: {
          surahId: surah.id,
          number: v.verse_number,
          numberInQuran: v.id,
          juz: v.juz_number ?? null,
          hizb: v.hizb_number ?? null,
          ruku: v.ruku_number ?? null,
          manzil: v.manzil_number ?? null,
          page: v.page_number ?? null,
          textUthmani: v.text_uthmani,
          textTajweed: v.text_uthmani_tajweed ?? null,
        },
      });

      if (METADATA_ONLY) continue;

      const translationText = translations[i];
      if (translationText) {
        await prisma.ayahTranslation.upsert({
          where: {
            ayahId_translatorId: { ayahId: ayah.id, translatorId: translator.id },
          },
          update: { text: translationText },
          create: {
            ayahId: ayah.id,
            translatorId: translator.id,
            text: translationText,
          },
        });
      }

      const padSurah = String(ch.id).padStart(3, '0');
      const padAyah = String(v.verse_number).padStart(3, '0');
      const url = `${reciter.baseUrl}/${padSurah}${padAyah}.mp3`;
      await prisma.audioFile.upsert({
        where: { ayahId_reciterId: { ayahId: ayah.id, reciterId: reciter.id } },
        update: { url },
        create: {
          ayahId: ayah.id,
          reciterId: reciter.id,
          url,
          format: 'mp3',
        },
      });
    }

    console.log(`${verses.length} ayahs`);
    await sleep(120);
  }

  const total = await prisma.ayah.count();
  console.log(`--- Done. Total ayahs in DB: ${total} ---`);

  // Bust empty/stale surah list caches so the API can reload from DB
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
      const redis = new Redis(redisUrl, { maxRetriesPerRequest: 1, lazyConnect: true });
      await redis.connect();
      await redis.del('quran:surahs:all');
      await redis.quit();
      console.log('Cleared Redis key quran:surahs:all');
    } catch (err) {
      console.warn('Could not clear surahs cache:', err);
    }
  }
}

downloadFullQuran()
  .catch((err) => {
    console.error('Download failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
