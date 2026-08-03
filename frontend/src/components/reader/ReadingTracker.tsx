'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

interface Props {
  surahNumber: number;
  surahName: string;
  firstAyahNumber: number;
}

/**
 * Invisible client component mounted inside the surah page.
 * Persists reading position to settingsStore (localStorage) on every visit.
 */
export function ReadingTracker({ surahNumber, surahName, firstAyahNumber }: Props) {
  const setLastRead = useSettingsStore((s) => s.setLastRead);
  const addRecentSurah = useSettingsStore((s) => s.addRecentSurah);

  useEffect(() => {
    setLastRead({
      surahNumber,
      surahName,
      ayahNumber: firstAyahNumber,
      timestamp: Date.now(),
    });
    addRecentSurah(surahNumber);
  }, [surahNumber, surahName, firstAyahNumber, setLastRead, addRecentSurah]);

  return null;
}
