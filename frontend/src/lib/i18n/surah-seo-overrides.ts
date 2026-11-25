import type { ContentLocale } from '@/lib/i18n/content-locales';
import type { SurahCopy } from '@/lib/i18n/seo-strings';

/** High-intent surahs with search-optimized metadata beyond the default template. */
const OVERRIDES: Partial<
  Record<number, Partial<Record<ContentLocale, { title: string; description: string }>>>
> = {
  1: {
    en: {
      title: 'Surah Al-Fatihah – Translation & Audio',
      description:
        'Read Surah Al-Fatihah (The Opener) with Arabic Uthmani text, English translation, transliteration, and verse-by-verse Quran audio on QuranPilot.',
    },
    ur: {
      title: 'سورہ الفاتحہ – اردو ترجمہ، تلاوت اور آڈیو',
      description:
        'سورہ الفاتحہ عربی متن، اردو ترجمہ، تلاوت اور آیت بہ آیت آڈیو کے ساتھ آن لائن پڑھیں۔',
    },
    ps: {
      title: 'سورت الفاتحه – پښتو ژباړه، تلاوت او غږ',
      description:
        'د سورت الفاتحه عربي متن، پښتو ژباړه، تلاوت او آیت په آیت غږ د QuranPilot کې ولولئ.',
    },
  },
  18: {
    en: {
      title: 'Surah Al-Kahf – Read with English Translation & Audio',
      description:
        'Read Surah Al-Kahf (The Cave) with Arabic Uthmani text, English translation, transliteration, and verse-by-verse Quran audio on QuranPilot.',
    },
    ur: {
      title: 'سورہ الکہف اردو ترجمہ کے ساتھ – تلاوت اور آڈیو',
      description:
        'سورہ الکہف (کہف) عربی متن، اردو ترجمہ، تلاوت اور آیت بہ آیت آڈیو کے ساتھ آن لائن پڑھیں۔',
    },
    ps: {
      title: 'سورت الکهف له پښتو ژباړې سره – تلاوت او غږ',
      description:
        'د سورت الکهف عربي متن، پښتو ژباړه، تلاوت او آیت په آیت غږ د QuranPilot کې ولولئ.',
    },
    fa: {
      title: 'سوره کهف با ترجمه فارسی – تلاوت و صوت',
      description:
        'سوره کهف (۱۱۰ آیه) را با متن عربی عثمانی، ترجمه فارسی و صوت آیه به آیه آنلاین در QuranPilot بخوانید.',
    },
  },
  36: {
    en: {
      title: 'Surah Yasin (Ya-Sin) – Read with Translation & Audio',
      description:
        'Read Surah Yasin (Ya-Sin) with Arabic Uthmani text, English translation, transliteration, and verse-by-verse Quran audio on QuranPilot.',
    },
    ur: {
      title: 'سورہ یٰسین اردو ترجمہ کے ساتھ – تلاوت اور آڈیو',
      description:
        'سورہ یٰسین عربی متن، اردو ترجمہ، تلاوت اور آیت بہ آیت آڈیو کے ساتھ آن لائن پڑھیں۔',
    },
    ps: {
      title: 'سورت یس له پښتو ژباړې سره – تلاوت او غږ',
      description:
        'د سورت یس عربي متن، پښتو ژباړه، تلاوت او آیت په آیت غږ د QuranPilot کې ولولئ.',
    },
    fa: {
      title: 'سوره یس با ترجمه فارسی – تلاوت و صوت',
      description:
        'سوره یس (۸۳ آیه) را با متن عربی عثمانی، ترجمه فارسی و صوت آیه به آیه آنلاین در QuranPilot بخوانید.',
    },
  },
  55: {
    en: {
      title: 'Surah Ar-Rahman – Read with Translation & Audio',
      description:
        'Read Surah Ar-Rahman (The Most Merciful) with Arabic Uthmani text, English translation, transliteration, and verse-by-verse audio on QuranPilot.',
    },
    ur: {
      title: 'سورہ الرحمٰن اردو ترجمہ کے ساتھ – تلاوت اور آڈیو',
      description:
        'سورہ الرحمٰن عربی متن، اردو ترجمہ، تلاوت اور آیت بہ آیت آڈیو کے ساتھ آن لائن پڑھیں۔',
    },
    ps: {
      title: 'سورت الرحمن له پښتو ژباړې سره – تلاوت او غږ',
      description:
        'د سورت الرحمن عربي متن، پښتو ژباړه، تلاوت او آیت په آیت غږ د QuranPilot کې ولولئ.',
    },
    fa: {
      title: 'سوره الرحمن با ترجمه فارسی – تلاوت و صوت',
      description:
        'سوره الرحمن (۷۸ آیه) را با متن عربی عثمانی، ترجمه فارسی و صوت آیه به آیه آنلاین در QuranPilot بخوانید.',
    },
  },
  56: {
    en: {
      title: "Surah Al-Waqiah (Al-Waqi'ah) – Read with Translation & Audio",
      description:
        "Read Surah Al-Waqiah (The Inevitable) with Arabic Uthmani text, English translation, transliteration, and verse-by-verse audio on QuranPilot.",
    },
    ur: {
      title: 'سورہ الواقعہ اردو ترجمہ کے ساتھ – تلاوت اور آڈیو',
      description:
        'سورہ الواقعہ عربی متن، اردو ترجمہ، تلاوت اور آیت بہ آیت آڈیو کے ساتھ آن لائن پڑھیں۔',
    },
    ps: {
      title: 'سورت الواقعه له پښتو ژباړې سره – تلاوت او غږ',
      description:
        'د سورت الواقعه عربي متن، پښتو ژباړه، تلاوت او آیت په آیت غږ د QuranPilot کې ولولئ.',
    },
    fa: {
      title: 'سوره واقعه با ترجمه فارسی – تلاوت و صوت',
      description:
        'سوره واقعه (۹۶ آیه) را با متن عربی عثمانی، ترجمه فارسی و صوت آیه به آیه آنلاین در QuranPilot بخوانید.',
    },
  },
  67: {
    en: {
      title: 'Surah Al-Mulk – Read with Translation & Audio',
      description:
        'Read Surah Al-Mulk (The Sovereignty) with Arabic Uthmani text, English translation, transliteration, and verse-by-verse Quran audio on QuranPilot.',
    },
    ur: {
      title: 'سورہ الملک اردو ترجمہ کے ساتھ – تلاوت اور آڈیو',
      description:
        'سورہ الملک عربی متن، اردو ترجمہ، تلاوت اور آیت بہ آیت آڈیو کے ساتھ آن لائن پڑھیں۔',
    },
    ps: {
      title: 'سورت الملک له پښتو ژباړې سره – تلاوت او غږ',
      description:
        'د سورت الملک عربي متن، پښتو ژباړه، تلاوت او آیت په آیت غږ د QuranPilot کې ولولئ.',
    },
    fa: {
      title: 'سوره ملک با ترجمه فارسی – تلاوت و صوت',
      description:
        'سوره ملک (۳۰ آیه) را با متن عربی عثمانی، ترجمه فارسی و صوت آیه به آیه آنلاین در QuranPilot بخوانید.',
    },
  },
  78: {
    en: {
      title: 'Surah An-Naba – Translation & Audio',
      description:
        'Read Surah An-Naba (The Tidings) with Arabic Uthmani text, English translation, transliteration, and verse-by-verse Quran audio on QuranPilot.',
    },
    ur: {
      title: 'سورہ النبأ – اردو ترجمہ، تلاوت اور آڈیو',
      description:
        'سورہ النبأ عربی متن، اردو ترجمہ، تلاوت اور آیت بہ آیت آڈیو کے ساتھ آن لائن پڑھیں۔',
    },
    ps: {
      title: 'سورت النبأ – پښتو ژباړه، تلاوت او غږ',
      description:
        'د سورت النبأ عربي متن، پښتو ژباړه، تلاوت او آیت په آیت غږ د QuranPilot کې ولولئ.',
    },
  },
  112: {
    en: {
      title: 'Surah Al-Ikhlas – Translation & Audio',
      description:
        'Read Surah Al-Ikhlas (The Sincerity) with Arabic Uthmani text, English translation, transliteration, and verse-by-verse Quran audio on QuranPilot.',
    },
    ur: {
      title: 'سورہ الاخلاص – اردو ترجمہ، تلاوت اور آڈیو',
      description:
        'سورہ الاخلاص عربی متن، اردو ترجمہ، تلاوت اور آیت بہ آیت آڈیو کے ساتھ آن لائن پڑھیں۔',
    },
    ps: {
      title: 'سورت الاخلاص – پښتو ژباړه، تلاوت او غږ',
      description:
        'د سورت الاخلاص عربي متن، پښتو ژباړه، تلاوت او آیت په آیت غږ د QuranPilot کې ولولئ.',
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
