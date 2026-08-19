#!/usr/bin/env node
/**
 * Mirrors the Pashto translation recitation into our own audio storage.
 *
 * Source files are ruku-granular and HTTP-only with no CORS, so they cannot be
 * played directly from an HTTPS page. We copy them under the app's existing
 * storage convention and serve them from /api/v1/audio/files instead:
 *
 *   backend/storage/audio/<RECITER_SLUG>/ruku-<001..558>.mp3
 *
 * File names use the GLOBAL ruku index (1-558), which matches ayahs.ruku in the
 * database 1:1 — verified against the DB before this script was written.
 *
 * Usage: node scripts/fetch-pashto-audio.mjs [--concurrency=6] [--force]
 */
import { createWriteStream } from 'node:fs';
import { mkdir, stat, rename, readFile } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RECITER_SLUG = 'ps-shafeeq-ur-rahman';
const OUT_DIR = join(ROOT, 'backend', 'storage', 'audio', RECITER_SLUG);

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const CONCURRENCY = Number(arg('concurrency', '6'));
const FORCE = process.argv.includes('--force');

// The URL constructor already percent-encodes the spaces in these paths.
// Re-encoding each segment would turn %20 into %2520 and 404 every file.
const encodeUrl = (raw) => new URL(raw).toString();

async function download(entry) {
  const name = `ruku-${String(entry.globalRuku).padStart(3, '0')}.mp3`;
  const dest = join(OUT_DIR, name);
  if (!FORCE) {
    try {
      const s = await stat(dest);
      if (s.size === entry.bytes) return { name, skipped: true };
    } catch {}
  }
  const res = await fetch(encodeUrl(entry.url), { redirect: 'follow' });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const tmp = `${dest}.part`;
  await pipeline(res.body, createWriteStream(tmp));
  const got = (await stat(tmp)).size;
  if (entry.bytes && got !== entry.bytes) {
    throw new Error(`${name}: size ${got} != expected ${entry.bytes}`);
  }
  await rename(tmp, dest);
  return { name, bytes: got };
}

const manifest = JSON.parse(
  await readFile(join(ROOT, 'scripts', 'pashto-audio-manifest.json'), 'utf8'),
);
await mkdir(OUT_DIR, { recursive: true });

let done = 0, skipped = 0, bytes = 0;
const failures = [];
const queue = [...manifest];

async function worker() {
  while (queue.length) {
    const entry = queue.shift();
    try {
      const r = await download(entry);
      if (r.skipped) skipped += 1; else bytes += r.bytes;
      done += 1;
      if (done % 25 === 0) {
        console.log(`${done}/${manifest.length} (${(bytes / 1048576).toFixed(0)} MB new, ${skipped} skipped)`);
      }
    } catch (err) {
      failures.push(`${entry.globalRuku}: ${err.message}`);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`\nDone. ${done}/${manifest.length} files, ${(bytes / 1048576).toFixed(1)} MB downloaded, ${skipped} already present.`);
if (failures.length) {
  console.error(`FAILURES (${failures.length}):`);
  for (const f of failures.slice(0, 20)) console.error('  ' + f);
  process.exitCode = 1;
}
