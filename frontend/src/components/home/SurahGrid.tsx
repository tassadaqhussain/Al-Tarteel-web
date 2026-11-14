'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronDown, ChevronUp, Layers3, Search, SortAsc, X } from 'lucide-react';
import type { Surah } from '@/lib/api';
import {
  getSurahArabicName,
  getSurahMeaning,
  getSurahPath,
  SURAH_SIMPLE_NAMES,
} from '@/lib/surah-meta';
import { cn } from '@/lib/utils';
import { SITE_SHELL } from '@/components/layout/MainContainer';
import { format } from '@/components/i18n/Msg';
import { useT } from '@/lib/i18n';

type Tab = 'surah' | 'juz' | 'revelation';

const JUZ_START_SURAHS = [
  1, 2, 2, 3, 4, 4, 5, 6, 7, 8, 9, 11, 12, 15, 17, 18, 21, 23, 25, 27, 29, 33, 36, 39, 41, 46, 51, 58, 67, 78,
];

function normalizeSearchToken(s: string): string {
  return s.toLowerCase().replace(/['’`-]/g, '').replace(/\s+/g, ' ').trim();
}

export function SurahGrid({
  surahs,
  embedded = false,
  showHeader = true,
  showTabs = true,
  collapsible = false,
  initialLimit = 24,
  sectionTitle,
  sectionSubtitle,
}: {
  surahs: Surah[];
  embedded?: boolean;
  showHeader?: boolean;
  showTabs?: boolean;
  collapsible?: boolean;
  initialLimit?: number;
  sectionTitle?: string;
  sectionSubtitle?: string;
}) {
  const { t } = useT();
  const [tab, setTab] = useState<Tab>('surah');
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  // Filter & Sort across all 114 surahs
  const filteredSurahs = useMemo(() => {
    let list = [...surahs];

    const rawQuery = searchQuery.trim().toLowerCase();
    const normQuery = normalizeSearchToken(rawQuery);
    if (rawQuery) {
      list = list.filter((s) => {
        const meaning = (getSurahMeaning(s.number) || '').toLowerCase();
        const normName = normalizeSearchToken(s.nameSimple);
        return (
          s.number.toString() === rawQuery ||
          s.nameSimple.toLowerCase().includes(rawQuery) ||
          normName.includes(normQuery) ||
          meaning.includes(rawQuery) ||
          (s.nameArabic && s.nameArabic.includes(rawQuery))
        );
      });
    }

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

  const isCollapsedView =
    collapsible && !expanded && !searchQuery.trim() && tab === 'surah' && filteredSurahs.length > initialLimit;
  const hiddenCount = isCollapsedView ? filteredSurahs.length - initialLimit : 0;

  return (
    <section data-surah-browser className="w-full py-8 md:py-10">
      <div className={embedded ? 'w-full' : SITE_SHELL}>
        {/* Filter Toolbar */}
        {showHeader && (
          <div className="mb-6 rounded-2xl border border-line bg-surface p-4 shadow-sm sm:p-5">
            <div data-surah-toolbar className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                  {sectionTitle ?? t('homeBrowseChapters')}
                </h2>
                <p className="mt-1 text-sm font-medium text-ink-muted">
                  {sectionSubtitle ?? t('homeBrowseChaptersSub')}
                </p>
              </div>

              {showTabs && (
                <div data-surah-toolbar-controls className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="grid grid-cols-3 gap-1 rounded-2xl bg-surface-3 p-1">
                    {(
                      [
                        ['surah', t('tabSurah'), BookOpen],
                        ['juz', t('tabJuz'), Layers3],
                        ['revelation', t('tabOrder'), SortAsc],
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
                      placeholder={t('searchSurahPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-full border border-line bg-surface py-2.5 pl-9 pr-9 text-xs text-ink placeholder-ink-faint outline-none transition focus:border-brand/50 focus:ring-4 focus:ring-brand/10"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear filter"
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-ink-faint hover:bg-surface-3 hover:text-ink"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Grid Area */}
        {tab === 'juz' ? (
          <div data-surah-grid className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 30 }, (_, i) => i + 1)
              .filter((juz) => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.trim().toLowerCase();
                const startSurah = JUZ_START_SURAHS[juz - 1];
                const surahName = (SURAH_SIMPLE_NAMES[startSurah] || '').toLowerCase();
                return (
                  `juz ${juz}`.includes(q) ||
                  `para ${juz}`.includes(q) ||
                  juz.toString() === q ||
                  surahName.includes(q)
                );
              })
              .map((juz) => {
                const startSurah = JUZ_START_SURAHS[juz - 1];
                const surah = surahs.find((s) => s.number === startSurah);
                const surahName = surah?.nameSimple || SURAH_SIMPLE_NAMES[startSurah] || `Surah ${startSurah}`;
                const arabicName = getSurahArabicName(startSurah, surah?.nameArabic);

                return (
                  <Link
                    key={juz}
                    href={`/juz/${juz}`}
                    className="group flex min-h-[88px] items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md"
                  >
                    <DiamondNumber n={juz} isActive={false} />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-ink transition group-hover:text-brand">
                        {format(t('juzN'), { n: juz })}
                      </h3>
                      <p className="truncate text-xs text-ink-faint">
                        Starts at {surahName}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-arabic text-lg leading-none text-ink" dir="rtl" lang="ar">
                        {arabicName}
                      </p>
                      <p className="mt-1.5 text-[11px] text-ink-faint">
                        Part {juz} of 30
                      </p>
                    </div>
                  </Link>
                );
              })}
          </div>
        ) : filteredSurahs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
            <p className="text-sm font-semibold text-ink">
              No surahs matched &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              Try searching by chapter number (1–114), name (e.g. Ya-Sin, Al-Kahf), or English meaning.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-bold text-brand-contrast shadow-sm transition hover:opacity-90"
            >
              Reset filter
            </button>
          </div>
        ) : (
          <>
            <div data-surah-grid className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredSurahs.map((surah, idx) => {
                const meaning = getSurahMeaning(surah.number);
                const isHiddenByCollapse = isCollapsedView && idx >= initialLimit;

                return (
                  <Link
                    key={surah.number}
                    href={getSurahPath(surah.number)}
                    className={cn(
                      'group flex min-h-[88px] items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md',
                      isHiddenByCollapse && 'hidden'
                    )}
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
                        {format(t('nVerses'), { n: surah.numberOfAyahs })}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {collapsible && !searchQuery.trim() && tab === 'surah' && filteredSurahs.length > initialLimit && (
              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-surface px-6 py-2.5 text-sm font-bold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-brand/50 hover:text-brand hover:shadow-md"
                >
                  {expanded ? (
                    <>
                      <span>Show fewer Surahs</span>
                      <ChevronUp className="h-4 w-4" aria-hidden />
                    </>
                  ) : (
                    <>
                      <span>Show all 114 Surahs ({hiddenCount} more)</span>
                      <ChevronDown className="h-4 w-4" aria-hidden />
                    </>
                  )}
                </button>
                <Link
                  href="/surahs"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-brand hover:underline"
                >
                  Open full Surah directory →
                </Link>
              </div>
            )}
          </>
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
      <div
        className={cn(
          'absolute inset-1 rotate-45 rounded-[4px] border transition-colors duration-200',
          isActive
            ? 'border-brand bg-brand'
            : 'border-line bg-surface-2 group-hover:border-brand group-hover:bg-brand'
        )}
      />
      <span
        className={cn(
          'relative text-sm font-semibold transition-colors duration-200',
          isActive
            ? 'text-brand-contrast'
            : 'text-ink-2 group-hover:text-brand-contrast'
        )}
      >
        {n}
      </span>
    </div>
  );
}
