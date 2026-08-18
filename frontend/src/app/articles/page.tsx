import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Header } from '@/components/Header';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { getArticlesSorted, getDailyFeaturedArticles } from '@/lib/articles';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Articles — Quran & Islam Basics',
  description:
    'Short daily articles on Quran, prayer, Islamic history, and faith foundations—written for beginners and lifelong learners.',
  path: '/articles',
  keywords: [
    'Islam articles',
    'Quran basics',
    'learn Islam',
    'Islamic education',
    'Quran reading tips',
  ],
});

export default function ArticlesPage() {
  const articles = getArticlesSorted();
  const todays = new Set(getDailyFeaturedArticles(3).map((a) => a.slug));

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f7] text-slate-800">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:py-14">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Learn Quran &amp; Islam basics
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-500 sm:text-lg">
            Fresh reading every day. Browse guides on belief, prayer, the Quran, history, and character—
            then return tomorrow for a new featured selection on the homepage.
          </p>
          <p className="mt-3 text-sm font-medium text-emerald-800">
            {articles.length} articles · daily featured rotation
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <ArticleCard
              key={article.slug}
              article={article}
              badge={todays.has(article.slug) ? 'Today' : undefined}
              priority={index === 0}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/learning-plans"
            className="text-sm font-semibold text-emerald-800 hover:text-emerald-950"
          >
            Prefer structured lessons? Explore Learning Plans →
          </Link>
        </div>
      </main>
    </div>
  );
}
