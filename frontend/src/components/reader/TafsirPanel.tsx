'use client';

import { useState, useEffect } from 'react';
import { BookMarked, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { quranApi, type TafsirItem, type TafsirSource } from '@/lib/api';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ayahId: number | null;
  surahName: string;
  ayahNumber: number | null;
  ayahText: string;
  translations?: { translatorId: number; translatorSlug: string; text: string }[];
}

function sanitizeTafsirHtml(text: string) {
  if (typeof window === 'undefined') return text;

  const doc = new DOMParser().parseFromString(text, 'text/html');
  doc.querySelectorAll('script, iframe, object, embed, link, style').forEach((node) => node.remove());
  doc.body.querySelectorAll('*').forEach((node) => {
    [...node.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith('on') || value.startsWith('javascript:')) {
        node.removeAttribute(attr.name);
      }
    });
  });

  return doc.body.innerHTML;
}

export function TafsirPanel({
  open,
  onOpenChange,
  ayahId,
  surahName,
  ayahNumber,
  ayahText,
  translations = [],
}: Props) {
  const { tafsirSlug, setTafsirSlug } = useSettingsStore();

  const [sources, setSources] = useState<TafsirSource[]>([]);
  const [tafsirs, setTafsirs] = useState<TafsirItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sourcesLoading, setSourcesLoading] = useState(false);

  // Fetch available sources once
  useEffect(() => {
    if (!open || sources.length > 0) return;
    setSourcesLoading(true);
    quranApi.tafsirSources()
      .then((data) => setSources(Array.isArray(data) ? data : []))
      .catch(() => setSources([]))
      .finally(() => setSourcesLoading(false));
  }, [open, sources.length]);

  // Fetch tafsir for current ayah whenever ayahId or source changes.
  // With no selected source we intentionally fetch all available tafsirs, then
  // promote the first one so the panel opens with useful content.
  useEffect(() => {
    if (!open || ayahId === null) return;
    setLoading(true);
    setTafsirs([]);
    quranApi.tafsir(ayahId, tafsirSlug ?? undefined)
      .then((data) => {
        const next = Array.isArray(data) ? data : [];
        setTafsirs(next);
        if (!tafsirSlug && next[0]?.source.slug) {
          setTafsirSlug(next[0].source.slug);
        }
      })
      .catch(() => setTafsirs([]))
      .finally(() => setLoading(false));
  }, [open, ayahId, tafsirSlug, setTafsirSlug]);

  const displayTafsir = tafsirs.find((t) => t.source.slug === tafsirSlug) ?? tafsirs[0] ?? null;
  const activeSource = sources.find((s) => s.slug === displayTafsir?.source.slug) ?? displayTafsir?.source;
  const availableSourceSlugs = new Set(tafsirs.map((t) => t.source.slug));
  const sortedSources = [
    ...sources.filter((source) => availableSourceSlugs.has(source.slug)),
    ...sources.filter((source) => !availableSourceSlugs.has(source.slug)),
  ];
  const tafsirHtml = displayTafsir ? sanitizeTafsirHtml(displayTafsir.text) : '';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col bg-[var(--surface)] p-0 sm:max-w-2xl"
      >
        <SheetHeader className="border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center gap-3 pr-10">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10 text-gold-500">
                <BookMarked className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-[var(--fg)]">Tafsir</SheetTitle>
                <SheetDescription className="text-xs text-[var(--muted)]">
                  {surahName} {ayahNumber}
                </SheetDescription>
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="space-y-6 px-6 py-5">
            <section className="border-b border-[var(--border)] pb-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[var(--fg)]">{surahName}</p>
                <span className="rounded border border-[var(--border)] px-2 py-1 text-xs tabular-nums text-[var(--muted)]">
                  {ayahNumber}
                </span>
              </div>
              <p className="font-arabic text-2xl leading-loose text-[var(--fg)]" lang="ar" dir="rtl">
                {ayahText}
              </p>
              {translations[0]?.text && (
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                  {translations[0].text}
                </p>
              )}
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2 overflow-x-auto border-b border-[var(--border)] pb-2">
                {sourcesLoading ? (
                  <div className="flex h-9 items-center gap-2 text-sm text-[var(--muted)]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading tafsirs
                  </div>
                ) : sortedSources.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">No tafsir sources available</p>
                ) : (
                  sortedSources.map((src) => {
                    const isActive = src.slug === activeSource?.slug;
                    return (
                      <button
                        key={src.slug}
                        type="button"
                        onClick={() => setTafsirSlug(src.slug)}
                        className={cn(
                          'shrink-0 border-b-2 px-1 pb-2 text-sm transition-colors',
                          isActive
                            ? 'border-[var(--accent)] font-medium text-[var(--accent)]'
                            : 'border-transparent text-[var(--muted)] hover:text-[var(--fg)]'
                        )}
                      >
                        {src.name}
                      </button>
                    );
                  })
                )}
              </div>

            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--muted)]" />
              </div>
            ) : !displayTafsir ? (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
                <BookMarked className="h-8 w-8 text-[var(--border)]" />
                <p className="text-sm text-[var(--muted)]">
                  {tafsirSlug
                    ? 'No tafsir available for this verse'
                    : 'Select a tafsir source above to begin'}
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-medium text-gold-500">
                    {displayTafsir.source.name}
                  </span>
                  {displayTafsir.source.languageCode && (
                    <span className="text-xs text-[var(--muted)]">
                      {displayTafsir.source.languageCode.toUpperCase()}
                    </span>
                  )}
                  {activeSource?.author && (
                    <span className="text-xs text-[var(--muted)]">
                      by {activeSource.author}
                    </span>
                  )}
                </div>

                <div
                  className="tafsir-content text-[var(--fg)]"
                  dir={displayTafsir.source.languageCode === 'ar' ? 'rtl' : 'ltr'}
                  dangerouslySetInnerHTML={{ __html: tafsirHtml }}
                />
              </div>
            )}
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
