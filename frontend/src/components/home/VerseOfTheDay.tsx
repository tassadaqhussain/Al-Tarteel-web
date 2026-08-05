import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { quranApi } from '@/lib/api';
import { getDayOfYear, getDayReading } from '@/lib/surah-meta';

const FEATURED_FALLBACKS: [number, number][] = [
  [1, 1],
  [1, 2],
  [1, 5],
  [1, 7],
];

export async function VerseOfTheDay() {
  const day = getDayOfYear();
  const reading = getDayReading(day);

  const candidates: [number, number][] = [
    [reading.surah, reading.ayah],
    [reading.surah, 1],
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
        <h2 className="text-lg font-bold text-slate-800 sm:text-xl md:text-2xl">
          Quran Verse of the Day
        </h2>
        <Link
          href={`/surah/${surahNumber}`}
          className="shrink-0 text-sm font-medium text-slate-600 transition hover:text-[var(--accent)]"
        >
          Surah {surah.nameSimple} [{surahNumber}:{ayahNumber}]
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 shadow-sm sm:px-8 sm:py-8 md:px-10 md:py-10">
        <p className="mb-4 text-center text-sm text-slate-500 sm:mb-6">
          A verse from today&apos;s reading
        </p>

        <p
          className="mb-4 text-center font-arabic text-xl leading-loose text-slate-800 sm:mb-6 sm:text-2xl md:text-3xl"
          dir="rtl"
          lang="ar"
        >
          {ayah.textUthmani}
        </p>

        {translation && (
          <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-slate-600 sm:text-base">
            {translation}{' '}
            <Link
              href={`/surah/${surahNumber}`}
              className="font-medium text-[var(--accent)] hover:underline"
            >
              {surah.nameSimple} {surahNumber}:{ayahNumber}
            </Link>
          </p>
        )}

        <div className="mt-6 flex justify-end sm:mt-8">
          <Link
            href={`/surah/${surahNumber}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 transition hover:text-[var(--accent)]"
          >
            Read the Full Surah
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
