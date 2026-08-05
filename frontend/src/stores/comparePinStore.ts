'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PinnedVerse {
  ayahId: number;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  textUthmani: string;
  translation?: string;
}

interface ComparePinState {
  pinned: PinnedVerse | null;
  pin: (verse: PinnedVerse) => void;
  unpin: () => void;
  isPinned: (ayahId: number) => boolean;
}

export const useComparePinStore = create<ComparePinState>()(
  persist(
    (set, get) => ({
      pinned: null,
      pin: (pinned) => set({ pinned }),
      unpin: () => set({ pinned: null }),
      isPinned: (ayahId) => get().pinned?.ayahId === ayahId,
    }),
    { name: 'altarteel-compare-pin' }
  )
);
