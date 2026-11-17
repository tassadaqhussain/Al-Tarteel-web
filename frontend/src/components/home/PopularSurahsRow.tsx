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
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="font-serif text-[26px] font-bold tracking-tight text-ink">
          <Msg k="popularSurahs" />
        </h2>
        <Link
          href="/surahs"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:underline"
        >
          <span><Msg k="all114Surahs" /></span>
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-2">
        {POPULAR_SURAH_NUMBERS.map((num) => {
          const meta = getSurahMeta(num);
          const arabic = getSurahArabicName(num, meta.nameArabic);
          const verses = getSurahAyahCount(num);
          return (
            <Link
              key={num}
              href={getSurahPath(num)}
              className="group flex w-60 shrink-0 snap-start flex-col justify-between rounded-2xl border border-line bg-surface p-4 transition hover:border-[var(--accent)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-7 min-w-[2rem] items-center justify-center rounded-full bg-[var(--accent)]/10 px-2 text-xs font-bold text-[var(--accent)]">
                  {String(num).padStart(2, '0')}
                </span>
                <span
                  className="font-arabic text-2xl leading-none text-ink"
                  dir="rtl"
                  lang="ar"
                >
                  {arabic}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-base font-bold text-ink group-hover:text-[var(--accent)]">
                  {meta.nameSimple}
                </p>
                <p className="mt-0.5 truncate text-xs text-ink-muted">
                  {meta.meaning && meta.meaning.toLowerCase() !== meta.nameSimple.toLowerCase()
                    ? `${meta.meaning} · `
                    : ''}
                  {verses} verses
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </PageSection>
  );
}
