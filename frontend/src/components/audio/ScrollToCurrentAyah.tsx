'use client';

import { useEffect } from 'react';
import { useAudioStore } from '@/stores/audioStore';

export function ScrollToCurrentAyah() {
  const getCurrentAyah = useAudioStore((s) => s.getCurrentAyah);
  const currentIndex = useAudioStore((s) => s.currentIndex);
  const current = getCurrentAyah();

  useEffect(() => {
    if (!current) return;
    const el = document.getElementById(`ayah-${current.ayahId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [current?.ayahId, currentIndex]);

  return null;
}
