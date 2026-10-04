import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import {
  getCalendarWeek,
  getCurrentProgramWeek,
  weekReadingHref,
} from '@/lib/quranic-calendar';
import { getSurahPath } from '@/lib/surah-meta';
import { Msg } from '@/components/i18n/Msg';
import { PageSection } from '@/components/layout/MainContainer';

export function QuranInYear() {
  const weekNum = getCurrentProgramWeek();
  const week = getCalendarWeek(weekNum) ?? getCalendarWeek(1)!;

  return (
    <PageSection id="quran-in-year">
      <div className="mb-5 flex items-center justify-between gap-2 sm:mb-6">
        <h2 className="text-lg font-bold text-ink sm:text-xl md:text-2xl"><Msg k="quranInYear" /></h2>
        <Link
          href="/quran-in-year"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-[var(--accent)] underline underline-offset-4"
        >
          <Calendar className="h-4 w-4" />
          <Msg k="calendar" />
        </Link>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start">
          <div className="mx-auto w-32 shrink-0 overflow-hidden rounded-xl bg-surface shadow-sm ring-1 ring-line sm:mx-0 sm:w-36">
            <div className="h-1.5 bg-[var(--accent)]" />
            <div className="px-3 py-4 text-center sm:py-5">
              <p className="text-xs font-medium uppercase tracking-wider text-ink-faint"><Msg k="week" /></p>
              <p className="mt-1 text-4xl font-bold tabular-nums text-ink">{week.week}</p>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm leading-relaxed text-ink-3 sm:text-[15px]">
              <Msg k="quranInYearBody" />
            </p>

            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint sm:mt-5">
              <Msg k="thisWeeksReadings" />
            </p>

            <div className="mt-2 flex flex-col items-stretch gap-3 rounded-xl bg-surface-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-4">
              <Link href={weekReadingHref(week)} className="min-w-0 text-left transition hover:opacity-80">
                <p className="font-arabic text-xl text-ink sm:text-2xl" dir="rtl" lang="ar">
                  {week.start.nameArabic}
                </p>
                <p className="mt-1 text-sm font-medium text-ink-2">
                  {week.start.nameSimple} · <Msg k="verseN" vars={{ n: week.start.ayah }} />
                </p>
                <p className="text-xs text-ink-faint">
                  {week.start.surah}:{week.start.ayah}
                </p>
              </Link>

              <ArrowRight className="mx-auto h-4 w-4 shrink-0 rotate-90 text-ink-faint sm:mx-2 sm:rotate-0" />

              <Link
                href={getSurahPath(week.end.surah)}
                className="min-w-0 text-left transition hover:opacity-80 sm:text-right"
              >
                <p className="font-arabic text-xl text-ink sm:text-right sm:text-2xl" dir="rtl" lang="ar">
                  {week.end.nameArabic}
                </p>
                <p className="mt-1 text-sm font-medium text-ink-2">
                  {week.end.nameSimple} · <Msg k="verseN" vars={{ n: week.end.ayah }} />
                </p>
                <p className="text-xs text-ink-faint">
                  {week.end.surah}:{week.end.ayah}
                </p>
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap justify-stretch gap-2 sm:mt-5 sm:justify-end">
              <Link
                href="/quran-in-year"
                className="flex-1 rounded-full bg-surface-3 px-4 py-2.5 text-center text-sm font-semibold text-ink-2 transition hover:bg-line sm:flex-none"
              >
                <Msg k="learnMore" />
              </Link>
              <Link
                href={weekReadingHref(week)}
                className="flex-1 rounded-full bg-[var(--accent)] px-4 py-2.5 text-center text-sm font-semibold text-brand-contrast transition hover:bg-[var(--accent)]/90 sm:flex-none"
              >
                <Msg k="startReading" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageSection>
  );
}
