const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '../src');
const cache = new Map();
const mocks = new Map();
function load(name) {
  if (mocks.has(name)) return mocks.get(name);
  if (cache.has(name)) return cache.get(name).exports;
  const module = { exports: {} }; cache.set(name, module);
  const source = fs.readFileSync(path.join(root, `${name}.ts`), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  new Function('require', 'module', 'exports', output)(n => n.startsWith('@/') ? load(n.slice(2)) : require(n), module, module.exports);
  return module.exports;
}
const verse = (surah, ayah, reciter) => ({ ayahId: surah * 1000 + ayah, surahNumber: surah, ayahNumber: ayah, url: `https://example.org/${reciter}/${surah}/${ayah}.mp3` });
mocks.set('lib/api', { audioApi: {
  reciters: async () => [{ slug: 'husary', kind: 'reciter', isDefault: true }],
  surah: async (s, r) => [verse(s, 1, r), verse(s, 2, r)],
} });
mocks.set('lib/loadWordTimings', { loadWordTimings: async () => {} });
mocks.set('lib/audio/translation-reciters', { translationGranularity: () => 'ayah', translationVerseUrl: () => null });
mocks.set('stores/settingsStore', { useSettingsStore: { getState: () => ({ reciterSlug: 'husary', setReciterSlug() {} }) } });
(async () => {
  const playback = load('lib/audio/playback');
  const { useAudioStore } = load('stores/audioStore');
  const list = await playback.buildSurahPlaylist(30, 'husary', 'translation');
  assert.deepEqual(list.map(t => [t.ayahNumber, t.trackKind]), [[0, 'bismillah'], [1, 'arabic'], [1, 'translation'], [2, 'arabic'], [2, 'translation']]);
  assert.equal(list[0].url, verse(1, 1, 'husary').url);
  assert.equal(list[0].surahNumber, 30);
  for (const s of [1, 9]) assert.equal((await playback.buildSurahPlaylist(s, 'husary'))[0].trackKind, 'arabic');
  await playback.startSurahPlayback({ surahNumber: 30, startAyah: 1 });
  assert.equal(useAudioStore.getState().getCurrentAyah().trackKind, 'bismillah');
  useAudioStore.getState().next();
  assert.equal(useAudioStore.getState().getCurrentAyah().ayahNumber, 1);
  assert.equal(useAudioStore.getState().isPlaying, true);
  await playback.startSurahPlayback({ surahNumber: 30, startAyah: 2 });
  assert.equal(useAudioStore.getState().getCurrentAyah().ayahNumber, 2);
  useAudioStore.getState().next();
  assert.equal(useAudioStore.getState().isPlaying, false);
  await playback.startSurahPlayback({ surahNumber: 30, startAyah: 1, verseOnly: true, continuous: true });
  assert.equal(useAudioStore.getState().playlist.length, 1);
  useAudioStore.getState().next();
  assert.equal(useAudioStore.getState().isPlaying, true);
  assert.equal(useAudioStore.getState().getCurrentAyah().trackKind, 'arabic');
  await playback.rebuildActivePlayback({ arabicSlug: 'husary' });
  assert.equal(useAudioStore.getState().playlist.length, 1, 'changing reciter preserves verse-only repeat');
  const apiMock = mocks.get('lib/api').audioApi;
  const originalSurah = apiMock.surah;
  const { getSurahAyahCount } = load('lib/surah-pagination');
  apiMock.surah = async (chapter, reciter) => Array.from({ length: getSurahAyahCount(chapter) }, (_, i) => verse(chapter, i + 1, reciter));
  for (let chapter = 1; chapter <= 114; chapter++) {
    const tracks = await playback.buildSurahPlaylist(chapter, 'husary');
    const opening = chapter !== 1 && chapter !== 9;
    assert.equal(tracks.length, getSurahAyahCount(chapter) + Number(opening));
    assert.deepEqual(tracks.filter(t => t.trackKind === 'arabic').map(t => t.ayahNumber), Array.from({ length: getSurahAyahCount(chapter) }, (_, i) => i + 1));
    assert.equal(tracks[0].trackKind === 'bismillah', opening);
  }
  let releaseOld;
  apiMock.surah = (chapter, reciter) => chapter === 30 ? new Promise(resolve => { releaseOld = () => resolve([verse(chapter, 1, reciter)]); }) : originalSurah(chapter, reciter);
  const oldStart = playback.startSurahPlayback({ surahNumber: 30 });
  await Promise.resolve();
  await playback.startSurahPlayback({ surahNumber: 114 });
  releaseOld();
  assert.equal(await oldStart, false);
  assert.equal(useAudioStore.getState().getCurrentAyah().surahNumber, 114);
  const cancelledStart = playback.startSurahPlayback({ surahNumber: 30 });
  await Promise.resolve(); useAudioStore.getState().reset(); releaseOld();
  assert.equal(await cancelledStart, false, 'closing player cancels pending playlist');
  apiMock.surah = originalSurah;
  for (const slug of ['warsh-abdul-basit', 'mustafa-ismail', 'ps-shafeeq-ur-rahman']) {
    await assert.rejects(playback.buildSurahPlaylist(30, slug), /Unavailable/);
  }
  useAudioStore.getState().setReciter('custom-reciter');
  await playback.startSurahPlayback({ surahNumber: 30 });
  assert.equal(useAudioStore.getState().getCurrentAyah().reciterSlug, 'custom-reciter', 'a missing catalog entry must not substitute a different voice');
  const { createPlayRequest } = load('lib/audio/play-request');
  const requests = createPlayRequest();
  let rejectOld, failures = 0;
  requests.play({ play: () => new Promise((_, reject) => { rejectOld = reject; }) }, () => failures++);
  requests.play({ play: () => Promise.resolve() }, () => failures++);
  rejectOld(new Error('old source failed')); await Promise.resolve();
  assert.equal(failures, 0, 'old rejection must not stop the next ayah');
  requests.play({ play: () => Promise.reject({ name: 'AbortError' }) }, () => failures++);
  await Promise.resolve(); assert.equal(failures, 0);
  requests.play({ play: () => Promise.reject(new Error('blocked')) }, () => failures++);
  await Promise.resolve(); assert.equal(failures, 1, 'current playback failures must be reported');
  requests.play({ play: () => Promise.reject(new Error('paused')) }, () => failures++);
  requests.cancel(); await Promise.resolve(); assert.equal(failures, 1);
  mocks.delete('lib/loadWordTimings');
  const { loadWordTimings } = load('lib/loadWordTimings');
  const timingJobs = [];
  apiMock.wordTimings = () => new Promise(resolve => timingJobs.push(resolve));
  const oldTiming = loadWordTimings(30, 'husary');
  const newTiming = loadWordTimings(114, 'alafasy');
  timingJobs[1]({ available: true, ayahs: { 1: [{ position: 1, startMs: 0, endMs: 10 }] } });
  await newTiming;
  timingJobs[0]({ available: true, ayahs: {} }); await oldTiming;
  assert.equal(useAudioStore.getState().timingsSurahNumber, 114, 'old word timings cannot overwrite the current recitation');
  const { temporaryAudioCache } = load('lib/audio/TemporaryAudioCache');
  const realFetch = global.fetch;
  try {
    const jobs = [];
    global.fetch = () => new Promise((resolve, reject) => jobs.push({ resolve, reject }));
    const parts = { reciterSlug: 'husary', surahNumber: 30, ayahNumber: 1 };
    const first = temporaryAudioCache.preload(parts, 'https://example.org/one.mp3');
    temporaryAudioCache.release('husary:30:1:arabic');
    const second = temporaryAudioCache.preload(parts, 'https://example.org/one.mp3');
    jobs[0].reject(new Error('cancelled')); await first;
    const third = temporaryAudioCache.preload(parts, 'https://example.org/one.mp3');
    assert.equal(jobs.length, 2, 'an aborted fetch must not delete its replacement');
    jobs[1].resolve({ ok: true, blob: async () => new Blob(['audio'], { type: 'audio/mpeg' }) });
    assert.equal(await second, await third);
    temporaryAudioCache.clearSession();
  } finally { global.fetch = realFetch; }
  mocks.delete('lib/api');
  const savedFetch = global.fetch;
  try {
    global.fetch = async () => { throw new Error('API unavailable'); };
    const fallback = await load('lib/api').audioApi.surah(30, 'husary');
    assert.equal(fallback.length, 60);
    assert.ok(fallback.every(t => t.url.includes('/audio/files/husary/')));
  } finally { global.fetch = savedFetch; }
  console.log('Audio regression checks passed: opening, exceptions, voice, translations, advance, repeat, stale play promises.');
})().catch(error => { console.error(error); process.exitCode = 1; });
