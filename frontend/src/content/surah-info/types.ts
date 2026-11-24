export interface SurahVirtue {
  /** Authentic virtue or benefit summary. */
  text: string;
  /** Authentic hadith collection and number (e.g. "Sahih Muslim 809"). */
  source: string;
}

export interface SurahFaq {
  question: string;
  answer: string;
}

export interface RelatedSurahLink {
  surahNumber: number;
  reason: string;
}

export interface SurahResourceLink {
  label: string;
  href: string;
}

export interface LocalizedSurahInfo {
  /** Human-verified overview paragraphs in this language (leave empty until verified). */
  overview: string[];
  mainThemes?: string[];
  virtues?: SurahVirtue[];
  /** Human-verified FAQs in this language (rendered + FAQPage JSON-LD). */
  faqs: SurahFaq[];
  /** Editorial note when localized content is pending human translation. */
  todo?: string;
}

export interface SurahInfoContent {
  slug: string;
  surahNumber: number;
  revelationPeriod: 'Makki' | 'Madani';
  verseCount: number;
  juzNumbers: number[];
  /** 300–500 words of concise, accurate overview paragraphs. */
  overview: string[];
  mainThemes: string[];
  /** Only authentic, sourced narrations; leave empty if unverified. */
  virtues: SurahVirtue[];
  /** Optional note for editors about hadith references pending scholarly review. */
  virtuesTodo?: string;
  faqs: SurahFaq[];
  relatedSurahs: RelatedSurahLink[];
  relatedResources: SurahResourceLink[];
  /**
   * Optional per-locale overrides for /ur, /ps, and /fa surah pages.
   * Never machine-translate religious content; populate only with human-verified text.
   */
  locales?: Partial<Record<'ur' | 'ps' | 'fa', LocalizedSurahInfo>>;
}
