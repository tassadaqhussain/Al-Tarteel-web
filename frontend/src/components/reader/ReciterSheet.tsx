'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Loader2, Search, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';
import { audioApi, type Reciter } from '@/lib/api';
import { catalogTranslationReciters } from '@/lib/audio/translation-reciters';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSlug: string | null | undefined;
  onSelect: (slug: string) => void;
  selectedTranslationSlug?: string | null;
  onSelectTranslation?: (slug: string | null) => void;
}

function styleLabel(style: string | null | undefined) {
  if (!style) return null;
  const cleaned = style.trim();
  if (!cleaned || cleaned.toLowerCase() === 'none') return null;
  return cleaned;
}

export function ReciterSheet({
  open,
  onOpenChange,
  selectedSlug,
  onSelect,
  selectedTranslationSlug,
  onSelectTranslation,
}: Props) {
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'reciters' | 'translations'>('reciters');

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    audioApi
      .reciters()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const hasTranslations = list.some((item) => item.kind === 'translation');
        setReciters(hasTranslations ? list : [...list, ...catalogTranslationReciters()]);
      })
      .catch(() => setReciters([]))
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setTab('reciters');
    }
  }, [open]);

  const arabicReciters = useMemo(
    () => reciters.filter((item) => item.kind !== 'translation'),
    [reciters],
  );
  const translationReciters = useMemo(
    () => reciters.filter((item) => item.kind === 'translation'),
    [reciters],
  );

  const visibleArabic = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    const filtered = q
      ? arabicReciters.filter((reciter) => {
          const haystack = [reciter.name, reciter.nameArabic || '', reciter.style || '', reciter.slug]
            .join(' ')
            .toLocaleLowerCase();
          return haystack.includes(q);
        })
      : arabicReciters;
    return [...filtered].sort((a, b) => {
      const byName = a.name.localeCompare(b.name);
      if (byName !== 0) return byName;
      return (a.style || '').localeCompare(b.style || '');
    });
  }, [arabicReciters, query]);

  const visibleTranslations = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    const filtered = q
      ? translationReciters.filter((reciter) => {
          const haystack = [
            reciter.name,
            reciter.style || '',
            reciter.languageName || '',
            reciter.languageCode || '',
            reciter.slug,
          ]
            .join(' ')
            .toLocaleLowerCase();
          return haystack.includes(q);
        })
      : translationReciters;
    return [...filtered].sort((a, b) => {
      const lang = (a.languageName || '').localeCompare(b.languageName || '');
      if (lang !== 0) return lang;
      return a.name.localeCompare(b.name);
    });
  }, [query, translationReciters]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col bg-surface p-0 text-ink [&>button]:hidden sm:max-w-[560px]"
      >
        <div className="flex h-[92px] shrink-0 items-center border-b border-line px-5 sm:px-7">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="-ml-2 flex h-12 w-12 items-center justify-center rounded-full transition hover:bg-surface-3"
            aria-label="Back"
          >
            <ArrowLeft className="h-7 w-7" />
          </button>
          <div className="ml-2 min-w-0">
            <SheetTitle className="text-2xl font-medium tracking-tight sm:text-3xl">Audio</SheetTitle>
            <SheetDescription className="sr-only">Choose a reciter or spoken translation</SheetDescription>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="ml-auto flex h-12 w-12 items-center justify-center rounded-full transition hover:bg-surface-3"
            aria-label="Close"
          >
            <X className="h-7 w-7" />
          </button>
        </div>

        <div className="shrink-0 px-5 pt-5 sm:px-7">
          <div className="grid grid-cols-2 rounded-full bg-surface-3 p-1" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'reciters'}
              onClick={() => setTab('reciters')}
              className={cn(
                'rounded-full px-3 py-2.5 text-sm font-semibold transition',
                tab === 'reciters' ? 'bg-surface text-ink shadow' : 'text-ink-muted',
              )}
            >
              Reciters
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'translations'}
              onClick={() => setTab('translations')}
              className={cn(
                'rounded-full px-3 py-2.5 text-sm font-semibold transition',
                tab === 'translations' ? 'bg-surface text-ink shadow' : 'text-ink-muted',
              )}
            >
              Translations
            </button>
          </div>
        </div>

        <div className="shrink-0 px-5 pb-3 pt-5 sm:px-7">
          <label className="flex h-[68px] items-center rounded-[28px] border border-line bg-surface px-5 shadow-sm transition focus-within:border-line-strong">
            <Search className="h-8 w-8 shrink-0 text-ink-3" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              placeholder={tab === 'translations' ? 'Search voice translation' : 'Search Reciter'}
              className="ml-4 min-w-0 flex-1 bg-transparent text-xl outline-none placeholder:text-ink-muted sm:text-2xl"
            />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8 sm:px-7 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin]">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-ink-muted" />
            </div>
          ) : tab === 'reciters' ? (
            visibleArabic.length === 0 ? (
              <div className="flex h-40 items-center justify-center px-6 text-center text-base text-ink-muted">
                No reciters match “{query.trim()}”
              </div>
            ) : (
              <div className="divide-y divide-line-subtle">
                {visibleArabic.map((reciter) => {
                  const selected = reciter.slug === selectedSlug;
                  const style = styleLabel(reciter.style);
                  const label = style ? `${reciter.name} (${style})` : reciter.name;
                  return (
                    <button
                      key={reciter.slug}
                      type="button"
                      onClick={() => {
                        onSelect(reciter.slug);
                        onOpenChange(false);
                      }}
                      className="flex min-h-[72px] w-full items-center gap-4 py-3 text-left transition hover:bg-surface-2"
                    >
                      <span
                        className={cn(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                          selected ? 'border-ink' : 'border-line-strong',
                        )}
                        aria-hidden
                      >
                        {selected && <span className="h-3 w-3 rounded-full bg-ink" />}
                      </span>
                      <span className="min-w-0 flex-1 text-lg leading-snug sm:text-xl">{label}</span>
                      {style && (
                        <span className="shrink-0 rounded-md bg-[var(--accent)]/10 px-2.5 py-1 text-sm font-medium text-[var(--accent)]">
                          {style}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )
          ) : (
            <div>
              <p className="mb-4 text-sm leading-relaxed text-ink-muted">
                After each Arabic verse, play the spoken translation you select.
              </p>
              <div className="divide-y divide-line-subtle">
                <button
                  type="button"
                  onClick={() => {
                    onSelectTranslation?.(null);
                    onOpenChange(false);
                  }}
                  className="flex min-h-[72px] w-full items-center gap-4 py-3 text-left transition hover:bg-surface-2"
                >
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                      !selectedTranslationSlug ? 'border-ink' : 'border-line-strong',
                    )}
                    aria-hidden
                  >
                    {!selectedTranslationSlug && <span className="h-3 w-3 rounded-full bg-ink" />}
                  </span>
                  <span className="min-w-0 flex-1 text-lg leading-snug sm:text-xl">Off — Arabic only</span>
                </button>
                {visibleTranslations.length === 0 ? (
                  <div className="px-2 py-8 text-center text-base text-ink-muted">
                    No voice translations match “{query.trim()}”
                  </div>
                ) : (
                  visibleTranslations.map((reciter) => {
                    const selected = reciter.slug === selectedTranslationSlug;
                    return (
                      <button
                        key={reciter.slug}
                        type="button"
                        onClick={() => {
                          onSelectTranslation?.(reciter.slug);
                          onOpenChange(false);
                        }}
                        className="flex min-h-[72px] w-full items-center gap-4 py-3 text-left transition hover:bg-surface-2"
                      >
                        <span
                          className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                            selected ? 'border-ink' : 'border-line-strong',
                          )}
                          aria-hidden
                        >
                          {selected && <span className="h-3 w-3 rounded-full bg-ink" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-lg leading-snug sm:text-xl">{reciter.name}</span>
                          <span className="mt-0.5 block text-sm text-ink-muted">
                            {reciter.languageName}
                            {reciter.style ? ` · ${reciter.style}` : ''}
                          </span>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
