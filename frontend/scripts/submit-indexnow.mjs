#!/usr/bin/env node
/**
 * Manual IndexNow submission script for Bing/Yandex.
 * Usage:
 *   INDEXNOW_KEY=your-key SITE_URL=https://quranpilot.com node scripts/submit-indexnow.mjs
 *   INDEXNOW_KEY=your-key node scripts/submit-indexnow.mjs https://quranpilot.com/al-baqarah
 */

const key = process.env.INDEXNOW_KEY?.trim();
if (!key) {
  console.error('Error: INDEXNOW_KEY environment variable is required.');
  process.exit(1);
}

const siteUrl = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://quranpilot.com').replace(/\/$/, '');
const host = new URL(siteUrl).host;
const cliUrls = process.argv.slice(2).filter((u) => u.startsWith('http'));

async function collectSitemapUrls() {
  if (cliUrls.length > 0) return cliUrls;
  const indexRes = await fetch(`${siteUrl}/sitemap.xml`);
  if (!indexRes.ok) throw new Error(`Failed to fetch ${siteUrl}/sitemap.xml: ${indexRes.status}`);
  const indexXml = await indexRes.text();
  const shards = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const urls = [];
  for (const shard of shards) {
    const res = await fetch(shard);
    if (!res.ok) continue;
    const xml = await res.text();
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      urls.push(m[1]);
    }
  }
  return urls;
}

const urlList = await collectSitemapUrls();
if (!urlList.length) {
  console.error('No URLs found to submit.');
  process.exit(1);
}

const BATCH = 10000;
for (let i = 0; i < urlList.length; i += BATCH) {
  const chunk = urlList.slice(i, i + BATCH);
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key,
      keyLocation: `${siteUrl}/${key}.txt`,
      urlList: chunk,
    }),
  });
  console.log(`Batch ${Math.floor(i / BATCH) + 1}: submitted ${chunk.length} URLs -> HTTP ${res.status}`);
  if (!res.ok) {
    console.error(await res.text());
    process.exit(1);
  }
}

