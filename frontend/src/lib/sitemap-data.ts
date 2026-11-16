import { ARTICLES } from '@/lib/articles';
import { LEARNING_PLANS } from '@/lib/learning-plans';
import { getSurahPath, getAyahPath } from '@/lib/surah-meta';
import { SURAH_AYAH_COUNTS } from '@/lib/surah-pagination';
import { SITE_URL, isVersePageIndexed } from '@/lib/seo';
import {
  CONTENT_LOCALES,
  PREFIXED_LOCALES,
  localeConfig,
  localePath,
  type ContentLocale,
} from '@/lib/i18n/content-locales';

/**
 * Stable build-time lastmod constant for static pages (from git commit date in CI/CD).
 */
export const SITEMAP_LASTMOD =
  process.env.SITEMAP_LASTMOD?.trim() ||
  process.env.NEXT_PUBLIC_BUILD_DATE?.trim() ||
  '2026-11-14T00:00:00.000Z';

/**
 * Single config value for Quran text, surah, juz, and ayah pages.
 * Bump when Quran translations, tafsir, or audio change.
 */
export const QURAN_CONTENT_UPDATED_AT =
  process.env.QURAN_CONTENT_UPDATED_AT?.trim() || '2026-11-01T00:00:00.000Z';

/**
 * Sitemap contents, shared by the index (`/sitemap.xml`) and the shard routes
 * (`/sitemap/<id>.xml`).
 *
 * Shards 0–3 preserve all existing URLs; shards 4–7 list all 6,236 ayahs × 4
 * languages (24,944 URLs).
 */

export const SITEMAP_SHARD_IDS = [0, 1, 2, 3, 4, 5, 6, 7] as const;

export type SitemapShardId = (typeof SITEMAP_SHARD_IDS)[number];

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

export function sitemapShardPath(id: SitemapShardId | number): string {
  return `/sitemap/${id}.xml`;
}

export function isSitemapShardId(value: number): value is SitemapShardId {
  return (SITEMAP_SHARD_IDS as readonly number[]).includes(value);
}

/** Core hubs + juz + tajweed. */
function coreEntries(): SitemapEntry[] {
  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/surahs`, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${SITE_URL}/quran-english-translation`, changeFrequency: 'weekly', priority: 0.92 },
    { url: `${SITE_URL}/quran-urdu-translation`, changeFrequency: 'weekly', priority: 0.92 },
    { url: `${SITE_URL}/quran-pashto-translation`, changeFrequency: 'weekly', priority: 0.92 },
    { url: `${SITE_URL}/articles`, changeFrequency: 'daily', priority: 0.75 },
    { url: `${SITE_URL}/learning-plans`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/quran-in-year`, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${SITE_URL}/tajweed`, changeFrequency: 'monthly', priority: 0.6 },
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

/** All 114 canonical surah URLs. */
function surahEntries(): SitemapEntry[] {
  return Array.from({ length: 114 }, (_, i) => {
    const number = i + 1;
    return {
      url: `${SITE_URL}${getSurahPath(number)}`,
      lastModified: QURAN_CONTENT_UPDATED_AT,
      changeFrequency: 'monthly' as const,
      priority: number <= 10 ? 0.9 : 0.8,
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
      lastModified: new Date(article.publishedAt).toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}

/**
 * Locale hubs + all 114 surahs in each prefixed locale (/ur, /ps, /fa).
 * Kept in its own shard so Search Console reports localised coverage separately
 * from the English tree.
 */
function localeEntries(): SitemapEntry[] {
  return PREFIXED_LOCALES.flatMap((locale) => [
    {
      url: `${SITE_URL}${localePath(locale, '/')}`,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    ...Array.from({ length: 114 }, (_, i) => {
      const number = i + 1;
      return {
        url: `${SITE_URL}${localePath(locale, getSurahPath(number))}`,
        lastModified: QURAN_CONTENT_UPDATED_AT,
        changeFrequency: 'monthly' as const,
        priority: number <= 10 ? 0.8 : 0.7,
      };
    }),
  ]);
}

function ayahEntriesForLocale(locale: ContentLocale): SitemapEntry[] {
  if (!isVersePageIndexed(locale)) return [];
  const entries: SitemapEntry[] = [];
  for (let i = 0; i < SURAH_AYAH_COUNTS.length; i += 1) {
    const surahNumber = i + 1;
    const count = SURAH_AYAH_COUNTS[i];
    for (let ayah = 1; ayah <= count; ayah += 1) {
      const basePath = getAyahPath(surahNumber, ayah);
      const alternates: SitemapAlternate[] = [
        ...CONTENT_LOCALES.map((loc) => ({
          hreflang: localeConfig(loc).hreflang,
          href: `${SITE_URL}${localePath(loc, basePath)}`,
        })),
        { hreflang: 'x-default', href: `${SITE_URL}${basePath}` },
      ];
      entries.push({
        url: `${SITE_URL}${localePath(locale, basePath)}`,
        lastModified: QURAN_CONTENT_UPDATED_AT,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates,
      });
    }
  }
  return entries;
}

export function sitemapShardLastmod(id: SitemapShardId): string {
  const entries = sitemapShardEntries(id);
  let newest = '';
  for (const entry of entries) {
    const lm = entry.lastModified || SITEMAP_LASTMOD;
    if (!newest || lm > newest) newest = lm;
  }
  return newest || SITEMAP_LASTMOD;
}

export function sitemapShardEntries(id: SitemapShardId): SitemapEntry[] {
  if (id === 0) return coreEntries();
  if (id === 1) return surahEntries();
  if (id === 3) return localeEntries();
  if (id === 4) return ayahEntriesForLocale('en');
  if (id === 5) return ayahEntriesForLocale('ur');
  if (id === 6) return ayahEntriesForLocale('ps');
  if (id === 7) return ayahEntriesForLocale('fa');
  return contentEntries();
}
