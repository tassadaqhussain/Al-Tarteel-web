'use client';

import { Suspense, useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Filter,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { searchApi, type SearchAyahResult, type SearchTranslationResult } from '@/lib/api';
import { highlightText } from '@/lib/highlight';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const POPULAR = ['Ayat Al-Kursi', 'Al-Fatiha', 'Rahman', 'Tawakkul', 'Sabr', 'Taqwa'];
const RECENT_KEY = 'al-tarteel-recent-searches';
const MAX_RECENT = 8;

type Tab = 'all' | 'arabic' | 'translation';

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'); } catch { return []; }
}
function addRecent(q: string) {
  try {
    const prev = getRecent().filter((s) => s !== q);
    localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev].slice(0, MAX_RECENT)));
  } catch {}
}
function clearRecent() {
  try { localStorage.removeItem(RECENT_KEY); } catch {}
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7] text-slate-500">
          Loading search…
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQ);
  const [committed, setCommitted] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [loading, setLoading] = useState(false);
  const [ayahs, setAyahs] = useState<SearchAyahResult[]>([]);
  const [translations, setTranslations] = useState<SearchTranslationResult[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [surahFilter, setSurahFilter] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches on mount
  useEffect(() => { setRecent(getRecent()); }, []);

  // Sync when landing from homepage topic / search links
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    if (q && q !== query) setQuery(q);
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search — fires 400ms after user stops typing
  useEffect(() => {
    if (!query.trim()) {
      setAyahs([]);
      setTranslations([]);
      setCommitted('');
      return;
    }
    const t = setTimeout(() => runSearch(query), 400);
    return () => clearTimeout(t);
  }, [query, surahFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setCommitted(q.trim());
    try {
      const surahNum = surahFilter ? parseInt(surahFilter, 10) : undefined;
      const [a, t] = await Promise.all([
        searchApi.ayahs(q, { limit: 30, surah: surahNum }),
        searchApi.translations(q, { limit: 30 }),
      ]);
      setAyahs(Array.isArray(a) ? a : []);
      setTranslations(Array.isArray(t) ? t : []);
      addRecent(q.trim());
      setRecent(getRecent());
    } catch {
      setAyahs([]);
      setTranslations([]);
    } finally {
      setLoading(false);
    }
  }, [surahFilter]);

  const selectRecent = (q: string) => {
    setQuery(q);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    setQuery('');
    setAyahs([]);
    setTranslations([]);
    setCommitted('');
    inputRef.current?.focus();
  };

  const hasResults = ayahs.length > 0 || translations.length > 0;
  const showEmpty = committed && !loading && !hasResults;

  const visibleAyahs = tab === 'translation' ? [] : ayahs;
  const visibleTranslations = tab === 'arabic' ? [] : translations;

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-16">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Search bar */}
        <div className="relative mb-6">
          <div className={cn(
            'flex items-center gap-3 rounded-2xl border bg-[var(--surface)] px-4 py-3 transition-all',
            committed ? 'border-[var(--accent)]' : 'border-[var(--border)]'
          )}>
            {loading
              ? <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[var(--accent)]" />
              : <Search className="h-5 w-5 shrink-0 text-[var(--muted)]" />
            }
            <input
              ref={inputRef}
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && query.trim()) runSearch(query); }}
              placeholder="Search in Arabic or English…"
              className="flex-1 bg-transparent text-base text-[var(--fg)] placeholder:text-[var(--muted)] focus:outline-none"
              aria-label="Search the Quran"
            />
            <div className="flex items-center gap-2">
              {query && (
                <button type="button" onClick={clearSearch} className="text-[var(--muted)] hover:text-[var(--fg)]" aria-label="Clear">
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className={cn(
                  'flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors',
                  showFilters ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'text-[var(--muted)] hover:bg-[var(--ayah-highlight)]'
                )}
              >
                <Filter className="h-3.5 w-3.5" />
                Filters
              </button>
            </div>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-[var(--muted)]">Surah</label>
                  <input
                    type="number"
                    min={1}
                    max={114}
                    value={surahFilter}
                    onChange={(e) => setSurahFilter(e.target.value)}
                    placeholder="1–114"
                    className="w-20 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 text-sm text-[var(--fg)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
                {surahFilter && (
                  <button
                    type="button"
                    onClick={() => setSurahFilter('')}
                    className="text-xs text-[var(--muted)] hover:text-[var(--accent)]"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pre-search state: recent + popular */}
        {!committed && !loading && (
          <div className="space-y-8">
            {recent.length > 0 && (
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--fg)]">
                    <Clock className="h-4 w-4 text-[var(--muted)]" />
                    Recent searches
                  </div>
                  <button
                    type="button"
                    onClick={() => { clearRecent(); setRecent([]); }}
                    className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => selectRecent(r)}
                      className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--fg)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                    >
                      <Clock className="h-3 w-3 text-[var(--muted)]" />
                      {r}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--fg)]">
                <TrendingUp className="h-4 w-4 text-[var(--muted)]" />
                Popular searches
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setQuery(p)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-[var(--border)] p-4">
                <Skeleton className="mb-2 h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {committed && !loading && hasResults && (
          <>
            {/* Tabs + result count */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
                {(['all', 'arabic', 'translation'] as Tab[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                      tab === t
                        ? 'bg-[var(--accent)] text-white'
                        : 'text-[var(--muted)] hover:text-[var(--fg)]'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-sm text-[var(--muted)]">
                {ayahs.length + translations.length} results
              </p>
            </div>

            {/* Arabic results */}
            {visibleAyahs.length > 0 && (
              <section className="mb-6">
                {tab === 'all' && (
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Arabic · {ayahs.length}
                  </p>
                )}
                <div className="space-y-2">
                  {visibleAyahs.map((a) => (
                    <Link
                      key={`${a.surah.number}-${a.number}`}
                      href={`/surah/${a.surah.number}#ayah-${a.id}`}
                      className="group block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--ayah-highlight)]"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded border border-[var(--border)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]">
                          {a.surah.nameSimple} · {a.number}
                        </span>
                        <span className="font-arabic text-sm text-[var(--muted)]">{a.surah.nameArabic}</span>
                      </div>
                      <p className="font-arabic ayah-arabic text-xl leading-loose text-[var(--fg)] group-hover:text-[var(--fg)]" lang="ar" dir="rtl">
                        {highlightText(a.textUthmani, committed)}
                      </p>
                      {a.translations?.length > 0 && (
                        <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
                          {highlightText(a.translations[0].text.slice(0, 140), committed)}
                          {a.translations[0].text.length > 140 && '…'}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Translation results */}
            {visibleTranslations.length > 0 && (
              <section>
                {tab === 'all' && (
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Translations · {translations.length}
                  </p>
                )}
                <div className="space-y-2">
                  {visibleTranslations.map((t) => (
                    <Link
                      key={`${t.ayahId}-${t.translator.slug}`}
                      href={`/surah/${t.surah.number}#ayah-${t.ayahId}`}
                      className="group block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--ayah-highlight)]"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded border border-[var(--border)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]">
                          {t.surah.nameSimple} · {t.ayahNumber}
                        </span>
                        <span className="text-xs text-[var(--muted)]">{t.translator.name}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-[var(--fg)]">
                        {highlightText(t.text, committed)}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Empty state */}
        {showEmpty && (
          <div className="flex flex-col items-center py-16 text-center">
            <Search className="mb-4 h-10 w-10 text-[var(--border)]" />
            <p className="text-lg font-medium text-[var(--fg)]">No results found</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Try a different spelling or search in both Arabic and English.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
