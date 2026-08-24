/**
 * Tajweed-aware recitation comparison.
 *
 * The standard hifz compare strips ALL diacritics before matching so a
 * missing madd or ghunnah is invisible. Here we preserve diacritics for a
 * rough tajweed check while still forgiving minor STT noise.
 */

import { splitTajweedIntoWords } from './word-split';
import { getTajweedRule, TAJWEED_RULES, type TajweedRuleId } from './rules';
import { normalizeArabic } from '@/lib/hifz/compare';

export type TajweedWordFeedback = {
  /** Uthmani display form */
  expected: string;
  /** What the speech recognizer heard (null = word was skipped) */
  heard: string | null;
  /** match | mismatch | missing | extra */
  status: 'match' | 'mismatch' | 'missing' | 'extra';
  /** 0–1 consonant-level similarity */
  similarity: number;
  /** Tajweed rules active on this word (from text_tajweed annotation) */
  activeRules: TajweedRuleId[];
  /** Which of the active rules might relate to the error (for hints) */
  flaggedRules: TajweedRuleId[];
};

export type TajweedCompareResult = {
  words: TajweedWordFeedback[];
  accuracy: number;
  isCorrect: boolean;
  /** Active tajweed rule IDs across the whole ayah */
  ayahRules: TajweedRuleId[];
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  const curr: number[] = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

function tokenSim(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const d = levenshtein(a, b);
  return Math.max(0, 1 - d / Math.max(a.length, b.length));
}

/** Collect the unique rule IDs annotated on a word's tajweed spans. */
function rulesOnWord(
  wordIndex: number,
  tajweedWords: ReturnType<typeof splitTajweedIntoWords>,
): TajweedRuleId[] {
  if (wordIndex >= tajweedWords.length) return [];
  const seen = new Set<TajweedRuleId>();
  for (const span of tajweedWords[wordIndex].spans) {
    if (span.ruleId) seen.add(span.ruleId);
  }
  return [...seen];
}

/**
 * Heuristic: which tajweed rules might explain the difference between
 * `expected` (Uthmani) and what was `heard` from the STT transcript?
 *
 * We can't do phoneme-level analysis from the Web Speech API, so we infer:
 * – If a madd rule is on this word and the word is shorter than expected →
 *   the learner likely shortened the vowel.
 * – If ghunnah/idgham/iqlab/ikhafa rules are present and the consonant cluster
 *   differs → the learner likely missed the nasal resonance or assimilation.
 * – Qalqalah: if the word ends on a qalqalah letter (ق ط ب ج د) and no
 *   echo is heard, flag it.
 */
const MADD_RULES: TajweedRuleId[] = [
  'madda_normal',
  'madda_permissible',
  'madda_necessary',
];
const NASAL_RULES: TajweedRuleId[] = [
  'ghunnah',
  'ikhafa',
  'ikhafa_shafawi',
  'idgham_shafawi',
  'iqlab',
  'idgham_with_ghunnah',
  'idgham_without_ghunnah',
  'idgham_mutajanisayn',
  'idgham_mutaqaribayn',
];
const QALQALAH_LETTERS = new Set(['ق', 'ط', 'ب', 'ج', 'د']);

function flaggedRulesFor(
  expected: string,
  heard: string | null,
  activeRules: TajweedRuleId[],
): TajweedRuleId[] {
  if (!activeRules.length || !heard) return activeRules.slice();

  const expNorm = normalizeArabic(expected);
  const heardNorm = normalizeArabic(heard);
  const sim = tokenSim(expNorm, heardNorm);
  // Perfect consonant match — only flag rules about vowel length / nasality
  if (sim >= 0.95) {
    return activeRules.filter(
      (r) =>
        (MADD_RULES as string[]).includes(r) || (NASAL_RULES as string[]).includes(r),
    );
  }

  // Short word and has qalqalah annotation
  const lastChar = expNorm[expNorm.length - 1];
  if (
    activeRules.includes('qalqalah') &&
    QALQALAH_LETTERS.has(lastChar) &&
    heardNorm.length < expNorm.length
  ) {
    return ['qalqalah'];
  }

  // Generic: return all active rules as candidates
  return activeRules.slice();
}

// ---------------------------------------------------------------------------
// DP word alignment (same logic as hifz compare but carries activeRules)
// ---------------------------------------------------------------------------

type AlignMove = 'diagonal' | 'missing' | 'extra';

function alignWithTajweed(
  expectedWords: string[],
  heardWords: string[],
  tajweedWords: ReturnType<typeof splitTajweedIntoWords>,
): TajweedWordFeedback[] {
  const E = expectedWords.length;
  const H = heardWords.length;
  const expNorm = expectedWords.map(normalizeArabic);
  const heardNorm = heardWords.map(normalizeArabic);

  const costs = Array.from({ length: E + 1 }, () => new Array<number>(H + 1).fill(0));
  const moves = Array.from({ length: E + 1 }, () => new Array<AlignMove | null>(H + 1).fill(null));

  for (let i = 1; i <= E; i++) { costs[i][0] = i; moves[i][0] = 'missing'; }
  for (let j = 1; j <= H; j++) { costs[0][j] = j * 0.85; moves[0][j] = 'extra'; }

  for (let i = 1; i <= E; i++) {
    for (let j = 1; j <= H; j++) {
      const sim = tokenSim(expNorm[i - 1], heardNorm[j - 1]);
      const subCost = sim === 1 ? 0 : sim >= 0.72 ? Math.max(0.2, 1 - sim) : 1;
      const diagCost = costs[i - 1][j - 1] + subCost;
      const missCost = costs[i - 1][j] + 1;
      const extCost  = costs[i][j - 1] + 0.85;

      costs[i][j] = diagCost; moves[i][j] = 'diagonal';
      if (missCost < costs[i][j] - 0.0001) { costs[i][j] = missCost; moves[i][j] = 'missing'; }
      if (extCost  < costs[i][j] - 0.0001) { costs[i][j] = extCost;  moves[i][j] = 'extra'; }
    }
  }

  const aligned: TajweedWordFeedback[] = [];
  let i = E; let j = H;
  while (i > 0 || j > 0) {
    const move = moves[i][j];
    if (move === 'diagonal' && i > 0 && j > 0) {
      const sim = tokenSim(expNorm[i - 1], heardNorm[j - 1]);
      const activeRules = rulesOnWord(i - 1, tajweedWords);
      const status = sim === 1 ? 'match' : 'mismatch';
      aligned.push({
        expected: expectedWords[i - 1],
        heard: heardWords[j - 1],
        status,
        similarity: sim,
        activeRules,
        flaggedRules: status === 'mismatch'
          ? flaggedRulesFor(expectedWords[i - 1], heardWords[j - 1], activeRules)
          : [],
      });
      i--; j--;
    } else if (move === 'missing' && i > 0) {
      const activeRules = rulesOnWord(i - 1, tajweedWords);
      aligned.push({
        expected: expectedWords[i - 1],
        heard: null,
        status: 'missing',
        similarity: 0,
        activeRules,
        flaggedRules: activeRules.slice(),
      });
      i--;
    } else if (j > 0) {
      aligned.push({
        expected: '',
        heard: heardWords[j - 1],
        status: 'extra',
        similarity: 0,
        activeRules: [],
        flaggedRules: [],
      });
      j--;
    } else break;
  }
  return aligned.reverse();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compare a learner's spoken transcript against an ayah with tajweed context.
 *
 * @param textUthmani  Plain Uthmani text (space-separated words)
 * @param textTajweed  Quran.com tajweed HTML for this ayah (may be null)
 * @param transcript   Raw STT transcript from createArabicRecognizer
 */
export function compareTajweedRecitation(
  textUthmani: string,
  textTajweed: string | null | undefined,
  transcript: string,
  passThreshold = 85,
): TajweedCompareResult {
  const expectedWords = textUthmani.trim().split(/\s+/).filter(Boolean);
  const heardWords = transcript.trim().split(/\s+/).filter(Boolean);
  const tajweedWords = textTajweed ? splitTajweedIntoWords(textTajweed) : [];

  const words = alignWithTajweed(expectedWords, heardWords, tajweedWords);

  const expectedCount = words.filter((w) => w.status !== 'extra').length;
  const matched = words.reduce((s, w) => {
    if (w.status === 'match') return s + 1;
    if (w.status === 'mismatch') return s + (w.similarity * 0.55);
    if (w.status === 'extra') return s - 0.35;
    return s;
  }, 0);

  const expNorm = normalizeArabic(textUthmani);
  const heardNorm = normalizeArabic(transcript);
  const charDist = levenshtein(expNorm, heardNorm);
  const charScore = Math.max(0, 1 - charDist / Math.max(expNorm.length, heardNorm.length, 1)) * 100;
  const wordScore = Math.max(0, (matched / Math.max(expectedCount, 1)) * 100);
  const accuracy = Math.round(Math.min(100, wordScore * 0.75 + charScore * 0.25) * 10) / 10;
  const hasMistakes = words.some((w) => w.status !== 'match');
  const isCorrect = accuracy >= passThreshold && heardWords.length > 0 && !hasMistakes;

  const ayahRules = [...new Set(tajweedWords.flatMap((w) => w.spans.map((s) => s.ruleId)).filter(Boolean) as TajweedRuleId[])];

  return { words, accuracy, isCorrect, ayahRules };
}

/** Human-readable label for a tajweed rule. */
export function tajweedRuleLabel(id: TajweedRuleId): string {
  return getTajweedRule(id)?.name ?? id;
}

/** Hint text explaining why a word might be mispronounced. */
export function ruleHint(id: TajweedRuleId): string {
  const r = TAJWEED_RULES[id];
  if (!r) return '';
  return r.pronunciation || r.description;
}
