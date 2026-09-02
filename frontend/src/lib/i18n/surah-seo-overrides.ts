import type { ContentLocale } from '@/lib/i18n/content-locales';
import type { SurahCopy } from '@/lib/i18n/seo-strings';

/** High-intent surahs with search-optimized metadata beyond the default template. */
const OVERRIDES: Partial<
  Record<number, Partial<Record<ContentLocale, { title: string; description: string }>>>
> = {
  18: {
    en: {
      title: 'Surah Al-Kahf (Surah Kahf) – Read, Listen, English Translation & Audio',
      description:
        'Read Surah Al-Kahf (Surah Kahf) with Arabic Uthmani text, Saheeh International English translation, transliteration, and verse-by-verse Quran audio on QuranPilot.',
    },
    ur: {
      title: 'سورہ الکہف – اردو ترجمہ، تلاوت اور آڈیو',
      description:
        'سورہ الکہف (کہف) عربی متن، اردو ترجمہ، تلاوت اور آیت بہ آیت آڈیو کے ساتھ آن لائن پڑھیں۔',
    },
    ps: {
      title: 'سورت الکهف – پښتو ژباړه، تلاوت او غږ',
      description:
        'د سورت الکهف عربي متن، پښتو ژباړه، تلاوت او آیت په آیت غږ د QuranPilot کې ولولئ.',
    },
  },
  36: {
    en: {
      title: 'Surah Ya-Sin (Surah Yaseen) – Read, Listen, English Translation & Audio',
      description:
        'Read Surah Ya-Sin (Surah Yaseen) with Arabic Uthmani text, Saheeh International English translation, transliteration, and verse-by-verse Quran audio on QuranPilot.',
    },
    ur: {
      title: 'سورہ یٰسین – اردو ترجمہ، تلاوت اور آڈیو',
      description:
        'سورہ یٰسین عربی متن، اردو ترجمہ، تلاوت اور آیت بہ آیت آڈیو کے ساتھ آن لائن پڑھیں۔',
    },
    ps: {
      title: 'سورت یس – پښتو ژباړه، تلاوت او غږ',
      description:
        'د سورت یس عربي متن، پښتو ژباړه، تلاوت او آیت په آیت غږ د QuranPilot کې ولولئ.',
    },
  },
  55: {
    en: {
      title: 'Surah Ar-Rahman – Read, Listen, English Translation & Audio',
      description:
        'Read Surah Ar-Rahman (Surah Rahman) with Arabic Uthmani text, Saheeh International English translation, transliteration, and verse-by-verse Quran audio on QuranPilot.',
    },
    ur: {
      title: 'سورہ الرحمٰن – اردو ترجمہ، تلاوت اور آڈیو',
      description:
        'سورہ الرحمٰن عربی متن، اردو ترجمہ، تلاوت اور آیت بہ آیت آڈیو کے ساتھ آن لائن پڑھیں۔',
    },
    ps: {
      title: 'سورت الرحمن – پښتو ژباړه، تلاوت او غږ',
      description:
        'د سورت الرحمن عربي متن، پښتو ژباړه، تلاوت او آیت په آیت غږ د QuranPilot کې ولولئ.',
    },
  },
  67: {
    en: {
      title: 'Surah Al-Mulk (Surah Mulk) – Read, Listen, English Translation & Audio',
      description:
        'Read Surah Al-Mulk (Surah Mulk) with Arabic Uthmani text, Saheeh International English translation, transliteration, and verse-by-verse Quran audio on QuranPilot.',
    },
    ur: {
      title: 'سورہ الملک – اردو ترجمہ، تلاوت اور آڈیو',
      description:
        'سورہ الملک (ملک) عربی متن، اردو ترجمہ، تلاوت اور آیت بہ آیت آڈیو کے ساتھ آن لائن پڑھیں۔',
    },
    ps: {
      title: 'سورت الملك – پښتو ژباړه، تلاوت او غږ',
      description:
        'د سورت الملك عربي متن، پښتو ژباړه، تلاوت او آیت په آیت غږ د QuranPilot کې ولولئ.',
    },
  },
};

/** Returns enhanced copy for popular surahs on page 1 only. */
export function popularSurahSeoOverride(
  surahNumber: number,
  locale: ContentLocale,
  range: { start: number; end: number } | null,
): SurahCopy | null {
  if (range) return null;
  return OVERRIDES[surahNumber]?.[locale] ?? null;
}
