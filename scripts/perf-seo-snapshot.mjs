#!/usr/bin/env node
/**
 * Snapshots canonical, hreflang, JSON-LD, and visible text length on the 6
 * target URLs so we can prove SEO is 100% identical before vs after perf changes.
 *
 * Usage:
 *   node scripts/perf-seo-snapshot.mjs <baseUrl> <outputJsonPath>
 *   node scripts/perf-seo-snapshot.mjs <baseUrl> --diff <baselineJsonPath>
 */

import fs from 'node:fs';
import path from 'node:path';

const baseUrl = (process.argv[2] || 'http://127.0.0.1:3099').replace(/\/$/, '');
const arg3 = process.argv[3] || 'perf/seo-baseline.json';
const isDiff = arg3 === '--diff';
const filePath = isDiff ? (process.argv[4] || 'perf/seo-baseline.json') : arg3;

const TARGET_PATHS = [
  '/',
  '/al-mulk',
  '/al-baqarah/255',
  '/al-mulk/1',
  '/ur/al-mulk',
  '/articles/how-many-years-did-it-take-to-build',
];

function extractSnapshot(html) {
  const canonical =
    (html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
      html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i) ||
      [])[1] || null;
  const hreflangs = [];
  for (const m of html.matchAll(/<link[^>]+rel=["']alternate["'][^>]+>/gi)) {
    const hl = (m[0].match(/hreflang=["']([^"']+)["']/i) || [])[1];
    const href = (m[0].match(/href=["']([^"']+)["']/i) || [])[1];
    if (hl && href) hreflangs.push(`${hl}:${href}`);
  }
  hreflangs.sort();

  const jsonLds = [];
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    jsonLds.push(m[1].trim());
  }

  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const visible = (mainMatch ? mainMatch[1] : html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return { canonical, hreflangs, jsonLds, visibleText: visible };
}

async function main() {
  const current = {};
  for (const p of TARGET_PATHS) {
    const res = await fetch(`${baseUrl}${p}`);
    const html = await res.text();
    current[p] = extractSnapshot(html);
  }

  if (!isDiff) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(current, null, 2));
    console.log(`Saved SEO baseline for ${TARGET_PATHS.length} URLs to ${filePath}`);
    return;
  }

  const baseline = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const diffs = [];
  for (const p of TARGET_PATHS) {
    const a = baseline[p];
    const b = current[p];
    if (a.canonical !== b.canonical) diffs.push(`${p}: canonical ${a.canonical} != ${b.canonical}`);
    if (JSON.stringify(a.hreflangs) !== JSON.stringify(b.hreflangs)) diffs.push(`${p}: hreflang mismatch`);
    if (JSON.stringify(a.jsonLds) !== JSON.stringify(b.jsonLds)) diffs.push(`${p}: JSON-LD mismatch`);
    if (a.visibleText !== b.visibleText) {
      diffs.push(`${p}: visible text changed (${a.visibleText.length} -> ${b.visibleText.length} chars)`);
    }
  }

  if (diffs.length > 0) {
    console.error('SEO DIFFS DETECTED:');
    for (const d of diffs) console.error('  ' + d);
    process.exit(1);
  }
  console.log('SEO DIFF CHECK PASSED: canonicals, hreflang, JSON-LD, and server-rendered visible text are 100% identical across all 6 URLs.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
