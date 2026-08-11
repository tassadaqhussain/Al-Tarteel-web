import type { MetadataRoute } from 'next';
import { ARTICLES } from '@/lib/articles';
import { LEARNING_PLANS } from '@/lib/learning-plans';
import { getSurahPath } from '@/lib/surah-meta';
import { SITE_URL } from '@/lib/seo';

/**
 * Sitemap index of canonical URLs only.
 * - No `?page=` URLs (paginated slices are linked from surah pages; query URLs
 *   confuse Discovery / “referring sitemap” reporting in Search Console).
 * - Split shards so GSC can show which child sitemap listed a URL.
 */
export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }, { id: 2 }];
}

type SitemapId = 0 | 1 | 2;

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id) as SitemapId;
  const now = new Date();

  if (id === 0) {
    // Core hubs + juz + tajweed
    return [
      { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
      {
        url: `${SITE_URL}/surahs`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.95,
      },
      {
        url: `${SITE_URL}/articles`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.75,
      },
      {
        url: `${SITE_URL}/learning-plans`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${SITE_URL}/quran-in-year`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.65,
      },
      {
        url: `${SITE_URL}/tajweed`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${SITE_URL}/donate`,
        lastModified: now,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      ...Array.from({ length: 30 }, (_, i) => ({
        url: `${SITE_URL}/juz/${i + 1}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
      ...['ghunnah', 'ikhfa', 'idgham', 'iqlab', 'qalqalah', 'madd'].map((slug) => ({
        url: `${SITE_URL}/tajweed/${slug}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.55,
      })),
    ];
  }

  if (id === 1) {
    // All 114 canonical surah URLs (no query strings)
    return Array.from({ length: 114 }, (_, i) => {
      const number = i + 1;
      return {
        url: `${SITE_URL}${getSurahPath(number)}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: number <= 10 ? 0.9 : 0.8,
      };
    });
  }

  // Learning plans + articles
  return [
    ...LEARNING_PLANS.map((plan) => ({
      url: `${SITE_URL}/learning-plans/${plan.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: plan.featured ? 0.65 : 0.55,
    })),
    ...ARTICLES.map((article) => ({
      url: `${SITE_URL}/articles/${article.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
