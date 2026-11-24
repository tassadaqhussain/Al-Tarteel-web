#!/usr/bin/env node
/**
 * Build-time and post-build guard against visible TODO / placeholder markers.
 *
 * Prebuild mode (default):
 *   Scans content/data/UI files in frontend/src/ after stripping comments and
 *   non-rendered editorial metadata keys (`virtuesTodo`, `todo`, `todos`).
 *
 * Postbuild mode (--postbuild):
 *   Scans generated HTML files in frontend/.next/server/app/ for any visible
 *   TODO/FIXME/TBD/XXX/lorem/placeholder text/[verify markers.
 *
 * Usage:
 *   node scripts/check-no-visible-todos.mjs
 *   node scripts/check-no-visible-todos.mjs --postbuild
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const FRONTEND_SRC = path.join(REPO_ROOT, 'frontend', 'src');
const NEXT_SERVER_APP = path.join(REPO_ROOT, 'frontend', '.next', 'server', 'app');

const CASE_SENSITIVE_MARKER_RE = /\b(?:TODO|FIXME|TBD|XXX)\b/;
const CASE_INSENSITIVE_MARKER_RE = /\b(?:lorem|placeholder text)\b|\[verify\b/i;

function findMarker(text) {
  return text.match(CASE_SENSITIVE_MARKER_RE) || text.match(CASE_INSENSITIVE_MARKER_RE);
}

function walk(dir, exts, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, exts, out);
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

function stripCommentsAndEditorialKeys(content, filePath) {
  if (filePath.endsWith('.json')) {
    try {
      const parsed = JSON.parse(content);
      const clean = (val) => {
        if (Array.isArray(val)) return val.map(clean);
        if (val && typeof val === 'object') {
          const obj = {};
          for (const [k, v] of Object.entries(val)) {
            if (k === 'todo' || k === 'todos' || k === 'virtuesTodo') continue;
            obj[k] = clean(v);
          }
          return obj;
        }
        return val;
      };
      return JSON.stringify(clean(parsed), null, 2);
    } catch {
      return content;
    }
  }

  // Strip JSX comments {/* ... */}, block comments /* ... */, and line comments // ...
  return content
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/(\s)\/\/.*$/gm, '$1');
}

function checkSources() {
  const targetDirs = [
    path.join(FRONTEND_SRC, 'content'),
    path.join(FRONTEND_SRC, 'lib', 'articles.ts'),
    path.join(FRONTEND_SRC, 'lib', 'i18n'),
    path.join(FRONTEND_SRC, 'lib', 'site-contact.ts'),
    path.join(FRONTEND_SRC, 'app', 'about'),
    path.join(FRONTEND_SRC, 'app', 'contact'),
    path.join(FRONTEND_SRC, 'app', 'juz'),
    path.join(FRONTEND_SRC, 'components', 'surah'),
    path.join(FRONTEND_SRC, 'components', 'ayah'),
    path.join(FRONTEND_SRC, 'components', 'contact'),
  ];

  const files = [];
  for (const target of targetDirs) {
    if (!fs.existsSync(target)) continue;
    const stat = fs.statSync(target);
    if (stat.isFile()) files.push(target);
    else walk(target, ['.ts', '.tsx', '.json', '.mdx', '.md'], files);
  }

  const hits = [];
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const stripped = stripCommentsAndEditorialKeys(raw, file);
    const lines = stripped.split('\n');
    for (let i = 0; i < lines.length; i += 1) {
      const m = findMarker(lines[i]);
      if (m) {
        hits.push({
          file: path.relative(REPO_ROOT, file),
          line: i + 1,
          marker: m[0],
          snippet: lines[i].trim().slice(0, 120),
        });
      }
    }
  }

  if (hits.length > 0) {
    console.error(`FAILED: Found ${hits.length} potential visible TODO/placeholder marker(s):`);
    for (const h of hits) {
      console.error(`  ${h.file}:${h.line} [${h.marker}] -> ${h.snippet}`);
    }
    process.exit(1);
  }

  console.log(`Source check passed: 0 visible TODO/placeholder markers across ${files.length} content/UI files.`);
}

function checkPostbuild() {
  if (!fs.existsSync(NEXT_SERVER_APP)) {
    console.error(`Postbuild directory not found: ${NEXT_SERVER_APP}`);
    process.exit(1);
  }
  const htmlFiles = walk(NEXT_SERVER_APP, ['.html']);
  const hits = [];
  for (const file of htmlFiles) {
    const raw = fs.readFileSync(file, 'utf8');
    const visible = raw
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ');
    const m = findMarker(visible);
    if (m) {
      const idx = Math.max(0, (m.index ?? 0) - 40);
      hits.push({
        file: path.relative(REPO_ROOT, file),
        marker: m[0],
        snippet: visible.slice(idx, idx + 120).trim(),
      });
    }
  }

  if (hits.length > 0) {
    console.error(`FAILED (postbuild): Found ${hits.length} visible TODO/placeholder marker(s) in built HTML:`);
    for (const h of hits) {
      console.error(`  ${h.file} [${h.marker}] -> ${h.snippet}`);
    }
    process.exit(1);
  }

  console.log(`Postbuild HTML check passed: 0 visible TODO/placeholder markers across ${htmlFiles.length} built HTML files.`);
}

const isPostbuild = process.argv.includes('--postbuild');
if (isPostbuild) {
  checkPostbuild();
} else {
  checkSources();
}
