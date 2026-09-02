import type { ContentLocale } from '@/lib/i18n/content-locales';
import { getSurahLocalizedName } from '@/lib/i18n/surah-localized-names';

type SurahHeaderInput = {
  surahNumber: number;
  englishName: string;
  meaning?: string;
  page: number;
  range?: { start: number; end: number };
};

export function surahPageHeading(locale: ContentLocale, input: SurahHeaderInput): string {
  const name = locale === 'en' ? input.englishName : getSurahLocalizedName(input.surahNumber, locale);
  const rangeSuffix =
    input.page > 1 && input.range
      ? locale === 'ur'
        ? ` – آیات ${input.range.start}–${input.range.end}`
        : locale === 'ps'
          ? ` – آیتونه ${input.range.start}–${input.range.end}`
          : locale === 'fa'
            ? ` – آیات ${input.range.start}–${input.range.end}`
            : ` – Verses ${input.range.start}–${input.range.end}`
      : '';

  if (locale === 'ur') return `${input.surahNumber}. سورہ ${name}${rangeSuffix}`;
  if (locale === 'ps') return `${input.surahNumber}. سورت ${name}${rangeSuffix}`;
  if (locale === 'fa') return `${input.surahNumber}. سوره ${name}${rangeSuffix}`;
  return `${input.surahNumber}. Surah ${name}${rangeSuffix}`;
}

export function surahPageSubtitle(locale: ContentLocale, englishName: string, surahNumber: number): string {
  const name = locale === 'en' ? englishName : getSurahLocalizedName(surahNumber, locale);
  switch (locale) {
    case 'ur':
      return `سورہ ${name} اردو ترجمہ، تفسیر، آڈیو تلاوت، لفظ بہ لفظ معنی اور تلفظ کے ساتھ پڑھیں۔`;
    case 'ps':
      return `سورت ${name} د پښتو ژباړې، تفسیر، غږیزې تلاوتې، کلمه په کلمه معنی او تلفظ سره ولولئ.`;
    case 'fa':
      return `سوره ${name} را با ترجمه فارسی، تفسیر، صوت تلاوت، معنی کلمه‌به‌کلمه و آوانگاری بخوانید.`;
    default:
      return `Read and listen to Surah ${englishName} with translation, tafsir, audio recitation, word-by-word meaning, and transliteration.`;
  }
}

  switch (locale) {
    case 'ur':
      return { previous: 'پچھلا', next: 'اگلا', versesOf: (start: number, end: number, total: number) => `آیات ${start}–${end} از ${total}` };
    case 'ps':
      return { previous: 'مخکینی', next: 'راتلونکی', versesOf: (start: number, end: number, total: number) => `آیتونه ${start}–${end} له ${total}` };
    case 'fa':
      return { previous: 'قبلی', next: 'بعدی', versesOf: (start: number, end: number, total: number) => `آیات ${start}–${end} از ${total}` };
    default:
      return { previous: 'Previous', next: 'Next', versesOf: (start: number, end: number, total: number) => `Verses ${start}–${end} of ${total}` };
  }
}

export function navSurahLabel(locale: ContentLocale, kind: 'previous' | 'next'): string {
  if (locale === 'ur') return kind === 'previous' ? 'پچھلی سورہ' : 'اگلی سورہ';
  if (locale === 'ps') return kind === 'previous' ? 'مخکینۍ سورت' : 'راتلونکې سورت';
  if (locale === 'fa') return kind === 'previous' ? 'سوره قبلی' : 'سوره بعدی';
  return kind === 'previous' ? 'Previous Surah' : 'Next Surah';
}

export function endOfSurahLabel(locale: ContentLocale, name: string, ayahCount: number, surahNumber: number): string {
  const localized = locale === 'en' ? name : getSurahLocalizedName(surahNumber, locale);
  if (locale === 'ur') return `سورہ ${localized} کا اختتام · ${ayahCount} آیات`;
  if (locale === 'ps') return `د سورت ${localized} پای · ${ayahCount} آیتونه`;
  if (locale === 'fa') return `پایان سوره ${localized} · ${ayahCount} آیه`;
  return `End of Surah ${name} · ${ayahCount} Ayahs`;
}

export function startFromBeginningLabel(locale: ContentLocale): string {
  if (locale === 'ur') return 'شروع سے پڑھیں';
  if (locale === 'ps') return 'له پیل څخه ولولئ';
  if (locale === 'fa') return 'از ابتدا بخوانید';
  return 'Start from beginning';
}
