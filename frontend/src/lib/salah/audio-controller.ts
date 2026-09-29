'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { InstructionLanguage, LessonMode, StepRecitation } from './types';
import { apiBase } from '@/lib/api';

export type AudioState =
  | 'idle'
  | 'narrating'
  | 'reciting'
  | 'practice_paused'
  | 'paused';

interface UseSalahAudioControllerOptions {
  language: InstructionLanguage;
  mode: LessonMode;
  playbackSpeed: number; // 0.75 | 1.0 | 1.25
  isMuted: boolean;
  onStepComplete?: () => void;
  onPhraseComplete?: (recitationIndex: number) => void;
}

export function useSalahAudioController({
  language,
  mode,
  playbackSpeed,
  isMuted,
  onStepComplete,
  onPhraseComplete,
}: UseSalahAudioControllerOptions) {
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [activeRecitationIndex, setActiveRecitationIndex] = useState<number>(-1);
  const [practiceCountdown, setPracticeCountdown] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCancelledRef = useRef<boolean>(false);
  const currentNarrationRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Stop everything safely
  const stopAllAudio = useCallback(() => {
    isCancelledRef.current = true;

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    currentNarrationRef.current = null;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setAudioState('idle');
    setActiveRecitationIndex(-1);
    setPracticeCountdown(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, [stopAllAudio]);

  // Play narration text using speech synthesis
  const playNarration = useCallback(
    (text: string, lang: InstructionLanguage): Promise<void> => {
      return new Promise((resolve) => {
        if (isMuted || !text || typeof window === 'undefined' || !window.speechSynthesis) {
          resolve();
          return;
        }

        window.speechSynthesis.cancel();

        const langTag =
          lang === 'ur' ? 'ur-PK' : lang === 'ps' ? 'ps-AF' : 'en-US';

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = playbackSpeed;
        utterance.lang = langTag;

        // Try to match appropriate system voice
        const voices = window.speechSynthesis.getVoices();
        const matchedVoice = voices.find((v) =>
          v.lang.toLowerCase().startsWith(lang.toLowerCase()),
        );
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }

        utterance.onstart = () => {
          if (isCancelledRef.current) {
            window.speechSynthesis.cancel();
            resolve();
            return;
          }
          setAudioState('narrating');
        };

        utterance.onend = () => {
          currentNarrationRef.current = null;
          resolve();
        };

        utterance.onerror = () => {
          currentNarrationRef.current = null;
          resolve();
        };

        currentNarrationRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      });
    },
    [isMuted, playbackSpeed],
  );

  // Play verified Arabic recitation audio file
  const playArabicAudio = useCallback(
    (recitation: StepRecitation, index: number): Promise<void> => {
      return new Promise((resolve) => {
        if (isMuted || isCancelledRef.current) {
          resolve();
          return;
        }

        setActiveRecitationIndex(index);
        setAudioState('reciting');

        // Check if a direct audio URL is provided
        const audioUrl = recitation.audioUrl;
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          audio.playbackRate = playbackSpeed;
          audioRef.current = audio;

          audio.onended = () => {
            audioRef.current = null;
            onPhraseComplete?.(index);
            resolve();
          };

          audio.onerror = () => {
            audioRef.current = null;
            // Fallback: measured speech synthesis with Arabic voice
            if (window.speechSynthesis) {
              const utter = new SpeechSynthesisUtterance(recitation.arabicText);
              utter.lang = 'ar-SA';
              utter.rate = 0.85 * playbackSpeed;
              utter.onend = () => {
                onPhraseComplete?.(index);
                resolve();
              };
              utter.onerror = () => resolve();
              window.speechSynthesis.speak(utter);
            } else {
              resolve();
            }
          };

          audio.play().catch(() => {
            // Browser autoplay rejection fallback
            resolve();
          });
        } else {
          // If no recorded audio asset is attached yet, use clear Arabic voice
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            const utter = new SpeechSynthesisUtterance(recitation.arabicText);
            utter.lang = 'ar-SA';
            utter.rate = 0.85 * playbackSpeed;
            utter.onend = () => {
              onPhraseComplete?.(index);
              resolve();
            };
            utter.onerror = () => resolve();
            window.speechSynthesis.speak(utter);
          } else {
            resolve();
          }
        }
      });
    },
    [isMuted, playbackSpeed, onPhraseComplete],
  );

  // Execute Step Audio Sequence (Guided vs Practice)
  const playStepSequence = useCallback(
    async (spokenText: string, recitations: StepRecitation[]) => {
      stopAllAudio();
      isCancelledRef.current = false;

      // 1. Play Spoken Instruction Narration first (Never talk over recitation)
      if (spokenText && !isMuted) {
        await playNarration(spokenText, language);
        if (isCancelledRef.current) return;
      }

      // 2. Play Arabic Recitations sequentially
      for (let i = 0; i < recitations.length; i++) {
        if (isCancelledRef.current) break;

        const rec = recitations[i];
        const repeatTimes = rec.repeatCount || 1;

        for (let r = 0; r < repeatTimes; r++) {
          if (isCancelledRef.current) break;

          await playArabicAudio(rec, i);
          if (isCancelledRef.current) break;

          // In Practice Mode: pause after each phrase to allow learner to repeat
          if (mode === 'practice') {
            setAudioState('practice_paused');
            setPracticeCountdown(5); // 5-second repeat pause window

            await new Promise<void>((waitResolve) => {
              let count = 5;
              countdownIntervalRef.current = setInterval(() => {
                count -= 1;
                setPracticeCountdown(count);
                if (count <= 0 || isCancelledRef.current) {
                  if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                    countdownIntervalRef.current = null;
                  }
                  waitResolve();
                }
              }, 1000);
            });

            if (isCancelledRef.current) break;
          }
        }
      }

      if (!isCancelledRef.current) {
        setAudioState('idle');
        setActiveRecitationIndex(-1);
        onStepComplete?.();
      }
    },
    [language, mode, isMuted, playNarration, playArabicAudio, stopAllAudio, onStepComplete],
  );

  return {
    audioState,
    activeRecitationIndex,
    practiceCountdown,
    playStepSequence,
    stopAllAudio,
  };
}
