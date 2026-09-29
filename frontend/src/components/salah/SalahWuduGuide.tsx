'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Droplets } from 'lucide-react';
import { WUDU_STEPS, type WuduStep } from '@/lib/salah/steps';
import { cn } from '@/lib/utils';

export function SalahWuduGuide() {
  const [completedWuduSteps, setCompletedWuduSteps] = useState<Record<string, boolean>>({});

  const toggleWuduCheck = (id: string) => {
    setCompletedWuduSteps((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const doneCount = Object.values(completedWuduSteps).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-line bg-surface p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Droplets className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                Wudu (Ablution) Visual Check
              </h2>
              <p className="text-xs text-ink-muted sm:text-sm">
                Purification is the key to Salah. Ensure every limb is washed correctly according to the Sunnah.
              </p>
            </div>
          </div>

          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-300">
            {doneCount} / {WUDU_STEPS.length} Steps Verified
          </span>
        </div>
      </div>

      {/* 8-Step Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {WUDU_STEPS.map((step) => {
          const isDone = !!completedWuduSteps[step.id];

          return (
            <div
              key={step.id}
              onClick={() => toggleWuduCheck(step.id)}
              className={cn(
                'cursor-pointer flex flex-col justify-between rounded-3xl border p-4 transition hover:shadow-md',
                isDone
                  ? 'border-cyan-500/40 bg-cyan-500/5'
                  : 'border-line bg-surface hover:border-line',
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-3 text-xs font-bold text-ink-muted">
                    {step.stepNumber}
                  </span>
                  <p className="font-arabic text-sm text-[var(--accent)]" lang="ar" dir="rtl">
                    {step.titleArabic}
                  </p>
                </div>

                <h3 className="mt-2.5 text-sm font-bold text-ink">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  {step.instruction}
                </p>

                {/* Visual Check Note */}
                <div className="mt-3 rounded-xl border border-line bg-surface-2 p-2 text-[11px] leading-relaxed">
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Visual Check:
                  </p>
                  <p className="text-ink-muted">{step.visualCheck}</p>
                </div>

                {/* Mistake to avoid */}
                <div className="mt-2 flex items-start gap-1.5 text-[10px] text-amber-700 dark:text-amber-400">
                  <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>Avoid: {step.mistakeAvoid}</span>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-line/50 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-ink-faint">
                  {isDone ? 'Verified' : 'Click to Verify'}
                </span>
                <CheckCircle2
                  className={cn(
                    'h-4 w-4',
                    isDone
                      ? 'text-cyan-600 dark:text-cyan-400'
                      : 'text-ink-faint opacity-50',
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
