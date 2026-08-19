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
      className="mt-8 flex flex-col items-center gap-3 border-t border-line pt-6"
    >
      <p className="text-xs text-ink-muted">
        Verses {start}–{end} of {ayahCount}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {prev != null ? (
          <Link
            href={surahPageHref(path, prev)}
            rel="prev"
            className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink-2 hover:border-emerald-800/40 hover:text-brand"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-xl border border-transparent px-3 py-2 text-sm text-ink-faint">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </span>
        )}
        <span className="px-2 text-sm font-medium text-ink-3">
          {page} / {totalPages}
        </span>
        {next != null ? (
          <Link
            href={surahPageHref(path, next)}
            rel="next"
            className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink-2 hover:border-emerald-800/40 hover:text-brand"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-xl border border-transparent px-3 py-2 text-sm text-ink-faint">
            Next
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}
