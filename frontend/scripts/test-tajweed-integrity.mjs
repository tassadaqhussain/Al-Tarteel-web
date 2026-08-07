/**
 * Integrity tests without TypeScript toolchain.
 * Run: node scripts/test-tajweed-integrity.mjs
 */

import assert from 'node:assert/strict';

const KNOWN = new Set([
  'ham_wasl',
  'laam_shamsiyah',
  'madda_normal',
  'madda_permissible',
  'madda_necessary',
  'ghunnah',
  'qalqalah',
  'ikhafa',
  'ikhafa_shafawi',
  'idgham_shafawi',
  'iqlab',
  'idgham_with_ghunnah',
  'idgham_without_ghunnah',
  'idgham_mutajanisayn',
  'idgham_mutaqaribayn',
  'silent',
]);

function stripTajweedMarkup(html) {
  if (!html) return '';
  return html
    .replace(/<\/?tajweed\b[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function normalizeQuranText(text) {
  return text.normalize('NFC').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseTajweedHtml(html) {
  if (!html) return [];
  const tokens = [];
  const re = /<tajweed\b([^>]*)>([\s\S]*?)<\/tajweed>/gi;
  let lastIndex = 0;
  let match;
  const pushText = (value) => {
    if (!value) return;
    const prev = tokens[tokens.length - 1];
    if (prev?.type === 'text') prev.value += value;
    else tokens.push({ type: 'text', value });
  };
  const stripAll = (s) => s.replace(/<[^>]+>/g, '');
  while ((match = re.exec(html)) !== null) {
    if (match.index > lastIndex) pushText(stripAll(html.slice(lastIndex, match.index)));
    const attrs = match[1] ?? '';
    const inner = stripAll(match[2] ?? '');
    const classMatch = /\bclass\s*=\s*["']([^"']+)["']/i.exec(attrs);
    const classNames = (classMatch?.[1] ?? '').split(/\s+/).filter(Boolean);
    const ruleId = classNames.find((c) => KNOWN.has(c));
    if (ruleId && inner) tokens.push({ type: 'rule', ruleId, value: inner });
    else if (inner) pushText(inner);
    lastIndex = re.lastIndex;
  }
  if (lastIndex < html.length) pushText(stripAll(html.slice(lastIndex)));
  return tokens;
}

function tokensToPlainText(tokens) {
  return tokens.map((t) => t.value).join('');
}

const SAMPLES = [
  {
    uthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    tajweed:
      'بِسْمِ <tajweed class="ham_wasl">ٱ</tajweed>للَّهِ <tajweed class="ham_wasl">ٱ</tajweed>لرَّحْمَٰنِ <tajweed class="ham_wasl">ٱ</tajweed>لرَّحِيمِ',
  },
  {
    uthmani: 'قُلْ أَعُوذُ',
    tajweed: '<tajweed class="qalqalah">قُ</tajweed>لْ أَعُوذُ',
  },
  {
    uthmani: 'مِن شَرِّ',
    tajweed: 'مِ<tajweed class="ikhafa">ن</tajweed> شَرِّ',
  },
  {
    uthmani: 'عَمَّ',
    tajweed: 'عَ<tajweed class="ghunnah">مَّ</tajweed>',
  },
];

for (const sample of SAMPLES) {
  const stripped = normalizeQuranText(stripTajweedMarkup(sample.tajweed));
  const canonical = normalizeQuranText(sample.uthmani);
  assert.equal(stripped, canonical);
  const tokens = parseTajweedHtml(sample.tajweed);
  assert.equal(normalizeQuranText(tokensToPlainText(tokens)), canonical);
}

const unclean = 'أبجد<script>alert(1)</script><tajweed class="ghunnah">نّ</tajweed>';
assert.equal(stripTajweedMarkup(unclean), 'أبجدalert(1)نّ');
assert.ok(parseTajweedHtml(unclean).some((t) => t.type === 'rule' && t.ruleId === 'ghunnah'));
assert.deepEqual(parseTajweedHtml('<tajweed class="not_a_real_rule">ك</tajweed>'), [
  { type: 'text', value: 'ك' },
]);

console.log('tajweed integrity tests passed');
