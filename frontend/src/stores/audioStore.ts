import { create } from 'zustand';

export interface AudioAyahRef {
  ayahId: number;
  surahNumber: number;
  ayahNumber: number;
  url: string;
  duration?: number;
}

export interface WordTiming {
  position: number;
  startMs: number;
  endMs: number;
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
  lastAyahKey: string | null;
  wordTimingsByAyah: Record<number, WordTiming[]> | null;
  timingsSurahNumber: number | null;
  timingsReciterSlug: string | null;
  setReciter: (slug: string | null) => void;
  setPlaylist: (list: AudioAyahRef[]) => void;
  setCurrentIndex: (i: number) => void;
  setPlaying: (v: boolean) => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setPlaybackRate: (r: number) => void;
  setContinuous: (v: boolean) => void;
  setLastAyah: (surah: number, ayah: number) => void;
  setWordTimings: (
    surahNumber: number,
    reciterSlug: string,
    timings: Record<number, WordTiming[]> | null,
  ) => void;
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
  lastAyahKey: null,
  wordTimingsByAyah: null,
  timingsSurahNumber: null,
  timingsReciterSlug: null,
  setReciter: (reciterSlug) => set({ reciterSlug }),
  setPlaylist: (playlist) => set({ playlist, currentIndex: 0 }),
  setCurrentIndex: (currentIndex) => set({ currentIndex }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),
  setContinuous: (continuous) => set({ continuous }),
  setLastAyah: (surahNumber, ayahNumber) =>
    set({ lastAyahKey: `${surahNumber}:${ayahNumber}` }),
  setWordTimings: (timingsSurahNumber, timingsReciterSlug, wordTimingsByAyah) =>
    set({ timingsSurahNumber, timingsReciterSlug, wordTimingsByAyah }),
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
    }),
}));
