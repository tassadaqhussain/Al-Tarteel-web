import Link from 'next/link';
import { notFound } from 'next/navigation';
import { quranApi } from '@/lib/api';
import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';
import { ReadingTracker } from '@/components/reader/ReadingTracker';
import { DailyMotivationReader } from '@/components/daily/DailyMotivationReader';
import { ReaderToolbar } from '@/components/reader/ReaderToolbar';
import { ArrowRight, Bookmark, ChevronLeft, ChevronRight, RotateCcw, BookMarked, Target } from 'lucide-react';
import { ChapterControls } from '@/components/reader/ChapterControls';
import { ReaderBismillah } from '@/components/reader/ReaderBismillah';
import { SurahAyahFeed } from '@/components/reader/SurahAyahFeed';
import { SurahNavTrigger } from '@/components/reader/SurahNavTrigger';
import { SurahPaginationNav } from '@/components/reader/SurahPaginationNav';
import { PinnedVersesBar } from '@/components/reader/PinnedVersesBar';
import { CompareVerseModal } from '@/components/reader/CompareVerseModal';
import { CleanTranslationUrl } from '@/components/reader/CleanTranslationUrl';
import { getSurahArabicName, getSurahMeta, getSurahPath, SURAH_MEANINGS } from '@/lib/surah-meta';
import { resolveTranslations } from '@/lib/translation-preference';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { surahJsonLd, surahSeo } from '@/lib/seo';
import { CHROME_SHELL, READER_SHELL } from '@/components/layout/MainContainer';
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
    <div className="mt-14">
      <div className="mb-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
          End of Chapter
        </span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {prevSurah && (
          <Link
            href={getSurahPath(prevSurah.number)}
            className="group flex items-center gap-4 rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-[var(--accent)]"
          >
            <ChevronLeft className="h-5 w-5 flex-none text-[var(--muted)] transition-transform group-hover:-translate-x-0.5 group-hover:text-[var(--accent)]" />
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-[4px] bg-emerald-50 text-sm font-bold text-emerald-900">
              {prevSurah.number}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Previous chapter</p>
              <p className="mt-0.5 font-semibold text-[var(--fg)] group-hover:text-[var(--accent)]">{prevSurah.nameSimple}</p>
            </div>
            <p className="font-arabic text-lg text-[var(--muted)]" dir="rtl" lang="ar">
              {getSurahArabicName(prevSurah.number, prevSurah.nameArabic)}
            </p>
          </Link>
        )}

        {nextSurah && (
          <Link
            href={getSurahPath(nextSurah.number)}
            className="group flex items-center gap-4 rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-[var(--accent)]"
          >
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-[4px] bg-emerald-50 text-sm font-bold text-emerald-900">
              {nextSurah.number}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Next chapter</p>
              <p className="mt-0.5 font-semibold text-[var(--fg)] group-hover:text-[var(--accent)]">{nextSurah.nameSimple}</p>
            </div>
            <p className="font-arabic text-lg text-[var(--muted)]" dir="rtl" lang="ar">
              {getSurahArabicName(nextSurah.number, nextSurah.nameArabic)}
            </p>
            <ChevronRight className="h-5 w-5 flex-none text-[var(--muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
          </Link>
        )}
      </div>

      <section className="mt-4 flex flex-col gap-5 border-y border-emerald-900/15 bg-emerald-950 px-5 py-6 text-white sm:flex-row sm:items-center sm:justify-between sm:px-7">
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

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
        <Link href={getSurahPath(surahNumber)} className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--accent)]">
          <RotateCcw className="h-4 w-4" /> Read again
        </Link>
        <Link href="/bookmarks" className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--accent)]">
          <BookMarked className="h-4 w-4" /> My bookmarks
        </Link>
        <Link href="/my-quran" className="text-[var(--muted)] hover:text-[var(--accent)]">My Quran</Link>
        <Link href="/learning-plans" className="text-[var(--muted)] hover:text-[var(--accent)]">Learning plans</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-32 text-slate-900">
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

      {/* Quran.com 3-col sticky: Surah+progress | Page/Juz/Hizb | modes */}
      <div className="sticky top-14 z-40 border-b border-slate-200 bg-white/95 backdrop-blur sm:top-[57px]">
        <div className={cn(CHROME_SHELL, 'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-2.5 lg:grid-cols-[minmax(180px,1fr)_auto_minmax(420px,1fr)] lg:gap-6 lg:py-2.5')}>
          <div className="min-w-0 justify-self-start">
            <SurahNavTrigger surahNumber={surahNumber} surahName={surah.nameSimple} />
          </div>

          <p className="col-span-2 flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap text-center text-[11px] text-slate-500 lg:col-span-1 lg:text-sm">
            <Bookmark className="hidden h-3.5 w-3.5 shrink-0 text-slate-400 sm:block" aria-hidden />
            <span>
              {page > 1 ? (
                <>Verses {range.start}–{range.end}</>
              ) : (
                <>
                  Page {initialAyahs[0]?.page || '—'}{' '}
                  <span className="text-slate-300">·</span> Juz {initialAyahs[0]?.juz || '—'}
                  <span className="hidden xl:inline">
                    {' '}<span className="text-slate-300">·</span> Hizb {initialAyahs[0]?.hizb || '—'}
                  </span>
                </>
              )}
            </span>
          </p>

          <div className="col-start-2 row-start-1 justify-self-end lg:col-start-3">
            <ReaderToolbar
              activeTranslationCount={translationCount}
              surahNumber={surahNumber}
            />
          </div>
        </div>
      </div>

      <PinnedVersesBar />
      <CompareVerseModal />
      <CleanTranslationUrl />

      <main className={cn(READER_SHELL, 'py-4 sm:py-6')}>
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

        {/* Chapter identity and primary reading controls */}
        <article>
        <header className="mb-5 rounded-[4px] bg-slate-100 px-4 py-5 sm:mb-7 sm:px-7 sm:py-7">
          <div className="grid items-center gap-5 lg:grid-cols-[auto_minmax(0,1fr)_minmax(19rem,23rem)] lg:gap-7">
            <span
              className="justify-self-start font-arabic text-5xl font-bold leading-[1.4] text-slate-950 lg:text-6xl"
              dir="rtl"
              lang="ar"
            >
              {arabicName}
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1 className="text-xl font-bold leading-tight text-slate-950 sm:text-2xl">
                  {page > 1
                    ? `${surahNumber}. Surah ${surah.nameSimple} – Verses ${range.start}–${range.end}`
                    : `${surahNumber}. Surah ${surah.nameSimple}`}
                </h1>
                {SURAH_MEANINGS[surahNumber] && (
                  <p className="text-lg text-slate-500">{SURAH_MEANINGS[surahNumber]}</p>
                )}
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {page > 1
                  ? `Continue reading verses ${range.start}–${range.end} with translation and audio.`
                  : `Read and listen with translation, tafsir, audio recitation, word-by-word meaning, and transliteration.`}
              </p>
            </div>

            <div className="order-last w-full lg:order-none lg:justify-self-end">
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
              className="rounded-[4px] border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:border-[var(--accent)] hover:text-[var(--accent)]"
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
