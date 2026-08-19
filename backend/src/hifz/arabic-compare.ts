/** Strip tashkeel / normalize common Arabic letter variants for hifz matching. */
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

function tokenSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.startsWith(b) || b.startsWith(a)) {
    return Math.min(a.length, b.length) / Math.max(a.length, b.length);
  }
  const distance = levenshtein(a, b);
  return Math.max(0, 1 - distance / Math.max(a.length, b.length));
}

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
): {
  expectedNormalized: string;
  heardNormalized: string;
  accuracy: number;
  isCorrect: boolean;
  words: WordDiff[];
} {
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
