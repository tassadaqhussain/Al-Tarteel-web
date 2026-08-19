#!/usr/bin/env node
/**
 * Mirrors a spoken-translation reciter into our own audio storage so playback
 * never depends on a third-party host being up, HTTPS, or CORS-friendly.
 *
 *   backend/storage/audio/<reciter-slug>/<file>.mp3
 *
 * Granularity follows the source:
 *   'ayah' -> SSSAAA.mp3   (6,236 files; surah+ayah, zero-padded)
 *   'ruku' -> ruku-NNN.mp3 (558 files; global ruku index, matches ayahs.ruku)
 *
 * Ayah counts come from the running API so the file list matches our own data
 * rather than a hardcoded table.
 *
 * Usage:
 *   node scripts/fetch-translation-audio.mjs --reciter=ur-shamshad-ali-khan
 *   node scripts/fetch-translation-audio.mjs --reciter=all [--concurrency=5] [--force]
 */
import { createWriteStream } from 'node:fs';
import { mkdir, stat, rename } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n, d) => {
  const hit = process.argv.find((a) => a.startsWith(`--${n}=`));
  return hit ? hit.slice(n.length + 3) : d;
};
const CONCURRENCY = Math.max(1, Number(arg('concurrency', '5')));
const FORCE = process.argv.includes('--force');
const API = arg('api', 'http://localhost:4010/api/v1');

/** Sources we mirror. Keep slugs in sync with backend/src/audio/translation-reciters.ts */
const SOURCES = {
  'en-ibrahim-walk': {
    base: 'https://everyayah.com/data/English/Sahih_Intnl_Ibrahim_Walk_192kbps',
    granularity: 'ayah',
  },
  'ur-shamshad-ali-khan': {
    base: 'https://everyayah.com/data/translations/urdu_shamshad_ali_khan_46kbps',
    granularity: 'ayah',
  },
  'ur-farhat-hashmi': {
    base: 'https://everyayah.com/data/translations/urdu_farhat_hashmi',
    granularity: 'ayah',
  },
  'fa-makarem': {
    base: 'https://everyayah.com/data/translations/Makarem_Kabiri_16Kbps',
    granularity: 'ayah',
  },
  'fa-fooladvand': {
    base: 'https://everyayah.com/data/translations/Fooladvand_Hedayatfar_40Kbps',
    granularity: 'ayah',
  },
};

const pad3 = (n) => String(n).padStart(3, '0');

async function fileList(granularity) {
  if (granularity === 'ruku') {
    return Array.from({ length: 558 }, (_, i) => ({ file: `ruku-${pad3(i + 1)}.mp3` }));
  }
  const res = await fetch(`${API}/quran/surahs`);
  if (!res.ok) throw new Error(`surah list: HTTP ${res.status} from ${API}`);
  const surahs = await res.json();
  const out = [];
  for (const s of surahs) {
    for (let a = 1; a <= s.numberOfAyahs; a += 1) {
      out.push({ file: `${pad3(s.number)}${pad3(a)}.mp3` });
    }
  }
  return out;
}

async function downloadOne(url, dest) {
  if (!FORCE) {
    try {
      const s = await stat(dest);
      if (s.size > 512) return { skipped: true, bytes: 0 };
    } catch {}
  }
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const tmp = `${dest}.part`;
  await pipeline(res.body, createWriteStream(tmp));
  const got = (await stat(tmp)).size;
  if (got < 512) throw new Error(`suspiciously small (${got} bytes)`);
  await rename(tmp, dest);
  return { skipped: false, bytes: got };
}

async function mirror(slug) {
  const src = SOURCES[slug];
  if (!src) throw new Error(`unknown reciter: ${slug}`);
  const outDir = join(ROOT, 'backend', 'storage', 'audio', slug);
  await mkdir(outDir, { recursive: true });
  const list = await fileList(src.granularity);
  console.log(`\n[${slug}] ${list.length} files -> ${outDir}`);

  const queue = [...list];
  let done = 0, skipped = 0, bytes = 0;
  const failures = [];

  const worker = async () => {
    while (queue.length) {
      const { file } = queue.shift();
      try {
        const r = await downloadOne(`${src.base}/${file}`, join(outDir, file));
        if (r.skipped) skipped += 1; else bytes += r.bytes;
      } catch (err) {
        failures.push(`${file}: ${err.message}`);
      }
      done += 1;
      if (done % 250 === 0) {
        console.log(`  [${slug}] ${done}/${list.length}  ${(bytes / 1048576).toFixed(0)} MB new, ${skipped} skipped, ${failures.length} failed`);
      }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`[${slug}] DONE ${done}/${list.length} — ${(bytes / 1048576).toFixed(1)} MB new, ${skipped} skipped, ${failures.length} failed`);
  if (failures.length) {
    console.error(`[${slug}] first failures:`);
    for (const f of failures.slice(0, 10)) console.error('   ' + f);
  }
  return { slug, total: list.length, failures: failures.length };
}

const which = arg('reciter', '');
const targets = which === 'all' || !which ? Object.keys(SOURCES) : which.split(',');
const results = [];
for (const slug of targets) results.push(await mirror(slug));

console.log('\n=== summary ===');
for (const r of results) console.log(`  ${r.slug}: ${r.total} files, ${r.failures} failed`);
if (results.some((r) => r.failures)) process.exitCode = 1;
