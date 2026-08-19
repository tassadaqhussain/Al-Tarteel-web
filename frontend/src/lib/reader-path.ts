import { getSurahNumberFromSlug } from '@/lib/surah-meta';

/** Surah / juz reading surfaces — keep Quran text high-contrast. */
export function isQuranReaderPath(pathname: string): boolean {
  if (pathname.startsWith('/surah/') || pathname.startsWith('/juz/')) return true;
  const slug = pathname.replace(/^\//, '').split('/')[0] ?? '';
  if (!slug || slug.includes('.')) return false;
  return Boolean(getSurahNumberFromSlug(slug));
}
