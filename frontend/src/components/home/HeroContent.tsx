'use client';

import Link from 'next/link';
import { BookOpen, ChevronRight, Headphones, Languages } from 'lucide-react';
import { getSurahPath } from '@/lib/surah-meta';
import { useSettingsStore } from '@/stores/settingsStore';
import { useT } from '@/lib/i18n';
import { SmartSearchBox } from '@/components/search/SmartSearchBox';
import { SiteLogo } from '@/components/SiteLogo';

const POPULAR = [
  { name: 'Al-Fatihah', number: 1 },
  { name: 'Al-Kahf', number: 18 },
  { name: 'Ya-Sin', number: 36 },
  { name: 'Al-Mulk', number: 67 },
];

const FEATURES = [
  { label: 'Read', icon: BookOpen },
  { label: 'Listen', icon: Headphones },
  { label: 'Translate', icon: Languages },
];

export function HeroContent() {
  const { t } = useT();
  const lastRead = useSettingsStore((s) => s.lastRead);
  const primaryHref = lastRead ? getSurahPath(lastRead.surahNumber) : getSurahPath(1);
  const primaryLabel = lastRead ? t('continueReading') : t('startReading');

  return (
    <div className="relative z-10 max-w-[690px] text-center sm:text-left">
        <p className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/85 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-900 shadow-sm backdrop-blur sm:mx-0">
          <SiteLogo size={18} className="h-4 w-4" alt="" />
          QuranPilot
        </p>
        <h1 className="mx-auto max-w-2xl font-sans text-[2.35rem] font-extrabold leading-[1.08] text-slate-950 sm:mx-0 sm:text-5xl md:text-[3.65rem] lg:text-[4rem]">
          {t('heroTitle')}{' '}
          <span className="text-emerald-900">
            {t('heroTitleAccent')}
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base font-medium leading-7 text-slate-700 sm:mx-0 sm:mt-5 sm:text-lg sm:leading-8">
          {t('heroBody')}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          {FEATURES.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-emerald-900/10 bg-white/85 px-2.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur sm:min-h-11 sm:px-4 sm:text-sm"
            >
              <Icon className="h-4 w-4 text-emerald-800" aria-hidden />
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
          <Link
            href={primaryHref}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-950 hover:shadow-xl"
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            {primaryLabel}
            {lastRead ? <ChevronRight className="h-4 w-4" aria-hidden /> : null}
          </Link>
          <Link
            href="/surahs"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-emerald-900/15 bg-white/85 px-6 py-3 text-sm font-bold text-slate-800 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-emerald-800/40 hover:text-emerald-900 hover:shadow-md"
          >
            {t('exploreQuran')}
          </Link>
        </div>

        <SmartSearchBox
          className="mt-6 max-w-2xl shadow-xl shadow-emerald-950/10 sm:mt-7"
          variant="hero"
          placeholder={t('searchPlaceholder')}
          searchButtonLabel={t('searchButton')}
        />

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-700 sm:mt-5 sm:justify-start">
          <span className="font-semibold text-slate-700">{t('popular')}</span>
          {POPULAR.map((item) => (
            <Link
              key={item.number}
              href={getSurahPath(item.number)}
              className="rounded-full border border-emerald-900/10 bg-white/85 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur transition hover:border-emerald-800/40 hover:text-emerald-900"
            >
              {item.name}
            </Link>
          ))}
        </div>
    </div>
  );
}
