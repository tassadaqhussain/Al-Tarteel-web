'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, Flame, Play, Share2 } from 'lucide-react';
import { PageSection } from '@/components/layout/MainContainer';
import { quranApi } from '@/lib/api';
import { cleanTranslationText } from '@/lib/clean-translation';
import { getSurahMeta, getSurahPath } from '@/lib/surah-meta';
import { startSurahPlayback } from '@/lib/audio/playback';
import {
  SOFT_DAILY_GOAL,
  useDailyMotivationStore,
} from '@/stores/dailyMotivationStore';
import {
  formatVerseLabel,
  getCalendarWeek,
  getCurrentProgramWeek,
  weekReadingHref,
} from '@/lib/quranic-calendar';

const CURATED_DAILY_VERSES: Array<{ surah: number; ayah: number }> = [
  { surah: 2, ayah: 255 }, // Ayat al-Kursi
  { surah: 13, ayah: 28 }, // Hearts find rest in remembrance of Allah
  { surah: 94, ayah: 5 },  // With hardship comes ease
  { surah: 2, ayah: 286 }, // Allah does not burden a soul beyond its capacity
  { surah: 39, ayah: 53 }, // Do not despair of the mercy of Allah
  { surah: 65, ayah: 3 },  // Whoever relies upon Allah, He is sufficient
  { surah: 16, ayah: 90 }, // Justice and excellence
  { surah: 3, ayah: 139 }, // Do not weaken and do not grieve
  { surah: 24, ayah: 35 }, // Light upon light
  { surah: 55, ayah: 13 }, // Which of the favors of your Lord would you deny
];

function getCuratedDailyVerse() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86_400_000);
  return CURATED_DAILY_VERSES[dayOfYear % CURATED_DAILY_VERSES.length];
}

export function TodaySection() {
  const goal = useDailyMotivationStore((s) => s.goal);
  const progress = useDailyMotivationStore((s) => s.progress);
  const [shared, setShared] = useState(false);

  const initialRef = getCuratedDailyVerse();
  const [ayah, setAyah] = useState<{
    surah: number;
    ayah: number;
    surahName: string;
    textUthmani: string;
    translation: string;
  }>({
    surah: initialRef.surah,
    ayah: initialRef.ayah,
    surahName: getSurahMeta(initialRef.surah).nameSimple,
    textUthmani: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
    translation: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of all existence.',
  });

  useEffect(() => {
    let cancelled = false;
    const ref = getCuratedDailyVerse();
    quranApi
      .ayah(ref.surah, ref.ayah, { translations: 'en-sahih-international' })
      .then((res) => {
        if (cancelled || !res?.textUthmani) return;
        setAyah({
          surah: ref.surah,
          ayah: ref.ayah,
          surahName: getSurahMeta(ref.surah).nameSimple,
          textUthmani: res.textUthmani,
          translation: res.translations?.[0]?.text
            ? cleanTranslationText(res.translations[0].text)
            : '',
        });
      })
      .catch(() => {
        /* keep fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const effectiveGoal = goal ?? SOFT_DAILY_GOAL;
  const target = effectiveGoal.goalValue;
  const current =
    effectiveGoal.goalType === 'read_minutes'
      ? progress.minutesRead
      : effectiveGoal.goalType === 'tajweed_rule'
        ? progress.tajweedPracticed
          ? 1
          : 0
        : progress.ayahsRead;
  const pct = Math.min(100, Math.round((current / Math.max(1, target)) * 100));
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  const weekNum = getCurrentProgramWeek();
  const week = getCalendarWeek(weekNum) ?? getCalendarWeek(1)!;
  const yearPct = Math.min(100, Math.max(2, Math.round((week.week / 50) * 100)));

  useEffect(() => {
    if (!shared) return;
    const id = setTimeout(() => setShared(false), 2000);
    return () => clearTimeout(id);
  }, [shared]);

  const handleShare = async () => {
    const shareText = `${ayah.textUthmani}\n\n${ayah.translation}\n— ${ayah.surahName} ${ayah.surah}:${ayah.ayah}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${ayah.surahName} ${ayah.surah}:${ayah.ayah}`, text: shareText });
        return;
      } catch {
        /* fallback */
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setShared(true);
    } catch {
      /* ignore */
    }
  };

  return (
    <PageSection>
      <div className="mb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8A5E14] dark:text-amber-300">
          Daily rhythm
        </p>
        <h2 className="mt-1 font-serif text-[26px] font-bold tracking-tight text-ink">
          Today
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.85fr)_minmax(0,0.95fr)]">
        {/* 1. Ayah of the Day */}
        <article className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                Ayah of the Day
              </p>
              <span className="text-xs font-semibold text-ink-muted">
                {ayah.surahName} · {ayah.surah}:{ayah.ayah}
              </span>
            </div>
            <p
              className="mt-4 text-right font-arabic text-2xl leading-[2] text-ink sm:text-[26px]"
              dir="rtl"
              lang="ar"
              translate="no"
            >
              {ayah.textUthmani}
            </p>
            {ayah.translation && (
              <p className="mt-3 text-sm leading-relaxed text-ink-2">
                {ayah.translation}
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line-subtle pt-4">
            <Link
              href={getSurahPath(ayah.surah)}
              className="inline-flex min-h-11 items-center rounded-xl bg-[var(--accent)] px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90"
            >
              Read in context
            </Link>
            <button
              type="button"
              onClick={() =>
                void startSurahPlayback({
                  surahNumber: ayah.surah,
                  startAyah: ayah.ayah,
                  playing: true,
                })
              }
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink-2 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <Play className="h-3.5 w-3.5" aria-hidden />
              <span>Listen</span>
            </button>
            <button
              type="button"
              onClick={() => void handleShare()}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink-2 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <Share2 className="h-3.5 w-3.5" aria-hidden />
              <span>{shared ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </article>

        {/* 2. Daily goal ring */}
        <article className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
              Daily goal
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink-2">
              <Flame className="h-3.5 w-3.5 text-[#8A5E14] dark:text-amber-300" aria-hidden />
              {progress.goalCompleted
                ? 'Goal met'
                : current > 0
                  ? 'Active today'
                  : 'Start your streak today'}
            </span>
          </div>

          <div className="my-4 flex items-center gap-4">
            <svg width="84" height="84" viewBox="0 0 84 84" className="shrink-0 -rotate-90" aria-hidden>
              <circle
                cx="42"
                cy="42"
                r={r}
                fill="none"
                stroke="currentColor"
                strokeWidth="7"
                className="text-line dark:text-surface-3"
              />
              <circle
                cx="42"
                cy="42"
                r={r}
                fill="none"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                className="text-[var(--accent)] transition-all duration-300"
              />
            </svg>
            <div>
              <p className="text-2xl font-bold text-ink">
                {current} / {target}{' '}
                <span className="text-sm font-medium text-ink-muted">
                  {effectiveGoal.goalType === 'read_minutes' ? 'min' : 'ayahs'}
                </span>
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {current >= target
                  ? 'Today’s goal complete'
                  : `Read ${target} ${effectiveGoal.goalType === 'read_minutes' ? 'minutes' : 'ayahs'} today to build your habit`}
              </p>
            </div>
          </div>

          <Link
            href="/reading-goal"
            className="inline-flex min-h-11 items-center justify-between rounded-xl border border-line bg-surface-2 px-3.5 py-2 text-xs font-semibold text-ink-2 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <span>Adjust goal</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </article>

        {/* 3. Quran in a Year */}
        <article className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8A5E14] dark:text-amber-300">
                Quran in a Year
              </p>
              <Calendar className="h-4 w-4 text-ink-muted" aria-hidden />
            </div>
            <p className="mt-3 font-serif text-2xl font-bold text-ink">
              Week {week.week} of 50
            </p>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-[#8A5E14] dark:bg-amber-400"
                style={{ width: `${yearPct}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-ink-2">
              {formatVerseLabel(week.start)} → {formatVerseLabel(week.end)}
            </p>
          </div>

          <Link
            href={weekReadingHref(week)}
            className="mt-5 inline-flex min-h-11 items-center justify-between rounded-xl bg-[var(--accent)]/10 px-3.5 py-2 text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-white"
          >
            <span>Start this week&apos;s reading</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </article>
      </div>
    </PageSection>
  );
}
