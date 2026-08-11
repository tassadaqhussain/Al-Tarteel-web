'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  Loader2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { aiApi } from '@/lib/api';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAskAiStore } from '@/stores/askAiStore';
import { cn } from '@/lib/utils';

type SpeechRecognitionCtor = new () => {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: {
    results: ArrayLike<ArrayLike<{ transcript: string }>>;
  }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type ChatTurn = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS = [
  'What is the meaning of Surah Al-Fatihah?',
  'Explain Ayat al-Kursi (2:255) briefly.',
  'How should I start learning to read the Quran?',
  'What does Islam say about patience?',
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function useIsMobileSheet(maxWidthPx = 639) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidthPx}px)`);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [maxWidthPx]);
  return isMobile;
}

export function AskAiSheet({ open, onOpenChange }: Props) {
  const locale = useSettingsStore((s) => s.uiLocale);
  const isMobile = useIsMobileSheet();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [promptLimit, setPromptLimit] = useState(0);
  const [promptsRemaining, setPromptsRemaining] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<InstanceType<SpeechRecognitionCtor> | null>(null);

  const limitReached = promptLimit > 0 && promptsRemaining === 0;

  useEffect(() => {
    if (!open) return;
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    setVoiceSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));

    aiApi
      .config()
      .then((cfg) => {
        setPromptLimit(cfg.promptLimit ?? 0);
        setPromptsRemaining(cfg.promptsRemaining ?? null);
      })
      .catch(() => {
        /* ignore — ask will surface errors */
      });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, open]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const startListening = () => {
    if (limitReached) {
      setError(`Free Ask AI limit reached (${promptLimit} prompts).`);
      return;
    }
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      setError('Voice input is not supported in this browser.');
      return;
    }
    setError(null);
    const recognition = new Ctor();
    recognition.lang =
      locale === 'ar'
        ? 'ar-SA'
        : locale === 'ur'
          ? 'ur-PK'
          : locale === 'fa'
            ? 'fa-IR'
            : locale === 'fr'
              ? 'fr-FR'
              : locale === 'id'
                ? 'id-ID'
                : locale === 'tr'
                  ? 'tr-TR'
                  : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const spoken = event.results[0]?.[0]?.transcript?.trim();
      if (spoken) setInput((prev) => (prev ? `${prev} ${spoken}` : spoken));
    };
    recognition.onerror = (event) => {
      setListening(false);
      if (event.error === 'not-allowed') {
        setError('Microphone permission denied.');
      } else if (event.error !== 'aborted') {
        setError('Voice recognition failed. Try again.');
      }
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || loading) return;
    if (limitReached) {
      setError(`Free Ask AI limit reached (${promptLimit} prompts).`);
      return;
    }
    setError(null);
    setInput('');
    const nextMessages: ChatTurn[] = [...messages, { role: 'user', content: q }];
    setMessages(nextMessages);
    setLoading(true);
    try {
      const res = await aiApi.ask({
        question: q,
        locale,
        history: nextMessages.slice(0, -1).slice(-8),
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.answer }]);
      if (typeof res.promptLimit === 'number') setPromptLimit(res.promptLimit);
      if (res.promptsRemaining !== undefined) setPromptsRemaining(res.promptsRemaining);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach AI.');
      setMessages((prev) => {
        if (prev.length && prev[prev.length - 1]?.role === 'user' && prev[prev.length - 1]?.content === q) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setLoading(false);
    }
  };

  // Voice / external entry: open sheet with a ready-made question.
  useEffect(() => {
    if (!open) return;
    const pending = useAskAiStore.getState().consumePendingPrompt();
    if (!pending) return;
    if (pending.autoAsk) {
      void ask(pending.prompt);
    } else {
      setInput(pending.prompt);
    }
    // Intentionally only when `open` flips true with a queued prompt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(input);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) stopListening();
        onOpenChange(v);
      }}
    >
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        showClose={false}
        overlayClassName="max-sm:bottom-[var(--audio-bar-height,0px)]"
        className={cn(
          'flex flex-col gap-0 overflow-hidden border-slate-200 bg-white p-0 text-slate-800',
          isMobile
            ? [
                'inset-x-0 top-auto z-[55] h-[min(78dvh,calc(100dvh-var(--audio-bar-height,0px)-0.75rem))]',
                'max-h-[calc(100dvh-var(--audio-bar-height,0px)-0.75rem)] w-full max-w-none',
                'bottom-[var(--audio-bar-height,0px)] rounded-t-2xl border-x-0 border-b-0 border-t',
                'pb-[max(0.25rem,env(safe-area-inset-bottom,0px))]',
                'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
              ]
            : 'h-full w-full max-w-none border-l sm:max-w-[420px]',
        )}
      >
        {isMobile && (
          <div className="flex justify-center pb-1 pt-2" aria-hidden>
            <span className="h-1 w-10 rounded-full bg-slate-300" />
          </div>
        )}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <SheetTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <Sparkles className="h-4 w-4" />
              </span>
              Ask AI
            </SheetTitle>
            <p className="mt-1 text-xs text-slate-500">
              Questions about the Quran & Islam
              {promptLimit > 0 && promptsRemaining !== null
                ? ` · ${promptsRemaining} of ${promptLimit} free prompts left`
                : ''}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setMessages([]);
                  setError(null);
                }}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={listRef}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5 sm:py-4"
        >
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                {limitReached
                  ? `Free Ask AI limit reached (${promptLimit} prompts).`
                  : 'Ask in writing or tap the mic. Try one of these:'}
              </p>
              {!limitReached && (
                <div className="flex flex-col gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void ask(s)}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-left text-sm text-slate-700 transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              className={cn(
                'max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
                m.role === 'user'
                  ? 'ml-auto bg-[var(--accent)] text-white'
                  : 'mr-auto border border-slate-200 bg-slate-50 text-slate-800',
              )}
            >
              {m.content}
            </div>
          ))}

          {loading && (
            <div className="mr-auto flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
            </div>
          )}
        </div>

        {error && (
          <p className="mx-4 mb-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 sm:mx-5" role="alert">
            {error}
          </p>
        )}

        <form
          onSubmit={onSubmit}
          className="sticky bottom-0 border-t border-slate-200 bg-white px-3 py-3 sm:px-4"
        >
          <div className="flex items-end gap-2">
            {voiceSupported && (
              <button
                type="button"
                onClick={() => (listening ? stopListening() : startListening())}
                disabled={limitReached}
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition',
                  listening
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-slate-200 text-slate-600 hover:border-[var(--accent)] hover:text-[var(--accent)]',
                  limitReached && 'opacity-50',
                )}
                aria-label={listening ? 'Stop listening' : 'Ask by voice'}
              >
                {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
            )}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={1}
              disabled={limitReached}
              placeholder={
                limitReached
                  ? 'Free prompt limit reached'
                  : listening
                    ? 'Listening…'
                    : 'Ask anything about the Quran…'
              }
              className="max-h-28 min-h-[2.75rem] flex-1 resize-none rounded-2xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 disabled:bg-slate-50 disabled:text-slate-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void ask(input);
                }
              }}
            />
            <button
              type="submit"
              disabled={loading || limitReached || !input.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white transition hover:bg-[var(--accent)]/90 disabled:opacity-50"
              aria-label="Send"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-slate-400">
            AI can make mistakes. Verify important matters with trusted scholars.
          </p>
        </form>
      </SheetContent>
    </Sheet>
  );
}
