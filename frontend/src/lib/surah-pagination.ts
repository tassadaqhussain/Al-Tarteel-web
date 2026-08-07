/** Reader pagination — also drives SSR depth and indexable ?page= slices. */
export const SURAH_PAGE_SIZE = 40;

/** Surahs at or below this count are fully SSR'd in one response. */
export const SURAH_FULL_SSR_THRESHOLD = 40;

/** Canonical verse counts (1–114). Used for sitemap pagination without an API dependency. */
export const SURAH_AYAH_COUNTS: readonly number[] = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89,
  59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30,
  52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15,
  21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

export function getSurahAyahCount(number: number): number {
  return SURAH_AYAH_COUNTS[number - 1] ?? 0;
}

export function surahTotalPages(ayahCount: number, pageSize = SURAH_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(Math.max(0, ayahCount) / pageSize));
}

export function clampSurahPage(page: number, ayahCount: number, pageSize = SURAH_PAGE_SIZE): number {
  const total = surahTotalPages(ayahCount, pageSize);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(total, Math.floor(page));
}

/** Inclusive ayah number range for an indexed page slice. */
export function surahVerseRange(
  page: number,
  ayahCount: number,
  pageSize = SURAH_PAGE_SIZE
): { start: number; end: number } {
  const safePage = clampSurahPage(page, ayahCount, pageSize);
  const start = (safePage - 1) * pageSize + 1;
  const end = Math.min(ayahCount, safePage * pageSize);
  return { start, end };
}

export function surahPageHref(path: string, page: number): string {
  if (page <= 1) return path;
  return `${path}?page=${page}`;
}

/** How many ayahs to request for SSR on a given slice. */
export function surahSsrLimit(ayahCount: number, page: number): number {
  if (page <= 1 && ayahCount <= SURAH_FULL_SSR_THRESHOLD) return ayahCount;
  return Math.min(
    SURAH_PAGE_SIZE,
    Math.max(0, ayahCount - (Math.max(page, 1) - 1) * SURAH_PAGE_SIZE)
  );
}
