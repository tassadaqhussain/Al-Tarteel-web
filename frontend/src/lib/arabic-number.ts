const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Converts standard integer digits into Eastern Arabic-Indic numerals (٠, ١, ٢, ٣, ٤, ٥, ٦, ٧, ٨, ٩)
 * matching the Quran.com Ayah numbering style.
 */
export function toArabicNumber(num: number | string): string {
  return String(num).replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)] ?? d);
}

/**
 * Converts Eastern Arabic-Indic (٠-٩) and Extended Arabic-Indic (۰-۹, used for
 * Persian/Urdu) numerals to ASCII digits.
 *
 * Needed because JavaScript's `\d` only matches ASCII, so a spoken or typed
 * reference like "٢:٢٥٥" never matched any verse pattern and the ayah number
 * was silently dropped.
 */
export function fromArabicNumerals(text: string): string {
  return text.replace(/[\u0660-\u0669\u06f0-\u06f9]/g, (d) => {
    const code = d.charCodeAt(0);
    const base = code >= 0x06f0 ? 0x06f0 : 0x0660;
    return String(code - base);
  });
}
