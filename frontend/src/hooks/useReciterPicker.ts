'use client';

import { useCallback, useEffect, useState } from 'react';
import { audioApi, type Reciter } from '@/lib/api';
import { catalogTranslationReciters } from '@/lib/audio/translation-reciters';
import { rebuildActivePlayback } from '@/lib/audio/playback';
import { useAudioStore } from '@/stores/audioStore';
import { useSettingsStore } from '@/stores/settingsStore';

/** Shared reciter-selection logic used by AudioBar (during playback) and
 * ReaderToolbar (before playback starts). Picking a reciter always updates
 * the persisted default; if a playlist is already active it's refetched
 * in place so playback continues from the same ayah with the new voice. */
export function useReciterPicker() {
  const { reciterSlug: settingsReciter, translationReciterSlug, setTranslationReciterSlug } =
    useSettingsStore();
  const activeReciter = useAudioStore((s) => s.reciterSlug) ?? settingsReciter;

  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [reciterOpen, setReciterOpen] = useState(false);
  const [reciterLoading, setReciterLoading] = useState(false);

  const active = reciters.find((r) => r.slug === activeReciter && r.kind !== 'translation');
  const activeTranslation = reciters.find((r) => r.slug === translationReciterSlug);
  const activeReciterName = active
    ? active.style
      ? `${active.name} (${active.style})`
      : active.name
    : activeReciter ?? 'Reciter';
  const activeTranslationName = activeTranslation
    ? `${activeTranslation.languageName || 'Translation'} · ${activeTranslation.name}`
    : 'Voice translation off';

  const changeReciter = useCallback(async (slug: string) => {
    setReciterOpen(false);
    const current = useAudioStore.getState().getCurrentAyah();
    if (!current) {
      useAudioStore.getState().setReciter(slug);
      useSettingsStore.getState().setReciterSlug(slug);
      return;
    }
    try {
      await rebuildActivePlayback({
        arabicSlug: slug,
        keepPlaying: useAudioStore.getState().isPlaying,
      });
    } catch {
      useAudioStore.getState().setPlaying(false);
    }
  }, []);

  const changeTranslationReciter = useCallback(async (slug: string | null) => {
    setTranslationReciterSlug(slug);
    setReciterOpen(false);
    const current = useAudioStore.getState().getCurrentAyah();
    if (!current) return;
    try {
      await rebuildActivePlayback({
        translationSlug: slug,
        keepPlaying: useAudioStore.getState().isPlaying,
      });
    } catch {
      useAudioStore.getState().setPlaying(false);
    }
  }, [setTranslationReciterSlug]);

  useEffect(() => {
    let cancelled = false;
    setReciterLoading(true);
    audioApi
      .reciters()
      .then((data) => {
        if (!cancelled) {
          const list = Array.isArray(data) ? data : [];
          const hasTranslations = list.some((item) => item.kind === 'translation');
          setReciters(hasTranslations ? list : [...list, ...catalogTranslationReciters()]);
        }
      })
      .catch(() => {
        if (!cancelled) setReciters([]);
      })
      .finally(() => {
        if (!cancelled) setReciterLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    reciters,
    reciterOpen,
    setReciterOpen,
    reciterLoading,
    activeReciter,
    activeReciterName,
    translationReciterSlug,
    activeTranslationName,
    changeReciter,
    changeTranslationReciter,
  };
}
