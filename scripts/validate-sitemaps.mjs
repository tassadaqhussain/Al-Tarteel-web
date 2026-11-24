#!/usr/bin/env node
/**
 * Sitemap validator for QuranPilot.
 *
 * Fetches /sitemap.xml and every child sitemap, verifies:
 *  - HTTP 200 (no redirects)
 *  - Content-Type includes application/xml
 *  - Valid XML structure with expected <sitemapindex> / <urlset> namespace
 *  - Consistent ISO 8601 UTC <lastmod> format across index and children
 *  - Canonical https://quranpilot.com host (no www, no http, no trailing-slash mismatch)
 *  - No duplicate URLs across all sitemaps
 *  - Samples ~50 URLs across sitemaps and checks each returns HTTP 200,
 *    is indexable (no noindex meta or X-Robots-Tag), and has a self-referencing canonical.
 *
 * Usage:
 *   node scripts/validate-sitemaps.mjs [baseUrl] [sampleSize]
 *   node scripts/validate-sitemaps.mjs http://127.0.0.1:3000 50
 *   node scripts/validate-sitemaps.mjs https://quranpilot.com 50
 */

const baseUrl = (process.argv[2] || 'http://127.0.0.1:3000').replace(/\/$/, '');
const sampleSize = Math.max(1, Number(process.argv[3] || 50));
const EXPECTED_ORIGIN = 'https://quranpilot.com';
const ISO_UTC_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

function mapToLocal(url) {
  if (url.startsWith(EXPECTED_ORIGIN)) {
    return `${baseUrl}${url.slice(EXPECTED_ORIGIN.length)}`;
  }
  return url;
}

function unescapeXml(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function extractTagValues(xml, tag) {
  const re = new RegExp(`<${tag}>([^<]+)</${tag}>`, 'g');
  const values = [];
  for (const m of xml.matchAll(re)) {
    values.push(unescapeXml(m[1].trim()));
  }
  return values;
}

function extractCanonical(html) {
  const m1 = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  if (m1) return m1[1];
  const m2 = html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  return m2 ? m2[1] : null;
}

function hasMetaNoindex(html) {
  const metas = html.matchAll(/<meta[^>]+name=["'](?:robots|googlebot)["'][^>]*>/gi);
  for (const m of metas) {
    const contentMatch = m[0].match(/content=["']([^"']+)["']/i);
    if (contentMatch && /\bnoindex\b/i.test(contentMatch[1])) {
      return true;
    }
  }
  return false;
}

function pickEvenSample(urls, count) {
  if (urls.length <= count) return [...urls];
  const out = [];
  const step = urls.length / count;
  for (let i = 0; i < count; i += 1) {
    out.push(urls[Math.floor(i * step)]);
  }
  return out;
}

async function main() {
  const errors = [];
  const warnings = [];

  console.log(`Validating sitemaps against: ${baseUrl}`);
  const indexUrl = `${baseUrl}/sitemap.xml`;
  const indexRes = await fetch(indexUrl, { redirect: 'manual' });
  const indexCt = indexRes.headers.get('content-type') || '';

  if (indexRes.status !== 200) {
    errors.push(`Index ${indexUrl} returned status ${indexRes.status}`);
  }
  if (!indexCt.includes('application/xml') && !indexCt.includes('text/xml')) {
    errors.push(`Index ${indexUrl} unexpected Content-Type: ${indexCt}`);
  }

  const indexXml = await indexRes.text();
  if (!indexXml.includes('<sitemapindex') || !indexXml.includes('http://www.sitemaps.org/schemas/sitemap/0.9')) {
    errors.push('Index XML missing <sitemapindex> or sitemap 0.9 namespace');
  }

  const childLocs = extractTagValues(indexXml, 'loc');
  const indexLastmods = extractTagValues(indexXml, 'lastmod');

  for (const lm of indexLastmods) {
    if (!ISO_UTC_RE.test(lm)) {
      errors.push(`Index has non-ISO-UTC lastmod: ${lm}`);
    }
  }

  console.log(`Index status: ${indexRes.status}, Content-Type: ${indexCt}`);
  console.log(`Child sitemaps listed: ${childLocs.length}`);

  const allUrls = [];
  const seenUrls = new Set();
  const childSummaries = [];

  for (const childLoc of childLocs) {
    if (!childLoc.startsWith(`${EXPECTED_ORIGIN}/`)) {
      errors.push(`Child sitemap URL does not use ${EXPECTED_ORIGIN}: ${childLoc}`);
    }
    const fetchUrl = mapToLocal(childLoc);
    const res = await fetch(fetchUrl, { redirect: 'manual' });
    const ct = res.headers.get('content-type') || '';
    const body = await res.text();

    if (res.status !== 200) {
      errors.push(`Child ${childLoc} returned status ${res.status}`);
      continue;
    }
    if (!ct.includes('application/xml')) {
      errors.push(`Child ${childLoc} Content-Type is "${ct}" (expected application/xml)`);
    }
    if (!body.includes('<urlset') || !body.includes('http://www.sitemaps.org/schemas/sitemap/0.9')) {
      errors.push(`Child ${childLoc} missing <urlset> or 0.9 namespace`);
    }
    if (body.includes('<xhtml:link') && !body.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"')) {
      errors.push(`Child ${childLoc} uses xhtml:link without xmlns:xhtml declaration`);
    }

    const urls = extractTagValues(body, 'loc');
    const lastmods = extractTagValues(body, 'lastmod');
    const altCount = (body.match(/<xhtml:link /g) || []).length;

    if (urls.length > 5000) {
      warnings.push(`Child ${childLoc} has ${urls.length} URLs (> 5,000 target)`);
    }

    for (const lm of lastmods) {
      if (!ISO_UTC_RE.test(lm)) {
        errors.push(`Child ${childLoc} has non-ISO-UTC lastmod: ${lm}`);
        break;
      }
    }

    for (const u of urls) {
      if (!u.startsWith(EXPECTED_ORIGIN)) {
        errors.push(`Non-canonical host in ${childLoc}: ${u}`);
      }
      if (u.startsWith('https://www.')) {
        errors.push(`www host in ${childLoc}: ${u}`);
      }
      if (u !== EXPECTED_ORIGIN && u.endsWith('/')) {
        errors.push(`Trailing slash in ${childLoc}: ${u}`);
      }
      if (seenUrls.has(u)) {
        errors.push(`Duplicate URL across sitemaps: ${u}`);
      }
      seenUrls.add(u);
      allUrls.push(u);
    }

    childSummaries.push({
      loc: childLoc,
      status: res.status,
      urls: urls.length,
      alternates: altCount,
      bytes: Buffer.byteLength(body, 'utf8'),
    });
  }

  console.log('\nChild sitemap summary:');
  for (const s of childSummaries) {
    console.log(`  - ${s.loc.replace(EXPECTED_ORIGIN, '')}: HTTP ${s.status}, ${s.urls} URLs, ${s.alternates} xhtml:link, ${(s.bytes / 1024).toFixed(1)} KB`);
  }
  console.log(`Total unique URLs: ${allUrls.length}`);

  // Sample URLs evenly across the full list (always including homepage & key pages if present)
  const priorityUrls = [
    EXPECTED_ORIGIN,
    `${EXPECTED_ORIGIN}/surahs`,
    `${EXPECTED_ORIGIN}/al-mulk`,
    `${EXPECTED_ORIGIN}/al-kahf`,
    `${EXPECTED_ORIGIN}/al-baqarah/255`,
    `${EXPECTED_ORIGIN}/ur`,
    `${EXPECTED_ORIGIN}/ur/al-mulk`,
  ].filter((u) => seenUrls.has(u));

  const remainingSample = pickEvenSample(
    allUrls.filter((u) => !priorityUrls.includes(u)),
    Math.max(0, sampleSize - priorityUrls.length),
  );
  const sample = [...priorityUrls, ...remainingSample];

  console.log(`\nChecking ${sample.length} sampled URLs for 200, indexability, and self-referencing canonical...`);
  let passedSample = 0;
  for (const url of sample) {
    const fetchUrl = mapToLocal(url);
    try {
      const res = await fetch(fetchUrl, { redirect: 'manual' });
      const xRobots = res.headers.get('x-robots-tag') || '';
      if (res.status !== 200) {
        errors.push(`Sample URL ${url} returned HTTP ${res.status}`);
        continue;
      }
      if (/\bnoindex\b/i.test(xRobots)) {
        errors.push(`Sample URL ${url} has X-Robots-Tag: ${xRobots}`);
        continue;
      }
      const html = await res.text();
      if (hasMetaNoindex(html)) {
        errors.push(`Sample URL ${url} has <meta name="robots" content="...noindex...">`);
        continue;
      }
      const canonical = extractCanonical(html);
      if (canonical !== url) {
        errors.push(`Sample URL ${url} canonical mismatch: got "${canonical}"`);
        continue;
      }
      passedSample += 1;
    } catch (err) {
      errors.push(`Sample URL ${url} fetch failed: ${err.message}`);
    }
  }

  console.log(`Sample check: ${passedSample}/${sample.length} passed.`);

  if (warnings.length > 0) {
    console.log('\nWarnings:');
    for (const w of warnings) console.log(`  WARN: ${w}`);
  }

  if (errors.length > 0) {
    console.error(`\nFAILED with ${errors.length} error(s):`);
    for (const e of errors.slice(0, 30)) console.error(`  ERROR: ${e}`);
    if (errors.length > 30) console.error(`  ... and ${errors.length - 30} more`);
    process.exit(1);
  }

  console.log('\nALL SITEMAP CHECKS PASSED.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
