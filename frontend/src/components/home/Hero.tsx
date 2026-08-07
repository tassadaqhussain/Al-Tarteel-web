'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Headphones,
  Compass,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { audioApi } from '@/lib/api';
import { SURAH_SIMPLE_NAMES, getSurahPath } from '@/lib/surah-meta';
import { useAudioStore, type AudioAyahRef } from '@/stores/audioStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';
import { SmartSearchBox } from '@/components/search/SmartSearchBox';

const POPULAR = [
  { name: 'Surah Al-Mulk', number: 67 },
  { name: 'Surah Ya-Sin', number: 36 },
  { name: 'Surah Al-Kahf', number: 18 },
  { name: "Surah Al-Waqi'ah", number: 56 },
];

const HERO_SURAH = 1;
const PREFERRED_RECITER = 'alafasy';
const DEFAULT_RECITER_NAME = 'Mishary Rashid Alafasy';

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function toPlaylist(list: Awaited<ReturnType<typeof audioApi.surah>>): AudioAyahRef[] {
  return list
    .filter((a) => a.url)
    .map((a) => ({
      ayahId: a.ayahId,
      surahNumber: a.surahNumber,
      ayahNumber: a.ayahNumber,
      url: a.url!,
      duration: a.duration ?? undefined,
    }));
}

export function Hero() {
  const { t } = useT();
  const [loading, setLoading] = useState(false);
  const [reciterName, setReciterName] = useState(DEFAULT_RECITER_NAME);
  const [error, setError] = useState<string | null>(null);
  const radioModeRef = useRef(false);
  const advancingRef = useRef(false);

  const settingsReciter = useSettingsStore((s) => s.reciterSlug);
  const setReciterSlug = useSettingsStore((s) => s.setReciterSlug);

  const {
    playlist,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    getCurrentAyah,
    setPlaylist,
    setPlaying,
    setReciter,
    setContinuous,
    setCurrentIndex,
    prev,
    next,
    reciterSlug,
  } = useAudioStore();

  const current = getCurrentAyah();
  const hasPlaylist = playlist.length > 0;

  const displaySurahNumber = current?.surahNumber ?? HERO_SURAH;
  const displaySurahName = `Surah ${SURAH_SIMPLE_NAMES[displaySurahNumber] || 'Al-Fatihah'}`;
  const displayReciter = reciterName;

  const { position, total } = useMemo(() => {
    let before = 0;
    let totalDur = 0;
    for (let i = 0; i < playlist.length; i++) {
      const d = playlist[i]?.duration ?? 0;
      totalDur += d;
      if (i < currentIndex) before += d;
    }
    if (totalDur > 0) {
      return { position: before + currentTime, total: totalDur };
    }
    return { position: currentTime, total: duration || 0 };
  }, [playlist, currentIndex, currentTime, duration]);

  const progressPct = total > 0 ? Math.min(100, (position / total) * 100) : 0;

  const resolveReciter = useCallback(async () => {
    const reciters = await audioApi.reciters();
    const preferred =
      reciters.find((r) => r.slug === PREFERRED_RECITER) ??
      reciters.find((r) => r.slug === (reciterSlug ?? settingsReciter ?? '')) ??
      reciters.find((r) => r.isDefault) ??
      reciters[0];
    if (!preferred) throw new Error('No reciters available');
    setReciterName(preferred.name || DEFAULT_RECITER_NAME);
    return preferred.slug;
  }, [reciterSlug, settingsReciter]);

  const loadSurah = useCallback(
    async (surahNumber: number, startPlaying = true) => {
      setLoading(true);
      setError(null);
      try {
        const slug = await resolveReciter();
        setReciter(slug);
        setReciterSlug(slug);
        const list = await audioApi.surah(surahNumber, slug);
        const items = toPlaylist(list);
        if (items.length === 0) {
          setError('Audio is not available for this surah yet.');
          setPlaying(false);
          return false;
        }
        // Continuous loops a surah; radio advances to the next surah when it ends.
        setContinuous(!radioModeRef.current);
        setPlaylist(items);
        setCurrentIndex(0);
        if (startPlaying) setPlaying(true);
        return true;
      } catch {
        setError('Could not start recitation. Please try again.');
        setPlaying(false);
        return false;
      } finally {
        setLoading(false);
        advancingRef.current = false;
      }
    },
    [
      resolveReciter,
      setContinuous,
      setCurrentIndex,
      setPlaylist,
      setPlaying,
      setReciter,
      setReciterSlug,
    ]
  );

  const togglePlay = useCallback(async () => {
    if (loading) return;
    if (hasPlaylist) {
      setPlaying(!isPlaying);
      return;
    }
    radioModeRef.current = false;
    await loadSurah(HERO_SURAH, true);
  }, [hasPlaylist, isPlaying, loadSurah, loading, setPlaying]);

  const startRadio = useCallback(async () => {
    if (loading) return;
    if (hasPlaylist && isPlaying) {
      setPlaying(false);
      return;
    }
    if (hasPlaylist && !isPlaying) {
      setPlaying(true);
      return;
    }
    radioModeRef.current = true;
    await loadSurah(HERO_SURAH, true);
  }, [hasPlaylist, isPlaying, loadSurah, loading, setPlaying]);

  // Quran Radio: when a surah finishes, advance to the next chapter.
  useEffect(() => {
    if (!radioModeRef.current || !hasPlaylist || isPlaying || loading) return;
    if (currentIndex < playlist.length - 1) return;
    if (advancingRef.current) return;

    const last = playlist[playlist.length - 1];
    if (!last) return;
    // Only auto-advance near the natural end (not a mid-ayah pause).
    if (duration > 0 && currentTime < Math.max(0, duration - 0.75)) return;

    const nextSurah = last.surahNumber >= 114 ? 1 : last.surahNumber + 1;
    advancingRef.current = true;
    void loadSurah(nextSurah, true);
  }, [
    currentIndex,
    currentTime,
    duration,
    hasPlaylist,
    isPlaying,
    loadSurah,
    loading,
    playlist,
  ]);

  const handlePrev = () => {
    if (!hasPlaylist) return;
    if (currentTime > 2) {
      const el = document.querySelector('audio');
      if (el) el.currentTime = 0;
      return;
    }
    prev();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasPlaylist) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));

    if (total <= 0 || !playlist.some((a) => (a.duration ?? 0) > 0)) {
      if (duration <= 0) return;
      const el = document.querySelector('audio');
      if (el) el.currentTime = ratio * duration;
      return;
    }

    const target = ratio * total;
    let acc = 0;
    for (let i = 0; i < playlist.length; i++) {
      const d = playlist[i]?.duration ?? 0;
      if (target <= acc + d || i === playlist.length - 1) {
        const offset = Math.max(0, target - acc);
        if (i !== currentIndex) setCurrentIndex(i);
        window.setTimeout(() => {
          const el = document.querySelector('audio');
          if (el) el.currentTime = d > 0 ? Math.min(offset, d) : 0;
        }, i !== currentIndex ? 50 : 0);
        return;
      }
      acc += d;
    }
  };

  return (
    <section className="relative w-full overflow-x-clip bg-gradient-to-br from-[#ecfdf5] via-[#f0fdfa] to-[#e0f2fe] px-4 py-16 md:py-24 lg:py-28">
      <div
        className="pointer-events-none absolute bottom-0 right-0 top-0 hidden w-1/2 overflow-hidden opacity-[0.22] lg:block"
        aria-hidden
      >
        <Image
          src="/images/hero_mosque.png"
          alt=""
          fill
          sizes="50vw"
          className="object-contain object-right-bottom"
          // Decorative; keep bandwidth for the H1 LCP candidate
          loading="lazy"
        />
      </div>

      <div className="relative z-20 mx-auto grid max-w-[1200px] grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
        <div className="text-left lg:col-span-7">
          <h1 className="mb-6 font-sans text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            {t('heroTitle')} <br />
            <span className="text-emerald-800">{t('heroTitleAccent')}</span>
          </h1>

          <div className="mb-8 flex flex-wrap gap-3">
            <Link
              href={getSurahPath(1)}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-950"
            >
              <Compass className="h-4 w-4" />
              {t('readQuranNow')}
            </Link>
            <button
              type="button"
              onClick={() => void startRadio()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-emerald-800" />
              ) : (
                <Headphones className="h-4 w-4 text-emerald-800" />
              )}
              {isPlaying && hasPlaylist ? t('pauseRadio') : t('listenRadio')}
            </button>
          </div>

          <p className="mb-8 max-w-xl text-base leading-relaxed text-slate-600">{t('heroBody')}</p>

          <SmartSearchBox
            className="max-w-xl"
            variant="hero"
            placeholder={t('searchPlaceholder')}
            searchButtonLabel={t('searchButton')}
          />

          <div className="mt-8 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="font-medium text-slate-600">{t('popular')}</span>
            {POPULAR.map((item) => (
              <Link
                key={item.number}
                href={getSurahPath(item.number)}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-semibold text-slate-600 shadow-xs transition hover:border-emerald-800/40 hover:bg-emerald-50/20 hover:text-emerald-800"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Live Player — wired to real audio */}
        <div className="flex justify-center lg:col-span-5">
          <div className="relative w-full max-w-[360px] rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-2xl backdrop-blur-md">
            <div className="absolute -left-6 -top-6 h-12 w-12 rounded-full bg-emerald-500/10 blur-xl" />
            <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-sky-500/10 blur-xl" />

            <div className="mb-6 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-800/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
                {t('livePlayer')}
              </span>
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  isPlaying ? 'animate-pulse bg-emerald-600' : 'bg-slate-300'
                )}
              />
            </div>

            <div className="mb-6 text-center">
              <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
                {isPlaying ? t('nowReciting') : t('readyToRecite')}
              </p>
              <h3 className="mt-1 text-xl font-bold text-slate-800">{displaySurahName}</h3>
              <p className="text-sm font-medium text-slate-500">{displayReciter}</p>
              {current && (
                <p className="mt-1 text-xs text-slate-400">
                  Ayah {current.ayahNumber}
                  {playlist.length > 1 ? ` of ${playlist.length}` : ''}
                </p>
              )}
            </div>

            <div className="mb-6 flex items-end justify-between gap-1 px-4" aria-hidden>
              {[0.3, 0.5, 0.8, 0.4, 0.9, 0.6, 0.75, 0.35, 0.65, 0.45, 0.7, 0.5, 0.8, 0.3, 0.55].map(
                (val, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'w-1 rounded-full transition-colors duration-300',
                      isPlaying ? 'bg-emerald-800' : 'bg-slate-300'
                    )}
                    style={{
                      height: `${val * 32}px`,
                      animation: isPlaying ? `qp-wave 1.2s ease-in-out infinite alternate` : 'none',
                      animationDelay: `${idx * 0.08}s`,
                    }}
                  />
                )
              )}
            </div>

            <div className="mb-6">
              <div
                className="h-1.5 w-full cursor-pointer rounded-full bg-slate-100"
                onClick={handleSeek}
                role="slider"
                aria-valuemin={0}
                aria-valuemax={Math.round(total || duration || 0)}
                aria-valuenow={Math.round(position || currentTime || 0)}
                aria-label="Seek"
                tabIndex={0}
              >
                <div
                  className="h-full rounded-full bg-emerald-800 transition-[width] duration-150"
                  style={{ width: `${hasPlaylist ? progressPct : 0}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs font-medium text-slate-400">
                <span>{formatTime(hasPlaylist ? position : 0)}</span>
                <span>{formatTime(hasPlaylist ? total : 0)}</span>
              </div>
            </div>

            {error && (
              <p className="mb-4 text-center text-xs text-red-600" role="alert">
                {error}
              </p>
            )}

            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={handlePrev}
                disabled={!hasPlaylist || loading}
                className="text-slate-400 transition hover:text-slate-600 disabled:opacity-30"
                aria-label="Previous ayah"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => void togglePlay()}
                disabled={loading}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-800 text-white shadow-lg transition hover:scale-105 hover:bg-emerald-900 active:scale-95 disabled:opacity-70"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-6 w-6 fill-white" />
                ) : (
                  <Play className="ml-0.5 h-6 w-6 fill-white" />
                )}
              </button>
              <button
                type="button"
                onClick={() => next()}
                disabled={!hasPlaylist || loading}
                className="text-slate-400 transition hover:text-slate-600 disabled:opacity-30"
                aria-label="Next ayah"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes qp-wave {
          0% {
            transform: scaleY(1);
          }
          100% {
            transform: scaleY(0.45);
          }
        }
      `}</style>
    </section>
  );
}
