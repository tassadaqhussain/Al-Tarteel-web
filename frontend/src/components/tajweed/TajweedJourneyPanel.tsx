'use client';

import Link from 'next/link';
import {
  getMotivation,
  MASTERY_LABELS,
  suggestContinueSlug,
} from '@/lib/tajweed/motivation';
import { TAJWEED_LESSONS, getTajweedLesson } from '@/lib/tajweed/rules';
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
        <div className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            Today&apos;s Learning
          </p>
          <p className="mt-2 text-sm text-ink-3">{welcome}</p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-ink">Continue Tajweed</p>
              <p className="text-sm text-ink-3">
                {continueLesson.name} · {MASTERY_LABELS[masteryMap[continueSlug] ?? 'not_started']}
              </p>
            </div>
            <Link
              href={`/tajweed/${continueSlug}`}
              className="rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-brand-contrast hover:opacity-90"
            >
              Continue
            </Link>
          </div>
          {days > 1 && (
            <p className="mt-4 text-xs text-ink-muted">
              Learning consistency · {days} day{days === 1 ? '' : 's'}
              <span className="mt-0.5 block text-ink-faint">
                {days} day{days === 1 ? '' : 's'} of consistent learning.
              </span>
            </p>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Tajweed Journey</h2>
            <p className="text-sm text-ink-muted">
              Progress uses calm mastery states — not scores or competitions.
            </p>
          </div>
          <p className="text-2xl font-bold text-[var(--accent)]">{overall}%</p>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all"
            style={{ width: `${overall}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-ink-3">
          {studied} rules studied · {reviewed} reviewed · {practicing} practicing
          {learning ? ` · ${learning} learning` : ''}
        </p>

        <ul className="mt-5 space-y-2">
          {TAJWEED_LESSONS.map((lesson) => {
            const mastery = getMasteryForSlug(store, lesson.slug);
            const pct = store.completed.includes(lesson.slug)
              ? 100
              : store.progress[lesson.slug] ?? 0;
            return (
              <li key={lesson.slug}>
                <Link
                  href={`/tajweed/${lesson.slug}`}
                  className="flex items-center gap-3 rounded-xl px-1 py-1.5 hover:bg-surface-2"
                >
                  <span className="w-24 shrink-0 text-sm font-medium text-ink">
                    {lesson.name}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      'w-[5.5rem] text-right text-xs font-semibold',
                      mastery === 'reviewed' ? 'text-brand' : 'text-ink-muted',
                    )}
                  >
                    {mastery === 'reviewed' ? 'Reviewed ✓' : MASTERY_LABELS[mastery]}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-5">
          <Link
            href={`/tajweed/${continueSlug}`}
            className="text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            Continue Learning · {continueLesson.name} →
          </Link>
        </div>
      </div>

      {personal && week.enoughData && (
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h3 className="text-base font-bold text-ink">This week</h3>
          <p className="mt-1 text-sm text-ink-3">
            {getMotivation({ state: 'weekly_progress', reviewedCount: week.rulesReviewed })}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-ink-muted">Lessons completed</dt>
              <dd className="font-semibold text-ink">{week.lessonsCompleted}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Rules reviewed</dt>
              <dd className="font-semibold text-ink">{week.rulesReviewed}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Practice visits</dt>
              <dd className="font-semibold text-ink">{week.examplesPracticed}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Learning days</dt>
              <dd className="font-semibold text-ink">{week.learningDays}</dd>
            </div>
          </dl>
          {week.strongest && (
            <p className="mt-3 text-sm text-ink-3">
              Most revisited:{' '}
              <span className="font-semibold text-ink">
                {getTajweedLesson(week.strongest)?.name}
              </span>
            </p>
          )}
          <p className="mt-1 text-sm text-ink-3">
            Continue practicing:{' '}
            <Link
              href={`/tajweed/${week.continueSlug}`}
              className="font-semibold text-[var(--accent)] hover:underline"
            >
              {getTajweedLesson(week.continueSlug)?.name}
            </Link>
          </p>
        </div>
      )}

      {recent.length > 0 && (
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h3 className="text-base font-bold text-ink">Recent activity</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-3">
            {recent.map((item, i) => (
              <li key={`${item.at}-${i}`}>
                <span className="font-medium text-ink">
                  {getTajweedLesson(item.slug)?.name}
                </span>
                {' — '}
                {item.action === 'completed' || item.action === 'reviewed'
                  ? 'Reviewed'
                  : item.action === 'practiced'
                    ? 'Practiced'
                    : item.action === 'checkpoint'
                      ? 'In progress'
                      : 'Opened'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
