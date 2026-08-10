/**
 * Web Speech API wrapper for multilingual voice search & command recognition.
 */

export type VoiceLanguage = 'en-US' | 'ur-PK' | 'ar-SA';

export interface SpeechRecognitionOptions {
  lang?: VoiceLanguage;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult:
    | ((event: {
        results: ArrayLike<{
          isFinal?: boolean;
          [index: number]: { transcript: string; confidence?: number };
        }>;
      }) => void)
    | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export class VoiceSpeechRecognizer {
  private recognition: SpeechRecognitionInstance | null = null;
  private isListening = false;

  public static isSupported(): boolean {
    return isSpeechRecognitionSupported();
  }

  public start(options: SpeechRecognitionOptions = {}): boolean {
    if (typeof window === 'undefined') return false;

    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!Ctor) {
      options.onError?.('Speech recognition is not supported in this browser.');
      return false;
    }

    this.stop();

    try {
      const recognition = new Ctor();
      recognition.lang = options.lang || 'en-US';
      recognition.continuous = options.continuous ?? false;
      recognition.interimResults = options.interimResults ?? true;

      recognition.onstart = () => {
        this.isListening = true;
        options.onStart?.();
      };

      recognition.onend = () => {
        this.isListening = false;
        options.onEnd?.();
      };

      recognition.onerror = (event) => {
        this.isListening = false;
        options.onError?.(event.error || 'Speech recognition error');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          const text = res[0]?.transcript || '';
          if (res.isFinal) {
            final += text;
          } else {
            interim += text;
          }
        }

        const full = (final || interim).trim();
        if (full) {
          options.onResult?.(full, Boolean(final));
        }
      };

      this.recognition = recognition;
      recognition.start();
      return true;
    } catch (err) {
      this.isListening = false;
      options.onError?.(err instanceof Error ? err.message : 'Could not start microphone');
      return false;
    }
  }

  public stop(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        /* ignore */
      }
      this.recognition = null;
    }
    this.isListening = false;
  }

  public abort(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        /* ignore */
      }
      this.recognition = null;
    }
    this.isListening = false;
  }

  public getActiveListeningState(): boolean {
    return this.isListening;
  }
}
