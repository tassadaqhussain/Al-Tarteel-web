'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Mic, MicOff, RotateCcw, Turtle } from 'lucide-react';
import { NAMAZ_CONTENT } from '@/lib/namaz/content';
import {
  buildLesson,
  clampStepIndex,
  getPrayer,
  getStepTemplate,
  localize,
  rakahOutline,
  variationsFor,
} from '@/lib/namaz/lesson';
import { namazT } from '@/lib/namaz/i18n';
import { loadQuranPassage } from '@/lib/namaz/quran-passage';
import { lessonAudio, type LessonSegment } from '@/lib/namaz/audio-controller';
import type { PrayerId, SchoolPreference, StepTemplate } from '@/lib/namaz/types';
import type { NamazVoiceCommand } from '@/lib/namaz/voice-commands';
import { useNamazProgressStore } from '@/stores/namazProgressStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { isRtlLocale } from '@/lib/i18n/messages';
import { cn } from '@/lib/utils';
import { PositionFigure } from './PositionFigure';
import { AudioControls, LText, ReviewBadge, SourceList } from './NamazParts';
import {
  RecitationCard,
  recitationSegments,
  type PassageState,
  type ResolvedRecitation,
} from './RecitationCard';
import { useNamazVoiceCommands } from './useNamazVoiceCommands';

const content = NAMAZ_CONTENT;
const AUTO_ADVANCE_DELAY_MS = 2500;

const noopSubscribe = () => () => {};
/** True after hydration, so saved progress never causes an SSR mismatch. */
function useMounted() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

function resolveRecitations(template: StepTemplate, shortSurah: number): ResolvedRecitation[] {
  const out: ResolvedRecitation[] = [];
  template.recitations.forEach((ref, i) => {
    const key = `${template.id}-${i}`;
    const optional = Boolean(ref.optional);
    if (ref.kind === 'dhikr') {
      const dhikr = content.dhikr.find((d) => d.id === ref.id);
      if (dhikr) out.push({ key, kind: 'dhikr', optional, dhikr });
    } else if (ref.kind === 'quran') {
      const passage = content.quran.find((q) => q.id === ref.id);
      if (passage) {
        out.push({ key, kind: 'quran', optional, label: passage.label, surah: passage.surah, fromAyah: passage.fromAyah, toAyah: passage.toAyah });
      }
    } else {
      const choice = content.shortSurahOptions.find((o) => o.surah === shortSurah) ?? content.shortSurahOptions[0];
      out.push({ key, kind: 'quran', optional, label: choice.name, surah: choice.surah, fromAyah: 1, toAyah: choice.ayahCount });
    }
  });
  return out;
}

function passageKey(item: Extract<ResolvedRecitation, { kind: 'quran' }>) {
  return `${item.surah}:${item.fromAyah}-${item.toAyah}`;
}

export function NamazLesson({ prayerId }: { prayerId: PrayerId }) {
  const mounted = useMounted();
  const locale = useSettingsStore((s) => s.uiLocale);
  const reciterSlug = useSettingsStore((s) => s.reciterSlug);
  const rtl = isRtlLocale(locale);

  const prayer = getPrayer(content, prayerId)!;
  const steps = useMemo(() => buildLesson(content, prayerId), [prayerId]);

  const saved = useNamazProgressStore((s) => s.byPrayer[prayerId]);
  const school = useNamazProgressStore((s) => s.school);
  const shortSurah = useNamazProgressStore((s) => s.shortSurah);
  const slow = useNamazProgressStore((s) => s.slowPlayback);
  const autoAdvance = useNamazProgressStore((s) => s.autoAdvance);
  const { setStep, markComplete, restart, setSchool, setShortSurah, setSlowPlayback, setAutoAdvance } =
    useNamazProgressStore.getState();

  const [mode, setMode] = useState<'lesson' | 'practice'>('lesson');
  const [voiceOn, setVoiceOn] = useState(false);
  const [finished, setFinished] = useState(false);
  const [passages, setPassages] = useState<Record<string, PassageState>>({});
  const [reloadNonce, setReloadNonce] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const autoTimer = useRef<number | null>(null);
  const autoPlayedKey = useRef<string | null>(null);

  const index = clampStepIndex(saved?.stepIndex, steps.length);
  const step = steps[index];
  const template = getStepTemplate(content, step.templateId)!;
  const recitations = useMemo(() => resolveRecitations(template, shortSurah), [template, shortSurah]);
  const nextTemplate = steps[index + 1] ? getStepTemplate(content, steps[index + 1].templateId) : undefined;

  // Load the verified Quran passages for this step and prefetch the next one.
  useEffect(() => {
    const wanted = [
      ...recitations,
      ...(nextTemplate ? resolveRecitations(nextTemplate, shortSurah) : []),
    ].filter((r): r is Extract<ResolvedRecitation, { kind: 'quran' }> => r.kind === 'quran');
    let cancelled = false;
    for (const item of wanted) {
      const key = passageKey(item);
      setPassages((prev) => (prev[key]?.status === 'ready' ? prev : { ...prev, [key]: { status: 'loading' } }));
      loadQuranPassage(item.surah, item.fromAyah, item.toAyah, locale, reciterSlug)
        .then((data) => {
          if (!cancelled) setPassages((prev) => ({ ...prev, [key]: { status: 'ready', data } }));
        })
        .catch(() => {
          if (!cancelled) {
            setPassages((prev) => ({ ...prev, [key]: { status: 'error', offline: navigator.onLine === false } }));
          }
        });
    }
    return () => {
      cancelled = true;
    };
  }, [recitations, nextTemplate, shortSurah, locale, reciterSlug, reloadNonce]);

  // Leaving the lesson silences it.
  useEffect(() => () => lessonAudio().stop(), []);

  const clearAutoTimer = () => {
    if (autoTimer.current !== null) window.clearTimeout(autoTimer.current);
    autoTimer.current = null;
  };

  const goTo = useCallback(
    (next: number) => {
      clearAutoTimer();
      lessonAudio().stop();
      autoPlayedKey.current = null;
      moved.current = true;
      setFinished(false);
      setStep(prayerId, clampStepIndex(next, steps.length));
    },
    [prayerId, setStep, steps.length],
  );

  const finish = useCallback(() => {
    clearAutoTimer();
    lessonAudio().stop();
    markComplete(prayerId, steps.length - 1);
    setFinished(true);
  }, [markComplete, prayerId, steps.length]);

  const goNext = useCallback(() => {
    if (index >= steps.length - 1) finish();
    else goTo(index + 1);
  }, [finish, goTo, index, steps.length]);
  const goBack = useCallback(() => goTo(index - 1), [goTo, index]);

  // Move focus to the new step's heading so screen readers follow along.
  useEffect(() => {
    if (moved.current) headingRef.current?.focus();
  }, [index, finished]);

  const guidance = localize(template.guidance, locale);
  const guidanceSegments: LessonSegment[] = useMemo(
    () => [{ kind: 'speech', text: guidance.text, lang: guidance.lang }],
    [guidance.text, guidance.lang],
  );

  const passagesSettled = recitations.every(
    (r) => r.kind !== 'quran' || (passages[passageKey(r)] && passages[passageKey(r)].status !== 'loading'),
  );
  const practiceSegments: LessonSegment[] = useMemo(
    () => [
      ...guidanceSegments,
      ...recitations.flatMap((r) => recitationSegments(r, r.kind === 'quran' ? passages[passageKey(r)] : undefined)),
    ],
    [guidanceSegments, recitations, passages],
  );

  const onPracticeEnded = useCallback(() => {
    if (!useNamazProgressStore.getState().autoAdvance) return;
    clearAutoTimer();
    autoTimer.current = window.setTimeout(goNext, AUTO_ADVANCE_DELAY_MS);
  }, [goNext]);

  const playStep = useCallback(() => {
    clearAutoTimer();
    if (mode === 'practice') {
      lessonAudio().play(`${step.key}:all`, practiceSegments, { slow, onEnded: onPracticeEnded });
    } else {
      lessonAudio().play(`${step.key}:guidance`, guidanceSegments, { slow });
    }
  }, [guidanceSegments, mode, onPracticeEnded, practiceSegments, slow, step.key]);

  // Practice mode speaks each step automatically once its passages are ready.
  useEffect(() => {
    if (!mounted || mode !== 'practice' || finished || !passagesSettled) return;
    if (autoPlayedKey.current === step.key) return;
    autoPlayedKey.current = step.key;
    playStep();
  }, [mounted, mode, finished, passagesSettled, step.key, playStep]);

  useEffect(() => clearAutoTimer, []);

  const togglePlay = useCallback(() => {
    const audio = lessonAudio();
    const state = audio.getState();
    if (state.status === 'playing') audio.pause();
    else if (state.status === 'paused') audio.resume();
    else playStep();
  }, [playStep]);

  const onVoice = useCallback(
    (command: NamazVoiceCommand) => {
      if (command === 'next') goNext();
      else if (command === 'back') goBack();
      else if (command === 'repeat') playStep();
      else if (command === 'pause') {
        clearAutoTimer();
        lessonAudio().pause();
      } else {
        const audio = lessonAudio();
        if (audio.getState().status === 'paused') audio.resume();
        else playStep();
      }
    },
    [goBack, goNext, playStep],
  );
  const voice = useNamazVoiceCommands(voiceOn && mode === 'practice', locale, onVoice);

  // Keyboard shortcuts (ignored while typing or using a form control).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
      const backward = rtl ? 'ArrowRight' : 'ArrowLeft';
      if (e.key === forward) {
        e.preventDefault();
        goNext();
      } else if (e.key === backward) {
        e.preventDefault();
        if (index > 0) goBack();
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        togglePlay();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        playStep();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goBack, goNext, index, playStep, rtl, togglePlay]);

  const changeSlow = (next: boolean) => {
    setSlowPlayback(next);
    lessonAudio().setSlow(next);
  };

  if (!mounted) {
    return (
      <div className="mt-6 space-y-4" aria-busy="true">
        <span className="sr-only">{namazT(locale, 'loading')}</span>
        <div className="h-12 animate-pulse rounded-2xl bg-surface-3" />
        <div className="h-72 animate-pulse rounded-2xl bg-surface-3" />
      </div>
    );
  }

  const phaseLabel =
    step.phase === 'prepare'
      ? namazT(locale, 'preparation')
      : step.phase === 'final'
        ? namazT(locale, 'finalSitting')
        : namazT(locale, 'rakahOf', { n: step.rakah ?? 1, total: prayer.rakahs });
  const percent = Math.round(((index + 1) / steps.length) * 100);
  const title = localize(template.title, locale).text;
  const variations = variationsFor(template, school);
  const schools = content.schools;

  return (
    <div className="mt-6 space-y-5 pb-28">
      {/* Controls: mode, school, short surah, speed */}
      <section aria-label={namazT(locale, 'lessonMode')} className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div role="group" aria-label={`${namazT(locale, 'lessonMode')} / ${namazT(locale, 'practiceMode')}`} className="inline-flex rounded-full border border-line bg-surface-2 p-1">
            {(['lesson', 'practice'] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => {
                  lessonAudio().stop();
                  clearAutoTimer();
                  autoPlayedKey.current = null;
                  setMode(m);
                }}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-semibold transition',
                  mode === m ? 'bg-[var(--accent)] text-brand-contrast' : 'text-ink-2 hover:text-ink',
                )}
              >
                {namazT(locale, m === 'lesson' ? 'lessonMode' : 'practiceMode')}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-pressed={slow}
            onClick={() => changeSlow(!slow)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition',
              slow ? 'border-[var(--accent)] bg-[var(--ayah-highlight)] text-[var(--accent)]' : 'border-line text-ink-2 hover:border-[var(--accent)]',
            )}
          >
            <Turtle className="h-4 w-4" aria-hidden />
            {slow ? namazT(locale, 'slower') : namazT(locale, 'normalSpeed')}
          </button>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="block text-xs font-semibold text-ink-3">{namazT(locale, 'school')}</span>
            <select
              value={school}
              onChange={(e) => setSchool(e.target.value as SchoolPreference)}
              className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <option value="general">{namazT(locale, 'schoolGeneral')}</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {localize(s.name, locale).text}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="block text-xs font-semibold text-ink-3">{namazT(locale, 'shortSurah')}</span>
            <select
              value={shortSurah}
              onChange={(e) => setShortSurah(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              {content.shortSurahOptions.map((o) => (
                <option key={o.surah} value={o.surah}>
                  {localize(o.name, locale).text}
                </option>
              ))}
            </select>
          </label>
        </div>

        {mode === 'practice' && (
          <div className="mt-4 space-y-3 border-t border-line pt-4 text-sm">
            <p className="text-ink-3">{namazT(locale, 'practiceHint')}</p>
            <label className="flex items-center gap-2 text-ink-2">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              {namazT(locale, 'autoAdvance')}
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={voiceOn}
                onClick={() => setVoiceOn((v) => !v)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-semibold transition',
                  voiceOn ? 'border-[var(--accent)] bg-[var(--ayah-highlight)] text-[var(--accent)]' : 'border-line text-ink-2 hover:border-[var(--accent)]',
                )}
              >
                {voiceOn ? <Mic className="h-4 w-4" aria-hidden /> : <MicOff className="h-4 w-4" aria-hidden />}
                {namazT(locale, 'voiceCommands')}
              </button>
              <p role="status" className="text-xs text-ink-muted">
                {voiceOn && voice.status === 'listening' && (
                  <>
                    {namazT(locale, 'listening')}
                    {voice.lastHeard && <> · {namazT(locale, 'heard', { c: voice.lastHeard })}</>}
                  </>
                )}
                {voiceOn && voice.status === 'unsupported' && namazT(locale, 'voiceUnsupported')}
                {voice.status === 'denied' && namazT(locale, 'micDenied')}
              </p>
            </div>
            <p className="text-xs text-ink-muted">{namazT(locale, 'voiceHint')}</p>
          </div>
        )}
      </section>

      <p className="rounded-xl border border-warning/30 bg-warning-surface px-4 py-3 text-sm text-ink-2">
        {namazT(locale, 'reviewBanner')}
      </p>

      {finished ? (
        <section className="rounded-2xl border border-brand/20 bg-brand/[0.06] p-6" aria-labelledby="namaz-complete">
          <CheckCircle2 className="h-8 w-8 text-[var(--accent)]" aria-hidden />
          <h2 id="namaz-complete" ref={headingRef} tabIndex={-1} className="mt-2 text-2xl font-bold text-ink focus:outline-none">
            {namazT(locale, 'complete')} — {localize(prayer.name, locale).text}
          </h2>
          <p className="mt-2 text-ink-2">{namazT(locale, 'completeBody')}</p>
          <p className="mt-3 text-sm text-ink-3">{namazT(locale, 'validity')}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                restart(prayerId);
                goTo(0);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-brand-contrast hover:opacity-90"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              {namazT(locale, 'restart')}
            </button>
            <Link
              href="/learn-namaz"
              className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink hover:border-[var(--accent)]"
            >
              {namazT(locale, 'allPrayers')}
            </Link>
          </div>
        </section>
      ) : (
        <>
          {/* Progress */}
          <section aria-label={namazT(locale, 'progress')} className="rounded-2xl border border-line bg-surface px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-semibold text-ink">{namazT(locale, 'step', { n: index + 1, total: steps.length })}</span>
              <span className="rounded-full bg-[var(--ayah-highlight)] px-3 py-0.5 text-xs font-semibold text-[var(--accent)]">
                {phaseLabel}
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              aria-label={namazT(locale, 'progress')}
              className="mt-2 h-2 overflow-hidden rounded-full bg-surface-3"
            >
              <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${percent}%` }} />
            </div>
            <ol className="mt-2 flex gap-1.5" aria-hidden>
              {Array.from({ length: prayer.rakahs }, (_, i) => i + 1).map((r) => (
                <li
                  key={r}
                  className={cn(
                    'flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-[11px] font-bold',
                    step.rakah === r && step.phase !== 'prepare'
                      ? 'bg-[var(--accent)] text-brand-contrast'
                      : (step.rakah ?? 0) > r
                        ? 'bg-[var(--ayah-highlight)] text-[var(--accent)]'
                        : 'bg-surface-3 text-ink-faint',
                  )}
                >
                  {r}
                </li>
              ))}
            </ol>
          </section>

          <p className="sr-only" aria-live="polite">
            {namazT(locale, 'step', { n: index + 1, total: steps.length })}: {title}
          </p>

          {/* Current step */}
          <section className="rounded-2xl border border-line bg-surface p-4 sm:p-6" aria-labelledby="namaz-step-title">
            <div className="grid gap-5 md:grid-cols-[200px_1fr] md:items-start">
              <div className="mx-auto w-40 rounded-2xl bg-surface-2 p-3 md:w-full">
                <PositionFigure position={template.position} label={title} className="h-auto w-full" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="namaz-step-title"
                    ref={headingRef}
                    tabIndex={-1}
                    lang={localize(template.title, locale).lang}
                    className="text-xl font-bold text-ink focus:outline-none sm:text-2xl"
                  >
                    {title}
                  </h2>
                  <ReviewBadge status={template.review} locale={locale} />
                </div>

                <div className="mt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{namazT(locale, 'action')}</p>
                  <LText text={template.action} locale={locale} className="mt-1 leading-relaxed text-ink-2" />
                  {localize(template.action, locale).isFallback && (
                    <p className="mt-1 text-xs text-ink-muted">{namazT(locale, 'englishOnly')}</p>
                  )}
                </div>

                {step.contextNote && (
                  <LText
                    text={step.contextNote}
                    locale={locale}
                    className="mt-3 rounded-xl bg-info-surface px-3 py-2 text-sm text-info"
                  />
                )}

                <div className="mt-4 rounded-xl bg-surface-2 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                    {mode === 'practice' ? namazT(locale, 'practiceMode') : namazT(locale, 'guidance')}
                  </p>
                  <p lang={guidance.lang} className="mt-1 text-sm italic text-ink-3">“{guidance.text}”</p>
                  <div className="mt-3">
                    <AudioControls
                      key={`${step.key}-${mode}`}
                      trackId={mode === 'practice' ? `${step.key}:all` : `${step.key}:guidance`}
                      segments={mode === 'practice' ? practiceSegments : guidanceSegments}
                      slow={slow}
                      locale={locale}
                      label={mode === 'practice' ? namazT(locale, 'practiceMode') : namazT(locale, 'guidance')}
                      onEnded={mode === 'practice' ? onPracticeEnded : undefined}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {recitations.length > 0 && (
            <section aria-label={namazT(locale, 'recitation')} className="space-y-3">
              {recitations.map((item) => (
                <RecitationCard
                  key={item.key}
                  item={item}
                  passage={item.kind === 'quran' ? passages[passageKey(item)] : undefined}
                  onRetry={() => setReloadNonce((n) => n + 1)}
                  locale={locale}
                  slow={slow}
                  trackId={`${step.key}:${item.key}`}
                />
              ))}
            </section>
          )}

          {variations.length > 0 && (
            <details open className="rounded-2xl border border-line bg-surface p-4">
              <summary className="cursor-pointer text-sm font-bold text-ink">{namazT(locale, 'variations')}</summary>
              <ul className="mt-3 space-y-2">
                {variations.map((v, i) => (
                  <li key={i} className="rounded-xl bg-surface-2 px-3 py-2 text-sm text-ink-2">
                    <LText text={v.text} locale={locale} as="span" />
                  </li>
                ))}
              </ul>
            </details>
          )}

          <SourceList refs={template.sources} locale={locale} className="px-1" />

          <details className="rounded-2xl border border-line bg-surface p-4 text-sm">
            <summary className="cursor-pointer font-bold text-ink">{namazT(locale, 'rakahGuide')}</summary>
            <p className="mt-2 text-ink-3">{namazT(locale, 'rakahGuideBody')}</p>
            <ol className="mt-2 list-decimal space-y-1 ps-5 text-ink-2">
              {rakahOutline(prayer).map((line, i) => (
                <LText key={i} as="li" text={line} locale={locale} />
              ))}
            </ol>
          </details>

          <p className="hidden text-xs text-ink-muted sm:block">{namazT(locale, 'keyboardHint')}</p>
        </>
      )}

      {/* Step navigation, always within reach */}
      {!finished && (
        <nav
          aria-label={namazT(locale, 'progress')}
          // Right padding keeps "Next" clear of the site-wide Ask AI button (fixed bottom-right).
          className="sticky bottom-[calc(var(--audio-bar-height)+0.75rem)] z-20 flex items-center justify-between gap-2 rounded-2xl border border-line bg-surface/95 p-2 pr-16 shadow-lg backdrop-blur sm:pr-36 xl:pr-2"
        >
          <button
            type="button"
            onClick={goBack}
            disabled={index === 0}
            className="inline-flex h-11 items-center gap-1 rounded-full px-4 text-sm font-semibold text-ink-2 hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
            {namazT(locale, 'back')}
          </button>
          <button
            type="button"
            onClick={playStep}
            className="inline-flex h-11 items-center gap-1 rounded-full border border-line px-4 text-sm font-semibold text-ink-2 hover:border-[var(--accent)]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{namazT(locale, 'repeatStep')}</span>
            <span className="sr-only sm:hidden">{namazT(locale, 'repeatStep')}</span>
          </button>
          <button
            type="button"
            onClick={goNext}
            className="inline-flex h-11 items-center gap-1 rounded-full bg-[var(--accent)] px-5 text-sm font-bold text-brand-contrast hover:opacity-90"
          >
            {index >= steps.length - 1 ? namazT(locale, 'finish') : namazT(locale, 'next')}
            <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </button>
        </nav>
      )}
    </div>
  );
}
