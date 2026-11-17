import { isPrefixedLocale } from '@/lib/i18n/content-locales';
import { getSurahNumberFromSlug } from '@/lib/surah-meta';

/**
 * Surah / juz / ayah reading surfaces — keep Quran text high-contrast and let
 * the reader sub-header stick (site Header scrolls away on these routes).
 */
export function isQuranReaderPath(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean);
  const start = parts[0] && isPrefixedLocale(parts[0]) ? 1 : 0;
  const head = parts[start] ?? '';
  if (!head || head.includes('.')) return false;
  if (head === 'surah' || head === 'juz') return true;
  return Boolean(getSurahNumberFromSlug(head));
}
