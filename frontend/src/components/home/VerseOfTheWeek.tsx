import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { quranApi } from '@/lib/api';
import { getWeekOfYear, getWeekReading, getSurahPath } from '@/lib/surah-meta';

const FEATURED_FALLBACKS: [number, number][] = [
  [1, 1],
  [1, 2],
  [1, 5],
  [1, 7],
];

export async function VerseOfTheWeek() {
  const week = getWeekOfYear();
  const reading = getWeekReading(week);
  const midSurah = Math.floor((reading.start.surah + reading.end.surah) / 2);

  const candidates: [number, number][] = [
    [midSurah, 1],
    [reading.start.surah, 1],
    ...FEATURED_FALLBACKS,
  ];

  let ayah: Awaited<ReturnType<typeof quranApi.ayah>> | null = null;
  let surah: Awaited<ReturnType<typeof quranApi.surah>> | null = null;
  let surahNumber = 1;
  let ayahNumber = 1;

  for (const [s, a] of candidates) {
    try {
      const [ayahRes, surahRes] = await Promise.all([
        quranApi.ayah(s, a, { translations: 'en-sahih-international' }),
        quranApi.surah(s),
      ]);
      ayah = ayahRes;
      surah = surahRes;
      surahNumber = s;
      ayahNumber = a;
      break;
    } catch {
      // partial seed may only include Al-Fatihah
    }
  }

  if (!ayah || !surah) return null;

  const translation = ayah.translations?.[0]?.text;

  return (
    <section className="w-full px-3 py-3 sm:px-4 sm:py-4 md:px-6">
      <div className="mb-3 flex flex-col gap-1 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h2 className="text-lg font-bold text-ink sm:text-xl md:text-2xl">
          Verse of the Week
        </h2>
        <Link
          href={getSurahPath(surahNumber)}
          className="shrink-0 text-sm font-medium text-ink-3 transition hover:text-[var(--accent)]"
        >
          Surah {surah.nameSimple} [{surahNumber}:{ayahNumber}]
        </Link>
      </div>

      <div className="rounded-2xl border border-line bg-surface px-4 py-6 shadow-sm sm:px-8 sm:py-8 md:px-10 md:py-10">
        <p className="mb-4 text-center text-sm text-ink-muted sm:mb-6">
          A verse from this week&apos;s reading
        </p>

        <p
          className="mb-4 text-center font-arabic text-xl leading-loose text-ink sm:mb-6 sm:text-2xl md:text-3xl"
          dir="rtl"
          lang="ar"
        >
          {ayah.textUthmani}
        </p>

        {translation && (
          <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-ink-3 sm:text-base">
            {translation}{' '}
            <Link
              href={getSurahPath(surahNumber)}
              className="font-medium text-[var(--accent)] hover:underline"
            >
              {surah.nameSimple} {surahNumber}:{ayahNumber}
            </Link>
          </p>
        )}

        <div className="mt-6 flex justify-end sm:mt-8">
          <Link
            href={getSurahPath(reading.start.surah)}
            className="inline-flex items-center gap-1 text-sm font-medium text-ink-2 transition hover:text-[var(--accent)]"
          >
            This Week&apos;s Reading
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
