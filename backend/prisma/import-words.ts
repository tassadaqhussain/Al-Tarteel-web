import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const API_BASE = 'https://api.quran.com/api/v4';

interface QuranComWord {
  position: number;
  char_type_name: string;
  text_uthmani?: string;
  text?: string;
  translation?: { text?: string; language_name?: string };
}

interface QuranComVerse {
  verse_key: string;
  words?: QuranComWord[];
}

async function importWordsForSurah(surahNumber: number) {
  const surah = await prisma.surah.findUnique({ where: { number: surahNumber } });
  if (!surah) {
    console.log(`Skipping Surah ${surahNumber}: not found locally`);
    return 0;
  }

  const response = await axios.get<{ verses: QuranComVerse[] }>(
    `${API_BASE}/verses/by_chapter/${surahNumber}`,
    {
      params: {
        language: 'en',
        words: true,
        word_fields: 'text_uthmani,audio_url',
        per_page: 300,
      },
    },
  );

  let imported = 0;

  for (const verse of response.data.verses ?? []) {
    const [, ayahNumber] = verse.verse_key.split(':').map(Number);
    if (!ayahNumber) continue;

    const ayah = await prisma.ayah.findUnique({
      where: { surahId_number: { surahId: surah.id, number: ayahNumber } },
      select: { id: true },
    });
    if (!ayah) continue;

    const words = (verse.words ?? []).filter((word) => word.char_type_name === 'word');
    for (const word of words) {
      const text = word.text_uthmani ?? word.text ?? '';
      if (!text) continue;

      const savedWord = await prisma.word.upsert({
        where: { ayahId_position: { ayahId: ayah.id, position: word.position } },
        create: {
          ayahId: ayah.id,
          position: word.position,
          textArabic: text,
          textUthmani: text,
        },
        update: {
          textArabic: text,
          textUthmani: text,
        },
      });

      const translation = word.translation?.text;
      if (translation) {
        await prisma.wordTranslation.upsert({
          where: { wordId_languageCode: { wordId: savedWord.id, languageCode: 'en' } },
          create: { wordId: savedWord.id, languageCode: 'en', text: translation },
          update: { text: translation },
        });
      }

      imported += 1;
    }
  }

  return imported;
}

async function main() {
  const requested = process.argv.slice(2).map(Number).filter((n) => n >= 1 && n <= 114);
  const surahs = requested.length > 0 ? requested : Array.from({ length: 114 }, (_, i) => i + 1);
  let total = 0;

  for (const surahNumber of surahs) {
    const count = await importWordsForSurah(surahNumber);
    total += count;
    console.log(`Surah ${surahNumber}: ${count} words imported`);
  }

  console.log(`Done. Imported/updated ${total} words.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
