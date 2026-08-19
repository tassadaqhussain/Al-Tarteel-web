const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Converts standard integer digits into Eastern Arabic-Indic numerals (٠, ١, ٢, ٣, ٤, ٥, ٦, ٧, ٨, ٩)
 * matching the Quran.com Ayah numbering style.
 */
export function toArabicNumber(num: number | string): string {
  return String(num).replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)] ?? d);
}
