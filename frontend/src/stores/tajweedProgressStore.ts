'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TajweedLessonSlug } from '@/lib/tajweed/rules';
import { TAJWEED_LESSONS } from '@/lib/tajweed/rules';
import {
  computeConsistencyDays,
  dayKey,
  masteryFromProgress,
  type TajweedMastery,
} from '@/lib/tajweed/motivation';

export type TajweedActivity = {
  slug: TajweedLessonSlug;
  action: 'opened' | 'checkpoint' | 'practiced' | 'completed' | 'reviewed';
  at: number;
};

type ProgressMap = Partial<Record<TajweedLessonSlug, number>>;
type MasteryMap = Partial<Record<TajweedLessonSlug, TajweedMastery>>;

type TajweedProgressState = {
  completed: TajweedLessonSlug[];
  progress: ProgressMap;
  mastery: MasteryMap;
  /** ISO date keys YYYY-MM-DD */
  activeDays: string[];
  lastActiveAt: number | null;
  examplesPracticed: number;
  activity: TajweedActivity[];
  /** Lesson session UI step 0=start, 1–3=content checkpoints, 4=complete */
  sessionStep: Partial<Record<TajweedLessonSlug, number>>;

  markOpened: (slug: TajweedLessonSlug) => void;
  markStudied: (slug: TajweedLessonSlug, percent?: number) => void;
  markCheckpoint: (slug: TajweedLessonSlug, percent: number) => void;
  markPracticed: (slug: TajweedLessonSlug, exampleCount?: number) => void;
  markComplete: (slug: TajweedLessonSlug) => void;
  markReviewed: (slug: TajweedLessonSlug) => void;
  setSessionStep: (slug: TajweedLessonSlug, step: number) => void;
  reset: () => void;
};

function touchDay(state: Pick<TajweedProgressState, 'activeDays' | 'lastActiveAt'>) {
  const today = dayKey();
  const activeDays = state.activeDays.includes(today)
    ? state.activeDays
    : [...state.activeDays.slice(-60), today];
  return { activeDays, lastActiveAt: Date.now() };
}

function pushActivity(
  activity: TajweedActivity[],
  item: TajweedActivity,
): TajweedActivity[] {
  return [item, ...activity].slice(0, 40);
}

export const useTajweedProgressStore = create<TajweedProgressState>()(
  persist(
    (set, get) => ({
      completed: [],
      progress: {},
      mastery: {},
      activeDays: [],
      lastActiveAt: null,
      examplesPracticed: 0,
      activity: [],
      sessionStep: {},

      markOpened: (slug) => {
        const day = touchDay(get());
        const percent = Math.max(get().progress[slug] ?? 0, 10);
        const mastery = { ...get().mastery };
        if (!mastery[slug] || mastery[slug] === 'not_started') mastery[slug] = 'learning';
        set({
          ...day,
          progress: { ...get().progress, [slug]: percent },
          mastery,
          activity: pushActivity(get().activity, {
            slug,
            action: 'opened',
            at: Date.now(),
          }),
        });
      },

      markStudied: (slug, percent = 30) => {
        const day = touchDay(get());
        const current = get().progress[slug] ?? 0;
        const next = Math.min(99, Math.max(current, percent));
        const mastery = {
          ...get().mastery,
          [slug]: masteryFromProgress(next, get().completed.includes(slug)),
        };
        set({
          ...day,
          progress: { ...get().progress, [slug]: next },
          mastery,
        });
      },

      markCheckpoint: (slug, percent) => {
        get().markStudied(slug, percent);
        set({
          activity: pushActivity(get().activity, {
            slug,
            action: 'checkpoint',
            at: Date.now(),
          }),
        });
      },

      markPracticed: (slug, exampleCount = 1) => {
        const day = touchDay(get());
        const next = Math.min(99, Math.max(get().progress[slug] ?? 0, 70));
        set({
          ...day,
          progress: { ...get().progress, [slug]: next },
          mastery: {
            ...get().mastery,
            [slug]: get().completed.includes(slug) ? 'reviewed' : 'practicing',
          },
          examplesPracticed: get().examplesPracticed + Math.max(1, exampleCount),
          activity: pushActivity(get().activity, {
            slug,
            action: 'practiced',
            at: Date.now(),
          }),
        });
        // Fire-and-forget daily goal credit (lazy import avoids cycles)
        void import('@/stores/dailyMotivationStore').then(({ useDailyMotivationStore }) => {
          useDailyMotivationStore.getState().markTajweedPracticed();
        });
      },

      markComplete: (slug) => {
        const day = touchDay(get());
        const completed = new Set(get().completed);
        completed.add(slug);
        set({
          ...day,
          completed: [...completed],
          progress: { ...get().progress, [slug]: 100 },
          mastery: { ...get().mastery, [slug]: 'reviewed' },
          sessionStep: { ...get().sessionStep, [slug]: 4 },
          activity: pushActivity(get().activity, {
            slug,
            action: 'completed',
            at: Date.now(),
          }),
        });
      },

      markReviewed: (slug) => {
        const day = touchDay(get());
        set({
          ...day,
          mastery: { ...get().mastery, [slug]: 'reviewed' },
          progress: {
            ...get().progress,
            [slug]: Math.max(get().progress[slug] ?? 0, 100),
          },
          completed: get().completed.includes(slug)
            ? get().completed
            : [...get().completed, slug],
          activity: pushActivity(get().activity, {
            slug,
            action: 'reviewed',
            at: Date.now(),
          }),
        });
      },

      setSessionStep: (slug, step) => {
        set({ sessionStep: { ...get().sessionStep, [slug]: step } });
      },

      reset: () =>
        set({
          completed: [],
          progress: {},
          mastery: {},
          activeDays: [],
          lastActiveAt: null,
          examplesPracticed: 0,
          activity: [],
          sessionStep: {},
        }),
    }),
    { name: 'qp-tajweed-progress-v2' },
  ),
);

export function tajweedOverallPercent(
  state: Pick<TajweedProgressState, 'progress' | 'completed'>,
): number {
  if (!TAJWEED_LESSONS.length) return 0;
  const sum = TAJWEED_LESSONS.reduce((acc, lesson) => {
    if (state.completed.includes(lesson.slug)) return acc + 100;
    return acc + (state.progress[lesson.slug] ?? 0);
  }, 0);
  return Math.round(sum / TAJWEED_LESSONS.length);
}

export function getMasteryForSlug(
  state: Pick<TajweedProgressState, 'mastery' | 'progress' | 'completed'>,
  slug: TajweedLessonSlug,
): TajweedMastery {
  if (state.mastery[slug]) return state.mastery[slug]!;
  return masteryFromProgress(state.progress[slug] ?? 0, state.completed.includes(slug));
}

export function consistencyDays(
  state: Pick<TajweedProgressState, 'activeDays'>,
): number {
  return computeConsistencyDays(state.activeDays);
}

export function weeklyStats(state: TajweedProgressState) {
  const weekAgo = Date.now() - 7 * 86_400_000;
  const recent = state.activity.filter((a) => a.at >= weekAgo);
  const lessonsCompleted = new Set(
    recent.filter((a) => a.action === 'completed').map((a) => a.slug),
  ).size;
  const rulesReviewed = new Set(
    recent.filter((a) => a.action === 'reviewed' || a.action === 'completed').map((a) => a.slug),
  ).size;
  const examples = recent.filter((a) => a.action === 'practiced').length;
  const learningDays = new Set(
    recent.map((a) => dayKey(new Date(a.at))),
  ).size;

  const counts: Partial<Record<TajweedLessonSlug, number>> = {};
  for (const a of recent) {
    counts[a.slug] = (counts[a.slug] ?? 0) + 1;
  }
  const ranked = Object.entries(counts).sort((a, b) => (b[1] as number) - (a[1] as number));
  const enoughData = recent.length >= 4;
  const strongest = enoughData ? (ranked[0]?.[0] as TajweedLessonSlug | undefined) : undefined;
  const continueSlug =
    TAJWEED_LESSONS.find((l) => getMasteryForSlug(state, l.slug) !== 'reviewed')?.slug ??
    TAJWEED_LESSONS[0].slug;

  return {
    lessonsCompleted,
    rulesReviewed,
    examplesPracticed: Math.max(examples, 0),
    learningDays,
    strongest,
    continueSlug,
    enoughData,
  };
}

export function isReturningAfterInactivity(
  lastActiveAt: number | null,
  days = 7,
): boolean {
  if (!lastActiveAt) return false;
  return Date.now() - lastActiveAt > days * 86_400_000;
}
