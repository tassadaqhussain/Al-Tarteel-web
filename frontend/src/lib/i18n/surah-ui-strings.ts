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

export function paginationStrings(locale: ContentLocale) {
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

export function surahChapterMetaLabel(
  locale: ContentLocale,
  surahNumber: number,
  ayahCount: number,
  revelationPlace?: string,
): string {
  const rev = revelationPlace
    ? `${revelationPlace.charAt(0).toUpperCase()}${revelationPlace.slice(1)}`
    : null;
  if (locale === 'ur') {
    const revUr = revelationPlace === 'makkah' ? 'مکی' : revelationPlace === 'madinah' ? 'مدنی' : null;
    return [`سورہ ${surahNumber}`, revUr, `${ayahCount} آیات`].filter(Boolean).join(' · ');
  }
  if (locale === 'ps') {
    const revPs = revelationPlace === 'makkah' ? 'مکي' : revelationPlace === 'madinah' ? 'مدني' : null;
    return [`سورت ${surahNumber}`, revPs, `${ayahCount} آیتونه`].filter(Boolean).join(' · ');
  }
  if (locale === 'fa') {
    const revFa = revelationPlace === 'makkah' ? 'مکی' : revelationPlace === 'madinah' ? 'مدنی' : null;
    return [`سوره ${surahNumber}`, revFa, `${ayahCount} آیه`].filter(Boolean).join(' · ');
  }
  return [`Surah ${surahNumber}`, rev, `${ayahCount} verses`].filter(Boolean).join(' · ');
}

export function surahBreadcrumbsLabels(
  locale: ContentLocale,
  surahNumber: number,
  englishName: string,
): { home: string; surahs: string; surah: string } {
  const name = locale === 'en' ? englishName : getSurahLocalizedName(surahNumber, locale);
  if (locale === 'ur') return { home: 'ہوم', surahs: 'سورتیں', surah: `سورہ ${name}` };
  if (locale === 'ps') return { home: 'کور', surahs: 'سورتونه', surah: `سورت ${name}` };
  if (locale === 'fa') return { home: 'خانه', surahs: 'سوره‌ها', surah: `سوره ${name}` };
  return { home: 'Home', surahs: 'Surahs', surah: `Surah ${englishName}` };
}

export function surahHabitCardCopy(locale: ContentLocale) {
  switch (locale) {
    case 'ur':
      return {
        heading: 'قرآن پڑھنے کی مستقل عادت بنائیں',
        body: 'اپنی جگہ محفوظ کریں، پڑھنے کا ہدف مقرر کریں اور تسلسل کے ساتھ اگلی سورہ پر جائیں۔',
        cta: 'پڑھنے کا ہدف مقرر کریں',
      };
    case 'ps':
      return {
        heading: 'د قرآن لوستلو منظم عادت جوړ کړئ',
        body: 'خپل ځای خوندي کړئ، د لوستلو هدف وټاکئ او په پرله‌پسې توګه بل سورت ته لاړ شئ.',
        cta: 'د لوستلو هدف وټاکئ',
      };
    case 'fa':
      return {
        heading: 'عادت منظم خواندن قرآن بسازید',
        body: 'جای خود را ذخیره کنید، هدف مطالعه تعیین کنید و با پیوستگی سوره بعدی را بخوانید.',
        cta: 'تعیین هدف مطالعه',
      };
    default:
      return {
        heading: 'Build a steady Quran habit',
        body: 'Save your place, set a reading goal, and return to the next chapter without losing momentum.',
        cta: 'Set a reading goal',
      };
  }
}

export function surahVerseDirectoryCopy(
  locale: ContentLocale,
  surahNumber: number,
  englishName: string,
  ayahCount: number,
) {
  const name = locale === 'en' ? englishName : getSurahLocalizedName(surahNumber, locale);
  switch (locale) {
    case 'ur':
      return { label: `سورہ ${name} کی تمام آیات (1–${ayahCount})`, showAll: 'سب دکھائیں', hide: 'چھپائیں' };
    case 'ps':
      return { label: `د سورت ${name} ټول آیتونه (1–${ayahCount})`, showAll: 'ټول وښایئ', hide: 'پټ کړئ' };
    case 'fa':
      return { label: `همه آیات سوره ${name} (1–${ayahCount})`, showAll: 'نمایش همه', hide: 'پنهان کردن' };
    default:
      return { label: `Verses in Surah ${englishName} (1–${ayahCount})`, showAll: 'Show all', hide: 'Hide' };
  }
}

export function surahLearningPlansCopy(
  locale: ContentLocale,
  surahNumber: number,
  englishName: string,
) {
  const name = locale === 'en' ? englishName : getSurahLocalizedName(surahNumber, locale);
  switch (locale) {
    case 'ur':
      return {
        heading: `سورہ ${name} کے تعلیمی منصوبے`,
        subtitle: 'تدبر اور تسلسل کے ساتھ اس سورہ کو سمجھنے کے لیے روزانہ کے منظم اسباق۔',
        browseAll: 'تمام تعلیمی منصوبے دیکھیں ←',
        daysLabel: (days: number) => `${days} دن کا منصوبہ`,
      };
    case 'ps':
      return {
        heading: `د سورت ${name} د زده‌کړې پلانونه`,
        subtitle: 'د تدبر او پرله‌پسې لوستلو سره د دې سورت د مطالعې لپاره منظم ورځني درسونه.',
        browseAll: 'ټول د زده‌کړې پلانونه وګورئ ←',
        daysLabel: (days: number) => `${days} ورځنی پلان`,
      };
    case 'fa':
      return {
        heading: `برنامه‌های آموزشی سوره ${name}`,
        subtitle: 'درس‌های روزانه منظم برای مطالعه این سوره با تدبر و پیوستگی.',
        browseAll: 'مشاهده همه برنامه‌های آموزشی ←',
        daysLabel: (days: number) => `برنامه ${days} روزه`,
      };
    default:
      return {
        heading: `Learning plans for Surah ${englishName}`,
        subtitle: 'Structured daily lessons to study this surah with reflection and consistency.',
        browseAll: 'Browse all learning plans →',
        daysLabel: (days: number) => `${days}-day plan`,
      };
  }
}

export function surahReaderToolbarMeta(
  locale: ContentLocale,
  page: number | string,
  juz: number | string,
  hizb: number | string,
) {
  if (locale === 'ur') return { page: `صفحہ ${page}`, juzHizb: `پارہ ${juz} / حزب ${hizb}` };
  if (locale === 'ps') return { page: `پاڼه ${page}`, juzHizb: `جز ${juz} / حزب ${hizb}` };
  if (locale === 'fa') return { page: `صفحه ${page}`, juzHizb: `جزء ${juz} / حزب ${hizb}` };
  return { page: `Page ${page}`, juzHizb: `Juz ${juz} / Hizb ${hizb}` };
}

export function reportMistakeLabel(locale: ContentLocale): string {
  if (locale === 'ur') return 'غلطی کی نشاندہی کریں';
  if (locale === 'ps') return 'د تېروتنې راپور ورکړئ';
  if (locale === 'fa') return 'گزارش خطا';
  return 'Report a mistake';
}
