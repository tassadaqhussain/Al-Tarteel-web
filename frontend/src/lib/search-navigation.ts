import {
  correctSearchQuery,
  getSurahSuggestions,
  normalizeSearchText,
} from '@/lib/search-intelligence';
import { getSurahHref, getSurahPath } from '@/lib/surah-meta';
import { parseVoiceIntent } from '@/lib/voice/parseVoiceIntent';

/** Resolve searches that identify a single Quran location without an API call. */
export function resolveDirectSearchHref(raw: string): string | null {
  const query = raw.trim();
  const normalized = normalizeSearchText(query);
  if (!normalized) return null;

  const intent = parseVoiceIntent(query);
  if (intent.type === 'OPEN_AYAH' && intent.surahNumber && intent.ayahNumber) {
    return getSurahHref(intent.surahNumber, { ayahNumber: intent.ayahNumber });
  }
  if (intent.type === 'OPEN_SURAH' && intent.surahNumber) {
    return getSurahPath(intent.surahNumber);
  }
  if (intent.type === 'NAVIGATION' && intent.destination && intent.destination !== 'BACK') {
    return intent.destination;
  }

  const juzMatch = normalized.match(/^(?:juz|para)\s+(\d{1,2})$/i);
  if (juzMatch) {
    const juzNumber = Number(juzMatch[1]);
    if (juzNumber >= 1 && juzNumber <= 30) return `/juz/${juzNumber}`;
  }

  const trailingAyah = normalized.match(/^(.+?)\s+(\d{1,3})$/);
  if (trailingAyah && !/^(?:page|pg|juz|para)\b/.test(normalized)) {
    const ayahNumber = Number(trailingAyah[2]);
    const surahHit = getSurahSuggestions(trailingAyah[1].trim(), 1)[0];
    if (surahHit && surahHit.score >= 0.68 && ayahNumber >= 1) {
      const surahNumber = Number(surahHit.id.replace('surah-', ''));
      return getSurahHref(surahNumber, { ayahNumber });
    }
  }

  const correction = correctSearchQuery(query);
  if (correction.bestSurah && correction.reason === 'surah') {
    return getSurahPath(correction.bestSurah.number);
  }

  const surahHit = getSurahSuggestions(query, 1)[0];
  if (surahHit?.href && surahHit.score >= 0.82) return surahHit.href;

  return null;
}

/** Mushaf page references need one API lookup before opening the first verse. */
export function parseQuranPageSearch(raw: string): number | null {
  const normalized = normalizeSearchText(raw);
  const match = normalized.match(/^(?:page|pg|mushaf page)\s+(\d{1,3})$/i);
  if (!match) return null;
  const pageNumber = Number(match[1]);
  return pageNumber >= 1 && pageNumber <= 604 ? pageNumber : null;
}
