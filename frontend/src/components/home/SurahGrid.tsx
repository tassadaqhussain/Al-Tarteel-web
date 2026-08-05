'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import type { Surah } from '@/lib/api';
import { getSurahMeaning } from '@/lib/surah-meta';
import { cn } from '@/lib/utils';

type Tab = 'surah' | 'juz' | 'revelation';
type SortDir = 'asc' | 'desc';

const JUZ_START_SURAHS = [
  1, 2, 2, 3, 4, 4, 5, 6, 7, 8, 9, 11, 12, 15, 17, 18, 21, 23, 25, 27, 29, 33, 36, 39, 41, 46, 51, 58, 67, 78,
];

export function SurahGrid({ surahs }: { surahs: Surah[] }) {
  const [tab, setTab] = useState<Tab>('surah');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const sortedSurahs = useMemo(() => {
    const list = [...surahs];
    if (tab === 'revelation') {
      list.sort((a, b) => {
        const ao = a.revelationOrder ?? a.number;
        const bo = b.revelationOrder ?? b.number;
        return sortDir === 'asc' ? ao - bo : bo - ao;
      });
    } else {
      list.sort((a, b) => (sortDir === 'asc' ? a.number - b.number : b.number - a.number));
    }
    return list;
  }, [surahs, tab, sortDir]);

  return (
    <section className="w-full px-3 py-4 sm:px-4 sm:py-5 md:px-6">
      <div className="mb-3 flex flex-col gap-3 border-b border-slate-200 sm:mb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex gap-4 overflow-x-auto sm:gap-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(
            [
              ['surah', 'Surah'],
              ['juz', 'Juz'],
              ['revelation', 'Revelation Order'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'shrink-0 pb-3 text-sm font-semibold transition',
                tab === id
                  ? 'border-b-2 border-slate-800 text-slate-800'
                  : 'border-b-2 border-transparent text-slate-400 hover:text-slate-600'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
          className="mb-1 inline-flex items-center gap-1 self-start text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:text-[var(--accent)] sm:mb-3 sm:self-auto"
        >
          Sort by: {sortDir === 'asc' ? 'Ascending' : 'Descending'}
          <ChevronDown
            className={cn('h-3.5 w-3.5 transition', sortDir === 'desc' && 'rotate-180')}
          />
        </button>
      </div>

      {tab === 'juz' ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => {
            const startSurah = JUZ_START_SURAHS[juz - 1];
            const surah = surahs.find((s) => s.number === startSurah);
            return (
              <Link
                key={juz}
                href={`/juz/${juz}`}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3.5 transition-colors duration-150 hover:border-[var(--accent)] sm:gap-4 sm:px-4 sm:py-4"
              >
                <DiamondNumber n={juz} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900">Juz {juz}</h3>
                  <p className="truncate text-xs text-slate-500 transition-colors group-hover:text-[var(--accent)]">
                    Starts at {surah?.nameSimple || `Surah ${startSurah}`}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3 2xl:grid-cols-4">
          {sortedSurahs.map((surah) => {
            const meaning = getSurahMeaning(surah.number);
            return (
              <Link
                key={surah.number}
                href={`/surah/${surah.number}`}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3.5 transition-colors duration-150 hover:border-[var(--accent)] sm:px-4 sm:py-4"
              >
                <DiamondNumber n={surah.number} />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-slate-900">{surah.nameSimple}</h3>
                  <p className="truncate text-xs text-slate-500 transition-colors group-hover:text-[var(--accent)]">
                    {meaning || surah.revelationPlace}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-arabic text-lg leading-none text-slate-700 sm:text-xl" dir="rtl" lang="ar">
                    {surah.nameArabic}
                  </p>
                  <p className="mt-1 text-xs text-slate-400 transition-colors group-hover:text-[var(--accent)]">
                    {surah.numberOfAyahs} Ayahs
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function DiamondNumber({ n }: { n: number }) {
  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
      <div className="absolute inset-1 rotate-45 rounded-[3px] border border-slate-200 bg-slate-50 transition-colors duration-150 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)]" />
      <span className="relative text-sm font-semibold text-slate-700 transition-colors duration-150 group-hover:text-white">
        {n}
      </span>
    </div>
  );
}
