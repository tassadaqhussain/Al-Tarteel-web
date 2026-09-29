'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Gauge,
  Headphones,
  Info,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  SALAH_LESSONS,
  LESSON_LIST,
  TWO_RAKAH_FARD_LESSON,
} from '@/lib/salah/lesson-data';
import type {
  InstructionLanguage,
  LearnerGender,
  LessonMode,
  SalahLessonId,
} from '@/lib/salah/types';
import { useSalahAudioController } from '@/lib/salah/audio-controller';
import { SalahLessonFigure } from './SalahLessonFigure';
import { cn } from '@/lib/utils';

export function SalahLessonPlayer() {
  // Lesson Configuration State (Defaults to 2-Rak'ah Fard, Hanafi, Adult Male, Urdu)
  const [selectedLessonId, setSelectedLessonId] =
    useState<SalahLessonId>('two-rakah-fard');
  const [learnerGender, setLearnerGender] = useState<LearnerGender>('male');
  const [instructionLanguage, setInstructionLanguage] =
    useState<InstructionLanguage>('ur');
  const [lessonMode, setLessonMode] = useState<LessonMode>('guided');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Lesson Progression State
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isLessonStarted, setIsLessonStarted] = useState<boolean>(false);
  const [isLessonFinished, setIsLessonFinished] = useState<boolean>(false);

  // UI Panels
  const [showReviewStep, setShowReviewStep] = useState<boolean>(false);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [showScholarModal, setShowScholarModal] = useState<boolean>(false);

  const currentLesson = SALAH_LESSONS[selectedLessonId] || TWO_RAKAH_FARD_LESSON;
  const steps = currentLesson.steps;
  const currentStep = steps[Math.min(currentStepIndex, steps.length - 1)];

  // Audio Engine Hook
  const {
    audioState,
    activeRecitationIndex,
    practiceCountdown,
    playStepSequence,
    stopAllAudio,
  } = useSalahAudioController({
    language: instructionLanguage,
    mode: lessonMode,
    playbackSpeed,
    isMuted,
    onStepComplete: () => {
      // Step finished audio sequence
    },
  });

  // Safe Step Navigation
  const goToStep = useCallback(
    (index: number) => {
      stopAllAudio();
      const target = Math.max(0, Math.min(steps.length - 1, index));
      setCurrentStepIndex(target);
      setIsLessonFinished(false);
    },
    [steps.length, stopAllAudio],
  );

  // Start or Replay Current Step Audio
  const triggerStepAudio = useCallback(() => {
    if (!currentStep) return;
    const narration = currentStep.spokenNarration[instructionLanguage];
    playStepSequence(narration, currentStep.recitations);
  }, [currentStep, instructionLanguage, playStepSequence]);

  // Trigger audio on step change when lesson is active
  useEffect(() => {
    if (isLessonStarted && !isLessonFinished) {
      triggerStepAudio();
    }
    return () => {
      stopAllAudio();
    };
  }, [currentStepIndex, isLessonStarted, triggerStepAudio, stopAllAudio, isLessonFinished]);

  // Restart Entire Lesson
  const restartLesson = useCallback(() => {
    stopAllAudio();
    setCurrentStepIndex(0);
    setIsLessonFinished(false);
    setIsLessonStarted(true);
  }, [stopAllAudio]);

  // Change Lesson Type
  const handleSelectLesson = (lessonId: SalahLessonId) => {
    stopAllAudio();
    setSelectedLessonId(lessonId);
    setCurrentStepIndex(0);
    setIsLessonFinished(false);
    setIsLessonStarted(false);
  };

  // Step Completion Progress
  const progressPercent = Math.round(
    ((currentStepIndex + 1) / steps.length) * 100,
  );

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* TOP CONTROL PANEL: Lesson Selector, Method, Gender, Language, & Mode       */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-line bg-surface p-4 sm:p-5 shadow-sm space-y-4">
        {/* Lesson Types Pill Bar */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Select Prayer Lesson
            </span>
            <span className="text-xs font-semibold text-[var(--accent)]">
              Hanafi Method (مذہبِ احناف)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {LESSON_LIST.map((lesson) => (
              <button
                key={lesson.id}
                type="button"
                onClick={() => handleSelectLesson(lesson.id)}
                className={cn(
                  'flex flex-col items-start rounded-2xl border p-3 text-left transition',
                  selectedLessonId === lesson.id
                    ? 'border-[var(--accent)] bg-[var(--accent)]/10 shadow-sm'
                    : 'border-line bg-surface-2/60 hover:border-line hover:bg-surface-2',
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                      lesson.prayerType === 'Wajib'
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
                    )}
                  >
                    {lesson.prayerType}
                  </span>
                  <span className="text-xs font-bold text-ink-muted">
                    {lesson.rakahs} Rak‘ahs
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-1 text-xs font-bold text-ink sm:text-sm">
                  {lesson.title[instructionLanguage] || lesson.title.en}
                </p>
                <p className="text-[11px] text-ink-muted truncate">
                  {lesson.subtitle[instructionLanguage] || lesson.subtitle.en}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Configurations Toolbar: Learner Gender, Language, Mode, Speed */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-3 text-xs">
          {/* Gender Selector */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-ink-muted">Learner:</span>
            <div className="flex rounded-xl bg-surface-2 p-0.5 border border-line">
              <button
                type="button"
                onClick={() => setLearnerGender('male')}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-xs font-bold transition',
                  learnerGender === 'male'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink',
                )}
              >
                Adult Male (مرد)
              </button>
              <button
                type="button"
                onClick={() => setLearnerGender('female')}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-xs font-bold transition',
                  learnerGender === 'female'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink',
                )}
              >
                Adult Female (خواتین)
              </button>
            </div>
          </div>

          {/* Instruction Language */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-ink-muted">Voice Language:</span>
            <div className="flex rounded-xl bg-surface-2 p-0.5 border border-line">
              {(
                [
                  ['ur', 'اردو (Urdu)'],
                  ['en', 'English'],
                  ['ps', 'پښتو (Pashto)'],
                ] as const
              ).map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setInstructionLanguage(code)}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-bold transition',
                    instructionLanguage === code
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-ink-muted hover:text-ink',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode: Guided vs Practice */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-ink-muted">Mode:</span>
            <div className="flex rounded-xl bg-surface-2 p-0.5 border border-line">
              <button
                type="button"
                onClick={() => setLessonMode('guided')}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-xs font-bold transition',
                  lessonMode === 'guided'
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-ink-muted hover:text-ink',
                )}
                title="Guided Mode: Explains action first, then plays Arabic recitation"
              >
                Guided
              </button>
              <button
                type="button"
                onClick={() => setLessonMode('practice')}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-xs font-bold transition',
                  lessonMode === 'practice'
                    ? 'bg-amber-600 text-white'
                    : 'text-ink-muted hover:text-ink',
                )}
                title="Practice Mode: Plays phrase, pauses for learner to repeat, then continues"
              >
                Practice
              </button>
            </div>
          </div>

          {/* Quick Audio Utilities (Speed & Mute) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const nextSpeed =
                  playbackSpeed === 0.75 ? 1.0 : playbackSpeed === 1.0 ? 1.25 : 0.75;
                setPlaybackSpeed(nextSpeed);
              }}
              className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface-2 px-2.5 py-1 font-bold text-ink hover:border-[var(--accent)]"
              title="Adjust narration speed"
            >
              <Gauge className="h-3.5 w-3.5 text-[var(--accent)]" />
              <span>{playbackSpeed}x</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMuted((prev) => !prev)}
              className={cn(
                'inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 font-bold transition',
                isMuted
                  ? 'border-rose-500/50 bg-rose-500/10 text-rose-600'
                  : 'border-line bg-surface-2 text-ink hover:border-[var(--accent)]',
              )}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="h-3.5 w-3.5" />
                  <span>Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Sound On</span>
                </>
              )}
            </button>

            {/* Scholarly Review Button */}
            <button
              type="button"
              onClick={() => setShowScholarModal(true)}
              className="inline-flex items-center gap-1 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 font-bold text-emerald-700 dark:text-emerald-300"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Reviewed</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN LESSON CONTAINER: Figure (Left) + Step Content & Recitation (Right)  */}
      {/* ========================================================================= */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.25fr)] items-start">
        {/* Left Column: Reviewed Posture Figure */}
        <div className="space-y-4">
          <SalahLessonFigure
            pose={
              learnerGender === 'male'
                ? currentStep.malePose
                : currentStep.femalePose
            }
            learnerGender={learnerGender}
            imageSrc={learnerGender === 'male' ? currentStep.imageSrc : undefined}
            pngAssetId={currentStep.pngAssetId}
            hasPngAsset={currentStep.hasPngAsset}
            reducedMotion={reducedMotion}
          />

          {/* Gender Posture Guidance Box */}
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--accent)]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
                Hanafi Posture for {learnerGender === 'male' ? 'Adult Male' : 'Adult Female'}
              </h4>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              {currentStep.poseDescription[learnerGender][instructionLanguage] ||
                currentStep.poseDescription[learnerGender].en}
            </p>
          </div>
        </div>

        {/* Right Column: Step Content, Audio Status, & Recitations */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-line bg-surface p-5 sm:p-6 shadow-sm space-y-5">
            {/* Step Progress Bar & Indicators */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-ink-muted">
                <span className="text-[var(--accent)] font-extrabold uppercase tracking-wider">
                  {currentStep.stepNumberLabel} of {steps.length}
                </span>
                <span>{progressPercent}% Complete</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Step Header */}
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-4">
              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
                  {currentStep.title[instructionLanguage] || currentStep.title.en}
                </h3>
                {currentStep.transliteration && (
                  <p className="mt-0.5 text-xs font-semibold text-ink-muted">
                    {currentStep.transliteration}
                  </p>
                )}
              </div>

              <span
                className="font-arabic text-2xl font-bold text-[var(--accent)]"
                lang="ar"
                dir="rtl"
              >
                {currentStep.titleArabic}
              </span>
            </div>

            {/* Audio Status Banner (Guided vs Practice) */}
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Headphones className="h-4 w-4 text-[var(--accent)] animate-pulse" />
                <div>
                  <p className="text-xs font-bold text-ink">
                    {audioState === 'narrating' &&
                      'Spoken Instruction Narration Playing...'}
                    {audioState === 'reciting' &&
                      'Verified Arabic Recitation Audio Playing...'}
                    {audioState === 'practice_paused' &&
                      `Learner Turn: Repeat the phrase (${practiceCountdown}s)`}
                    {audioState === 'idle' &&
                      (isLessonStarted ? 'Step Ready' : 'Ready to Start Lesson')}
                    {audioState === 'paused' && 'Audio Paused'}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    {lessonMode === 'guided'
                      ? 'Narration plays first, followed sequentially by Arabic recitation.'
                      : 'Listen, repeat aloud, and tap Next when ready.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={triggerStepAudio}
                className="inline-flex items-center gap-1 rounded-xl bg-surface px-3 py-1.5 text-xs font-bold text-ink border border-line hover:border-[var(--accent)]"
                title="Replay this step's audio"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Replay</span>
              </button>
            </div>

            {/* Main Instruction */}
            <p className="text-sm leading-relaxed text-ink-muted sm:text-base">
              {currentStep.instruction[instructionLanguage] ||
                currentStep.instruction.en}
            </p>

            {/* Step Recitations List */}
            {currentStep.recitations.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Prayer Recitations & Dhikr
                </h4>

                <div className="space-y-3">
                  {currentStep.recitations.map((rec, recIdx) => {
                    const isReciting =
                      audioState === 'reciting' &&
                      activeRecitationIndex === recIdx;

                    return (
                      <div
                        key={rec.id}
                        className={cn(
                          'rounded-2xl border p-4 transition-all',
                          isReciting
                            ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                            : 'border-line bg-surface-2/60',
                        )}
                      >
                        <div className="flex items-center justify-between border-b border-line/60 pb-2">
                          <span className="text-xs font-bold text-[var(--accent)]">
                            {rec.label[instructionLanguage] || rec.label.en}
                            {rec.repeatCount && rec.repeatCount > 1
                              ? ` (${rec.repeatCount}x)`
                              : ''}
                          </span>

                          {rec.isOptional && (
                            <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-bold text-ink-muted">
                              Sunnah / Recommended
                            </span>
                          )}
                        </div>

                        {/* Arabic Text with Diacritics */}
                        <p
                          className="mt-3 font-arabic text-xl font-bold leading-loose text-ink sm:text-2xl"
                          lang="ar"
                          dir="rtl"
                        >
                          {rec.arabicText}
                        </p>

                        {/* Transliteration */}
                        <p className="mt-2 text-xs font-medium text-ink-muted">
                          {rec.transliteration}
                        </p>

                        {/* Meaning Translation */}
                        <p className="mt-1 text-xs italic text-ink leading-relaxed">
                          "{rec.translation[instructionLanguage] || rec.translation.en}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* LESSON CONTROLS: Previous, Next, Replay, Pause, Review, Transcript        */}
            {/* ========================================================================= */}
            <div className="border-t border-line/70 pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToStep(currentStepIndex - 1)}
                  disabled={currentStepIndex === 0}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-xs font-bold text-ink transition hover:border-[var(--accent)] disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (currentStepIndex >= steps.length - 1) {
                      setIsLessonFinished(true);
                      stopAllAudio();
                    } else {
                      goToStep(currentStepIndex + 1);
                    }
                  }}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[var(--accent)] px-5 text-xs font-bold text-white transition hover:opacity-90 shadow-sm"
                >
                  <span>
                    {currentStepIndex >= steps.length - 1
                      ? 'Finish Lesson'
                      : 'Next Step'}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewStep((prev) => !prev)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition',
                    showReviewStep
                      ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]'
                      : 'border-line bg-surface text-ink-muted hover:text-ink',
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Review Checkpoints</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowTranscript((prev) => !prev)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition',
                    showTranscript
                      ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]'
                      : 'border-line bg-surface text-ink-muted hover:text-ink',
                  )}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Transcript</span>
                </button>

                <button
                  type="button"
                  onClick={restartLesson}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-2 text-xs font-bold text-ink-muted hover:text-rose-600 transition"
                  title="Restart lesson from beginning"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restart</span>
                </button>
              </div>
            </div>

            {/* Review Step Drawer */}
            {showReviewStep && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl border border-line bg-surface-2 p-4 space-y-3"
              >
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Visual Alignment Checkpoints for this Step
                </h4>

                {currentStep.checkpoints && currentStep.checkpoints.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-ink-muted">
                    {currentStep.checkpoints.map((cp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{cp}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-ink-muted">
                    Check your posture against the visual guide on the left.
                  </p>
                )}

                {currentStep.reviewNotes && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
                    <p className="font-bold">Hanafi Fiqh Detail:</p>
                    <p className="mt-0.5">{currentStep.reviewNotes}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Transcript Drawer */}
            {showTranscript && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl border border-line bg-surface-2 p-4 space-y-2 text-xs"
              >
                <h4 className="font-bold text-ink uppercase tracking-wider text-[11px]">
                  Spoken Narration Transcript ({instructionLanguage.toUpperCase()})
                </h4>
                <p className="text-ink-muted leading-relaxed">
                  "{currentStep.spokenNarration[instructionLanguage] || currentStep.spokenNarration.en}"
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Lesson Finished Completion Screen */}
      {isLessonFinished && (
        <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 via-surface to-surface p-6 text-center shadow-lg space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
            <Award className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-ink">
            {currentLesson.metadata.title[instructionLanguage]} مکمل ہو گیا
          </h3>
          <p className="max-w-xl mx-auto text-sm text-ink-muted leading-relaxed">
            Masha’Allah! You have completed all {steps.length} steps of this{' '}
            {currentLesson.metadata.fiqhMethod} lesson. You can replay the lesson,
            switch to Practice Mode, or choose another prayer.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={restartLesson}
              className="rounded-full bg-[var(--accent)] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90"
            >
              Replay Lesson
            </button>
            <button
              type="button"
              onClick={() => {
                setLessonMode('practice');
                restartLesson();
              }}
              className="rounded-full border border-line bg-surface px-6 py-2.5 text-xs font-bold text-ink hover:border-[var(--accent)]"
            >
              Switch to Practice Mode
            </button>
          </div>
        </div>
      )}

      {/* Scholarly Review & Content Workflow Modal */}
      {showScholarModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setShowScholarModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-line bg-surface p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-ink">
                  Scholarly Review & Verification
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScholarModal(false)}
                className="text-ink-muted hover:text-ink font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-ink-muted">
              <div>
                <p className="font-bold text-ink">Status:</p>
                <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ Reviewed & Verified for Production
                </p>
              </div>

              <div>
                <p className="font-bold text-ink">Jurisprudence Standard:</p>
                <p>{currentLesson.metadata.fiqhMethod} School of Thought (حنفی فقہ)</p>
              </div>

              <div>
                <p className="font-bold text-ink">Reviewer / Committee:</p>
                <p>{currentLesson.metadata.reviewedBy}</p>
              </div>

              <div>
                <p className="font-bold text-ink">Source References:</p>
                <ul className="mt-1 list-disc pl-4 space-y-1">
                  {currentLesson.metadata.sourceReferences.map((ref, i) => (
                    <li key={i}>{ref}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-900 dark:text-emerald-200">
                <p className="font-bold">Content Workflow Notice:</p>
                <p className="mt-0.5">
                  All Arabic texts, transliterations, and rulings comply with verified Hanafi
                  texts. Arabic recitation audio is sourced from reviewed recordings and is
                  never AI-generated Qur’anic speech.
                </p>
              </div>
            </div>

            <div className="border-t border-line pt-3 text-right">
              <button
                type="button"
                onClick={() => setShowScholarModal(false)}
                className="rounded-full bg-[var(--accent)] px-5 py-2 text-xs font-bold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
