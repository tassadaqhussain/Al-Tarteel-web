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

const MAX_PINS = 8;

interface ComparePinState {
  pins: PinnedVerse[];
  /** Which pin is focused in the compare modal (ayahId). */
  activeAyahId: number | null;
  modalOpen: boolean;
  pin: (verse: PinnedVerse) => void;
  unpin: (ayahId?: number) => void;
  clear: () => void;
  isPinned: (ayahId: number) => boolean;
  openModal: (ayahId?: number) => void;
  closeModal: () => void;
  setActive: (ayahId: number) => void;
}

export const useComparePinStore = create<ComparePinState>()(
  persist(
    (set, get) => ({
      pins: [],
      activeAyahId: null,
      modalOpen: false,
      pin: (verse) => {
        const { pins } = get();
        if (pins.some((p) => p.ayahId === verse.ayahId)) {
          set({ activeAyahId: verse.ayahId, modalOpen: true });
          return;
        }
        const next = [verse, ...pins].slice(0, MAX_PINS);
        set({ pins: next, activeAyahId: verse.ayahId, modalOpen: true });
      },
      unpin: (ayahId) => {
        const target = ayahId ?? get().activeAyahId ?? get().pins[0]?.ayahId;
        if (target == null) return;
        const pins = get().pins.filter((p) => p.ayahId !== target);
        const activeAyahId =
          get().activeAyahId === target ? (pins[0]?.ayahId ?? null) : get().activeAyahId;
        set({
          pins,
          activeAyahId,
          modalOpen: pins.length > 0 ? get().modalOpen : false,
        });
      },
      clear: () => set({ pins: [], activeAyahId: null, modalOpen: false }),
      isPinned: (ayahId) => get().pins.some((p) => p.ayahId === ayahId),
      openModal: (ayahId) => {
        const { pins } = get();
        if (!pins.length) return;
        set({
          modalOpen: true,
          activeAyahId: ayahId ?? get().activeAyahId ?? pins[0].ayahId,
        });
      },
      closeModal: () => set({ modalOpen: false }),
      setActive: (ayahId) => set({ activeAyahId: ayahId, modalOpen: true }),
    }),
    {
      name: 'altarteel-compare-pin',
      version: 2,
      migrate: (persisted) => {
        const state = persisted as { pinned?: PinnedVerse | null; pins?: PinnedVerse[]; activeAyahId?: number | null; modalOpen?: boolean };
        if (Array.isArray(state?.pins)) {
          return {
            pins: state.pins,
            activeAyahId: state.activeAyahId ?? state.pins[0]?.ayahId ?? null,
            modalOpen: false,
          };
        }
        if (state?.pinned) {
          return {
            pins: [state.pinned],
            activeAyahId: state.pinned.ayahId,
            modalOpen: false,
          };
        }
        return { pins: [], activeAyahId: null, modalOpen: false };
      },
    }
  )
);
