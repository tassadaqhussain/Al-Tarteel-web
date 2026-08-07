'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import type { Surah } from '@/lib/api';
import { getSurahArabicName, getSurahMeaning, getSurahPath } from '@/lib/surah-meta';
import { cn } from '@/lib/utils';

type Tab = 'surah' | 'juz' | 'revelation';

const JUZ_START_SURAHS = [
  1, 2, 2, 3, 4, 4, 5, 6, 7, 8, 9, 11, 12, 15, 17, 18, 21, 23, 25, 27, 29, 33, 36, 39, 41, 46, 51, 58, 67, 78,
];

export function SurahGrid({ surahs }: { surahs: Surah[] }) {
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
    <section className="w-full px-4 py-12 md:px-6">
      <div className="mx-auto max-w-[1200px]">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Let&apos;s start the journey of <br className="sm:hidden" />
            <span className="text-emerald-800">Enlightenment</span>
          </h2>
        </div>

        {/* Filter Toolbar */}
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
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
                onClick={() => {
                  setTab(id);
                  setSearchQuery(''); // reset search on tab change
                }}
                className={cn(
                  'rounded-full px-4 py-2 text-xs font-bold transition-all duration-200',
                  tab === id
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Inline search bar on the right */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Type surah name, page or verse..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-emerald-800/40 focus:ring-4 focus:ring-emerald-800/5"
            />
          </div>
        </div>

        {/* Grid Area */}
        {tab === 'juz' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 30 }, (_, i) => i + 1)
              .filter((juz) => searchQuery === '' || `juz ${juz}`.includes(searchQuery.toLowerCase()) || juz.toString() === searchQuery)
              .map((juz) => {
                const startSurah = JUZ_START_SURAHS[juz - 1];
                const surah = surahs.find((s) => s.number === startSurah);
                return (
                  <Link
                    key={juz}
                    href={`/juz/${juz}`}
                    className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-emerald-800/30 hover:shadow-lg hover:-translate-y-0.5"
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {filteredSurahs.map((surah) => {
              const meaning = getSurahMeaning(surah.number);
              // Make Surah 2 Al-Baqarah styled as the "Active" card by default to match visual mockup layout
              const isActiveMock = surah.number === 2;

              return (
                <Link
                  key={surah.number}
                  href={getSurahPath(surah.number)}
                  className={cn(
                    'group flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5',
                    isActiveMock
                      ? 'bg-emerald-800 text-white border-transparent shadow-md'
                      : 'border border-slate-200 bg-white hover:border-emerald-800/30'
                  )}
                >
                  <DiamondNumber n={surah.number} isActive={isActiveMock} />
                  
                  <div className="min-w-0 flex-1">
                    <h3 className={cn(
                      'truncate font-bold',
                      isActiveMock ? 'text-white' : 'text-slate-800 group-hover:text-emerald-800'
                    )}>
                      {surah.number.toString().padStart(2, '0')}. {surah.nameSimple}
                    </h3>
                    <p className={cn(
                      'truncate text-xs',
                      isActiveMock ? 'text-emerald-100' : 'text-slate-400 transition-colors group-hover:text-emerald-800/70'
                    )}>
                      {meaning || surah.revelationPlace}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className={cn(
                      'font-arabic text-lg leading-none',
                      isActiveMock ? 'text-white' : 'text-slate-800'
                    )} dir="rtl" lang="ar">
                      {getSurahArabicName(surah.number, surah.nameArabic)}
                    </p>
                    <p className={cn(
                      'mt-1.5 text-xs',
                      isActiveMock ? 'text-emerald-200' : 'text-slate-400'
                    )}>
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
