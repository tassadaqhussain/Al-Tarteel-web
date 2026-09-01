import Link from 'next/link';
import { ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import { getFeaturedLearningPlans } from '@/lib/learning-plans';
import { getSurahMeta, getSurahPath } from '@/lib/surah-meta';
import { PageSection } from '@/components/layout/MainContainer';

export function FeaturedLearningPlans() {
  const plans = getFeaturedLearningPlans(6);

  return (
    <PageSection id="learning-plans" className="bg-brand/[0.02]">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--accent)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            <GraduationCap className="h-3.5 w-3.5" aria-hidden />
            Structured study
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Featured Learning Plans
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
            Daily guided lessons for Al-Fatihah, Ya-Sin, Al-Kahf, Al-Mulk, Ar-Rahman, and more —
            each plan links back to the full surah reader.
          </p>
        </div>
        <Link
          href="/learning-plans"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:underline"
        >
          View all plans
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const surah = plan.surahNumber ? getSurahMeta(plan.surahNumber) : null;
          return (
            <article
              key={plan.slug}
              className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)]/40 hover:shadow-md"
            >
              <Link href={`/learning-plans/${plan.slug}`} className="flex flex-1 flex-col">
                <div
                  className={`relative flex h-32 items-end bg-slate-800 bg-gradient-to-br ${plan.imageTone} p-4`}
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.2),transparent_45%)]" />
                  <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-800">
                    {plan.days} days
                  </span>
                  <p className="relative line-clamp-2 text-sm font-semibold leading-snug text-white">
                    {plan.title}
                  </p>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">{plan.summary}</p>
                </div>
              </Link>
              {surah && (
                <div className="border-t border-line px-4 py-3">
                  <Link
                    href={getSurahPath(plan.surahNumber!)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:underline"
                  >
                    <BookOpen className="h-3.5 w-3.5" aria-hidden />
                    Read Surah {surah.nameSimple}
                  </Link>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/learning-plans"
          className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-bold text-brand-contrast shadow-md transition hover:bg-[var(--accent)]/90"
        >
          Explore all learning plans
        </Link>
      </div>
    </PageSection>
  );
}
