'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Check, Loader2, Languages } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { quranApi, type Translator } from '@/lib/api';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

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
  ps: 'Pashto',
  fa: 'Persian',
  es: 'Spanish',
  nl: 'Dutch',
  it: 'Italian',
};

function getLangName(code: string) {
  return LANG_NAMES[code] ?? code.toUpperCase();
}

export function TranslationSheet({ open, onOpenChange }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { translationSlugs, setTranslationSlugs } = useSettingsStore();

  const [translators, setTranslators] = useState<Translator[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(translationSlugs));

  // Fetch translators on first open
  useEffect(() => {
    if (!open || translators.length > 0) return;
    setLoading(true);
    quranApi.translators()
      .then((data) => setTranslators(Array.isArray(data) ? data : []))
      .catch(() => setTranslators([]))
      .finally(() => setLoading(false));
  }, [open, translators.length]);

  // Sync selected state when sheet opens
  useEffect(() => {
    if (open) setSelected(new Set(translationSlugs));
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

    // Update URL so the server fetches the correct translations
    const params = new URLSearchParams(searchParams.toString());
    if (slugs.length > 0) {
      params.set('trans', slugs.join(','));
    } else {
      params.delete('trans');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    onOpenChange(false);
  }, [selected, setTranslationSlugs, searchParams, pathname, router, onOpenChange]);

  const clearAll = useCallback(() => setSelected(new Set()), []);

  // Group translators by language
  const byLang = translators.reduce<Record<string, Translator[]>>((acc, t) => {
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
        className="flex w-full flex-col bg-[var(--surface)] p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <Languages className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle className="text-[var(--fg)]">Translations</SheetTitle>
              <SheetDescription className="text-xs text-[var(--muted)]">
                {selected.size === 0
                  ? 'No translation selected'
                  : `${selected.size} selected`}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Translator list */}
        <ScrollArea className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--muted)]" />
            </div>
          ) : translators.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-[var(--muted)]">
              No translations available
            </div>
          ) : (
            <div className="px-4 py-3">
              {langOrder.map((lang, i) => (
                <div key={lang}>
                  {i > 0 && <Separator className="my-3 bg-[var(--border)]" />}
                  <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    {getLangName(lang)}
                  </p>
                  <div className="space-y-1">
                    {byLang[lang].map((t) => {
                      const isSelected = selected.has(t.slug);
                      return (
                        <button
                          key={t.slug}
                          type="button"
                          onClick={() => toggle(t.slug)}
                          className={cn(
                            'group flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-all',
                            isSelected
                              ? 'bg-[var(--accent)]/10 text-[var(--fg)]'
                              : 'text-[var(--fg)] hover:bg-[var(--ayah-highlight)]'
                          )}
                        >
                          <span className="text-sm font-medium">{t.name}</span>
                          <div
                            className={cn(
                              'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                              isSelected
                                ? 'border-[var(--accent)] bg-[var(--accent)]'
                                : 'border-[var(--border)] group-hover:border-[var(--accent)]/50'
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Actions */}
        <div className="border-t border-[var(--border)] px-6 py-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={clearAll}
              disabled={selected.size === 0}
            >
              Clear All
            </Button>
            <Button className="flex-1" onClick={apply}>
              Apply{selected.size > 0 ? ` (${selected.size})` : ''}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
