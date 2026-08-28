import type { UiLocale } from '@/stores/settingsStore';
import {
  isPrefixedLocale,
  localePath,
  type ContentLocale,
  type PrefixedLocale,
} from '@/lib/i18n/content-locales';
import { getSurahNumberFromSlug, getSurahPath } from '@/lib/surah-meta';

export const UI_TO_CONTENT_LOCALE: Partial<Record<UiLocale, ContentLocale>> = {
  en: 'en',
  ur: 'ur',
  ps: 'ps',
  fa: 'fa',
};

export function uiLocaleToContentLocale(locale: UiLocale): ContentLocale {
  return UI_TO_CONTENT_LOCALE[locale] ?? 'en';
}

export function isContentLocaleUi(locale: UiLocale): locale is UiLocale & ContentLocale {
  return locale in UI_TO_CONTENT_LOCALE;
}

const KNOWN_APP_SEGMENTS = new Set([
  'search',
  'surahs',
  'surah',
  'juz',
  'bookmarks',
  'settings',
  'profile',
  'my-quran',
  'donate',
  'feedback',
  'articles',
  'hifz',
  'tajweed',
  'learning-plans',
  'quran-in-year',
  'quran-english-translation',
  'quran-urdu-translation',
  'quran-pashto-translation',
  'reading-goal',
  'login',
  'register',
  'forgot-password',
  'reset-password',
  'admin',
  'ur',
  'ps',
  'fa',
]);

export type ParsedPath = {
  localePrefix: PrefixedLocale | null;
  segments: string[];
  pathname: string;
};

export function parseAppPath(pathname: string): ParsedPath {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (first && isPrefixedLocale(first)) {
    return {
      localePrefix: first,
      segments: segments.slice(1),
      pathname,
    };
  }
  return { localePrefix: null, segments, pathname };
}

export function getSurahNumberFromPath(pathname: string): number | null {
  const { segments } = parseAppPath(pathname);
  if (segments[0] === 'surah' && segments[1]) {
    const n = parseInt(segments[1], 10);
    return n >= 1 && n <= 114 ? n : null;
  }
  if (segments.length === 1 && !KNOWN_APP_SEGMENTS.has(segments[0])) {
    return getSurahNumberFromSlug(segments[0]);
  }
  return null;
}

export function isReaderPath(pathname: string): boolean {
  const { segments } = parseAppPath(pathname);
  if (segments[0] === 'surah' || segments[0] === 'juz') return true;
  if (segments.length === 1 && !KNOWN_APP_SEGMENTS.has(segments[0])) {
    return getSurahNumberFromSlug(segments[0]) != null;
  }
  return false;
}

export function pathForUiLocale(pathname: string, targetLocale: UiLocale): string {
  const contentLocale = uiLocaleToContentLocale(targetLocale);
  const { segments } = parseAppPath(pathname);
  const search = typeof window !== 'undefined' ? window.location.search : '';

  const surahNumber = getSurahNumberFromPath(pathname);
  if (surahNumber) {
    return `${localePath(contentLocale, getSurahPath(surahNumber))}${search}`;
  }

  if (segments[0] === 'juz' && segments[1]) {
    return `/juz/${segments[1]}${search}`;
  }

  if (segments.length === 0) {
    return contentLocale === 'en' ? '/' : localePath(contentLocale, '/');
  }

  const rest = `/${segments.join('/')}`;
  return contentLocale === 'en' ? `${rest}${search}` : `${localePath(contentLocale, rest)}${search}`;
}
