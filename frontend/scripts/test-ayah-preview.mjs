/**
 * Guards the homepage verse preview so an empty ayah array cannot ship
 * as a dead-end message.
 *
 * Run: node --experimental-strip-types scripts/test-ayah-preview.mjs
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  ayahPreviewUi,
  FORBIDDEN_EMPTY_PREVIEW_COPY,
  normalizeAyahList,
  translationAttribution,
} from '../src/lib/quran/ayah-preview.ts';

const root = dirname(fileURLToPath(import.meta.url));

const fatihah = [
  {
    id: 1,
    number: 1,
    textUthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
    translations: [
      {
        translatorSlug: 'en-sahih-international',
        translatorName: 'Saheeh International',
        text: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
      },
    ],
  },
];

assert.deepEqual(normalizeAyahList(fatihah).map((a) => a.number), [1]);
assert.deepEqual(normalizeAyahList({ data: fatihah }).map((a) => a.number), [1]);
assert.deepEqual(normalizeAyahList({ ayahs: fatihah }).map((a) => a.number), [1]);
assert.deepEqual(normalizeAyahList([]), []);
assert.deepEqual(normalizeAyahList(null), []);
assert.deepEqual(normalizeAyahList({ ok: true }), []);
assert.deepEqual(
  normalizeAyahList([{ number: 1, textUthmani: '   ' }, { number: 2, textUthmani: 'ٱلْحَمْدُ لِلَّهِ' }]).map(
    (a) => a.number,
  ),
  [2],
);

assert.equal(ayahPreviewUi({ loading: true, ayahs: [] }), 'loading');
assert.equal(ayahPreviewUi({ loading: true, ayahs: fatihah }), 'loading');
assert.equal(ayahPreviewUi({ loading: false, ayahs: fatihah }), 'ready');
assert.equal(ayahPreviewUi({ loading: false, ayahs: [] }), 'retry');
assert.notEqual(ayahPreviewUi({ loading: false, ayahs: [] }), 'ready');

assert.equal(translationAttribution(fatihah), 'Saheeh International');
assert.equal(translationAttribution([]), null);

const previewSource = readFileSync(join(root, '../src/components/home/TranslationsPreview.tsx'), 'utf8');
assert.equal(
  previewSource.includes(FORBIDDEN_EMPTY_PREVIEW_COPY),
  false,
  'TranslationsPreview must not ship the empty-verse dead-end copy',
);
assert.match(previewSource, /ayahPreviewUi\(/);
assert.match(previewSource, /normalizeAyahList\(/);

const homeSource = readFileSync(join(root, '../src/app/page.tsx'), 'utf8');
assert.match(homeSource, /ayahsBySurah\(/);
assert.match(homeSource, /initialAyahs/);

console.log('test-ayah-preview: ok');
