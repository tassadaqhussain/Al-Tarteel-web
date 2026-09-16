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

(async () => {
  const { normalizeWords, loadReaderWords } = load('lib/word-data');
  const source = [{ id: 1, position: 1, char_type_name: 'word', text_uthmani: 'غُلِبَتِ', translation: { text: 'Have been defeated', language_name: 'english' } }, { id: 2, position: 2, char_type_name: 'end', text: '٢' }];
  const words = normalizeWords(source);
  assert.equal(words.length, 1, 'end markers are not clickable words');
  assert.equal(words[0].translations.en, 'Have been defeated');
  let calls = 0;
  const savedFetch = global.fetch;
  try {
    global.fetch = async () => { calls++; return { ok: true, json: async () => ({ '30:1': words, '30:2': words }) }; };
    const results = await Promise.all([loadReaderWords(30, 1, 'en'), loadReaderWords(30, 2, 'en')]);
    assert.equal(calls, 1, 'verses share a single word-data request');
    assert.deepEqual(results, [words, words]);
    const { GET } = load('app/reader-data/words/route');
    assert.equal((await GET(new Request('https://example.com/reader-data/words?surah=999&page=1'))).status, 400);
    global.fetch = async () => ({ ok: true, json: async () => ({ verses: [{ verse_key: '30:2', words: source }] }) });
    const response = await GET(new Request('https://example.com/reader-data/words?surah=30&page=1&language=en'));
    assert.deepEqual((await response.json())['30:2'], JSON.parse(JSON.stringify(words)));
    global.fetch = async () => { throw new Error('offline'); };
    assert.equal((await GET(new Request('https://example.com/reader-data/words?surah=30&page=1'))).status, 502);
  } finally { global.fetch = savedFetch; }
  console.log('Word data checks passed: meanings, end markers, request sharing, validation, source failure.');
})().catch(error => { console.error(error); process.exitCode = 1; });
