'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Settings,
  Sparkles,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';
import { useSettingsStore, type ReadingGoalId } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';
import { getSurahPath } from '@/lib/surah-meta';

const GOALS: {
  id: ReadingGoalId;
  title: string;
  pace: string;
  description: string;
  icon: typeof Clock;
  recommended?: boolean;
  hrefAfter?: string;
}[] = [
  {
    id: 'minutes-10',
    title: 'Read 10 minutes a day',
    pace: '10 min / day',
    description: 'Build a calm, steady daily habit with a simple beginner-friendly pace.',
    icon: Clock,
    recommended: true,
    hrefAfter: getSurahPath(1),
  },
  {
    id: 'days-30',
    title: 'Read the Quran in 30 days',
    pace: '1 Juz / day',
    description: 'A classic Khatm rhythm designed to complete the entire Quran in one month.',
    icon: BookOpen,
    hrefAfter: '/juz/1',
  },
  {
    id: 'year',
    title: 'Read the Quran in a year',
    pace: 'Guided weekly',
    description: 'Move at a sustainable pace with weekly readings across the full year.',
    icon: Calendar,
    hrefAfter: '/quran-in-year',
  },
  {
    id: 'custom',
    title: 'Custom goal',
    pace: 'Your pace',
    description: 'Tailor your translation, font, audio reciter, and reading preferences.',
    icon: Settings,
    hrefAfter: '/settings',
  },
];

export default function ReadingGoalPage() {
  const router = useRouter();
  const existing = useSettingsStore((s) => s.readingGoal);
  const setReadingGoal = useSettingsStore((s) => s.setReadingGoal);
  const [selected, setSelected] = useState<ReadingGoalId | null>(existing?.id ?? 'minutes-10');

  const selectedGoal = GOALS.find((g) => g.id === selected) ?? null;

  const onNext = () => {
    if (!selected || !selectedGoal) return;
    setReadingGoal({
      id: selected,
      title: selectedGoal.title,
      startedAt: Date.now(),
    });
    router.push(selectedGoal.hrefAfter || '/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface-app text-ink">
      <Header />

      <main lang="en" dir="ltr" className="relative flex flex-1 flex-col justify-center overflow-x-clip">
        {/* Soft ambient backdrop matching QuranPilot emerald & warm gold palette */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(ellipse_75%_60%_at_50%_0%,rgba(6,78,59,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_75%_60%_at_50%_0%,rgba(16,185,129,0.10),transparent_70%)]"
        />

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:gap-14 lg:py-16">
          {/* Left column: Editorial heading, Quranic inspiration, and reassurance */}
          <div className="lg:sticky lg:top-28 lg:w-[44%] lg:shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/10 px-3 py-1 text-xs font-semibold tracking-wide text-[var(--accent)]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Daily Reading Habit
            </span>

            <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
              Pick a preset goal or create your own
            </h1>

            <p className="mt-4 max-w-md text-base leading-relaxed text-ink-2 sm:text-lg">
              Choose a rhythm that fits your day. Consistency with a few verses brings lasting
              connection with the Book of Allah.
            </p>

            {/* Quranic reflection card */}
            <div className="mt-7 rounded-2xl border border-line bg-surface p-5 shadow-sm">
              <p
                lang="ar"
                dir="rtl"
                className="font-arabic text-right text-2xl leading-[2.1] text-ink"
              >
                وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
              </p>
              <p className="mt-2 text-sm italic text-ink-2">
                &ldquo;And recite the Qur&rsquo;an with measured recitation.&rdquo;
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-ink-muted">
                <span>Surah Al-Muzzammil · 73:4</span>
                <Link
                  href="/al-muzzammil/4"
                  className="font-medium text-[var(--accent)] hover:underline"
                >
                  Read verse →
                </Link>
              </div>
            </div>

            <ul className="mt-6 space-y-2.5 text-sm text-ink-2">
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                </span>
                No sign-in required — saved automatically on your device
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                </span>
                Switch plans or adjust your pace anytime
              </li>
            </ul>
          </div>

          {/* Right column: Goal selector cards & action bar */}
          <div className="flex w-full flex-col gap-3.5 lg:max-w-xl lg:flex-1">
            {GOALS.map((goal) => {
              const active = selected === goal.id;
              const Icon = goal.icon;
              return (
                <button
                  key={goal.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelected(goal.id)}
                  className={cn(
                    'group relative flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition-all duration-200',
                    active
                      ? 'border-[var(--accent)] bg-[var(--accent)]/[0.04] shadow-md shadow-emerald-950/5 ring-1 ring-[var(--accent)]/30 dark:bg-[var(--accent)]/[0.08]'
                      : 'border-line bg-surface shadow-sm hover:-translate-y-0.5 hover:border-[var(--accent)]/50 hover:shadow-md',
                  )}
                >
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors',
                      active
                        ? 'bg-[var(--accent)] text-brand-contrast shadow-sm'
                        : 'bg-surface-2 text-ink-2 group-hover:bg-[var(--accent)]/10 group-hover:text-[var(--accent)]',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-bold text-ink">{goal.title}</p>
                      {goal.recommended && (
                        <span className="rounded-full bg-[var(--accent)]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">{goal.description}</p>
                    <span className="mt-2.5 inline-block rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink-3">
                      {goal.pace}
                    </span>
                  </div>

                  <span
                    aria-hidden
                    className={cn(
                      'mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all',
                      active
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-brand-contrast scale-100'
                        : 'border-line bg-surface-2 text-transparent group-hover:border-[var(--accent)]/50',
                    )}
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={2.75} />
                  </span>
                </button>
              );
            })}

            <div className="mt-4 flex flex-col-reverse items-center justify-between gap-4 rounded-2xl border border-line-subtle bg-surface/70 px-5 py-4 sm:flex-row">
              <div className="text-center text-sm text-ink-muted sm:text-left">
                {existing ? (
                  <>
                    Current goal:{' '}
                    <span className="font-semibold text-ink">{existing.title}</span>
                    {' · '}
                    <Link href="/" className="font-medium text-[var(--accent)] hover:underline">
                      Back home
                    </Link>
                  </>
                ) : (
                  <Link href="/" className="font-medium text-[var(--accent)] hover:underline">
                    ← Back home
                  </Link>
                )}
              </div>

              <button
                type="button"
                onClick={onNext}
                disabled={!selected}
                className={cn(
                  'inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-bold shadow-sm transition sm:w-auto',
                  selected
                    ? 'bg-[var(--accent)] text-brand-contrast hover:opacity-95 active:scale-[0.99]'
                    : 'cursor-not-allowed bg-surface-3 text-ink-faint',
                )}
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
