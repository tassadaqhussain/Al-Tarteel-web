import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { surahPageHref, surahVerseRange } from '@/lib/surah-pagination';

type Props = {
  path: string;
  page: number;
  totalPages: number;
  ayahCount: number;
  surahName: string;
};

/** Crawlable HTML pagination for long surah verse slices. */
export function SurahPaginationNav({ path, page, totalPages, ayahCount, surahName }: Props) {
  if (totalPages <= 1) return null;

  const { start, end } = surahVerseRange(page, ayahCount);
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav
      aria-label={`${surahName} verse pages`}
      className="mt-8 flex flex-col items-center gap-3 border-t border-slate-200 pt-6"
    >
      <p className="text-xs text-slate-500">
        Verses {start}–{end} of {ayahCount}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {prev != null ? (
          <Link
            href={surahPageHref(path, prev)}
            rel="prev"
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-emerald-800/40 hover:text-emerald-800"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-xl border border-transparent px-3 py-2 text-sm text-slate-300">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </span>
        )}
        <span className="px-2 text-sm font-medium text-slate-600">
          {page} / {totalPages}
        </span>
        {next != null ? (
          <Link
            href={surahPageHref(path, next)}
            rel="next"
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-emerald-800/40 hover:text-emerald-800"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-xl border border-transparent px-3 py-2 text-sm text-slate-300">
            Next
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}
