'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useDailyMotivationStore } from '@/stores/dailyMotivationStore';
import { getSurahArabicName } from '@/lib/surah-meta';

interface Props {
  surahNumber: number;
  surahName: string;
  surahNameArabic?: string;
  firstAyahNumber: number;
}

/**
 * Invisible client component mounted inside the surah page.
 * Persists reading position, credits unique ayahs toward today's goal,
 * and softly tracks reading minutes while the chapter is open.
 */
export function ReadingTracker({
  surahNumber,
  surahName,
  surahNameArabic,
  firstAyahNumber,
}: Props) {
  const setLastRead = useSettingsStore((s) => s.setLastRead);
  const addRecentSurah = useSettingsStore((s) => s.addRecentSurah);
  const recordAyahView = useDailyMotivationStore((s) => s.recordAyahView);
  const addMinutes = useDailyMotivationStore((s) => s.addMinutes);

  useEffect(() => {
    setLastRead({
      surahNumber,
      surahName,
      surahNameArabic: getSurahArabicName(surahNumber, surahNameArabic),
      ayahNumber: firstAyahNumber,
      timestamp: Date.now(),
    });
    addRecentSurah(surahNumber);
    recordAyahView(surahNumber, firstAyahNumber);
  }, [
    surahNumber,
    surahName,
    surahNameArabic,
    firstAyahNumber,
    setLastRead,
    addRecentSurah,
    recordAyahView,
  ]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') addMinutes(1);
    }, 60_000);
    return () => window.clearInterval(id);
  }, [addMinutes]);

  return null;
}
