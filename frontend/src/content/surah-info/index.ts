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
 * Structured editorial guides for surah pages (English).
 *
 * TODO: Expand with verified guides for the remaining 103 surahs, and add
 * localized registries (`ur/`, `ps/`, `fa/`) once human-verified translations
 * are ready. When a surah has no entry here, `getSurahInfo` returns `null`
 * and the "About this surah" section is omitted rather than rendering filler.
 */
const EN_SURAH_INFO: Record<number, SurahInfoContent> = {
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
  // TODO: Return localized surah-info JSON for 'ur' | 'ps' | 'fa' once translated.
  if (locale !== 'en') return null;
  return EN_SURAH_INFO[surahNumber] ?? null;
}

export type { SurahInfoContent, SurahFaq, SurahVirtue } from './types';
