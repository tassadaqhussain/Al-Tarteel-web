import { parseTajweedHtml } from './parse';
import type { TajweedRuleId } from './rules';

export type TajweedWordSpan = { text: string; ruleId: TajweedRuleId | null };
export type TajweedWord = { spans: TajweedWordSpan[]; plain: string };

/** Rub-el-hizb and sajdah marks are standalone tokens in the tajweed markup but
 *  are folded into a neighbouring entry in `ayah.words` — mirror that here. */
const HIZB = '۞';
const SAJDAH = '۩';
const AYAH_NUMERAL = /^[٠-٩۰-۹]+$/;

/**
 * Split verified tajweed HTML into per-word groups, preserving each rule span.
 *
 * The tajweed text and `ayah.words` come from different Uthmani orthographies
 * (tatweel and superscript-alef variants differ), so they cannot be aligned
 * character-by-character. They DO agree on word boundaries, so we align by
 * token index: word N here corresponds to `ayah.words[N]`, which is only used
 * for audio and meaning lookup. The Arabic itself is never rewritten.
 *
 * Callers must treat a length mismatch against `ayah.words` as "cannot align"
 * and fall back to plain tajweed rendering (see `alignsWithWords`).
 */
export function splitTajweedIntoWords(html: string): TajweedWord[] {
  const tokens = parseTajweedHtml(html);
  const words: TajweedWord[] = [];
  let current: TajweedWordSpan[] = [];

  const flush = () => {
    if (!current.length) return;
    const plain = current.map((s) => s.text).join('');
    if (plain.trim()) words.push({ spans: current, plain });
    current = [];
  };

  for (const token of tokens) {
    const ruleId = token.type === 'rule' ? token.ruleId : null;
    for (const part of token.value.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) flush();
      else current.push({ text: part, ruleId });
    }
  }
  flush();

  // Trailing verse number is decoration, not a word.
  while (words.length && AYAH_NUMERAL.test(words[words.length - 1].plain.trim())) words.pop();

  // Fold standalone ornaments into the neighbour that `ayah.words` uses.
  const merged: TajweedWord[] = [];
  for (let i = 0; i < words.length; i += 1) {
    const w = words[i];
    const t = w.plain.trim();
    if (t === SAJDAH && merged.length) {
      const prev = merged[merged.length - 1];
      merged[merged.length - 1] = {
        spans: [...prev.spans, { text: ' ', ruleId: null }, ...w.spans],
        plain: `${prev.plain} ${w.plain}`,
      };
      continue;
    }
    if (t === HIZB && i + 1 < words.length) {
      const next = words[i + 1];
      merged.push({
        spans: [...w.spans, { text: ' ', ruleId: null }, ...next.spans],
        plain: `${w.plain} ${next.plain}`,
      });
      i += 1;
      continue;
    }
    merged.push(w);
  }
  return merged;
}

/** True when the split lines up 1:1 with `ayah.words` and can drive per-word UI. */
export function alignsWithWords(tajweedWords: TajweedWord[], wordCount: number): boolean {
  return tajweedWords.length > 0 && tajweedWords.length === wordCount;
}
