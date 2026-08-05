import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const API_BASE = process.env.QF_API_BASE_URL || 'https://apis.quran.foundation';
const AUTH_BASE = process.env.QF_AUTH_BASE_URL || 'https://oauth2.quran.foundation';

/** Languages Quran.com/Quran Foundation actually serve for word-by-word translations. */
const WBW_LANGUAGES = ['en', 'ur', 'bn', 'id', 'tr', 'fa', 'hi'] as const;
type WbwLanguage = (typeof WBW_LANGUAGES)[number];

let accessToken = '';

async function getAccessToken() {
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
    },
  );
  accessToken = response.data.access_token;
  return accessToken;
}

interface QuranComWord {
  position: number;
  char_type_name: string;
  text_uthmani?: string;
  text_imlaei_simple?: string;
  text?: string;
  audio_url?: string;
  translation?: { text?: string; language_name?: string };
  transliteration?: { text?: string; language_name?: string };
}

interface QuranComVerse {
  verse_key: string;
  words?: QuranComWord[];
}

function parseLangArgs(argv: string[]): WbwLanguage[] | null {
  const langArg = argv.find((arg) => arg.startsWith('--langs='));
  if (!langArg) return null;
  const requested = langArg
    .slice('--langs='.length)
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const invalid = requested.filter((code) => !(WBW_LANGUAGES as readonly string[]).includes(code));
  if (invalid.length) {
    throw new Error(`Unsupported WBW language(s): ${invalid.join(', ')}. Supported: ${WBW_LANGUAGES.join(', ')}`);
  }
  return requested as WbwLanguage[];
}

async function fetchChapterWords(surahNumber: number, language: WbwLanguage) {
  const token = await getAccessToken();
  // `language` controls word translation locale on Quran.com Content API.
  // `word_translation_language` alone does not (falls back to English).
  const response = await axios.get<{ verses: QuranComVerse[] }>(
    `${API_BASE}/content/api/v4/verses/by_chapter/${surahNumber}`,
    {
      params: {
        words: true,
        language,
        word_fields: 'verse_key,verse_id,page_number,location,text_uthmani,text_imlaei_simple,code_v2,qpc_uthmani_hafs,audio_url',
        mushaf: 1,
        word_transliteration: true,
        per_page: 300,
      },
      headers: {
        Accept: 'application/json',
        'x-auth-token': token,
        'x-client-id': process.env.QF_CLIENT_ID,
      },
    },
  );
  return response.data.verses ?? [];
}

async function upsertWordsAndTranslations(
  surahNumber: number,
  language: WbwLanguage,
  updateArabicMeta: boolean,
) {
  const surah = await prisma.surah.findUnique({ where: { number: surahNumber } });
  if (!surah) {
    console.log(`Skipping Surah ${surahNumber}: not found locally`);
    return 0;
  }

  const verses = await fetchChapterWords(surahNumber, language);
  let imported = 0;

  for (const verse of verses) {
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

      const audioUrl = word.audio_url
        ? `https://audio.qurancdn.com/${word.audio_url.replace(/^\/+/, '')}`
        : null;

      let savedWord;
      if (updateArabicMeta) {
        savedWord = await prisma.word.upsert({
          where: { ayahId_position: { ayahId: ayah.id, position: word.position } },
          create: {
            ayahId: ayah.id,
            position: word.position,
            textArabic: text,
            textUthmani: text,
            transliteration: word.transliteration?.text ?? null,
            audioUrl,
          },
          update: {
            textArabic: text,
            textUthmani: text,
            transliteration: word.transliteration?.text ?? null,
            audioUrl,
          },
        });
      } else {
        savedWord = await prisma.word.findUnique({
          where: { ayahId_position: { ayahId: ayah.id, position: word.position } },
        });
        if (!savedWord) {
          savedWord = await prisma.word.create({
            data: {
              ayahId: ayah.id,
              position: word.position,
              textArabic: text,
              textUthmani: text,
              transliteration: word.transliteration?.text ?? null,
              audioUrl,
            },
          });
        }
      }

      const translation = word.translation?.text?.trim();
      if (translation) {
        await prisma.wordTranslation.upsert({
          where: { wordId_languageCode: { wordId: savedWord.id, languageCode: language } },
          create: { wordId: savedWord.id, languageCode: language, text: translation },
          update: { text: translation },
        });
      }

      imported += 1;
    }
  }

  return imported;
}

async function main() {
  const argv = process.argv.slice(2);
  const languages = parseLangArgs(argv) ?? [...WBW_LANGUAGES];
  const requestedSurahs = argv
    .filter((arg) => !arg.startsWith('--'))
    .map(Number)
    .filter((n) => n >= 1 && n <= 114);
  const surahs = requestedSurahs.length > 0 ? requestedSurahs : Array.from({ length: 114 }, (_, i) => i + 1);

  // Prefer English pass first so Arabic/transliteration/audio meta is seeded from the default WBW set.
  const orderedLanguages = [
    ...(languages.includes('en') ? (['en'] as WbwLanguage[]) : []),
    ...languages.filter((code) => code !== 'en'),
  ];

  console.log(`Importing WBW languages: ${orderedLanguages.join(', ')}`);
  let total = 0;

  for (const surahNumber of surahs) {
    let surahTotal = 0;
    for (const [index, language] of orderedLanguages.entries()) {
      const count = await upsertWordsAndTranslations(surahNumber, language, index === 0);
      surahTotal += count;
      console.log(`Surah ${surahNumber} [${language}]: ${count} words`);
    }
    total += surahTotal;
  }

  console.log(`Done. Imported/updated ${total} word rows across ${orderedLanguages.length} language(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
