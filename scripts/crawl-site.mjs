#!/usr/bin/env node
/**
 * Internal link crawler for QuranPilot.
 *
 * Starts at the homepage, follows same-origin <a href> links up to maxPages,
 * and reports any 3xx, 4xx, 5xx, redirect chains, or crawlable login/register
 * returnUrl links.
 *
 * Usage:
 *   node scripts/crawl-site.mjs [baseUrl] [maxPages] [concurrency]
 *   node scripts/crawl-site.mjs http://127.0.0.1:3000 500 8
 */

const baseUrl = (process.argv[2] || 'http://127.0.0.1:3000').replace(/\/$/, '');
const maxPages = Math.max(1, Number(process.argv[3] || 2000));
const concurrency = Math.max(1, Number(process.argv[4] || 8));
const baseOrigin = new URL(baseUrl).origin;

const SKIP_EXT_RE = /\.(?:png|jpe?g|webp|avif|svg|ico|gif|mp3|ogg|wav|pdf|xml|json|txt|webmanifest|css|js|woff2?)$/i;

function normalizeLink(rawHref, fromUrl) {
  if (!rawHref) return null;
  const trimmed = rawHref.trim();
  if (
    !trimmed ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('javascript:')
  ) {
    return null;
  }
  try {
    const resolved = new URL(trimmed, fromUrl);
    if (resolved.origin !== baseOrigin) return null;
    if (SKIP_EXT_RE.test(resolved.pathname)) return null;
    resolved.hash = '';
    return resolved.pathname + resolved.search;
  } catch {
    return null;
  }
}

function extractLinks(html, pageUrl) {
  const links = new Set();
  const re = /<a\b[^>]*\bhref=["']([^"']+)["']/gi;
  for (const m of html.matchAll(re)) {
    const norm = normalizeLink(m[1], pageUrl);
    if (norm) links.add(norm);
  }
  return [...links];
}

async function main() {
  const queue = ['/'];
  const visited = new Set(['/']);
  const referrers = new Map();

  const statusBuckets = { '2xx': 0, '3xx': [], '4xx': [], '5xx': [], errors: [] };
  const redirectChains = [];
  const authReturnUrlLinks = [];

  let crawled = 0;

  async function worker() {
    while (queue.length > 0 && crawled < maxPages) {
      const path = queue.shift();
      if (!path) break;
      crawled += 1;
      const fullUrl = `${baseUrl}${path}`;

      try {
        const res = await fetch(fullUrl, { redirect: 'manual' });
        const status = res.status;

        if (status >= 200 && status < 300) {
          statusBuckets['2xx'] += 1;
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('text/html')) {
            const html = await res.text();
            const links = extractLinks(html, fullUrl);
            for (const link of links) {
              if (/\/(?:login|register)\?/.test(link)) {
                authReturnUrlLinks.push({ from: path, to: link });
              }
              if (!visited.has(link) && visited.size < maxPages) {
                visited.add(link);
                referrers.set(link, path);
                queue.push(link);
              }
            }
          }
        } else if (status >= 300 && status < 400) {
          const loc = res.headers.get('location') || '';
          statusBuckets['3xx'].push({ path, status, location: loc, from: referrers.get(path) || '(start)' });
          // Check if the redirect target redirects again (redirect chain)
          if (loc) {
            const nextUrl = new URL(loc, fullUrl).toString();
            if (nextUrl.startsWith(baseOrigin)) {
              const hop2 = await fetch(nextUrl, { redirect: 'manual' });
              if (hop2.status >= 300 && hop2.status < 400) {
                redirectChains.push({
                  path,
                  hop1: `${status} -> ${loc}`,
                  hop2: `${hop2.status} -> ${hop2.headers.get('location') || ''}`,
                });
              }
            }
          }
        } else if (status >= 400 && status < 500) {
          statusBuckets['4xx'].push({ path, status, from: referrers.get(path) || '(start)' });
        } else if (status >= 500) {
          statusBuckets['5xx'].push({ path, status, from: referrers.get(path) || '(start)' });
        }
      } catch (err) {
        statusBuckets.errors.push({ path, error: err.message });
      }
    }
  }

  console.log(`Crawling ${baseUrl} (max ${maxPages} pages, concurrency ${concurrency})...`);
  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  console.log(`\nCrawl complete: ${crawled} URLs fetched.`);
  console.log(`  2xx: ${statusBuckets['2xx']}`);
  console.log(`  3xx: ${statusBuckets['3xx'].length}`);
  console.log(`  4xx: ${statusBuckets['4xx'].length}`);
  console.log(`  5xx: ${statusBuckets['5xx'].length}`);
  console.log(`  Redirect chains: ${redirectChains.length}`);
  console.log(`  Auth query links (/login? or /register?): ${authReturnUrlLinks.length}`);

  if (statusBuckets['3xx'].length > 0) {
    console.log('\n3xx redirects found:');
    for (const item of statusBuckets['3xx'].slice(0, 30)) {
      console.log(`  [${item.status}] ${item.path} -> ${item.location} (linked from ${item.from})`);
    }
  }
  if (redirectChains.length > 0) {
    console.log('\nRedirect chains:');
    for (const c of redirectChains) {
      console.log(`  ${c.path}: ${c.hop1} -> ${c.hop2}`);
    }
  }
  if (statusBuckets['4xx'].length > 0) {
    console.log('\n4xx errors:');
    for (const item of statusBuckets['4xx'].slice(0, 30)) {
      console.log(`  [${item.status}] ${item.path} (linked from ${item.from})`);
    }
  }
  if (statusBuckets['5xx'].length > 0) {
    console.log('\n5xx errors:');
    for (const item of statusBuckets['5xx'].slice(0, 30)) {
      console.log(`  [${item.status}] ${item.path} (linked from ${item.from})`);
    }
  }
  if (authReturnUrlLinks.length > 0) {
    console.log('\nCrawlable auth query links:');
    for (const item of authReturnUrlLinks.slice(0, 20)) {
      console.log(`  ${item.from} -> ${item.to}`);
    }
  }

  if (
    statusBuckets['4xx'].length > 0 ||
    statusBuckets['5xx'].length > 0 ||
    redirectChains.length > 0 ||
    authReturnUrlLinks.length > 0
  ) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
