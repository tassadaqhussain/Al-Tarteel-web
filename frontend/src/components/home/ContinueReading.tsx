'use client';

import Link from 'next/link';
import { Bookmark, ChevronRight, Sparkles, Target } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { getSurahArabicName, getSurahMeta, getSurahPath } from '@/lib/surah-meta';
import { useT } from '@/lib/i18n';
import { PageSection } from '@/components/layout/MainContainer';

const DEFAULT_CONTINUE = {
  surahNumber: 1,
  surahName: 'Al-Fatihah',
  surahNameArabic: 'الْفَاتِحَةُ',
  meaning: 'The Opening',
  ayahNumber: 1,
};

export function ContinueReading() {
  const { t } = useT();
  const lastRead = useSettingsStore((s) => s.lastRead);
  const meta = lastRead
    ? getSurahMeta(lastRead.surahNumber, lastRead.surahName)
    : getSurahMeta(DEFAULT_CONTINUE.surahNumber);

  const surahNumber = lastRead?.surahNumber ?? DEFAULT_CONTINUE.surahNumber;
  const surahName = lastRead?.surahName ?? meta.nameSimple;
  const arabic = getSurahArabicName(surahNumber, lastRead?.surahNameArabic || meta.nameArabic);
  const meaning = meta.meaning || DEFAULT_CONTINUE.meaning;
  const ayahNumber = lastRead?.ayahNumber ?? DEFAULT_CONTINUE.ayahNumber;

  return (
    <PageSection>
      <div className="mb-5 flex items-center justify-between gap-2 sm:mb-6">
        <h2 className="text-lg font-bold text-slate-800 sm:text-xl md:text-2xl">{t('continueReading')}</h2>
        <Link
          href="/my-quran"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-[var(--accent)]"
        >
          <Bookmark className="h-4 w-4" />
          {t('myQuran')}
        </Link>
      </div>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <Link
          href={getSurahPath(surahNumber)}
          className="group flex min-h-[140px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)]/40 hover:shadow-md sm:min-h-[180px] sm:p-6"
        >
          <p
            className="font-arabic text-3xl leading-normal text-slate-800 sm:text-4xl md:text-5xl"
            dir="rtl"
            lang="ar"
          >
            {arabic}
          </p>
          <div className="mt-4 flex items-end justify-between gap-3 sm:mt-6">
            <p className="min-w-0 text-sm font-medium text-slate-700 sm:text-base">
              {surahNumber}. {surahName}
              {meaning ? ` (${meaning})` : ''}
            </p>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[var(--accent)] transition group-hover:gap-1.5">
              {t('verse')} {ayahNumber}
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </Link>

        <div className="flex flex-col gap-3 sm:gap-4">
          <Link
            href="/reading-goal"
            className="group flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)]/40 hover:shadow-md sm:gap-4 sm:p-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] sm:h-12 sm:w-12">
              <Target className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-800">{t('achieveQuranGoals')}</p>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{t('achieveQuranGoalsBody')}</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
          </Link>

          <Link
            href="/settings"
            className="group flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)]/40 hover:shadow-md sm:gap-4 sm:p-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 sm:h-12 sm:w-12">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-800">{t('buildQuranExperience')}</p>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{t('buildQuranExperienceBody')}</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
          </Link>
        </div>
      </div>
    </PageSection>
  );
}
