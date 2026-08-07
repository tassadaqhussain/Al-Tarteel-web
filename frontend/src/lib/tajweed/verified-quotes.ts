/**
 * Content slot for verified religious quotations.
 * Currently empty by design — use neutral motivation until curated,
 * citeable Quran/Hadith entries are added with full references.
 *
 * Never populate this via LLM generation.
 */

export type VerifiedQuranQuote = {
  surah: number;
  ayah: number;
  textUthmani: string;
  translation: string;
  translationSource: string;
};

export type VerifiedHadithQuote = {
  collection: string;
  reference: string;
  text: string;
  sourceNote: string;
};

/** Reviewed, citeable quotes only. Keep empty rather than inventing. */
export const VERIFIED_QURAN_QUOTES: VerifiedQuranQuote[] = [];
export const VERIFIED_HADITH_QUOTES: VerifiedHadithQuote[] = [];

export function hasVerifiedInspiration(): boolean {
  return VERIFIED_QURAN_QUOTES.length > 0 || VERIFIED_HADITH_QUOTES.length > 0;
}
