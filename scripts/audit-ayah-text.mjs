#!/usr/bin/env node
/**
 * Samples 50 ayah URLs from the sitemap and measures meaningful visible
 * server-rendered text length (stripping script, style, nav, header, footer).
 *
 * Usage:
 *   node scripts/audit-ayah-text.mjs [baseUrl] [sampleSize]
 *   node scripts/audit-ayah-text.mjs http://127.0.0.1:3099 50
 */

const baseUrl = (process.argv[2] || 'http://127.0.0.1:3099').replace(/\/$/, '');
const sampleSize = Math.max(1, Number(process.argv[3] || 50));
const EXPECTED_ORIGIN = 'https://quranpilot.com';

function mapUrl(loc) {
  return loc.startsWith(EXPECTED_ORIGIN) ? `${baseUrl}${loc.slice(EXPECTED_ORIGIN.length)}` : loc;
}

function extractMainVisibleText(html) {
  // Isolate <main> if present; otherwise strip header/footer/nav/script/style globally.
  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  let body = mainMatch ? mainMatch[1] : html;
  body = body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return body;
}

async function main() {
  const ayahUrls = [];
  for (const shard of ['ayahs-1', 'ayahs-2', 'ayahs-3']) {
    const res = await fetch(`${baseUrl}/sitemaps/${shard}.xml`);
    if (!res.ok) throw new Error(`Failed to fetch /sitemaps/${shard}.xml: ${res.status}`);
    const xml = await res.text();
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      ayahUrls.push(m[1].trim());
    }
  }

  // Deterministic spread across all 6,236 ayahs (including /al-mulk/1 and /al-baqarah/255)
  const mustInclude = [
    `${EXPECTED_ORIGIN}/al-mulk/1`,
    `${EXPECTED_ORIGIN}/al-baqarah/255`,
    `${EXPECTED_ORIGIN}/al-kahf/1`,
    `${EXPECTED_ORIGIN}/al-fatihah/1`,
  ].filter((u) => ayahUrls.includes(u));

  const pool = ayahUrls.filter((u) => !mustInclude.includes(u));
  const step = Math.max(1, Math.floor(pool.length / Math.max(1, sampleSize - mustInclude.length)));
  const sampled = [...mustInclude];
  for (let i = 0; i < pool.length && sampled.length < sampleSize; i += step) {
    sampled.push(pool[i]);
  }

  const results = [];
  for (const loc of sampled) {
    const res = await fetch(mapUrl(loc));
    const html = await res.text();
    const visible = extractMainVisibleText(html);
    results.push({
      path: loc.replace(EXPECTED_ORIGIN, ''),
      status: res.status,
      chars: visible.length,
    });
  }

  const lengths = results.map((r) => r.chars).sort((a, b) => a - b);
  const sum = lengths.reduce((a, b) => a + b, 0);
  const avg = Math.round(sum / lengths.length);
  const median = lengths[Math.floor(lengths.length / 2)];
  const min = lengths[0];
  const max = lengths[lengths.length - 1];
  const over2000 = lengths.filter((n) => n >= 2000).length;

  console.log(`Ayah visible-text audit (${results.length} samples, excluding script/style/nav/header/footer):`);
  console.log(`  Min: ${min} chars | Median: ${median} chars | Avg: ${avg} chars | Max: ${max} chars`);
  console.log(`  Meeting >= 2,000 chars target: ${over2000}/${results.length}`);
  console.log('\nKey samples:');
  for (const r of results.slice(0, 8)) {
    console.log(`  ${r.path}: HTTP ${r.status}, ${r.chars} chars`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
