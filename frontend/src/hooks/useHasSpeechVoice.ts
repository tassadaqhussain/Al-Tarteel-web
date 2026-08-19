'use client';

import { useEffect, useState } from 'react';
import { hasVoiceForLocale, subscribeToVoices, warmSpeechVoices } from '@/lib/speakWordMeaning';

/**
 * Whether this device can actually speak `localeCode`.
 *
 * SpeechSynthesis silently no-ops for languages the OS has no voice for, and
 * several desktop platforms ship none for Urdu or Persian. Voices also load
 * asynchronously in Chrome, so this re-checks on `voiceschanged` instead of
 * deciding once on first render.
 *
 * Starts false and turns true once a voice is confirmed, so the UI never
 * offers a control that would do nothing.
 */
export function useHasSpeechVoice(localeCode: string): boolean {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = () => {
      if (!cancelled) setAvailable(hasVoiceForLocale(localeCode));
    };
    warmSpeechVoices();
    check();
    const unsubscribe = subscribeToVoices(check);
    // Safari can populate voices without firing the event.
    const retry = window.setTimeout(check, 800);
    return () => {
      cancelled = true;
      window.clearTimeout(retry);
      unsubscribe();
    };
  }, [localeCode]);

  return available;
}
