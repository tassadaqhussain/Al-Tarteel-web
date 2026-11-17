'use client';

import { create } from 'zustand';

export type StudyTab = 'tafsir' | 'lessons' | 'hadith' | 'related';

export interface StudyVerse {
  ayahId: number;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  textUthmani: string;
}

interface StudyState {
  activeVerse: StudyVerse | null;
  studyOpen: boolean;
  studyTab: StudyTab;
  setActiveVerse: (verse: StudyVerse | null) => void;
  openStudy: (verse: StudyVerse, tab?: StudyTab) => void;
  setStudyTab: (tab: StudyTab) => void;
  closeStudy: () => void;
}

export const useStudyStore = create<StudyState>((set) => ({
  activeVerse: null,
  studyOpen: false,
  studyTab: 'tafsir',
  setActiveVerse: (activeVerse) => set({ activeVerse }),
  openStudy: (verse, tab) =>
    set((state) => ({
      activeVerse: verse,
      studyOpen: true,
      studyTab: tab ?? state.studyTab,
    })),
  setStudyTab: (studyTab) => set({ studyTab }),
  closeStudy: () => set({ studyOpen: false }),
}));
