'use client';

import { useCallback, useState } from 'react';
import { ChevronDown, Info, Pause, Play } from 'lucide-react';
import { TranslationSheet } from './TranslationSheet';
import { audioApi } from '@/lib/api';
import { loadWordTimings } from '@/lib/loadWordTimings';
import { useAudioStore } from '@/stores/audioStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';

interface Props {
  translationCount: number;
  surahNumber: number;
  surahName?: string;
}

export function ChapterControls({ translationCount, surahNumber, surahName }: Props) {
  const [translationOpen, setTranslationOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const readerViewMode = useSettingsStore((s) => s.readerViewMode);
  const setReaderViewMode = useSettingsStore((s) => s.setReaderViewMode);
  const settingsReciter = useSettingsStore((s) => s.reciterSlug);
  const setReciterSlug = useSettingsStore((s) => s.setReciterSlug);
  const { setPlaylist, setPlaying, setReciter, setContinuous, reciterSlug, getCurrentAyah, isPlaying } =
    useAudioStore();

  const current = getCurrentAyah();
  const isThisSurahPlaying =
    isPlaying && current?.surahNumber === surahNumber;

  const handleListen = useCallback(async () => {
    if (isThisSurahPlaying) {
      useAudioStore.setState((s) => ({ isPlaying: !s.isPlaying }));
      return;
    }
    try {
      const reciters = await audioApi.reciters();
      const requestedReciter = reciterSlug ?? settingsReciter;
      const activeReciter =
        reciters.find((r) => r.slug === requestedReciter)?.slug ??
        reciters.find((r) => r.isDefault)?.slug ??
        reciters[0]?.slug;
      if (!activeReciter) return;
      setReciter(activeReciter);
      setReciterSlug(activeReciter);
      const list = await audioApi.surah(surahNumber, activeReciter);
      const items = list
        .filter((a) => a.url)
        .map((a) => ({
          ayahId: a.ayahId,
          surahNumber: a.surahNumber,
          ayahNumber: a.ayahNumber,
          url: a.url!,
          duration: a.duration ?? undefined,
        }));
      if (items.length === 0) return;
      const startIdx =
        current?.surahNumber === surahNumber
          ? Math.max(0, items.findIndex((a) => a.ayahId === current.ayahId))
          : 0;
      setContinuous(false);
      setPlaylist(items, startIdx >= 0 ? startIdx : 0);
      setPlaying(true);
      void loadWordTimings(surahNumber, activeReciter);
    } catch {
      // Audio is optional
    }
  }, [
    current?.ayahId,
    current?.surahNumber,
    isThisSurahPlaying,
    reciterSlug,
    settingsReciter,
    setContinuous,
    setPlaylist,
    setPlaying,
    setReciter,
    setReciterSlug,
    surahNumber,
  ]);

  const translationLabel =
    translationCount > 0
      ? translationCount === 1
        ? 'Translation'
        : `${translationCount} translations`
      : 'Select translation';

  const arabicActive = readerViewMode === 'arabic' || readerViewMode === 'verse';
  const translationActive = readerViewMode === 'translation';

  return (
    <>
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleListen()}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm hover:border-slate-300"
          >
            {isThisSurahPlaying ? (
              <Pause className="h-3.5 w-3.5 fill-slate-800 text-slate-800" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-slate-800 text-slate-800" />
            )}
            Listen
          </button>
          <button
            type="button"
            onClick={() => setInfoOpen((v) => !v)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm hover:border-slate-300"
            aria-expanded={infoOpen}
          >
            <Info className="h-4 w-4 text-slate-600" /> Info
          </button>
        </div>

        {translationActive ? (
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => setReaderViewMode('arabic')}
              className="inline-flex h-9 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm hover:border-slate-300"
            >
              Arabic
            </button>
            <button
              type="button"
              onClick={() => setTranslationOpen(true)}
              className="inline-flex h-9 max-w-[14rem] items-center justify-between gap-2 rounded-full bg-slate-800 px-4 text-sm font-medium text-white shadow-sm"
            >
              <span className="truncate">{translationLabel}</span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
            </button>
          </div>
        ) : (
          <div
            className="inline-flex h-9 self-start overflow-hidden rounded-full border border-slate-200 bg-white p-0.5 shadow-sm sm:self-auto"
            role="group"
            aria-label="Script view"
          >
            <button
              type="button"
              onClick={() => setReaderViewMode('arabic')}
              className={cn(
                'rounded-full px-4 text-sm font-medium transition-colors',
                arabicActive ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-800'
              )}
            >
              Arabic
            </button>
            <button
              type="button"
              onClick={() => setReaderViewMode('translation')}
              className={cn(
                'rounded-full px-4 text-sm font-medium transition-colors',
                translationActive ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-800'
              )}
            >
              Translation
            </button>
          </div>
        )}
      </div>

      {infoOpen && (
        <p className="mt-3 max-w-xl text-xs leading-relaxed text-slate-500">
          Read and listen to{surahName ? ` Surah ${surahName}` : ' this chapter'} with translation,
          tafsir, audio recitation, word-by-word meaning, and transliteration.
        </p>
      )}

      <TranslationSheet open={translationOpen} onOpenChange={setTranslationOpen} />
    </>
  );
}
