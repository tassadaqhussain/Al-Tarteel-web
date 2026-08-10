'use client';

import Link from 'next/link';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { getDailyFeaturedArticles } from '@/lib/articles';

export function StartLearning() {
  const articles = getDailyFeaturedArticles(3);

  return (
    <section className="w-full bg-[#f4fbf9]/30 px-4 py-16 md:px-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 flex flex-col items-center justify-between gap-3 text-center lg:flex-row lg:text-left">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Learn Quran and Islam <br className="sm:hidden" />
            <span className="text-emerald-800">basics everyday.</span>
          </h2>
          <p className="max-w-md text-sm text-slate-500 lg:text-right">
            New featured reads rotate daily from our growing library of Islam &amp; Quran guides.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <ArticleCard
              key={article.slug}
              article={article}
              badge={index === 0 ? 'New today' : undefined}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/articles"
            className="inline-flex items-center justify-center rounded-full bg-emerald-800 px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-950"
          >
            Read More Articles
          </Link>
        </div>
      </div>
    </section>
  );
}
