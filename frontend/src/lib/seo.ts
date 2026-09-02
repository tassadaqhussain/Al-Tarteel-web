import type { Metadata } from 'next';
import { getSurahPath, SURAH_MEANINGS, SURAH_SIMPLE_NAMES, getAyahPath } from '@/lib/surah-meta';
import { SURAH_PAGE_SIZE } from '@/lib/surah-pagination';
import { surahCopy } from '@/lib/i18n/seo-strings';
import { getSurahLocalizedName } from '@/lib/i18n/surah-localized-names';
import { popularSurahSeoOverride } from '@/lib/i18n/surah-seo-overrides';
import {
  CONTENT_LOCALES,
  DEFAULT_CONTENT_LOCALE,
  localeConfig,
  localePath,
  type ContentLocale,
} from '@/lib/i18n/content-locales';

/** Primary production origin — used for canonicals, OG, sitemap. */
export const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL || 'https://quranpilot.com').replace(/\/$/, '');

export const SITE_NAME = 'QuranPilot';

export const DEFAULT_DESCRIPTION =
  'Read the Holy Quran online with Arabic Uthmani text, English translation, and verse-by-verse audio. Browse all 114 surahs on QuranPilot.';

export const DEFAULT_KEYWORDS = [
  'Quran',
  'Holy Quran',
  'Quran online',
  'read Quran',
  'read Quran online',
  'Quran translation',
  'Quran audio',
  'listen to Quran',
  'Surah',
  'ayah',
  'Islamic',
  'QuranPilot',
  'Uthmani script',
  'Quran English translation',
];

/** Default OG/Twitter image from `app/opengraph-image.tsx`. */
export const DEFAULT_OG_IMAGE_PATH = '/opengraph-image';

export function absoluteUrl(path = '/'): string {
  if (!path || path === '/') return SITE_URL;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** OG locale codes for the locales we publish. */
const OG_LOCALES: Record<ContentLocale, string> = {
  en: 'en_US',
  ur: 'ur_PK',
  ps: 'ps_AF',
  fa: 'fa_IR',
};

export function openGraphLocale(locale: ContentLocale): string {
  return OG_LOCALES[locale] ?? OG_LOCALES[DEFAULT_CONTENT_LOCALE];
}

/**
 * hreflang set for a page that exists in every content locale.
 *
 * Returns undefined when `alternatePath` is omitted, so single-locale pages
 * emit no alternates rather than claiming translations that do not exist.
 * Every locale in the set points at the others AND at itself, and English
 * doubles as x-default — both required for Google to honour the cluster.
 */
export function hreflangAlternates(
  alternatePath?: string,
): Record<string, string> | undefined {
  if (!alternatePath) return undefined;
  const languages: Record<string, string> = {};
  for (const code of CONTENT_LOCALES) {
    languages[localeConfig(code).hreflang] = absoluteUrl(localePath(code, alternatePath));
  }
  languages['x-default'] = absoluteUrl(localePath(DEFAULT_CONTENT_LOCALE, alternatePath));
  return languages;
}

export function buildPageMetadata({
  title,
  description,
  path = '/',
  keywords = [],
  noIndex = false,
  type = 'website',
  locale = DEFAULT_CONTENT_LOCALE,
  alternatePath,
  hreflangLanguages,
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  type?: 'website' | 'article';
  /** Locale this page is written in — drives og:locale and the hreflang set. */
  locale?: ContentLocale;
  /**
   * Unprefixed path this page exists at in every locale (e.g. `/al-ikhlas`).
   * Omit for pages that exist in one locale only — they get no hreflang set.
   */
  alternatePath?: string;
  /** Custom hreflang map when sibling URLs are not locale-prefixed variants of one path. */
  hreflangLanguages?: Record<string, string>;
}): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = title.includes(SITE_NAME) ? title : undefined;
  const ogTitle = fullTitle || `${title} | ${SITE_NAME}`;
  const ogImage = {
    url: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
    width: 1200,
    height: 630,
    alt: `${SITE_NAME} — Holy Quran`,
  };
  return {
    title: fullTitle ? { absolute: fullTitle } : title,
    description,
    keywords: [...DEFAULT_KEYWORDS, ...keywords],
    alternates: {
      canonical: url,
      languages: hreflangLanguages ?? hreflangAlternates(alternatePath),
    },
    robots: noIndex
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      title: ogTitle,
      description,
      locale: openGraphLocale(locale),
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    },
  };
}

export function surahSeo(
  number: number,
  opts?: {
    ayahCount?: number;
    arabicName?: string;
    page?: number;
    locale?: ContentLocale;
  }
) {
  const locale = opts?.locale ?? DEFAULT_CONTENT_LOCALE;
  const englishName = SURAH_SIMPLE_NAMES[number] || `Surah ${number}`;
  const name = locale === 'en' ? englishName : getSurahLocalizedName(number, locale);
  const meaning = SURAH_MEANINGS[number];
  const arabic = opts?.arabicName || '';
  const ayahs = opts?.ayahCount ?? 0;
  const path = getSurahPath(number);
  const page = opts?.page && opts.page > 1 ? opts.page : 1;
  const range =
    page > 1 && ayahs > 0
      ? {
          start: (page - 1) * SURAH_PAGE_SIZE + 1,
          end: Math.min(ayahs, page * SURAH_PAGE_SIZE),
        }
      : null;

  const copy =
    popularSurahSeoOverride(number, locale, range) ??
    surahCopy(locale, { name, meaning: meaning || '', arabic, ayahCount: ayahs }, range);
  const title = `${copy.title} | ${SITE_NAME}`;
  const description = copy.description;

  // Canonical stays inside this locale; hreflang points at the sibling locales.
  const localisedPath = localePath(locale, path);
  const canonicalPath = page > 1 ? `${localisedPath}?page=${page}` : localisedPath;

  return {
    number,
    name: englishName,
    meaning,
    arabic,
    path,
    metadata: buildPageMetadata({
      title,
      description,
      path: canonicalPath,
      keywords: [
        `Surah ${englishName}`,
        englishName,
        name !== englishName ? name : '',
        arabic,
        meaning,
        `Surah ${number}`,
        range ? `verses ${range.start}-${range.end}` : '',
        'read Surah',
        'listen Quran',
        'Quran chapter',
      ].filter(Boolean) as string[],
      type: 'article',
      locale,
      // Paginated slices are thin duplicates — noindex; page 1 keeps hreflang cluster.
      noIndex: page > 1,
      alternatePath: page > 1 ? undefined : path,
    }),
  };
}

/** Unique metadata for Juz slices — self-canonical when page > 1. */
export function juzSeo(juzNumber: number, page = 1) {
  const p = page > 1 ? page : 1;
  const path = p > 1 ? `/juz/${juzNumber}?page=${p}` : `/juz/${juzNumber}`;
  const title =
    p > 1
      ? `Juz ${juzNumber} – Page ${p} | ${SITE_NAME}`
      : `Juz ${juzNumber} – Read the Holy Quran | ${SITE_NAME}`;
  const description =
    p > 1
      ? `Continue Juz (para) ${juzNumber} of the Holy Quran — page ${p} with Arabic text, translation, and audio on QuranPilot.`
      : `Read Juz (para) ${juzNumber} of the Holy Quran with Uthmani script, English translation, and verse-by-verse audio on QuranPilot.`;

  return buildPageMetadata({
    title,
    description,
    path,
    keywords: [`Juz ${juzNumber}`, `Para ${juzNumber}`, 'Quran juz', 'Quran para'],
    type: 'article',
  });
}

export function translationHubHreflang(): Record<string, string> {
  return {
    en: absoluteUrl('/quran-english-translation'),
    ur: absoluteUrl('/quran-urdu-translation'),
    ps: absoluteUrl('/quran-pashto-translation'),
    'x-default': absoluteUrl('/quran-english-translation'),
  };
}

/** High-intent ayahs with search-friendly names (used for sitemap + static generation). */
export const FAMOUS_AYAHS: { surah: number; ayah: number }[] = [
  { surah: 2, ayah: 255 },
  { surah: 1, ayah: 1 },
  { surah: 2, ayah: 1 },
  { surah: 18, ayah: 1 },
  { surah: 36, ayah: 1 },
  { surah: 55, ayah: 1 },
  { surah: 56, ayah: 1 },
  { surah: 67, ayah: 1 },
  { surah: 78, ayah: 1 },
  { surah: 112, ayah: 1 },
  { surah: 113, ayah: 1 },
  { surah: 114, ayah: 1 },
  { surah: 97, ayah: 1 },
  { surah: 24, ayah: 35 },
  { surah: 3, ayah: 18 },
];

const AYAH_SEO_NAMES: Partial<Record<string, Partial<Record<ContentLocale, string>>>> = {
  '2:255': {
    en: 'Ayatul Kursi',
    ur: 'آیت الکرسی',
    ps: 'آیت الکرسی',
    fa: 'آیة الکرسی',
  },
  '24:35': {
    en: 'Light Verse (Ayat an-Nur)',
    ur: 'آیت نور',
    ps: 'د نور آیت',
  },
  '3:18': {
    en: 'Shahada Verse',
    ur: 'آیت شہادت',
    ps: 'د شهادت آیت',
  },
};

function ayahSeoName(surah: number, ayah: number, locale: ContentLocale): string | null {
  return AYAH_SEO_NAMES[`${surah}:${ayah}`]?.[locale] ?? AYAH_SEO_NAMES[`${surah}:${ayah}`]?.en ?? null;
}

export function ayahSeo(
  surahNumber: number,
  ayahNumber: number,
  opts?: { arabicName?: string; locale?: ContentLocale },
) {
  const locale = opts?.locale ?? DEFAULT_CONTENT_LOCALE;
  const englishSurah = SURAH_SIMPLE_NAMES[surahNumber] || `Surah ${surahNumber}`;
  const localizedSurah = locale === 'en' ? englishSurah : getSurahLocalizedName(surahNumber, locale);
  const famousName = ayahSeoName(surahNumber, ayahNumber, locale);
  const path = getAyahPath(surahNumber, ayahNumber);
  const localisedPath = localePath(locale, path);

  const title = famousName
    ? `${famousName} — ${localizedSurah} ${surahNumber}:${ayahNumber} | ${SITE_NAME}`
    : `${localizedSurah} ${surahNumber}:${ayahNumber} — Quran Ayah | ${SITE_NAME}`;

  const description = famousName
    ? `Read ${famousName} (${englishSurah} ${surahNumber}:${ayahNumber}) with Arabic Uthmani text, translation, transliteration, and verse audio on QuranPilot.`
    : `Read ${englishSurah} ${surahNumber}:${ayahNumber} with Arabic Uthmani text, translation, and verse-by-verse Quran audio on QuranPilot.`;

  return {
    path,
    metadata: buildPageMetadata({
      title,
      description,
      path: localisedPath,
      keywords: [
        famousName || '',
        `${englishSurah} ${ayahNumber}`,
        `${englishSurah} ${surahNumber}:${ayahNumber}`,
        localizedSurah,
        opts?.arabicName || '',
        'Quran ayah',
        'read Quran online',
      ].filter(Boolean) as string[],
      type: 'article',
      locale,
      alternatePath: path,
    }),
  };
}

export function ayahJsonLd(input: {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  path: string;
  locale?: ContentLocale;
}) {
  const locale = input.locale ?? DEFAULT_CONTENT_LOCALE;
  const famousName = ayahSeoName(input.surahNumber, input.ayahNumber, locale);
  const url = absoluteUrl(localePath(locale, input.path));
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: famousName || `${input.surahName} ${input.surahNumber}:${input.ayahNumber}`,
    description: `Verse ${input.ayahNumber} of Surah ${input.surahName} in the Holy Quran.`,
    inLanguage: locale === 'en' ? 'ar' : locale,
    isPartOf: {
      '@type': 'Book',
      name: 'The Holy Quran',
      inLanguage: 'ar',
    },
    position: input.ayahNumber,
    url,
    mainEntityOfPage: url,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/**
 * WebSite JSON-LD without SearchAction — /search is noindex (hub + results).
 * Re-add SearchAction only when a crawlable, indexable search hub exists.
 */
export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: ['en', 'ar'],
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/images/logo.png'),
    description: 'Free online Quran reader with translations and audio.',
  };
}

export function surahJsonLd(input: {
  number: number;
  name: string;
  arabic?: string;
  meaning?: string;
  ayahCount?: number;
  path: string;
  locale?: ContentLocale;
}) {
  const locale = input.locale ?? DEFAULT_CONTENT_LOCALE;
  const localizedName = getSurahLocalizedName(input.number, locale);
  const url = absoluteUrl(input.path);
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: locale === 'en' ? `Surah ${input.name}` : localizedName,
    alternateName: [input.arabic, input.meaning, localizedName].filter(Boolean),
    description: `Chapter ${input.number} of the Holy Quran${input.ayahCount ? ` with ${input.ayahCount} verses` : ''}.`,
    inLanguage: locale === 'en' ? 'ar' : locale,
    isPartOf: {
      '@type': 'Book',
      name: 'The Holy Quran',
      inLanguage: 'ar',
    },
    position: input.number,
    url,
    mainEntityOfPage: url,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
