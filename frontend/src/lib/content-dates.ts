import type { ContentLocale } from '@/lib/i18n/content-locales';

/**
 * Real content-change dates for sitemap `<lastmod>` — NOT build time.
 *
 * There is no per-verse modification timestamp the sitemap can read without 6,000+ API calls, so
 * ayah pages share one date per language: the day that language's ayah page content last changed
 * (template/enrichment or translation data). Bump the relevant entry ONLY when that content
 * really changes. Override per environment with AYAH_UPDATED_AT_<LANG> (ISO date).
 *
 * 2026-11-25: ayah pages gained translation-based descriptions, localized titles, position
 * block and per-language indexing rules.
 */
const DEFAULT = '2026-11-25T00:00:00.000Z';

function fromEnv(locale: ContentLocale): string {
  const raw = process.env[`AYAH_UPDATED_AT_${locale.toUpperCase()}`];
  const parsed = raw ? new Date(raw) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : DEFAULT;
}

export const AYAH_PAGE_UPDATED_AT: Record<ContentLocale, string> = {
  en: fromEnv('en'),
  ur: fromEnv('ur'),
  ps: fromEnv('ps'),
  fa: fromEnv('fa'),
};
