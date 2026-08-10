import type { MetadataRoute } from 'next';
import { ARTICLES } from '@/lib/articles';
import { LEARNING_PLANS } from '@/lib/learning-plans';
import { getSurahPath } from '@/lib/surah-meta';
import { SITE_URL } from '@/lib/seo';
import { getSurahAyahCount, surahTotalPages } from '@/lib/surah-pagination';

/**
 * Sitemap of canonical, indexable URLs only.
 * Omit lastModified unless a real content change date is known (avoid fake timestamps).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/surahs`, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${SITE_URL}/articles`, changeFrequency: 'daily', priority: 0.75 },
    { url: `${SITE_URL}/learning-plans`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/quran-in-year`, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${SITE_URL}/donate`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const surahs: MetadataRoute.Sitemap = [];
  for (let number = 1; number <= 114; number += 1) {
    const path = getSurahPath(number);
    const pages = surahTotalPages(getSurahAyahCount(number));
    surahs.push({
      url: `${SITE_URL}${path}`,
      changeFrequency: 'monthly',
      priority: number <= 10 ? 0.9 : 0.8,
    });
    // Additional verse slices for long surahs (unique content pages).
    for (let page = 2; page <= pages; page += 1) {
      surahs.push({
        url: `${SITE_URL}${path}?page=${page}`,
        changeFrequency: 'monthly',
        priority: 0.65,
      });
    }
  }

  const juz: MetadataRoute.Sitemap = Array.from({ length: 30 }, (_, i) => ({
    url: `${SITE_URL}/juz/${i + 1}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const plans: MetadataRoute.Sitemap = LEARNING_PLANS.map((plan) => ({
    url: `${SITE_URL}/learning-plans/${plan.slug}`,
    changeFrequency: 'monthly' as const,
    priority: plan.featured ? 0.65 : 0.55,
  }));

  const articles: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: `${SITE_URL}/articles/${article.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const tajweed: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/tajweed`, changeFrequency: 'monthly', priority: 0.6 },
    ...['ghunnah', 'ikhfa', 'idgham', 'iqlab', 'qalqalah', 'madd'].map((slug) => ({
      url: `${SITE_URL}/tajweed/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.55,
    })),
  ];

  return [...staticPages, ...surahs, ...juz, ...plans, ...articles, ...tajweed];
}
