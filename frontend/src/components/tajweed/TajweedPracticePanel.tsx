'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Ear,
  Info,
  Mic,
  MicOff,
  RefreshCw,
  Volume2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isSpeechSupported, createArabicRecognizer } from '@/lib/hifz/speech';
import { progressiveAyahFill } from '@/lib/hifz/compare';
import {
  compareTajweedRecitation,
  tajweedRuleLabel,
  ruleHint,
  type TajweedWordFeedback,
  type TajweedCompareResult,
} from '@/lib/tajweed/tajweed-compare';
import { getTajweedRule, type TajweedRuleId } from '@/lib/tajweed/rules';
import { getSurahPath } from '@/lib/surah-meta';
import { startSurahPlayback } from '@/lib/audio/playback';

interface ExampleRef {
  surah: number;
  ayah: number;
  textUthmani: string;
  textTajweed?: string | null;
  note?: string;
}

interface Props {
  exampleRefs: ExampleRef[];
  lessonSlug: string;
  relatedRuleIds: TajweedRuleId[];
  onPracticed?: () => void;
}

const PASS_THRESHOLD = 80;

function rulePillColor(id: TajweedRuleId): string {
  const rule = getTajweedRule(id);
  return rule?.color ?? '#6b7280';
}

function RuleHintCard({ id }: { id: TajweedRuleId }) {
  const rule = getTajweedRule(id);
  if (!rule) return null;
  return (
    <div className="flex gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3">
      <span
        className="mt-0.5 h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: rule.color }}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">
          {rule.name}{' '}
          <span className="font-arabic text-sm text-ink-3" lang="ar" dir="rtl">
            {rule.nameArabic}
          </span>
        </p>
        <p className="mt-1 text-xs leading-relaxed text-ink-3">{rule.pronunciation || rule.description}</p>
      </div>
    </div>
  );
}

function WordChip({ word }: { word: TajweedWordFeedback }) {
  const [hintOpen, setHintOpen] = useState(false);
  const statusClass =
    word.status === 'match'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-100'
      : word.status === 'mismatch'
        ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-100'
        : word.status === 'missing'
          ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-100'
          : 'border-line bg-surface-2 text-ink-3';

  const hasRules = word.flaggedRules.length > 0;

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        dir="rtl"
        lang="ar"
        onClick={() => hasRules && setHintOpen((v) => !v)}
        className={cn(
          'relative rounded-xl border px-3 py-2 font-arabic text-xl font-medium transition',
          statusClass,
          hasRules && 'cursor-pointer hover:opacity-80',
        )}
      >
        {word.expected || word.heard || '—'}
        {hasRules && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
            !
          </span>
        )}
      </button>
      {word.status !== 'match' && word.heard && (
        <span className="text-[10px] text-ink-3">heard: {word.heard}</span>
      )}
      {word.status === 'missing' && (
        <span className="text-[10px] text-amber-700 dark:text-amber-400">missed</span>
      )}
      {hintOpen && word.flaggedRules.length > 0 && (
        <div className="z-10 mt-1 w-56 rounded-xl border border-line bg-surface p-3 text-left shadow-lg">
          {word.flaggedRules.map((id) => (
            <div key={id} className="mb-2 last:mb-0">
              <p
                className="text-xs font-semibold"
                style={{ color: getTajweedRule(id)?.color ?? '#6b7280' }}
              >
                {tajweedRuleLabel(id)}
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-ink-3">{ruleHint(id)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TajweedPracticePanel({
  exampleRefs,
  lessonSlug: _lessonSlug,
  relatedRuleIds,
  onPracticed,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<TajweedCompareResult | null>(null);
  const [audioBusy, setAudioBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [practicedSet, setPracticedSet] = useState<Set<number>>(new Set());
  const recognitionRef = useRef<ReturnType<typeof createArabicRecognizer>>(null);
  const suppressRef = useRef(false);
  const speechOk = isSpeechSupported();

  const example = exampleRefs[currentIndex] ?? null;

  const liveFill = useMemo(
    () =>
      example && transcript
        ? progressiveAyahFill(example.textUthmani, transcript)
        : null,
    [example, transcript],
  );

  const stopListening = useCallback(() => {
    suppressRef.current = true;
    try {
      recognitionRef.current?.stop?.();
      recognitionRef.current?.abort?.();
    } catch { /* ignore */ }
    setListening(false);
  }, []);

  const evaluate = useCallback(
    (raw: string) => {
      if (!example) return;
      const text = raw.trim();
      if (!text) return;
      const res = compareTajweedRecitation(
        example.textUthmani,
        example.textTajweed,
        text,
        PASS_THRESHOLD,
      );
      setResult(res);
      if (res.isCorrect) {
        setPracticedSet((s) => new Set([...s, currentIndex]));
        onPracticed?.();
      }
    },
    [example, currentIndex, onPracticed],
  );

  const startListening = useCallback(() => {
    if (!speechOk || !example) return;
    setResult(null);
    setTranscript('');
    setError(null);
    suppressRef.current = false;

    const rec = createArabicRecognizer();
    if (!rec) { setError('Speech recognition is not available in this browser.'); return; }
    recognitionRef.current = rec;

    rec.onresult = (ev) => {
      let interim = '';
      for (let k = ev.resultIndex; k < ev.results.length; k++) {
        interim += ev.results[k][0].transcript;
      }
      setTranscript(interim);
    };
    rec.onerror = (ev) => {
      if (ev.error !== 'aborted' && ev.error !== 'no-speech') {
        setError('Microphone error: ' + (ev.error ?? 'unknown'));
      }
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
      if (!suppressRef.current) {
        const t = (recognitionRef as unknown as { _lastTranscript?: string })._lastTranscript ?? '';
        void 0; // evaluate is called from state via effect
      }
    };

    setListening(true);
    rec.start();
  }, [speechOk, example]);

  // Evaluate after STT ends (use transcript from state)
  const transcriptRef = useRef('');
  transcriptRef.current = transcript;

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = () => {
        setListening(false);
        if (!suppressRef.current && transcriptRef.current.trim()) {
          evaluate(transcriptRef.current);
        }
      };
    }
  });

  const playAudio = async () => {
    if (!example || audioBusy) return;
    setAudioBusy(true);
    try {
      await startSurahPlayback({ surahNumber: example.surah, startAyah: example.ayah });
    } finally {
      setAudioBusy(false);
    }
  };

  const retry = () => {
    setResult(null);
    setTranscript('');
    setError(null);
  };

  const goNext = () => {
    if (currentIndex < exampleRefs.length - 1) {
      setCurrentIndex((i) => i + 1);
      retry();
    }
  };

  if (!example) return null;

  const practicedCount = practicedSet.size;
  const allDone = practicedCount >= exampleRefs.length;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      {exampleRefs.length > 1 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 overflow-hidden rounded-full bg-line">
            <div
              className="h-2 rounded-full bg-[var(--accent)] transition-all"
              style={{ width: `${Math.round((practicedCount / exampleRefs.length) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-ink-3">
            {practicedCount}/{exampleRefs.length}
          </span>
        </div>
      )}

      {/* Example ayah card */}
      <div className="rounded-2xl border border-line bg-surface p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            Surah {example.surah}, Ayah {example.ayah}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => void playAudio()}
              disabled={audioBusy}
              title="Listen to this ayah"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-3 hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-40"
            >
              {audioBusy ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <Link
              href={`${getSurahPath(example.surah)}#${example.ayah}`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-3 hover:border-[var(--accent)] hover:text-[var(--accent)]"
              title="Open in reader"
            >
              <BookOpen className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Ayah text — show fill while speaking, full text otherwise */}
        <p
          dir="rtl"
          lang="ar"
          className="font-arabic text-2xl leading-loose text-ink sm:text-3xl"
        >
          {listening && liveFill ? liveFill.visual : example.textUthmani}
        </p>

        {example.note && (
          <p className="mt-2 text-xs text-ink-3">{example.note}</p>
        )}
      </div>

      {/* Rules active on this ayah */}
      {relatedRuleIds.length > 0 && !result && (
        <div className="flex flex-wrap gap-2">
          {relatedRuleIds.map((id) => (
            <span
              key={id}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink-3"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: rulePillColor(id) }}
                aria-hidden
              />
              {tajweedRuleLabel(id)}
            </span>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Feedback panel */}
      {result ? (
        <div className="space-y-4">
          {/* Score */}
          <div
            className={cn(
              'flex items-center gap-3 rounded-2xl border px-5 py-4',
              result.isCorrect
                ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-950/20'
                : 'border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-950/20',
            )}
          >
            {result.isCorrect ? (
              <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Ear className="h-6 w-6 shrink-0 text-red-600 dark:text-red-400" />
            )}
            <div>
              <p className={cn('font-semibold', result.isCorrect ? 'text-emerald-900 dark:text-emerald-100' : 'text-red-900 dark:text-red-100')}>
                {result.isCorrect ? 'Correct recitation!' : 'Let\'s review this ayah'}
              </p>
              <p className="text-sm text-ink-3">{result.accuracy}% accuracy</p>
            </div>
          </div>

          {/* Word-by-word grid */}
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-3">
              Word-by-word feedback
              {!result.isCorrect && (
                <span className="ml-2 font-normal normal-case text-ink-muted">
                  — tap a highlighted word to see the tajweed rule
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-3" dir="rtl">
              {result.words.map((word, i) => (
                <WordChip key={i} word={word} />
              ))}
            </div>
          </div>

          {/* Tajweed rule hints for flagged rules */}
          {!result.isCorrect && (() => {
            const flagged = [
              ...new Set(result.words.flatMap((w) => w.flaggedRules)),
            ] as TajweedRuleId[];
            return flagged.length > 0 ? (
              <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-3">
                  <Info className="h-3.5 w-3.5" aria-hidden />
                  Tajweed rules to review
                </p>
                {flagged.map((id) => (
                  <RuleHintCard key={id} id={id} />
                ))}
              </div>
            ) : null;
          })()}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
            {currentIndex < exampleRefs.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-brand-contrast hover:opacity-90"
              >
                Next example →
              </button>
            ) : allDone ? null : (
              <button
                type="button"
                onClick={retry}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-brand-contrast hover:opacity-90"
              >
                Practice again
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Mic / listen prompt */
        <div className="flex flex-col items-center gap-4 py-2">
          {speechOk ? (
            <>
              <button
                type="button"
                onClick={listening ? stopListening : startListening}
                className={cn(
                  'flex h-20 w-20 flex-col items-center justify-center gap-1.5 rounded-full border-2 text-sm font-semibold transition-all',
                  listening
                    ? 'animate-pulse border-red-500 bg-red-50 text-red-700 shadow-lg dark:bg-red-950/40'
                    : 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)] hover:bg-[var(--accent)]/10',
                )}
                aria-label={listening ? 'Stop recording' : 'Start recording'}
              >
                {listening ? (
                  <MicOff className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </button>
              <p className="text-sm text-ink-3">
                {listening
                  ? 'Listening… recite the ayah above'
                  : 'Tap the mic and recite this ayah'}
              </p>
              {listening && transcript && (
                <p
                  dir="rtl"
                  lang="ar"
                  className="max-w-md rounded-xl bg-surface-2 px-4 py-2 font-arabic text-base text-ink-2"
                >
                  {transcript}
                </p>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-ink-3">
              <MicOff className="h-4 w-4 shrink-0" />
              Speech recognition is not supported in this browser. Try Chrome or Edge.
            </div>
          )}
        </div>
      )}

      {/* All done */}
      {allDone && exampleRefs.length > 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-4 text-sm text-emerald-900 dark:border-emerald-800/40 dark:bg-emerald-950/20 dark:text-emerald-100">
          <p className="font-semibold">All examples practiced! ✓</p>
          <p className="mt-1 text-emerald-700 dark:text-emerald-300">
            Keep listening for these rules in your daily recitation.
          </p>
        </div>
      )}
    </div>
  );
}
