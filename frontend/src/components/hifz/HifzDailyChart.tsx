'use client';

import { cn } from '@/lib/utils';

export type DayBar = {
  date: string;
  avgAccuracy: number;
  attempts: number;
};

export function HifzDailyChart({
  days,
  className,
}: {
  days: DayBar[];
  className?: string;
}) {
  const max = Math.max(100, ...days.map((d) => d.avgAccuracy || 0));

  return (
    <div className={cn('rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5', className)}>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--fg)]">Daily accuracy</h2>
          <p className="mt-0.5 text-sm text-[var(--muted)]">How precisely you recited, day by day</p>
        </div>
      </div>
      <div className="flex h-36 items-end gap-1.5 sm:gap-2">
        {days.map((d) => {
          const h = d.attempts ? Math.max(6, (d.avgAccuracy / max) * 100) : 4;
          const label = d.date.slice(5);
          return (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-medium text-[var(--muted)]">
                {d.attempts ? `${Math.round(d.avgAccuracy)}%` : '—'}
              </span>
              <div
                className={cn(
                  'w-full rounded-t-md transition',
                  d.attempts
                    ? d.avgAccuracy >= 85
                      ? 'bg-[var(--accent)]'
                      : d.avgAccuracy >= 60
                        ? 'bg-[var(--accent-gold)]'
                        : 'bg-rose-400'
                    : 'bg-line',
                )}
                style={{ height: `${h}%` }}
                title={`${d.date}: ${d.avgAccuracy}% (${d.attempts} attempts)`}
              />
              <span className="text-[10px] text-[var(--muted)]">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
