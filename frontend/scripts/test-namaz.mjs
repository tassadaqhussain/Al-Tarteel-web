/**
 * Guards the Learn Namaz content and lesson builder:
 * - every reference (dhikr, Quran passage, source, step) resolves
 * - Arabic stays Arabic and nothing marked reviewed lacks a source
 * - rak'ah structure is correct for each obligatory prayer
 * - voice commands parse in English and the learner's language
 *
 * Run: node --experimental-strip-types scripts/test-namaz.mjs
 */

import assert from 'node:assert/strict';
import { NAMAZ_CONTENT as content } from '../src/lib/namaz/content.ts';
import {
  buildLesson,
  clampStepIndex,
  localize,
  pendingReviewCount,
  PRAYER_IDS,
  rakahOutline,
  sourceUrl,
  variationsFor,
} from '../src/lib/namaz/lesson.ts';
import { parseNamazVoiceCommand, voiceCommandLocale } from '../src/lib/namaz/voice-commands.ts';
import { getAyahPath } from '../src/lib/surah-meta.ts';

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

const ARABIC = /[؀-ۿ]/;
const LATIN = /[A-Za-z]/;
const sourceIds = new Set(content.sources.map((s) => s.id));
const dhikrIds = new Set(content.dhikr.map((d) => d.id));
const quranIds = new Set(content.quran.map((q) => q.id));
const stepIds = new Set(content.steps.map((s) => s.id));

console.log('Learn Namaz content');

test('ids are unique', () => {
  assert.equal(dhikrIds.size, content.dhikr.length);
  assert.equal(quranIds.size, content.quran.length);
  assert.equal(stepIds.size, content.steps.length);
  assert.equal(sourceIds.size, content.sources.length);
});

test('every source reference resolves and has a locator', () => {
  const refs = [
    ...content.dhikr.flatMap((d) => d.sources),
    ...content.steps.flatMap((s) => s.sources),
    ...content.prerequisites.flatMap((p) => p.sources),
  ];
  for (const ref of refs) {
    assert.ok(sourceIds.has(ref.sourceId), `unknown source ${ref.sourceId}`);
    assert.ok(ref.locator.trim(), `empty locator for ${ref.sourceId}`);
    const source = content.sources.find((s) => s.id === ref.sourceId);
    if (source.kind === 'quran') assert.match(ref.locator, /^\d{1,3}:\d{1,3}$/);
  }
});

test('every supplication has Arabic, transliteration, English translation and a source', () => {
  for (const d of content.dhikr) {
    assert.ok(ARABIC.test(d.arabic), `${d.id} arabic`);
    assert.ok(!LATIN.test(d.arabic), `${d.id} arabic contains Latin letters`);
    assert.ok(d.transliteration.trim() && LATIN.test(d.transliteration), `${d.id} transliteration`);
    assert.ok(d.translation.en.trim(), `${d.id} translation`);
    assert.ok(d.sources.length > 0, `${d.id} needs a source`);
    // Arabic is never synthesised: audio must be an explicit, credited recording.
    if (d.audio) assert.ok(d.audio.url && d.audio.credit, `${d.id} audio credit`);
  }
});

test('Quran passages are references only (no stored Arabic)', () => {
  for (const q of content.quran) {
    assert.deepEqual(Object.keys(q).sort(), ['fromAyah', 'id', 'label', 'surah', 'toAyah']);
    assert.ok(q.surah >= 1 && q.surah <= 114 && q.fromAyah >= 1 && q.toAyah >= q.fromAyah);
  }
  for (const o of content.shortSurahOptions) {
    assert.ok(o.surah >= 1 && o.surah <= 114 && o.ayahCount > 0);
  }
});

test('step templates reference known recitations and carry text', () => {
  for (const step of content.steps) {
    assert.ok(step.title.en && step.action.en && step.guidance.en, step.id);
    for (const ref of step.recitations) {
      if (ref.kind === 'dhikr') assert.ok(dhikrIds.has(ref.id), `${step.id} → ${ref.id}`);
      if (ref.kind === 'quran') assert.ok(quranIds.has(ref.id), `${step.id} → ${ref.id}`);
    }
    // Spoken guidance must not trigger voice commands.
    assert.equal(parseNamazVoiceCommand(step.guidance.en, 'en'), null, `${step.id} guidance contains a command word`);
  }
});

test('nothing is marked reviewed without sources', () => {
  for (const step of content.steps) {
    if (step.review === 'reviewed') assert.ok(step.sources.length, step.id);
  }
  for (const d of content.dhikr) {
    if (d.review === 'reviewed') assert.ok(d.sources.length, d.id);
  }
});

test('learn-more links point at canonical ayah pages', () => {
  for (const p of content.prerequisites) {
    if (!p.learnMore) continue;
    const quran = p.sources.find((s) => s.sourceId === 'quran');
    assert.ok(quran, `${p.id} learn-more needs a Quran source`);
    const [s, a] = quran.locator.split(':').map(Number);
    assert.equal(p.learnMore.href, getAyahPath(s, a), p.id);
  }
});

test('hadith links are built from the locator', () => {
  assert.equal(sourceUrl(content, 'bukhari', '831'), 'https://sunnah.com/bukhari:831');
  assert.equal(sourceUrl(content, 'muslim', '402'), null);
});

console.log('Lesson builder');

const byId = Object.fromEntries(content.prayers.map((p) => [p.id, p]));

test('every prayer builds a lesson of known steps', () => {
  assert.deepEqual(PRAYER_IDS, content.prayers.map((p) => p.id));
  for (const id of PRAYER_IDS) {
    const steps = buildLesson(content, id);
    assert.ok(steps.length > 0);
    for (const step of steps) assert.ok(stepIds.has(step.templateId), step.templateId);
    assert.equal(new Set(steps.map((s) => s.key)).size, steps.length, 'unique keys');
  }
});

test('rak’ah structure matches the prayer', () => {
  for (const id of PRAYER_IDS) {
    const prayer = byId[id];
    const steps = buildLesson(content, id);
    const count = (t) => steps.filter((s) => s.templateId === t).length;
    assert.equal(count('opening-takbir'), 1, `${id} one opening takbir`);
    assert.equal(count('fatiha'), prayer.rakahs, `${id} Al-Fatihah every rak’ah`);
    assert.equal(count('short-surah'), Math.min(2, prayer.rakahs), `${id} surah in first two`);
    assert.equal(count('ruku'), prayer.rakahs);
    assert.equal(count('sujud-1') + count('sujud-2'), prayer.rakahs * 2, `${id} two prostrations per rak’ah`);
    assert.equal(count('first-tashahhud'), prayer.rakahs > 2 ? 1 : 0, `${id} middle sitting`);
    assert.equal(count('final-tashahhud'), 1);
    assert.equal(count('stand-up') + count('first-tashahhud'), prayer.rakahs - 1, `${id} stands between rak’ahs`);
    assert.deepEqual(steps.slice(-2).map((s) => s.templateId), ['salam-right', 'salam-left']);
    assert.equal(steps[0].phase, 'prepare');
    // Rak'ahs 3 and 4 say "Al-Fatihah only".
    for (const s of steps.filter((x) => x.templateId === 'fatiha')) {
      assert.equal(Boolean(s.contextNote), s.rakah > 2, `${id} rak’ah ${s.rakah} note`);
    }
    // Rak'ah numbers never go backwards.
    const rakahs = steps.map((s) => s.rakah ?? 0);
    assert.deepEqual(rakahs, [...rakahs].sort((a, b) => a - b));
    assert.equal(rakahOutline(prayer).length, prayer.rakahs);
  }
});

test('Fajr has 2 rak’ahs and no middle sitting; Maghrib has one after the 2nd', () => {
  const fajr = buildLesson(content, 'fajr');
  assert.ok(!fajr.some((s) => s.templateId === 'first-tashahhud'));
  const maghrib = buildLesson(content, 'maghrib');
  const mid = maghrib.find((s) => s.templateId === 'first-tashahhud');
  assert.equal(mid.rakah, 2);
});

test('saved step indexes are clamped', () => {
  assert.equal(clampStepIndex(undefined, 10), 0);
  assert.equal(clampStepIndex(-3, 10), 0);
  assert.equal(clampStepIndex(99, 10), 9);
  assert.equal(clampStepIndex(4.7, 10), 4);
  assert.equal(clampStepIndex(Number.NaN, 10), 0);
  assert.equal(clampStepIndex(3, 0), 0);
});

test('localize falls back to English and reports it', () => {
  assert.deepEqual(localize({ en: 'Hi' }, 'ur'), { text: 'Hi', lang: 'en', isFallback: true });
  assert.deepEqual(localize({ en: 'Hi', ur: 'سلام' }, 'ur'), { text: 'سلام', lang: 'ur', isFallback: false });
  assert.equal(localize({ en: 'Hi' }, 'en').isFallback, false);
});

test('school filter keeps general notes and never hides everything in “general”', () => {
  const step = content.steps.find((s) => s.id === 'place-hands');
  assert.equal(variationsFor(step, 'general').length, step.variations.length);
  const hanafi = variationsFor(step, 'hanafi');
  assert.ok(hanafi.length > 0 && hanafi.every((v) => v.schools.length === 0 || v.schools.includes('hanafi')));
  const fatiha = content.steps.find((s) => s.id === 'fatiha');
  assert.equal(variationsFor(fatiha, 'maliki').length, fatiha.variations.length, 'general notes shown to all');
});

test('review status is tracked', () => {
  assert.ok(pendingReviewCount(content) > 0);
});

console.log('Voice commands');

test('English commands', () => {
  assert.equal(parseNamazVoiceCommand('Next', 'en'), 'next');
  assert.equal(parseNamazVoiceCommand('please repeat that', 'en'), 'repeat');
  assert.equal(parseNamazVoiceCommand('no, go back', 'en'), 'back');
  assert.equal(parseNamazVoiceCommand('pause.', 'en'), 'pause');
  assert.equal(parseNamazVoiceCommand('resume', 'en'), 'play');
  assert.equal(parseNamazVoiceCommand('nextdoor', 'en'), null);
  assert.equal(parseNamazVoiceCommand('', 'en'), null);
});

test('learner-language commands, with English always available', () => {
  assert.equal(parseNamazVoiceCommand('اگلا', 'ur'), 'next');
  assert.equal(parseNamazVoiceCommand('دوبارہ', 'ur'), 'repeat');
  assert.equal(parseNamazVoiceCommand('التَّالِي', 'ar'), 'next');
  assert.equal(parseNamazVoiceCommand('suivant', 'fr'), 'next');
  assert.equal(parseNamazVoiceCommand('next', 'ur'), 'next');
  assert.equal(voiceCommandLocale('sw'), 'en');
  assert.equal(voiceCommandLocale('ur'), 'ur');
});

console.log(`\n${passed} passed`);
