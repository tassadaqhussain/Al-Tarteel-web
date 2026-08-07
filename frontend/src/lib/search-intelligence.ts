/**
 * Client-side search intelligence: typo tolerance, aliases, and autosuggest.
 * Triggers suggestions after 3 typed characters.
 */

import { SURAH_ARABIC, SURAH_SIMPLE_NAMES } from '@/lib/surah-meta';

export type SuggestKind = 'surah' | 'topic' | 'query';

export interface SearchSuggestion {
  id: string;
  kind: SuggestKind;
  label: string;
  subtitle?: string;
  /** Text inserted / searched when picked */
  query: string;
  /** Optional direct navigation */
  href?: string;
  score: number;
}

/** Common misspellings / alternate spellings → canonical search term */
const TOPIC_ALIASES: Record<string, string[]> = {
  patience: ['sabr', 'patient', 'perseverance'],
  sabr: ['patience', 'patient'],
  guidance: ['huda', 'hudan', 'guide', 'guided'],
  mercy: ['rahma', 'rahmah', 'compassionate'],
  gratitude: ['shukr', 'thankful', 'thanks'],
  forgiveness: ['maghfirah', 'forgive', 'repent', 'tawbah'],
  paradise: ['jannah', 'heaven', 'garden'],
  hell: ['jahannam', 'fire', 'hellfire'],
  prayer: ['salah', 'salat', 'worship'],
  charity: ['zakat', 'sadaqah', 'sadaqa'],
  faith: ['iman', 'believe', 'believers'],
  knowledge: ['ilm', 'wisdom', 'learn'],
  'ayat al-kursi': ['ayatalkursi', 'kursi', 'throne verse', '2:255'],
  kursi: ['ayat al-kursi', 'ayatalkursi', 'throne'],
};

/** Surah number → alternate names people type */
const SURAH_ALIASES: Record<number, string[]> = {
  1: ['fatihah', 'fatiha', 'fateh', 'fatha', 'alfatihah', 'opening', 'al fateh'],
  2: ['baqarah', 'baqara', 'bakara', 'cow'],
  3: ['imran', 'al imran', 'aliimran'],
  18: ['kahf', 'kahaf', 'cave'],
  19: ['maryam', 'mariam', 'mary'],
  36: ['yasin', 'yaseen', 'yaasin', 'ya sin'],
  55: ['rahman', 'rehman', 'arrahman'],
  56: ['waqiah', 'waqiya', 'event'],
  67: ['mulk', 'dominion', 'sovereignty'],
  112: ['ikhlas', 'ikhlaas', 'sincerity', 'tawhid'],
  113: ['falaq', 'daybreak'],
  114: ['nas', 'mankind', 'people'],
  48: ['fath', 'victory', 'conquest'],
  97: ['qadr', 'power', 'decree', 'laylatul qadr'],
};

const POPULAR_QUERIES = [
  'Ayat al-Kursi',
  'Al-Fatihah',
  'Ya-Sin',
  'Ar-Rahman',
  'Al-Kahf',
  'patience',
  'guidance',
  'mercy',
  'forgiveness',
];

function stripDiacritics(s: string) {
  return s.normalize('NFD').replace(/\p{M}/gu, '');
}

export function normalizeSearchText(q: string) {
  return stripDiacritics(q)
    .toLowerCase()
    .replace(/surah|sura|chapter/gi, ' ')
    .replace(/[^a-z0-9\u0600-\u06ff\s:-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compact(s: string) {
  return normalizeSearchText(s).replace(/[^a-z0-9\u0600-\u06ff]/g, '');
}

/** Levenshtein distance (small strings) */
export function editDistance(a: string, b: string) {
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

function similarity(a: string, b: string) {
  const x = compact(a);
  const y = compact(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  if (x.includes(y) || y.includes(x)) return 0.85;
  const dist = editDistance(x, y);
  const maxLen = Math.max(x.length, y.length);
  return Math.max(0, 1 - dist / maxLen);
}

type SurahEntry = {
  number: number;
  nameSimple: string;
  nameArabic: string;
  aliases: string[];
};

function buildSurahCatalog(): SurahEntry[] {
  const list: SurahEntry[] = [];
  for (let i = 1; i <= 114; i++) {
    const nameSimple = SURAH_SIMPLE_NAMES[i] || `Surah ${i}`;
    const nameArabic = SURAH_ARABIC[i] || '';
    const aliases = [
      nameSimple,
      nameSimple.replace(/[^a-zA-Z]/g, ''),
      ...(SURAH_ALIASES[i] || []),
    ];
    list.push({ number: i, nameSimple, nameArabic, aliases });
  }
  return list;
}

const SURAH_CATALOG = buildSurahCatalog();

export function scoreSurahMatch(query: string, entry: SurahEntry) {
  const n = normalizeSearchText(query);
  const c = compact(query);
  if (!n) return 0;
  if (String(entry.number) === n) return 1;
  let best = similarity(n, entry.nameSimple);
  for (const alias of entry.aliases) {
    best = Math.max(best, similarity(n, alias), similarity(c, compact(alias)));
  }
  // Prefer stronger match on short queries only if alias starts with typed text
  if (c.length >= 3) {
    for (const alias of entry.aliases) {
      const ac = compact(alias);
      if (ac.startsWith(c)) best = Math.max(best, 0.92);
    }
  }
  return best;
}

export function getSurahSuggestions(query: string, limit = 5): SearchSuggestion[] {
  const n = normalizeSearchText(query);
  if (n.length < 3) return [];
  return SURAH_CATALOG.map((entry) => {
    const score = scoreSurahMatch(query, entry);
    return {
      id: `surah-${entry.number}`,
      kind: 'surah' as const,
      label: entry.nameSimple,
      subtitle: `${String(entry.number).padStart(2, '0')} · ${entry.nameArabic}`,
      query: entry.nameSimple,
      href: `/surah/${entry.number}`,
      score,
    };
  })
    .filter((s) => s.score >= 0.45)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .slice(0, limit);
}

function getTopicSuggestions(query: string, limit = 4): SearchSuggestion[] {
  const n = normalizeSearchText(query);
  if (n.length < 3) return [];
  const out: SearchSuggestion[] = [];
  for (const [canonical, aliases] of Object.entries(TOPIC_ALIASES)) {
    const all = [canonical, ...aliases];
    let best = 0;
    for (const a of all) best = Math.max(best, similarity(n, a));
    if (best >= 0.55) {
      out.push({
        id: `topic-${canonical}`,
        kind: 'topic',
        label: canonical,
        subtitle: 'Topic search',
        query: canonical,
        score: best,
      });
    }
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}

function getPopularSuggestions(query: string, limit = 3): SearchSuggestion[] {
  const n = normalizeSearchText(query);
  if (n.length < 3) return [];
  return POPULAR_QUERIES.map((q) => ({
    id: `q-${q}`,
    kind: 'query' as const,
    label: q,
    subtitle: 'Popular',
    query: q,
    score: similarity(n, q),
  }))
    .filter((s) => s.score >= 0.4)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Autosuggest after 3+ characters */
export function getSearchSuggestions(query: string, limit = 8): SearchSuggestion[] {
  const n = normalizeSearchText(query);
  if (n.length < 3) return [];
  const merged = [
    ...getSurahSuggestions(query, 5),
    ...getTopicSuggestions(query, 3),
    ...getPopularSuggestions(query, 3),
  ];
  const seen = new Set<string>();
  const unique: SearchSuggestion[] = [];
  for (const s of merged.sort((a, b) => b.score - a.score)) {
    const key = `${s.kind}:${s.query.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(s);
    if (unique.length >= limit) break;
  }
  return unique;
}

export interface QueryCorrection {
  original: string;
  corrected: string;
  didCorrect: boolean;
  bestSurah?: { number: number; nameSimple: string };
  reason?: string;
}

/**
 * Correct misspelled surah/topic queries before hitting the API.
 * e.g. "surah al- fateh" → "Al-Fatihah"
 */
export function correctSearchQuery(query: string): QueryCorrection {
  const original = query.trim();
  const n = normalizeSearchText(original);
  if (n.length < 3) {
    return { original, corrected: original, didCorrect: false };
  }

  const surahHits = getSurahSuggestions(original, 1);
  if (surahHits[0] && surahHits[0].score >= 0.55) {
    const num = Number(surahHits[0].id.replace('surah-', ''));
    return {
      original,
      corrected: surahHits[0].query,
      didCorrect: normalizeSearchText(surahHits[0].query) !== n,
      bestSurah: { number: num, nameSimple: surahHits[0].label },
      reason: 'surah',
    };
  }

  const topicHits = getTopicSuggestions(original, 1);
  if (topicHits[0] && topicHits[0].score >= 0.62) {
    return {
      original,
      corrected: topicHits[0].query,
      didCorrect: normalizeSearchText(topicHits[0].query) !== n,
      reason: 'topic',
    };
  }

  // Token-level: fix only the last misspelled token against known vocabulary
  const vocab = new Set<string>();
  for (const e of SURAH_CATALOG) {
    vocab.add(compact(e.nameSimple));
    e.aliases.forEach((a) => vocab.add(compact(a)));
  }
  Object.keys(TOPIC_ALIASES).forEach((k) => vocab.add(compact(k)));
  Object.values(TOPIC_ALIASES).forEach((arr) => arr.forEach((a) => vocab.add(compact(a))));

  const tokens = n.split(' ').filter(Boolean);
  let changed = false;
  const fixed = tokens.map((tok) => {
    if (tok.length < 3) return tok;
    const c = compact(tok);
    if (vocab.has(c)) return tok;
    let best = tok;
    let bestScore = 0;
    for (const v of vocab) {
      if (v.length < 3) continue;
      const sc = similarity(c, v);
      if (sc > bestScore) {
        bestScore = sc;
        best = v;
      }
    }
    if (bestScore >= 0.72 && best !== c) {
      changed = true;
      return best;
    }
    return tok;
  });

  if (changed) {
    const corrected = fixed.join(' ');
    return { original, corrected, didCorrect: true, reason: 'token' };
  }

  return { original, corrected: original, didCorrect: false };
}

/** Extra query variants to try when primary search returns empty */
export function expandSearchVariants(query: string): string[] {
  const c = correctSearchQuery(query);
  const variants = new Set<string>([query.trim()]);
  if (c.didCorrect) variants.add(c.corrected);
  if (c.bestSurah) variants.add(c.bestSurah.nameSimple);

  const n = normalizeSearchText(query);
  for (const [canonical, aliases] of Object.entries(TOPIC_ALIASES)) {
    const all = [canonical, ...aliases];
    if (all.some((a) => similarity(n, a) >= 0.6)) {
      variants.add(canonical);
      aliases.slice(0, 2).forEach((a) => variants.add(a));
    }
  }

  return [...variants].filter(Boolean).slice(0, 5);
}
