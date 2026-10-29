'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle } from 'lucide-react';
import type { LearningPlan } from '@/lib/learning-plans';
import { useSettingsStore } from '@/stores/settingsStore';
import { trackSelectContent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

export function LearningPlanTracker({
  plan,
  readerHref,
}: {
  plan: LearningPlan;
  readerHref: string;
}) {
  const progressMap = useSettingsStore((s) => s.learningProgress);
  const toggleDay = useSettingsStore((s) => s.toggleLearningDay);
  const completed = progressMap[plan.slug] ?? [];

  const days = useMemo(() => {
    return Array.from({ length: plan.days }, (_, i) => i + 1);
  }, [plan.days]);

  const doneCount = completed.length;
  const pct = Math.round((doneCount / plan.days) * 100);

  const handleToggleDay = (day: number) => {
    toggleDay(plan.slug, day);
    trackSelectContent('learning_plan_day', `${plan.slug}:${day}`, `Day ${day} of ${plan.title}`);
  };

  return (
    <>
      {/* Header Progress Indicators */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
          {plan.days} days
        </span>
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
          {doneCount}/{plan.days} complete
        </span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
        <div className="h-full rounded-full bg-surface transition-all" style={{ width: `${pct}%` }} />
      </div>

      {/* Daily Lessons List */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-ink">Your daily lessons</h2>
        <div className="space-y-2">
          {days.map((day) => {
            const done = completed.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => handleToggleDay(day)}
                className={cn(
                  'flex w-full items-center gap-4 rounded-2xl border bg-surface px-4 py-4 text-left transition',
                  done ? 'border-[var(--accent)]/40' : 'border-line hover:border-[var(--accent)]/40'
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--accent)]" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-ink-faint" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">Day {day}</p>
                  <p className="text-sm text-ink-muted">
                    {plan.surahNumber
                      ? `Reflect on Surah ${plan.surahNumber} — lesson ${day} of ${plan.days}`
                      : `Study and reflect — lesson ${day} of ${plan.days}`}
                  </p>
                </div>
                <Link
                  href={readerHref}
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 text-sm font-medium text-[var(--accent)] hover:underline"
                >
                  Read
                </Link>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

