'use client';

import { useCallback, useState } from 'react';
import { ChevronDown, Info, Pause, Play } from 'lucide-react';
import { TranslationSheet } from './TranslationSheet';
import { startSurahPlayback } from '@/lib/audio/playback';
import { useAudioStore } from '@/stores/audioStore';

interface Props {
  translationCount: number;
  surahNumber: number;
  surahName?: string;
}

export function ChapterControls({ translationCount, surahNumber, surahName }: Props) {
  const [translationOpen, setTranslationOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const { getCurrentAyah, isPlaying } = useAudioStore();

  const current = getCurrentAyah();
  const isThisSurahPlaying =
    isPlaying && current?.surahNumber === surahNumber;

  const handleListen = useCallback(async () => {
    if (isThisSurahPlaying) {
      useAudioStore.setState((s) => ({ isPlaying: !s.isPlaying }));
      return;
    }
    try {
      await startSurahPlayback({
        surahNumber,
        startAyah: current?.surahNumber === surahNumber ? current.ayahNumber : 1,
      });
    } catch {
      // Audio is optional
    }
  }, [current?.ayahNumber, current?.surahNumber, isThisSurahPlaying, surahNumber]);

  const translationLabel =
    translationCount > 0
      ? translationCount === 1
        ? 'Translation'
        : `Translation +${translationCount - 1}`
      : 'Select translation';

  return (
    <>
      <div className="flex w-full flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => void handleListen()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[4px] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm hover:border-emerald-700 hover:text-emerald-800"
          >
            {isThisSurahPlaying ? (
              <Pause className="h-4 w-4 fill-emerald-700 text-emerald-700" />
            ) : (
              <Play className="h-4 w-4 fill-emerald-700 text-emerald-700" />
            )}
            Listen
          </button>
          <button
            type="button"
            onClick={() => setInfoOpen((v) => !v)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[4px] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm hover:border-emerald-700 hover:text-emerald-800"
            aria-expanded={infoOpen}
          >
            <Info className="h-4 w-4 fill-emerald-700 text-emerald-700" /> Info
          </button>
        </div>

        <button
          type="button"
          onClick={() => setTranslationOpen(true)}
          className="inline-flex h-10 w-full items-center justify-between gap-3 rounded-[4px] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm hover:border-emerald-700 hover:text-emerald-800"
        >
          <span className="truncate">{translationLabel}</span>
          <ChevronDown className="h-4 w-4 shrink-0" />
        </button>
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
