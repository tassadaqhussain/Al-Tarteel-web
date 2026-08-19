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

export function SurahGrid({
  surahs,
  embedded = false,
  showHeader = true,
  showTabs = true,
  sectionTitle = 'Browse chapters',
  sectionSubtitle = 'Choose a Surah, Juz, or revelation order.',
}: {
  surahs: Surah[];
  embedded?: boolean;
  showHeader?: boolean;
  showTabs?: boolean;
  sectionTitle?: string;
  sectionSubtitle?: string;
}) {
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
        {showHeader && (
          <div className="mb-5 rounded border border-line bg-surface p-4 shadow-sm sm:p-5">
            <div data-surah-toolbar className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                  {sectionTitle}
                </h2>
                <p className="mt-1 text-sm font-medium text-ink-muted">
                  {sectionSubtitle}
                </p>
              </div>

              {showTabs && (
                <div data-surah-toolbar-controls className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="grid grid-cols-3 gap-1 rounded-2xl bg-surface-3 p-1">
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
                            ? 'bg-brand text-brand-contrast shadow-sm'
                            : 'text-ink-muted hover:bg-surface hover:text-ink'
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden />
                        {label}
                      </button>
                    ))}
                  </div>

                  <div data-surah-search className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                    <input
                      type="text"
                      placeholder="Search surah name or number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-full border border-line bg-surface py-2 pl-9 pr-4 text-xs text-ink placeholder-ink-faint outline-none transition focus:border-brand/50 focus:ring-4 focus:ring-brand/10"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
                    className="group flex min-h-[96px] items-center gap-4 rounded border border-line bg-surface p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md"
                  >
                    <DiamondNumber n={juz} isActive={false} />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-ink transition group-hover:text-brand">Juz {juz}</h3>
                      <p className="truncate text-xs text-ink-faint">
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
                  className="group flex min-h-[96px] items-center gap-4 rounded border border-line bg-surface p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md"
                >
                  <DiamondNumber n={surah.number} isActive={false} />

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-ink group-hover:text-brand">
                      {surah.number.toString().padStart(2, '0')}. {surah.nameSimple}
                    </h3>
                    <p className="truncate text-xs text-ink-faint transition-colors group-hover:text-brand/70">
                      {meaning || surah.revelationPlace}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-arabic text-lg leading-none text-ink" dir="rtl" lang="ar">
                      {getSurahArabicName(surah.number, surah.nameArabic)}
                    </p>
                    <p className="mt-1.5 text-xs text-ink-faint">
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
          ? 'border-brand bg-brand'
          : 'border-line bg-surface-2 group-hover:border-brand group-hover:bg-brand'
      )} />
      <span className={cn(
        'relative text-sm font-semibold transition-colors duration-200',
        isActive
          ? 'text-brand-contrast'
          : 'text-ink-2 group-hover:text-brand-contrast'
      )}>
        {n}
      </span>
    </div>
  );
}
