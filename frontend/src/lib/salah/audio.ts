'use client';

import { useState, useCallback, useEffect } from 'react';

export function useSalahSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState<string | null>(null);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentText(null);
  }, []);

  const speak = useCallback(
    (arabicText: string, englishFallback?: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      window.speechSynthesis.cancel();

      const textToSpeak = arabicText || englishFallback || '';
      if (!textToSpeak) return;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.85; // Slightly slower, measured pace for prayer recitation

      // Try finding an Arabic voice first
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find((v) => v.lang.startsWith('ar'));
      if (arabicVoice) {
        utterance.voice = arabicVoice;
        utterance.lang = arabicVoice.lang;
      } else {
        utterance.lang = 'ar-SA';
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        setCurrentText(textToSpeak);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentText(null);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setCurrentText(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isPlaying,
    currentText,
    speak,
    stop,
  };
}
