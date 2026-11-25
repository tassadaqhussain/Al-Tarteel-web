import type { ContentLocale } from '@/lib/i18n/content-locales';
import { getSurahLocalizedName } from '@/lib/i18n/surah-localized-names';
import { SURAH_SIMPLE_NAMES } from '@/lib/surah-meta';

/**
 * Short, descriptive intros for featured ayah pages (Ayatul Kursi, 2:285–286, …).
 *
 * Deliberately neutral: they say where the verse sits and what the page offers. They make no
 * rulings, virtue claims or hadith attributions, and never touch the Quranic text itself.
 * Needs a native-speaker pass before treating wording as final.
 */
export function ayahIntro(
  locale: ContentLocale,
  surah: number,
  ayah: number,
  name: string,
): { heading: string; body: string } {
  const ref = `${surah}:${ayah}`;
  if (locale === 'ur') {
    const s = getSurahLocalizedName(surah, 'ur');
    return {
      heading: `${name} — تعارف`,
      body: `${name}: یہ سورہ ${s} کی آیت ${ayah} (${ref}) ہے۔ اس صفحے پر عربی عثمانی متن، اردو ترجمہ اور آیت کی تلاوت کے ساتھ اسے پڑھیں اور سنیں؛ پچھلی اور اگلی آیات اور پوری سورت کے لنک بھی نیچے دیے گئے ہیں۔`,
    };
  }
  if (locale === 'ps') {
    const s = getSurahLocalizedName(surah, 'ps');
    return {
      heading: `${name} — پېژندنه`,
      body: `${name}: دا د سورت ${s} آیت ${ayah} (${ref}) دی. په دې پاڼه کې دا آیت له عربي عثماني متن، پښتو ژباړې او تلاوت سره ولولئ او واورئ؛ مخکینی او راتلونکي آیتونه او بشپړ سورت ته لینکونه هم لاندې ورکړل شوي دي.`,
    };
  }
  if (locale === 'fa') {
    const s = getSurahLocalizedName(surah, 'fa');
    return {
      heading: `${name} — معرفی`,
      body: `${name}: این آیه ${ayah} سوره ${s} (${ref}) است. در این صفحه آن را با متن عربی عثمانی، ترجمه فارسی و تلاوت بخوانید و بشنوید؛ پیوند آیه‌های قبل و بعد و کل سوره نیز در ادامه آمده است.`,
    };
  }
  const s = SURAH_SIMPLE_NAMES[surah] || `Surah ${surah}`;
  return {
    heading: `About ${name}`,
    body: `${name} is verse ${ayah} of Surah ${s} (${ref}). Read it here with the Arabic Uthmani text, English translation and verse audio; links to the previous and next verses and the full surah are below.`,
  };
}

/** Localized "Ayah" word for breadcrumbs. */
export function ayahWord(locale: ContentLocale): string {
  if (locale === 'ur' || locale === 'ps') return 'آیت';
  if (locale === 'fa') return 'آیه';
  return 'Ayah';
}

export type AyahPosition = {
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  ayahCount: number;
  juz?: number | null;
  page?: number | null;
  ruku?: number | null;
  manzil?: number | null;
  revelation?: 'makki' | 'madani';
};

/** Localized UI strings for the ayah page (headings + position block). */
export function ayahUi(locale: ContentLocale, pos: AyahPosition) {
  const extras = (sep: string, labels: { juz: string; page: string; ruku: string; manzil: string }) =>
    [
      pos.juz ? `${labels.juz} ${pos.juz}` : '',
      pos.page ? `${labels.page} ${pos.page}` : '',
      pos.ruku ? `${labels.ruku} ${pos.ruku}` : '',
      pos.manzil ? `${labels.manzil} ${pos.manzil}` : '',
    ]
      .filter(Boolean)
      .join(sep);

  if (locale === 'ur') {
    const where = extras('، ', { juz: 'پارہ', page: 'مصحف کا صفحہ', ruku: 'رکوع', manzil: 'منزل' });
    return {
      positionHeading: 'اس آیت کا مقام',
      positionText: `یہ آیت سورہ ${pos.surahName} (سورت نمبر ${pos.surahNumber}${pos.revelation ? `، ${pos.revelation === 'makki' ? 'مکی' : 'مدنی'} سورت` : ''}، کل ${pos.ayahCount} آیات) کی آیت نمبر ${pos.ayahNumber} ہے${where ? `؛ ${where}` : ''}۔`,
      translitHeading: 'رومن حروف میں تلفظ (ٹرانسلٹریشن)',
      wordHeading: 'لفظ بہ لفظ معنی',
      contextHeading: 'سورت کا تعارف',
      translations: 'ترجمہ',
      surrounding: 'پچھلی اور اگلی آیت',
      related: 'متعلقہ آیات',
      prev: 'پچھلی آیت',
      next: 'اگلی آیت',
      fullSurah: `پوری سورہ ${pos.surahName} پڑھیں`,
      juzLink: (n: number) => `پارہ ${n}`,
      subline: `سورہ ${pos.surahName} · سورت ${pos.surahNumber} از 114 · آیت ${pos.ayahNumber} از ${pos.ayahCount}`,
    };
  }
  if (locale === 'ps') {
    const where = extras('، ', { juz: 'سپاره', page: 'د مصحف مخ', ruku: 'رکوع', manzil: 'منزل' });
    return {
      positionHeading: 'د دې آیت ځای',
      positionText: `دا د سورت ${pos.surahName} (د سورت شمېره ${pos.surahNumber}${pos.revelation ? `، ${pos.revelation === 'makki' ? 'مکي' : 'مدني'} سورت` : ''}، ټول ${pos.ayahCount} آیتونه) ${pos.ayahNumber} آیت دی${where ? `؛ ${where}` : ''}.`,
      translitHeading: 'په لاتیني توري کې تلفظ (ټرانسلیټریشن)',
      wordHeading: 'کلمه په کلمه معنا',
      contextHeading: 'د سورت پېژندنه',
      translations: 'ژباړه',
      surrounding: 'مخکینی او راتلونکی آیت',
      related: 'اړوند آیتونه',
      prev: 'مخکینی آیت',
      next: 'راتلونکی آیت',
      fullSurah: `بشپړ سورت ${pos.surahName} ولولئ`,
      juzLink: (n: number) => `سپاره ${n}`,
      subline: `سورت ${pos.surahName} · ${pos.surahNumber} له 114 · آیت ${pos.ayahNumber} له ${pos.ayahCount}`,
    };
  }
  if (locale === 'fa') {
    const where = extras('، ', { juz: 'جزء', page: 'صفحه مصحف', ruku: 'رکوع', manzil: 'منزل' });
    return {
      positionHeading: 'جایگاه این آیه',
      positionText: `این آیه ${pos.ayahNumber} سوره ${pos.surahName} (سوره شماره ${pos.surahNumber}${pos.revelation ? `، سوره ${pos.revelation === 'makki' ? 'مکی' : 'مدنی'}` : ''}، مجموعاً ${pos.ayahCount} آیه) است${where ? `؛ ${where}` : ''}.`,
      translitHeading: 'آوانگاری به حروف لاتین',
      wordHeading: 'معنی کلمه به کلمه',
      contextHeading: 'معرفی سوره',
      translations: 'ترجمه',
      surrounding: 'آیه قبل و بعد',
      related: 'آیه‌های مرتبط',
      prev: 'آیه قبلی',
      next: 'آیه بعدی',
      fullSurah: `خواندن کل سوره ${pos.surahName}`,
      juzLink: (n: number) => `جزء ${n}`,
      subline: `سوره ${pos.surahName} · سوره ${pos.surahNumber} از 114 · آیه ${pos.ayahNumber} از ${pos.ayahCount}`,
    };
  }
  const where = extras(' · ', { juz: 'Juz', page: 'Mushaf page', ruku: 'Ruku', manzil: 'Manzil' });
  return {
    positionHeading: 'Where this ayah sits',
    positionText: `This is verse ${pos.ayahNumber} of ${pos.ayahCount} in Surah ${pos.surahName} (chapter ${pos.surahNumber} of 114${pos.revelation ? `, ${pos.revelation === 'makki' ? 'Makki' : 'Madani'}` : ''})${where ? ` — ${where}` : ''}.`,
    translitHeading: 'Transliteration',
    wordHeading: 'Word-by-Word Meaning',
    contextHeading: `About Surah ${pos.surahName}`,
    translations: 'Translations',
    surrounding: 'Ayah Before & After',
    related: 'Related Ayahs to Explore',
    prev: 'Previous ayah',
    next: 'Next ayah',
    fullSurah: `Read full Surah ${pos.surahName}`,
    juzLink: (n: number) => `Juz ${n}`,
    subline: '',
  };
}
