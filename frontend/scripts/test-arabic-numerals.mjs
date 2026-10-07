/**
 * Arabic-Indic numerals must behave like ASCII digits in search and voice.
 *
 * JavaScript's \d is ASCII-only, so a reference spoken or typed as "٢:٢٥٥"
 * matched no verse pattern and the ayah number was silently dropped — the
 * reader opened the surah at verse 1 instead.
 *
 * Run: npm run test:arabic-numerals
 */
import assert from 'node:assert/strict';
import { fromArabicNumerals, toArabicNumber } from '../src/lib/arabic-number.ts';

// --- Arabic-Indic (٠-٩) -----------------------------------------------------
assert.equal(fromArabicNumerals('٢:٢٥٥'), '2:255', 'full verse reference');
assert.equal(fromArabicNumerals('٠١٢٣٤٥٦٧٨٩'), '0123456789', 'every digit maps');
assert.equal(fromArabicNumerals('البقرة ٢٥٥'), 'البقرة 255', 'letters are untouched');

// --- Extended Arabic-Indic (۰-۹, Persian/Urdu) ------------------------------
assert.equal(fromArabicNumerals('۲۵۵'), '255', 'extended range maps too');
assert.equal(fromArabicNumerals('۰۱۲۳۴۵۶۷۸۹'), '0123456789', 'every extended digit maps');

// --- already-ASCII and mixed input ------------------------------------------
assert.equal(fromArabicNumerals('2:255'), '2:255', 'ASCII passes through');
assert.equal(fromArabicNumerals('سورة ٢ آية 255'), 'سورة 2 آية 255', 'mixed scripts');
assert.equal(fromArabicNumerals(''), '', 'empty string');

// --- the converted output must satisfy the patterns that consume it ---------
assert.ok(/^\d{1,3}$/.test(fromArabicNumerals('٢٥٥')), 'result matches an ASCII \\d pattern');
assert.ok(
  /^(?:surah\s+)?(\d{1,3})\s*[:\sv]\s*(\d{1,3})$/i.test(fromArabicNumerals('٢:٢٥٥')),
  'result matches the verse-reference pattern',
);
assert.equal(/\d/.test('٢'), false, 'guards the premise: \\d does not match Arabic-Indic');

// --- round trip with the existing forward conversion -------------------------
assert.equal(fromArabicNumerals(toArabicNumber(255)), '255', 'round trips');

console.log('test-arabic-numerals: ok');
