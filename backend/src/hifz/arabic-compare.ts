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
  heard: string | null;
  status: 'match' | 'mismatch' | 'missing' | 'extra';
};

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
  const expectedWords = expectedNormalized ? expectedNormalized.split(' ') : [];
  const heardWords = heardNormalized ? heardNormalized.split(' ') : [];

  const maxLen = Math.max(expectedWords.length, heardWords.length, 1);
  const words: WordDiff[] = [];
  let matched = 0;

  for (let i = 0; i < maxLen; i++) {
    const exp = expectedWords[i];
    const heard = heardWords[i];
    if (exp && heard) {
      if (exp === heard) {
        matched += 1;
        words.push({ expected: exp, heard, status: 'match' });
      } else {
        const dist = levenshtein(exp, heard);
        const wordSim = 1 - dist / Math.max(exp.length, heard.length, 1);
        if (wordSim >= 0.75) matched += 0.75;
        words.push({ expected: exp, heard, status: 'mismatch' });
      }
    } else if (exp && !heard) {
      words.push({ expected: exp, heard: null, status: 'missing' });
    } else if (!exp && heard) {
      words.push({ expected: '', heard, status: 'extra' });
    }
  }

  const charDist = levenshtein(expectedNormalized, heardNormalized);
  const charMax = Math.max(expectedNormalized.length, heardNormalized.length, 1);
  const charScore = Math.max(0, 1 - charDist / charMax) * 100;
  const wordScore = (matched / Math.max(expectedWords.length, 1)) * 100;
  const accuracy = Math.round(Math.min(100, wordScore * 0.65 + charScore * 0.35) * 10) / 10;
  const isCorrect = accuracy >= passThreshold && heardWords.length > 0;

  return { expectedNormalized, heardNormalized, accuracy, isCorrect, words };
}
