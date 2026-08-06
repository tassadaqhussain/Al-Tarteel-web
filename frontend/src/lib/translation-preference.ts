export const TRANSLATION_COOKIE = 'qp_translations';
export const DEFAULT_TRANSLATION = 'en-sahih-international';

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

/** Prefer cookie, then legacy ?trans=, then default — never require query in the URL. */
export function resolveTranslations(opts: {
  cookieValue?: string | null;
  queryTrans?: string | null;
}): string {
  if (opts.cookieValue?.trim()) return parseTranslationPreference(opts.cookieValue);
  if (opts.queryTrans?.trim()) return parseTranslationPreference(opts.queryTrans);
  return DEFAULT_TRANSLATION;
}
