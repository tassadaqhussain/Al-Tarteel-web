'use client';

import { useAudioStore } from '@/stores/audioStore';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Repeat,
  Mic2,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useReciterPicker } from '@/hooks/useReciterPicker';
import { ReciterSheet } from '@/components/reader/ReciterSheet';
import { cn } from '@/lib/utils';

const AUDIO_BAR_HEIGHT_VAR = '--audio-bar-height';

export function AudioBar() {
  const {
    playlist,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    continuous,
    playbackNotice,
    getCurrentAyah,
    setPlaying,
    setPlaybackRate,
    setContinuous,
    next,
    prev,
    reset,
  } = useAudioStore();

  const current = getCurrentAyah();
  const hasPlaylist = playlist.length > 0;
  const footerRef = useRef<HTMLElement | null>(null);

  const {
    reciterOpen,
    setReciterOpen,
    activeReciter,
    activeReciterName,
    translationReciterSlug,
    changeReciter,
    changeTranslationReciter,
  } = useReciterPicker();
  const [expanded, setExpanded] = useState(false);

  // Publish bar height so floating UI (Ask AI, etc.) can dock above it.
  useEffect(() => {
    if (!hasPlaylist) {
      document.documentElement.style.setProperty(AUDIO_BAR_HEIGHT_VAR, '0px');
      return;
    }
    const el = footerRef.current;
    if (!el) return;

    const publish = () => {
      document.documentElement.style.setProperty(
        AUDIO_BAR_HEIGHT_VAR,
        `${el.offsetHeight}px`,
      );
    };
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, [hasPlaylist, expanded]);

  useEffect(() => {
    return () => {
      document.documentElement.style.setProperty(AUDIO_BAR_HEIGHT_VAR, '0px');
    };
  }, []);

  const formatTime = (s: number) => {
    if (!Number.isFinite(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const t = (Number(e.target.value) / 100) * duration;
      const el = document.querySelector('audio');
      if (el) el.currentTime = t;
    },
    [duration]
  );

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!hasPlaylist) return null;

  return (
    <footer
      ref={footerRef}
      className="fixed bottom-0 left-0 right-0 z-[60] border-t border-line bg-surface-raised text-ink safe-area-pb"
      role="region"
      aria-label="Audio player"
    >
      {/* Full-width progress bar */}
      <div className="relative h-1 w-full cursor-pointer bg-line">
        <div
          className="absolute left-0 top-0 h-full bg-emerald-800 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={handleSeek}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Seek"
        />
      </div>

      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4">
            <button
              type="button"
              onClick={prev}
              disabled={currentIndex <= 0}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-3 disabled:opacity-30"
              aria-label="Previous verse"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setPlaying(!isPlaying)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-white shadow-sm transition-opacity hover:bg-emerald-900"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 translate-x-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={next}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-3"
              aria-label="Next verse"
            >
              <SkipForward className="h-4 w-4" />
            </button>

            <div className="min-w-0 px-1">
              <p className="truncate text-sm font-medium text-ink">
                {current ? `Surah ${current.surahNumber} · ${current.ayahNumber}` : '—'}
              </p>
              <p className="text-xs text-ink-muted">
                {current?.trackKind === 'translation' ? 'Translation' : formatTime(currentTime)}
                {current?.trackKind === 'translation' ? ` · ${formatTime(currentTime)}` : ''} / {formatTime(duration)}
              </p>
              {playbackNotice && (
                <p className="mt-0.5 truncate text-xs font-medium text-warning" role="status">
                  {playbackNotice}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-surface-3 md:hidden"
              aria-label={expanded ? 'Collapse player' : 'Expand player'}
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>

            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={() => setContinuous(!continuous)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                  continuous
                    ? 'bg-brand/10 text-brand'
                    : 'text-ink-muted hover:bg-surface-3 hover:text-ink'
                )}
                aria-label={continuous ? 'Disable loop' : 'Enable loop'}
                aria-pressed={continuous}
              >
                <Repeat className="h-4 w-4" />
              </button>

              <select
                value={playbackRate}
                onChange={(e) => setPlaybackRate(Number(e.target.value))}
                className="rounded-lg border border-line-strong bg-surface px-2 py-1.5 text-xs font-medium text-ink hover:border-line-strong focus:outline-none"
                aria-label="Playback speed"
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((r) => (
                  <option key={r} value={r}>
                    {r}×
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setReciterOpen(true)}
                className="flex max-w-[10rem] items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:border-line-strong"
                aria-label="Change reciter"
              >
                <Mic2 className="h-3 w-3 shrink-0 text-ink-muted" />
                <span className="truncate">{activeReciterName || 'Reciter'}</span>
              </button>

              <button
                type="button"
                onClick={reset}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-surface-3 hover:text-ink"
                aria-label="Close player"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
      </div>
      <ReciterSheet
        open={reciterOpen}
        onOpenChange={setReciterOpen}
        selectedSlug={activeReciter}
        onSelect={(slug) => {
          void changeReciter(slug);
        }}
        selectedTranslationSlug={translationReciterSlug}
        onSelectTranslation={(slug) => {
          void changeTranslationReciter(slug);
        }}
      />

        {expanded && (
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 border-t border-line px-3 py-3 md:hidden">
            <button
              type="button"
              onClick={() => setContinuous(!continuous)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                continuous
                  ? 'bg-brand/10 text-brand'
                  : 'text-ink-3 hover:bg-surface-3'
              )}
              aria-pressed={continuous}
            >
              <Repeat className="h-3.5 w-3.5" />
              Loop
            </button>

            <select
              value={playbackRate}
              onChange={(e) => setPlaybackRate(Number(e.target.value))}
              className="rounded-lg border border-line-strong bg-surface px-2 py-1.5 text-xs font-medium text-ink"
              aria-label="Playback speed"
            >
              {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((r) => (
                <option key={r} value={r}>{r}×</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setReciterOpen(true)}
              className="flex-1 truncate rounded-lg border border-line-strong bg-surface px-2 py-1.5 text-left text-xs font-medium text-ink"
              aria-label="Reciter"
            >
              {activeReciterName || 'Reciter'}
            </button>

            <button
              type="button"
              onClick={reset}
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-surface-3"
              aria-label="Close player"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
    </footer>
  );
}
