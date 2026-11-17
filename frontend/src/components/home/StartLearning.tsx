'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { getDailyFeaturedArticles } from '@/lib/articles';
import { PageSection } from '@/components/layout/MainContainer';
import { useT } from '@/lib/i18n';

export function StartLearning() {
  const articles = getDailyFeaturedArticles(3);
  const { t } = useT();

  return (
    <PageSection>
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8A5E14] dark:text-amber-300">
            Guides &amp; reflections
          </p>
          <h2 className="mt-1 font-serif text-[26px] font-bold tracking-tight text-ink">
            Articles
          </h2>
        </div>
        <Link
          href="/articles"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:underline"
        >
          <span>{t('readMoreArticles')}</span>
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, index) => (
          <ArticleCard
            key={article.slug}
            article={article}
            badge={index === 0 ? t('newToday') : undefined}
            priority={false}
          />
        ))}
      </div>
    </PageSection>
  );
}
