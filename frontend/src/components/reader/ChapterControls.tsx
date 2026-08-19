'use client';

import { useCallback, useState } from 'react';
import { ChevronDown, Info, Pause, Play } from 'lucide-react';
import { TranslationSheet } from './TranslationSheet';
import { startSurahPlayback } from '@/lib/audio/playback';
import { useAudioStore } from '@/stores/audioStore';
import { useSettingsStore } from '@/stores/settingsStore';

/** Pill control styling shared by Listen / Info / Translation (Quran.com chapter header). */
const BUTTON_CLASS =
  'inline-flex h-[30px] items-center justify-center gap-2 rounded-full border border-transparent bg-surface px-[15px] text-sm font-medium text-ink transition-colors hover:border-brand';

interface Props {
  translationCount: number;
  surahNumber: number;
  surahName?: string;
}

export function ChapterControls({ translationCount, surahNumber, surahName }: Props) {
  const [translationOpen, setTranslationOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const { getCurrentAyah, isPlaying } = useAudioStore();
  const translationSlugs = useSettingsStore((s) => s.translationSlugs);

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

  const primarySlug = translationSlugs[0] || 'en-clear-quran';
  const friendlyName = primarySlug.includes('israr') || primarySlug.includes('bayan')
    ? 'Bayan-ul-Quran (Dr. Israr Ahmad)'
    : primarySlug.includes('khattab') || primarySlug.includes('clear')
      ? 'The Clear Quran (Dr. Mustafa Khattab)'
      : primarySlug.includes('sahih')
        ? 'Saheeh International'
        : primarySlug.replace(/^(en|ur|ar|fr|id)-/, '').replaceAll('-', ' ');

  const translationLabel =
    translationCount > 1
      ? `Translation: ${friendlyName} +${translationCount - 1}`
      : translationCount === 1
        ? `Translation: ${friendlyName}`
        : 'Select Translation';

  return (
    <>
      <div className="flex w-full flex-col gap-2.5 lg:w-[350px]">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => void handleListen()}
            className={BUTTON_CLASS + ' flex-1'}
          >
            {isThisSurahPlaying ? (
              <Pause className="h-4 w-4 fill-brand text-brand" />
            ) : (
              <Play className="h-4 w-4 fill-brand text-brand" />
            )}
            Listen
          </button>
          <button
            type="button"
            onClick={() => setInfoOpen((v) => !v)}
            className={BUTTON_CLASS + ' flex-1'}
            aria-expanded={infoOpen}
          >
            <Info className="h-4 w-4 fill-brand text-white" /> Info
          </button>
        </div>

        <button
          type="button"
          onClick={() => setTranslationOpen(true)}
          className={BUTTON_CLASS + ' w-full justify-between font-medium text-ink-3'}
        >
          <span className="truncate">{translationLabel}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-ink-3" />
        </button>
      </div>

      {infoOpen && (
        <p className="mt-2 max-w-sm text-right text-xs leading-relaxed text-ink-muted">
          Read and listen to{surahName ? ` Surah ${surahName}` : ' this chapter'} with translation,
          tafsir, audio recitation, word-by-word meaning, and transliteration.
        </p>
      )}

      <TranslationSheet open={translationOpen} onOpenChange={setTranslationOpen} />
    </>
  );
}
