'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { getSurahArabicName } from '@/lib/surah-meta';

interface Props {
  surahNumber: number;
  surahName: string;
  surahNameArabic?: string;
  firstAyahNumber: number;
}

/**
 * Invisible client component mounted inside the surah page.
 * Persists reading position to settingsStore (localStorage) on every visit.
 */
export function ReadingTracker({
  surahNumber,
  surahName,
  surahNameArabic,
  firstAyahNumber,
}: Props) {
  const setLastRead = useSettingsStore((s) => s.setLastRead);
  const addRecentSurah = useSettingsStore((s) => s.addRecentSurah);

  useEffect(() => {
    setLastRead({
      surahNumber,
      surahName,
      surahNameArabic: getSurahArabicName(surahNumber, surahNameArabic),
      ayahNumber: firstAyahNumber,
      timestamp: Date.now(),
    });
    addRecentSurah(surahNumber);
  }, [surahNumber, surahName, surahNameArabic, firstAyahNumber, setLastRead, addRecentSurah]);

  return null;
}
