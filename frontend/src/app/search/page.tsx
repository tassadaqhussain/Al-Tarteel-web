'use client';

import { Suspense, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  X,
  Clock,
  Sparkles,
  Filter,
  Loader2,
  BookOpen,
  ArrowRight,
  Compass,
  BookMarked,
  Hash,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { getSurahArabicName } from '@/lib/surah-meta';
import { searchApi, type SearchAyahResult, type SearchTranslationResult } from '@/lib/api';
import { highlightText } from '@/lib/highlight';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  correctSearchQuery,
  expandSearchVariants,
  getSearchSuggestions,
  type SearchSuggestion,
} from '@/lib/search-intelligence';

const POPULAR = [
  { label: 'Ayat al-Kursi', q: 'Ayat al-Kursi' },
  { label: 'Al-Fatihah', q: 'Al-Fatihah' },
  { label: 'Ya-Sin', q: 'Ya-Sin' },
  { label: 'Ar-Rahman', q: 'Ar-Rahman' },
  { label: 'Patience', q: 'patience' },
  { label: 'Guidance', q: 'guidance' },
];

const SUGGESTED_SURAHS = [
  { number: 1, name: 'Al-Fatihah' },
  { number: 2, name: 'Al-Baqarah' },
  { number: 18, name: 'Al-Kahf' },
  { number: 36, name: 'Ya-Sin' },
  { number: 55, name: 'Ar-Rahman' },
  { number: 67, name: 'Al-Mulk' },
];

const RECENT_KEY = 'al-tarteel-recent-searches';
const MAX_RECENT = 8;
/** Autosuggest after this many characters */
const SUGGEST_MIN_CHARS = 3;

type Tab = 'all' | 'arabic' | 'translation';

function getRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
  } catch {
    return [];
  }
}
function addRecent(q: string) {
  try {
    const prev = getRecent().filter((s) => s !== q);
    localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev].slice(0, MAX_RECENT)));
  } catch {
    /* ignore */
  }
}
function clearRecent() {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {
    /* ignore */
  }
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f4f7f6] text-slate-500">
          Loading search…
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQ);
  const [committed, setCommitted] = useState('');
  const [usedQuery, setUsedQuery] = useState('');
  const [correctedFrom, setCorrectedFrom] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('all');
  const [loading, setLoading] = useState(false);
  const [ayahs, setAyahs] = useState<SearchAyahResult[]>([]);
  const [translations, setTranslations] = useState<SearchTranslationResult[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [surahFilter, setSurahFilter] = useState('');
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeSuggest, setActiveSuggest] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecent(getRecent());
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    if (q && q !== query) setQuery(q);
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const suggestions = useMemo(
    () => (query.trim().length >= SUGGEST_MIN_CHARS ? getSearchSuggestions(query, 8) : []),
    [query]
  );

  useEffect(() => {
    setActiveSuggest(0);
    // Keep / reopen suggestions while typing (3+ chars). Do not force-close here.
    if (query.trim().length >= SUGGEST_MIN_CHARS && suggestions.length > 0) {
      setSuggestOpen(true);
    } else if (query.trim().length < SUGGEST_MIN_CHARS) {
      setSuggestOpen(false);
    }
  }, [query, suggestions.length]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setSuggestOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const runSearch = useCallback(
    async (raw: string, opts?: { forceExact?: boolean; closeSuggest?: boolean }) => {
      const typed = raw.trim();
      if (!typed) return;
      setLoading(true);
      // Only dismiss suggestions when explicitly requested (Enter / pick),
      // not when background debounce search fires — otherwise the dropdown vanishes.
      if (opts?.closeSuggest) setSuggestOpen(false);
      setCommitted(typed);

      const correction = opts?.forceExact
        ? { original: typed, corrected: typed, didCorrect: false as const }
        : correctSearchQuery(typed);
      const primary = correction.didCorrect ? correction.corrected : typed;
      const variants = opts?.forceExact
        ? [typed]
        : expandSearchVariants(typed);

      try {
        const surahNum = surahFilter ? parseInt(surahFilter, 10) : undefined;
        let bestA: SearchAyahResult[] = [];
        let bestT: SearchTranslationResult[] = [];
        let winner = primary;

        for (const variant of variants) {
          const [a, t] = await Promise.all([
            searchApi.ayahs(variant, { limit: 30, surah: surahNum }),
            searchApi.translations(variant, { limit: 30 }),
          ]);
          const ayahList = Array.isArray(a) ? a : [];
          const trList = Array.isArray(t) ? t : [];
          if (ayahList.length + trList.length > bestA.length + bestT.length) {
            bestA = ayahList;
            bestT = trList;
            winner = variant;
          }
          // Strong enough hit — stop early
          if (ayahList.length + trList.length >= 5) break;
        }

        setAyahs(bestA);
        setTranslations(bestT);
        setUsedQuery(winner);
        setCorrectedFrom(
          !opts?.forceExact && winner.toLowerCase() !== typed.toLowerCase() ? typed : null
        );
        addRecent(typed);
        setRecent(getRecent());
      } catch {
        setAyahs([]);
        setTranslations([]);
        setUsedQuery(primary);
        setCorrectedFrom(null);
      } finally {
        setLoading(false);
      }
    },
    [surahFilter]
  );

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setAyahs([]);
      setTranslations([]);
      setCommitted('');
      setUsedQuery('');
      setCorrectedFrom(null);
      return;
    }
    const t = setTimeout(() => void runSearch(query), 450);
    return () => clearTimeout(t);
  }, [query, surahFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const applySuggestion = (s: SearchSuggestion) => {
    setSuggestOpen(false);
    if (s.href) {
      router.push(s.href);
      return;
    }
    setQuery(s.query);
    void runSearch(s.query, { forceExact: true, closeSuggest: true });
  };

  const clearSearch = () => {
    setQuery('');
    setAyahs([]);
    setTranslations([]);
    setCommitted('');
    setUsedQuery('');
    setCorrectedFrom(null);
    setSuggestOpen(false);
    inputRef.current?.focus();
  };

  const hasResults = ayahs.length > 0 || translations.length > 0;
  const showEmpty = Boolean(committed && !loading && !hasResults);
  const showIdle = !committed && !loading;
  const surahSuggestions = useMemo(
    () => (showEmpty ? getSearchSuggestions(committed, 4).filter((s) => s.kind === 'surah') : []),
    [committed, showEmpty]
  );

  const visibleAyahs = tab === 'translation' ? [] : ayahs;
  const visibleTranslations = tab === 'arabic' ? [] : translations;

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestOpen && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggest((i) => Math.min(i + 1, suggestions.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggest((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter' && suggestions[activeSuggest]) {
        e.preventDefault();
        applySuggestion(suggestions[activeSuggest]);
        return;
      }
      if (e.key === 'Escape') {
        setSuggestOpen(false);
        return;
      }
    }
    if (e.key === 'Enter' && query.trim()) {
      setSuggestOpen(false);
      void runSearch(query, { closeSuggest: true });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f7f6] pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,_rgba(6,95,70,0.09),_transparent_60%)]"
      />

      <Header />

      <main className="relative mx-auto max-w-3xl px-4 pb-8 pt-6 sm:pt-10">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
            Search
          </p>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Find wisdom in the Quran
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Typos are OK — we suggest and correct as you type.
          </p>
        </div>

        <div className="relative mb-8" ref={boxRef}>
          <div
            className={cn(
              'flex items-center gap-3 rounded-full border bg-white px-5 py-3.5 shadow-sm transition-all',
              committed || query
                ? 'border-[var(--accent)] shadow-[0_8px_30px_rgba(6,95,70,0.08)]'
                : 'border-slate-200 hover:border-slate-300'
            )}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[var(--accent)]" />
            ) : (
              <Search className="h-5 w-5 shrink-0 text-[var(--accent)]" />
            )}
            <input
              ref={inputRef}
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (query.trim().length >= SUGGEST_MIN_CHARS && suggestions.length) {
                  setSuggestOpen(true);
                }
              }}
              onKeyDown={onKeyDown}
              placeholder="Try “fateh”, “yaseen”, “sabr”…"
              className="min-w-0 flex-1 bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
              aria-label="Search the Quran"
              aria-autocomplete="list"
              aria-expanded={suggestOpen}
              autoComplete="off"
            />
            <div className="flex shrink-0 items-center gap-1.5">
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Clear"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <span className="mx-0.5 hidden h-5 w-px bg-slate-200 sm:block" aria-hidden />
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition',
                  showFilters || surahFilter
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                )}
              >
                <Filter className="h-3.5 w-3.5" />
                Filters
              </button>
            </div>
          </div>

          {/* Autosuggest (3+ characters) */}
          {suggestOpen && suggestions.length > 0 && (
            <ul
              role="listbox"
              className="absolute z-30 mt-2 max-h-80 w-full overflow-auto rounded-2xl border border-slate-200 bg-white py-2 shadow-xl"
            >
              <li className="px-4 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Suggestions
              </li>
              {suggestions.map((s, i) => (
                <li key={s.id} role="option" aria-selected={i === activeSuggest}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveSuggest(i)}
                    onClick={() => applySuggestion(s)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2.5 text-left transition',
                      i === activeSuggest ? 'bg-[var(--accent)]/8' : 'hover:bg-slate-50'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                        s.kind === 'surah'
                          ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                          : s.kind === 'topic'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      {s.kind === 'surah' ? (
                        <BookMarked className="h-4 w-4" />
                      ) : s.kind === 'topic' ? (
                        <Hash className="h-4 w-4" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-800">
                        {s.label}
                      </span>
                      {s.subtitle && (
                        <span className="block truncate text-xs text-slate-400">{s.subtitle}</span>
                      )}
                    </span>
                    {s.href && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--accent)]">
                        Open
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {showFilters && (
            <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Limit to Surah
                </label>
                <input
                  type="number"
                  min={1}
                  max={114}
                  value={surahFilter}
                  onChange={(e) => setSurahFilter(e.target.value)}
                  placeholder="1–114"
                  className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                />
                {surahFilter && (
                  <button
                    type="button"
                    onClick={() => setSurahFilter('')}
                    className="text-xs font-medium text-[var(--accent)] hover:underline"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Spelling correction banner */}
        {correctedFrom && hasResults && !loading && (
          <div className="mb-5 rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-4 py-3 text-sm text-slate-700">
            Showing results for{' '}
            <span className="font-bold text-[var(--accent)]">“{usedQuery}”</span>
            <span className="text-slate-400"> · </span>
            searched as correction for “{correctedFrom}”.{' '}
            <button
              type="button"
              className="font-semibold text-slate-800 underline decoration-[var(--accent)]/40 underline-offset-2 hover:text-[var(--accent)]"
              onClick={() => void runSearch(correctedFrom, { forceExact: true, closeSuggest: true })}
            >
              Search instead for “{correctedFrom}”
            </button>
          </div>
        )}

        {showIdle && (
          <div className="space-y-10">
            {recent.length > 0 && (
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Clock className="h-4 w-4 text-slate-400" />
                    Recent
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      clearRecent();
                      setRecent([]);
                    }}
                    className="text-xs text-slate-400 hover:text-[var(--accent)]"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setQuery(r)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-700 shadow-sm hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
                    >
                      <Clock className="h-3 w-3 text-slate-400" />
                      {r}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                Popular searches
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR.map((p) => (
                  <button
                    key={p.q}
                    type="button"
                    onClick={() => setQuery(p.q)}
                    className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5 hover:text-[var(--accent)]"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <BookOpen className="h-4 w-4 text-slate-400" />
                Browse popular chapters
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SUGGESTED_SURAHS.map((s) => (
                  <Link
                    key={s.number}
                    href={`/surah/${s.number}`}
                    className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)]/35 hover:shadow-md"
                  >
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {String(s.number).padStart(2, '0')}
                      </p>
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-[var(--accent)]">
                        {s.name}
                      </p>
                    </div>
                    <p className="font-arabic text-base text-slate-500" dir="rtl" lang="ar">
                      {getSurahArabicName(s.number)}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <Skeleton className="mb-3 h-4 w-28" />
                <Skeleton className="mb-2 h-7 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        )}

        {committed && !loading && hasResults && (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                {(['all', 'arabic', 'translation'] as Tab[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={cn(
                      'rounded-full px-3.5 py-1.5 text-sm font-semibold capitalize transition',
                      tab === t
                        ? 'bg-[var(--accent)] text-white'
                        : 'text-slate-500 hover:text-slate-800'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-800">
                  {ayahs.length + translations.length}
                </span>{' '}
                results for “{usedQuery || committed}”
              </p>
            </div>

            {visibleAyahs.length > 0 && (
              <section className="mb-8">
                {tab === 'all' && (
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Arabic · {ayahs.length}
                  </p>
                )}
                <div className="space-y-2.5">
                  {visibleAyahs.map((a) => (
                    <Link
                      key={`${a.surah.number}-${a.number}`}
                      href={`/surah/${a.surah.number}#ayah-${a.id}`}
                      className="group block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)]/35 hover:shadow-md sm:p-5"
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[var(--accent)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--accent)]">
                          {a.surah.nameSimple} · {a.number}
                        </span>
                        <span
                          className="font-arabic text-sm text-slate-400"
                          dir="rtl"
                          lang="ar"
                        >
                          {getSurahArabicName(a.surah.number, a.surah.nameArabic)}
                        </span>
                      </div>
                      <p
                        className="font-arabic ayah-arabic text-xl leading-loose text-slate-900"
                        lang="ar"
                        dir="rtl"
                      >
                        {highlightText(a.textUthmani, usedQuery || committed)}
                      </p>
                      {a.translations?.length > 0 && (
                        <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                          {highlightText(a.translations[0].text.slice(0, 160), usedQuery || committed)}
                          {a.translations[0].text.length > 160 && '…'}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {visibleTranslations.length > 0 && (
              <section>
                {tab === 'all' && (
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Translations · {translations.length}
                  </p>
                )}
                <div className="space-y-2.5">
                  {visibleTranslations.map((t) => (
                    <Link
                      key={`${t.ayahId}-${t.translator.slug}`}
                      href={`/surah/${t.surah.number}#ayah-${t.ayahId}`}
                      className="group block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)]/35 hover:shadow-md sm:p-5"
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                          {t.surah.nameSimple} · {t.ayahNumber}
                        </span>
                        <span className="text-xs text-slate-400">{t.translator.name}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-800">
                        {highlightText(t.text, usedQuery || committed)}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {showEmpty && (
          <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10 sm:py-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(6,95,70,0.08),_transparent_55%)]"
            />
            <div className="relative mx-auto flex max-w-lg flex-col items-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <Compass className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                No results for “{committed}”
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Check the suggestions below — we often catch spelling mistakes.
              </p>

              {surahSuggestions.length > 0 && (
                <div className="mt-8 w-full text-left">
                  <p className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                    Did you mean
                  </p>
                  <div className="grid gap-2">
                    {surahSuggestions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => applySuggestion(s)}
                        className="group flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-left transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-800 group-hover:text-[var(--accent)]">
                            {s.label}
                          </p>
                          <p className="text-xs text-slate-400">{s.subtitle || 'Open chapter'}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[var(--accent)]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {POPULAR.slice(0, 4).map((p) => (
                  <button
                    key={p.q}
                    type="button"
                    onClick={() => setQuery(p.q)}
                    className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
                  >
                    Try “{p.label}”
                  </button>
                ))}
              </div>

              <Link
                href="/surahs"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[var(--accent)]/90"
              >
                Browse all chapters
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
