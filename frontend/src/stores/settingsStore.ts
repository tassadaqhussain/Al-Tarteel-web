import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setTranslationCookie } from '@/lib/translation-preference';

export type FontSize = 'sm' | 'md' | 'lg' | 'xl';
export type ReadingMode = 'paged' | 'continuous';
export type MushafType = 'uthmani' | 'indopak' | 'simple';
export type ExperienceMode = 'default' | 'kids' | 'elderly';
/** Quran.com-style reading layout for the surah reader. */
export type ReaderViewMode = 'verse' | 'arabic' | 'translation';

export type ReadingGoalId = 'minutes-10' | 'days-30' | 'year' | 'custom';

export type UiLocale =
  | 'en'
  | 'ar'
  | 'bn'
  | 'fa'
  | 'fr'
  | 'hi'
  | 'id'
  | 'it'
  | 'nl'
  | 'pt'
  | 'ps'
  | 'ru'
  | 'sq'
  | 'th'
  | 'tr'
  | 'ur'
  | 'zh'
  | 'ms'
  | 'es'
  | 'sw'
  | 'vi';

/** Locales Quran.com exposes for word-by-word meaning (not full UI). */
export const WORD_BY_WORD_LOCALES = [
  { code: 'en' as const, label: 'English' },
  { code: 'ur' as const, label: 'Urdu' },
  { code: 'bn' as const, label: 'Bengali' },
  { code: 'id' as const, label: 'Indonesian' },
  { code: 'tr' as const, label: 'Turkish' },
  { code: 'fa' as const, label: 'Persian' },
  { code: 'hi' as const, label: 'Hindi' },
];

export interface ReadingGoal {
  id: ReadingGoalId;
  title: string;
  startedAt: number;
}

export interface LastRead {
  surahNumber: number;
  surahName: string;
  surahNameArabic?: string;
  ayahNumber: number;
  page?: number;
  timestamp: number;
}

export interface SettingsState {
  // Reader display
  fontSize: FontSize;
  mushafLines: number;
  mushafType: MushafType;
  readingMode: ReadingMode;
  readerViewMode: ReaderViewMode;
  showTranslation: boolean;
  showTransliteration: boolean;
  showWordByWord: boolean;
  showTajweedRules: boolean;
  copyVerseAsGlyphs: boolean;
  translationFontSize: FontSize;
  wordByWordFontSize: FontSize;
  wordByWordDisplay: 'tooltip' | 'inline';
  wordByWordShowTranslation: boolean;
  wordByWordShowTransliteration: boolean;
  wordByWordLocale: UiLocale;
  wordClickPlayAudio: boolean;
  /** Speak the word meaning in the selected WBW language (browser TTS). */
  wordClickSpeakMeaning: boolean;

  // Translations / Tafsir
  translationSlugs: string[]; // e.g. ['en-sahih-international', 'ur-maududi']
  tafsirSlug: string | null;

  // Audio
  reciterSlug: string | null;

  // Reading history
  lastRead: LastRead | null;
  recentSurahs: number[]; // surah numbers, most recent first (max 10)

  // Goals
  readingGoal: ReadingGoal | null;

  // UI language (display preference)
  uiLocale: UiLocale;

  // Experience Mode profile (Default, Kids, Elderly)
  experienceMode: ExperienceMode;

  // Learning plans progress: planSlug -> completed day numbers
  learningProgress: Record<string, number[]>;

  // Quran in a Year progress tracking
  quranYearTracking: boolean;
  quranYearCompletedWeeks: number[];

  // Actions
  setFontSize: (size: FontSize) => void;
  setMushafLines: (lines: number) => void;
  setMushafType: (type: MushafType) => void;
  setReadingMode: (mode: ReadingMode) => void;
  setReaderViewMode: (mode: ReaderViewMode) => void;
  setShowTranslation: (v: boolean) => void;
  setShowTransliteration: (v: boolean) => void;
  setShowWordByWord: (v: boolean) => void;
  setShowTajweedRules: (v: boolean) => void;
  setCopyVerseAsGlyphs: (v: boolean) => void;
  setTranslationFontSize: (v: FontSize) => void;
  setWordByWordFontSize: (v: FontSize) => void;
  setWordByWordDisplay: (v: 'tooltip' | 'inline') => void;
  setWordByWordShowTranslation: (v: boolean) => void;
  setWordByWordShowTransliteration: (v: boolean) => void;
  setWordByWordLocale: (v: UiLocale) => void;
  setWordClickPlayAudio: (v: boolean) => void;
  setWordClickSpeakMeaning: (v: boolean) => void;
  setTranslationSlugs: (slugs: string[]) => void;
  toggleTranslationSlug: (slug: string) => void;
  setTafsirSlug: (slug: string | null) => void;
  setReciterSlug: (slug: string | null) => void;
  setLastRead: (ref: LastRead) => void;
  addRecentSurah: (number: number) => void;
  setReadingGoal: (goal: ReadingGoal | null) => void;
  setUiLocale: (locale: UiLocale) => void;
  setExperienceMode: (mode: ExperienceMode) => void;
  toggleLearningDay: (planSlug: string, day: number) => void;
  setQuranYearTracking: (v: boolean) => void;
  toggleQuranYearWeek: (week: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      fontSize: 'md',
      mushafLines: 15,
      mushafType: 'uthmani',
      readingMode: 'paged',
      readerViewMode: 'verse',
      showTranslation: true,
      showTransliteration: false,
      showWordByWord: true,
      showTajweedRules: false,
      copyVerseAsGlyphs: false,
      translationFontSize: 'md',
      wordByWordFontSize: 'md',
      wordByWordDisplay: 'tooltip',
      wordByWordShowTranslation: true,
      wordByWordShowTransliteration: true,
      wordByWordLocale: 'ur',
      wordClickPlayAudio: true,
      wordClickSpeakMeaning: true,
      translationSlugs: [],
      tafsirSlug: null,
      reciterSlug: null,
      lastRead: null,
      recentSurahs: [],
      readingGoal: null,
      uiLocale: 'en',
      experienceMode: 'default',
      learningProgress: {},
      quranYearTracking: false,
      quranYearCompletedWeeks: [],

      setFontSize: (fontSize) => set({ fontSize }),
      setMushafLines: (mushafLines) => set({ mushafLines }),
      setMushafType: (mushafType) => set({ mushafType }),
      setReadingMode: (readingMode) => set({ readingMode }),
      setReaderViewMode: (readerViewMode) => set({ readerViewMode }),
      setShowTranslation: (showTranslation) => set({ showTranslation }),
      setShowTransliteration: (showTransliteration) => set({ showTransliteration }),
      setShowWordByWord: (showWordByWord) => set({ showWordByWord }),
      setShowTajweedRules: (showTajweedRules) => set({ showTajweedRules }),
      setCopyVerseAsGlyphs: (copyVerseAsGlyphs) => set({ copyVerseAsGlyphs }),
      setTranslationFontSize: (translationFontSize) => set({ translationFontSize }),
      setWordByWordFontSize: (wordByWordFontSize) => set({ wordByWordFontSize }),
      setWordByWordDisplay: (wordByWordDisplay) => set({ wordByWordDisplay }),
      setWordByWordShowTranslation: (wordByWordShowTranslation) => set({ wordByWordShowTranslation }),
      setWordByWordShowTransliteration: (wordByWordShowTransliteration) => set({ wordByWordShowTransliteration }),
      setWordByWordLocale: (wordByWordLocale) => set({ wordByWordLocale }),
      setWordClickPlayAudio: (wordClickPlayAudio) => set({ wordClickPlayAudio }),
      setWordClickSpeakMeaning: (wordClickSpeakMeaning) => set({ wordClickSpeakMeaning }),

      setTranslationSlugs: (translationSlugs) => {
        set({ translationSlugs });
        setTranslationCookie(translationSlugs);
      },
      toggleTranslationSlug: (slug) => {
        const { translationSlugs } = get();
        const has = translationSlugs.includes(slug);
        const next = has
          ? translationSlugs.filter((s) => s !== slug)
          : [...translationSlugs, slug];
        set({ translationSlugs: next });
        setTranslationCookie(next);
      },

      setTafsirSlug: (tafsirSlug) => set({ tafsirSlug }),
      setReciterSlug: (reciterSlug) => set({ reciterSlug }),

      setLastRead: (ref) => set({ lastRead: ref }),
      addRecentSurah: (number) => {
        const { recentSurahs } = get();
        const filtered = recentSurahs.filter((n) => n !== number);
        set({ recentSurahs: [number, ...filtered].slice(0, 10) });
      },
      setReadingGoal: (readingGoal) => set({ readingGoal }),
      setUiLocale: (uiLocale) => set({ uiLocale }),
      setExperienceMode: (experienceMode) => set({ experienceMode }),
      toggleLearningDay: (planSlug, day) => {
        const current = get().learningProgress[planSlug] ?? [];
        const has = current.includes(day);
        const next = has ? current.filter((d) => d !== day) : [...current, day].sort((a, b) => a - b);
        set({
          learningProgress: {
            ...get().learningProgress,
            [planSlug]: next,
          },
        });
      },
      setQuranYearTracking: (quranYearTracking) => set({ quranYearTracking }),
      toggleQuranYearWeek: (week) => {
        const current = get().quranYearCompletedWeeks;
        const has = current.includes(week);
        set({
          quranYearCompletedWeeks: has
            ? current.filter((w) => w !== week)
            : [...current, week].sort((a, b) => a - b),
          quranYearTracking: true,
        });
      },
    }),
    {
      name: 'al-tarteel-settings',
      // Persist everything except actions (Zustand handles this automatically)
    }
  )
);
