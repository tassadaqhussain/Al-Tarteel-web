'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Check, Info, Loader2, Search, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { quranApi, type Translator } from '@/lib/api';
import { useSettingsStore } from '@/stores/settingsStore';
import { setTranslationCookie, DEFAULT_TRANSLATION } from '@/lib/translation-preference';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const FALLBACK_TRANSLATORS: Translator[] = [
  { id: -1, name: 'Sahih International', languageCode: 'en', slug: DEFAULT_TRANSLATION },
];

// Language display names
const LANG_NAMES: Record<string, string> = {
  en: 'English',
  ar: 'Arabic',
  ur: 'Urdu',
  tr: 'Turkish',
  fr: 'French',
  de: 'German',
  id: 'Indonesian',
  ms: 'Malay',
  ru: 'Russian',
  bn: 'Bengali',
  ps: 'Pashto (پښتو)',
  fa: 'Persian',
  es: 'Spanish',
  nl: 'Dutch',
  it: 'Italian',
};

function getLangName(code: string) {
  return LANG_NAMES[code] ?? code.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function TranslationSheet({ open, onOpenChange }: Props) {
  const pathname = usePathname();
  const { translationSlugs, setTranslationSlugs, setShowTranslation } = useSettingsStore();

  const [translators, setTranslators] = useState<Translator[]>(FALLBACK_TRANSLATORS);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(
    new Set(translationSlugs.length ? translationSlugs : [DEFAULT_TRANSLATION])
  );

  // Refresh the built-in option with the complete list from the API.
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    quranApi.translators()
      .then((data) => {
        const available = Array.isArray(data) && data.length ? data : FALLBACK_TRANSLATORS;
        setTranslators(available);
        const availableSlugs = new Set(available.map((translator) => translator.slug));
        setSelected((current) => {
          const valid = Array.from(current).filter((slug) => availableSlugs.has(slug));
          return new Set(valid.length ? valid : [DEFAULT_TRANSLATION]);
        });
      })
      .catch(() => setTranslators(FALLBACK_TRANSLATORS))
      .finally(() => setLoading(false));
  }, [open]);

  // Sync selected state when sheet opens
  useEffect(() => {
    if (open) setSelected(new Set(translationSlugs.length ? translationSlugs : [DEFAULT_TRANSLATION]));
  }, [open, translationSlugs]);

  const toggle = useCallback((slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  const apply = useCallback(() => {
    const slugs = Array.from(selected);
    setTranslationSlugs(slugs);
    setTranslationCookie(slugs);
    if (slugs.length > 0) setShowTranslation(true);

    onOpenChange(false);
    // Clean pathname only — translations live in cookie + settings
    window.location.assign(pathname);
  }, [selected, setTranslationSlugs, setShowTranslation, pathname, onOpenChange]);

  const clearAll = useCallback(() => setSelected(new Set()), []);

  // Group translators by language
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleTranslators = normalizedQuery
    ? translators.filter((translator) =>
        translator.name.toLocaleLowerCase().includes(normalizedQuery)
        || getLangName(translator.languageCode).toLocaleLowerCase().includes(normalizedQuery)
      )
    : translators;
  const byLang = visibleTranslators.reduce<Record<string, Translator[]>>((acc, t) => {
    const lang = t.languageCode;
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(t);
    return acc;
  }, {});

  const langOrder = Object.keys(byLang).sort((a, b) => {
    // English first, then alphabetical
    if (a === 'en') return -1;
    if (b === 'en') return 1;
    return getLangName(a).localeCompare(getLangName(b));
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col bg-white p-0 text-slate-900 [&>button]:hidden sm:max-w-[560px]"
      >
        <div className="flex h-[92px] shrink-0 items-center border-b border-slate-200 px-5 sm:px-7">
          <button type="button" onClick={() => onOpenChange(false)} className="-ml-2 flex h-12 w-12 items-center justify-center rounded-full transition hover:bg-slate-100" aria-label="Back"><ArrowLeft className="h-7 w-7" /></button>
          <div className="ml-2 min-w-0"><SheetTitle className="text-2xl font-medium tracking-tight sm:text-3xl">Translations</SheetTitle><SheetDescription className="sr-only">Choose one or more Quran translations</SheetDescription></div>
          <button type="button" onClick={() => onOpenChange(false)} className="ml-auto flex h-12 w-12 items-center justify-center rounded-full transition hover:bg-slate-100" aria-label="Close"><X className="h-7 w-7" /></button>
        </div>

        <div className="shrink-0 px-5 pb-3 pt-7 sm:px-7">
          <label className="flex h-[68px] items-center rounded-[28px] border border-slate-200 bg-white px-5 shadow-sm transition focus-within:border-slate-400">
            <Search className="h-8 w-8 shrink-0 text-slate-600" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search Translations" className="ml-4 min-w-0 flex-1 bg-transparent text-xl outline-none placeholder:text-slate-500 sm:text-2xl" />
          </label>
        </div>

        {/* Translator list */}
        <div className="flex-1 overflow-y-auto px-0 pb-6 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin]">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-slate-500" />
            </div>
          ) : visibleTranslators.length === 0 ? (
            <div className="flex h-40 items-center justify-center px-6 text-center text-base text-slate-500">
              No translations match “{query.trim()}”
            </div>
          ) : (
            <div className="px-5 py-2 sm:px-7">
              {langOrder.map((lang) => (
                <section key={lang} className="pt-5">
                  <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-[28px]">
                    {getLangName(lang)}
                  </h2>
                  <div>
                    {byLang[lang].map((t) => {
                      const isSelected = selected.has(t.slug);
                      return (
                        <button
                          key={t.slug}
                          type="button"
                          onClick={() => toggle(t.slug)}
                          className="group flex min-h-[68px] w-full items-center py-2 text-left"
                        >
                          <span
                            className={cn(
                              'mr-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
                              isSelected
                                ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                                : 'border-slate-200 bg-slate-100 group-hover:border-slate-400'
                            )}
                          >
                            {isSelected && <Check className="h-6 w-6" strokeWidth={3} />}
                          </span>
                          <span className="min-w-0 text-xl leading-snug sm:text-2xl">{t.name}</span>
                          {(t.slug.includes('sahih') || t.slug.includes('hilali') || t.languageCode !== 'en') && <Info className="ml-3 h-6 w-6 shrink-0 text-slate-300" />}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
          <div className="flex gap-4">
            <button type="button" className="h-14 flex-1 rounded-2xl border-2 border-slate-300 text-lg font-semibold transition hover:bg-slate-50 disabled:opacity-40" onClick={clearAll} disabled={selected.size === 0}>Clear All</button>
            <button type="button" className="h-14 flex-1 rounded-2xl bg-[var(--accent)] text-lg font-semibold text-white transition hover:bg-[var(--accent)]/90" onClick={apply}>Apply{selected.size > 0 ? ` (${selected.size})` : ''}</button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
