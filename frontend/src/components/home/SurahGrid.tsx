'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Layers3, Search, SortAsc } from 'lucide-react';
import type { Surah } from '@/lib/api';
import { getSurahArabicName, getSurahMeaning, getSurahPath } from '@/lib/surah-meta';
import { cn } from '@/lib/utils';
import { SITE_SHELL } from '@/components/layout/MainContainer';

type Tab = 'surah' | 'juz' | 'revelation';

const JUZ_START_SURAHS = [
  1, 2, 2, 3, 4, 4, 5, 6, 7, 8, 9, 11, 12, 15, 17, 18, 21, 23, 25, 27, 29, 33, 36, 39, 41, 46, 51, 58, 67, 78,
];

export function SurahGrid({ surahs, embedded = false }: { surahs: Surah[]; embedded?: boolean }) {
  const [tab, setTab] = useState<Tab>('surah');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter & Sort
  const filteredSurahs = useMemo(() => {
    let list = [...surahs];
    
    // Search filter
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (s) =>
          s.number.toString() === query ||
          s.nameSimple.toLowerCase().includes(query) ||
          (s.nameArabic && s.nameArabic.includes(query))
      );
    }

    // Sort Order based on Tab
    if (tab === 'revelation') {
      list.sort((a, b) => {
        const ao = a.revelationOrder ?? a.number;
        const bo = b.revelationOrder ?? b.number;
        return ao - bo;
      });
    } else {
      list.sort((a, b) => a.number - b.number);
    }
    return list;
  }, [surahs, tab, searchQuery]);

  return (
    <section data-surah-browser className="w-full py-8 md:py-10">
      <div className={embedded ? 'w-full' : SITE_SHELL}>
        {/* Filter Toolbar */}
        <div className="mb-5 rounded border border-emerald-900/10 bg-white p-4 shadow-sm sm:p-5">
          <div data-surah-toolbar className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                Browse chapters
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Choose a Surah, Juz, or revelation order.
              </p>
            </div>

          {/* Tabs */}
            <div data-surah-toolbar-controls className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1">
                {(
                  [
                    ['surah', 'Surah', BookOpen],
                    ['juz', 'Juz', Layers3],
                    ['revelation', 'Order', SortAsc],
                  ] as const
                ).map(([id, label, Icon]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setTab(id);
                      setSearchQuery('');
                    }}
                    className={cn(
                      'inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-bold transition',
                      tab === id
                        ? 'bg-emerald-900 text-white shadow-sm'
                        : 'text-slate-500 hover:bg-white hover:text-slate-800'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {label}
                  </button>
                ))}
              </div>

          {/* Inline search bar on the right */}
              <div data-surah-search className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search surah name or number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 w-full rounded border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-emerald-800/40 focus:ring-4 focus:ring-emerald-800/5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Grid Area */}
        {tab === 'juz' ? (
          <div data-surah-grid className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 30 }, (_, i) => i + 1)
              .filter((juz) => searchQuery === '' || `juz ${juz}`.includes(searchQuery.toLowerCase()) || juz.toString() === searchQuery)
              .map((juz) => {
                const startSurah = JUZ_START_SURAHS[juz - 1];
                const surah = surahs.find((s) => s.number === startSurah);
                return (
                  <Link
                    key={juz}
                    href={`/juz/${juz}`}
                    className="group flex min-h-[96px] items-center gap-4 rounded border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-800/30 hover:shadow-md"
                  >
                    <DiamondNumber n={juz} isActive={false} />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-800 transition group-hover:text-emerald-800">Juz {juz}</h3>
                      <p className="truncate text-xs text-slate-400">
                        Starts at {surah?.nameSimple || `Surah ${startSurah}`}
                      </p>
                    </div>
                  </Link>
                );
              })}
          </div>
        ) : (
          <div data-surah-grid className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSurahs.map((surah) => {
              const meaning = getSurahMeaning(surah.number);

              return (
                <Link
                  key={surah.number}
                  href={getSurahPath(surah.number)}
                  className="group flex min-h-[96px] items-center gap-4 rounded border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-800/30 hover:shadow-md"
                >
                  <DiamondNumber n={surah.number} isActive={false} />

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-slate-800 group-hover:text-emerald-800">
                      {surah.number.toString().padStart(2, '0')}. {surah.nameSimple}
                    </h3>
                    <p className="truncate text-xs text-slate-400 transition-colors group-hover:text-emerald-800/70">
                      {meaning || surah.revelationPlace}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-arabic text-lg leading-none text-slate-800" dir="rtl" lang="ar">
                      {getSurahArabicName(surah.number, surah.nameArabic)}
                    </p>
                    <p className="mt-1.5 text-xs text-slate-400">
                      {surah.numberOfAyahs} verses
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

interface DiamondProps {
  n: number;
  isActive: boolean;
}

function DiamondNumber({ n, isActive }: DiamondProps) {
  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
      <div className={cn(
        'absolute inset-1 rotate-45 rounded-[3px] border transition-colors duration-200',
        isActive
          ? 'border-emerald-600 bg-emerald-900/40'
          : 'border-slate-200 bg-slate-50 group-hover:border-emerald-800 group-hover:bg-emerald-800'
      )} />
      <span className={cn(
        'relative text-sm font-semibold transition-colors duration-200',
        isActive
          ? 'text-white'
          : 'text-slate-700 group-hover:text-white'
      )}>
        {n}
      </span>
    </div>
  );
}
