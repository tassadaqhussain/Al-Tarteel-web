import type { ContentLocale } from '@/lib/i18n/content-locales';
import type { SurahInfoContent } from './types';

import alFatihah from './al-fatihah.json';
import alBaqarah from './al-baqarah.json';
import alKahf from './al-kahf.json';
import yaSin from './ya-sin.json';
import arRahman from './ar-rahman.json';
import alWaqiah from './al-waqiah.json';
import alMulk from './al-mulk.json';
import alMaun from './al-maun.json';
import alIkhlas from './al-ikhlas.json';
import alFalaq from './al-falaq.json';
import anNas from './an-nas.json';

/**
 * Structured editorial guides for surah pages (English + optional per-locale
 * `locales.ur` / `locales.ps` / `locales.fa` fields).
 *
 * TODO: Expand with verified guides for the remaining 103 surahs, and populate
 * `locales.ur`, `locales.ps`, and `locales.fa` with human-verified translations
 * (never machine-translate religious content). When a surah or locale has no
 * verified content, `getSurahInfo` returns `null` so empty sections are never rendered.
 */
const SURAH_INFO: Record<number, SurahInfoContent> = {
  1: alFatihah as SurahInfoContent,
  2: alBaqarah as SurahInfoContent,
  18: alKahf as SurahInfoContent,
  36: yaSin as SurahInfoContent,
  55: arRahman as SurahInfoContent,
  56: alWaqiah as SurahInfoContent,
  67: alMulk as SurahInfoContent,
  107: alMaun as SurahInfoContent,
  112: alIkhlas as SurahInfoContent,
  113: alFalaq as SurahInfoContent,
  114: anNas as SurahInfoContent,
};

export function getSurahInfo(
  surahNumber: number,
  locale: ContentLocale = 'en',
): SurahInfoContent | null {
  const base = SURAH_INFO[surahNumber];
  if (!base) return null;

  if (locale === 'en') {
    return base.overview.length > 0 || base.faqs.length > 0 ? base : null;
  }

  const localized = base.locales?.[locale];
  if (!localized) return null;

  const hasContent =
    (localized.overview && localized.overview.length > 0) ||
    (localized.faqs && localized.faqs.length > 0);
  if (!hasContent) return null;

  return {
    ...base,
    overview: localized.overview ?? [],
    mainThemes: localized.mainThemes ?? [],
    virtues: localized.virtues ?? [],
    faqs: localized.faqs ?? [],
  };
}

export type { SurahInfoContent, LocalizedSurahInfo, SurahFaq, SurahVirtue } from './types';
