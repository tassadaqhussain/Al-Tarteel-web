/** Client-side Arabic normalize + compare (mirrors backend hifz matcher). */

export function normalizeArabic(text: string): string {
  return (text || '')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/\u0640/g, '')
    .replace(/[إأآٱا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\u0600-\u06FF\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
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

export type WordDiff = {
  expected: string;
  expectedNormalized?: string;
  heard: string | null;
  status: 'match' | 'mismatch' | 'missing' | 'extra';
  similarity?: number;
};

type AlignmentMove = 'diagonal' | 'missing' | 'extra';

function alignWords(expectedRaw: string, heardRaw: string): WordDiff[] {
  const expectedWords = expectedRaw
    .trim()
    .split(/\s+/)
    .map((display) => ({ display, normalized: normalizeArabic(display) }))
    .filter((word) => word.normalized.length > 0);
  const heardWords = normalizeArabic(heardRaw).split(' ').filter(Boolean);
  const expectedCount = expectedWords.length;
  const heardCount = heardWords.length;
  const costs = Array.from({ length: expectedCount + 1 }, () =>
    Array<number>(heardCount + 1).fill(0),
  );
  const moves = Array.from({ length: expectedCount + 1 }, () =>
    Array<AlignmentMove | null>(heardCount + 1).fill(null),
  );

  for (let i = 1; i <= expectedCount; i += 1) {
    costs[i][0] = i;
    moves[i][0] = 'missing';
  }
  for (let j = 1; j <= heardCount; j += 1) {
    costs[0][j] = j * 0.85;
    moves[0][j] = 'extra';
  }

  for (let i = 1; i <= expectedCount; i += 1) {
    for (let j = 1; j <= heardCount; j += 1) {
      const similarity = tokenSimilarity(expectedWords[i - 1].normalized, heardWords[j - 1]);
      const substitutionCost =
        similarity === 1 ? 0 : similarity >= 0.72 ? Math.max(0.2, 1 - similarity) : 1;
      const diagonal = costs[i - 1][j - 1] + substitutionCost;
      const missing = costs[i - 1][j] + 1;
      const extra = costs[i][j - 1] + 0.85;

      // Prefer a substitution on ties, then a missed word, so one omission does not
      // turn every following word into a false correction.
      costs[i][j] = diagonal;
      moves[i][j] = 'diagonal';
      if (missing < costs[i][j] - 0.0001) {
        costs[i][j] = missing;
        moves[i][j] = 'missing';
      }
      if (extra < costs[i][j] - 0.0001) {
        costs[i][j] = extra;
        moves[i][j] = 'extra';
      }
    }
  }

  const aligned: WordDiff[] = [];
  let i = expectedCount;
  let j = heardCount;
  while (i > 0 || j > 0) {
    const move = moves[i][j];
    if (move === 'diagonal' && i > 0 && j > 0) {
      const expected = expectedWords[i - 1];
      const heard = heardWords[j - 1];
      const similarity = tokenSimilarity(expected.normalized, heard);
      aligned.push({
        expected: expected.display,
        expectedNormalized: expected.normalized,
        heard,
        status: similarity === 1 ? 'match' : 'mismatch',
        similarity,
      });
      i -= 1;
      j -= 1;
    } else if (move === 'missing' && i > 0) {
      const expected = expectedWords[i - 1];
      aligned.push({
        expected: expected.display,
        expectedNormalized: expected.normalized,
        heard: null,
        status: 'missing',
        similarity: 0,
      });
      i -= 1;
    } else if (j > 0) {
      aligned.push({
        expected: '',
        expectedNormalized: '',
        heard: heardWords[j - 1],
        status: 'extra',
        similarity: 0,
      });
      j -= 1;
    } else {
      break;
    }
  }

  return aligned.reverse();
}

export function compareRecitation(
  expectedRaw: string,
  heardRaw: string,
  passThreshold = 85,
) {
  const expectedNormalized = normalizeArabic(expectedRaw);
  const heardNormalized = normalizeArabic(heardRaw);
  const heardWords = heardNormalized ? heardNormalized.split(' ') : [];
  const words = alignWords(expectedRaw, heardRaw);
  const expectedWordCount = words.filter((word) => word.status !== 'extra').length;
  const matched = words.reduce((score, word) => {
    if (word.status === 'match') return score + 1;
    if (word.status === 'mismatch') return score + (word.similarity ?? 0) * 0.55;
    if (word.status === 'extra') return score - 0.35;
    return score;
  }, 0);

  const charDist = levenshtein(expectedNormalized, heardNormalized);
  const charMax = Math.max(expectedNormalized.length, heardNormalized.length, 1);
  const charScore = Math.max(0, 1 - charDist / charMax) * 100;
  const wordScore = Math.max(0, (matched / Math.max(expectedWordCount, 1)) * 100);
  const accuracy = Math.round(Math.min(100, wordScore * 0.75 + charScore * 0.25) * 10) / 10;
  const hasMistakes = words.some((word) => word.status !== 'match');
  const isCorrect = accuracy >= passThreshold && heardWords.length > 0 && !hasMistakes;

  return { expectedNormalized, heardNormalized, accuracy, isCorrect, words };
}

export function blankPlaceholder(text: string): string {
  const words = (text || '').trim().split(/\s+/).filter(Boolean);
  return words.map(() => ' ——— ').join(' ');
}

/** How closely two normalized Arabic tokens match (0–1). */
function tokenSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.startsWith(b) || b.startsWith(a)) {
    return Math.min(a.length, b.length) / Math.max(a.length, b.length);
  }
  const dist = levenshtein(a, b);
  return Math.max(0, 1 - dist / Math.max(a.length, b.length));
}

/**
 * Progressive fill while speaking: reveal expected Uthmani words as heard tokens match.
 * Stops at the first hard mismatch so later blanks stay hidden.
 */
export function progressiveAyahFill(expectedRaw: string, heardRaw: string) {
  const expectedWords = (expectedRaw || '')
    .trim()
    .split(/\s+/)
    .map((display) => ({ display, normalized: normalizeArabic(display) }))
    .filter((word) => word.normalized.length > 0);
  const displayWords = expectedWords.map((word) => word.display);
  const expectedNorm = expectedWords.map((word) => word.normalized);
  const heardNorm = normalizeArabic(heardRaw).split(' ').filter(Boolean);

  let filledCount = 0;
  let h = 0;
  let mistakeExpected: string | null = null;
  let mistakeHeard: string | null = null;
  while (filledCount < expectedNorm.length && h < heardNorm.length) {
    const exp = expectedNorm[filledCount];
    const heard = heardNorm[h];
    const sim = tokenSimilarity(exp, heard);

    if (sim >= 0.78) {
      filledCount += 1;
      h += 1;
      continue;
    }

    // Partial current word while still speaking (prefix)
    if (exp.startsWith(heard) && heard.length >= Math.min(2, exp.length)) {
      break;
    }

    // Skip a duplicated / stuttered heard token
    if (h + 1 < heardNorm.length && tokenSimilarity(exp, heardNorm[h + 1]) >= 0.78) {
      h += 1;
      continue;
    }

    mistakeExpected = displayWords[filledCount] || null;
    mistakeHeard = heard || null;
    break;
  }

  const complete = filledCount >= expectedNorm.length && expectedNorm.length > 0;
  const filledText = displayWords.slice(0, filledCount).join(' ');
  const remainderBlanks = displayWords
    .slice(filledCount)
    .map(() => '———')
    .join(' ');

  return {
    displayWords,
    filledCount,
    total: displayWords.length,
    complete,
    filledText,
    mistakeExpected,
    mistakeHeard,
    expectedNext: displayWords[filledCount] || null,
    visual: [filledText, remainderBlanks].filter(Boolean).join(' '),
  };
}


export function todayDateKey(timeZone?: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    return localDateKey(new Date());
  }
}

export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function lastLocalDateKeys(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(localDateKey(d));
  }
  return out;
}
