'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookMarked, Hash, Search, X } from 'lucide-react';
import {
  correctSearchQuery,
  getSearchSuggestions,
  type SearchSuggestion,
} from '@/lib/search-intelligence';
import { cn } from '@/lib/utils';
import { VoiceSearchButton } from '@/components/VoiceSearchButton';
import { parseVoiceIntent } from '@/lib/voice/parseVoiceIntent';
import { executeVoiceCommand } from '@/lib/voice/executeVoiceCommand';
import { resolveDirectSearchHref } from '@/lib/search-navigation';

const SUGGEST_MIN_CHARS = 3;

interface Props {
  placeholder?: string;
  searchButtonLabel?: string;
  /** hero = pill with green Search button; plain = input only */
  variant?: 'hero' | 'plain';
  className?: string;
  autoFocus?: boolean;
  initialQuery?: string;
  /** Called instead of navigating when user runs a text search (optional) */
  onSearchNavigate?: (query: string) => void;
}

export function SmartSearchBox({
  placeholder = 'Type surah name, page or verse…',
  searchButtonLabel = 'Search',
  variant = 'hero',
  className,
  autoFocus,
  initialQuery = '',
  onSearchNavigate,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeSuggest, setActiveSuggest] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(
    () => (query.trim().length >= SUGGEST_MIN_CHARS ? getSearchSuggestions(query, 8) : []),
    [query],
  );

  useEffect(() => {
    setActiveSuggest(0);
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

  const goSearch = (raw: string) => {
    const typed = raw.trim();
    if (!typed) return;
    setSuggestOpen(false);

    // Try structured Quran/navigation intents first, but keep generic searches
    // available for direct typed resolution below.
    const intent = parseVoiceIntent(typed);
    if (intent.type !== 'QURAN_SEARCH' && intent.type !== 'UNKNOWN') {
      const executed = executeVoiceCommand({ intent, router });
      if (executed) return;
    }

    const directHref = resolveDirectSearchHref(typed);
    if (directHref) {
      router.push(directHref);
      return;
    }

    const correction = correctSearchQuery(typed);
    const q = correction.didCorrect ? correction.corrected : typed;
    if (onSearchNavigate) {
      onSearchNavigate(q);
      return;
    }
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const applySuggestion = (s: SearchSuggestion) => {
    setSuggestOpen(false);
    if (s.href) {
      router.push(s.href);
      return;
    }
    setQuery(s.query);
    goSearch(s.query);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    goSearch(query);
  };

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
        if (resolveDirectSearchHref(query)) {
          goSearch(query);
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
  };

  return (
    <div ref={boxRef} className={cn('relative', className)}>
      <form
        onSubmit={onSubmit}
        className={cn(variant === 'hero' && 'group relative')}
      >
        {variant === 'hero' && (
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-lg transition-opacity group-hover:opacity-20" />
        )}
        <div
          className={cn(
            'relative flex items-center',
            variant === 'hero'
              ? 'overflow-visible rounded-[1.75rem] border border-line bg-surface/90 p-1.5 shadow-md backdrop-blur-sm focus-within:border-emerald-800/40 focus-within:ring-4 focus-within:ring-emerald-800/5 sm:rounded-full'
              : 'rounded-full border border-line bg-surface px-4 py-3 shadow-sm focus-within:border-[var(--accent)]',
          )}
        >
          <Search
            className={cn(
              'shrink-0 text-brand',
              variant === 'hero' ? 'ml-4 h-5 w-5' : 'h-5 w-5',
            )}
          />
          <input
            ref={inputRef}
            type="text"
            autoFocus={autoFocus}
            placeholder={placeholder}
            className={cn(
              'min-w-0 flex-1 bg-transparent text-ink placeholder-ink-faint outline-none',
              variant === 'hero' ? 'px-3 py-2.5' : 'px-3',
            )}
            value={query}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={suggestOpen}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim().length >= SUGGEST_MIN_CHARS && suggestions.length) {
                setSuggestOpen(true);
              }
            }}
            onKeyDown={onKeyDown}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestOpen(false);
                inputRef.current?.focus();
              }}
              className="mr-1 rounded-full p-1.5 text-ink-faint hover:bg-surface-3 hover:text-ink-2"
              aria-label="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <VoiceSearchButton className="mr-1" />
          {variant === 'hero' && (
            <button
              type="submit"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-sm font-semibold text-white transition hover:bg-emerald-900 sm:w-auto sm:px-6 sm:py-2.5"
            >
              <Search className="h-4 w-4 sm:hidden" aria-hidden />
              <span className="sr-only sm:not-sr-only">{searchButtonLabel}</span>
            </button>
          )}
        </div>
      </form>

      {suggestOpen && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-40 mt-2 max-h-80 w-full overflow-auto rounded-2xl border border-line bg-surface py-2 shadow-xl"
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
                  i === activeSuggest ? 'bg-emerald-800/8' : 'hover:bg-surface-2',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                    s.kind === 'surah'
                      ? 'bg-emerald-800/10 text-brand'
                      : s.kind === 'topic'
                        ? 'bg-warning-surface text-warning'
                        : 'bg-surface-3 text-ink-muted',
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
                  <span className="text-[10px] font-bold uppercase tracking-wide text-brand">
                    Open
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
