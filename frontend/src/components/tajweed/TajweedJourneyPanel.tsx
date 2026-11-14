'use client';

import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import {
  getMotivation,
  MASTERY_LABELS,
  suggestContinueSlug,
} from '@/lib/tajweed/motivation';
import {
  TAJWEED_LESSONS,
  getTajweedLesson,
  getTajweedRule,
} from '@/lib/tajweed/rules';
import {
  consistencyDays,
  getMasteryForSlug,
  isReturningAfterInactivity,
  tajweedOverallPercent,
  useTajweedProgressStore,
  weeklyStats,
} from '@/stores/tajweedProgressStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

type Props = {
  /** Show daily / weekly cards (intended for signed-in experience). */
  showPersonal?: boolean;
};

export function TajweedJourneyPanel({ showPersonal = false }: Props) {
  const store = useTajweedProgressStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const personal = showPersonal || isAuthenticated;

  const overall = tajweedOverallPercent(store);
  const masteryMap = Object.fromEntries(
    TAJWEED_LESSONS.map((l) => [l.slug, getMasteryForSlug(store, l.slug)]),
  ) as Parameters<typeof suggestContinueSlug>[0];

  const continueSlug = suggestContinueSlug(masteryMap);
  const continueLesson = getTajweedLesson(continueSlug)!;
  const reviewed = TAJWEED_LESSONS.filter((l) => getMasteryForSlug(store, l.slug) === 'reviewed').length;
  const practicing = TAJWEED_LESSONS.filter((l) => getMasteryForSlug(store, l.slug) === 'practicing').length;
  const learning = TAJWEED_LESSONS.filter((l) => getMasteryForSlug(store, l.slug) === 'learning').length;
  const studied = reviewed + practicing + learning;
  const days = consistencyDays(store);
  const week = weeklyStats(store);
  const inactive = isReturningAfterInactivity(store.lastActiveAt);
  const firstDone = store.completed.length === 1;
  const returning = !!store.lastActiveAt && store.activity.length > 0;

  let welcome = getMotivation({ state: 'daily_continue' });
  if (inactive) welcome = getMotivation({ state: 'welcome_back_inactive' });
  else if (firstDone) welcome = getMotivation({ state: 'first_lesson' });
  else if (returning) welcome = getMotivation({ state: 'returning_user' });
  else if (reviewed >= 4) {
    welcome = getMotivation({ state: 'weekly_progress', reviewedCount: reviewed });
  }

  const recent = store.activity.slice(0, 5);

  return (
    <section className="space-y-4">
      {personal && (
        <div className="rounded-xl border border-line bg-surface p-5">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-ink">Current lesson</h2>
            {days > 1 && (
              <span className="text-xs text-ink-muted">
                {days} day{days === 1 ? '' : 's'} active
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-4 border-t border-line-subtle pt-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-base font-bold text-ink">{continueLesson.name}</p>
                <span className="font-arabic text-base text-ink-muted" dir="rtl" lang="ar">
                  {continueLesson.nameArabic}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-ink-muted">
                {MASTERY_LABELS[masteryMap[continueSlug] ?? 'not_started']}
              </p>
            </div>

            <Link
              href={`/tajweed/${continueSlug}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-brand-contrast transition hover:opacity-90"
            >
              <span>Continue</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-ink-muted">
            {welcome}
          </p>
        </div>
      )}

      <div className="rounded-xl border border-line bg-surface p-5">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">Your progress</h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              {studied} of {TAJWEED_LESSONS.length} lessons started · {reviewed} reviewed
            </p>
          </div>
          <span className="text-lg font-bold tabular-nums text-ink">
            {overall}%
          </span>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
            style={{ width: `${overall}%` }}
          />
        </div>

        <ul className="mt-4 divide-y divide-line-subtle border-t border-line-subtle">
          {TAJWEED_LESSONS.map((lesson) => {
            const mastery = getMasteryForSlug(store, lesson.slug);
            const ruleColor = getTajweedRule(lesson.relatedRuleIds[0])?.color ?? '#059669';

            return (
              <li key={lesson.slug}>
                <Link
                  href={`/tajweed/${lesson.slug}`}
                  className="group flex items-center justify-between gap-3 py-2.5 text-sm transition hover:text-[var(--accent)]"
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: ruleColor }}
                      aria-hidden
                    />
                    <span className="truncate font-medium text-ink group-hover:text-[var(--accent)]">
                      {lesson.name}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'inline-flex shrink-0 items-center gap-1 text-xs',
                      mastery === 'reviewed' ? 'font-semibold text-brand' : 'text-ink-muted',
                    )}
                  >
                    {mastery === 'reviewed' ? (
                      <>
                        <Check className="h-3.5 w-3.5" aria-hidden />
                        Reviewed
                      </>
                    ) : (
                      MASTERY_LABELS[mastery]
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {personal && week.enoughData && (
        <div className="rounded-xl border border-line bg-surface p-5">
          <h3 className="text-sm font-semibold text-ink">This week</h3>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-ink-muted">Completed</dt>
              <dd className="mt-0.5 text-sm font-bold text-ink">{week.lessonsCompleted}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Reviewed</dt>
              <dd className="mt-0.5 text-sm font-bold text-ink">{week.rulesReviewed}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Practiced</dt>
              <dd className="mt-0.5 text-sm font-bold text-ink">{week.examplesPracticed}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Days active</dt>
              <dd className="mt-0.5 text-sm font-bold text-ink">{week.learningDays}</dd>
            </div>
          </dl>
        </div>
      )}

      {recent.length > 0 && (
        <div className="rounded-xl border border-line bg-surface p-5">
          <h3 className="text-sm font-semibold text-ink">Recent activity</h3>
          <ul className="mt-3 divide-y divide-line-subtle text-xs">
            {recent.map((item, i) => (
              <li key={`${item.at}-${i}`} className="flex items-center justify-between py-2">
                <span className="font-medium text-ink">
                  {getTajweedLesson(item.slug)?.name}
                </span>
                <span className="text-ink-muted">
                  {item.action === 'completed' || item.action === 'reviewed'
                    ? 'Reviewed'
                    : item.action === 'practiced'
                      ? 'Practiced'
                      : item.action === 'checkpoint'
                        ? 'In progress'
                        : 'Opened'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
