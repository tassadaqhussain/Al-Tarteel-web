import { getJuzMeta } from '@/lib/juz-meta';
import { getSurahLocalizedName } from '@/lib/i18n/surah-localized-names';
import { localePath, type ContentLocale } from '@/lib/i18n/content-locales';

/**
 * Locales that have a real, localized /juz/{n} page.
 *
 * Only Urdu is listed: the para (پارہ) naming, titles and intros below are written for Urdu readers.
 * Persian and Pashto have no localized juz copy yet, so they are deliberately NOT here — no
 * hreflang, sitemap entry or switcher link may claim a /fa/juz or /ps/juz page that does not exist.
 */
export const JUZ_LOCALES: readonly ContentLocale[] = ['en', 'ur'];

export function hasJuzLocale(locale: ContentLocale): boolean {
  return JUZ_LOCALES.includes(locale);
}

/** `/juz/3` or `/ur/juz/3`. */
export function juzPath(locale: ContentLocale, juzNumber: number): string {
  return localePath(locale, `/juz/${juzNumber}`);
}

/** Parse "Al-Baqarah 2:141" → { surah: 2, ayah: 141 }. Metadata only; never touches Quranic text. */
function parseRef(ref: string): { surah: number; ayah: number } | null {
  const match = /(\d+):(\d+)\s*$/.exec(ref);
  return match ? { surah: Number(match[1]), ayah: Number(match[2]) } : null;
}

/** Para names in Urdu spelling (Arabic ي/ك/ة → ی/ک/ۃ, آلم → الم) so titles match how people search. */
export function juzUrName(nameArabic: string): string {
  return nameArabic
    .replace(/آلم/g, 'الم')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ۃ');
}

export type JuzUrCopy = {
  /** پارہ 1 (الم) */
  label: string;
  title: string;
  description: string;
  h1Arabic: string;
  h1: string;
  intro: string;
  /** سورہ الفاتحہ آیت 1 سے سورہ البقرہ آیت 141 تک */
  span: string;
  surahNumbers: number[];
};

export function juzUrCopy(juzNumber: number, page = 1): JuzUrCopy {
  const meta = getJuzMeta(juzNumber);
  const label = `پارہ ${juzNumber} (${juzUrName(meta.nameArabic)})`;
  const start = parseRef(meta.startRef);
  const end = parseRef(meta.endRef);
  const sName = (n: number) => `سورہ ${getSurahLocalizedName(n, 'ur')}`;

  let span = '';
  if (start && end) {
    span =
      start.surah === end.surah
        ? `${sName(start.surah)} کی آیت ${start.ayah} سے آیت ${end.ayah} تک`
        : `${sName(start.surah)} کی آیت ${start.ayah} سے ${sName(end.surah)} کی آیت ${end.ayah} تک`;
  }

  const surahNumbers = Array.from(
    { length: Math.max(1, meta.endSurah - meta.startSurah + 1) },
    (_, i) => meta.startSurah + i,
  );
  const surahList = surahNumbers.map(sName).join('، ');

  const intro =
    `قرآن مجید کے 30 پاروں میں سے ${label} ${span ? `${span} کی آیات پر مشتمل ہے` : 'کی آیات پر مشتمل ہے'}۔ ` +
    `اس پارے میں شامل سورتیں: ${surahList}۔ ` +
    `یہاں عربی عثمانی متن، اردو ترجمہ اور آیت بہ آیت تلاوت کے ساتھ پورا پارہ ${juzNumber} آن لائن پڑھیں اور سنیں۔`;

  const title =
    page > 1
      ? `${label} – صفحہ ${page} | QuranPilot`
      : `${label} اردو ترجمہ کے ساتھ | QuranPilot`;
  const description =
    page > 1
      ? `${label} کا صفحہ ${page}: عربی متن، اردو ترجمہ اور آیت بہ آیت تلاوت QuranPilot پر پڑھیں۔`
      : `${label} آن لائن پڑھیں${span ? ` — ${span}` : ''}۔ عربی عثمانی متن، اردو ترجمہ اور آیت بہ آیت تلاوت QuranPilot پر دستیاب ہے۔`;

  return {
    label,
    title,
    description,
    h1Arabic: `الجزء ${juzNumber} · ${meta.nameArabic}`, // Arabic heading keeps the traditional Arabic spelling
    h1: `${label} — اردو ترجمہ کے ساتھ${page > 1 ? ` · صفحہ ${page}` : ''}`,
    intro,
    span,
    surahNumbers,
  };
}

/** Small UI strings for the juz page chrome, per locale. */
export function juzUiStrings(locale: ContentLocale) {
  if (locale === 'ur') {
    return {
      home: 'ہوم',
      juz: 'پارے',
      juzWord: 'پارہ',
      of30: '30 میں سے',
      prevJuz: 'پچھلا پارہ',
      nextJuz: 'اگلا پارہ',
      continueTo: (n: number) => `پارہ ${n} پڑھنا جاری رکھیں`,
      surahsIn: (n: number) => `پارہ ${n} کی سورتیں`,
      previous: 'پچھلا صفحہ',
      next: 'اگلا صفحہ',
      pageLabel: (p: number) => `صفحہ ${p}`,
      otherLanguages: 'دیگر زبانوں میں پڑھیں:',
    };
  }
  return {
    home: 'Home',
    juz: 'Juz',
    juzWord: 'Juz',
    of30: 'of 30',
    prevJuz: 'Previous Juz',
    nextJuz: 'Next Juz',
    continueTo: (n: number) => `Continue to Juz ${n}`,
    surahsIn: (n: number) => `Surahs in Juz ${n}`,
    previous: '← Previous',
    next: 'Next →',
    pageLabel: (p: number) => `Page ${p}`,
    otherLanguages: 'Read in other languages:',
  };
}
