'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { audioApi, type Reciter } from '@/lib/api';
import { useAudioStore } from '@/stores/audioStore';
import { useSettingsStore } from '@/stores/settingsStore';

/** Shared reciter-selection logic used by AudioBar (during playback) and
 * ReaderToolbar (before playback starts). Picking a reciter always updates
 * the persisted default; if a playlist is already active it's refetched
 * in place so playback continues from the same ayah with the new voice. */
export function useReciterPicker() {
  const { getCurrentAyah, setReciter, setPlaylist, setCurrentIndex, setPlaying, isPlaying } =
    useAudioStore();
  const { reciterSlug: settingsReciter, setReciterSlug } = useSettingsStore();
  const activeReciter = useAudioStore((s) => s.reciterSlug) ?? settingsReciter;

  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [reciterOpen, setReciterOpen] = useState(false);
  const [reciterLoading, setReciterLoading] = useState(false);
  const reciterRef = useRef<HTMLDivElement>(null);

  const activeReciterName =
    reciters.find((r) => r.slug === activeReciter)?.name ?? activeReciter ?? 'Reciter';

  const changeReciter = useCallback(
    async (slug: string) => {
      setReciter(slug);
      setReciterSlug(slug);
      setReciterOpen(false);

      const current = getCurrentAyah();
      if (!current) return;

      try {
        const list = await audioApi.surah(current.surahNumber, slug);
        const items = list
          .filter((a) => a.url)
          .map((a) => ({
            ayahId: a.ayahId,
            surahNumber: a.surahNumber,
            ayahNumber: a.ayahNumber,
            url: a.url!,
            duration: a.duration ?? undefined,
          }));
        const idx = items.findIndex((a) => a.ayahNumber === current.ayahNumber);
        setPlaylist(items);
        if (idx >= 0) setCurrentIndex(idx);
        setPlaying(isPlaying);
      } catch {
        setPlaying(false);
      }
    },
    [getCurrentAyah, isPlaying, setCurrentIndex, setPlaying, setPlaylist, setReciter, setReciterSlug]
  );

  useEffect(() => {
    if (!reciterOpen || reciters.length > 0) return;
    setReciterLoading(true);
    audioApi
      .reciters()
      .then((data) => setReciters(Array.isArray(data) ? data : []))
      .catch(() => setReciters([]))
      .finally(() => setReciterLoading(false));
  }, [reciterOpen, reciters.length]);

  useEffect(() => {
    if (!reciterOpen) return;
    const handler = (e: MouseEvent) => {
      if (reciterRef.current && !reciterRef.current.contains(e.target as Node)) {
        setReciterOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [reciterOpen]);

  return {
    reciters,
    reciterOpen,
    setReciterOpen,
    reciterLoading,
    reciterRef,
    activeReciter,
    activeReciterName,
    changeReciter,
  };
}
