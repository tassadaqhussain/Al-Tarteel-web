/** Verify a running production build. SEO_BASE_URL defaults to local port 3107. */
import assert from 'node:assert/strict';
const base = process.env.SEO_BASE_URL || 'http://localhost:3107';
async function request(path) {
  const response = await fetch(`${base}${path}`, {
    redirect: 'manual',
    headers: { 'User-Agent': 'Googlebot' },
    signal: AbortSignal.timeout(30000),
  });
  return { response, html: await response.text() };
}
const redirects = [
  ['/al-baqarah?page=999', '/al-baqarah?page=8'],
  ['/al-baqarah?page=2junk', '/al-baqarah'],
  ['/al-baqarah?page=02', '/al-baqarah?page=2'],
  ['/al-baqarah?page=1', '/al-baqarah'],
  ['/al-baqarah?page=2&page=3', '/al-baqarah'],
  ['/ur/al-baqarah?page=999', '/ur/al-baqarah?page=8'],
  ['/ps/al-baqarah?page=0', '/ps/al-baqarah'],
  ['/fa/al-baqarah?page=02', '/fa/al-baqarah?page=2'],
  ['/juz/01', '/juz/1'],
  ['/juz/1?page=abc', '/juz/1'],
  ['/juz/1?page=02', '/juz/1?page=2'],
  ['/juz/1?page=1', '/juz/1'],
  ['/juz/01?page=02&trans=en-sahih-international', '/juz/1?page=2&trans=en-sahih-international'],
];
for (const [path, target] of redirects) {
  const { response } = await request(path);
  assert.equal(response.status, 308, path);
  assert.equal(new URL(response.headers.get('location'), base).href, new URL(target, base).href, path);
}
for (const path of ['/juz/1junk', '/juz/0', '/juz/31', '/surah/2junk', '/al-baqarah/255junk']) {
  const { response } = await request(path);
  assert.equal(response.status, 404, path);
}
for (const path of ['/al-baqarah?page=8', '/ur/al-baqarah?page=8']) {
  const { response, html } = await request(path);
  assert.equal(response.status, 200);
  assert.deepEqual([...html.matchAll(/id="ayah-number-(\d+)"/g)].map((m) => Number(m[1])), [281, 282, 283, 284, 285, 286]);
  assert.match(html, /name="robots" content="index, follow"/);
}
const { response: robotsResponse, html: robots } = await request('/robots.txt');
assert.equal(robotsResponse.status, 200);
for (const path of ['/login', '/register', '/forgot-password', '/reset-password', '/profile', '/bookmarks', '/settings', '/my-quran', '/reading-goal', '/hifz', '/feedback', '/search']) {
  assert.ok(!robots.includes(`Disallow: ${path}`), path);
  const { response, html } = await request(path);
  assert.equal(response.status, 200, path);
  assert.match(html, /name="robots" content="noindex/, path);
}
assert.ok(robots.includes('Disallow: /admin'));
assert.ok(robots.includes('Disallow: /api/'));
const { html: juzPageTwo } = await request('/juz/1?page=2');
assert.match(juzPageTwo, /href="\/juz\/1"[^>]*>\s*← Previous/);
console.log('Production SEO HTTP checks passed: canonical redirects, invalid route 404s, verse content and crawlable noindex pages.');

for (const path of ['/articles/understanding-surah-al-fatihah', '/articles/when-was-islam-created-at-first']) {
  const { response, html } = await request(path);
  assert.equal(response.status, 200, path);
  assert.match(html, /property="og:type" content="article"/);
  assert.match(html, /property="article:published_time" content="2026-/);
  const image = html.match(/property="og:image" content="([^"]+)"/)[1];
  assert.match(image, /\/images\/article_\d\.png$/);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].flatMap((m) => JSON.parse(m[1]));
  const article = schemas.find((s) => s['@type'] === 'Article');
  assert.equal(article.image, image);
  assert.equal(article.author.url, 'https://quranpilot.com');
  assert.match(html, /rel="author"/);
}
const { html: directory } = await request('/surahs');
for (const path of ['/al-baqarah/255', '/an-nur/35', '/al-baqarah/285', '/al-baqarah/286']) {
  assert.ok(directory.includes(`href="${path}"`), `Featured link: ${path}`);
}
const { html: kursi } = await request('/al-baqarah/255');
assert.match(kursi, /<h1[^>]*>Ayatul Kursi/);
console.log('Article social metadata, author markup and featured verse navigation checks passed.');


for (const [path, target] of [
  ['/surah/02', '/al-baqarah'],
  ['/surah/000114', '/an-nas'],
  ['/surah/002?page=8&trans=en-sahih-international', '/al-baqarah?page=8&trans=en-sahih-international'],
]) {
  const { response } = await request(path);
  assert.equal(response.status, 308, path);
  assert.equal(new URL(response.headers.get('location'), base).href, new URL(target, base).href);
}
console.log('Zero-padded legacy surah HTTP redirects passed.');
