import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { quranApi, type AyahWithRelations } from '@/lib/api';
import { Header } from '@/components/Header';
import { AyahBlock } from '@/components/reader/AyahBlock';
import { ReaderToolbar } from '@/components/reader/ReaderToolbar';
import { ReadingProgressBar } from '@/components/reader/ReadingProgressBar';
import { PinnedVersesBar } from '@/components/reader/PinnedVersesBar';
import { CompareVerseModal } from '@/components/reader/CompareVerseModal';
import { CleanTranslationUrl } from '@/components/reader/CleanTranslationUrl';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import { getSurahArabicName, getSurahPath } from '@/lib/surah-meta';
import { resolveTranslations, TRANSLATION_COOKIE } from '@/lib/translation-preference';
import { juzSeo } from '@/lib/seo';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

interface Props {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ page?: string; trans?: string }>;
}

export async function generateStaticParams() {
  return Array.from({ length: 30 }, (_, i) => ({ number: String(i + 1) }));
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { number } = await params;
  const { page: pageStr } = await searchParams;
  const n = parseInt(number, 10);
  if (Number.isNaN(n) || n < 1 || n > 30) return {};
  const page = Math.max(1, parseInt(pageStr || '1', 10) || 1);
  return juzSeo(n, page);
}

export const revalidate = 3600;

interface SurahGroup {
  surahId: number;
  surahName: string;
  surahNumber: number;
  ayahs: AyahWithRelations[];
}

export default async function JuzPage({ params, searchParams }: Props) {
  const { number } = await params;
  const { page: pageStr, trans } = await searchParams;
  const juzNumber = parseInt(number, 10);
  if (Number.isNaN(juzNumber) || juzNumber < 1 || juzNumber > 30) notFound();

  const page = Math.max(1, parseInt(pageStr || '1', 10));
  const limit = 50;
  const cookieStore = await cookies();
  const effectiveTranslations = resolveTranslations({
    cookieValue: cookieStore.get(TRANSLATION_COOKIE)?.value,
    queryTrans: trans,
  });

  const rawAyahs = await quranApi
    .ayahsByJuz(juzNumber, { page, limit, translations: effectiveTranslations, words: true })
    .catch(() => [] as AyahWithRelations[]);

  const ayahs: AyahWithRelations[] = Array.isArray(rawAyahs) ? rawAyahs : [];

  if (ayahs.length === 0) {
    notFound();
  }

  const hasMore = ayahs.length === limit;
  const translationCount = effectiveTranslations.split(',').filter(Boolean).length;

  // Group by surah for section headers
  const groupedBySurah: SurahGroup[] = [];
  for (const ayah of ayahs) {
    const last = groupedBySurah[groupedBySurah.length - 1];
    const surahNum = ayah.surah?.number ?? ayah.surahId;
    const surahName = ayah.surah?.nameSimple ?? `Surah ${surahNum}`;
    if (!last || last.surahId !== ayah.surahId) {
      groupedBySurah.push({ surahId: ayah.surahId, surahName, surahNumber: surahNum, ayahs: [ayah] });
    } else {
      last.ayahs.push(ayah);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-32 text-slate-900">
      <Header />

      {/* Sub-header */}
      <div className="relative sticky top-14 z-40 border-b border-slate-200 bg-white/95 backdrop-blur sm:top-[57px]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-1 text-sm text-[var(--accent)] transition-colors hover:text-[var(--accent)]">
            <ChevronLeft className="h-4 w-4" />
            Home
          </Link>
          <div className="flex items-center gap-2 text-sm">
            {juzNumber > 1 && (
              <Link href={`/juz/${juzNumber - 1}`} className="rounded px-2 py-1 text-slate-500 transition-colors hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]">←</Link>
            )}
            <span className="font-semibold text-slate-800">Juz {juzNumber}</span>
            {juzNumber < 30 && (
              <Link href={`/juz/${juzNumber + 1}`} className="rounded px-2 py-1 text-slate-500 transition-colors hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]">→</Link>
            )}
          </div>
          <span className="text-xs text-slate-500">of 30</span>
        </div>

        <div className="px-4 pb-3 sm:px-6">
          <ReaderToolbar
            activeTranslationCount={translationCount}
            surahNumber={groupedBySurah[0]?.surahNumber ?? 1}
          />
        </div>
        <ReadingProgressBar />
      </div>

      <PinnedVersesBar />
      <CompareVerseModal />
      <CleanTranslationUrl />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Surahs', path: '/surahs' },
            {
              name: page > 1 ? `Juz ${juzNumber} · Page ${page}` : `Juz ${juzNumber}`,
              path: page > 1 ? `/juz/${juzNumber}?page=${page}` : `/juz/${juzNumber}`,
            },
          ]}
        />

        {/* Juz heading */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-sm">
          <h1 className="font-arabic text-4xl font-bold text-slate-900">الجزء {juzNumber}</h1>
          <p className="mt-2 text-sm text-slate-600">
            Juz {juzNumber} · Part {juzNumber} of 30{page > 1 ? ` · Page ${page}` : ''}
          </p>
        </div>

        {/* Ayahs grouped by surah */}
        {groupedBySurah.map((group) => (
          <section key={group.surahId} className="mb-10">
            {/* Surah section divider */}
            <div className="mb-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-[var(--border)]" />
              <Link
                href={getSurahPath(group.surahNumber)}
                className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-sm font-medium text-[var(--fg)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
              >
                <span className="font-arabic" dir="rtl" lang="ar">{getSurahArabicName(group.ayahs[0]?.surah?.number ?? 0, group.ayahs[0]?.surah?.nameArabic ?? '')}</span>
                <span>{group.surahName}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>

            <div className="divide-y divide-slate-200 border-t border-slate-200">
              {group.ayahs.map((ayah) => (
                <AyahBlock
                  key={ayah.id}
                  ayah={ayah}
                  surahNumber={group.surahNumber}
                  surahName={group.surahName}
                  hasTranslations={translationCount > 0}
                />
              ))}
            </div>
          </section>
        ))}

        {/* Pagination */}
        <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
          {page > 1 && (
            <Link href={`/juz/${juzNumber}?page=${page - 1}`} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--fg)] hover:bg-[var(--ayah-highlight)] transition-colors">
              ← Previous
            </Link>
          )}
          {hasMore && (
            <Link href={`/juz/${juzNumber}?page=${page + 1}`} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--fg)] hover:bg-[var(--ayah-highlight)] transition-colors">
              Next →
            </Link>
          )}
        </nav>

        {/* Next juz */}
        {!hasMore && juzNumber < 30 && (
          <div className="mt-8 text-center">
            <Link href={`/juz/${juzNumber + 1}`} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-medium text-[var(--fg)] hover:border-[var(--accent)] hover:bg-[var(--ayah-highlight)] transition-all">
              Continue to Juz {juzNumber + 1}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
