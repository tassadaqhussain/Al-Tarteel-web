import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getSurahArabicName, getSurahMeta, getSurahPath } from '@/lib/surah-meta';
import { getSurahAyahCount } from '@/lib/surah-pagination';
import { PageSection } from '@/components/layout/MainContainer';
import { Msg } from '@/components/i18n/Msg';

const POPULAR_SURAH_NUMBERS = [1, 2, 18, 36, 55, 56, 67, 78, 112];

export function PopularSurahsRow() {
  return (
    <PageSection>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8A5E14] dark:text-amber-300">
            Frequently Recited
          </p>
          <h2 className="mt-1 font-serif text-[26px] font-bold tracking-tight text-ink">
            <Msg k="popularSurahs" />
          </h2>
        </div>
        <Link
          href="/surahs"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:underline"
        >
          <span><Msg k="all114Surahs" /></span>
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {POPULAR_SURAH_NUMBERS.map((num) => {
          const meta = getSurahMeta(num);
          const arabic = getSurahArabicName(num, meta.nameArabic);
          const verses = getSurahAyahCount(num);
          return (
            <Link
              key={num}
              href={getSurahPath(num)}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-md"
            >
              <div className="flex min-w-0 items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#B4832E]/25 bg-[#FAF6EC] text-xs font-bold text-[#8A5E14] transition-colors group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-brand-contrast dark:border-amber-400/20 dark:bg-surface-2 dark:text-amber-300">
                  {String(num).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-ink group-hover:text-[var(--accent)]">
                    {meta.nameSimple}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-muted">
                    {meta.meaning && meta.meaning.toLowerCase() !== meta.nameSimple.toLowerCase()
                      ? `${meta.meaning} · `
                      : ''}
                    {verses} verses
                  </p>
                </div>
              </div>
              <span
                className="shrink-0 font-arabic text-2xl leading-none text-ink-2 transition-colors group-hover:text-[var(--accent)]"
                dir="rtl"
                lang="ar"
              >
                {arabic}
              </span>
            </Link>
          );
        })}
      </div>
    </PageSection>
  );
}
