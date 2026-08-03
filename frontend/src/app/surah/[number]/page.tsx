import Link from 'next/link';
import { notFound } from 'next/navigation';
import { quranApi } from '@/lib/api';
import { AyahBlock } from '@/components/reader/AyahBlock';
import { Header } from '@/components/Header';
import { ReadingTracker } from '@/components/reader/ReadingTracker';
import { ReaderToolbar } from '@/components/reader/ReaderToolbar';
import { ChevronLeft, ChevronRight, RotateCcw, BookMarked } from 'lucide-react';

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
      title: `${surah.nameSimple} — Al-Tarteel`,
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

  const [surah, ayahs, prevSurah, nextSurah] = await Promise.all([
    quranApi.surah(surahNumber).catch(() => null),
    quranApi.ayahsBySurah(surahNumber, {
      page,
      limit,
      translations: trans || undefined,
      words: true,
    }).catch(() => []),
    surahNumber > 1 ? quranApi.surah(surahNumber - 1).catch(() => null) : Promise.resolve(null),
    surahNumber < 114 ? quranApi.surah(surahNumber + 1).catch(() => null) : Promise.resolve(null),
  ]);

  if (!surah) notFound();

  const totalPages = Math.ceil(surah.numberOfAyahs / limit);
  const firstAyah = Array.isArray(ayahs) && ayahs.length > 0 ? ayahs[0].number : 1;
  const translationCount = trans ? trans.split(',').filter(Boolean).length : 0;
  const isLastPage = page === totalPages;

  return (
    <div className="min-h-screen pb-32">
      <Header />

      {/* Surah sub-header */}
      <div className="sticky top-[57px] z-40 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link
            href="/surahs"
            className="flex items-center gap-1 text-sm text-[var(--accent)] hover:text-[var(--accent-gold)] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Surahs
          </Link>
          <div className="flex items-center gap-2 text-sm">
            {surahNumber > 1 && (
              <Link
                href={`/surah/${surahNumber - 1}`}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--ayah-highlight)] transition-colors"
                aria-label="Previous surah"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
            )}
            <span className="min-w-[3rem] text-center font-semibold text-[var(--fg)]">
              {surahNumber} / 114
            </span>
            {surahNumber < 114 && (
              <Link
                href={`/surah/${surahNumber + 1}`}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--ayah-highlight)] transition-colors"
                aria-label="Next surah"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
          <Link href="/search" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">Search</Link>
        </div>

        <ReaderToolbar activeTranslationCount={translationCount} surahNumber={surahNumber} />
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <ReadingTracker surahNumber={surahNumber} surahName={surah.nameSimple} firstAyahNumber={firstAyah} />

        {/* ── Surah header ─────────────────────────────────────────────── */}
        <div className="mb-10 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--muted)]">
              {surah.revelationPlace === 'makkan' ? 'Makki' : 'Madani'}
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--muted)]">
              {surah.numberOfAyahs} verses
            </span>
            {surah.revelationOrder && (
              <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--muted)]">
                Revelation #{surah.revelationOrder}
              </span>
            )}
          </div>
          <h1 className="font-arabic text-5xl font-bold leading-relaxed text-[var(--fg)]">
            {surah.nameArabic}
          </h1>
          <p className="mt-2 text-xl font-semibold text-[var(--fg)]">{surah.nameSimple}</p>
          {surah.nameComplex && surah.nameComplex !== surah.nameSimple && (
            <p className="mt-0.5 text-sm text-[var(--muted)]">{surah.nameComplex}</p>
          )}
        </div>

        {/* ── Bismillah ────────────────────────────────────────────────── */}
        {surahNumber !== 9 && surahNumber !== 1 && page === 1 && (
          <div className="mb-10 rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-6 text-center">
            <p className="font-arabic text-3xl leading-loose text-[var(--muted)]">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">In the Name of Allah—the Most Compassionate, Most Merciful</p>
          </div>
        )}

        {/* ── Ayahs ────────────────────────────────────────────────────── */}
        <div className="divide-y divide-[var(--border)]">
          {Array.isArray(ayahs) &&
            ayahs.map((ayah) => (
              <AyahBlock
                key={ayah.id}
                ayah={ayah}
                surahNumber={surahNumber}
                surahName={surah.nameSimple}
                showTranslation={translationCount > 0}
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
            <div className="grid gap-4 sm:grid-cols-2">
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
          </div>
        )}
      </main>
    </div>
  );
}
