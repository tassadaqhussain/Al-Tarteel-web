import { create } from 'zustand';

export interface AudioAyahRef {
  ayahId: number;
  surahNumber: number;
  ayahNumber: number;
  url: string;
  duration?: number;
  reciterSlug?: string;
  trackKind?: 'arabic' | 'translation' | 'bismillah';
}

export interface WordTiming {
  position: number;
  startMs: number;
  endMs: number;
}

/**
 * How playback behaves when a track finishes.
 * 'surah' is the long-standing `continuous` loop; the two are kept in sync so
 * existing callers of setContinuous keep working.
 */
export type RepeatMode = 'off' | 'ayah' | 'range' | 'surah';

/** Inclusive ayah numbers for RepeatMode 'range'. */
export interface RepeatRange {
  start: number;
  end: number;
}

export interface AudioState {
  reciterSlug: string | null;
  playlist: AudioAyahRef[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  continuous: boolean;
  repeatMode: RepeatMode;
  repeatRange: RepeatRange | null;
  lastAyahKey: string | null;
  wordTimingsByAyah: Record<number, WordTiming[]> | null;
  timingsSurahNumber: number | null;
  timingsReciterSlug: string | null;
  /** Transient player message (e.g. offline) — not persisted. */
  playbackNotice: string | null;
  setReciter: (slug: string | null) => void;
  setPlaylist: (list: AudioAyahRef[], startIndex?: number) => void;
  setCurrentIndex: (i: number) => void;
  setPlaying: (v: boolean) => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setPlaybackRate: (r: number) => void;
  setContinuous: (v: boolean) => void;
  setRepeatMode: (mode: RepeatMode, range?: RepeatRange | null) => void;
  setRepeatRange: (range: RepeatRange | null) => void;
  setLastAyah: (surah: number, ayah: number) => void;
  setWordTimings: (
    surahNumber: number,
    reciterSlug: string,
    timings: Record<number, WordTiming[]> | null,
  ) => void;
  setPlaybackNotice: (notice: string | null) => void;
  getCurrentAyah: () => AudioAyahRef | null;
  next: () => void;
  prev: () => void;
  reset: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  reciterSlug: null,
  playlist: [],
  currentIndex: 0,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  continuous: false,
  repeatMode: 'off',
  repeatRange: null,
  lastAyahKey: null,
  wordTimingsByAyah: null,
  timingsSurahNumber: null,
  timingsReciterSlug: null,
  playbackNotice: null,
  setReciter: (reciterSlug) => set({ reciterSlug }),
  setPlaylist: (playlist, startIndex = 0) => {
    const idx =
      playlist.length === 0
        ? 0
        : Math.min(Math.max(0, startIndex), playlist.length - 1);
    set({ playlist, currentIndex: idx, playbackNotice: null });
  },
  setCurrentIndex: (currentIndex) => set({ currentIndex }),
  setPlaying: (isPlaying) =>
    set((s) => ({
      isPlaying,
      // Clear offline notice when user resumes.
      playbackNotice: isPlaying ? null : s.playbackNotice,
    })),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),
  // `continuous` and repeatMode 'surah' are the same behaviour; keep both in
  // step so older call sites and the new repeat control cannot disagree.
  setContinuous: (continuous) =>
    set((s) => ({
      continuous,
      repeatMode: continuous ? 'surah' : s.repeatMode === 'surah' ? 'off' : s.repeatMode,
    })),
  setRepeatMode: (repeatMode, range) =>
    set((s) => ({
      repeatMode,
      continuous: repeatMode === 'surah',
      repeatRange:
        repeatMode === 'range' ? (range ?? s.repeatRange) : range === undefined ? s.repeatRange : range,
    })),
  setRepeatRange: (repeatRange) => set({ repeatRange }),
  setLastAyah: (surahNumber, ayahNumber) =>
    set({ lastAyahKey: `${surahNumber}:${ayahNumber}` }),
  setWordTimings: (timingsSurahNumber, timingsReciterSlug, wordTimingsByAyah) =>
    set({ timingsSurahNumber, timingsReciterSlug, wordTimingsByAyah }),
  setPlaybackNotice: (playbackNotice) => set({ playbackNotice }),
  getCurrentAyah: () => {
    const { playlist, currentIndex } = get();
    return playlist[currentIndex] ?? null;
  },
  next: () => {
    const { playlist, currentIndex, continuous } = get();
    if (currentIndex < playlist.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    } else if (continuous && playlist.length) {
      set({ currentIndex: 0 });
    } else {
      set({ isPlaying: false });
    }
  },
  prev: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) set({ currentIndex: currentIndex - 1 });
  },
  reset: () =>
    set({
      playlist: [],
      currentIndex: 0,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      wordTimingsByAyah: null,
      timingsSurahNumber: null,
      timingsReciterSlug: null,
      playbackNotice: null,
      // A range belongs to the playlist that was cleared.
      repeatRange: null,
      repeatMode: 'off',
      continuous: false,
    }),
}));
