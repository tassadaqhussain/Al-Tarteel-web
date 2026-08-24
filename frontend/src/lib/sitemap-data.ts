import { ARTICLES } from '@/lib/articles';
import { LEARNING_PLANS } from '@/lib/learning-plans';
import { getSurahPath } from '@/lib/surah-meta';
import { SITE_URL } from '@/lib/seo';
import { PREFIXED_LOCALES, localePath } from '@/lib/i18n/content-locales';

/**
 * Sitemap contents, shared by the index (`/sitemap.xml`) and the shard routes
 * (`/sitemap/<id>.xml`).
 *
 * Canonical URLs only — no `?page=` URLs. Paginated slices are linked from the
 * surah pages; query URLs confuse Discovery / “referring sitemap” reporting in
 * Search Console. Shards are kept so GSC can report which child sitemap listed
 * a given URL.
 */

export const SITEMAP_SHARD_IDS = [0, 1, 2, 3] as const;

export type SitemapShardId = (typeof SITEMAP_SHARD_IDS)[number];

export type ChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export type SitemapEntry = {
  url: string;
  changeFrequency: ChangeFrequency;
  priority: number;
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
    { url: `${SITE_URL}/articles`, changeFrequency: 'daily', priority: 0.75 },
    { url: `${SITE_URL}/learning-plans`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/quran-in-year`, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${SITE_URL}/tajweed`, changeFrequency: 'monthly', priority: 0.6 },
    ...Array.from({ length: 30 }, (_, i) => ({
      url: `${SITE_URL}/juz/${i + 1}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...['ghunnah', 'ikhfa', 'idgham', 'iqlab', 'qalqalah', 'madd'].map((slug) => ({
      url: `${SITE_URL}/tajweed/${slug}`,
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
      changeFrequency: 'monthly' as const,
      priority: plan.featured ? 0.65 : 0.55,
    })),
    ...ARTICLES.map((article) => ({
      url: `${SITE_URL}/articles/${article.slug}`,
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
        changeFrequency: 'monthly' as const,
        priority: number <= 10 ? 0.8 : 0.7,
      };
    }),
  ]);
}

export function sitemapShardEntries(id: SitemapShardId): SitemapEntry[] {
  if (id === 0) return coreEntries();
  if (id === 1) return surahEntries();
  if (id === 3) return localeEntries();
  return contentEntries();
}
