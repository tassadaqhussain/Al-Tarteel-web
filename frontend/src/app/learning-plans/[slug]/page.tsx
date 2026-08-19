'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, CheckCircle2, Circle } from 'lucide-react';
import { Header } from '@/components/Header';
import { getLearningPlan, getPlanHref } from '@/lib/learning-plans';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';

export default function LearningPlanDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const plan = getLearningPlan(params.slug);
  const progressMap = useSettingsStore((s) => s.learningProgress);
  const toggleDay = useSettingsStore((s) => s.toggleLearningDay);
  const completed = progressMap[params.slug] ?? [];

  const days = useMemo(() => {
    if (!plan) return [];
    return Array.from({ length: plan.days }, (_, i) => i + 1);
  }, [plan]);

  if (!plan) {
    return (
      <div className="min-h-screen bg-surface-app">
        <Header />
        <div className="mx-auto max-w-lg px-6 py-20 text-center">
          <p className="text-lg font-semibold text-ink">Plan not found</p>
          <Link href="/learning-plans" className="mt-4 inline-block text-[var(--accent)] hover:underline">
            Back to Learning Plans
          </Link>
        </div>
      </div>
    );
  }

  const doneCount = completed.length;
  const pct = Math.round((doneCount / plan.days) * 100);
  const readerHref = getPlanHref(plan);

  return (
    <div className="min-h-screen bg-surface-app text-ink">
      <Header />

      <div className={`bg-slate-800 bg-gradient-to-br ${plan.imageTone}`}>
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
          <button
            type="button"
            onClick={() => router.push('/learning-plans')}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/25"
          >
            <ArrowLeft className="h-4 w-4" />
            Learning Plans
          </button>
          <h1 className="text-2xl font-bold leading-snug text-white sm:text-3xl">{plan.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
            {plan.summary}
          </p>
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
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href={readerHref}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-brand-contrast transition hover:bg-[var(--accent)]/90"
          >
            <BookOpen className="h-4 w-4" />
            Open related reading
          </Link>
        </div>

        <h2 className="mb-4 text-lg font-bold text-ink">Your daily lessons</h2>
        <div className="space-y-2">
          {days.map((day) => {
            const done = completed.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(plan.slug, day)}
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
      </main>
    </div>
  );
}
