import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { LEARNING_PLANS } from '@/lib/learning-plans';
import { BookOpen } from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

export const metadata: Metadata = buildPageMetadata({
  title: 'Quran Learning Plans | QuranPilot',
  description:
    'Free guided Quran learning plans — short daily lessons to understand surahs, deepen reflection, and stay consistent with the Holy Quran.',
  path: '/learning-plans',
  keywords: ['Quran learning', 'Quran study plan', 'learn Al-Fatihah', 'Islamic education'],
});

export default function LearningPlansPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-app text-ink">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:py-14">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Learning Plans', path: '/learning-plans' },
          ]}
        />
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Learning Plans
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg">
            Boost your knowledge with easy-to-follow lessons that keep you growing in your journey
            with the Quran. Start a Learning Plan today! Your progress is tracked until you reach
            the finish line.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LEARNING_PLANS.map((plan) => (
            <Link
              key={plan.slug}
              href={`/learning-plans/${plan.slug}`}
              className="group overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)]/50 hover:shadow-md"
            >
              <div
                className={`relative flex h-36 items-end bg-slate-800 bg-gradient-to-br ${plan.imageTone} p-4`}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.22),transparent_45%)]" />
                {plan.featured && (
                  <span className="absolute right-3 top-3 rounded-full bg-sky-200 px-2 py-0.5 text-[11px] font-semibold text-sky-900">
                    Featured
                  </span>
                )}
                <p className="relative line-clamp-3 text-sm font-semibold leading-snug text-white">
                  {plan.title}
                </p>
              </div>
              <div className="p-4">
                <p className="line-clamp-2 text-sm text-ink-muted">{plan.summary}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                  {plan.days}-day plan
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
