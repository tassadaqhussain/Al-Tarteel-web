'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { AyahBlock } from '@/components/reader/AyahBlock';
import { quranApi, type AyahWithRelations } from '@/lib/api';
import { useAudioStore } from '@/stores/audioStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';

export const SURAH_PAGE_SIZE = 20;

interface Props {
  surahNumber: number;
  surahName: string;
  initialAyahs: AyahWithRelations[];
  initialPage: number;
  totalPages: number;
  translations: string;
  hasTranslations: boolean;
  endOfChapter?: ReactNode;
}

export function SurahAyahFeed({
  surahNumber,
  surahName,
  initialAyahs,
  initialPage,
  totalPages,
  translations,
  hasTranslations,
  endOfChapter,
}: Props) {
  const [ayahs, setAyahs] = useState(initialAyahs);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const pageRef = useRef(page);
  const ayahsRef = useRef(ayahs);

  const hasMore = page < totalPages;
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const current = useAudioStore((s) => s.playlist[s.currentIndex] ?? null);
  const readerViewMode = useSettingsStore((s) => s.readerViewMode);

  useEffect(() => {
    setAyahs(initialAyahs);
    setPage(initialPage);
    pageRef.current = initialPage;
    ayahsRef.current = initialAyahs;
    setError(null);
  }, [initialAyahs, initialPage, surahNumber, translations]);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    ayahsRef.current = ayahs;
  }, [ayahs]);

  // Tell the auto-scroller when the recited ayah has been mounted (infinite load).
  useEffect(() => {
    const current = useAudioStore.getState().playlist[useAudioStore.getState().currentIndex] ?? null;
    if (!current || current.surahNumber !== surahNumber) return;
    if (!ayahs.some((ayah) => ayah.id === current.ayahId)) return;
    window.dispatchEvent(
      new CustomEvent('quranpilot:ayah-mounted', { detail: { ayahId: current.ayahId } }),
    );
  }, [ayahs, surahNumber]);

  const syncUrlPage = useCallback((nextPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.delete('trans');
    if (nextPage <= 1) params.delete('page');
    else params.set('page', String(nextPage));
    const qs = params.toString();
    const href = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
    window.history.replaceState(window.history.state, '', href);
  }, []);

  const loadPage = useCallback(
    async (targetPage: number) => {
      if (loadingRef.current) return false;
      if (targetPage <= pageRef.current || targetPage > totalPages) return false;

      loadingRef.current = true;
      setLoading(true);
      setError(null);
      try {
        // Load sequentially so we don't leave gaps when audio jumps ahead.
        for (let p = pageRef.current + 1; p <= targetPage; p += 1) {
          const batch = await quranApi.ayahsBySurah(surahNumber, {
            page: p,
            limit: SURAH_PAGE_SIZE,
            translations,
            words: true,
          });
          const list = Array.isArray(batch) ? batch : [];
          setAyahs((prev) => {
            const seen = new Set(prev.map((ayah) => ayah.id));
            const merged = [...prev];
            for (const ayah of list) {
              if (!seen.has(ayah.id)) merged.push(ayah);
            }
            ayahsRef.current = merged;
            return merged;
          });
          pageRef.current = p;
          setPage(p);
          syncUrlPage(p);
        }
        return true;
      } catch {
        setError('Could not load more verses. Scroll again to retry.');
        return false;
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [surahNumber, syncUrlPage, totalPages, translations]
  );

  const loadNext = useCallback(() => {
    void loadPage(pageRef.current + 1);
  }, [loadPage]);

  // Infinite scroll sentinel
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadNext();
      },
      { rootMargin: '400px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadNext, ayahs.length]);

  // While reciting, keep loading pages until the spoken ayah is in the DOM.
  useEffect(() => {
    if (!isPlaying || !current || current.surahNumber !== surahNumber) return;
    if (ayahsRef.current.some((ayah) => ayah.id === current.ayahId)) return;
    const targetPage = Math.floor((current.ayahNumber - 1) / SURAH_PAGE_SIZE) + 1;
    if (targetPage > pageRef.current) void loadPage(targetPage);
  }, [current?.ayahId, current?.ayahNumber, current?.surahNumber, isPlaying, loadPage, surahNumber]);

  useEffect(() => {
    const onEnsure = (event: Event) => {
      const detail = (event as CustomEvent<{ surahNumber: number; ayahNumber: number }>).detail;
      if (!detail || detail.surahNumber !== surahNumber) return;
      const targetPage = Math.floor((detail.ayahNumber - 1) / SURAH_PAGE_SIZE) + 1;
      if (targetPage > pageRef.current) void loadPage(targetPage);
    };
    window.addEventListener('quranpilot:ensure-ayah', onEnsure);
    return () => window.removeEventListener('quranpilot:ensure-ayah', onEnsure);
  }, [loadPage, surahNumber]);

  return (
    <>
      <div
        className={cn(
          readerViewMode === 'verse' && 'divide-y divide-slate-200 border-t border-slate-200',
          readerViewMode === 'arabic' &&
            'arabic-mushaf-feed rounded-2xl bg-white px-3 py-8 text-center shadow-sm sm:px-8 sm:py-10',
          readerViewMode === 'translation' &&
            'space-y-1 rounded-2xl bg-white px-3 py-4 shadow-sm sm:px-6'
        )}
      >
        {ayahs.map((ayah) => (
          <AyahBlock
            key={ayah.id}
            ayah={ayah}
            surahNumber={surahNumber}
            surahName={surahName}
            hasTranslations={hasTranslations}
          />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="flex flex-col items-center gap-2 py-10" aria-live="polite">
          {loading ? (
            <span className="inline-flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading more verses…
            </span>
          ) : (
            <button
              type="button"
              onClick={loadNext}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Load more verses
            </button>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}

      {!hasMore && endOfChapter}
    </>
  );
}
