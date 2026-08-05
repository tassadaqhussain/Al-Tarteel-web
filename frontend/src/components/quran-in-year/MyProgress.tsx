'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import {
  formatWeekReadingLabel,
  getHijriMonthName,
  getProgressGroups,
  weekReadingHref,
  type CalendarWeek,
} from '@/lib/quranic-calendar';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';

export function MyProgress({ currentWeek }: { currentWeek: number }) {
  const groups = useMemo(() => getProgressGroups(), []);
  const tracking = useSettingsStore((s) => s.quranYearTracking);
  const completed = useSettingsStore((s) => s.quranYearCompletedWeeks);
  const setTracking = useSettingsStore((s) => s.setQuranYearTracking);
  const toggleWeek = useSettingsStore((s) => s.toggleQuranYearWeek);

  const defaultOpen = groups.find((g) => currentWeek >= g.from && currentWeek <= g.to)?.id;
  const [openId, setOpenId] = useState<string | null>(defaultOpen ?? null);

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">My Progress</h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Feel free to go back and complete the weeks that you&apos;ve missed!
          </p>
          {tracking && (
            <p className="mt-2 text-sm font-medium text-[var(--accent)]">
              {completed.length}/46 Weeks Completed
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setTracking(!tracking)}
          className="shrink-0 text-sm font-medium text-slate-700 underline underline-offset-4 transition hover:text-[var(--accent)]"
        >
          {tracking ? 'Stop tracking' : 'Start tracking'}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {groups.map((group) => {
          const open = openId === group.id;
          return (
            <div key={group.id} className="border-b border-slate-200 last:border-b-0">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : group.id)}
                className={cn(
                  'flex w-full items-center justify-between px-5 py-4 text-left transition',
                  open ? 'bg-slate-100' : 'bg-white hover:bg-slate-50'
                )}
              >
                <span className="text-base font-bold text-slate-800">{group.label}</span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-slate-400 transition-transform',
                    open && 'rotate-180'
                  )}
                />
              </button>

              {open && (
                <div className="bg-white px-5 pb-5 pt-1">
                  <GroupWeeks
                    weeks={group.weeks}
                    currentWeek={currentWeek}
                    tracking={tracking}
                    completed={completed}
                    onToggle={toggleWeek}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function GroupWeeks({
  weeks,
  currentWeek,
  tracking,
  completed,
  onToggle,
}: {
  weeks: CalendarWeek[];
  currentWeek: number;
  tracking: boolean;
  completed: number[];
  onToggle: (week: number) => void;
}) {
  let lastMonth = -1;

  return (
    <div className="space-y-4">
      {weeks.map((week) => {
        const showMonth = week.hijriMonth !== lastMonth;
        lastMonth = week.hijriMonth;
        const isCurrent = week.week === currentWeek;
        const isDone = completed.includes(week.week);

        return (
          <div key={week.week}>
            {showMonth && (
              <p className="mb-2 mt-3 text-sm text-slate-500 first:mt-1">
                ({getHijriMonthName(week.hijriMonth)})
              </p>
            )}
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 pl-1 sm:pl-3">
              <span className="text-sm font-bold text-slate-800">Week {week.week}:</span>
              <Link
                href={weekReadingHref(week)}
                className="text-sm font-medium text-[var(--accent)] underline underline-offset-2 transition hover:text-[var(--accent)]"
              >
                {formatWeekReadingLabel(week)}
              </Link>
              {isCurrent && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                  Current
                </span>
              )}
              {tracking && (
                <button
                  type="button"
                  onClick={() => onToggle(week.week)}
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-semibold transition',
                    isDone
                      ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  )}
                >
                  {isDone ? 'Complete' : 'Mark done'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
