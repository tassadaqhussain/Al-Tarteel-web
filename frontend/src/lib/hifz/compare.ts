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
  heard: string | null;
  status: 'match' | 'mismatch' | 'missing' | 'extra';
};

export function compareRecitation(
  expectedRaw: string,
  heardRaw: string,
  passThreshold = 85,
) {
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
  const displayWords = (expectedRaw || '').trim().split(/\s+/).filter(Boolean);
  const expectedNorm = displayWords.map((w) => normalizeArabic(w)).filter(Boolean);
  const heardNorm = normalizeArabic(heardRaw).split(' ').filter(Boolean);

  let filledCount = 0;
  let h = 0;
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
