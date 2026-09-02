/**
 * Backfill IndoPak script text from Quran.com API without re-downloading the full Quran.
 *
 * Usage:
 *   npx ts-node prisma/import-indopak.ts
 *   FORCE=1 npx ts-node prisma/import-indopak.ts
 */
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const API = 'https://api.quran.com/api/v4';
const FORCE = process.env.FORCE === '1' || process.argv.includes('--force');

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

type VerseRow = {
  verse_number: number;
  text_indopak?: string;
};

async function fetchIndopak(chapterNumber: number): Promise<VerseRow[]> {
  const verses: VerseRow[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const data = await getJson<{
      verses: VerseRow[];
      pagination: { current_page: number; next_page: number | null; total_pages: number };
    }>(
      `${API}/verses/by_chapter/${chapterNumber}?language=en&words=false&per_page=50&page=${page}&fields=text_indopak,verse_number`,
    );
    verses.push(...data.verses);
    totalPages = data.pagination.total_pages;
    page = data.pagination.next_page ?? totalPages + 1;
  } while (page <= totalPages);
  return verses;
}

async function main() {
  const existing = await prisma.ayah.count({ where: { textIndopak: { not: null } } });
  if (!FORCE && existing >= 6000) {
    console.log(`Already have ${existing} IndoPak rows — skip (use FORCE=1 to refresh).`);
    return;
  }

  for (let n = 1; n <= 114; n++) {
    const surah = await prisma.surah.findUnique({ where: { number: n } });
    if (!surah) {
      console.warn(`Surah ${n} missing — skip`);
      continue;
    }

    const have = await prisma.ayah.count({
      where: { surahId: surah.id, textIndopak: { not: null } },
    });
    if (!FORCE && have >= surah.numberOfAyahs) {
      console.log(`Surah ${n}: already have IndoPak (${have})`);
      continue;
    }

    process.stdout.write(`Surah ${n}: fetching IndoPak... `);
    const verses = await fetchIndopak(n);
    let updated = 0;
    for (const v of verses) {
      if (!v.text_indopak?.trim()) continue;
      const result = await prisma.ayah.updateMany({
        where: { surahId: surah.id, number: v.verse_number },
        data: { textIndopak: v.text_indopak },
      });
      updated += result.count;
    }
    console.log(`${updated} rows`);
    await sleep(300);
  }

  const total = await prisma.ayah.count({ where: { textIndopak: { not: null } } });
  console.log(`Done — ${total} ayahs with IndoPak text.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
