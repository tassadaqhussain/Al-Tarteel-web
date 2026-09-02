import type { UiLocale } from '@/stores/settingsStore';
import { LOCALE_TEXT_TRANSLATION_SLUG } from '@/lib/i18n/locale-translation-slugs';

/**
 * Locales that get their own crawlable URL prefix.
 *
 * Deliberately NOT every UI locale. A locale earns an indexed URL only when the
 * page is genuinely different in that language — a real Quran translation (and
 * ideally translation audio) behind it. The other UI locales translate chrome
 * only; giving those their own copies of all 114 surahs would publish thousands
 * of near-duplicate English pages, which is a thin-content risk rather than a
 * ranking win.
 *
 * English stays unprefixed at the root so existing indexed URLs keep their
 * equity; it is also the x-default.
 */

export type ContentLocale = 'en' | 'ur' | 'ps' | 'fa';

/** Locales served under a path prefix (everything except root English). */
export const PREFIXED_LOCALES = ['ur', 'ps', 'fa'] as const;

export type PrefixedLocale = (typeof PREFIXED_LOCALES)[number];

export const CONTENT_LOCALES: readonly ContentLocale[] = ['en', ...PREFIXED_LOCALES] as const;

export const DEFAULT_CONTENT_LOCALE: ContentLocale = 'en';

export type ContentLocaleConfig = {
  code: ContentLocale;
  /** BCP-47 value for hreflang and the `lang` attribute. */
  hreflang: string;
  dir: 'ltr' | 'rtl';
  /** Name in the language itself, for language switchers. */
  nativeName: string;
  /** English name, for alt text and internal copy. */
  englishName: string;
  /** Default translation slug the reader should load for this locale. */
  translationSlug: string;
};

export const CONTENT_LOCALE_CONFIG: Record<ContentLocale, ContentLocaleConfig> = {
  en: {
    code: 'en',
    hreflang: 'en',
    dir: 'ltr',
    nativeName: 'English',
    englishName: 'English',
    translationSlug: LOCALE_TEXT_TRANSLATION_SLUG.en,
  },
  ur: {
    code: 'ur',
    hreflang: 'ur',
    dir: 'rtl',
    nativeName: 'اردو',
    englishName: 'Urdu',
    translationSlug: LOCALE_TEXT_TRANSLATION_SLUG.ur,
  },
  ps: {
    code: 'ps',
    hreflang: 'ps',
    dir: 'rtl',
    nativeName: 'پښتو',
    englishName: 'Pashto',
    translationSlug: LOCALE_TEXT_TRANSLATION_SLUG.ps,
  },
  fa: {
    code: 'fa',
    hreflang: 'fa',
    dir: 'rtl',
    nativeName: 'فارسی',
    englishName: 'Persian',
    translationSlug: LOCALE_TEXT_TRANSLATION_SLUG.fa,
  },
};

export function isPrefixedLocale(value: string): value is PrefixedLocale {
  return (PREFIXED_LOCALES as readonly string[]).includes(value);
}

export function isContentLocale(value: string): value is ContentLocale {
  return (CONTENT_LOCALES as readonly string[]).includes(value);
}

export function localeConfig(locale: ContentLocale): ContentLocaleConfig {
  return CONTENT_LOCALE_CONFIG[locale];
}

/** `useT`/`messages.ts` speak UiLocale; every content locale is one. */
export function toUiLocale(locale: ContentLocale): UiLocale {
  return locale as UiLocale;
}

/**
 * Prefix a root-relative path for a locale.
 * `localePath('en', '/al-ikhlas')` → `/al-ikhlas`
 * `localePath('ur', '/al-ikhlas')` → `/ur/al-ikhlas`
 */
export function localePath(locale: ContentLocale, path = '/'): string {
  const clean = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  if (locale === DEFAULT_CONTENT_LOCALE) return clean || '/';
  return `/${locale}${clean}`;
}
