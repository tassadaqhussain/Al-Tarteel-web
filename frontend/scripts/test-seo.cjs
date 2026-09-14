/* Run with node scripts/test-seo.cjs. Uses the project's TypeScript compiler so
 * production helpers (including @/ imports) run without a second build tool. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '../src');
const cache = new Map();
function load(file) {
  const filename = path.resolve(root, file.endsWith('.ts') ? file : `${file}.ts`);
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} };
  cache.set(filename, module);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const localRequire = (name) => name.startsWith('@/') ? load(name.slice(2)) : require(name);
  new Function('require', 'module', 'exports', output)(localRequire, module, module.exports);
  return module.exports;
}
const pagination = load('lib/surah-pagination');
const seo = load('lib/seo');
const routing = load('lib/i18n/locale-routing');
const sitemap = load('lib/sitemap-data');
const xml = load('lib/sitemap-xml');
let slices = 0;
for (let number = 1; number <= 114; number++) {
  const count = pagination.getSurahAyahCount(number);
  const verses = Array.from({ length: count }, (_, i) => i + 1);
  const collected = [];
  for (let page = 1; page <= pagination.surahTotalPages(count); page++) {
    const limit = pagination.surahSsrLimit(count, page);
    // Model the backend's actual skip/take contract, including partial last pages.
    const result = verses.slice((page - 1) * limit, page * limit);
    const range = pagination.surahVerseRange(page, count);
    assert.equal(result[0], range.start, `surah ${number}, page ${page}: start`);
    assert.equal(result.at(-1), range.end, `surah ${number}, page ${page}: end`);
    collected.push(...result);
    for (const locale of ['en', 'ur', 'ps', 'fa']) {
      const meta = seo.surahSeo(number, { ayahCount: count, page, locale }).metadata;
      assert.equal(meta.robots.index, true);
      assert.equal(meta.robots.googleBot.index, true);
      assert.equal(meta.alternates.canonical, meta.alternates.languages[locale]);
      assert.equal(new URL(meta.alternates.canonical).search, page > 1 ? `?page=${page}` : '');
    }
    slices++;
  }
  assert.deepEqual(collected, verses, `surah ${number}: no skipped or repeated verses`);
}
for (const input of ['255junk', '2.5', '-1', '0', '287', '', '1e2', 'Infinity']) {
  assert.equal(pagination.parseAyahNumber(input, 2), null, input);
}
assert.equal(pagination.parseAyahNumber('0255', 2), 255);
assert.equal(pagination.parseAyahNumber('255', 2), 255);
for (const locale of ['ur', 'ps', 'fa']) {
  assert.equal(routing.pathForUiLocale('/surahs', locale), `/${locale}`);
  assert.equal(routing.pathForUiLocale('/al-baqarah/255', locale), `/${locale}/al-baqarah/255`);
  assert.equal(routing.pathForUiLocale('/articles/understanding-surah-al-fatihah', locale), '/articles/understanding-surah-al-fatihah');
  assert.equal(routing.pathForUiLocale('/settings', locale), '/settings');
  assert.ok(!seo.ayahSeo(2, 255, { locale }).metadata.description.startsWith('Read '));
}
const entries = sitemap.SITEMAP_SHARD_IDS.flatMap(sitemap.sitemapShardEntries);
assert.equal(new Set(entries.map((e) => e.url)).size, entries.length);
for (const locale of ['ur', 'ps', 'fa']) {
  assert.ok(entries.some((e) => e.url === `${seo.SITE_URL}/${locale}/al-baqarah/255`));
}
const rendered = xml.renderUrlset(entries);
assert.ok(!rendered.includes('<lastmod>'), 'Do not invent content modification dates');
assert.ok(!xml.renderSitemapIndex(['https://example.com/sitemap.xml']).includes('<lastmod>'));
assert.ok(xml.renderUrlset([{ url: 'https://example.com/?a=1&b=2', changeFrequency: 'monthly', priority: 1 }]).includes('?a=1&amp;b=2'));
assert.equal((rendered.match(/<url>/g) || []).length, entries.length);
console.log(`SEO checks passed: ${slices} verse slices across all 114 surahs, four locales, URL validation and ${entries.length} sitemap URLs.`);

for (const value of ['abc', '2junk', '-1', '0', '1e2', '2.5', '', ['2', '3'], '9007199254740992']) {
  assert.equal(pagination.parsePositiveInteger(value), null);
  assert.equal(pagination.readerPage(value, 8), 1);
  assert.equal(pagination.needsPageRedirect(value, 1), true);
}
assert.equal(pagination.readerPage(undefined, 8), 1);
assert.equal(pagination.needsPageRedirect(undefined, 1), false);
assert.equal(pagination.readerPage('999', 8), 8);
assert.equal(pagination.needsPageRedirect('999', 8), true);
assert.equal(pagination.readerPage('02', 8), 2);
assert.equal(pagination.needsPageRedirect('02', 2), true);
assert.equal(pagination.needsPageRedirect('2', 2), false);
assert.equal(pagination.needsPageRedirect('1', 1), true);
const robots = load('app/robots').default();
const blocked = robots.rules[0].disallow;
for (const publicPath of ['/login', '/register', '/forgot-password', '/reset-password', '/profile', '/bookmarks', '/settings', '/my-quran', '/reading-goal', '/hifz', '/feedback', '/search']) {
  assert.ok(!blocked.some((prefix) => publicPath.startsWith(prefix)), `${publicPath}: crawler must see noindex`);
}
assert.ok(blocked.includes('/admin'));
assert.ok(blocked.includes('/api/'));
console.log('Pagination normalization and robots/noindex checks passed.');

const articleMeta = seo.buildPageMetadata({
  title: 'Understanding Surah Al-Fatihah',
  description: 'An introduction to the opening chapter.',
  path: '/articles/understanding-surah-al-fatihah',
  type: 'article',
  image: { path: '/images/article_2.png', alt: 'Understanding Surah Al-Fatihah' },
  publishedTime: '2026-04-09',
});
assert.equal(articleMeta.openGraph.type, 'article');
assert.equal(articleMeta.openGraph.publishedTime, '2026-04-09');
assert.equal(articleMeta.openGraph.images[0].url, `${seo.SITE_URL}/images/article_2.png`);
assert.equal(articleMeta.twitter.images[0], articleMeta.openGraph.images[0].url);
assert.equal(seo.buildPageMetadata({ title: 'Home', description: 'Home' }).openGraph.images[0].url, `${seo.SITE_URL}/opengraph-image`);
assert.equal(seo.ayahSeo(2, 255).heading, 'Ayatul Kursi — Al-Baqarah 2:255');
assert.ok(seo.ayahSeo(2, 255, { locale: 'ur' }).heading.startsWith('آیت الکرسی'));
for (const ayah of [285, 286]) {
  for (const prefix of ['', '/ur', '/ps', '/fa']) {
    assert.ok(entries.some((e) => e.url === `${seo.SITE_URL}${prefix}/al-baqarah/${ayah}`));
  }
}
console.log('Article previews, verse headings and featured verse sitemap checks passed.');
