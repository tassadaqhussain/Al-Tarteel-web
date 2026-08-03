import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FontSize = 'sm' | 'md' | 'lg' | 'xl';
export type ReadingMode = 'paged' | 'continuous';
export type MushafType = 'uthmani' | 'indopak' | 'simple';

export interface LastRead {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  page?: number;
  timestamp: number;
}

export interface SettingsState {
  // Reader display
  fontSize: FontSize;
  mushafType: MushafType;
  readingMode: ReadingMode;
  showTranslation: boolean;
  showTransliteration: boolean;
  showWordByWord: boolean;

  // Translations / Tafsir
  translationSlugs: string[]; // e.g. ['en-sahih-international', 'ur-maududi']
  tafsirSlug: string | null;

  // Audio
  reciterSlug: string | null;

  // Reading history
  lastRead: LastRead | null;
  recentSurahs: number[]; // surah numbers, most recent first (max 10)

  // Actions
  setFontSize: (size: FontSize) => void;
  setMushafType: (type: MushafType) => void;
  setReadingMode: (mode: ReadingMode) => void;
  setShowTranslation: (v: boolean) => void;
  setShowTransliteration: (v: boolean) => void;
  setShowWordByWord: (v: boolean) => void;
  setTranslationSlugs: (slugs: string[]) => void;
  toggleTranslationSlug: (slug: string) => void;
  setTafsirSlug: (slug: string | null) => void;
  setReciterSlug: (slug: string | null) => void;
  setLastRead: (ref: LastRead) => void;
  addRecentSurah: (number: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      fontSize: 'md',
      mushafType: 'uthmani',
      readingMode: 'paged',
      showTranslation: true,
      showTransliteration: false,
      showWordByWord: false,
      translationSlugs: [],
      tafsirSlug: null,
      reciterSlug: null,
      lastRead: null,
      recentSurahs: [],

      setFontSize: (fontSize) => set({ fontSize }),
      setMushafType: (mushafType) => set({ mushafType }),
      setReadingMode: (readingMode) => set({ readingMode }),
      setShowTranslation: (showTranslation) => set({ showTranslation }),
      setShowTransliteration: (showTransliteration) => set({ showTransliteration }),
      setShowWordByWord: (showWordByWord) => set({ showWordByWord }),

      setTranslationSlugs: (translationSlugs) => set({ translationSlugs }),
      toggleTranslationSlug: (slug) => {
        const { translationSlugs } = get();
        const has = translationSlugs.includes(slug);
        set({
          translationSlugs: has
            ? translationSlugs.filter((s) => s !== slug)
            : [...translationSlugs, slug],
        });
      },

      setTafsirSlug: (tafsirSlug) => set({ tafsirSlug }),
      setReciterSlug: (reciterSlug) => set({ reciterSlug }),

      setLastRead: (ref) => set({ lastRead: ref }),
      addRecentSurah: (number) => {
        const { recentSurahs } = get();
        const filtered = recentSurahs.filter((n) => n !== number);
        set({ recentSurahs: [number, ...filtered].slice(0, 10) });
      },
    }),
    {
      name: 'al-tarteel-settings',
      // Persist everything except actions (Zustand handles this automatically)
    }
  )
);
