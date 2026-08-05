'use client';

import { useAudioStore } from '@/stores/audioStore';
import { useCallback, useState } from 'react';
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
import { cn } from '@/lib/utils';

export function AudioBar() {
  const {
    playlist,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    continuous,
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

  const {
    reciters,
    reciterOpen,
    setReciterOpen,
    reciterLoading,
    reciterRef,
    activeReciter,
    activeReciterName,
    changeReciter,
  } = useReciterPicker();
  const [expanded, setExpanded] = useState(false);

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
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--bg)]/98 backdrop-blur-md safe-area-pb"
      role="region"
      aria-label="Audio player"
    >
      {/* Full-width progress bar */}
      <div className="relative h-1 w-full cursor-pointer bg-[var(--border)]">
        <div
          className="absolute left-0 top-0 h-full bg-[var(--accent)] transition-all duration-100"
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

      <div className="mx-auto max-w-4xl px-4">
        {/* Main row */}
        <div className="flex items-center gap-3 py-3">
          <button
            type="button"
            onClick={prev}
            disabled={currentIndex <= 0}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--fg)] disabled:opacity-30 hover:bg-[var(--ayah-highlight)] transition-colors"
            aria-label="Previous verse"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setPlaying(!isPlaying)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-md hover:opacity-90 transition-opacity"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying
              ? <Pause className="h-5 w-5" />
              : <Play className="h-5 w-5 translate-x-0.5" />}
          </button>

          <button
            type="button"
            onClick={next}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--fg)] hover:bg-[var(--ayah-highlight)] transition-colors"
            aria-label="Next verse"
          >
            <SkipForward className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--fg)]">
              {current ? `Surah ${current.surahNumber} · ${current.ayahNumber}` : '—'}
            </p>
            <p className="text-xs text-[var(--muted)]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </p>
          </div>

          {/* Mobile expand toggle */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--ayah-highlight)] md:hidden"
            aria-label={expanded ? 'Collapse player' : 'Expand player'}
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>

          {/* Desktop secondary controls */}
          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => setContinuous(!continuous)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                continuous
                  ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                  : 'text-[var(--muted)] hover:bg-[var(--ayah-highlight)]'
              )}
              aria-label={continuous ? 'Disable loop' : 'Enable loop'}
              aria-pressed={continuous}
            >
              <Repeat className="h-4 w-4" />
            </button>

            <select
              value={playbackRate}
              onChange={(e) => setPlaybackRate(Number(e.target.value))}
              className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-1.5 text-xs text-[var(--fg)] hover:border-[var(--accent)] focus:outline-none"
              aria-label="Playback speed"
            >
              {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((r) => (
                <option key={r} value={r}>{r}×</option>
              ))}
            </select>

            {/* Reciter selector */}
            <div className="relative" ref={reciterRef}>
              <button
                type="button"
                onClick={() => setReciterOpen((v) => !v)}
                className="flex max-w-[140px] items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--fg)] hover:border-[var(--accent)] transition-colors"
                aria-label="Change reciter"
              >
                <Mic2 className="h-3 w-3 shrink-0 text-[var(--muted)]" />
                <span className="truncate">{activeReciterName}</span>
              </button>

              {reciterOpen && (
                <div className="absolute bottom-full right-0 mb-2 max-h-64 w-64 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
                  {reciterLoading ? (
                    <div className="p-4 text-center text-sm text-[var(--muted)]">Loading…</div>
                  ) : (
                    reciters.map((r) => (
                      <button
                        key={r.slug}
                        type="button"
                        onClick={() => changeReciter(r.slug)}
                        className={cn(
                          'flex w-full flex-col px-4 py-2.5 text-left text-sm transition-colors hover:bg-[var(--ayah-highlight)]',
                          r.slug === activeReciter && 'bg-[var(--accent)]/10 text-[var(--accent)]'
                        )}
                      >
                        <span className="font-medium">{r.name}</span>
                        {r.style && (
                          <span className="text-xs text-[var(--muted)] capitalize">{r.style}</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={reset}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--ayah-highlight)] hover:text-[var(--fg)] transition-colors"
              aria-label="Close player"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile expanded controls */}
        {expanded && (
          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] py-3 md:hidden">
            <button
              type="button"
              onClick={() => setContinuous(!continuous)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                continuous
                  ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                  : 'text-[var(--muted)] hover:bg-[var(--ayah-highlight)]'
              )}
              aria-pressed={continuous}
            >
              <Repeat className="h-3.5 w-3.5" />
              Loop
            </button>

            <select
              value={playbackRate}
              onChange={(e) => setPlaybackRate(Number(e.target.value))}
              className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-1.5 text-xs text-[var(--fg)]"
              aria-label="Playback speed"
            >
              {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((r) => (
                <option key={r} value={r}>{r}×</option>
              ))}
            </select>

            <select
              value={activeReciter ?? ''}
              onChange={(e) => changeReciter(e.target.value)}
              className="flex-1 rounded-lg border border-[var(--border)] bg-transparent px-2 py-1.5 text-xs text-[var(--fg)]"
              aria-label="Reciter"
            >
              {reciters.map((r) => (
                <option key={r.slug} value={r.slug}>{r.name}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={reset}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--ayah-highlight)]"
              aria-label="Close player"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </footer>
  );
}
