'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { audioApi, quranApi, type AyahWithRelations, type Surah } from '@/lib/api';
import { DEFAULT_TRANSLATION } from '@/lib/translation-preference';
import { getSurahArabicName } from '@/lib/surah-meta';
import { useAudioStore, type AudioAyahRef } from '@/stores/audioStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';

const PREVIEW_COUNT = 6;
const PREVIEW_AYAHS = 5;
const PREFERRED_RECITER = 'alafasy';
const DEFAULT_RECITER_NAME = 'Mishary Rashid Alafasy';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

const FALLBACK_SURAHS: Surah[] = [
  { id: 1, number: 1, nameSimple: 'Al-Fatihah', nameArabic: 'الفاتحة', nameComplex: null, revelationPlace: '', revelationOrder: null, numberOfAyahs: 7 },
  { id: 2, number: 2, nameSimple: 'Al-Baqarah', nameArabic: 'البقرة', nameComplex: null, revelationPlace: '', revelationOrder: null, numberOfAyahs: 286 },
  { id: 3, number: 3, nameSimple: 'Al-Imran', nameArabic: 'آل عمران', nameComplex: null, revelationPlace: '', revelationOrder: null, numberOfAyahs: 200 },
  { id: 4, number: 4, nameSimple: 'An-Nisa', nameArabic: 'النساء', nameComplex: null, revelationPlace: '', revelationOrder: null, numberOfAyahs: 176 },
  { id: 5, number: 5, nameSimple: "Al-Ma'idah", nameArabic: 'المائدة', nameComplex: null, revelationPlace: '', revelationOrder: null, numberOfAyahs: 120 },
  { id: 6, number: 6, nameSimple: "Al-An'am", nameArabic: 'الأنعام', nameComplex: null, revelationPlace: '', revelationOrder: null, numberOfAyahs: 165 },
];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function toArabicNum(n: number) {
  return String(n).replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)] ?? d);
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

function translationText(ayah: AyahWithRelations) {
  const preferred =
    ayah.translations?.find((t) => t.translatorSlug === DEFAULT_TRANSLATION)?.text ||
    ayah.translations?.[0]?.text;
  return preferred?.trim() || '';
}

export function TranslationsPreview({ surahs = [] }: { surahs?: Surah[] }) {
  const list = useMemo(() => {
    const source = surahs.length > 0 ? surahs : FALLBACK_SURAHS;
    return source.slice(0, PREVIEW_COUNT).map((s) => ({
      ...s,
      nameArabic: getSurahArabicName(s.number, s.nameArabic),
    }));
  }, [surahs]);

  const [activeSurah, setActiveSurah] = useState(list[0]?.number ?? 1);
  const [ayahs, setAyahs] = useState<AyahWithRelations[]>([]);
  const [loadingText, setLoadingText] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [reciterName, setReciterName] = useState(DEFAULT_RECITER_NAME);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.8);

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
  const activeMeta = list.find((s) => s.number === activeSurah) ?? list[0];
  const isThisSurah =
    current?.surahNumber === activeSurah && playlist.length > 0;
  const showingPlay = isThisSurah && isPlaying;

  const previewAyahs = useMemo(() => {
    if (ayahs.length === 0) return [];
    // Full short surahs; longer ones show a sample.
    if (ayahs.length <= PREVIEW_AYAHS + 2) return ayahs;
    return ayahs.slice(0, PREVIEW_AYAHS);
  }, [ayahs]);

  useEffect(() => {
    let cancelled = false;
    setLoadingText(true);
    setError(null);
    quranApi
      .ayahsBySurah(activeSurah, {
        translations: DEFAULT_TRANSLATION,
        limit: Math.max(PREVIEW_AYAHS + 2, 12),
      })
      .then((rows) => {
        if (!cancelled) setAyahs(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!cancelled) {
          setAyahs([]);
          setError('Could not load verses for this chapter.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingText(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeSurah]);

  useEffect(() => {
    const el = document.querySelector('audio');
    if (el) el.volume = volume;
  }, [volume, isPlaying, current?.url]);

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

  const loadSurahAudio = useCallback(
    async (surahNumber: number, startPlaying = true) => {
      setLoadingAudio(true);
      setError(null);
      try {
        const slug = await resolveReciter();
        setReciter(slug);
        setReciterSlug(slug);
        const audioList = await audioApi.surah(surahNumber, slug);
        const items = toPlaylist(audioList);
        if (items.length === 0) {
          setError('Audio is not available for this surah yet.');
          setPlaying(false);
          return false;
        }
        setContinuous(true);
        setPlaylist(items);
        setCurrentIndex(0);
        if (startPlaying) setPlaying(true);
        return true;
      } catch {
        setError('Could not start recitation. Please try again.');
        setPlaying(false);
        return false;
      } finally {
        setLoadingAudio(false);
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
    if (loadingAudio) return;
    if (isThisSurah) {
      setPlaying(!isPlaying);
      return;
    }
    await loadSurahAudio(activeSurah, true);
  }, [activeSurah, isPlaying, isThisSurah, loadSurahAudio, loadingAudio, setPlaying]);

  const onPrev = useCallback(async () => {
    if (!isThisSurah) {
      await loadSurahAudio(activeSurah, true);
      return;
    }
    if (currentTime > 2) {
      const el = document.querySelector('audio');
      if (el) el.currentTime = 0;
      return;
    }
    prev();
  }, [activeSurah, currentTime, isThisSurah, loadSurahAudio, prev]);

  const onNext = useCallback(async () => {
    if (!isThisSurah) {
      await loadSurahAudio(activeSurah, true);
      return;
    }
    next();
  }, [activeSurah, isThisSurah, loadSurahAudio, next]);

  const seek = useCallback(
    (ratio: number) => {
      if (!isThisSurah || duration <= 0) return;
      const el = document.querySelector('audio');
      if (el) el.currentTime = Math.max(0, Math.min(duration, ratio * duration));
    },
    [duration, isThisSurah]
  );

  const displayTime = isThisSurah ? currentTime : 0;
  const displayDuration = isThisSurah ? duration : 0;
  const progressPct =
    displayDuration > 0 ? Math.min(100, (displayTime / displayDuration) * 100) : 0;
  const verseLabel = isThisSurah && current
    ? `Recitation - Verse ${current.ayahNumber}`
    : 'Recitation - Verse 1';

  return (
    <section className="w-full bg-[#f4fbf9] px-4 py-16 md:px-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Hear the Quran <br className="sm:hidden" />
            <span className="text-emerald-800">accompanied by translations.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-2 lg:col-span-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
              {list.map((s) => (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => {
                    setActiveSurah(s.number);
                    if (isPlaying && current?.surahNumber !== s.number) {
                      setPlaying(false);
                    }
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all duration-200',
                    activeSurah === s.number
                      ? 'bg-emerald-800/10 font-bold text-emerald-900'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-400">
                      {String(s.number).padStart(2, '0')}
                    </p>
                    <p
                      className={cn(
                        'text-sm font-bold',
                        activeSurah === s.number ? 'text-emerald-900' : 'text-slate-800'
                      )}
                    >
                      {s.nameSimple}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-arabic text-sm text-slate-800" dir="rtl">
                      {s.nameArabic}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {s.numberOfAyahs || '—'} Verses
                    </p>
                  </div>
                </button>
              ))}
              <div className="mt-2 border-t border-slate-100 pt-2 text-center">
                <Link
                  href="/surahs"
                  className="inline-flex items-center gap-1.5 py-2 text-xs font-bold text-emerald-800 hover:underline"
                >
                  View More Chapters
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="flex h-full min-h-[420px] flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-lg md:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {activeMeta?.nameSimple ?? 'Surah'}
                  </h3>
                  <p className="text-xs text-slate-400">English - Sahih International</p>
                </div>
                <Link
                  href={`/surah/${activeSurah}`}
                  className="rounded-full bg-emerald-800/10 px-4 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-800/20"
                >
                  Open Reader
                </Link>
              </div>

              <div className="my-auto flex min-h-[200px] flex-col items-center justify-center py-4 text-center">
                {loadingText ? (
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-800" />
                ) : previewAyahs.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    {error || 'No verses available for this chapter yet.'}
                  </p>
                ) : (
                  <div className="w-full max-w-xl space-y-6">
                    {previewAyahs.map((ayah) => {
                      const en = translationText(ayah);
                      const isActiveVerse =
                        isThisSurah && current?.ayahNumber === ayah.number;
                      return (
                        <div
                          key={ayah.id}
                          className={cn(
                            'rounded-2xl px-2 py-1 transition',
                            isActiveVerse && 'bg-emerald-800/5'
                          )}
                        >
                          <p
                            className="font-arabic text-2xl leading-loose text-slate-800"
                            dir="rtl"
                            lang="ar"
                          >
                            {ayah.textUthmani}{' '}
                            <span className="ml-2 inline-flex h-6 w-6 items-center justify-center align-middle rounded-full border border-emerald-800/30 font-sans text-[10px] font-bold text-emerald-800">
                              {toArabicNum(ayah.number)}
                            </span>
                          </p>
                          {en && (
                            <p className="mt-2 text-sm italic text-slate-500">
                              &ldquo;{en}&rdquo;
                            </p>
                          )}
                        </div>
                      );
                    })}
                    {(ayahs.length > previewAyahs.length ||
                      (activeMeta?.numberOfAyahs ?? 0) > previewAyahs.length) && (
                      <Link
                        href={`/surah/${activeSurah}`}
                        className="inline-flex text-xs font-bold text-emerald-800 hover:underline"
                      >
                        Continue in full reader →
                      </Link>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-col justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void onPrev()}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-emerald-800"
                    aria-label="Previous verse"
                  >
                    <SkipBack className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void togglePlay()}
                    disabled={loadingAudio}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-white shadow-sm transition hover:bg-emerald-900 disabled:opacity-60"
                    aria-label={showingPlay ? 'Pause' : 'Play'}
                  >
                    {loadingAudio ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : showingPlay ? (
                      <Pause className="h-4 w-4 fill-white" />
                    ) : (
                      <Play className="ml-0.5 h-4 w-4 fill-white" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => void onNext()}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-emerald-800"
                    aria-label="Next verse"
                  >
                    <SkipForward className="h-4 w-4" />
                  </button>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{verseLabel}</p>
                    <p className="text-[10px] text-slate-400">{reciterName}</p>
                  </div>
                </div>

                <div className="flex flex-1 items-center gap-3">
                  <span className="text-[10px] font-medium text-slate-400">
                    {formatTime(displayTime)}
                  </span>
                  <button
                    type="button"
                    className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200"
                    aria-label="Seek"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const ratio = (e.clientX - rect.left) / rect.width;
                      seek(ratio);
                    }}
                  >
                    <div
                      className="h-full bg-emerald-800 transition-all duration-150"
                      style={{ width: `${progressPct}%` }}
                    />
                  </button>
                  <span className="text-[10px] font-medium text-slate-400">
                    {formatTime(displayDuration)}
                  </span>
                </div>

                <div className="hidden items-center gap-2 md:flex">
                  <Volume2 className="h-4 w-4 text-slate-400" />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="h-1 w-16 cursor-pointer accent-emerald-800"
                    aria-label="Volume"
                  />
                </div>
              </div>

              {error && !loadingText && (
                <p className="mt-3 text-center text-xs text-red-600" role="alert">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
