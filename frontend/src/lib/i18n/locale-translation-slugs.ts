import type { ContentLocale } from '@/lib/i18n/content-locales';

/**
 * Text translation slugs that exist in the production Quran API.
 * (Audio-only slugs like ps-shafeeq-ur-rahman must not be used here.)
 */
export const LOCALE_TEXT_TRANSLATION_SLUG: Record<ContentLocale, string> = {
  en: 'en-sahih-international',
  ur: 'bayan-ul-quran',
  ps: 'ps-zakaria-abulsalam-118',
  fa: 'fa-islamhouse-com-135',
};

/** Legacy / mistaken slugs → API slugs (cookie + old bookmarks). */
const SLUG_ALIASES: Record<string, string> = {
  'ur-bayan-ul-quran': 'bayan-ul-quran',
  'ps-shafeeq-ur-rahman': 'ps-zakaria-abulsalam-118',
  // Never existed in the production API; Persian pages rendered no translation.
  'qf-translation-135': 'fa-islamhouse-com-135',
};

export function normalizeTranslationSlugForApi(slug: string): string {
  const value = slug.trim();
  if (!value) return LOCALE_TEXT_TRANSLATION_SLUG.en;
  const first = value.split(',')[0]?.trim() || value;
  return SLUG_ALIASES[first] ?? first;
}

export function normalizeTranslationListForApi(slugs: string): string {
  return slugs
    .split(',')
    .map((s) => normalizeTranslationSlugForApi(s.trim()))
    .filter(Boolean)
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .join(',');
}
