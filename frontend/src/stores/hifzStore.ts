import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { todayDateKey, lastLocalDateKeys } from '@/lib/hifz/compare';
import type { HifzAyahStatus } from '@/lib/api';

export type LocalHifzDay = {
  date: string;
  attempts: number;
  correct: number;
  accuracySum: number;
  avgAccuracy: number;
};

/** Key is `surah:ayah`, e.g. "114:3". */
export const ayahStatusKey = (surahNumber: number, ayahNumber: number) =>
  `${surahNumber}:${ayahNumber}`;

type HifzLocalState = {
  days: Record<string, LocalHifzDay>;
  /**
   * Per-ayah memorisation status held locally so practice works without an
   * account. When signed in these are also written to the server, which is the
   * source of truth; this copy keeps the UI responsive and usable offline.
   */
  statuses: Record<string, HifzAyahStatus>;
  setAyahStatus: (input: {
    surahNumber: number;
    fromAyah: number;
    toAyah?: number;
    status: HifzAyahStatus;
  }) => void;
  clearAyahStatus: (surahNumber: number, ayahNumber: number) => void;
  getAyahStatus: (surahNumber: number, ayahNumber: number) => HifzAyahStatus | null;
  statusesForSurah: (surahNumber: number) => Record<number, HifzAyahStatus>;
  mergeServerStatuses: (
    surahNumber: number,
    rows: Array<{ ayahNumber: number; status: HifzAyahStatus }>,
  ) => void;
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
      statuses: {},
      setAyahStatus: ({ surahNumber, fromAyah, toAyah, status }) => {
        const last = Math.max(fromAyah, toAyah ?? fromAyah);
        set((state) => {
          const next = { ...state.statuses };
          for (let n = fromAyah; n <= last; n += 1) {
            next[ayahStatusKey(surahNumber, n)] = status;
          }
          return { statuses: next };
        });
      },
      clearAyahStatus: (surahNumber, ayahNumber) =>
        set((state) => {
          const next = { ...state.statuses };
          delete next[ayahStatusKey(surahNumber, ayahNumber)];
          return { statuses: next };
        }),
      getAyahStatus: (surahNumber, ayahNumber) =>
        get().statuses[ayahStatusKey(surahNumber, ayahNumber)] ?? null,
      statusesForSurah: (surahNumber) => {
        const prefix = `${surahNumber}:`;
        const out: Record<number, HifzAyahStatus> = {};
        for (const [key, value] of Object.entries(get().statuses)) {
          if (key.startsWith(prefix)) out[Number(key.slice(prefix.length))] = value;
        }
        return out;
      },
      // Server wins on conflict: it is the durable record across devices.
      mergeServerStatuses: (surahNumber, rows) =>
        set((state) => {
          const next = { ...state.statuses };
          for (const row of rows) {
            next[ayahStatusKey(surahNumber, row.ayahNumber)] = row.status;
          }
          return { statuses: next };
        }),
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
