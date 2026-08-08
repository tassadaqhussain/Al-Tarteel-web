'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Mic, MicOff, RotateCcw, Send, Type, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { blankPlaceholder, compareRecitation, progressiveAyahFill, todayDateKey, type WordDiff } from '@/lib/hifz/compare';
import { createArabicRecognizer, isSpeechSupported } from '@/lib/hifz/speech';
import { hifzApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useHifzStore } from '@/stores/hifzStore';

type AyahItem = {
  id: number;
  number: number;
  textUthmani: string;
};

type Feedback = {
  accuracy: number;
  isCorrect: boolean;
  words: WordDiff[];
  expected: string;
  transcript: string;
};

export function HifzPracticeSession({
  surahNumber,
  ayahs,
}: {
  surahNumber: number;
  ayahs: AyahItem[];
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const recordLocal = useHifzStore((s) => s.record);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [learned, setLearned] = useState<Set<number>>(() => new Set());
  const [mode, setMode] = useState<'speech' | 'type'>(() =>
    typeof window !== 'undefined' && isSpeechSupported() ? 'speech' : 'type',
  );
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<ReturnType<typeof createArabicRecognizer>>(null);
  const currentRowRef = useRef<HTMLButtonElement | null>(null);
  const busyRef = useRef(false);
  const suppressEvalRef = useRef(false);
  const evaluateRef = useRef<(text: string, from: 'speech' | 'type') => Promise<void>>(async () => {});
  const startListeningRef = useRef<() => void>(() => {});
  const ayahTextRef = useRef('');
  const speechOk = isSpeechSupported();

  const ayah = ayahs[currentIndex] ?? null;
  ayahTextRef.current = ayah?.textUthmani ?? '';
  const liveFill = useMemo(
    () => (ayah ? progressiveAyahFill(ayah.textUthmani, transcript) : null),
    [ayah, transcript],
  );
  const learnedCount = learned.size;
  const complete = ayahs.length > 0 && learnedCount >= ayahs.length;
  const progress = ayahs.length ? Math.round((learnedCount / ayahs.length) * 100) : 0;

  const nextPendingIndex = useMemo(() => {
    const next = ayahs.findIndex((a) => !learned.has(a.number));
    return next === -1 ? ayahs.length : next;
  }, [ayahs, learned]);

  const stopListening = useCallback(() => {
    suppressEvalRef.current = true;
    try {
      recognitionRef.current?.stop?.();
      recognitionRef.current?.abort?.();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  const evaluate = useCallback(
    async (rawText: string, from: 'speech' | 'type') => {
      const text = rawText.trim();
      const current = ayahs[currentIndex];
      if (!current || !text || busyRef.current) return;

      busyRef.current = true;
      setBusy(true);
      setError(null);
      setTranscript(text);
      try {
        let result: Feedback;
        try {
          const remote = await hifzApi.check({
            surahNumber,
            ayahNumber: current.number,
            transcript: text,
            mode: from,
          });
          result = {
            accuracy: remote.accuracy,
            isCorrect: remote.isCorrect,
            words: remote.words,
            expected: remote.expected,
            transcript: text,
          };
        } catch {
          const local = compareRecitation(current.textUthmani, text);
          result = {
            accuracy: local.accuracy,
            isCorrect: local.isCorrect,
            words: local.words,
            expected: current.textUthmani,
            transcript: text,
          };
        }

        // If the ayah auto-filled completely while speaking, accept it.
        const filled = progressiveAyahFill(current.textUthmani, text);
        if (filled.complete) {
          result = {
            ...result,
            isCorrect: true,
            accuracy: Math.max(result.accuracy, 92),
          };
        }

        setFeedback(result);
        recordLocal({ accuracy: result.accuracy, isCorrect: result.isCorrect });

        if (isAuthenticated) {
          try {
            await hifzApi.recordAttempt({
              surahNumber,
              ayahNumber: current.number,
              mode: from,
              transcript: text,
              accuracy: result.accuracy,
              isCorrect: result.isCorrect,
              practiceDate: todayDateKey(),
            });
          } catch (e) {
            if (!(e instanceof ApiError && e.status === 401)) {
              /* keep practicing */
            }
          }
        }

        if (result.isCorrect) {
          const justLearned = current.number;
          const learnedSnapshot = new Set(learned);
          learnedSnapshot.add(justLearned);
          setLearned(learnedSnapshot);
          window.setTimeout(() => {
            const unfinished = ayahs
              .map((a, i) => ({ a, i }))
              .filter(({ a }) => !learnedSnapshot.has(a.number));
            if (unfinished.length > 0) {
              const after = unfinished.find(({ i }) => i > currentIndex);
              setCurrentIndex(after?.i ?? unfinished[0].i);
            }
            setTranscript('');
            setFeedback(null);
            if (from === 'speech' && unfinished.length > 0) {
              window.setTimeout(() => startListeningRef.current(), 350);
            }
          }, 700);
        } else if (from === 'speech') {
          // Wrong: listen again automatically
          window.setTimeout(() => {
            setFeedback(null);
            setTranscript('');
            startListeningRef.current();
          }, 1600);
        }
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [ayahs, currentIndex, isAuthenticated, learned, recordLocal, surahNumber],
  );

  evaluateRef.current = evaluate;

  const startListening = useCallback(() => {
    if (busyRef.current) return;
    setError(null);
    setFeedback(null);
    setTranscript('');
    const rec = createArabicRecognizer();
    if (!rec) {
      setError('Speech recognition is not supported in this browser. Try typing instead.');
      setMode('type');
      return;
    }
    try {
      recognitionRef.current?.abort?.();
    } catch {
      /* ignore */
    }
    recognitionRef.current = rec;
    let committed = '';
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (ev) => {
      let interim = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const piece = (ev.results[i][0]?.transcript || '').trim();
        if (!piece) continue;
        const isFinal = Boolean((ev.results[i] as { isFinal?: boolean }).isFinal);
        if (isFinal) committed = `${committed} ${piece}`.trim();
        else interim = `${interim} ${piece}`.trim();
      }
      const live = `${committed} ${interim}`.trim();
      setTranscript(live);
      // Auto-fill complete → stop mic and score without Check
      if (ayahTextRef.current && progressiveAyahFill(ayahTextRef.current, live).complete && !busyRef.current) {
        suppressEvalRef.current = true;
        try {
          rec.stop();
        } catch {
          /* ignore */
        }
        setListening(false);
        void evaluateRef.current(live, 'speech');
      }
    };
    rec.onerror = (ev) => {
      setListening(false);
      if (ev.error === 'not-allowed') {
        setError('Microphone permission denied. Allow mic access or switch to Type.');
      } else if (ev.error === 'no-speech') {
        setError('No speech heard — tap the mic and recite again.');
      } else if (ev.error !== 'aborted') {
        setError('Could not capture speech. Tap the mic to try again.');
      }
    };
    rec.onend = () => {
      setListening(false);
      if (suppressEvalRef.current) {
        suppressEvalRef.current = false;
        return;
      }
      const text = committed.trim();
      if (text) {
        void evaluateRef.current(text, 'speech');
      }
    };
    try {
      suppressEvalRef.current = false;
      rec.start();
      setListening(true);
      setMode('speech');
    } catch {
      setError('Could not start the microphone.');
    }
  }, []);

  startListeningRef.current = startListening;

  useEffect(() => {
    setCurrentIndex(0);
    setLearned(new Set());
    setTranscript('');
    setFeedback(null);
    setError(null);
    setListening(false);
    recognitionRef.current?.abort?.();
  }, [surahNumber]);

  useEffect(() => {
    setTranscript('');
    setFeedback(null);
    setError(null);
    stopListening();
  }, [currentIndex, stopListening]);

  useEffect(() => {
    currentRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentIndex]);

  // Auto-start listening when entering speech mode / surah
  useEffect(() => {
    if (complete || mode !== 'speech' || !speechOk) return;
    const t = window.setTimeout(() => startListeningRef.current(), 400);
    return () => window.clearTimeout(t);
  }, [complete, mode, speechOk, surahNumber]);

  useEffect(() => () => {
    recognitionRef.current?.abort?.();
  }, []);

  const jumpTo = (index: number) => {
    if (index < 0 || index >= ayahs.length) return;
    setCurrentIndex(index);
  };

  const submitTyped = () => {
    if (!transcript.trim()) {
      setError('Type the current ayah first.');
      return;
    }
    void evaluate(transcript, 'type');
  };

  useEffect(() => {
    if (complete) return;
    if (ayah && !learned.has(ayah.number)) return;
    if (nextPendingIndex < ayahs.length) setCurrentIndex(nextPendingIndex);
  }, [complete, ayah, learned, nextPendingIndex, ayahs.length]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--muted)]">
            {complete
              ? 'Surah revealed — mashaAllah'
              : `Learning ayah ${ayah?.number ?? '—'} · ${learnedCount}/${ayahs.length} revealed`}
          </p>
          <div className="mt-2 h-2 w-52 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="flex rounded-full border border-[var(--border)] p-1">
          <button
            type="button"
            onClick={() => {
              stopListening();
              setMode('type');
            }}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium',
              mode === 'type' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)]',
            )}
          >
            <Type className="h-4 w-4" /> Type
          </button>
          <button
            type="button"
            onClick={() => {
              if (!speechOk) {
                setError('Speech is unavailable here. Use Chrome/Edge with mic access.');
                return;
              }
              setMode('speech');
              window.setTimeout(() => startListeningRef.current(), 100);
            }}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium',
              mode === 'speech' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)]',
            )}
          >
            <Mic className="h-4 w-4" /> Speak
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Whole surah · speak to reveal each ayah
        </p>
        <div dir="rtl" lang="ar" className="space-y-3">
          {ayahs.map((a, i) => {
            const isLearned = learned.has(a.number);
            const isCurrent = !complete && i === currentIndex;
            return (
              <button
                key={a.id}
                type="button"
                ref={isCurrent ? currentRowRef : undefined}
                onClick={() => jumpTo(i)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-xl px-3 py-3 text-right transition',
                  isCurrent && 'bg-[var(--accent)]/10 ring-2 ring-[var(--accent)]/40',
                  isLearned && !isCurrent && 'bg-emerald-50/60 dark:bg-emerald-950/20',
                  !isLearned && !isCurrent && 'hover:bg-slate-50 dark:hover:bg-slate-900/30',
                )}
              >
                <span
                  className={cn(
                    'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                    isLearned
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                      : isCurrent
                        ? 'border-[var(--accent)] text-[var(--accent)]'
                        : 'border-slate-200 text-transparent',
                  )}
                  aria-hidden={!isLearned}
                >
                  {isLearned ? a.number : '·'}
                </span>
                <span
                  className={cn(
                    'min-w-0 flex-1 font-arabic text-xl leading-[2.1] sm:text-2xl',
                    isLearned || (isCurrent && (liveFill?.filledCount ?? 0) > 0)
                      ? 'text-[var(--fg)]'
                      : 'select-none text-slate-300 dark:text-slate-600',
                  )}
                >
                  {isLearned
                    ? a.textUthmani
                    : isCurrent && liveFill
                      ? liveFill.visual || blankPlaceholder(a.textUthmani)
                      : blankPlaceholder(a.textUthmani)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {!complete && ayah && (
        <>
          <div className="rounded-2xl border border-dashed border-[var(--accent)]/40 bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
            {mode === 'speech' ? (
              <>
                Speak <span className="font-semibold text-[var(--fg)]">ayah {ayah.number}</span> —
                words fill in automatically. When the ayah is complete it unlocks by itself.
                {liveFill && liveFill.total > 0 && (
                  <span className="mt-1 block text-xs">
                    Filled {liveFill.filledCount}/{liveFill.total} words
                  </span>
                )}
              </>
            ) : (
              <>
                Type <span className="font-semibold text-[var(--fg)]">ayah {ayah.number}</span> from
                memory, then press Check.
              </>
            )}
          </div>

          {mode === 'speech' ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <button
                type="button"
                disabled={busy}
                onClick={() => (listening ? stopListening() : startListening())}
                className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-full text-white shadow transition',
                  listening ? 'animate-pulse bg-rose-500' : 'bg-[var(--accent)] hover:opacity-90',
                  busy && 'opacity-60',
                )}
                aria-label={listening ? 'Stop listening' : 'Start listening'}
              >
                {listening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
              </button>
              <p className="text-sm text-[var(--muted)]">
                {busy
                  ? 'Unlocking ayah…'
                  : listening
                    ? 'Listening… ayah fills as you recite'
                    : 'Tap mic if it stopped — keep speaking to fill the ayah'}
              </p>
              {transcript && (
                <p
                  dir="rtl"
                  lang="ar"
                  className="w-full rounded-xl bg-slate-50 px-4 py-3 text-lg dark:bg-slate-900/40"
                >
                  {transcript}
                </p>
              )}
            </div>
          ) : (
            <textarea
              dir="rtl"
              lang="ar"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="اكتب الآية الحالية من حفظك…"
              rows={3}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 font-arabic text-xl leading-relaxed outline-none focus:border-[var(--accent)]"
            />
          )}
        </>
      )}

      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </p>
      )}

      {feedback && (
        <div
          className={cn(
            'rounded-2xl border p-5',
            feedback.isCorrect
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30'
              : 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30',
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            {feedback.isCorrect ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <XCircle className="h-5 w-5 text-rose-600" />
            )}
            <p className="font-semibold">
              {feedback.isCorrect
                ? `Correct — ayah ${ayah?.number} revealed`
                : mode === 'speech'
                  ? 'Wrong — listen again…'
                  : 'Wrong — try again'}{' '}
              · {feedback.accuracy}%
            </p>
          </div>
          {!feedback.isCorrect && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Correction
              </p>
              <div dir="rtl" className="flex flex-wrap gap-2 font-arabic text-lg">
                {feedback.words.map((w, i) => (
                  <span
                    key={`${w.expected}-${i}`}
                    className={cn(
                      'rounded-md px-2 py-0.5',
                      w.status === 'match' && 'bg-emerald-200/70 text-emerald-900',
                      w.status === 'mismatch' && 'bg-rose-200/80 text-rose-900',
                      w.status === 'missing' && 'bg-amber-200/80 text-amber-900',
                      w.status === 'extra' && 'bg-slate-200 text-slate-700 line-through',
                    )}
                    title={w.heard ? `You said: ${w.heard}` : 'Missing'}
                  >
                    {w.expected || w.heard}
                  </span>
                ))}
              </div>
              <p dir="rtl" lang="ar" className="mt-3 font-arabic text-xl leading-[2]">
                {feedback.expected}
              </p>
            </div>
          )}
        </div>
      )}

      {!complete && mode === 'type' && (
        <div className="flex flex-wrap gap-3">
          {!feedback?.isCorrect && (
            <button
              type="button"
              disabled={busy}
              onClick={submitTyped}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {busy ? 'Checking…' : 'Check'}
            </button>
          )}
          {feedback && !feedback.isCorrect && (
            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                setTranscript('');
                setError(null);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--accent)]"
            >
              <RotateCcw className="h-4 w-4" />
              Recite again
            </button>
          )}
        </div>
      )}

      {complete && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
          Full surah unlocked. Tap any ayah to re-practice; daily accuracy is still recorded.
        </div>
      )}
    </div>
  );
}
