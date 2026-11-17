/**
 * Single source of truth for the curated "Ayah of the Day".
 * Used by the homepage (TodaySection) and DailyMotivation (My Quran / elsewhere).
 * Refs only — Arabic text is always loaded from the canonical API.
 */
export const CURATED_DAILY_VERSES: ReadonlyArray<{ surah: number; ayah: number }> = [
  { surah: 2, ayah: 255 }, // Ayat al-Kursi
  { surah: 13, ayah: 28 }, // Hearts find rest in remembrance of Allah
  { surah: 94, ayah: 5 }, // With hardship comes ease
  { surah: 2, ayah: 286 }, // Allah does not burden a soul beyond its capacity
  { surah: 39, ayah: 53 }, // Do not despair of the mercy of Allah
  { surah: 65, ayah: 3 }, // Whoever relies upon Allah, He is sufficient
  { surah: 16, ayah: 90 }, // Justice and excellence
  { surah: 3, ayah: 139 }, // Do not weaken and do not grieve
  { surah: 24, ayah: 35 }, // Light upon light
  { surah: 55, ayah: 13 }, // Which of the favors of your Lord would you deny
];

function dayOfYearFromKey(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return 1;
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 86_400_000);
}

function localKey(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

/** Curated verse for a YYYY-MM-DD key (defaults to the viewer's local today). */
export function getCuratedDailyVerse(dateKey: string = localKey()): { surah: number; ayah: number } {
  const i = dayOfYearFromKey(dateKey) % CURATED_DAILY_VERSES.length;
  return CURATED_DAILY_VERSES[i]!;
}
