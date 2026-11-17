#!/usr/bin/env node
/**
 * Mirror recitation, spoken-translation, and word-by-word audio into
 * backend/storage/audio so the API serves files from our server.
 *
 *   cd backend && npm run audio:download
 *   node scripts/download-all-audio.mjs --reciters=alafasy,husary
 *   node scripts/download-all-audio.mjs --translations-only
 *   node scripts/download-all-audio.mjs --translations-only --compact
 *   node scripts/download-all-audio.mjs --wbw-only
 *   node scripts/download-all-audio.mjs --skip-wbw
 *
 * Existing files larger than 512 bytes are skipped unless --force is set.
 * Full Arabic set is ~38 reciters × 6,236 MP3s (tens of GB).
 * Compact translations ≈ EN (~1.5 GB) + Urdu Shamshad (~0.5 GB) + Pashto.
 */
import { createWriteStream, readFileSync, statfsSync } from 'node:fs';
import { mkdir, stat, rename } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const BACKEND = join(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = join(BACKEND, '..');
const STORAGE = join(BACKEND, 'storage', 'audio');
const arg = (name, fallback) => {
  const hit = process.argv.find((item) => item.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const CONCURRENCY = Math.max(1, Number(arg('concurrency', '8')));
const FORCE = process.argv.includes('--force');
const API = arg('api', 'http://localhost:4010/api/v1');
const TRANSLATIONS_ONLY = process.argv.includes('--translations-only');
const WBW_ONLY = process.argv.includes('--wbw-only');
const SKIP_WBW = process.argv.includes('--skip-wbw');
const SKIP_PASHTO = process.argv.includes('--skip-pashto');
const reciterFilter = arg('reciters', '');
/** Comma list of translation slugs. Default: all. --compact = en + smaller Urdu. */
const translationFilter = arg(
  'translations',
  process.argv.includes('--compact') ? 'en-ibrahim-walk,ur-shamshad-ali-khan' : '',
);
/** Abort a pack when free space on the storage volume drops below this many MB. */
const MIN_FREE_MB = Math.max(256, Number(arg('min-free-mb', '2048')));

const TRANSLATION_ORIGINS = [
  {
    slug: 'en-ibrahim-walk',
    origin: 'https://everyayah.com/data/English/Sahih_Intnl_Ibrahim_Walk_192kbps',
    granularity: 'ayah',
  },
  {
    slug: 'ur-shamshad-ali-khan',
    origin: 'https://everyayah.com/data/translations/urdu_shamshad_ali_khan_46kbps',
    granularity: 'ayah',
  },
  {
    slug: 'ur-farhat-hashmi',
    origin: 'https://everyayah.com/data/translations/urdu_farhat_hashmi',
    granularity: 'ayah',
  },
  {
    slug: 'fa-makarem',
    origin: 'https://everyayah.com/data/translations/Makarem_Kabiri_16Kbps',
    granularity: 'ayah',
  },
  {
    slug: 'fa-fooladvand',
    origin: 'https://everyayah.com/data/translations/Fooladvand_Hedayatfar_40Kbps',
    granularity: 'ayah',
  },
];

function freeMb(dir) {
  try {
    const s = statfsSync(dir);
    return Math.floor((Number(s.bavail) * Number(s.bsize)) / (1024 * 1024));
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

function assertFreeSpace(label) {
  const mb = freeMb(STORAGE);
  if (mb < MIN_FREE_MB) {
    throw new Error(
      `Not enough free disk for ${label}: ${mb} MB available (need ≥ ${MIN_FREE_MB} MB). Free space on the host or pass --min-free-mb=512.`,
    );
  }
  return mb;
}

function selectedTranslations() {
  if (!translationFilter) return TRANSLATION_ORIGINS;
  const wanted = new Set(
    translationFilter
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  );
  return TRANSLATION_ORIGINS.filter((item) => wanted.has(item.slug));
}

function parseArabicReciters() {
  const source = readFileSync(join(BACKEND, 'prisma', 'import-reciters.ts'), 'utf8');
  const reciters = [];
  const pattern = /slug:\s*'([^']+)'[\s\S]*?baseUrl:\s*'([^']+)'/g;
  let match;
  while ((match = pattern.exec(source))) {
    reciters.push({ slug: match[1], origin: match[2].replace(/\/$/, '') });
  }
  return reciters;
}

function verseFiles(surahs) {
  const files = [];
  for (const surah of surahs) {
    for (let ayah = 1; ayah <= surah.numberOfAyahs; ayah += 1) {
      files.push(`${String(surah.number).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`);
    }
  }
  return files;
}

async function fetchSurahs() {
  const response = await fetch(`${API}/quran/surahs`);
  if (!response.ok) throw new Error(`surah list: HTTP ${response.status} from ${API}`);
  return response.json();
}

async function downloadOne(url, dest) {
  if (!FORCE) {
    try {
      const existing = await stat(dest);
      if (existing.size > 512) return { skipped: true, bytes: 0 };
    } catch {
      // missing
    }
  }
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const tmp = `${dest}.part`;
  await pipeline(response.body, createWriteStream(tmp));
  const got = (await stat(tmp)).size;
  if (got < 512) throw new Error(`suspiciously small (${got} bytes)`);
  await rename(tmp, dest);
  return { skipped: false, bytes: got };
}

async function mirrorFolder(slug, origin, files) {
  await mkdir(STORAGE, { recursive: true });
  const free = assertFreeSpace(slug);
  const outDir = join(STORAGE, slug);
  await mkdir(outDir, { recursive: true });
  console.log(`\n[${slug}] ${files.length} files -> ${outDir} (${free} MB free)`);
  const queue = [...files];
  let done = 0;
  let skipped = 0;
  let bytes = 0;
  const failures = [];

  let abortReason = null;
  const worker = async () => {
    while (queue.length && !abortReason) {
      const file = queue.shift();
      if (!file || abortReason) return;
      try {
        const result = await downloadOne(`${origin}/${file}`, join(outDir, file));
        if (result.skipped) skipped += 1;
        else bytes += result.bytes;
      } catch (error) {
        failures.push(`${file}: ${error.message}`);
        if (error.code === 'ENOSPC' || /no space left/i.test(String(error.message))) {
          abortReason = 'ENOSPC';
          queue.length = 0;
        }
      }
      done += 1;
      if (done % 500 === 0) {
        console.log(
          `  [${slug}] ${done}/${files.length}  ${(bytes / 1048576).toFixed(0)} MB new, ${skipped} skipped, ${failures.length} failed`,
        );
      }
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(
    `[${slug}] DONE ${done}/${files.length} — ${(bytes / 1048576).toFixed(1)} MB new, ${skipped} skipped, ${failures.length} failed`,
  );
  if (failures.length) {
    for (const failure of failures.slice(0, 8)) console.error(`   ${failure}`);
  }
  if (abortReason === 'ENOSPC') {
    const err = new Error(`ENOSPC while mirroring ${slug}`);
    err.code = 'ENOSPC';
    throw err;
  }
  return { slug, total: files.length, failures: failures.length };
}

function runNode(script, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], { cwd: ROOT, stdio: 'inherit' });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${script} exited ${code}`))));
  });
}

async function wordFilesFromApi(surahs) {
  const files = [];
  for (const surah of surahs) {
    const response = await fetch(`${API}/quran/surahs/${surah.number}/ayahs?words=true&limit=286`);
    if (!response.ok) throw new Error(`ayahs ${surah.number}: HTTP ${response.status}`);
    const ayahs = await response.json();
    const list = Array.isArray(ayahs) ? ayahs : ayahs.data || ayahs.ayahs || [];
    for (const ayah of list) {
      const wordCount = ayah.words?.length || 0;
      for (let position = 1; position <= wordCount; position += 1) {
        files.push(
          `${String(surah.number).padStart(3, '0')}_${String(ayah.number).padStart(3, '0')}_${String(position).padStart(3, '0')}.mp3`,
        );
      }
    }
  }
  return files;
}

async function wordFilesFromQuranCom(surahs) {
  const files = [];
  for (const surah of surahs) {
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages) {
      const response = await fetch(
        `https://api.quran.com/api/v4/verses/by_chapter/${surah.number}?words=true&per_page=50&page=${page}`,
      );
      if (!response.ok) throw new Error(`quran.com words ${surah.number}: HTTP ${response.status}`);
      const data = await response.json();
      totalPages = data.pagination?.total_pages || 1;
      for (const verse of data.verses || []) {
        const ayah = Number(String(verse.verse_key).split(':')[1]);
        const count = (verse.words || []).filter((word) => word.char_type_name !== 'end').length;
        for (let position = 1; position <= count; position += 1) {
          files.push(
            `${String(surah.number).padStart(3, '0')}_${String(ayah).padStart(3, '0')}_${String(position).padStart(3, '0')}.mp3`,
          );
        }
      }
      page += 1;
    }
    console.log(`  wbw index surah ${surah.number}: ${files.length} files so far`);
  }
  return files;
}

async function downloadWbw(surahs) {
  let files = [];
  try {
    files = await wordFilesFromApi(surahs);
  } catch (error) {
    console.warn(`Local word index unavailable (${error.message}); using Quran.com word counts.`);
  }
  if (!files.length) files = await wordFilesFromQuranCom(surahs);
  else console.log(`  wbw index from API: ${files.length} files`);
  return mirrorFolder('wbw', 'https://audio.qurancdn.com/wbw', files);
}

async function main() {
  const results = [];
  await mkdir(STORAGE, { recursive: true });
  console.log(`Audio storage: ${STORAGE} (${assertFreeSpace('startup')} MB free, guard ${MIN_FREE_MB} MB)`);
  const surahs = await fetchSurahs();
  const ayahFiles = verseFiles(surahs);
  const spokenList = selectedTranslations();

  if (!WBW_ONLY) {
    if (!TRANSLATIONS_ONLY) {
      let reciters = parseArabicReciters();
      if (reciterFilter) {
        const wanted = new Set(reciterFilter.split(',').map((item) => item.trim()).filter(Boolean));
        reciters = reciters.filter((item) => wanted.has(item.slug));
      }
      if (!reciters.length) throw new Error('No Arabic reciters matched');
      console.log(`Mirroring ${reciters.length} Arabic reciters (${ayahFiles.length} ayahs each)`);
      for (const reciter of reciters) {
        results.push(await mirrorFolder(reciter.slug, reciter.origin, ayahFiles));
      }
    }

    if (!spokenList.length) throw new Error('No spoken translations matched --translations= filter');
    console.log(`Mirroring ${spokenList.length} spoken translations`);
    for (const spoken of spokenList) {
      try {
        results.push(await mirrorFolder(spoken.slug, spoken.origin.replace(/\/$/, ''), ayahFiles));
      } catch (error) {
        console.error(`[${spoken.slug}] aborted: ${error.message}`);
        results.push({ slug: spoken.slug, total: ayahFiles.length, failures: ayahFiles.length });
        if (String(error.message).includes('Not enough free disk') || error.code === 'ENOSPC') {
          console.error('Stopping remaining packs — free disk space, then re-run (existing files are skipped).');
          break;
        }
      }
    }
    if (!SKIP_PASHTO) {
      try {
        assertFreeSpace('ps-shafeeq-ur-rahman');
        await runNode(join(ROOT, 'scripts', 'fetch-pashto-audio.mjs'));
      } catch (error) {
        console.error(`Pashto mirror failed: ${error.message}`);
        results.push({ slug: 'ps-shafeeq-ur-rahman', total: 558, failures: 1 });
      }
    }
  }

  if (!SKIP_WBW && !TRANSLATIONS_ONLY) {
    results.push(await downloadWbw(surahs));
  }

  console.log('\n=== audio mirror summary ===');
  for (const result of results) {
    console.log(`  ${result.slug}: ${result.total} files, ${result.failures} failed`);
  }
  if (results.some((result) => result.failures)) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
