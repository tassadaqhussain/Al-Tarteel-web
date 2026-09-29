'use client';

import { useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { SalahStep } from '@/lib/salah/steps';
import { useSalahSpeech } from '@/lib/salah/audio';
import { cn } from '@/lib/utils';

type Props = {
  step: SalahStep;
  stepIndex: number;
  totalSteps: number;
  activeCheckId: string | null;
  onSelectCheck: (id: string) => void;
  checkedMap: Record<string, boolean>;
  onToggleCheck: (id: string) => void;
};

export function SalahStepCard({
  step,
  stepIndex,
  totalSteps,
  activeCheckId,
  onSelectCheck,
  checkedMap,
  onToggleCheck,
}: Props) {
  const { isPlaying, speak, stop } = useSalahSpeech();
  const [showMistakes, setShowMistakes] = useState(false);
  const [showSchoolNotes, setShowSchoolNotes] = useState(false);

  const completedCount = step.visualChecks.filter((c) => checkedMap[c.id]).length;
  const allVerified = completedCount === step.visualChecks.length && step.visualChecks.length > 0;

  return (
    <div className="space-y-4 rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      {/* Step Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)]/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
            Step {stepIndex + 1} of {totalSteps}
          </span>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-ink sm:text-2xl">
            {step.title}
          </h2>
          {step.transliteration && (
            <p className="text-xs font-medium text-ink-muted">
              {step.transliteration}
            </p>
          )}
        </div>

        <div className="text-right">
          <p
            className="font-arabic text-2xl font-bold text-ink sm:text-3xl"
            lang="ar"
            dir="rtl"
          >
            {step.titleArabic}
          </p>
        </div>
      </div>

      {/* Main Instruction */}
      <p className="text-sm leading-relaxed text-ink-muted sm:text-base">
        {step.instruction}
      </p>

      {/* Recitation Section with Audio */}
      {step.recite && (
        <div className="relative overflow-hidden rounded-2xl border border-[var(--accent)]/20 bg-gradient-to-br from-surface-2 via-surface to-surface-2 p-4">
          <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
              Recitation & Remembrance (Dhikr)
            </span>

            {/* Audio Speech Button */}
            <button
              type="button"
              onClick={() => {
                if (isPlaying) {
                  stop();
                } else {
                  speak(step.reciteArabic || step.recite || '', step.recite);
                }
              }}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition',
                isPlaying
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-[var(--accent)] text-white hover:opacity-90',
              )}
              title="Listen to Arabic recitation"
            >
              {isPlaying ? (
                <>
                  <VolumeX className="h-3.5 w-3.5" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Listen Recitation</span>
                </>
              )}
            </button>
          </div>

          {step.reciteArabic && (
            <p
              className="mt-3 font-arabic text-xl font-semibold leading-loose text-ink sm:text-2xl"
              lang="ar"
              dir="rtl"
            >
              {step.reciteArabic}
            </p>
          )}

          <p className="mt-2 text-sm font-medium text-ink">
            {step.recite}
          </p>

          {step.reciteMeaning && (
            <p className="mt-1 text-xs leading-relaxed text-ink-muted italic">
              "{step.reciteMeaning}"
            </p>
          )}
        </div>
      )}

      {/* Visual Alignment Checklist ("Visual Check") */}
      <div className="rounded-2xl border border-line bg-surface-2/60 p-4">
        <div className="flex items-center justify-between gap-2 border-b border-line pb-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle2
              className={cn(
                'h-4 w-4',
                allVerified ? 'text-emerald-500' : 'text-[var(--accent)]',
              )}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-ink">
              Visual Posture Check ({completedCount}/{step.visualChecks.length} Verified)
            </span>
          </div>

          {allVerified && (
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Posture Complete ✓
            </span>
          )}
        </div>

        <p className="mt-2 text-xs text-ink-faint">
          Check off each posture detail to verify proper alignment:
        </p>

        <div className="mt-3 space-y-2">
          {step.visualChecks.map((check) => {
            const isChecked = !!checkedMap[check.id];
            const isActive = activeCheckId === check.id;

            return (
              <div
                key={check.id}
                onClick={() => onSelectCheck(check.id)}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-xl border p-2.5 transition',
                  isActive
                    ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                    : isChecked
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-line/70 bg-surface hover:border-line',
                )}
              >
                <input
                  type="checkbox"
                  id={check.id}
                  checked={isChecked}
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggleCheck(check.id);
                  }}
                  className="mt-0.5 h-4 w-4 cursor-pointer rounded border-line text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                <label
                  htmlFor={check.id}
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCheck(check.id);
                    onSelectCheck(check.id);
                  }}
                >
                  <p
                    className={cn(
                      'text-xs font-bold transition',
                      isChecked ? 'text-emerald-700 dark:text-emerald-300' : 'text-ink',
                    )}
                  >
                    {check.label}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-ink-muted">
                    {check.detail}
                  </p>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accordions: Common Mistakes & School of Thought Notes */}
      <div className="space-y-2 pt-1">
        {step.commonMistakes.length > 0 && (
          <div className="rounded-xl border border-line bg-surface overflow-hidden">
            <button
              type="button"
              onClick={() => setShowMistakes((prev) => !prev)}
              className="flex w-full items-center justify-between p-3 text-left text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/5"
            >
              <span className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                Common Mistakes to Avoid ({step.commonMistakes.length})
              </span>
              {showMistakes ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {showMistakes && (
              <ul className="space-y-1.5 border-t border-line bg-surface-2 p-3 text-xs leading-relaxed text-ink-muted">
                {step.commonMistakes.map((mistake, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {step.schoolNotes && (
          <div className="rounded-xl border border-line bg-surface overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSchoolNotes((prev) => !prev)}
              className="flex w-full items-center justify-between p-3 text-left text-xs font-bold text-ink-muted hover:bg-surface-2"
            >
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-[var(--accent)]" />
                Jurisprudence Notes (Schools of Thought)
              </span>
              {showSchoolNotes ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {showSchoolNotes && (
              <div className="border-t border-line bg-surface-2 p-3 text-xs leading-relaxed text-ink-muted">
                {step.schoolNotes}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
