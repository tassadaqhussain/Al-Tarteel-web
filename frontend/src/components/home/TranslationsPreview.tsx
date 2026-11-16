'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  ArrowRight,
  Loader2,
  Languages,
} from 'lucide-react';
import { audioApi, quranApi, type AyahWithRelations, type Surah } from '@/lib/api';
import { DEFAULT_TRANSLATION } from '@/lib/translation-preference';
import { cleanTranslationText } from '@/lib/clean-translation';
import {
  ayahPreviewUi,
  normalizeAyahList,
  PREVIEW_AYAHS,
  PREVIEW_FETCH_LIMIT,
  translationAttribution,
  type PreviewAyah,
} from '@/lib/quran/ayah-preview';
import { getSurahArabicName, getSurahMeaning, getSurahPath } from '@/lib/surah-meta';
import { useAudioStore, type AudioAyahRef } from '@/stores/audioStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';
import { SITE_SHELL } from '@/components/layout/MainContainer';
import { useT } from '@/lib/i18n';

const PREVIEW_COUNT = 6;
const PREFERRED_RECITER = 'alafasy';
const DEFAULT_RECITER_NAME = 'Mishary Rashid Alafasy';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

const PREVIEW_LANGUAGES = [
  { code: 'en', label: 'English', slug: DEFAULT_TRANSLATION, dir: 'ltr' as const },
  { code: 'ur', label: 'اردو', slug: 'bayan-ul-quran', dir: 'rtl' as const },
  { code: 'ps', label: 'پښتو', slug: 'ps-zakaria-abulsalam-118', dir: 'rtl' as const },
  { code: 'fa', label: 'فارسی', slug: 'qf-translation-135', dir: 'rtl' as const },
] as const;

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

function translationText(ayah: AyahWithRelations, targetSlug: string) {
  const preferred =
    ayah.translations?.find((t) => t.translatorSlug === targetSlug)?.text ||
    ayah.translations?.find((t) => t.translatorSlug === DEFAULT_TRANSLATION)?.text ||
    ayah.translations?.[0]?.text;
  return cleanTranslationText(preferred || '');
}

type Props = {
  surahs?: Surah[];
  initialSurahNumber?: number;
  initialAyahs?: PreviewAyah[];
};

export function TranslationsPreview({
  surahs = [],
  initialSurahNumber,
  initialAyahs = [],
}: Props) {
  const list = useMemo(() => {
    const source = surahs.length > 0 ? surahs : FALLBACK_SURAHS;
    return source.slice(0, PREVIEW_COUNT).map((s) => ({
      ...s,
      nameArabic: getSurahArabicName(s.number, s.nameArabic),
    }));
  }, [surahs]);

  const seededAyahs = useMemo(
    () => normalizeAyahList(initialAyahs) as AyahWithRelations[],
    [initialAyahs],
  );
  const defaultSurah = initialSurahNumber ?? list[0]?.number ?? 1;

  const [activeSurah, setActiveSurah] = useState(defaultSurah);
  const [activeLangSlug, setActiveLangSlug] = useState<string>(DEFAULT_TRANSLATION);
  const [ayahs, setAyahs] = useState<AyahWithRelations[]>(
    seededAyahs.length > 0 ? seededAyahs : [],
  );
  const [loadingText, setLoadingText] = useState(seededAyahs.length === 0);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [reciterName, setReciterName] = useState(DEFAULT_RECITER_NAME);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.8);

  const { t } = useT();
  const settingsReciter = useSettingsStore((s) => s.reciterSlug);
  const setReciterSlug = useSettingsStore((s) => s.setReciterSlug);

  const {
    playlist,
     isPlaying,
    currentTime,
    duration,
    getCurrentAyah,
    setPlaylist,
    setPlaying,
    setReciter,
    setContinuous,
    prev,
    next,
    reciterSlug,
  } = useAudioStore();

  const current = getCurrentAyah();
  const activeMeta = list.find((s) => s.number === activeSurah) ?? list[0];
  const activeLang =
    PREVIEW_LANGUAGES.find((l) => l.slug === activeLangSlug) ?? PREVIEW_LANGUAGES[0];
  const isThisSurah =
    current?.surahNumber === activeSurah && playlist.length > 0;
  const showingPlay = isThisSurah && isPlaying;

  const previewAyahs = useMemo(() => {
    if (ayahs.length === 0) return [];
    if (ayahs.length <= PREVIEW_AYAHS + 2) return ayahs;
    return ayahs.slice(0, PREVIEW_AYAHS);
  }, [ayahs]);
  const previewUi = ayahPreviewUi({ loading: loadingText, ayahs: previewAyahs });
  const translatorLabel =
    translationAttribution(previewAyahs) ?? 'Saheeh International';

  const ayahCache = useRef<Record<string, AyahWithRelations[]>>(
    seededAyahs.length > 0 ? { [`${defaultSurah}:${DEFAULT_TRANSLATION}`]: seededAyahs } : {},
  );

  const loadAyahs = useCallback(
    async (surahNumber: number, translationSlug: string, force = false) => {
      const cacheKey = `${surahNumber}:${translationSlug}`;
      const cached = ayahCache.current[cacheKey];
      if (!force && cached?.length) {
        setAyahs(cached);
        setLoadingText(false);
        setError(null);
        return;
      }
      setLoadingText(true);
      setError(null);
      try {
        const rows = await quranApi.ayahsBySurah(surahNumber, {
          translations: translationSlug,
          limit: PREVIEW_FETCH_LIMIT,
        });
        const nextRows = normalizeAyahList(rows) as AyahWithRelations[];
        if (nextRows.length > 0) ayahCache.current[cacheKey] = nextRows;
        setAyahs(nextRows);
        if (nextRows.length === 0) {
          setError('Could not load verses for this chapter.');
        }
      } catch {
        setAyahs([]);
        setError('Could not load verses for this chapter.');
      } finally {
        setLoadingText(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadAyahs(activeSurah, activeLangSlug);
  }, [activeSurah, activeLangSlug, loadAyahs]);

  useEffect(() => {
    const el = document.querySelector('audio');
    if (el) el.volume = volume;
  }, [volume, isPlaying, current?.url]);

  const resolveReciter = useCallback(async () => {
    const reciters = await audioApi.reciters();
    const preferred =
      reciters.find((r) => r.slug === PREFERRED_RECITER) ??
      reciters.find((r) => r.isDefault) ??
      reciters.find((r) => r.slug === (reciterSlug ?? settingsReciter ?? '')) ??
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
        setPlaylist(items, 0);
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
    <section className="w-full bg-brand/[0.06] py-14 2xl:py-18">
      <div className={SITE_SHELL}>
        <div className="mb-8 flex flex-col items-center justify-between gap-4 text-center lg:flex-row lg:text-left">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl 2xl:text-5xl">
              {t('hearQuranTitle')} <br className="sm:hidden" />
              <span className="text-brand">{t('hearQuranAccent')}</span>
            </h2>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface p-1 shadow-sm">
            <span className="inline-flex items-center gap-1 pl-2.5 pr-1 text-xs font-semibold text-ink-muted">
              <Languages className="h-3.5 w-3.5 text-brand" aria-hidden />
              <span className="hidden sm:inline">Translation:</span>
            </span>
            {PREVIEW_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setActiveLangSlug(lang.slug)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-bold transition',
                  activeLangSlug === lang.slug
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-ink-2 hover:bg-surface-2 hover:text-brand'
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-2 lg:col-span-4">
            <div className="rounded-3xl border border-line-subtle bg-surface p-3 shadow-sm">
              {list.map((s) => {
                const meaning = getSurahMeaning(s.number);
                return (
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
                      'flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-all duration-200',
                      activeSurah === s.number
                        ? 'bg-emerald-800/10 font-bold text-brand ring-1 ring-emerald-800/20'
                        : 'text-ink-3 hover:bg-surface-2'
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-ink-faint">
                        {String(s.number).padStart(2, '0')} {meaning ? `· ${meaning}` : ''}
                      </p>
                      <p
                        className={cn(
                          'text-sm font-bold',
                          activeSurah === s.number ? 'text-brand' : 'text-ink'
                        )}
                      >
                        {s.nameSimple}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-arabic text-base text-ink" dir="rtl" lang="ar">
                        {s.nameArabic}
                      </p>
                      <p className="text-[10px] text-ink-faint">
                        {s.numberOfAyahs || '—'} Verses
                      </p>
                    </div>
                  </button>
                );
              })}
              <div className="mt-2 border-t border-line-subtle pt-2 text-center">
                <Link
                  href="/surahs"
                  className="inline-flex items-center gap-1.5 py-2 text-xs font-bold text-brand hover:underline"
                >
                  {t('viewMoreChapters')}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="flex h-full flex-col justify-between rounded-3xl border border-line-subtle bg-surface p-6 shadow-lg md:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line-subtle pb-4">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-lg font-bold text-ink">
                        {activeMeta?.nameSimple ?? 'Surah'}
                      </h3>
                      {activeMeta?.nameArabic && (
                        <span className="font-arabic text-lg text-brand" dir="rtl" lang="ar">
                          {activeMeta.nameArabic}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-faint">
                      {activeLang.label} — {translatorLabel}
                    </p>
                  </div>
                </div>
                <Link
                  href={getSurahPath(activeSurah)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-800/10 px-4 py-1.5 text-xs font-bold text-brand transition hover:bg-emerald-800/20"
                >
                  {t('openReader')}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>

              <div className="my-auto flex flex-col items-center justify-center py-2 text-center">
                {previewUi === 'loading' ? (
                  <VersePreviewSkeleton />
                ) : previewUi === 'retry' ? (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <p className="text-sm text-ink-muted">
                      {error || t('loadVersesError')}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => void loadAyahs(activeSurah, activeLangSlug, true)}
                        className="rounded-full bg-emerald-800 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-900"
                      >
                        Try again
                      </button>
                      <Link
                        href={getSurahPath(activeSurah)}
                        className="rounded-full bg-emerald-800/10 px-4 py-1.5 text-xs font-bold text-brand hover:bg-emerald-800/20"
                      >
                        {t('openReader')}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-4xl space-y-4">
                    {previewAyahs.map((ayah) => {
                      const tr = translationText(ayah, activeLangSlug);
                      const isActiveVerse =
                        isThisSurah && current?.ayahNumber === ayah.number;
                      return (
                        <div
                          key={ayah.id ?? ayah.number}
                          className={cn(
                            'rounded-2xl border border-transparent px-4 py-3 transition',
                            isActiveVerse
                              ? 'border-emerald-800/20 bg-emerald-800/5 shadow-sm'
                              : 'hover:bg-surface-2/60'
                          )}
                        >
                          <p
                            className="font-arabic text-2xl leading-loose text-ink 2xl:text-3xl"
                            dir="rtl"
                            lang="ar"
                          >
                            {ayah.textUthmani}{' '}
                            <span className="ml-2 inline-flex h-6 w-6 items-center justify-center align-middle rounded-full border border-emerald-800/30 font-sans text-[10px] font-bold text-brand">
                              {toArabicNum(ayah.number)}
                            </span>
                          </p>
                          {tr && (
                            <p
                              className={cn(
                                'mt-2 text-sm leading-relaxed text-ink-muted',
                                activeLang.dir === 'rtl' ? 'font-arabic text-base not-italic' : 'italic'
                              )}
                              dir={activeLang.dir}
                              lang={activeLang.code}
                            >
                              {activeLang.dir === 'ltr' ? `“${tr}”` : tr}
                            </p>
                          )}
                        </div>
                      );
                    })}
                    {(ayahs.length > previewAyahs.length ||
                      (activeMeta?.numberOfAyahs ?? 0) > previewAyahs.length) && (
                      <div className="pt-2">
                        <Link
                          href={getSurahPath(activeSurah)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
                        >
                          {t('continueFullReader')}
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-line-subtle bg-surface-2 p-4 md:flex-row md:items-center">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void onPrev()}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface hover:text-brand"
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
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface hover:text-brand"
                    aria-label="Next verse"
                  >
                    <SkipForward className="h-4 w-4" />
                  </button>
                  <div>
                    <p className="text-xs font-bold text-ink">{verseLabel}</p>
                    <p className="text-[10px] text-ink-faint">{reciterName}</p>
                  </div>
                </div>

                <div className="flex flex-1 items-center gap-3">
                  <span className="text-[10px] font-medium text-ink-faint">
                    {formatTime(displayTime)}
                  </span>
                  <button
                    type="button"
                    className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-line"
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
                  <span className="text-[10px] font-medium text-ink-faint">
                    {formatTime(displayDuration)}
                  </span>
                </div>

                <div className="hidden items-center gap-2 md:flex">
                  <Volume2 className="h-4 w-4 text-ink-faint" />
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

              {error && previewUi === 'ready' && (
                <p className="mt-3 text-center text-xs text-danger" role="alert">
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

function VersePreviewSkeleton() {
  return (
    <div className="w-full max-w-xl space-y-6 py-4" aria-busy="true" aria-label="Loading verses">
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-3">
          <div className="ml-auto h-7 w-4/5 animate-pulse rounded-full bg-surface-3" />
          <div className="ml-auto h-7 w-3/5 animate-pulse rounded-full bg-surface-3" />
          <div className="mx-auto h-3 w-2/3 animate-pulse rounded-full bg-surface-3" />
        </div>
      ))}
    </div>
  );
}
