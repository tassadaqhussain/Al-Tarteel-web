'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Calendar, ChevronRight, Clock, Settings } from 'lucide-react';
import { Header } from '@/components/Header';
import { useSettingsStore, type ReadingGoalId } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';
import { getSurahPath } from '@/lib/surah-meta';

const GOALS: {
  id: ReadingGoalId;
  title: string;
  description: string;
  icon: typeof Clock;
  recommended?: boolean;
  hrefAfter?: string;
}[] = [
  {
    id: 'minutes-10',
    title: 'Read 10 Minutes A Day',
    description: 'A Simple Beginner-Friendly Goal',
    icon: Clock,
    recommended: true,
    hrefAfter: getSurahPath(1),
  },
  {
    id: 'days-30',
    title: 'Read The Quran In 30 Days',
    description: 'A Classic Khatm Goal. Read 1 Juz A Day',
    icon: BookOpen,
    hrefAfter: '/juz/1',
  },
  {
    id: 'year',
    title: 'Read The Quran In A Year',
    description: 'Read The Quran At Your Own Pace Over The Next Year',
    icon: Calendar,
    hrefAfter: '/quran-in-year',
  },
  {
    id: 'custom',
    title: 'Custom',
    description: 'Set A Custom Goal That Suits You',
    icon: Settings,
    hrefAfter: '/settings',
  },
];

export default function ReadingGoalPage() {
  const router = useRouter();
  const existing = useSettingsStore((s) => s.readingGoal);
  const setReadingGoal = useSettingsStore((s) => s.setReadingGoal);
  const [selected, setSelected] = useState<ReadingGoalId | null>(existing?.id ?? null);

  const onNext = () => {
    if (!selected) return;
    const goal = GOALS.find((g) => g.id === selected)!;
    setReadingGoal({
      id: selected,
      title: goal.title,
      startedAt: Date.now(),
    });
    router.push(goal.hrefAfter || '/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface-app text-ink">
      <Header />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:gap-16 lg:py-16">
        <div className="lg:sticky lg:top-28 lg:w-[42%] lg:shrink-0">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
            Pick a preset goal or create your own
          </h1>
          <p className="mt-4 max-w-md text-base text-ink-muted sm:text-lg">
            Here is a list of common goals. You can also create your own goal.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 lg:max-w-xl lg:flex-1">
          {GOALS.map((goal) => {
            const active = selected === goal.id;
            const Icon = goal.icon;
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => setSelected(goal.id)}
                className={cn(
                  'relative flex w-full items-start gap-4 rounded-2xl border bg-surface px-5 py-5 text-left transition',
                  active
                    ? 'border-[var(--accent)] shadow-sm ring-1 ring-[var(--accent)]/30'
                    : 'border-line hover:border-[var(--accent)]/60'
                )}
              >
                <div
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                    active ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'bg-surface-2 text-ink-3'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1 pr-16">
                  <p className="font-semibold text-ink">{goal.title}</p>
                  <p className="mt-1 text-sm text-ink-muted">{goal.description}</p>
                </div>
                {goal.recommended && (
                  <span className="absolute right-4 top-4 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[11px] font-semibold text-brand-contrast">
                    Recommended
                  </span>
                )}
              </button>
            );
          })}

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={onNext}
              disabled={!selected}
              className={cn(
                'inline-flex items-center gap-1 rounded-xl px-5 py-3 text-sm font-semibold transition',
                selected
                  ? 'bg-ink text-surface hover:bg-ink-2'
                  : 'cursor-not-allowed bg-surface-3 text-ink-faint'
              )}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {existing && (
            <p className="text-center text-sm text-ink-muted">
              Current goal:{' '}
              <span className="font-medium text-ink-2">{existing.title}</span>
              {' · '}
              <Link href="/" className="text-[var(--accent)] hover:underline">
                Back home
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
