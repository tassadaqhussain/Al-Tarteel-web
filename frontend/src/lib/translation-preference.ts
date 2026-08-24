export const TRANSLATION_COOKIE = 'qp_translations';
export const DEFAULT_TRANSLATION = 'en-sahih-international';

/** Human-readable label for a translation slug (matches API translator names where possible). */
export function formatTranslatorDisplayName(slug: string): string {
  if (slug.includes('israr') || slug.includes('bayan')) {
    return 'Bayan-ul-Quran (Dr. Israr Ahmad)';
  }
  if (slug.includes('khattab') || slug.includes('clear')) {
    return 'The Clear Quran (Dr. Mustafa Khattab)';
  }
  if (slug.includes('sahih')) {
    return 'Saheeh International';
  }
  return slug.replace(/^(en|ur|ar|fr|id|bn|tr|fa|hi|ps)-/, '').replaceAll('-', ' ');
}

/** Primary slug from store, SSR prop, or site default — keep label aligned with fetched ayah text. */
export function resolvePrimaryTranslationSlug(
  translationSlugs: string[],
  effectiveTranslations?: string,
): string {
  if (translationSlugs[0]) return translationSlugs[0];
  const fromSsr = effectiveTranslations?.split(',')[0]?.trim();
  return fromSsr || DEFAULT_TRANSLATION;
}

/** Persist preferred translation slugs for clean URLs (server can read the cookie). */
export function setTranslationCookie(slugs: string[]) {
  if (typeof document === 'undefined') return;
  const value = slugs.filter(Boolean).join(',');
  if (!value) {
    document.cookie = `${TRANSLATION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
    return;
  }
  document.cookie = `${TRANSLATION_COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function parseTranslationPreference(raw: string | null | undefined): string {
  if (!raw?.trim()) return DEFAULT_TRANSLATION;
  // Cookie may be URL-encoded
  let decoded = raw.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    /* keep raw */
  }
  const cleaned = decoded
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return cleaned.length ? cleaned.join(',') : DEFAULT_TRANSLATION;
}

/**
 * Prefer cookie, then legacy ?trans=, then the default — never require a query
 * string in the URL. Locale-prefixed routes pass their own `defaultSlug` so
 * e.g. /ur/al-ikhlas server-renders the Urdu translation with no query at all.
 */
export function resolveTranslations(opts: {
  cookieValue?: string | null;
  queryTrans?: string | null;
  defaultSlug?: string;
}): string {
  if (opts.cookieValue?.trim()) return parseTranslationPreference(opts.cookieValue);
  if (opts.queryTrans?.trim()) return parseTranslationPreference(opts.queryTrans);
  return opts.defaultSlug?.trim() || DEFAULT_TRANSLATION;
}
