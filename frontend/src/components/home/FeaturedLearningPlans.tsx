import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getFeaturedLearningPlans } from '@/lib/learning-plans';
import { getSurahArabicName } from '@/lib/surah-meta';
import { PageSection } from '@/components/layout/MainContainer';
import { Msg } from '@/components/i18n/Msg';

const BAND_COLORS = ['#065F46', '#1E3A5F', '#6B4423'];

export function FeaturedLearningPlans() {
  const plans = getFeaturedLearningPlans(3);

  return (
    <PageSection id="learning-plans">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8A5E14] dark:text-amber-300">
            <Msg k="structuredStudy" />
          </p>
          <h2 className="mt-1 font-serif text-[26px] font-bold tracking-tight text-ink">
            <Msg k="learningPlans" />
          </h2>
        </div>
        <Link
          href="/learning-plans"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:underline"
        >
          <span><Msg k="viewAllPlans" /></span>
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, idx) => {
          const arabic = plan.surahNumber ? getSurahArabicName(plan.surahNumber) : 'القرآن';
          const bg = BAND_COLORS[idx % BAND_COLORS.length];

          return (
            <Link
              key={plan.slug}
              href={`/learning-plans/${plan.slug}`}
              className="group overflow-hidden rounded-2xl border border-line bg-surface shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-md"
            >
              <div
                className="relative flex h-32 items-center justify-center overflow-hidden px-5"
                style={{ backgroundColor: bg }}
              >
                <svg
                  viewBox="0 0 200 120"
                  className="pointer-events-none absolute inset-0 h-full w-full text-[#E8C97A]/40"
                  fill="none"
                  aria-hidden
                >
                  <circle cx="100" cy="60" r="46" stroke="currentColor" strokeWidth="1" />
                  <rect
                    x="68"
                    y="28"
                    width="64"
                    height="64"
                    transform="rotate(45 100 60)"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                  <rect x="68" y="28" width="64" height="64" stroke="currentColor" strokeWidth="1" />
                </svg>
                <span
                  className="relative font-arabic text-4xl font-bold text-white"
                  dir="rtl"
                  lang="ar"
                >
                  {arabic}
                </span>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#8A5E14] dark:text-amber-300">
                    {plan.days}-day plan
                  </p>
                  <span className="text-xs font-semibold text-[var(--accent)] opacity-80 transition group-hover:opacity-100">
                    Start →
                  </span>
                </div>
                <h3 className="mt-1.5 font-serif text-lg font-bold leading-snug text-ink group-hover:text-[var(--accent)]">
                  {plan.title}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </PageSection>
  );
}
