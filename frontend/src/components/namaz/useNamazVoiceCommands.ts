'use client';

import { useEffect, useRef, useState } from 'react';
import type { SpeechRecognitionLike } from '@/lib/hifz/speech';
import { isSpeechSupported } from '@/lib/hifz/speech';
import {
  parseNamazVoiceCommand,
  RECOGNITION_LANG,
  voiceCommandLocale,
  type NamazVoiceCommand,
} from '@/lib/namaz/voice-commands';
import type { UiLocale } from '@/stores/settingsStore';

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

export type VoiceCommandStatus = 'off' | 'listening' | 'unsupported' | 'denied';

/**
 * Opt-in listening for a handful of navigation words. Recognition restarts
 * after each phrase while enabled and stops as soon as it is turned off or the
 * component unmounts. While the lesson's own voice is speaking, only "pause"
 * is accepted so the guidance cannot trigger commands.
 */
export function useNamazVoiceCommands(
  enabled: boolean,
  locale: UiLocale,
  onCommand: (command: NamazVoiceCommand) => void,
) {
  const [status, setStatus] = useState<VoiceCommandStatus>('off');
  const [lastHeard, setLastHeard] = useState<NamazVoiceCommand | null>(null);
  const handler = useRef(onCommand);
  useEffect(() => {
    handler.current = onCommand;
  }, [onCommand]);

  useEffect(() => {
    if (!enabled) {
      setStatus((s) => (s === 'denied' ? s : 'off'));
      return;
    }
    if (!isSpeechSupported()) {
      setStatus('unsupported');
      return;
    }
    const w = window as SpeechWindow;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      setStatus('unsupported');
      return;
    }
    const commandLocale = voiceCommandLocale(locale);
    let active = true;
    let rec: SpeechRecognitionLike | null = null;

    const start = () => {
      if (!active) return;
      rec = new Ctor();
      rec.lang = RECOGNITION_LANG[commandLocale];
      rec.continuous = true;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal === false) continue;
          const command = parseNamazVoiceCommand(result[0]?.transcript ?? '', commandLocale);
          if (!command) continue;
          if (window.speechSynthesis?.speaking && command !== 'pause') continue;
          setLastHeard(command);
          handler.current(command);
        }
      };
      rec.onerror = (event) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          active = false;
          setStatus('denied');
        }
      };
      rec.onend = () => {
        if (active) window.setTimeout(start, 300);
      };
      try {
        rec.start();
        setStatus('listening');
      } catch {
        setStatus('unsupported');
        active = false;
      }
    };

    start();
    return () => {
      active = false;
      if (rec) {
        rec.onend = null;
        rec.onresult = null;
        try {
          rec.abort();
        } catch {
          /* already stopped */
        }
      }
    };
  }, [enabled, locale]);

  return { status, lastHeard };
}
