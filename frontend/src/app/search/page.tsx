'use client';

import { Suspense, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Filter,
  Loader2,
  BookOpen,
  ArrowRight,
  Compass,
  BookMarked,
  Hash,
  Mic,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';
import { getSurahArabicName, getSurahPath, getSurahHref } from '@/lib/surah-meta';
import { quranApi, searchApi, type SearchAyahResult, type SearchTranslationResult } from '@/lib/api';
import { highlightText } from '@/lib/highlight';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  correctSearchQuery,
  expandSearchVariants,
  getSearchSuggestions,
  type SearchSuggestion,
} from '@/lib/search-intelligence';
import { resolveDirectSearchHref, parseQuranPageSearch } from '@/lib/search-navigation';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';

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
        <div className="flex min-h-screen items-center justify-center bg-surface-2 text-ink-muted">
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
  const { startListening } = useVoiceSearch();
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

  useEffect(() => {
    if (!initialQ) return;
    const directHref = resolveDirectSearchHref(initialQ);
    if (directHref) router.replace(directHref);
  }, [initialQ, router]);

  const suggestions = useMemo(
    () => (query.trim().length >= SUGGEST_MIN_CHARS ? getSearchSuggestions(query, 8) : []),
    [query]
  );

  useEffect(() => {
    setActiveSuggest(0);
    if (query.trim().length < SUGGEST_MIN_CHARS || suggestions.length === 0) {
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
        const mushafPage = parseQuranPageSearch(typed);
        if (mushafPage) {
          const pageAyahs = await quranApi.ayahsByPage(mushafPage, { limit: 1 });
          const first = pageAyahs[0];
          if (first?.surah?.number && first.number) {
            router.push(
              getSurahHref(first.surah.number, {
                ayahId: first.id,
                ayahNumber: first.number,
              })
            );
            return;
          }
        }

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
    [router, surahFilter]
  );

  const submitSearch = useCallback(
    (raw: string) => {
      const directHref = resolveDirectSearchHref(raw);
      if (directHref) {
        setSuggestOpen(false);
        router.push(directHref);
        return;
      }
      void runSearch(raw, { closeSuggest: true });
    },
    [router, runSearch]
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

  const uniqueTranslations = useMemo(() => {
    const byAyah = new Map<number, SearchTranslationResult>();

    for (const translation of translations) {
      const current = byAyah.get(translation.ayahId);
      const isPreferred = /saheeh/i.test(
        `${translation.translator.name} ${translation.translator.slug}`
      );
      const currentIsPreferred = current
        ? /saheeh/i.test(`${current.translator.name} ${current.translator.slug}`)
        : false;

      if (!current || (isPreferred && !currentIsPreferred)) {
        byAyah.set(translation.ayahId, translation);
      }
    }

    return Array.from(byAyah.values());
  }, [translations]);

  const hasResults = ayahs.length > 0 || uniqueTranslations.length > 0;
  const showEmpty = Boolean(committed && !loading && !hasResults);
  const showIdle = !committed && !loading;
  const surahSuggestions = useMemo(
    () => (showEmpty ? getSearchSuggestions(committed, 4).filter((s) => s.kind === 'surah') : []),
    [committed, showEmpty]
  );

  const visibleAyahs = tab === 'translation' ? [] : ayahs;
  const visibleTranslations = tab === 'arabic' ? [] : uniqueTranslations;

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
        const directHref = resolveDirectSearchHref(query);
        if (directHref) {
          setSuggestOpen(false);
          router.push(directHref);
          return;
        }
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
      submitSearch(query);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface-app">
      <Header />

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            Search
            </p>
            <h1 className="text-3xl font-bold text-ink sm:text-4xl">Search the Quran</h1>
            <p className="mt-2 text-sm text-ink-3 sm:text-base">
              Find verses, translations, chapters, pages, and topics.
            </p>
          </div>
          <p className="hidden text-sm font-medium text-ink-muted sm:block">
            114 Surahs <span className="px-1.5 text-amber-600">•</span> 6,236 Ayahs
          </p>
        </header>

        <div className="relative mb-10" ref={boxRef}>
          <div
            className={cn(
              'flex min-h-16 items-center gap-3 rounded border bg-surface p-2 pl-4 shadow-[0_14px_40px_-30px_rgba(6,78,59,0.65)] transition-all sm:pl-5',
              committed || query
                ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/10'
                : 'border-line hover:border-line-strong'
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
              autoFocus={!initialQ}
              value={query}
              onChange={(e) => {
                const nextQuery = e.target.value;
                setQuery(nextQuery);
                setSuggestOpen(nextQuery.trim().length >= SUGGEST_MIN_CHARS);
              }}
              onFocus={() => {
                if (query.trim().length >= SUGGEST_MIN_CHARS && suggestions.length) {
                  setSuggestOpen(true);
                }
              }}
              onKeyDown={onKeyDown}
              placeholder="Search Surah, Ayah, page, or topic"
              className="min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-ink-faint focus:outline-none"
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
                  className="flex h-9 w-9 items-center justify-center rounded text-ink-faint transition hover:bg-surface-3 hover:text-ink-2"
                  aria-label="Clear"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <span className="mx-0.5 hidden h-5 w-px bg-line sm:block" aria-hidden />
              <button
                type="button"
                onClick={() => startListening()}
                className="hidden h-10 w-10 items-center justify-center rounded text-ink-muted transition hover:bg-surface-3 hover:text-[var(--accent)] sm:inline-flex"
                aria-label="Search by voice"
                title="Search by voice"
              >
                <Mic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                aria-label="Search filters"
                aria-expanded={showFilters}
                className={cn(
                  'hidden h-10 items-center gap-1.5 rounded px-2.5 text-xs font-semibold transition sm:inline-flex sm:px-3',
                  showFilters || surahFilter
                    ? 'bg-[var(--accent)] text-brand-contrast'
                    : 'text-ink-muted hover:bg-surface-3 hover:text-ink'
                )}
              >
                <Filter className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Filters</span>
              </button>
              <button
                type="button"
                onClick={() => query.trim() && submitSearch(query)}
                disabled={!query.trim() || loading}
                aria-label="Search Quran"
                className="inline-flex h-10 items-center gap-2 rounded bg-[var(--accent)] px-3.5 text-sm font-bold text-brand-contrast transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-45 sm:px-5"
              >
                <span className="hidden sm:inline">Search</span>
                <Search className="h-4 w-4 sm:hidden" />
                <ArrowRight className="hidden h-4 w-4 sm:block" />
              </button>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 sm:hidden">
            <button
              type="button"
              onClick={() => startListening()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded border border-line bg-surface text-xs font-semibold text-ink-3 shadow-sm transition hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
            >
              <Mic className="h-4 w-4" />
              Voice search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              className={cn(
                'inline-flex h-10 items-center justify-center gap-2 rounded border text-xs font-semibold shadow-sm transition',
                showFilters || surahFilter
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-brand-contrast'
                  : 'border-line bg-surface text-ink-3 hover:border-[var(--accent)]/40 hover:text-[var(--accent)]'
              )}
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>

          {/* Autosuggest (3+ characters) */}
          {suggestOpen && suggestions.length > 0 && (
            <ul
              role="listbox"
              className="absolute z-30 mt-2 max-h-80 w-full overflow-auto rounded border border-line bg-surface py-2 shadow-xl"
            >
              <li className="px-4 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-ink-faint">
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
                      i === activeSuggest ? 'bg-[var(--accent)]/8' : 'hover:bg-surface-2'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded',
                        s.kind === 'surah'
                          ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                          : s.kind === 'topic'
                            ? 'bg-warning-surface text-warning'
                            : 'bg-surface-3 text-ink-muted'
                      )}
                    >
                      {s.kind === 'surah' ? (
                        <BookMarked className="h-4 w-4" />
                      ) : s.kind === 'topic' ? (
                        <Hash className="h-4 w-4" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {s.label}
                      </span>
                      {s.subtitle && (
                        <span className="block truncate text-xs text-ink-faint">{s.subtitle}</span>
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
            <div className="mt-3 rounded border border-line bg-surface p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  Limit to Surah
                </label>
                <input
                  type="number"
                  min={1}
                  max={114}
                  value={surahFilter}
                  onChange={(e) => setSurahFilter(e.target.value)}
                  placeholder="1–114"
                  className="w-24 rounded border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
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
          <div className="mb-5 rounded border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-4 py-3 text-sm text-ink-2">
            Showing results for{' '}
            <span className="font-bold text-[var(--accent)]">“{usedQuery}”</span>
            <span className="text-ink-faint"> · </span>
            searched as correction for “{correctedFrom}”.{' '}
            <button
              type="button"
              className="font-semibold text-ink underline decoration-[var(--accent)]/40 underline-offset-2 hover:text-[var(--accent)]"
              onClick={() => void runSearch(correctedFrom, { forceExact: true, closeSuggest: true })}
            >
              Search instead for “{correctedFrom}”
            </button>
          </div>
        )}

        {showIdle && (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-14">
            <div className="space-y-9">
              {recent.length > 0 && (
                <section>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Clock className="h-4 w-4 text-ink-faint" />
                    Recent
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      clearRecent();
                      setRecent([]);
                    }}
                    className="text-xs text-ink-faint hover:text-[var(--accent)]"
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
                      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-2 text-sm text-ink-2 shadow-sm hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
                    >
                      <Clock className="h-3 w-3 text-ink-faint" />
                      {r}
                    </button>
                  ))}
                </div>
                </section>
              )}

              <section>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
                <TrendingUp className="h-4 w-4 text-[var(--accent)]" />
                Popular searches
              </div>
              <div className="flex flex-wrap gap-2.5">
                {POPULAR.map((p) => (
                  <button
                    key={p.q}
                    type="button"
                    onClick={() => setQuery(p.q)}
                    className="rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink-2 shadow-sm transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5 hover:text-[var(--accent)]"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              </section>
            </div>

            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <BookOpen className="h-4 w-4 text-[var(--accent)]" />
                  Popular chapters
                </div>
                <Link
                  href="/surahs"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:text-brand"
                >
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {SUGGESTED_SURAHS.map((s) => (
                  <Link
                    key={s.number}
                    href={getSurahPath(s.number)}
                    className="group grid min-h-[92px] grid-cols-[48px_minmax(0,1fr)_minmax(64px,0.7fr)_20px] items-center gap-3 rounded border border-line bg-surface px-3.5 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)]/35 hover:shadow-md"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded border border-brand/20 bg-brand/10 text-xs font-bold text-[var(--accent)]">
                      {String(s.number).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink group-hover:text-[var(--accent)]">
                        {s.name}
                      </p>
                    </div>
                    <span className="flex min-h-10 items-center justify-end overflow-visible whitespace-nowrap font-arabic text-xl !leading-[1.5] text-ink-muted" dir="rtl" lang="ar">
                      {getSurahArabicName(s.number)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-ink-faint transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded border border-line bg-surface p-5 shadow-sm">
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
              <div className="flex gap-1 rounded-full border border-line bg-surface p-1 shadow-sm">
                {(['all', 'arabic', 'translation'] as Tab[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={cn(
                      'rounded-full px-3.5 py-1.5 text-sm font-semibold capitalize transition',
                      tab === t
                        ? 'bg-[var(--accent)] text-brand-contrast'
                        : 'text-ink-muted hover:text-ink'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-sm text-ink-muted">
                <span className="font-semibold text-ink">
                  {ayahs.length + uniqueTranslations.length}
                </span>{' '}
                results for “{usedQuery || committed}”
              </p>
            </div>

            {visibleAyahs.length > 0 && (
              <section className="mb-8">
                {tab === 'all' && (
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-faint">
                    Arabic · {ayahs.length}
                  </p>
                )}
                <div className="space-y-2.5">
                  {visibleAyahs.map((a) => (
                    <Link
                      key={`${a.surah.number}-${a.number}`}
                      href={getSurahHref(a.surah.number, {
                        ayahId: a.id,
                        ayahNumber: a.number,
                      })}
                      className="group block rounded border border-line bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)]/35 hover:shadow-md sm:p-5"
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[var(--accent)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--accent)]">
                          {a.surah.nameSimple} · {a.number}
                        </span>
                        <span
                          className="font-arabic text-sm text-ink-faint"
                          dir="rtl"
                          lang="ar"
                        >
                          {getSurahArabicName(a.surah.number, a.surah.nameArabic)}
                        </span>
                      </div>
                      <p
                        className="font-arabic ayah-arabic text-xl leading-loose text-ink"
                        lang="ar"
                        dir="rtl"
                      >
                        {highlightText(a.textUthmani, usedQuery || committed)}
                      </p>
                      {a.translations?.length > 0 && (
                        <p className="mt-2 line-clamp-2 text-sm text-ink-muted">
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
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-faint">
                    Translations · {uniqueTranslations.length}
                  </p>
                )}
                <div className="space-y-2.5">
                  {visibleTranslations.map((t) => (
                    <Link
                      key={`${t.ayahId}-${t.translator.slug}`}
                      href={getSurahHref(t.surah.number, {
                        ayahId: t.ayahId,
                        ayahNumber: t.ayahNumber,
                      })}
                      className="group block rounded border border-line bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)]/35 hover:shadow-md sm:p-5"
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-surface-3 px-2.5 py-0.5 text-xs font-bold text-ink-3">
                          {t.surah.nameSimple} · {t.ayahNumber}
                        </span>
                        <span className="text-xs text-ink-faint">{t.translator.name}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-ink">
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
          <div className="relative overflow-hidden rounded border border-line bg-surface px-6 py-12 text-center shadow-sm sm:px-10 sm:py-14">
            <div className="relative mx-auto flex max-w-lg flex-col items-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded bg-[var(--accent)]/10 text-[var(--accent)]">
                <Compass className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-ink">
                No results for “{committed}”
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Check the suggestions below — we often catch spelling mistakes.
              </p>

              {surahSuggestions.length > 0 && (
                <div className="mt-8 w-full text-left">
                  <p className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-ink-faint">
                    Did you mean
                  </p>
                  <div className="grid gap-2">
                    {surahSuggestions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => applySuggestion(s)}
                        className="group flex w-full items-center justify-between rounded border border-line bg-surface-2/80 px-4 py-3 text-left transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5"
                      >
                        <div>
                          <p className="text-sm font-bold text-ink group-hover:text-[var(--accent)]">
                            {s.label}
                          </p>
                          <p className="text-xs text-ink-faint">{s.subtitle || 'Open chapter'}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-ink-faint group-hover:text-[var(--accent)]" />
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
                    className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-semibold text-ink-3 hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
                  >
                    Try “{p.label}”
                  </button>
                ))}
              </div>

              <Link
                href="/surahs"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-brand-contrast shadow-md hover:bg-[var(--accent)]/90"
              >
                Browse all chapters
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
