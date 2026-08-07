'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyGoalType } from '@/lib/daily-motivation/messages';
import { localDateKey } from '@/lib/daily-motivation/messages';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

function canSyncToServer(): boolean {
  return Boolean(useAuthStore.getState().isAuthenticated);
}

type DailyProgressLocal = {
  date: string;
  ayahsRead: number;
  minutesRead: number;
  tajweedPracticed: boolean;
  goalCompleted: boolean;
  /** Ayah keys already counted today: `${surah}:${ayah}` */
  countedAyahKeys: string[];
};

type DailyGoalLocal = {
  goalType: DailyGoalType;
  goalValue: number;
} | null;

type State = {
  timezone: string;
  goal: DailyGoalLocal;
  progress: DailyProgressLocal;
  /** Opt-in reminder (local until synced). Default false. */
  reminderEnabled: boolean;
  reminderSlot: 'morning' | 'afternoon' | 'evening' | 'custom' | null;
  setTimezone: (tz: string) => void;
  setGoal: (goal: DailyGoalLocal) => void;
  clearGoal: () => void;
  ensureToday: () => void;
  recordAyahView: (surah: number, ayah: number) => void;
  addMinutes: (minutes: number) => void;
  markTajweedPracticed: () => void;
  setReminder: (enabled: boolean, slot?: State['reminderSlot']) => void;
  syncFromServer: () => Promise<void>;
  syncGoalToServer: () => Promise<void>;
};

function emptyProgress(date: string): DailyProgressLocal {
  return {
    date,
    ayahsRead: 0,
    minutesRead: 0,
    tajweedPracticed: false,
    goalCompleted: false,
    countedAyahKeys: [],
  };
}

/** Soft local suggestion until the user confirms a goal (never auto-written to the account). */
export const SOFT_DAILY_GOAL: NonNullable<DailyGoalLocal> = {
  goalType: 'read_ayahs',
  goalValue: 5,
};

function evaluateGoal(goal: DailyGoalLocal, p: DailyProgressLocal): boolean {
  if (!goal) return false;
  if (goal.goalType === 'read_ayahs') return p.ayahsRead >= goal.goalValue;
  if (goal.goalType === 'read_minutes') return p.minutesRead >= goal.goalValue;
  // Approximate one mushaf page as ~15 ayahs when page telemetry is unavailable.
  if (goal.goalType === 'read_page') return p.ayahsRead >= Math.max(1, goal.goalValue) * 15;
  if (goal.goalType === 'tajweed_rule') return p.tajweedPracticed;
  if (goal.goalType === 'listen') return p.ayahsRead > 0 || p.minutesRead > 0;
  return false;
}


export const useDailyMotivationStore = create<State>()(
  persist(
    (set, get) => ({
      timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
      goal: null,
      progress: emptyProgress(localDateKey()),
      reminderEnabled: false,
      reminderSlot: null,

      setTimezone: (timezone) => {
        set({ timezone });
        get().ensureToday();
      },

      setGoal: (goal) => {
        set({ goal });
        const p = get().progress;
        set({
          progress: { ...p, goalCompleted: evaluateGoal(goal, p) },
        });
        void get().syncGoalToServer();
      },

      clearGoal: () => {
        set({ goal: null });
        if (canSyncToServer()) {
          void usersApi.clearDailyGoal().catch(() => undefined);
        }
      },

      ensureToday: () => {
        const date = localDateKey(get().timezone);
        if (get().progress.date !== date) {
          set({ progress: emptyProgress(date) });
        }
      },

      recordAyahView: (surah, ayah) => {
        get().ensureToday();
        const key = `${surah}:${ayah}`;
        const p = get().progress;
        if (p.countedAyahKeys.includes(key)) return;
        const next: DailyProgressLocal = {
          ...p,
          ayahsRead: p.ayahsRead + 1,
          countedAyahKeys: [...p.countedAyahKeys, key].slice(-200),
        };
        next.goalCompleted = evaluateGoal(get().goal, next);
        set({ progress: next });
        if (canSyncToServer()) {
          void usersApi
            .upsertDailyProgress({
              date: next.date,
              incrementAyahs: 1,
            })
            .catch(() => undefined);
        }
      },

      addMinutes: (minutes) => {
        get().ensureToday();
        const p = get().progress;
        const next = { ...p, minutesRead: p.minutesRead + Math.max(0, minutes) };
        next.goalCompleted = evaluateGoal(get().goal, next);
        set({ progress: next });
        if (canSyncToServer()) {
          void usersApi
            .upsertDailyProgress({
              date: next.date,
              incrementMinutes: minutes,
            })
            .catch(() => undefined);
        }
      },

      markTajweedPracticed: () => {
        get().ensureToday();
        const p = { ...get().progress, tajweedPracticed: true };
        p.goalCompleted = evaluateGoal(get().goal, p);
        set({ progress: p });
        if (canSyncToServer()) {
          void usersApi
            .upsertDailyProgress({
              date: p.date,
              tajweedPracticed: true,
            })
            .catch(() => undefined);
        }
      },

      setReminder: (enabled, slot = null) => {
        set({ reminderEnabled: enabled, reminderSlot: slot });
        if (canSyncToServer()) {
          void usersApi
            .setMotivationPreferences({
              reminderEnabled: enabled,
              reminderSlot: slot,
              timezone: get().timezone,
            })
            .catch(() => undefined);
        }
      },

      syncFromServer: async () => {
        if (!canSyncToServer()) return;
        try {
          get().ensureToday();
          const date = get().progress.date;
          const [goal, progress, prefs] = await Promise.all([
            usersApi.getDailyGoal(),
            usersApi.getDailyProgress(date),
            usersApi.getMotivationPreferences(),
          ]);
          if (goal) {
            set({
              goal: {
                goalType: goal.goalType as DailyGoalType,
                goalValue: goal.goalValue,
              },
            });
          } else {
            set({ goal: null });
          }
          if (progress) {
            const local = get().progress;
            const ayahsRead = Math.max(local.ayahsRead, progress.ayahsRead ?? 0);
            const minutesRead = Math.max(local.minutesRead, progress.minutesRead ?? 0);
            const tajweedPracticed = local.tajweedPracticed || !!progress.tajweedPracticed;
            const merged = {
              date: progress.date,
              ayahsRead,
              minutesRead,
              tajweedPracticed,
              goalCompleted: false,
              countedAyahKeys: local.countedAyahKeys,
            };
            merged.goalCompleted =
              !!progress.goalCompleted || evaluateGoal(get().goal, merged);
            set({ progress: merged });
          }
          if (prefs) {
            set({
              reminderEnabled: !!prefs.reminderEnabled,
              reminderSlot: (prefs.reminderSlot as State['reminderSlot']) ?? null,
              timezone: prefs.timezone || get().timezone,
            });
          }
        } catch {
          /* offline */
        }
      },

      syncGoalToServer: async () => {
        if (!canSyncToServer()) return;
        const goal = get().goal;
        if (!goal) {
          await usersApi.clearDailyGoal().catch(() => undefined);
          return;
        }
        await usersApi
          .setDailyGoal({ goalType: goal.goalType, goalValue: goal.goalValue })
          .catch(() => undefined);
      },
    }),
    { name: 'qp-daily-motivation-v1' },
  ),
);
