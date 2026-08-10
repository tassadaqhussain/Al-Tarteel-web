/**
 * Normalizes voice query text for intent parsing and search indexing.
 * Handles English, Arabic, Urdu, and Roman Urdu speech patterns.
 */

const FILLER_PREFIXES = [
  'please',
  'can you',
  'could you',
  'i want to',
  'show me',
  'open up',
  'go to',
  'navigate to',
  'search for',
  'search about',
  'look up',
  'play',
  'read',
  'find',
  'mujhe',
  'batao',
  'dikhao',
  'sunao',
  'chalao',
  'kholo',
  'kholain',
  'khol',
];

const NUMBER_WORDS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  hundred: 100,
  // Urdu / Roman Urdu numbers
  ek: 1,
  do: 2,
  teen: 3,
  char: 4,
  chaar: 4,
  panch: 5,
  paanch: 5,
  chah: 6,
  saat: 7,
  aath: 8,
  nau: 9,
  das: 10,
  'ایک': 1,
  'دو': 2,
  'تین': 3,
  'چار': 4,
  'پانچ': 5,
  'چھ': 6,
  'سات': 7,
  'آٹھ': 8,
  'نو': 9,
  'دس': 10,
};

function stripDiacritics(str: string): string {
  return str.normalize('NFD').replace(/\p{M}/gu, '');
}

/** Converts word-based numbers like "two hundred fifty five" to digit strings where appropriate */
export function convertWordNumbersToDigits(text: string): string {
  let cleaned = text.toLowerCase();

  // Replace common spoken numbers like "verse 2 5 5" or "chapter 3 6"
  const tokens = cleaned.split(/\s+/);
  const result: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (NUMBER_WORDS[tok] !== undefined) {
      // Check if next token is also a number (e.g. "two hundred fifty five")
      if (tok === 'two' && tokens[i + 1] === 'hundred' && tokens[i + 2] === 'fifty' && tokens[i + 3] === 'five') {
        result.push('255');
        i += 3;
        continue;
      }
      if (tok === 'hundred') {
        result.push('100');
        continue;
      }
      result.push(String(NUMBER_WORDS[tok]));
    } else {
      result.push(tok);
    }
  }

  return result.join(' ');
}

export function normalizeVoiceQuery(rawQuery: string): string {
  if (!rawQuery) return '';

  let text = stripDiacritics(rawQuery.trim())
    .toLowerCase()
    // Replace non-alphanumeric except Arabic/Urdu unicode range and : or -
    .replace(/[^a-z0-9\u0600-\u06ff\s:-]/gi, ' ')
    .replace(/\s+/g, ' ');

  text = convertWordNumbersToDigits(text);

  // Strip filler action verbs from edges (e.g., "surah yaseen kholo" -> "surah yaseen")
  const words = text.split(' ');
  const filteredWords = words.filter((w) => !FILLER_PREFIXES.includes(w) || words.length <= 2);

  const clean = filteredWords.join(' ').trim();
  return clean || text;
}
