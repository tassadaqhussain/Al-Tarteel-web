'use client';

import { useCallback, useEffect, useState } from 'react';
import { BookOpen, ChevronDown, Pause, Play } from 'lucide-react';
import { TranslationSheet } from './TranslationSheet';
import { startSurahPlayback } from '@/lib/audio/playback';
import { useAudioStore } from '@/stores/audioStore';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  formatTranslatorDisplayName,
  resolvePrimaryTranslationSlug,
} from '@/lib/translation-preference';
import { quranApi } from '@/lib/api';

/** Pill control styling shared by Listen / Info / Translation (Quran.com chapter header). */
const BUTTON_CLASS =
  'inline-flex h-[30px] items-center justify-center gap-2 rounded-full border border-transparent bg-surface px-[15px] text-sm font-medium text-ink transition-colors hover:border-brand';

interface Props {
  translationCount: number;
  surahNumber: number;
  surahName?: string;
  /** SSR-resolved slugs — keeps the pill label aligned with rendered verse attribution. */
  effectiveTranslations?: string;
  /** Name from the first SSR ayah translation for the primary slug (crawler-safe). */
  primaryTranslatorName?: string | null;
}

export function ChapterControls({
  translationCount,
  surahNumber,
  surahName,
  effectiveTranslations,
  primaryTranslatorName,
}: Props) {
  const [translationOpen, setTranslationOpen] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const { getCurrentAyah, isPlaying } = useAudioStore();
  const translationSlugs = useSettingsStore((s) => s.translationSlugs);
  const readerViewMode = useSettingsStore((s) => s.readerViewMode);
  const setReaderViewMode = useSettingsStore((s) => s.setReaderViewMode);
  // The page renders statically with the DEFAULT translation, so `translationCount`
  // is the server's view, not the reader's. Switch to the persisted selection only
  // after mount, otherwise the first paint would not match the server HTML.
  const [mounted, setMounted] = useState(false);
  const [translatorNames, setTranslatorNames] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
    let cancelled = false;
    void quranApi
      .translators()
      .then((list) => {
        if (cancelled || !Array.isArray(list)) return;
        setTranslatorNames(Object.fromEntries(list.map((t) => [t.slug, t.name])));
      })
      .catch(() => {
        /* fall back to the slug-derived label */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const effectiveCount =
    mounted && translationSlugs.length > 0 ? translationSlugs.length : translationCount;

  const current = getCurrentAyah();
  const isThisSurahPlaying =
    isPlaying && current?.surahNumber === surahNumber;

  const handleListen = useCallback(async () => {
    if (current?.surahNumber === surahNumber) {
      useAudioStore.setState((s) => ({ isPlaying: !s.isPlaying }));
      return;
    }
    setAudioError(null);
    try {
      await startSurahPlayback({
        surahNumber,
        startAyah: current?.surahNumber === surahNumber ? current.ayahNumber : 1,
      });
    } catch (error) {
      setAudioError(error instanceof Error ? error.message : 'Audio could not load. Please try again.');
    }
  }, [current?.ayahNumber, current?.surahNumber, isThisSurahPlaying, surahNumber]);

  const primarySlug = resolvePrimaryTranslationSlug(
    mounted ? translationSlugs : [],
    effectiveTranslations,
  );
  const ssrPrimarySlug = resolvePrimaryTranslationSlug([], effectiveTranslations);
  const friendlyName =
    translatorNames[primarySlug] ||
    (primaryTranslatorName && primarySlug === ssrPrimarySlug ? primaryTranslatorName : null) ||
    formatTranslatorDisplayName(primarySlug);

  const translationLabel =
    effectiveCount > 1
      ? `Translation: ${friendlyName} +${effectiveCount - 1}`
      : effectiveCount === 1
        ? `Translation: ${friendlyName}`
        : 'Select Translation';

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => void handleListen()}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-contrast)] transition hover:opacity-90"
        >
          {isThisSurahPlaying ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
          <span>{isThisSurahPlaying ? 'Pause' : 'Listen'}</span>
        </button>

        <button
          type="button"
          onClick={() => setTranslationOpen(true)}
          className="inline-flex min-h-11 max-w-[16rem] items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink-2 transition hover:border-[var(--accent)]"
        >
          <span className="truncate">{translationLabel}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-ink-muted" />
        </button>

        <button
          type="button"
          onClick={() => setReaderViewMode(readerViewMode === 'arabic' ? 'verse' : 'arabic')}
          aria-pressed={readerViewMode === 'arabic'}
          className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
            readerViewMode === 'arabic'
              ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
              : 'border-line bg-surface text-ink-2 hover:border-[var(--accent)]'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Reading view</span>
        </button>
      </div>

      {audioError && <p role="status" className="mt-2 max-w-sm text-sm text-ink-muted">{audioError}</p>}

      <TranslationSheet open={translationOpen} onOpenChange={setTranslationOpen} />
    </>
  );
}
