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
}
