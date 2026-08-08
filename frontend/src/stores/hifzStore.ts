import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { todayDateKey, lastLocalDateKeys } from '@/lib/hifz/compare';

export type LocalHifzDay = {
  date: string;
  attempts: number;
  correct: number;
  accuracySum: number;
  avgAccuracy: number;
};

type HifzLocalState = {
  days: Record<string, LocalHifzDay>;
  record: (input: { accuracy: number; isCorrect: boolean; date?: string }) => void;
  lastNDays: (n: number) => LocalHifzDay[];
  today: () => LocalHifzDay | null;
};

function emptyDay(date: string): LocalHifzDay {
  return { date, attempts: 0, correct: 0, accuracySum: 0, avgAccuracy: 0 };
}

export const useHifzStore = create<HifzLocalState>()(
  persist(
    (set, get) => ({
      days: {},
      record: ({ accuracy, isCorrect, date }) => {
        const key = date || todayDateKey();
        set((state) => {
          const prev = state.days[key] || emptyDay(key);
          const attempts = prev.attempts + 1;
          const correct = prev.correct + (isCorrect ? 1 : 0);
          const accuracySum = prev.accuracySum + accuracy;
          return {
            days: {
              ...state.days,
              [key]: {
                date: key,
                attempts,
                correct,
                accuracySum,
                avgAccuracy: Math.round((accuracySum / attempts) * 10) / 10,
              },
            },
          };
        });
      },
      lastNDays: (n) => {
        const days = get().days;
        return lastLocalDateKeys(n).map((key) => days[key] || emptyDay(key));
      },
      today: () => get().days[todayDateKey()] || null,
    }),
    { name: 'al-tarteel-hifz-local' },
  ),
);
