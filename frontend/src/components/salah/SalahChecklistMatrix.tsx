'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  CheckSquare,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { CORE_SALAH_STEPS, type SalahStep } from '@/lib/salah/steps';
import { cn } from '@/lib/utils';

type Props = {
  checkedMap: Record<string, boolean>;
  onToggleCheck: (id: string) => void;
  onResetChecks: () => void;
  onSelectStepToView: (stepIndex: number) => void;
};

export function SalahChecklistMatrix({
  checkedMap,
  onToggleCheck,
  onResetChecks,
  onSelectStepToView,
}: Props) {
  const steps: SalahStep[] = CORE_SALAH_STEPS;
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');

  // Compute total checklist stats
  const totalChecks = steps.reduce((acc, s) => acc + s.visualChecks.length, 0);
  const verifiedChecks = steps.reduce(
    (acc, s) => acc + s.visualChecks.filter((c) => checkedMap[c.id]).length,
    0,
  );
  const percentage = Math.round((verifiedChecks / (totalChecks || 1)) * 100);

  const filteredSteps = steps.filter((step) => {
    const isStepDone = step.visualChecks.every((c) => checkedMap[c.id]);
    if (filter === 'verified') return isStepDone;
    if (filter === 'pending') return !isStepDone;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Progress & Quick Actions */}
      <div className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
                <CheckSquare className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                Salah Visual Alignment Checklist
              </h2>
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              Verify each posture detail across the entire prayer for optimal Sunnah adherence.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={onResetChecks}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:border-rose-500/40 hover:text-rose-600"
              title="Reset all verified checks"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Verification Progress Bar */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-ink">Overall Posture Verification</span>
            <span className="text-[var(--accent)]">
              {verifiedChecks} of {totalChecks} Points ({percentage}%)
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-emerald-400 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          {percentage === 100 && (
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <Sparkles className="h-4 w-4" />
              <span>
                Masha’Allah! All visual posture checkpoints have been verified.
              </span>
            </div>
          )}
        </div>

        {/* Filter Pills */}
        <div className="mt-5 flex gap-2 border-t border-line/60 pt-4">
          {(
            [
              ['all', 'All Postures'],
              ['pending', 'Needs Check'],
              ['verified', 'Completed'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold transition',
                filter === id
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-surface-2 text-ink-muted hover:text-ink',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of All Postures */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSteps.map((step, idx) => {
          const originalIndex = steps.findIndex((s) => s.id === step.id);
          const checkedInStep = step.visualChecks.filter(
            (c) => checkedMap[c.id],
          ).length;
          const isComplete =
            checkedInStep === step.visualChecks.length &&
            step.visualChecks.length > 0;

          return (
            <div
              key={step.id}
              className={cn(
                'flex flex-col justify-between rounded-3xl border bg-surface p-5 shadow-sm transition hover:shadow-md',
                isComplete
                  ? 'border-emerald-500/40 bg-gradient-to-b from-surface to-emerald-500/5'
                  : 'border-line',
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-3 text-xs font-bold text-ink-muted">
                    {originalIndex + 1}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[11px] font-bold',
                      isComplete
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-surface-3 text-ink-faint',
                    )}
                  >
                    {checkedInStep}/{step.visualChecks.length} Verified
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-ink">
                  {step.title}
                </h3>
                <p
                  className="font-arabic text-lg text-ink-muted"
                  lang="ar"
                  dir="rtl"
                >
                  {step.titleArabic}
                </p>

                {/* Individual Checklist Items for this Step */}
                <div className="mt-3 space-y-2">
                  {step.visualChecks.map((check) => {
                    const isChecked = !!checkedMap[check.id];
                    return (
                      <button
                        key={check.id}
                        type="button"
                        onClick={() => onToggleCheck(check.id)}
                        className={cn(
                          'flex w-full items-start gap-2.5 rounded-xl border p-2 text-left transition',
                          isChecked
                            ? 'border-emerald-500/30 bg-emerald-500/10'
                            : 'border-line/60 bg-surface-2 hover:border-line',
                        )}
                      >
                        <CheckCircle2
                          className={cn(
                            'mt-0.5 h-3.5 w-3.5 shrink-0',
                            isChecked
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-ink-faint',
                          )}
                        />
                        <span
                          className={cn(
                            'text-xs font-medium leading-snug',
                            isChecked
                              ? 'text-emerald-800 dark:text-emerald-200 line-through opacity-80'
                              : 'text-ink',
                          )}
                        >
                          {check.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Action: Jump into interactive guide for this posture */}
              <div className="mt-4 pt-3 border-t border-line/60">
                <button
                  type="button"
                  onClick={() => onSelectStepToView(originalIndex)}
                  className="w-full rounded-xl bg-surface-2 py-2 text-center text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent)]/10"
                >
                  Open Visual Walkthrough →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
