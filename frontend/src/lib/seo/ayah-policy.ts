import { CONTENT_LOCALES, type ContentLocale } from '@/lib/i18n/content-locales';
import { SURAH_AYAH_COUNTS } from '@/lib/surah-pagination';

/**
 * Single source of truth for which single-ayah pages are indexable.
 *
 * Data-driven: flip a flag here, never hardcode per URL. Rules:
 *  1. `allAyahs` — every ayah of that language is indexable. English only for now: it is the
 *     language with a full translation + audio behind every verse.
 *  2. Featured ayahs (below) are indexable in EVERY language, because each carries a localized
 *     title and intro and is a real search target (Ayatul Kursi, Yasin 36:1, Al-Mulk 67:1, …).
 *  3. Everything else stays `noindex, follow` and out of sitemaps, but remains crawlable and linked
 *     from surah pages. Flip `allAyahs` for ur/ps/fa once transliteration / notes exist for them.
 */
export const AYAH_INDEX_POLICY: Record<ContentLocale, { allAyahs: boolean }> = {
  en: { allAyahs: true },
  ur: { allAyahs: false },
  ps: { allAyahs: false },
  fa: { allAyahs: false },
};

/** Inclusive ranges; omit `from`/`to` for a whole surah. */
export const FEATURED_AYAH_RANGES: readonly { surah: number; from?: number; to?: number }[] = [
  { surah: 1, from: 1, to: 7 }, // Al-Fatihah
  { surah: 2, from: 255, to: 255 }, // Ayatul Kursi
  { surah: 2, from: 285, to: 286 }, // Last two ayahs of Al-Baqarah
  { surah: 3, from: 18, to: 18 }, // Shahada verse
  { surah: 18, from: 1, to: 10 }, // Opening of Al-Kahf
  { surah: 24, from: 35, to: 35 }, // Light verse
  { surah: 36, from: 1, to: 1 }, // Ya-Sin 36:1
  { surah: 55, from: 13, to: 13 }, // Ar-Rahman refrain
  { surah: 67, from: 1, to: 1 }, // Al-Mulk 67:1
  { surah: 112, from: 1, to: 4 }, // Al-Ikhlas
  { surah: 113 }, // Al-Falaq
  { surah: 114 }, // An-Nas
];

export function isFeaturedAyah(surah: number, ayah: number): boolean {
  return FEATURED_AYAH_RANGES.some((r) => {
    if (r.surah !== surah) return false;
    return ayah >= (r.from ?? 1) && ayah <= (r.to ?? Number.MAX_SAFE_INTEGER);
  });
}

/** Expanded list, used for static generation and sitemaps. */
export function featuredAyahList(): { surah: number; ayah: number }[] {
  const out: { surah: number; ayah: number }[] = [];
  for (const r of FEATURED_AYAH_RANGES) {
    const count = SURAH_AYAH_COUNTS[r.surah - 1] ?? 0;
    const to = Math.min(r.to ?? count, count);
    for (let a = r.from ?? 1; a <= to; a += 1) out.push({ surah: r.surah, ayah: a });
  }
  return out;
}

/** `INDEX_VERSE_PAGES` env (true|false|ur,ps…) overrides the per-language default. */
export function languageIndexesAllAyahs(locale: ContentLocale): boolean {
  const raw = process.env.INDEX_VERSE_PAGES?.trim().toLowerCase();
  if (raw) {
    if (raw === 'true' || raw === '1' || raw === 'all') return true;
    if (raw === 'false' || raw === '0' || raw === 'none') return false;
    return raw.split(',').map((s) => s.trim()).includes(locale);
  }
  return AYAH_INDEX_POLICY[locale].allAyahs;
}

export function isAyahIndexable(locale: ContentLocale, surah: number, ayah: number): boolean {
  return isFeaturedAyah(surah, ayah) || languageIndexesAllAyahs(locale);
}

export function indexableAyahLocales(surah: number, ayah: number): ContentLocale[] {
  return CONTENT_LOCALES.filter((loc) => isAyahIndexable(loc, surah, ayah));
}
