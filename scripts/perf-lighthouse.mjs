#!/usr/bin/env node
/**
 * Runs mobile Lighthouse (3 runs per URL, takes median) on the 6 target routes
 * and saves a structured JSON report.
 *
 * Usage:
 *   node scripts/perf-lighthouse.mjs <baseUrl> <outputJsonPath>
 *   node scripts/perf-lighthouse.mjs http://127.0.0.1:3099 perf/baseline.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const baseUrl = (process.argv[2] || 'http://127.0.0.1:3099').replace(/\/$/, '');
const outPath = process.argv[3] || 'perf/baseline.json';
const RUNS = Number(process.env.LH_RUNS || 3);
const CHROME_PATH =
  process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const TARGET_PATHS = [
  '/',
  '/al-mulk',
  '/al-baqarah/255',
  '/al-mulk/1',
  '/ur/al-mulk',
  '/articles/how-many-years-did-it-take-to-build',
];

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function runSingle(url, tmpFile) {
  execFileSync(
    'npx',
    [
      '--yes',
      'lighthouse',
      url,
      '--only-categories=performance,accessibility,best-practices,seo',
      '--emulated-form-factor=mobile',
      '--chrome-flags=--headless=new --no-sandbox',
      '--output=json',
      `--output-path=${tmpFile}`,
      '--quiet',
    ],
    {
      env: { ...process.env, CHROME_PATH },
      stdio: 'pipe',
    },
  );
  const raw = JSON.parse(fs.readFileSync(tmpFile, 'utf8'));
  const audits = raw.audits || {};
  const netItems = audits['network-requests']?.details?.items || [];

  let jsBytes = 0;
  let cssBytes = 0;
  for (const item of netItems) {
    if (item.resourceType === 'Script') jsBytes += item.transferSize || item.resourceSize || 0;
    if (item.resourceType === 'Stylesheet') cssBytes += item.transferSize || item.resourceSize || 0;
  }

  const bpFailures = (raw.categories?.['best-practices']?.auditRefs || [])
    .map((ref) => audits[ref.id])
    .filter((a) => a && a.score !== null && a.score < 1)
    .map((a) => ({ id: a.id, title: a.title, score: a.score, displayValue: a.displayValue }));

  return {
    performance: Math.round((raw.categories?.performance?.score || 0) * 100),
    accessibility: Math.round((raw.categories?.accessibility?.score || 0) * 100),
    bestPractices: Math.round((raw.categories?.['best-practices']?.score || 0) * 100),
    seo: Math.round((raw.categories?.seo?.score || 0) * 100),
    fcpMs: Math.round(audits['first-contentful-paint']?.numericValue || 0),
    lcpMs: Math.round(audits['largest-contentful-paint']?.numericValue || 0),
    tbtMs: Math.round(audits['total-blocking-time']?.numericValue || 0),
    cls: Number((audits['cumulative-layout-shift']?.numericValue || 0).toFixed(4)),
    siMs: Math.round(audits['speed-index']?.numericValue || 0),
    jsKb: Number((jsBytes / 1024).toFixed(1)),
    cssKb: Number((cssBytes / 1024).toFixed(1)),
    renderBlockingMs: Math.round(
      audits['render-blocking-insight']?.metricSavings?.FCP ||
        audits['render-blocking-resources']?.numericValue ||
        0,
    ),
    unusedJsKb: Number(
      ((audits['unused-javascript']?.details?.overallSavingsBytes || 0) / 1024).toFixed(1),
    ),
    unusedCssKb: Number(
      ((audits['unused-css-rules']?.details?.overallSavingsBytes || 0) / 1024).toFixed(1),
    ),
    legacyJsKb: Number(
      (
        (audits['legacy-javascript-insight']?.details?.overallSavingsBytes ||
          audits['legacy-javascript']?.details?.overallSavingsBytes ||
          0) / 1024
      ).toFixed(1),
    ),
    bpFailures,
  };
}

async function main() {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const results = {};

  for (const p of TARGET_PATHS) {
    const url = `${baseUrl}${p}`;
    const runs = [];
    for (let i = 0; i < RUNS; i += 1) {
      const tmp = `/tmp/lh-run-${Date.now()}-${i}.json`;
      runs.push(runSingle(url, tmp));
      fs.rmSync(tmp, { force: true });
    }
    const med = {
      url: p,
      performance: median(runs.map((r) => r.performance)),
      accessibility: median(runs.map((r) => r.accessibility)),
      bestPractices: median(runs.map((r) => r.bestPractices)),
      seo: median(runs.map((r) => r.seo)),
      fcpMs: median(runs.map((r) => r.fcpMs)),
      lcpMs: median(runs.map((r) => r.lcpMs)),
      tbtMs: median(runs.map((r) => r.tbtMs)),
      cls: median(runs.map((r) => r.cls)),
      siMs: median(runs.map((r) => r.siMs)),
      jsKb: median(runs.map((r) => r.jsKb)),
      cssKb: median(runs.map((r) => r.cssKb)),
      renderBlockingMs: median(runs.map((r) => r.renderBlockingMs)),
      unusedJsKb: median(runs.map((r) => r.unusedJsKb)),
      unusedCssKb: median(runs.map((r) => r.unusedCssKb)),
      legacyJsKb: median(runs.map((r) => r.legacyJsKb)),
      bpFailures: runs[Math.floor(runs.length / 2)].bpFailures,
    };
    results[p] = med;
    console.log(
      `${p}: Perf=${med.performance} A11y=${med.accessibility} BP=${med.bestPractices} SEO=${med.seo} | FCP=${(med.fcpMs / 1000).toFixed(2)}s LCP=${(med.lcpMs / 1000).toFixed(2)}s TBT=${med.tbtMs}ms CLS=${med.cls} SI=${(med.siMs / 1000).toFixed(2)}s | JS=${med.jsKb}KB CSS=${med.cssKb}KB`,
    );
  }

  fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl, runs: RUNS, results }, null, 2));
  console.log(`\nSaved to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
