import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { quranApi } from '@/lib/api';
import { Header } from '@/components/Header';
import { ReadingTracker } from '@/components/reader/ReadingTracker';
import { DailyMotivationReader } from '@/components/daily/DailyMotivationReader';
import { ReaderToolbar } from '@/components/reader/ReaderToolbar';
import { Bookmark, ChevronLeft, ChevronRight, RotateCcw, BookMarked } from 'lucide-react';
import { ChapterControls } from '@/components/reader/ChapterControls';
import { ReaderBismillah } from '@/components/reader/ReaderBismillah';
import { SurahAyahFeed } from '@/components/reader/SurahAyahFeed';
import { SurahNavTrigger } from '@/components/reader/SurahNavTrigger';
import { SurahPaginationNav } from '@/components/reader/SurahPaginationNav';
import { PinnedVersesBar } from '@/components/reader/PinnedVersesBar';
import { CompareVerseModal } from '@/components/reader/CompareVerseModal';
import { CleanTranslationUrl } from '@/components/reader/CleanTranslationUrl';
import { getSurahArabicName, getSurahMeta, getSurahPath, SURAH_MEANINGS } from '@/lib/surah-meta';
import { resolveTranslations, TRANSLATION_COOKIE } from '@/lib/translation-preference';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd, surahJsonLd, surahSeo } from '@/lib/seo';
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

  const cookieStore = await cookies();
  const effectiveTranslations = resolveTranslations({
    cookieValue: cookieStore.get(TRANSLATION_COOKIE)?.value,
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
          <div className="mt-12">
            {/* Divider */}
            <div className="mb-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-[var(--border)]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                End of Chapter
              </span>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>

            {/* Next / Previous surah cards */}
            <div className="grid gap-4 md:grid-cols-3">
              {prevSurah && (
                <Link
                  href={getSurahPath(prevSurah.number)}
                  className="group flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--ayah-highlight)]"
                >
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm font-bold text-[var(--muted)] transition-colors group-hover:border-[var(--accent)]/40 group-hover:text-[var(--accent)]">
                    {prevSurah.number}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Previous</p>
                    <p className="mt-0.5 font-semibold text-[var(--fg)] transition-colors group-hover:text-[var(--accent)]">
                      {prevSurah.nameSimple}
                    </p>
                    <p className="font-arabic text-sm text-[var(--muted)]" dir="rtl" lang="ar">{getSurahArabicName(prevSurah.number, prevSurah.nameArabic)}</p>
                  </div>
                  <ChevronLeft className="h-4 w-4 flex-none text-[var(--muted)] transition-transform group-hover:-translate-x-0.5 group-hover:text-[var(--accent)]" />
                </Link>
              )}

              {nextSurah && (
                <Link
                  href={getSurahPath(nextSurah.number)}
                  className="group flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--ayah-highlight)]"
                >
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm font-bold text-[var(--muted)] transition-colors group-hover:border-[var(--accent)]/40 group-hover:text-[var(--accent)]">
                    {nextSurah.number}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Next</p>
                    <p className="mt-0.5 font-semibold text-[var(--fg)] transition-colors group-hover:text-[var(--accent)]">
                      {nextSurah.nameSimple}
                    </p>
                    <p className="font-arabic text-sm text-[var(--muted)]" dir="rtl" lang="ar">{getSurahArabicName(nextSurah.number, nextSurah.nameArabic)}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-none text-[var(--muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
                </Link>
              )}

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-slate-900">Explore</h2>
                  <Link href="/my-quran" className="text-xs text-[var(--accent)]">My Quran</Link>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {['Info', 'Tafsir', 'Reflections', 'Lessons'].map((label) => (
                    <span key={label} className="rounded-full bg-[var(--accent)]/10 px-2.5 py-1 text-xs font-medium text-[var(--accent)]">{label}</span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <h2 className="font-bold text-slate-900">Achieve Your Quran Goals</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">Track streaks, create custom goals, and stay consistent.</p>
                <Link href="/reading-goal" className="mt-4 inline-flex rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--accent)]/90">Set a Custom Goal</Link>
              </div>
            </div>

            {/* Quick actions */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={getSurahPath(surahNumber)}
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--muted)] transition-all hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Read again
              </Link>
              <Link
                href="/bookmarks"
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--muted)] transition-all hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
              >
                <BookMarked className="h-3.5 w-3.5" />
                My Bookmarks
              </Link>
            </div>

            <section className="mt-10 overflow-hidden rounded-2xl bg-slate-950 px-7 py-9 text-white sm:px-10">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)]">Learn about Surah {surah.nameSimple}</p>
              <div className="mt-3 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-serif text-4xl font-bold sm:text-5xl">The Ultimate Refuge</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Seek guidance in the One who protects every heart through a focused Quran learning plan.</p>
                </div>
                <Link href="/learning-plans" className="shrink-0 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white">Start Now</Link>
              </div>
            </section>
          </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-32">
      <JsonLd
        data={[
          surahJsonLd({
            number: surahNumber,
            name: surah.nameSimple,
            arabic: arabicName,
            meaning: SURAH_MEANINGS[surahNumber],
            ayahCount,
            path: surahPath,
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Surahs', path: '/surahs' },
            { name: `Surah ${surah.nameSimple}`, path: surahPath },
            ...(page > 1
              ? [{ name: `Verses ${range.start}–${range.end}`, path: `${surahPath}?page=${page}` }]
              : []),
          ]),
        ]}
      />
      <Header />

      {/* Quran.com 3-col sticky: Surah+progress | Page/Juz/Hizb | modes */}
      <div className="sticky top-14 z-40 border-b border-slate-200 bg-white/95 backdrop-blur sm:top-[57px]">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-3 py-2.5 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-4 sm:px-6 sm:py-3">
          <div className="min-w-0 justify-self-start">
            <SurahNavTrigger surahNumber={surahNumber} surahName={surah.nameSimple} />
          </div>

          <p className="col-span-2 flex min-w-0 items-center justify-center gap-1.5 truncate text-center text-[11px] text-slate-500 sm:col-span-1 sm:text-sm">
            <Bookmark className="hidden h-3.5 w-3.5 shrink-0 text-slate-400 sm:block" aria-hidden />
            <span className="truncate">
              {page > 1 ? (
                <>Verses {range.start}–{range.end}</>
              ) : (
                <>
                  Page {initialAyahs[0]?.page || '—'}{' '}
                  <span className="text-slate-300">·</span> Juz {initialAyahs[0]?.juz || '—'} / Hizb{' '}
                  {initialAyahs[0]?.hizb || '—'}
                </>
              )}
            </span>
          </p>

          <div className="col-start-2 row-start-1 justify-self-end sm:col-start-3">
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

      <main className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-xs text-slate-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/" className="hover:text-emerald-800">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/surahs" className="hover:text-emerald-800">Surahs</Link></li>
            <li aria-hidden="true">/</li>
            <li>
              {page > 1 ? (
                <Link href={surahPath} className="hover:text-emerald-800">
                  Surah {surah.nameSimple}
                </Link>
              ) : (
                <span className="font-medium text-slate-700" aria-current="page">
                  Surah {surah.nameSimple}
                </span>
              )}
            </li>
            {page > 1 && (
              <>
                <li aria-hidden="true">/</li>
                <li className="font-medium text-slate-700" aria-current="page">
                  Verses {range.start}–{range.end}
                </li>
              </>
            )}
          </ol>
        </nav>

        <ReadingTracker
          surahNumber={surahNumber}
          surahName={surah.nameSimple}
          surahNameArabic={arabicName}
          firstAyahNumber={firstAyah}
        />
        <DailyMotivationReader />

        {/* ── Surah intro card (Quran.com) ─────────────────────────────── */}
        <article>
        <header className="mb-4 rounded-2xl bg-slate-100 px-4 py-5 sm:mb-6 sm:px-7 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <span
              className="shrink-0 self-start font-arabic text-4xl font-bold leading-none text-slate-900 sm:text-5xl"
              dir="rtl"
              lang="ar"
            >
              {arabicName}
            </span>
            <div className="min-w-0 sm:max-w-xl sm:text-right">
              <h1 className="text-lg font-bold leading-snug text-slate-900 sm:text-xl">
                {page > 1
                  ? `${surahNumber}. Surah ${surah.nameSimple} – Verses ${range.start}–${range.end}`
                  : `${surahNumber}. Surah ${surah.nameSimple}`}
              </h1>
              {SURAH_MEANINGS[surahNumber] && (
                <p className="mt-0.5 text-sm text-slate-500">{SURAH_MEANINGS[surahNumber]}</p>
              )}
              <p className="mt-3 hidden text-sm leading-relaxed text-slate-500 sm:block">
                {page > 1
                  ? `Continue reading Surah ${surah.nameSimple} verses ${range.start}–${range.end} with translation and audio.`
                  : `Read and listen to Surah ${surah.nameSimple} with translation, tafsir, audio recitation, word-by-word meaning, and transliteration. ${ayahCount} verses.`}
              </p>
            </div>
          </div>
          <div className="mt-5 border-t border-slate-200/80 pt-4">
            <ChapterControls
              translationCount={translationCount}
              surahNumber={surahNumber}
              surahName={surah.nameSimple}
            />
          </div>
        </header>

        {/* ── Bismillah ────────────────────────────────────────────────── */}
        {surahNumber !== 9 && surahNumber !== 1 && page === 1 && <ReaderBismillah />}

        {page > 1 && (
          <div className="mb-6 flex justify-center">
            <Link
              href={surahPath}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:border-[var(--accent)] hover:text-[var(--accent)]"
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

      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="font-serif text-2xl font-bold text-slate-900">QuranPilot</p>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">Read, listen, search, and reflect on the Quran with accessible translations, tafsir, recitations, and study tools.</p>
            <p className="mt-6 text-xs text-slate-400">© {new Date().getFullYear()} QuranPilot. Built for guidance and wisdom.</p>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Navigate</h2>
            <div className="mt-3 grid gap-2 text-sm text-slate-500">
              <Link href="/">Home</Link><Link href="/surahs">Read Quran</Link><Link href="/learning-plans">Learning Plans</Link><Link href="/settings">Settings</Link>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Popular Links</h2>
            <div className="mt-3 grid gap-2 text-sm text-slate-500">
              <Link href={getSurahPath(36)}>Ya-Sin</Link><Link href={getSurahPath(67)}>Al-Mulk</Link><Link href={getSurahPath(55)}>Ar-Rahman</Link><Link href={getSurahPath(18)}>Al-Kahf</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
