'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { getSurahArabicName, getSurahMeta, getSurahPath } from '@/lib/surah-meta';
import { getSurahAyahCount } from '@/lib/surah-pagination';
import { quranApi } from '@/lib/api';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { useT } from '@/lib/i18n';
import { SmartSearchBox } from '@/components/search/SmartSearchBox';
import { trackContinueReadingClick } from '@/lib/analytics';

function formatTimeAgo(ts: number): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return 'just now';
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

export function HeroContent() {
  const { t } = useT();
  const lastRead = useSettingsStore((s) => s.lastRead);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const showContinue = Boolean(isAuthenticated && lastRead);

  const surahNumber = showContinue && lastRead ? lastRead.surahNumber : 1;
  const meta = getSurahMeta(surahNumber, showContinue ? lastRead?.surahName : undefined);
  const arabicName = getSurahArabicName(surahNumber, meta.nameArabic);
  const totalAyahs = getSurahAyahCount(surahNumber);
  const currentAyah = showContinue && lastRead ? Math.min(lastRead.ayahNumber, totalAyahs) : 1;
  const pct = Math.min(100, Math.max(4, Math.round((currentAyah / Math.max(1, totalAyahs)) * 100)));
  const [verseArabicSnippet, setVerseArabicSnippet] = useState<string | null>(null);

  useEffect(() => {
    if (!showContinue || !lastRead) {
      setVerseArabicSnippet(null);
      return;
    }
    let cancelled = false;
    quranApi
      .ayah(surahNumber, currentAyah)
      .then((res) => {
        if (cancelled || !res?.textUthmani) return;
        const words = res.textUthmani.trim().split(/\s+/).slice(0, 6).join(' ');
        setVerseArabicSnippet(words ? `${words}…` : res.textUthmani);
      })
      .catch(() => {
        if (!cancelled) setVerseArabicSnippet(null);
      });
    return () => {
      cancelled = true;
    };
  }, [showContinue, lastRead, surahNumber, currentAyah]);

  return (
    <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
      <div className="text-center sm:text-left">
        <h1 className="mx-auto max-w-2xl font-serif text-3xl font-bold leading-[1.12] tracking-tight text-ink sm:mx-0 sm:text-5xl lg:text-[3.25rem]">
          {t('heroTitle')}{' '}
          <span className="text-[var(--accent)]">{t('heroTitleAccent')}</span>
        </h1>

        <p className="mx-auto mt-3.5 max-w-xl text-base leading-relaxed text-ink-2 sm:mx-0 sm:text-lg">
          {t('heroBody')}
        </p>

        <SmartSearchBox
          className="mt-6 max-w-xl sm:mt-7"
          variant="hero"
          placeholder="Search a surah, verse (2:255) or topic"
          searchButtonLabel={t('searchButton')}
        />
      </div>

      {/* Continue reading / Start with Al-Fatihah card */}
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        {showContinue && lastRead ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                  {t('continueReading')}
                </p>
                <p className="mt-1 text-base font-bold text-ink">
                  {meta.nameSimple} · {surahNumber}:{currentAyah}
                </p>
              </div>
              <span
                className="font-arabic text-2xl leading-none text-ink"
                dir="rtl"
                lang="ar"
              >
                {arabicName}
              </span>
            </div>

            <p
              className="mt-3 truncate rounded-xl bg-surface-2 px-3.5 py-2.5 text-right font-arabic text-xl leading-relaxed text-ink"
              dir="rtl"
              lang="ar"
            >
              {verseArabicSnippet ||
                (surahNumber === 1
                  ? 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'
                  : 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')}
            </p>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-ink-muted">
                <span>
                  {currentAyah} of {totalAyahs} verses
                </span>
                <span>Last read {formatTimeAgo(lastRead.timestamp)}</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <Link
              href={getSurahPath(surahNumber)}
              onClick={() => trackContinueReadingClick(surahNumber, currentAyah)}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <span>Resume</span>
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                  Start reading
                </p>
                <p className="mt-1 text-base font-bold text-ink">Start with Al-Fatihah</p>
                <p className="text-xs text-ink-muted">The Opening · 7 verses</p>
              </div>
              <span
                className="font-arabic text-2xl leading-none text-ink"
                dir="rtl"
                lang="ar"
              >
                الفاتحة
              </span>
            </div>

            <p
              className="mt-3 truncate rounded-xl bg-surface-2 px-3.5 py-2.5 text-right font-arabic text-xl leading-relaxed text-ink"
              dir="rtl"
              lang="ar"
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>

            <Link
              href={getSurahPath(1)}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <BookOpen className="h-4 w-4" aria-hidden />
              <span>Start reading</span>
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
