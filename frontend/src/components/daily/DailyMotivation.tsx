'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { quranApi } from '@/lib/api';
import { getSurahPath, getSurahMeta } from '@/lib/surah-meta';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { useDailyMotivationStore } from '@/stores/dailyMotivationStore';
import {
  suggestContinueSlug,
} from '@/lib/tajweed/motivation';
import { TAJWEED_LESSONS } from '@/lib/tajweed/rules';
import {
  getMasteryForSlug,
  useTajweedProgressStore,
} from '@/stores/tajweedProgressStore';
import {
  ayahOfTheDayRef,
  DAILY_GOAL_OPTIONS,
  getDailyMotivationMessage,
  localDateKey,
  tajweedOfTheDaySlug,
  type MotivationCategory,
  type MotivationLocale,
} from '@/lib/daily-motivation/messages';
import { SOFT_DAILY_GOAL } from '@/stores/dailyMotivationStore';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';

type Variant = 'full' | 'compact' | 'reader';

type Props = {
  variant?: Variant;
  className?: string;
  /** Show Ayah of the Day (fetched from canonical API). */
  showAyahOfDay?: boolean;
  showTajweedOfDay?: boolean;
  showGoalPicker?: boolean;
};

/**
 * Peaceful Daily Motivation card.
 * Priority for logged-in users:
 * unfinished reading → daily goal → tajweed in progress → general message
 */
export function DailyMotivation({
  variant = 'full',
  className,
  showAyahOfDay = true,
  showTajweedOfDay = true,
  showGoalPicker = false,
}: Props) {
  const { t } = useT();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const lastRead = useSettingsStore((s) => s.lastRead);
  const uiLocale = useSettingsStore((s) => s.uiLocale);
  const locale: MotivationLocale =
    uiLocale === 'ur' || uiLocale === 'ar' ? uiLocale : 'en';

  const timezone = useDailyMotivationStore((s) => s.timezone);
  const goal = useDailyMotivationStore((s) => s.goal);
  const progress = useDailyMotivationStore((s) => s.progress);
  const ensureToday = useDailyMotivationStore((s) => s.ensureToday);
  const setGoal = useDailyMotivationStore((s) => s.setGoal);
  const syncFromServer = useDailyMotivationStore((s) => s.syncFromServer);

  const tajweedStore = useTajweedProgressStore();
  const dateKey = localDateKey(timezone);

  const [ayahCard, setAyahCard] = useState<{
    surah: number;
    ayah: number;
    textUthmani: string;
    translation?: string;
    surahName: string;
  } | null>(null);

  useEffect(() => {
    ensureToday();
    if (isAuthenticated) void syncFromServer();
  }, [ensureToday, isAuthenticated, syncFromServer]);

  useEffect(() => {
    if (!showAyahOfDay || variant === 'reader') return;
    const ref = ayahOfTheDayRef(dateKey);
    let cancelled = false;
    (async () => {
      try {
        const [ayah, surah] = await Promise.all([
          quranApi.ayah(ref.surah, ref.ayah, { translations: 'en-sahih-international' }),
          quranApi.surah(ref.surah),
        ]);
        if (cancelled) return;
        setAyahCard({
          surah: ref.surah,
          ayah: ref.ayah,
          textUthmani: ayah.textUthmani,
          translation: ayah.translations?.[0]?.text,
          surahName: surah.nameSimple,
        });
      } catch {
        // try Al-Fatihah 1 as safe verified fallback
        try {
          const ayah = await quranApi.ayah(1, 1, { translations: 'en-sahih-international' });
          if (cancelled) return;
          setAyahCard({
            surah: 1,
            ayah: 1,
            textUthmani: ayah.textUthmani,
            translation: ayah.translations?.[0]?.text,
            surahName: 'Al-Fatihah',
          });
        } catch {
          /* no ayah card */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dateKey, showAyahOfDay, variant]);

  const masteryMap = useMemo(
    () =>
      Object.fromEntries(
        TAJWEED_LESSONS.map((l) => [l.slug, getMasteryForSlug(tajweedStore, l.slug)]),
      ),
    [tajweedStore],
  );

  const continueTajweed = suggestContinueSlug(masteryMap as Parameters<typeof suggestContinueSlug>[0]);
  const tajweedInProgress = TAJWEED_LESSONS.some((l) => {
    const m = masteryMap[l.slug as keyof typeof masteryMap];
    return m === 'learning' || m === 'practicing';
  });

  type Priority =
    | { kind: 'continue_reading' }
    | { kind: 'daily_goal' }
    | { kind: 'tajweed' }
    | { kind: 'general'; category?: MotivationCategory };

  const priority: Priority = (() => {
    if (lastRead) return { kind: 'continue_reading' };
    if (goal && !progress.goalCompleted) return { kind: 'daily_goal' };
    if (isAuthenticated && tajweedInProgress) return { kind: 'tajweed' };
    if (isAuthenticated) return { kind: 'general', category: 'RETURNING_USER' };
    return { kind: 'general' };
  })();

  const motivation = getDailyMotivationMessage(
    dateKey,
    locale,
    priority.kind === 'general' ? priority.category : priority.kind === 'tajweed' ? 'TAJWEED' : 'READING',
  );

  const primaryMessage =
    priority.kind === 'continue_reading'
      ? t('continueJourneyMsg')
      : priority.kind === 'tajweed'
        ? t('oneFocusedRuleMsg')
        : motivation.displayText;

  const tjSlug = tajweedOfTheDaySlug(dateKey);
  const tjLesson = TAJWEED_LESSONS.find((l) => l.slug === (tajweedInProgress ? continueTajweed : tjSlug));

  const displayGoal = goal ?? SOFT_DAILY_GOAL;
  const goalIsSoft = !goal;
  const goalTarget = displayGoal.goalValue;
  const goalCurrent =
    displayGoal.goalType === 'read_minutes'
      ? progress.minutesRead
      : displayGoal.goalType === 'tajweed_rule'
        ? progress.tajweedPracticed
          ? 1
          : 0
        : progress.ayahsRead;
  const goalPct = Math.min(100, Math.round((Number(goalCurrent) / Math.max(1, goalTarget)) * 100));
  const goalComplete = goal
    ? progress.goalCompleted
    : goalCurrent >= goalTarget;

  const continueHref = lastRead
    ? getSurahPath(lastRead.surahNumber)
    : getSurahPath(2);
  const continueLabel = lastRead
    ? `${getSurahMeta(lastRead.surahNumber, lastRead.surahName).nameSimple} — ${lastRead.surahNumber}:${lastRead.ayahNumber}`
    : t('startWithAlBaqarah');

  if (variant === 'reader') {
    if (goalComplete || (!goal && goalCurrent === 0)) return null;
    return (
      <div
        className={cn(
          'mx-auto mb-3 flex max-w-4xl items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm',
          className,
        )}
      >
        <p className="min-w-0 truncate text-slate-600">
          {goalIsSoft ? t('suggestedToday') : t('todaysGoal')} · {goalCurrent}/{goalTarget}
        </p>
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-[var(--accent)]" style={{ width: `${goalPct}%` }} />
        </div>
      </div>
    );
  }

  return (
    <section className={cn('w-full', className)}>
      <div
        className={cn(
          'rounded-2xl border border-slate-200 bg-white shadow-sm',
          variant === 'compact' ? 'px-4 py-4' : 'px-5 py-6 sm:px-7 sm:py-7',
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
          {t('todaysMotivation')}
        </p>
        <p className="mt-2 text-base leading-relaxed text-slate-700 sm:text-lg">
          “{primaryMessage}”
        </p>
        <p className="mt-1 text-[11px] text-slate-400">{t('motivationDisclaimer')}</p>

        {/* Primary CTA */}
        <div className="mt-5 rounded-xl bg-slate-50 px-4 py-4">
          {priority.kind === 'continue_reading' || lastRead ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t('continueReading')}
              </p>
              <p className="mt-1 font-semibold text-slate-900">{continueLabel}</p>
              <Link
                href={continueHref}
                className="mt-3 inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white hover:opacity-90"
              >
                {t('continueReading')}
              </Link>
            </>
          ) : priority.kind === 'tajweed' && tjLesson ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t('continueTajweed')}
              </p>
              <p className="mt-1 font-semibold text-slate-900">{tjLesson.name}</p>
              <Link
                href={`/tajweed/${tjLesson.slug}`}
                className="mt-3 inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white hover:opacity-90"
              >
                {t('continueTajweed')}
              </Link>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t('todaysGoal')}
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {DAILY_GOAL_OPTIONS.find(
                  (o) => o.type === displayGoal.goalType && o.value === displayGoal.goalValue,
                )?.label[locale] || t('readNAyahs').replace('{n}', String(displayGoal.goalValue))}
              </p>
              <Link
                href={continueHref}
                className="mt-3 inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white hover:opacity-90"
              >
                {t('startReading')}
              </Link>
            </>
          )}
        </div>

        {/* Goal progress — soft local suggestion until a goal is confirmed */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">
              {goalComplete
                ? t('todaysGoalDone')
                : goalIsSoft
                  ? t('suggestedToday')
                  : t('todaysGoal')}
            </span>
            <span className="text-slate-500">
              {goalCurrent} / {goalTarget}
              {displayGoal.goalType === 'read_minutes'
                ? t('unitMin')
                : displayGoal.goalType.includes('ayah') ||
                    displayGoal.goalType === 'read_ayahs' ||
                    displayGoal.goalType === 'read_page'
                  ? t('unitAyahs')
                  : ''}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${goalPct}%` }} />
          </div>
          {goalComplete && (
            <p className="mt-2 text-sm text-slate-600">{t('goalCompleteBody')}</p>
          )}
          {goalIsSoft && isAuthenticated && (
            <p className="mt-2 text-xs text-slate-400">{t('optionalDailyGoalHint')}</p>
          )}
        </div>

        {showGoalPicker && isAuthenticated && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t('chooseDailyGoal')}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {DAILY_GOAL_OPTIONS.map((opt) => {
                const active = goal?.goalType === opt.type && goal.goalValue === opt.value;
                return (
                  <button
                    key={`${opt.type}-${opt.value}`}
                    type="button"
                    onClick={() => setGoal({ goalType: opt.type, goalValue: opt.value })}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                      active
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                        : 'border-slate-200 text-slate-600 hover:border-[var(--accent)]',
                    )}
                  >
                    {opt.label[locale]}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {variant === 'full' && showAyahOfDay && ayahCard && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            {t('ayahOfTheDay')}
          </p>
          <p
            className="mt-4 text-center font-arabic text-2xl leading-loose text-slate-900"
            dir="rtl"
            lang="ar"
            translate="no"
          >
            {ayahCard.textUthmani}
          </p>
          {ayahCard.translation && (
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-slate-600">
              {ayahCard.translation}
            </p>
          )}
          <p className="mt-3 text-center text-sm font-medium text-slate-500">
            {ayahCard.surahName} · {ayahCard.surah}:{ayahCard.ayah}
          </p>
          <div className="mt-4 flex justify-center">
            <Link
              href={getSurahPath(ayahCard.surah)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:border-[var(--accent)]"
            >
              {t('readInQuran')}
            </Link>
          </div>
        </div>
      )}

      {variant === 'full' && showTajweedOfDay && tjLesson && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            {t('todaysTajweed')}
          </p>
          <p className="mt-2 text-lg font-bold text-slate-900">{tjLesson.name}</p>
          <p className="mt-1 text-sm text-slate-600">{t('listenTajweedHint')}</p>
          <Link
            href={`/tajweed/${tjLesson.slug}`}
            className="mt-3 inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white hover:opacity-90"
          >
            {t('learnNamed').replace('{name}', tjLesson.name)}
          </Link>
        </div>
      )}
    </section>
  );
}
