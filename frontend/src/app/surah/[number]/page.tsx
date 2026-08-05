import Link from 'next/link';
import { notFound } from 'next/navigation';
import { quranApi } from '@/lib/api';
import { AyahBlock } from '@/components/reader/AyahBlock';
import { Header } from '@/components/Header';
import { ReadingTracker } from '@/components/reader/ReadingTracker';
import { ReaderToolbar } from '@/components/reader/ReaderToolbar';
import { ChevronLeft, ChevronRight, RotateCcw, BookMarked } from 'lucide-react';
import { ChapterControls } from '@/components/reader/ChapterControls';
import { SURAH_MEANINGS } from '@/lib/surah-meta';

interface Props {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ page?: string; trans?: string }>;
}

export async function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({ number: String(i + 1) }));
}

export async function generateMetadata({ params }: Props) {
  const { number } = await params;
  const n = parseInt(number, 10);
  if (Number.isNaN(n) || n < 1 || n > 114) return {};
  const surah = await quranApi.surah(n).catch(() => null);
  if (!surah) return {};
  return {
    title: `${surah.nameSimple} (${surah.nameArabic})`,
    description: `Read Surah ${surah.nameSimple} — ${surah.numberOfAyahs} verses of the Holy Quran with translation and audio.`,
    openGraph: {
      title: `${surah.nameSimple} — QuranPilot`,
      description: `Read Surah ${surah.nameSimple} in Uthmani script with translation and verse-by-verse audio.`,
    },
  };
}

export default async function SurahPage({ params, searchParams }: Props) {
  const { number } = await params;
  const { page: pageStr, trans } = await searchParams;
  const surahNumber = parseInt(number, 10);
  if (Number.isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) notFound();

  const page = Math.max(1, parseInt(pageStr || '1', 10));
  const limit = 20;
  const effectiveTranslations = trans || 'en-sahih-international';

  const [surah, ayahs, prevSurah, nextSurah] = await Promise.all([
    quranApi.surah(surahNumber).catch(() => null),
    quranApi.ayahsBySurah(surahNumber, {
      page,
      limit,
      translations: effectiveTranslations,
      words: true,
    }).catch(() => []),
    surahNumber > 1 ? quranApi.surah(surahNumber - 1).catch(() => null) : Promise.resolve(null),
    surahNumber < 114 ? quranApi.surah(surahNumber + 1).catch(() => null) : Promise.resolve(null),
  ]);

  if (!surah) notFound();

  const totalPages = Math.ceil(surah.numberOfAyahs / limit);
  const firstAyah = Array.isArray(ayahs) && ayahs.length > 0 ? ayahs[0].number : 1;
  const translationCount = effectiveTranslations.split(',').filter(Boolean).length;
  const isLastPage = page === totalPages;

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-32">
      <Header />

      {/* Surah sub-header */}
      <div className="sticky top-[57px] z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:grid-cols-3">
          <div className="flex items-center gap-2 text-sm">
            {surahNumber > 1 && (
              <Link
                href={`/surah/${surahNumber - 1}`}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
                aria-label="Previous surah"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
            )}
            <span className="font-semibold text-slate-800">{surahNumber}. {surah.nameSimple}</span>
            {surahNumber < 114 && (
              <Link
                href={`/surah/${surahNumber + 1}`}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
                aria-label="Next surah"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
          <div className="hidden justify-center text-sm text-slate-500 lg:flex">Page {firstAyah ? ayahs[0]?.page || '—' : '—'} &nbsp; Juz {ayahs[0]?.juz || '—'} / Hizb {ayahs[0]?.hizb || '—'}</div>
          <div className="justify-self-end"><ReaderToolbar activeTranslationCount={translationCount} urlHasTranslations={Boolean(trans)} surahNumber={surahNumber} /></div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <ReadingTracker
          surahNumber={surahNumber}
          surahName={surah.nameSimple}
          surahNameArabic={surah.nameArabic}
          firstAyahNumber={firstAyah}
        />

        {/* ── Surah header ─────────────────────────────────────────────── */}
        <div className="mb-5 rounded-2xl bg-slate-100 px-6 py-5 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:text-left">
          <div className="flex items-center gap-4">
            <span className="font-arabic text-5xl font-bold leading-relaxed text-slate-900">{surah.nameArabic}</span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{surahNumber}. Surah {surah.nameSimple} <span className="font-normal text-slate-500">{SURAH_MEANINGS[surahNumber]}</span></h1>
              <p className="mt-0.5 text-xs text-slate-500">Read and listen with translation, tafsir, audio recitation, and word-by-word meaning.</p>
            </div>
          </div>
          <div className="mt-5 sm:mt-0"><ChapterControls translationCount={translationCount} /></div>
        </div>

        {/* ── Bismillah ────────────────────────────────────────────────── */}
        {surahNumber !== 9 && surahNumber !== 1 && page === 1 && (
          <div className="mb-5 py-4 text-center">
            <p className="font-arabic text-3xl leading-loose text-[var(--muted)]">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">In the Name of Allah—the Most Compassionate, Most Merciful</p>
          </div>
        )}

        {/* ── Ayahs ────────────────────────────────────────────────────── */}
        <div className="divide-y divide-slate-200 border-t border-slate-200">
          {Array.isArray(ayahs) &&
            ayahs.map((ayah) => (
              <AyahBlock
                key={ayah.id}
                ayah={ayah}
                surahNumber={surahNumber}
                surahName={surah.nameSimple}
                hasTranslations={translationCount > 0}
              />
            ))}
        </div>

        {/* ── Pagination ───────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Pagination">
            {page > 1 && (
              <Link
                href={`/surah/${surahNumber}?page=${page - 1}${trans ? `&trans=${trans}` : ''}`}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--fg)] hover:bg-[var(--ayah-highlight)] transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Link>
            )}
            <span className="text-sm text-[var(--muted)]">Page {page} of {totalPages}</span>
            {page < totalPages && (
              <Link
                href={`/surah/${surahNumber}?page=${page + 1}${trans ? `&trans=${trans}` : ''}`}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--fg)] hover:bg-[var(--ayah-highlight)] transition-colors"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </nav>
        )}

        {/* ── End of chapter ───────────────────────────────────────────── */}
        {isLastPage && (
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
                  href={`/surah/${prevSurah.number}`}
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
                    <p className="font-arabic text-sm text-[var(--muted)]">{prevSurah.nameArabic}</p>
                  </div>
                  <ChevronLeft className="h-4 w-4 flex-none text-[var(--muted)] transition-transform group-hover:-translate-x-0.5 group-hover:text-[var(--accent)]" />
                </Link>
              )}

              {nextSurah && (
                <Link
                  href={`/surah/${nextSurah.number}`}
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
                    <p className="font-arabic text-sm text-[var(--muted)]">{nextSurah.nameArabic}</p>
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
                <Link href="/reading-goal" className="mt-4 inline-flex rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white">Set a Custom Goal</Link>
              </div>
            </div>

            {/* Quick actions */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/surah/${surahNumber}`}
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
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-teal-300">Learn about Surah {surah.nameSimple}</p>
              <div className="mt-3 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-serif text-4xl font-bold sm:text-5xl">The Ultimate Refuge</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Seek guidance in the One who protects every heart through a focused Quran learning plan.</p>
                </div>
                <Link href="/learning-plans" className="shrink-0 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white">Start Now</Link>
              </div>
            </section>
          </div>
        )}
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
              <Link href="/surah/36">Ya-Sin</Link><Link href="/surah/67">Al-Mulk</Link><Link href="/surah/55">Ar-Rahman</Link><Link href="/surah/18">Al-Kahf</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
