'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Ear,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Type,
  Volume2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { blankPlaceholder, compareRecitation, progressiveAyahFill, todayDateKey, type WordDiff } from '@/lib/hifz/compare';
import { createArabicRecognizer, isSpeechSupported } from '@/lib/hifz/speech';
import { hifzApi, ApiError } from '@/lib/api';
import { startSurahPlayback } from '@/lib/audio/playback';
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
  const [audioBusy, setAudioBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<ReturnType<typeof createArabicRecognizer>>(null);
  const currentRowRef = useRef<HTMLButtonElement | null>(null);
  const busyRef = useRef(false);
  const suppressEvalRef = useRef(false);
  const evaluateRef = useRef<(text: string, from: 'speech' | 'type') => Promise<void>>(async () => {});
  const startListeningRef = useRef<() => void>(() => {});
  const speechOk = isSpeechSupported();

  const ayah = ayahs[currentIndex] ?? null;
  const liveFill = useMemo(
    () => (ayah ? progressiveAyahFill(ayah.textUthmani, transcript) : null),
    [ayah, transcript],
  );
  const learnedCount = learned.size;
  const complete = ayahs.length > 0 && learnedCount >= ayahs.length;
  const progress = ayahs.length ? Math.round((learnedCount / ayahs.length) * 100) : 0;
  const feedbackStats = useMemo(() => {
    if (!feedback) return null;
    const changed = feedback.words.filter((word) => word.status === 'mismatch').length;
    const missed = feedback.words.filter((word) => word.status === 'missing').length;
    const extra = feedback.words.filter((word) => word.status === 'extra').length;
    const issueCount = changed + missed + extra;
    const parts = [
      changed ? `${changed} changed` : '',
      missed ? `${missed} missed` : '',
      extra ? `${extra} extra or repeated` : '',
    ].filter(Boolean);
    return {
      changed,
      missed,
      extra,
      issueCount,
      message:
        issueCount === 1
          ? `I found one place to review: ${parts[0]}.`
          : `I found ${issueCount} places to review: ${parts.join(', ')}.`,
    };
  }, [feedback]);

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
    let latest = '';
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
      latest = live;
      setTranscript(live);
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
      const text = (latest || committed).trim();
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

  const retryCurrentAyah = () => {
    setFeedback(null);
    setTranscript('');
    setError(null);
    if (mode === 'speech') {
      window.setTimeout(() => startListeningRef.current(), 150);
    }
  };

  const listenToCurrentAyah = async () => {
    if (!ayah || audioBusy) return;
    setAudioBusy(true);
    setError(null);
    try {
      const started = await startSurahPlayback({
        surahNumber,
        startAyah: ayah.number,
        continuous: false,
        verseOnly: true,
        playing: true,
      });
      if (!started) setError('The reference recitation could not be loaded. Please try again.');
    } catch {
      setError('The reference recitation could not be loaded. Please try again.');
    } finally {
      setAudioBusy(false);
    }
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
        <div className="flex rounded-[4px] border border-[var(--border)] p-1">
          <button
            type="button"
            onClick={() => {
              stopListening();
              setMode('type');
            }}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-[3px] px-3 py-1.5 text-sm font-medium',
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
              'inline-flex items-center gap-1.5 rounded-[3px] px-3 py-1.5 text-sm font-medium',
              mode === 'speech' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)]',
            )}
          >
            <Mic className="h-4 w-4" /> Speak
          </button>
        </div>
      </div>

      <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
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
                  'flex w-full items-start gap-3 rounded-[4px] px-3 py-3 text-right transition',
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
          <div className="rounded-[4px] border border-[var(--accent)]/30 bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
            {mode === 'speech' ? (
              <>
                Speak <span className="font-semibold text-[var(--fg)]">ayah {ayah.number}</span> —
                words fill in as they are heard. Pause after the ayah for your correction.
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
            <div className="flex flex-col items-center gap-3 rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-5">
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
                    : feedback
                      ? 'Review the correction below, then try the ayah again'
                      : 'Tap the microphone and recite the complete ayah'}
              </p>
              {liveFill?.mistakeExpected && liveFill.mistakeHeard && !feedback && (
                <div className="flex w-full flex-wrap items-center gap-3 rounded-[4px] border border-amber-300 bg-amber-50 px-4 py-3 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
                  <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="text-sm font-semibold">Check this word</span>
                  <span className="text-xs text-amber-800 dark:text-amber-200">Expected</span>
                  <span dir="rtl" lang="ar" className="font-arabic text-xl">
                    {liveFill.mistakeExpected}
                  </span>
                  <span className="text-xs text-amber-800 dark:text-amber-200">Heard</span>
                  <span dir="rtl" lang="ar" className="font-arabic text-lg">
                    {liveFill.mistakeHeard}
                  </span>
                </div>
              )}
              {transcript && (
                <p
                  dir="rtl"
                  lang="ar"
                  className="w-full rounded-[4px] bg-slate-50 px-4 py-3 font-arabic text-lg dark:bg-slate-900/40"
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
              className="w-full rounded-[4px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 font-arabic text-xl leading-relaxed outline-none focus:border-[var(--accent)]"
            />
          )}
        </>
      )}

      {error && (
        <p className="rounded-[4px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </p>
      )}

      {feedback && (
        <div
          className={cn(
            'rounded-[4px] border p-5',
            feedback.isCorrect
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30'
              : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950/40',
          )}
        >
          <div className="flex flex-wrap items-start gap-3">
            {feedback.isCorrect ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
            ) : (
              <Ear className="mt-0.5 h-5 w-5 text-[var(--accent)]" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[var(--fg)]">
                {feedback.isCorrect
                  ? `Ayah ${ayah?.number} is correct`
                  : `Let’s correct ayah ${ayah?.number}`}
                <span className="ml-2 text-sm font-medium text-[var(--muted)]">
                  {feedback.accuracy}% match
                </span>
              </p>
              {!feedback.isCorrect && feedbackStats && (
                <p className="mt-1 text-sm text-[var(--muted)]">{feedbackStats.message}</p>
              )}
            </div>
          </div>
          {!feedback.isCorrect && (
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Word-by-word correction
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Red is changed, amber is missed, and grey is extra or repeated.
                </p>
              </div>
              <div dir="rtl" className="flex flex-wrap items-start gap-2">
                {feedback.words.map((word, index) => {
                  if (word.status === 'match') {
                    return (
                      <span
                        key={`${word.expected}-${index}`}
                        lang="ar"
                        className="px-1 py-2 font-arabic text-xl text-emerald-800 dark:text-emerald-300"
                      >
                        {word.expected}
                      </span>
                    );
                  }

                  const isChanged = word.status === 'mismatch';
                  const isMissed = word.status === 'missing';
                  return (
                    <span
                      key={`${word.expected}-${word.heard}-${index}`}
                      className={cn(
                        'flex min-w-[7rem] flex-col rounded-[4px] border px-3 py-2 text-right',
                        isChanged && 'border-rose-300 bg-rose-50 text-rose-950 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-100',
                        isMissed && 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100',
                        word.status === 'extra' && 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
                      )}
                    >
                      <span lang="ar" className={cn('font-arabic text-xl', word.status === 'extra' && 'line-through')}>
                        {word.expected || word.heard}
                      </span>
                      <span dir="ltr" className="mt-1 text-[11px] font-semibold uppercase tracking-wide">
                        {isChanged
                          ? `Heard: ${word.heard}`
                          : isMissed
                            ? 'Missed word'
                            : 'Extra / repeated'}
                      </span>
                    </span>
                  );
                })}
              </div>
              <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Correct ayah
                </p>
                <p dir="rtl" lang="ar" className="mt-2 font-arabic text-xl leading-[2] text-[var(--fg)] sm:text-2xl">
                  {feedback.expected}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={audioBusy}
                  onClick={() => void listenToCurrentAyah()}
                  className="inline-flex items-center gap-2 rounded-[4px] border border-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/5 disabled:opacity-50"
                >
                  <Volume2 className="h-4 w-4" />
                  {audioBusy ? 'Loading…' : 'Listen to ayah'}
                </button>
                <button
                  type="button"
                  onClick={retryCurrentAyah}
                  className="inline-flex items-center gap-2 rounded-[4px] bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!complete && mode === 'type' && (
        <div className="flex flex-wrap gap-3">
          {!feedback && (
            <button
              type="button"
              disabled={busy}
              onClick={submitTyped}
              className="inline-flex items-center gap-2 rounded-[4px] bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {busy ? 'Checking…' : 'Check'}
            </button>
          )}
        </div>
      )}

      {complete && (
        <div className="rounded-[4px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
          Full surah unlocked. Tap any ayah to re-practice; daily accuracy is still recorded.
        </div>
      )}
    </div>
  );
}
