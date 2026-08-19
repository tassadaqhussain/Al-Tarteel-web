import Link from 'next/link';
import { notFound } from 'next/navigation';
import { quranApi } from '@/lib/api';
import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';
import { ReadingTracker } from '@/components/reader/ReadingTracker';
import { DailyMotivationReader } from '@/components/daily/DailyMotivationReader';
import { ArrowRight, Bookmark, ChevronLeft, ChevronRight, RotateCcw, BookMarked, Target } from 'lucide-react';
import { ChapterControls } from '@/components/reader/ChapterControls';
import { ReaderBismillah } from '@/components/reader/ReaderBismillah';
import { SurahAyahFeed } from '@/components/reader/SurahAyahFeed';
import { SurahNavTrigger } from '@/components/reader/SurahNavTrigger';
import { ReaderToolbar } from '@/components/reader/ReaderToolbar';
import { SurahPaginationNav } from '@/components/reader/SurahPaginationNav';
import { PinnedVersesBar } from '@/components/reader/PinnedVersesBar';
import { CompareVerseModal } from '@/components/reader/CompareVerseModal';
import { CleanTranslationUrl } from '@/components/reader/CleanTranslationUrl';
import { getSurahArabicName, getSurahMeta, getSurahPath, SURAH_MEANINGS } from '@/lib/surah-meta';
import { resolveTranslations } from '@/lib/translation-preference';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { surahJsonLd, surahSeo } from '@/lib/seo';
import { READER_BAR_SHELL, READER_SHELL } from '@/components/layout/MainContainer';
import { ReadingProgressBar } from '@/components/reader/ReadingProgressBar';
import { cn } from '@/lib/utils';
import {
  clampSurahPage,
  getSurahAyahCount,
  surahSsrLimit,
  surahTotalPages,
  surahVerseRange,
} from '@/lib/surah-pagination';
import type { Surah } from '@/lib/api';

/** Used when the API is briefly unavailable — never treat a valid surah number as 404. */
function localSurahFallback(surahNumber: number): Surah {
  const meta = getSurahMeta(surahNumber);
  return {
    id: surahNumber,
    number: surahNumber,
    nameArabic: meta.nameArabic,
    nameSimple: meta.nameSimple,
    nameComplex: meta.nameSimple,
    revelationPlace: '',
    revelationOrder: null,
    numberOfAyahs: getSurahAyahCount(surahNumber),
  };
}

interface Props {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ page?: string; trans?: string }>;
}

export const revalidate = 3600;

/** Prefer static/ISR HTML for crawlers; translation cookie is applied client-side. */
export const dynamic = 'force-static';

export async function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({ number: String(i + 1) }));
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { number } = await params;
  const { page: pageStr } = await searchParams;
  const n = parseInt(number, 10);
  if (Number.isNaN(n) || n < 1 || n > 114) return {};
  const surah = await quranApi.surah(n).catch(() => null);
  const ayahCount = surah?.numberOfAyahs || getSurahAyahCount(n);
  const page = clampSurahPage(parseInt(pageStr || '1', 10), ayahCount);
  const arabicName = getSurahArabicName(n, surah?.nameArabic);
  return surahSeo(n, {
    arabicName,
    ayahCount,
    page,
  }).metadata;
}

export default async function SurahPage({ params, searchParams }: Props) {
  const { number } = await params;
  const { page: pageStr, trans } = await searchParams;
  const surahNumber = parseInt(number, 10);
  if (Number.isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) notFound();

  // Do not read cookies() here — it forces fully dynamic/private responses and
  // slows Google crawling. Default + ?trans= SSR; cookie preference via CleanTranslationUrl.
  const effectiveTranslations = resolveTranslations({
    cookieValue: undefined,
    queryTrans: trans,
  });

  const surah = (await quranApi.surah(surahNumber).catch(() => null)) ?? localSurahFallback(surahNumber);

  const ayahCount = surah.numberOfAyahs || getSurahAyahCount(surahNumber);
  const page = clampSurahPage(parseInt(pageStr || '1', 10), ayahCount);
  const limit = Math.max(1, surahSsrLimit(ayahCount, page));
  const totalPages = surahTotalPages(ayahCount);
  const range = surahVerseRange(page, ayahCount);
  const surahPath = getSurahPath(surahNumber);

  const [ayahs, prevSurah, nextSurah] = await Promise.all([
    quranApi
      .ayahsBySurah(surahNumber, {
        page,
        limit,
        translations: effectiveTranslations,
        words: true,
      })
      .catch(() => []),
    surahNumber > 1 ? quranApi.surah(surahNumber - 1).catch(() => null) : Promise.resolve(null),
    surahNumber < 114 ? quranApi.surah(surahNumber + 1).catch(() => null) : Promise.resolve(null),
  ]);

  const arabicName = getSurahArabicName(surahNumber, surah.nameArabic);
  const initialAyahs = Array.isArray(ayahs) ? ayahs : [];
  const firstAyah = initialAyahs.length > 0 ? initialAyahs[0].number : range.start;
  const translationCount = effectiveTranslations.split(',').filter(Boolean).length;

  const endOfChapter = (
    <div className="mt-14 border-t border-line pt-10">
      <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
        {prevSurah ? (
          <Link
            href={getSurahPath(prevSurah.number)}
            className="flex items-center gap-3 rounded-[4px] border border-line bg-surface px-5 py-4 text-left shadow-xs transition hover:border-[var(--accent)] hover:shadow-md"
          >
            <ChevronLeft className="h-5 w-5 text-ink-faint" />
            <div>
              <p className="text-xs text-ink-muted">Previous Surah</p>
              <p className="font-semibold text-ink">{prevSurah.number}. {prevSurah.nameSimple}</p>
            </div>
          </Link>
        ) : <div />}

        <div className="text-center">
          <p className="font-arabic text-2xl font-bold text-ink">{arabicName}</p>
          <p className="mt-1 text-xs text-ink-muted">End of Surah {surah.nameSimple} · {ayahCount} Ayahs</p>
        </div>

        {nextSurah ? (
          <Link
            href={getSurahPath(nextSurah.number)}
            className="flex items-center gap-3 rounded-[4px] border border-line bg-surface px-5 py-4 text-right shadow-xs transition hover:border-[var(--accent)] hover:shadow-md"
          >
            <div>
              <p className="text-xs text-ink-muted">Next Surah</p>
              <p className="font-semibold text-ink">{nextSurah.number}. {nextSurah.nameSimple}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-ink-faint" />
          </Link>
        ) : <div />}
      </div>

      <section
        aria-label="Daily reading habit"
        className="mt-10 flex flex-col items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-emerald-900 to-emerald-800 p-6 text-white sm:flex-row"
      >
        <div className="flex items-start gap-4">
          <Target className="mt-0.5 h-6 w-6 shrink-0 text-amber-300" />
          <div>
            <h2 className="text-lg font-bold">Build a steady Quran habit</h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-emerald-50/75">
              Save your place, set a reading goal, and return to the next chapter without losing momentum.
            </p>
          </div>
        </div>
        <Link
          href="/reading-goal"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[4px] bg-amber-400 px-4 py-2.5 text-sm font-bold text-emerald-950 hover:bg-amber-300"
        >
          Set a reading goal <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink">
      <JsonLd
        data={surahJsonLd({
          number: surahNumber,
          name: surah.nameSimple,
          arabic: arabicName,
          meaning: SURAH_MEANINGS[surahNumber],
          ayahCount,
          path: surahPath,
        })}
      />
      <Header />

      {/* Sticky Reader Sub-Header (Quran.com style) */}
      <div className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
        <div className={cn(READER_BAR_SHELL, 'flex items-center gap-4 py-0')}>
          <div className="flex min-w-0 flex-1 items-center">
            <SurahNavTrigger surahNumber={surahNumber} surahName={surah.nameSimple} />
          </div>

          <p className="hidden flex-1 items-center justify-center gap-1.5 text-sm text-ink-3 md:flex">
            <Bookmark className="h-4 w-4 text-ink-3" aria-hidden />
            <span className="font-semibold text-ink-3">Page {initialAyahs[0]?.page || '610'}</span>
            <span className="text-ink-faint">Juz {initialAyahs[0]?.juz || '30'} / Hizb {initialAyahs[0]?.hizb || '60'}</span>
          </p>

          <div className="flex shrink-0 items-center justify-end gap-2 md:flex-1">
            <ReaderToolbar
              activeTranslationCount={translationCount}
              surahNumber={surahNumber}
            />
          </div>
        </div>
        <ReadingProgressBar variant="full" className="h-[3px] bg-transparent" />
      </div>

      <PinnedVersesBar />
      <CompareVerseModal />
      <CleanTranslationUrl />

      <main className={cn(READER_SHELL, 'flex-1 py-4 sm:py-6 pb-16')}>
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Surahs', path: '/surahs' },
            { name: `Surah ${surah.nameSimple}`, path: surahPath },
            ...(page > 1
              ? [{ name: `Verses ${range.start}–${range.end}`, path: `${surahPath}?page=${page}` }]
              : []),
          ]}
        />

        <ReadingTracker
          surahNumber={surahNumber}
          surahName={surah.nameSimple}
          surahNameArabic={arabicName}
          firstAyahNumber={firstAyah}
        />
        <DailyMotivationReader />

        {/* Chapter identity and primary reading controls (Quran.com style banner) */}
        <article>
        <header className="mt-5 mb-2.5 rounded-[15px] bg-surface-2 px-5 py-5 sm:px-[30px]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-col items-center gap-2.5 text-center sm:flex-row sm:items-center sm:text-left">
              <span
                className="font-arabic chapter-arabic-name shrink-0 text-4xl font-bold text-ink lg:text-[52px]"
                dir="rtl"
                lang="ar"
              >
                {arabicName}
              </span>

              <div className="min-w-0">
                <div className="flex flex-col items-center gap-x-2.5 gap-y-0.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-start">
                  <h1 className="text-xl font-semibold text-ink sm:text-2xl">
                    {page > 1
                      ? `${surahNumber}. Surah ${surah.nameSimple} – Verses ${range.start}–${range.end}`
                      : `${surahNumber}. Surah ${surah.nameSimple}`}
                  </h1>
                  {SURAH_MEANINGS[surahNumber] && (
                    <span className="text-xl font-medium text-ink-3 sm:text-2xl">
                      {SURAH_MEANINGS[surahNumber]}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-3 lg:truncate">
                  Read and listen to Surah {surah.nameSimple} with translation, tafsir, audio recitation, word-by-word meaning, and transliteration.
                </p>
              </div>
            </div>

            <div className="shrink-0 lg:self-center">
              <ChapterControls
                translationCount={translationCount}
                surahNumber={surahNumber}
                surahName={surah.nameSimple}
              />
            </div>
          </div>
        </header>

        {/* ── Bismillah ────────────────────────────────────────────────── */}
        {surahNumber !== 9 && surahNumber !== 1 && page === 1 && <ReaderBismillah />}

        {page > 1 && (
          <div className="mb-6 flex justify-center">
            <Link
              href={surahPath}
              className="rounded-[4px] border border-line bg-surface px-4 py-2 text-sm text-ink-3 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Start from beginning
            </Link>
          </div>
        )}

        <section aria-label={`Verses ${range.start}–${range.end} of Surah ${surah.nameSimple}`}>
        <SurahAyahFeed
          surahNumber={surahNumber}
          surahName={surah.nameSimple}
          initialAyahs={initialAyahs}
          initialPage={page}
          totalPages={totalPages}
          translations={effectiveTranslations}
          hasTranslations={translationCount > 0}
          endOfChapter={endOfChapter}
        />
        </section>

        <SurahPaginationNav
          path={surahPath}
          page={page}
          totalPages={totalPages}
          ayahCount={ayahCount}
          surahName={surah.nameSimple}
        />
        </article>

      </main>

      <SiteFooter />
    </div>
  );
}
