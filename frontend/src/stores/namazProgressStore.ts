'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PrayerId, SchoolPreference } from '@/lib/namaz/types';

export type NamazPrayerProgress = {
  stepIndex: number;
  /** Highest step reached, for the progress bar. */
  furthestIndex: number;
  completedAt: number | null;
  updatedAt: number;
};

type NamazProgressState = {
  school: SchoolPreference;
  /** Surah number recited after Al-Fatihah in the first two rak'ahs. */
  shortSurah: number;
  slowPlayback: boolean;
  autoAdvance: boolean;
  lastPrayer: PrayerId | null;
  byPrayer: Partial<Record<PrayerId, NamazPrayerProgress>>;

  setSchool: (school: SchoolPreference) => void;
  setShortSurah: (surah: number) => void;
  setSlowPlayback: (slow: boolean) => void;
  setAutoAdvance: (on: boolean) => void;
  setStep: (prayer: PrayerId, stepIndex: number) => void;
  markComplete: (prayer: PrayerId, lastIndex: number) => void;
  restart: (prayer: PrayerId) => void;
};

/** Progress is kept on this device, like Tajweed lesson progress. */
export const useNamazProgressStore = create<NamazProgressState>()(
  persist(
    (set, get) => ({
      school: 'general',
      shortSurah: 112,
      slowPlayback: false,
      autoAdvance: false,
      lastPrayer: null,
      byPrayer: {},

      setSchool: (school) => set({ school }),
      setShortSurah: (shortSurah) => set({ shortSurah }),
      setSlowPlayback: (slowPlayback) => set({ slowPlayback }),
      setAutoAdvance: (autoAdvance) => set({ autoAdvance }),

      setStep: (prayer, stepIndex) => {
        const prev = get().byPrayer[prayer];
        set({
          lastPrayer: prayer,
          byPrayer: {
            ...get().byPrayer,
            [prayer]: {
              stepIndex,
              furthestIndex: Math.max(prev?.furthestIndex ?? 0, stepIndex),
              completedAt: prev?.completedAt ?? null,
              updatedAt: Date.now(),
            },
          },
        });
      },

      markComplete: (prayer, lastIndex) => {
        set({
          lastPrayer: prayer,
          byPrayer: {
            ...get().byPrayer,
            [prayer]: {
              stepIndex: lastIndex,
              furthestIndex: lastIndex,
              completedAt: Date.now(),
              updatedAt: Date.now(),
            },
          },
        });
      },

      restart: (prayer) => {
        const prev = get().byPrayer[prayer];
        set({
          lastPrayer: prayer,
          byPrayer: {
            ...get().byPrayer,
            [prayer]: {
              stepIndex: 0,
              furthestIndex: 0,
              completedAt: prev?.completedAt ?? null,
              updatedAt: Date.now(),
            },
          },
        });
      },
    }),
    { name: 'qp-namaz-progress-v1' },
  ),
);
