import { apiBase } from '@/lib/api';
import { SURAH_AYAH_COUNTS } from '@/lib/surah-pagination';
import { TOPICS } from '@/lib/topics';

/**
 * Real content-change dates for sitemap `<lastmod>`, read from the Quran database (each ayah row's
 * `updatedAt`). Nothing here is the build date: if the API is unreachable or a row has no usable
 * timestamp, the date is simply absent and the sitemap omits `<lastmod>` for that URL.
 *
 * Surah / juz / topic pages take the newest `updatedAt` among the ayahs they render.
 * Limitation: `updatedAt` is the ayah row's own timestamp; translation rows are not exposed with
 * dates, so a translation-only edit is not reflected until that ayah row is touched.
 */
export type QuranDates = {
  ayah: Map<string, string>;
  surah: Map<number, string>;
  juz: Map<number, string>;
};

type Row = { number: number; juz?: number | null; updatedAt?: string | null };

const PAGE = 100;

function validIso(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const t = new Date(value);
  return Number.isNaN(t.getTime()) ? null : t.toISOString();
}

function newest(a: string | undefined, b: string): string {
  return !a || b > a ? b : a;
}

async function fetchSurahRows(surah: number): Promise<Row[]> {
  const rows: Row[] = [];
  const pages = Math.ceil((SURAH_AYAH_COUNTS[surah - 1] ?? 0) / PAGE);
  for (let page = 1; page <= pages; page += 1) {
    const url = `${apiBase()}/quran/surahs/${surah}/ayahs?page=${page}&limit=${PAGE}`;
    try {
      const res = await fetch(url, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) return rows;
      const body = (await res.json()) as Row[];
      if (!Array.isArray(body)) return rows;
      rows.push(...body);
    } catch {
      return rows; // partial/none → those URLs get no <lastmod>
    }
  }
  return rows;
}

async function build(): Promise<QuranDates> {
  const dates: QuranDates = { ayah: new Map(), surah: new Map(), juz: new Map() };
  const queue = Array.from({ length: 114 }, (_, i) => i + 1);
  const workers = Array.from({ length: 8 }, async () => {
    for (let s = queue.shift(); s !== undefined; s = queue.shift()) {
      for (const row of await fetchSurahRows(s)) {
        const iso = validIso(row.updatedAt);
        if (!iso) continue;
        dates.ayah.set(`${s}:${row.number}`, iso);
        dates.surah.set(s, newest(dates.surah.get(s), iso));
        if (row.juz) dates.juz.set(row.juz, newest(dates.juz.get(row.juz), iso));
      }
    }
  });
  await Promise.all(workers);
  return dates;
}

let cached: Promise<QuranDates> | null = null;

/** One crawl per process/build; sitemap routes share it. */
export function loadQuranDates(): Promise<QuranDates> {
  cached ??= build();
  return cached;
}

/** Resolve an entry's `dateKey` (`ayah:2:1`, `surah:2`, `juz:3`, `topic:4-quls`) to a real date. */
export function resolveDateKey(dates: QuranDates, key: string): string | undefined {
  const [kind, a, b] = key.split(':');
  if (kind === 'ayah') return dates.ayah.get(`${a}:${b}`);
  if (kind === 'surah') return dates.surah.get(Number(a));
  if (kind === 'juz') return dates.juz.get(Number(a));
  if (kind === 'topic') {
    const topic = TOPICS.find((t) => t.slug === a);
    if (!topic) return undefined;
    let out: string | undefined;
    for (const inl of topic.inline) {
      const count = SURAH_AYAH_COUNTS[inl.surah - 1] ?? 0;
      for (let n = inl.from ?? 1; n <= Math.min(inl.to ?? count, count); n += 1) {
        const d = dates.ayah.get(`${inl.surah}:${n}`);
        if (d) out = newest(out, d);
      }
    }
    return out;
  }
  return undefined;
}
