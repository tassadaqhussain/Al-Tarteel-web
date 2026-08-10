/**
 * Structured Voice Intent Parser enforcing strict 8-tier command priority.
 */

import { SURAH_VOICE_CATALOG, FAMOUS_VERSE_ALIASES, type SurahVoiceAlias } from '@/lib/voice/surahAliases';
import { GLOBAL_NAV_ROUTES, PLAYER_COMMANDS, TRANSLATION_COMMANDS } from '@/lib/voice/commandRegistry';
import { normalizeVoiceQuery } from '@/lib/voice/normalizeVoiceQuery';

export type VoiceIntentType =
  | 'OPEN_SURAH'
  | 'OPEN_AYAH'
  | 'NAVIGATION'
  | 'PLAYER_COMMAND'
  | 'TRANSLATION_COMMAND'
  | 'BOOKMARK_COMMAND'
  | 'SHARE_COMMAND'
  | 'TAFSIR_COMMAND'
  | 'QURAN_SEARCH'
  | 'UNKNOWN';

export interface VoiceIntent {
  type: VoiceIntentType;
  query: string;
  confidence: number;
  surahNumber?: number;
  surahName?: string;
  ayahNumber?: number;
  destination?: string;
  destinationLabel?: string;
  playerCommand?: 'play' | 'pause' | 'continue' | 'next' | 'prev' | 'repeat' | 'repeat_count' | 'play_from_here';
  repeatCount?: number;
  translationAction?: 'show' | 'hide' | 'set_lang';
  language?: string;
  searchQuery?: string;
  isTopic?: boolean;
}

/** Distance score matching string similarity */
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1);
  const cur = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = cur[j];
  }
  return prev[b.length];
}

function matchSimilarity(query: string, target: string): number {
  const q = query.trim().toLowerCase();
  const t = target.trim().toLowerCase();
  if (!q || !t) return 0;
  if (q === t) return 1;
  if (q.includes(t) || t.includes(q)) return 0.88;
  const dist = editDistance(q, t);
  const maxLen = Math.max(q.length, t.length);
  return Math.max(0, 1 - dist / maxLen);
}

function findBestSurahMatch(text: string): { surah: SurahVoiceAlias; score: number } | null {
  const norm = text.toLowerCase().replace(/^surah\s+|^sura\s+|^سورۃ\s+|^سورة\s+/, '').trim();
  if (!norm) return null;

  let bestSurah: SurahVoiceAlias | null = null;
  let maxScore = 0;

  for (const item of SURAH_VOICE_CATALOG) {
    if (String(item.number) === norm) {
      return { surah: item, score: 1.0 };
    }
    for (const alias of item.aliases) {
      const sc = matchSimilarity(norm, alias);
      if (sc > maxScore) {
        maxScore = sc;
        bestSurah = item;
      }
    }
  }

  if (bestSurah && maxScore >= 0.55) {
    return { surah: bestSurah, score: maxScore };
  }
  return null;
}

export function parseVoiceIntent(rawQuery: string): VoiceIntent {
  const raw = rawQuery.trim();
  const norm = normalizeVoiceQuery(raw);

  if (!norm) {
    return { type: 'UNKNOWN', query: raw, confidence: 0 };
  }

  // -------------------------------------------------------------
  // TIER 1: Exact Quran Reference (e.g., "2:255", "36:1", "surah 2 verse 255")
  // -------------------------------------------------------------
  const verseRefMatch = norm.match(/^(?:surah\s+)?(\d{1,3})\s*[:\sv]\s*(\d{1,3})$/i);
  if (verseRefMatch) {
    const surahNumber = parseInt(verseRefMatch[1], 10);
    const ayahNumber = parseInt(verseRefMatch[2], 10);
    if (surahNumber >= 1 && surahNumber <= 114 && ayahNumber >= 1) {
      const meta = SURAH_VOICE_CATALOG[surahNumber - 1];
      return {
        type: 'OPEN_AYAH',
        query: raw,
        confidence: 0.98,
        surahNumber,
        ayahNumber,
        surahName: meta?.nameSimple || `Surah ${surahNumber}`,
      };
    }
  }

  // -------------------------------------------------------------
  // TIER 2: Surah + Ayah (e.g. "Surah Baqarah ayah 255", "Surah Yaseen verse 10", "Surah Mulk 2")
  // -------------------------------------------------------------
  const surahAyahPattern = /^(?:surah\s+)?(.+?)\s+(?:ayah|ayat|verse| verse | #)\s*(\d{1,3})$/i;
  const surahAyahMatch = norm.match(surahAyahPattern);
  if (surahAyahMatch) {
    const surahNamePart = surahAyahMatch[1].trim();
    const ayahNumber = parseInt(surahAyahMatch[2], 10);
    const surahMatch = findBestSurahMatch(surahNamePart);
    if (surahMatch && surahMatch.score >= 0.55 && ayahNumber >= 1) {
      return {
        type: 'OPEN_AYAH',
        query: raw,
        confidence: Math.min(0.95, surahMatch.score + 0.1),
        surahNumber: surahMatch.surah.number,
        ayahNumber,
        surahName: surahMatch.surah.nameSimple,
      };
    }
  }

  // Also check "Ayah 255 of Surah Baqarah" pattern
  const ayahSurahPattern = /^(?:ayah|ayat|verse)\s*(\d{1,3})\s+(?:of|in|from|surah)\s+(.+)$/i;
  const ayahSurahMatch = norm.match(ayahSurahPattern);
  if (ayahSurahMatch) {
    const ayahNumber = parseInt(ayahSurahMatch[1], 10);
    const surahNamePart = ayahSurahMatch[2].trim();
    const surahMatch = findBestSurahMatch(surahNamePart);
    if (surahMatch && surahMatch.score >= 0.55 && ayahNumber >= 1) {
      return {
        type: 'OPEN_AYAH',
        query: raw,
        confidence: Math.min(0.95, surahMatch.score + 0.1),
        surahNumber: surahMatch.surah.number,
        ayahNumber,
        surahName: surahMatch.surah.nameSimple,
      };
    }
  }

  // -------------------------------------------------------------
  // TIER 3: Known Famous Quran Phrase / Name (e.g. "Ayatul Kursi", "Amanar Rasulu")
  // -------------------------------------------------------------
  for (const [aliasKey, ref] of Object.entries(FAMOUS_VERSE_ALIASES)) {
    const sc = matchSimilarity(norm, aliasKey);
    if (sc >= 0.65) {
      return {
        type: 'OPEN_AYAH',
        query: raw,
        confidence: Math.min(0.95, sc + 0.1),
        surahNumber: ref.surahNumber,
        ayahNumber: ref.ayahNumber,
        surahName: ref.title,
      };
    }
  }

  // -------------------------------------------------------------
  // TIER 4: Explicit Surah Mention (e.g. "Surah Yaseen", "Surah Rehman", "سورۃ یٰسین", "Surah Kahf kholo")
  // -------------------------------------------------------------
  const isExplicitSurahPrefix = /^(?:surah|sura|chapter|سورۃ|سورة)\s+(.+)$/i.exec(norm);
  if (isExplicitSurahPrefix) {
    const targetName = isExplicitSurahPrefix[1].trim();
    const match = findBestSurahMatch(targetName);
    if (match && match.score >= 0.5) {
      return {
        type: 'OPEN_SURAH',
        query: raw,
        confidence: Math.min(0.95, match.score + 0.15),
        surahNumber: match.surah.number,
        surahName: match.surah.nameSimple,
      };
    }
  }

  // Single word or bare Surah name match (e.g. "Yaseen", "Baqarah", "Mulkk")
  const bareSurahMatch = findBestSurahMatch(norm);
  if (bareSurahMatch && bareSurahMatch.score >= 0.72) {
    return {
      type: 'OPEN_SURAH',
      query: raw,
      confidence: bareSurahMatch.score,
      surahNumber: bareSurahMatch.surah.number,
      surahName: bareSurahMatch.surah.nameSimple,
    };
  }

  // -------------------------------------------------------------
  // TIER 5: Global App Navigation Command (e.g. "Go home", "Open bookmarks", "Open Tajweed", "Go back")
  // -------------------------------------------------------------
  if (/^go\s+back$|^back$/i.test(norm)) {
    return {
      type: 'NAVIGATION',
      query: raw,
      confidence: 0.95,
      destination: 'BACK',
      destinationLabel: 'Previous Page',
    };
  }

  for (const route of GLOBAL_NAV_ROUTES) {
    for (const kw of route.keywords) {
      const sc = matchSimilarity(norm, kw);
      if (sc >= 0.75) {
        return {
          type: 'NAVIGATION',
          query: raw,
          confidence: sc,
          destination: route.path,
          destinationLabel: route.label,
        };
      }
    }
  }

  // -------------------------------------------------------------
  // TIER 6: Quran Reader / Audio Player Command (e.g. "Play", "Pause", "Next ayah", "Repeat ayah 3 times", "Show Urdu translation")
  // -------------------------------------------------------------
  // Repeat count command e.g. "repeat this ayah three times" or "repeat 3 times"
  const repeatCountMatch = norm.match(/repeat\s+(?:this\s+)?(?:ayah\s+)?(\d+|one|two|three|four|five)\s+times/i);
  if (repeatCountMatch) {
    let count = parseInt(repeatCountMatch[1], 10);
    if (isNaN(count)) {
      const wordMap: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5 };
      count = wordMap[repeatCountMatch[1].toLowerCase()] || 3;
    }
    return {
      type: 'PLAYER_COMMAND',
      query: raw,
      confidence: 0.9,
      playerCommand: 'repeat_count',
      repeatCount: count,
    };
  }

  for (const pCmd of PLAYER_COMMANDS) {
    for (const kw of pCmd.keywords) {
      if (matchSimilarity(norm, kw) >= 0.75) {
        return {
          type: 'PLAYER_COMMAND',
          query: raw,
          confidence: 0.9,
          playerCommand: pCmd.command,
        };
      }
    }
  }

  for (const tCmd of TRANSLATION_COMMANDS) {
    for (const kw of tCmd.keywords) {
      if (matchSimilarity(norm, kw) >= 0.72) {
        return {
          type: 'TRANSLATION_COMMAND',
          query: raw,
          confidence: 0.88,
          translationAction: tCmd.action,
          language: tCmd.language,
        };
      }
    }
  }

  if (norm.includes('bookmark this') || norm.includes('bookmark ayah') || norm.includes('save ayah') || norm.includes('بک مارک')) {
    return {
      type: 'BOOKMARK_COMMAND',
      query: raw,
      confidence: 0.9,
    };
  }

  if (norm.includes('share this') || norm.includes('share ayah') || norm.includes('شئیر')) {
    return {
      type: 'SHARE_COMMAND',
      query: raw,
      confidence: 0.9,
    };
  }

  if (norm.includes('tafsir') || norm.includes('tafseer') || norm.includes('تفسیر')) {
    return {
      type: 'TAFSIR_COMMAND',
      query: raw,
      confidence: 0.88,
    };
  }

  // -------------------------------------------------------------
  // TIER 7: Topic / Semantic Search (e.g. "verses about parents", "show verses about Jannah", "verses about patience")
  // -------------------------------------------------------------
  const topicMatch = norm.match(/^(?:verses|ayahs|ayat|surahs|passages)\s+(?:about|on|regarding|for)\s+(.+)$/i);
  if (topicMatch) {
    return {
      type: 'QURAN_SEARCH',
      query: raw,
      confidence: 0.85,
      searchQuery: topicMatch[1].trim(),
      isTopic: true,
    };
  }

  // -------------------------------------------------------------
  // TIER 8: General Quran Search (Fallback text search)
  // -------------------------------------------------------------
  if (norm.length >= 2) {
    return {
      type: 'QURAN_SEARCH',
      query: raw,
      confidence: 0.7,
      searchQuery: norm,
      isTopic: false,
    };
  }

  return {
    type: 'UNKNOWN',
    query: raw,
    confidence: 0.2,
  };
}
