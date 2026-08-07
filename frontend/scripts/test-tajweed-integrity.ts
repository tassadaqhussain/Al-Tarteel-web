/**
 * Integrity tests: stripping verified tajweed markup must not change Quran letters.
 * Run: npm run test:tajweed
 */
import assert from 'node:assert/strict';
import {
  parseTajweedHtml,
  stripTajweedMarkup,
  tajweedPreservesCanonicalText,
  tokensToPlainText,
  normalizeQuranText,
} from '../src/lib/tajweed/parse';

/** Samples constructed so annotated form is markup-only around known letters. */
const SAMPLES: { uthmani: string; tajweed: string }[] = [
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

function run() {
  for (const sample of SAMPLES) {
    const stripped = normalizeQuranText(stripTajweedMarkup(sample.tajweed));
    const canonical = normalizeQuranText(sample.uthmani);
    assert.equal(stripped, canonical, `strip mismatch\ngot:  ${stripped}\nwant: ${canonical}`);
    assert.equal(tajweedPreservesCanonicalText(sample.uthmani, sample.tajweed), true);
    const tokens = parseTajweedHtml(sample.tajweed);
    assert.equal(normalizeQuranText(tokensToPlainText(tokens)), canonical);
  }

  const unclean = 'أبجد<script>alert(1)</script><tajweed class="ghunnah">نّ</tajweed>';
  assert.equal(stripTajweedMarkup(unclean), 'أبجدalert(1)نّ');
  const tokens = parseTajweedHtml(unclean);
  assert.equal(tokensToPlainText(tokens), 'أبجدalert(1)نّ');
  assert.ok(tokens.some((t) => t.type === 'rule' && t.ruleId === 'ghunnah'));

  const unknown = parseTajweedHtml('<tajweed class="not_a_real_rule">ك</tajweed>');
  assert.deepEqual(unknown, [{ type: 'text', value: 'ك' }]);

  // OFF path: empty tajweed is always "preserving"
  assert.equal(tajweedPreservesCanonicalText('الحمد', null), true);

  console.log('tajweed integrity tests passed');
}

run();
