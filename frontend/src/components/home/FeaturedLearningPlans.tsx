import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { getFeaturedLearningPlans } from '@/lib/learning-plans';
import { getSurahArabicName, getSurahMeta, getSurahPath } from '@/lib/surah-meta';
import { Msg } from '@/components/i18n/Msg';
import { PageSection } from '@/components/layout/MainContainer';

export function FeaturedLearningPlans() {
  const plans = getFeaturedLearningPlans(6);

  return (
    <PageSection id="learning-plans">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
            <Msg k="featuredPlans" />
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-muted">
            <Msg k="featuredPlansBody" />
          </p>
        </div>
        <Link
          href="/learning-plans"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:underline"
        >
          <Msg k="viewAllPlans" />
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const surah = plan.surahNumber ? getSurahMeta(plan.surahNumber) : null;
          const arabic = plan.surahNumber ? getSurahArabicName(plan.surahNumber) : null;

          return (
            <article
              key={plan.slug}
              className="group flex flex-col justify-between rounded-xl border border-line bg-surface p-5 transition hover:border-[var(--accent)]/60"
            >
              <Link href={`/learning-plans/${plan.slug}`} className="flex flex-1 flex-col">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-medium text-ink-muted">
                    {surah ? `Surah ${surah.nameSimple} · ` : ''}
                    <Msg k="nDays" vars={{ n: plan.days }} />
                  </span>
                  {arabic && (
                    <span
                      className="font-arabic text-xl leading-none text-ink"
                      dir="rtl"
                      lang="ar"
                    >
                      {arabic}
                    </span>
                  )}
                </div>

                <h3 className="mt-2.5 text-base font-bold leading-snug text-ink group-hover:text-[var(--accent)]">
                  {plan.title}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-3">
                  {plan.summary}
                </p>
              </Link>

              <div className="mt-4 flex items-center justify-between border-t border-line-subtle pt-3 text-xs">
                {surah ? (
                  <Link
                    href={getSurahPath(plan.surahNumber!)}
                    className="inline-flex items-center gap-1.5 font-medium text-ink-muted transition hover:text-[var(--accent)]"
                  >
                    <BookOpen className="h-3.5 w-3.5" aria-hidden />
                    <Msg k="readSurahName" vars={{ name: surah.nameSimple }} />
                  </Link>
                ) : (
                  <span />
                )}
                <Link
                  href={`/learning-plans/${plan.slug}`}
                  className="inline-flex items-center gap-1 font-semibold text-[var(--accent)]"
                >
                  <span>Start plan</span>
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </PageSection>
  );
}
