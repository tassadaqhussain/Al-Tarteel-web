import Link from 'next/link';
import { BookOpen, Mail } from 'lucide-react';
import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { MyProgress } from '@/components/quran-in-year/MyProgress';
import { FaqSection } from '@/components/quran-in-year/FaqSection';
import {
  formatVerseLabel,
  getCalendarWeek,
  getCurrentProgramWeek,
  getReflectionPrompts,
  weekReadingHref,
} from '@/lib/quranic-calendar';
import { buildPageMetadata } from '@/lib/seo';
import { getSurahPath } from '@/lib/surah-meta';

export const metadata: Metadata = buildPageMetadata({
  title: 'Quran in a Year — Reading Schedule',
  description:
    'A weekly schedule to read and understand the entire Holy Quran from one Ramadan to the next. Track progress and stay consistent with QuranPilot.',
  path: '/quran-in-year',
  keywords: ['Quran in a year', 'Quran schedule', 'read Quran yearly', 'Ramadan Quran plan'],
});

export default function QuranInYearPage() {
  const currentWeek = getCurrentProgramWeek();
  const week = getCalendarWeek(currentWeek) ?? getCalendarWeek(1)!;
  const prompts = getReflectionPrompts(week.week);

  return (
    <div className="min-h-screen bg-surface text-ink">
      <Header />

      <main>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line-subtle bg-surface-2">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          aria-hidden
          style={{
            backgroundImage:
              'radial-gradient(circle at 18% 40%, rgba(44,164,171,0.55), transparent 42%), radial-gradient(circle at 82% 30%, rgba(15,23,42,0.18), transparent 38%)',
          }}
        />
        {/* Faint Arabic watermark */}
        <p
          className="pointer-events-none absolute -right-8 top-6 select-none font-arabic text-[9rem] leading-none text-ink-faint/30 sm:right-16 sm:text-[12rem]"
          dir="rtl"
          aria-hidden
        >
          قران
        </p>

        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-16">
          <div className="max-w-xl">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              Quran in a Year
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-3 sm:text-lg">
              A thoughtfully designed schedule that makes it easy for you to read and understand the
              entire Quran from one Ramadan to the next, at a steady and manageable pace.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/settings"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-brand-contrast shadow-sm transition hover:bg-[var(--accent)]/90"
              >
                <Mail className="h-4 w-4" />
                Subscribe
              </Link>
              <a
                href="https://chat.whatsapp.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/50 bg-surface px-5 py-2.5 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)]/10"
              >
                Join our Whatsapp
              </a>
              <a
                href="https://t.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/50 bg-surface px-5 py-2.5 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)]/10"
              >
                Join our Telegram
              </a>
            </div>
          </div>

          <div className="mx-auto w-44 shrink-0 overflow-hidden rounded-2xl bg-surface shadow-md sm:mx-0 sm:w-48">
            <div className="h-2 bg-[var(--accent)]" />
            <div className="px-4 py-8 text-center">
              <p className="text-lg font-medium text-ink-muted">Week</p>
              <p className="mt-1 text-6xl font-bold tabular-nums tracking-tight text-ink">
                {week.week}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* This week's verses */}
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">Read this Week&apos;s Verses</h2>
        <p className="mt-2 text-sm text-ink-3 sm:text-base">
          Select the language you&apos;d prefer to read for this week&apos;s verses.
        </p>

        <div className="mt-6 rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
            <Link
              href={weekReadingHref(week)}
              className="inline-flex items-start gap-2 text-sm font-medium text-ink transition hover:text-[var(--accent)] sm:text-[15px]"
            >
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
              <span>
                {week.start.surah}. {formatVerseLabel(week.start)}
              </span>
            </Link>
            <span className="hidden text-ink-faint sm:inline">—</span>
            <Link
              href={getSurahPath(week.end.surah)}
              className="inline-flex items-start gap-2 text-sm font-medium text-ink transition hover:text-[var(--accent)] sm:text-[15px]"
            >
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
              <span>
                {week.end.surah}. {formatVerseLabel(week.end)}
              </span>
            </Link>
          </div>

          <div className="mt-8 border-t border-line-subtle pt-6">
            <p className="text-sm font-bold text-ink">
              REFLECTION prompts from this week&apos;s reading:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-2">
              {prompts.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <div className="mt-6">
              <Link
                href={weekReadingHref(week)}
                className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-brand-contrast transition hover:bg-[var(--accent)]/90"
              >
                Start reading
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MyProgress currentWeek={week.week} />
      <FaqSection />
      </main>

      <footer className="border-t border-line bg-surface-app py-10">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="font-serif text-lg font-bold text-ink">QuranPilot</p>
          <p className="mt-2 text-sm text-ink-muted">
            © {new Date().getFullYear()} QuranPilot. Built for guidance and wisdom.
          </p>
        </div>
      </footer>
    </div>
  );
}
