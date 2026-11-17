'use client';

/**
 * URL-prefixed locale routes (/ur, /ps, /fa) apply their locale via `useT()` and `LocaleSync`
 * for that page only, without mutating the user's persisted `uiLocale` or translation settings.
 */
export function LocaleFromPath() {
  return null;
}
