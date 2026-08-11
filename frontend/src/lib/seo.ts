import type { Metadata } from 'next';
import { getSurahPath, SURAH_MEANINGS, SURAH_SIMPLE_NAMES } from '@/lib/surah-meta';
import { SURAH_PAGE_SIZE } from '@/lib/surah-pagination';

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

export function buildPageMetadata({
  title,
  description,
  path = '/',
  keywords = [],
  noIndex = false,
  type = 'website',
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  type?: 'website' | 'article';
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
    alternates: { canonical: url },
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
      locale: 'en_US',
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
  }
) {
  const name = SURAH_SIMPLE_NAMES[number] || `Surah ${number}`;
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

  const title = range
    ? `Surah ${name} – Verses ${range.start}–${range.end} | ${SITE_NAME}`
    : `Surah ${name} – Read, Listen & Translation | ${SITE_NAME}`;

  const description = range
    ? `Read Surah ${name} verses ${range.start}–${range.end} with Arabic Uthmani text, English translation, and audio on QuranPilot.`
    : [
        `Read Surah ${name}${meaning ? ` (${meaning})` : ''}${arabic ? ` · ${arabic}` : ''} online`,
        ayahs ? `— ${ayahs} verses` : '',
        'with Arabic text, translation, and verse-by-verse audio on QuranPilot.',
      ]
        .filter(Boolean)
        .join(' ');

  const canonicalPath = page > 1 ? `${path}?page=${page}` : path;

  return {
    number,
    name,
    meaning,
    arabic,
    path,
    metadata: buildPageMetadata({
      title,
      description,
      path: canonicalPath,
      keywords: [
        `Surah ${name}`,
        name,
        arabic,
        meaning,
        `Surah ${number}`,
        range ? `verses ${range.start}-${range.end}` : '',
        'read Surah',
        'listen Quran',
        'Quran chapter',
      ].filter(Boolean) as string[],
      type: 'article',
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
}) {
  const url = absoluteUrl(input.path);
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: `Surah ${input.name}`,
    alternateName: [input.arabic, input.meaning].filter(Boolean),
    description: `Chapter ${input.number} of the Holy Quran${input.ayahCount ? ` with ${input.ayahCount} verses` : ''}.`,
    inLanguage: 'ar',
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
