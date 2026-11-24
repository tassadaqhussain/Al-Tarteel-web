import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { getLearningPlansForSurah } from '@/lib/learning-plans';
import { DEFAULT_CONTENT_LOCALE, type ContentLocale } from '@/lib/i18n/content-locales';
import { surahLearningPlansCopy } from '@/lib/i18n/surah-ui-strings';

interface Props {
  surahNumber: number;
  surahName: string;
  locale?: ContentLocale;
}

/** Crawlable internal links from a surah reader page into relevant learning plans. */
export function SurahLearningPlans({
  surahNumber,
  surahName,
  locale = DEFAULT_CONTENT_LOCALE,
}: Props) {
  const plans = getLearningPlansForSurah(surahNumber);
  if (plans.length === 0) return null;

  const copy = surahLearningPlansCopy(locale, surahNumber, surahName);

  return (
    <section
      aria-label={copy.heading}
      className="mt-10 rounded-xl border border-line bg-surface p-6"
    >
      <div className="flex items-start gap-3">
        <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-ink">{copy.heading}</h2>
          <p className="mt-1 text-sm leading-6 text-ink-3">{copy.subtitle}</p>
          <ul className="mt-4 space-y-2">
            {plans.map((plan) => (
              <li key={plan.slug}>
                <Link
                  href={`/learning-plans/${plan.slug}`}
                  className="group block rounded-lg border border-line px-4 py-3 transition hover:border-[var(--accent)] hover:bg-surface-2"
                >
                  <span className="font-medium text-ink group-hover:text-[var(--accent)]">
                    {plan.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-3">
                    {copy.daysLabel(plan.days)} · {plan.summary}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/learning-plans"
            className="mt-4 inline-block text-sm font-medium text-[var(--accent)] hover:underline"
          >
            {copy.browseAll}
          </Link>
        </div>
      </div>
    </section>
  );
}
