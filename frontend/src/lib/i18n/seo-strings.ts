import type { ContentLocale } from '@/lib/i18n/content-locales';

/**
 * Per-locale SEO copy for surah pages.
 *
 * Titles name the intent people actually search for — the translation language
 * and audio — instead of a generic "Read, Listen & Translation", so the prefixed
 * locales can compete for "<surah> <language> translation" queries.
 */

type SurahCopyInput = {
  /** Transliterated surah name, e.g. "Al-Ikhlas". */
  name: string;
  /** English meaning, e.g. "The Sincerity". May be empty. */
  meaning: string;
  /** Arabic name. May be empty. */
  arabic: string;
  ayahCount: number;
};

type PageRange = { start: number; end: number } | null;

export type SurahCopy = { title: string; description: string };

type SurahCopyBuilder = (input: SurahCopyInput, range: PageRange) => SurahCopy;

const BUILDERS: Record<ContentLocale, SurahCopyBuilder> = {
  en: ({ name, meaning, arabic, ayahCount }, range) =>
    range
      ? {
          title: `Surah ${name} – Verses ${range.start}–${range.end}`,
          description: `Read Surah ${name} verses ${range.start}–${range.end} with Arabic Uthmani text, English translation, and verse-by-verse audio.`,
        }
      : {
          title: `Surah ${name} – Read, Listen, English Translation & Audio`,
          description: [
            `Read Surah ${name}${meaning ? ` (${meaning})` : ''}${arabic ? ` · ${arabic}` : ''} online`,
            ayahCount ? `— ${ayahCount} verses` : '',
            'with Arabic Uthmani text, English translation, and verse-by-verse audio.',
          ]
            .filter(Boolean)
            .join(' '),
        },

  ur: ({ name, arabic, ayahCount }, range) =>
    range
      ? {
          title: `سورہ ${name} – آیات ${range.start}–${range.end} اردو ترجمہ`,
          description: `سورہ ${name} کی آیات ${range.start}–${range.end} عربی متن، اردو ترجمہ اور آیت بہ آیت آڈیو کے ساتھ پڑھیں۔`,
        }
      : {
          title: `سورہ ${name} – اردو ترجمہ، تلاوت اور آڈیو`,
          description: [
            `سورہ ${name}${arabic ? ` · ${arabic}` : ''} آن لائن پڑھیں`,
            ayahCount ? `— ${ayahCount} آیات` : '',
            'عربی عثمانی متن، اردو ترجمہ اور آیت بہ آیت آڈیو کے ساتھ۔',
          ]
            .filter(Boolean)
            .join(' '),
        },

  ps: ({ name, arabic, ayahCount }, range) =>
    range
      ? {
          title: `سورت ${name} – آیتونه ${range.start}–${range.end} پښتو ژباړه`,
          description: `د سورت ${name} آیتونه ${range.start}–${range.end} د عربي متن، پښتو ژباړې او آیت په آیت غږ سره ولولئ.`,
        }
      : {
          title: `سورت ${name} – پښتو ژباړه، تلاوت او غږ`,
          description: [
            `سورت ${name}${arabic ? ` · ${arabic}` : ''} آنلاین ولولئ`,
            ayahCount ? `— ${ayahCount} آیتونه` : '',
            'د عربي عثماني متن، پښتو ژباړې او آیت په آیت غږ سره.',
          ]
            .filter(Boolean)
            .join(' '),
        },

  fa: ({ name, arabic, ayahCount }, range) =>
    range
      ? {
          title: `سوره ${name} – آیات ${range.start}–${range.end} ترجمه فارسی`,
          description: `آیات ${range.start}–${range.end} سوره ${name} را با متن عربی، ترجمه فارسی و صوت آیه به آیه بخوانید.`,
        }
      : {
          title: `سوره ${name} – ترجمه فارسی، تلاوت و صوت`,
          description: [
            `سوره ${name}${arabic ? ` · ${arabic}` : ''} را آنلاین بخوانید`,
            ayahCount ? `— ${ayahCount} آیه` : '',
            'همراه با متن عثمانی عربی، ترجمه فارسی و صوت آیه به آیه.',
          ]
            .filter(Boolean)
            .join(' '),
        },
};

export function surahCopy(
  locale: ContentLocale,
  input: SurahCopyInput,
  range: PageRange,
): SurahCopy {
  return BUILDERS[locale](input, range);
}
