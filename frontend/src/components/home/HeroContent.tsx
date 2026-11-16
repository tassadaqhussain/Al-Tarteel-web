'use client';

import Link from 'next/link';
import { BookOpen, ChevronRight } from 'lucide-react';
import { getSurahPath } from '@/lib/surah-meta';
import { useSettingsStore } from '@/stores/settingsStore';
import { useT } from '@/lib/i18n';
import { SmartSearchBox } from '@/components/search/SmartSearchBox';

const POPULAR = [
  { name: 'Al-Fatihah', number: 1 },
  { name: 'Al-Kahf', number: 18 },
  { name: 'Ya-Sin', number: 36 },
  { name: 'Al-Mulk', number: 67 },
  { name: 'Ar-Rahman', number: 55 },
];

export function HeroContent() {
  const { t } = useT();
  const lastRead = useSettingsStore((s) => s.lastRead);
  const primaryHref = lastRead ? getSurahPath(lastRead.surahNumber) : getSurahPath(1);
  const primaryLabel = lastRead ? t('continueReading') : t('startReading');

  return (
    <div className="relative z-10 max-w-2xl text-center sm:text-left">
      <h1 className="mx-auto max-w-2xl font-serif text-3xl font-bold leading-[1.12] tracking-tight text-ink sm:mx-0 sm:text-5xl lg:text-[3.35rem]">
        {t('heroTitle')}{' '}
        <span className="text-brand">
          {t('heroTitleAccent')}
        </span>
      </h1>

      <p className="mx-auto mt-3.5 max-w-xl text-base leading-relaxed text-ink-2 sm:mx-0 sm:text-lg">
        {t('heroBody')}
      </p>

      <SmartSearchBox
        className="mt-6 max-w-xl shadow-md sm:mt-7"
        variant="hero"
        placeholder={t('searchPlaceholder')}
        searchButtonLabel={t('searchButton')}
      />

      <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs text-ink-2 sm:justify-start">
        <span className="font-medium text-ink-3">{t('popular')}</span>
        {POPULAR.map((item) => (
          <Link
            key={item.number}
            href={getSurahPath(item.number)}
            className="inline-flex min-h-11 items-center rounded-lg border border-line bg-surface/90 px-3 py-2 text-xs font-medium text-ink-2 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            {item.name}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
        <Link
          href={primaryHref}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-brand-contrast transition hover:opacity-90"
        >
          <BookOpen className="h-4 w-4" aria-hidden />
          {primaryLabel}
          {lastRead ? <ChevronRight className="h-4 w-4" aria-hidden /> : null}
        </Link>
        <Link
          href="/surahs"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-surface/90 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          {t('exploreQuran')}
        </Link>
      </div>
    </div>
  );
}
