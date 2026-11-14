import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Header } from '@/components/Header';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { LearningPlanTracker } from '@/components/learning/LearningPlanTracker';
import {
  LEARNING_PLANS,
  getLearningPlan,
  getLearningPlansForSurah,
  getPlanHref,
} from '@/lib/learning-plans';
import { getSurahMeta, getSurahPath } from '@/lib/surah-meta';
import { buildPageMetadata, learningPlanJsonLd } from '@/lib/seo';

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = 'force-static';
export const revalidate = 86400;

export function generateStaticParams() {
  return LEARNING_PLANS.map((plan) => ({ slug: plan.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const plan = getLearningPlan(slug);
  if (!plan) return { title: 'Learning Plan | QuranPilot' };

  return buildPageMetadata({
    title: `${plan.title} – Quran Learning Plan | QuranPilot`,
    description: plan.summary,
    path: `/learning-plans/${plan.slug}`,
    keywords: [plan.title, 'Quran learning plan', 'Quran study schedule', 'Islamic learning'],
    type: 'article',
  });
}

export default async function LearningPlanDetailPage({ params }: Props) {
  const { slug } = await params;
  const plan = getLearningPlan(slug);

  if (!plan) {
    notFound();
  }

  const readerHref = getPlanHref(plan);
  const surahMeta = plan.surahNumber ? getSurahMeta(plan.surahNumber) : null;
  const relatedPlans = plan.surahNumber
    ? getLearningPlansForSurah(plan.surahNumber).filter((p) => p.slug !== plan.slug)
    : [];

  const schema = learningPlanJsonLd({
    title: plan.title,
    summary: plan.summary,
    slug: plan.slug,
    days: plan.days,
  });

  return (
    <div className="min-h-screen bg-surface-app text-ink">
      <JsonLd data={schema} />
      <Header />

      <div className={`bg-slate-800 bg-gradient-to-br ${plan.imageTone}`}>
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          <Link
            href="/learning-plans"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/25"
          >
            <ArrowLeft className="h-4 w-4" />
            Learning Plans
          </Link>
          <h1 className="text-2xl font-bold leading-snug text-white sm:text-3xl">{plan.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
            {plan.summary}
          </p>

          <LearningPlanTracker plan={plan} readerHref={readerHref} />
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Learning Plans', path: '/learning-plans' },
            { name: plan.title, path: `/learning-plans/${plan.slug}` },
          ]}
        />

        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href={readerHref}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-brand-contrast transition hover:bg-[var(--accent)]/90"
          >
            <BookOpen className="h-4 w-4" />
            {surahMeta ? `Read Surah ${surahMeta.nameSimple}` : 'Open related reading'}
          </Link>
          {surahMeta && (
            <Link
              href={getSurahPath(plan.surahNumber!)}
              className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition hover:border-[var(--accent)]"
            >
              Full surah reader · {surahMeta.nameArabic}
            </Link>
          )}
        </div>

        {relatedPlans.length > 0 && surahMeta && (
          <aside className="mb-8 rounded-2xl border border-line bg-surface-2 p-4">
            <h2 className="text-sm font-semibold text-ink">More plans for Surah {surahMeta.nameSimple}</h2>
            <ul className="mt-3 space-y-2">
              {relatedPlans.map((related) => (
                <li key={related.slug}>
                  <Link
                    href={`/learning-plans/${related.slug}`}
                    className="text-sm font-medium text-[var(--accent)] hover:underline"
                  >
                    {related.title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </main>
    </div>
  );
}
