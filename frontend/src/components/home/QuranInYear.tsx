import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import {
  getCalendarWeek,
  getCurrentProgramWeek,
  weekReadingHref,
} from '@/lib/quranic-calendar';

export function QuranInYear() {
  const weekNum = getCurrentProgramWeek();
  const week = getCalendarWeek(weekNum) ?? getCalendarWeek(1)!;

  return (
    <section className="w-full px-3 py-3 sm:px-4 sm:py-4 md:px-6" id="quran-in-year">
      <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
        <h2 className="text-lg font-bold text-slate-800 sm:text-xl md:text-2xl">Quran in a Year</h2>
        <Link
          href="/quran-in-year"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-[var(--accent)] underline underline-offset-4"
        >
          <Calendar className="h-4 w-4" />
          Calendar
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start">
          <div className="mx-auto w-32 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 sm:mx-0 sm:w-36">
            <div className="h-1.5 bg-[var(--accent)]" />
            <div className="px-3 py-4 text-center sm:py-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Week</p>
              <p className="mt-1 text-4xl font-bold tabular-nums text-slate-800">{week.week}</p>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm leading-relaxed text-slate-600 sm:text-[15px]">
              A thoughtfully designed schedule that makes it easy for you to read and understand the
              entire Quran from one Ramadan to the next, at a steady and manageable pace.
            </p>

            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:mt-5">
              This Week&apos;s Readings
            </p>

            <div className="mt-2 flex flex-col items-stretch gap-3 rounded-xl bg-slate-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-4">
              <Link href={weekReadingHref(week)} className="min-w-0 text-left transition hover:opacity-80">
                <p className="font-arabic text-xl text-slate-800 sm:text-2xl" dir="rtl" lang="ar">
                  {week.start.nameArabic}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {week.start.nameSimple} · Verse {week.start.ayah}
                </p>
                <p className="text-xs text-slate-400">
                  {week.start.surah}:{week.start.ayah}
                </p>
              </Link>

              <ArrowRight className="mx-auto h-4 w-4 shrink-0 rotate-90 text-slate-400 sm:mx-2 sm:rotate-0" />

              <Link
                href={`/surah/${week.end.surah}`}
                className="min-w-0 text-left transition hover:opacity-80 sm:text-right"
              >
                <p className="font-arabic text-xl text-slate-800 sm:text-right sm:text-2xl" dir="rtl" lang="ar">
                  {week.end.nameArabic}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {week.end.nameSimple} · Verse {week.end.ayah}
                </p>
                <p className="text-xs text-slate-400">
                  {week.end.surah}:{week.end.ayah}
                </p>
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap justify-stretch gap-2 sm:mt-5 sm:justify-end">
              <Link
                href="/quran-in-year"
                className="flex-1 rounded-full bg-slate-100 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-200 sm:flex-none"
              >
                Learn More
              </Link>
              <Link
                href={weekReadingHref(week)}
                className="flex-1 rounded-full bg-[var(--accent)] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[var(--accent)]/90 sm:flex-none"
              >
                Start reading
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
