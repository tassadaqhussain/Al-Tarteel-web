import { ARTICLES } from '@/lib/articles';
import { LEARNING_PLANS } from '@/lib/learning-plans';
import { getSurahPath, getAyahPath } from '@/lib/surah-meta';
import { SURAH_AYAH_COUNTS } from '@/lib/surah-pagination';
import { SITE_URL, absoluteUrl, isVersePageIndexed } from '@/lib/seo';
import {
  CONTENT_LOCALES,
  DEFAULT_CONTENT_LOCALE,
  PREFIXED_LOCALES,
  localeConfig,
  localePath,
  type ContentLocale,
} from '@/lib/i18n/content-locales';

const FALLBACK_CONTENT_UPDATED_AT = '2026-11-14T00:00:00.000Z';

/**
 * Normalize any date input to a single consistent ISO 8601 UTC timestamp
 * (`YYYY-MM-DDTHH:mm:ss.000Z`) so the sitemap index and every child sitemap
 * never mix timezone offsets or date formats.
 */
export function normalizeLastmod(value?: string): string {
  if (!value) return FALLBACK_CONTENT_UPDATED_AT;
  const trimmed = value.trim();
  if (!trimmed) return FALLBACK_CONTENT_UPDATED_AT;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return FALLBACK_CONTENT_UPDATED_AT;
  return parsed.toISOString();
}

/**
 * Real content-modified date for static hub/guide pages (not build time).
 * Bump when static hub or tajweed content materially changes.
 */
export const SITEMAP_LASTMOD = normalizeLastmod(
  process.env.STATIC_CONTENT_UPDATED_AT || FALLBACK_CONTENT_UPDATED_AT,
);

/**
 * Real content-modified date for Quran text, surah, juz, and ayah pages.
 * Bump when Quran translations, tafsir, or audio change.
 */
export const QURAN_CONTENT_UPDATED_AT = normalizeLastmod(
  process.env.QURAN_CONTENT_UPDATED_AT || '2026-11-01T00:00:00.000Z',
);

/**
 * Surah ranges used to split ayah sitemaps into compact files (~2,000 URLs each,
 * well below the 5,000-URL target and 50,000-URL protocol cap).
 */
export const AYAH_SURAH_GROUPS: readonly { id: number; start: number; end: number }[] = [
  { id: 1, start: 1, end: 16 },   // 2,030 ayahs
  { id: 2, start: 17, end: 40 },  // 2,188 ayahs
  { id: 3, start: 41, end: 114 }, // 2,018 ayahs
];

export const SITEMAP_NAMES = [
  'core',
  'surahs',
  'content',
  'locales',
  'ayahs-1',
  'ayahs-2',
  'ayahs-3',
  'ayahs-ur-1',
  'ayahs-ur-2',
  'ayahs-ur-3',
  'ayahs-ps-1',
  'ayahs-ps-2',
  'ayahs-ps-3',
  'ayahs-fa-1',
  'ayahs-fa-2',
  'ayahs-fa-3',
] as const;

export type SitemapName = (typeof SITEMAP_NAMES)[number];

export type ChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export type SitemapAlternate = {
  hreflang: string;
  href: string;
};

export type SitemapEntry = {
  url: string;
  lastModified?: string;
  changeFrequency: ChangeFrequency;
  priority: number;
  alternates?: SitemapAlternate[];
};

export function sitemapPath(name: SitemapName): string {
  return `/sitemaps/${name}.xml`;
}

export function isSitemapName(value: string): value is SitemapName {
  return (SITEMAP_NAMES as readonly string[]).includes(value);
}

function buildAlternates(
  basePath: string,
  locales: readonly ContentLocale[] = CONTENT_LOCALES,
): SitemapAlternate[] | undefined {
  if (locales.length <= 1) return undefined;
  return [
    ...locales.map((loc) => ({
      hreflang: localeConfig(loc).hreflang,
      href: absoluteUrl(localePath(loc, basePath)),
    })),
    {
      hreflang: 'x-default',
      href: absoluteUrl(localePath(DEFAULT_CONTENT_LOCALE, basePath)),
    },
  ];
}

/** Core hubs + juz + tajweed. */
function coreEntries(): SitemapEntry[] {
  return [
    {
      url: SITE_URL,
      lastModified: SITEMAP_LASTMOD,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: buildAlternates('/'),
    },
    { url: `${SITE_URL}/surahs`, lastModified: SITEMAP_LASTMOD, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${SITE_URL}/juz`, lastModified: SITEMAP_LASTMOD, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/quran-english-translation`, lastModified: SITEMAP_LASTMOD, changeFrequency: 'weekly', priority: 0.92 },
    { url: `${SITE_URL}/quran-urdu-translation`, lastModified: SITEMAP_LASTMOD, changeFrequency: 'weekly', priority: 0.92 },
    { url: `${SITE_URL}/quran-pashto-translation`, lastModified: SITEMAP_LASTMOD, changeFrequency: 'weekly', priority: 0.92 },
    { url: `${SITE_URL}/articles`, lastModified: SITEMAP_LASTMOD, changeFrequency: 'daily', priority: 0.75 },
    { url: `${SITE_URL}/learning-plans`, lastModified: SITEMAP_LASTMOD, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/quran-in-year`, lastModified: SITEMAP_LASTMOD, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${SITE_URL}/tajweed`, lastModified: SITEMAP_LASTMOD, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/about`, lastModified: SITEMAP_LASTMOD, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: SITEMAP_LASTMOD, changeFrequency: 'monthly', priority: 0.55 },
    ...Array.from({ length: 30 }, (_, i) => ({
      url: `${SITE_URL}/juz/${i + 1}`,
      lastModified: QURAN_CONTENT_UPDATED_AT,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...['ghunnah', 'ikhfa', 'idgham', 'iqlab', 'qalqalah', 'madd'].map((slug) => ({
      url: `${SITE_URL}/tajweed/${slug}`,
      lastModified: SITEMAP_LASTMOD,
      changeFrequency: 'monthly' as const,
      priority: 0.55,
    })),
  ];
}

/** All 114 canonical English surah URLs with hreflang alternates. */
function surahEntries(): SitemapEntry[] {
  return Array.from({ length: 114 }, (_, i) => {
    const number = i + 1;
    const basePath = getSurahPath(number);
    return {
      url: `${SITE_URL}${basePath}`,
      lastModified: QURAN_CONTENT_UPDATED_AT,
      changeFrequency: 'monthly' as const,
      priority: number <= 10 ? 0.9 : 0.8,
      alternates: buildAlternates(basePath),
    };
  });
}

/** Learning plans + articles. */
function contentEntries(): SitemapEntry[] {
  return [
    ...LEARNING_PLANS.map((plan) => ({
      url: `${SITE_URL}/learning-plans/${plan.slug}`,
      lastModified: SITEMAP_LASTMOD,
      changeFrequency: 'monthly' as const,
      priority: plan.featured ? 0.65 : 0.55,
    })),
    ...ARTICLES.map((article) => ({
      url: `${SITE_URL}/articles/${article.slug}`,
      lastModified: normalizeLastmod(article.updatedAt || article.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}

/**
 * Locale hubs + all 114 surahs in each prefixed locale (/ur, /ps, /fa),
 * with reciprocal hreflang alternates matching the HTML `<head>`.
 */
function localeEntries(): SitemapEntry[] {
  const homeAlternates = buildAlternates('/');
  return PREFIXED_LOCALES.flatMap((locale) => [
    {
      url: `${SITE_URL}${localePath(locale, '/')}`,
      lastModified: SITEMAP_LASTMOD,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
      alternates: homeAlternates,
    },
    ...Array.from({ length: 114 }, (_, i) => {
      const number = i + 1;
      const basePath = getSurahPath(number);
      return {
        url: `${SITE_URL}${localePath(locale, basePath)}`,
        lastModified: QURAN_CONTENT_UPDATED_AT,
        changeFrequency: 'monthly' as const,
        priority: number <= 10 ? 0.8 : 0.7,
        alternates: buildAlternates(basePath),
      };
    }),
  ]);
}

function ayahEntriesForGroup(
  locale: ContentLocale,
  startSurah: number,
  endSurah: number,
): SitemapEntry[] {
  if (!isVersePageIndexed(locale)) return [];
  const indexedLocales = CONTENT_LOCALES.filter(isVersePageIndexed);
  const entries: SitemapEntry[] = [];
  for (let surahNumber = startSurah; surahNumber <= endSurah; surahNumber += 1) {
    const count = SURAH_AYAH_COUNTS[surahNumber - 1] ?? 0;
    for (let ayah = 1; ayah <= count; ayah += 1) {
      const basePath = getAyahPath(surahNumber, ayah);
      entries.push({
        url: `${SITE_URL}${localePath(locale, basePath)}`,
        lastModified: QURAN_CONTENT_UPDATED_AT,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: buildAlternates(basePath, indexedLocales),
      });
    }
  }
  return entries;
}

export function sitemapEntries(name: SitemapName): SitemapEntry[] {
  if (name === 'core') return coreEntries();
  if (name === 'surahs') return surahEntries();
  if (name === 'content') return contentEntries();
  if (name === 'locales') return localeEntries();

  const enMatch = /^ayahs-(\d+)$/.exec(name);
  if (enMatch) {
    const group = AYAH_SURAH_GROUPS.find((g) => g.id === Number(enMatch[1]));
    return group ? ayahEntriesForGroup('en', group.start, group.end) : [];
  }

  const localeMatch = /^ayahs-(ur|ps|fa)-(\d+)$/.exec(name);
  if (localeMatch) {
    const locale = localeMatch[1] as ContentLocale;
    const group = AYAH_SURAH_GROUPS.find((g) => g.id === Number(localeMatch[2]));
    return group ? ayahEntriesForGroup(locale, group.start, group.end) : [];
  }

  return [];
}

export function activeSitemapNames(): SitemapName[] {
  return SITEMAP_NAMES.filter((name) => sitemapEntries(name).length > 0);
}

export function sitemapLastmod(name: SitemapName): string {
  const entries = sitemapEntries(name);
  let newest = '';
  for (const entry of entries) {
    const lm = normalizeLastmod(entry.lastModified || SITEMAP_LASTMOD);
    if (!newest || lm > newest) newest = lm;
  }
  return newest || SITEMAP_LASTMOD;
}
