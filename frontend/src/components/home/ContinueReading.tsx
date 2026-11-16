'use client';

import Link from 'next/link';
import { Bookmark, ChevronRight, Settings, Target } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { getSurahArabicName, getSurahMeta, getSurahPath } from '@/lib/surah-meta';
import { useT } from '@/lib/i18n';
import { trackContinueReadingClick } from '@/lib/analytics';
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
      <div className="mb-4 flex items-center justify-between gap-2 sm:mb-5">
        <h2 className="text-lg font-bold text-ink sm:text-xl">
          {lastRead ? t('continueReading') : t('startReading')}
        </h2>
        <Link
          href="/my-quran"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-3 transition hover:text-[var(--accent)]"
        >
          <Bookmark className="h-4 w-4" />
          {t('myQuran')}
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Link
          href={getSurahPath(surahNumber)}
          onClick={() => trackContinueReadingClick(surahNumber, ayahNumber)}
          className="group flex min-h-[150px] flex-col justify-between rounded-xl border border-line bg-surface p-5 transition hover:border-[var(--accent)]/60 sm:min-h-[170px] sm:p-6"
        >
          <p
            className="font-arabic text-3xl leading-normal text-ink sm:text-4xl"
            dir="rtl"
            lang="ar"
          >
            {arabic}
          </p>
          <div className="mt-4 flex items-end justify-between gap-3 sm:mt-6">
            <p className="min-w-0 text-sm font-semibold text-ink sm:text-base">
              {surahNumber}. {surahName}
              {meaning ? <span className="font-normal text-ink-muted"> ({meaning})</span> : ''}
            </p>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[var(--accent)]">
              {lastRead ? (
                <>
                  {t('verse')} {ayahNumber}
                  <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </>
              ) : (
                <>
                  {t('startReading')}
                  <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </>
              )}
            </span>
          </div>
        </Link>

        <div className="flex flex-col gap-3 sm:gap-4">
          <Link
            href="/reading-goal"
            className="group flex flex-1 items-center gap-3.5 rounded-xl border border-line bg-surface p-4 transition hover:border-[var(--accent)]/60 sm:p-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink-2">
              <Target className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink sm:text-base">{t('achieveQuranGoals')}</p>
              <p className="mt-0.5 text-xs text-ink-muted sm:text-sm">{t('achieveQuranGoalsBody')}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
          </Link>

          <Link
            href="/settings"
            className="group flex flex-1 items-center gap-3.5 rounded-xl border border-line bg-surface p-4 transition hover:border-[var(--accent)]/60 sm:p-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink-2">
              <Settings className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink sm:text-base">{t('buildQuranExperience')}</p>
              <p className="mt-0.5 text-xs text-ink-muted sm:text-sm">{t('buildQuranExperienceBody')}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
          </Link>
        </div>
      </div>
    </PageSection>
  );
}
