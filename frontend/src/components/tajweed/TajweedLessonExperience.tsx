'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getSurahPath } from '@/lib/surah-meta';
import {
  getLessonMotivation,
  getMotivation,
  getNextLessonSlug,
  lessonEstimateLabel,
  MASTERY_LABELS,
} from '@/lib/tajweed/motivation';
import { getTajweedLesson, getTajweedRule, type TajweedLessonSlug } from '@/lib/tajweed/rules';
import {
  getMasteryForSlug,
  useTajweedProgressStore,
} from '@/stores/tajweedProgressStore';
import { cn } from '@/lib/utils';

type Props = { slug: TajweedLessonSlug };

/**
 * Calm lesson flow: start → guided sections with subtle checkpoints → completion.
 * No confetti, no competitive UI, and never interrupts the Quran reader.
 */
export function TajweedLessonExperience({ slug }: Props) {
  const lesson = getTajweedLesson(slug)!;
  const motivation = getLessonMotivation(slug);
  const nextSlug = getNextLessonSlug(slug);
  const nextLesson = nextSlug ? getTajweedLesson(nextSlug) : null;

  const progress = useTajweedProgressStore((s) => s.progress[slug] ?? 0);
  const sessionStep = useTajweedProgressStore((s) => s.sessionStep[slug] ?? 0);
  const mastery = useTajweedProgressStore((s) => getMasteryForSlug(s, slug));
  const markOpened = useTajweedProgressStore((s) => s.markOpened);
  const markCheckpoint = useTajweedProgressStore((s) => s.markCheckpoint);
  const markPracticed = useTajweedProgressStore((s) => s.markPracticed);
  const markComplete = useTajweedProgressStore((s) => s.markComplete);
  const setSessionStep = useTajweedProgressStore((s) => s.setSessionStep);

  const [banner, setBanner] = useState<string | null>(null);
  const shownCheckpoints = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (sessionStep >= 1) markOpened(slug);
  }, [slug, sessionStep, markOpened]);

  const stepPercent = useMemo(() => {
    if (sessionStep >= 4 || mastery === 'reviewed') return 100;
    if (sessionStep <= 0) return progress;
    return Math.max(progress, sessionStep * 25);
  }, [sessionStep, progress, mastery]);

  const raiseCheckpoint = (pct: 25 | 50 | 75) => {
    if (shownCheckpoints.current.has(pct)) return;
    shownCheckpoints.current.add(pct);
    markCheckpoint(slug, pct);
    const state =
      pct === 25 ? 'quarter_complete' : pct === 50 ? 'half_complete' : 'almost_complete';
    setBanner(getMotivation({ state, rule: slug }));
  };

  const startLesson = () => {
    setSessionStep(slug, 1);
    markOpened(slug);
    setBanner(getMotivation({ state: 'lesson_started', rule: slug }));
  };

  const goStep = (step: number) => {
    setSessionStep(slug, step);
    if (step === 2) raiseCheckpoint(25);
    if (step === 3) raiseCheckpoint(50);
    if (step === 4) {
      raiseCheckpoint(75);
      markComplete(slug);
      setBanner(getMotivation({ state: 'lesson_completed', rule: slug }));
    }
  };

  const dots = [0, 1, 2, 3, 4].map((i) => (
    <span
      key={i}
      className={cn(
        'inline-block h-2.5 w-2.5 rounded-full',
        stepPercent >= i * 25 ? 'bg-[var(--accent)]' : 'bg-slate-200',
      )}
      aria-hidden
    />
  ));

  if (sessionStep === 0 && mastery !== 'reviewed') {
    return (
      <div className="mt-8 space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            Today&apos;s Tajweed
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">{lesson.name}</h2>
          <p className="font-arabic text-xl text-slate-600" lang="ar" dir="rtl">
            {lesson.nameArabic}
          </p>
          {lessonEstimateLabel(slug) && (
            <p className="mt-2 text-sm text-slate-500">{lessonEstimateLabel(slug)}</p>
          )}
          <div className="mt-5 space-y-3 text-sm text-slate-700">
            <p>
              <span className="font-semibold text-slate-900">Goal: </span>
              {motivation.objective}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Why it matters: </span>
              {motivation.whyItMatters}
            </p>
            <p className="rounded-xl bg-slate-50 px-4 py-3 text-slate-600">
              {motivation.encourage}
            </p>
          </div>
          <button
            type="button"
            onClick={startLesson}
            className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-90"
          >
            Start Lesson
          </button>
        </div>
      </div>
    );
  }

  if (sessionStep >= 4 || (mastery === 'reviewed' && sessionStep === 0)) {
    return (
      <div className="mt-8 space-y-5">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
            Lesson Complete
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {lesson.name} ✓
          </h2>
          <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
            <li>• Explanation</li>
            <li>• Listening guidance</li>
            <li>• Recognition examples</li>
          </ul>
          <p className="mt-4 rounded-xl bg-white/80 px-4 py-3 text-sm text-slate-700">
            {getMotivation({ state: 'lesson_completed', rule: slug })}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={getSurahPath(lesson.exampleRefs[0]?.surah ?? 1)}
              onClick={() => markPracticed(slug, lesson.exampleRefs.length || 1)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:border-[var(--accent)]"
            >
              Review Examples
            </Link>
            {nextLesson && (
              <Link
                href={`/tajweed/${nextLesson.slug}`}
                className="rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white hover:opacity-90"
              >
                Next: {nextLesson.name} →
              </Link>
            )}
          </div>
        </div>
        <LessonBody
          slug={slug}
          banner={null}
          stepPercent={100}
          dots={dots}
          onPractice={() => markPracticed(slug)}
        />
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <div>
          <p className="text-xs font-semibold text-slate-400">Progress</p>
          <div className="mt-1 flex items-center gap-1.5" aria-label={`${stepPercent}% complete`}>
            {dots}
            <span className="ms-2 text-sm font-semibold text-slate-700">{Math.round(stepPercent)}%</span>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {MASTERY_LABELS[mastery]}
        </span>
      </div>

      {banner && (
        <p
          role="status"
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
        >
          {banner}
        </p>
      )}

      {sessionStep === 1 && (
        <Section
          title="Explanation"
          actionLabel="Continue"
          onAction={() => goStep(2)}
        >
          <p>{lesson.summary}</p>
          <p className="mt-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-800">Why it matters: </span>
            {motivation.whyItMatters}
          </p>
          <p className="mt-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-800">Goal: </span>
            {motivation.objective}
          </p>
        </Section>
      )}

      {sessionStep === 2 && (
        <Section title="Pronunciation & when it occurs" actionLabel="Continue" onAction={() => goStep(3)}>
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Pronunciation
              </h3>
              <p className="mt-1">{lesson.pronunciation}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                When it occurs
              </h3>
              <p className="mt-1">{lesson.when}</p>
            </div>
            <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {motivation.encourage}
            </p>
          </div>
        </Section>
      )}

      {sessionStep === 3 && (
        <Section
          title="Recognition in the mushaf"
          actionLabel="Complete lesson"
          onAction={() => goStep(4)}
        >
          <p className="text-sm text-slate-600">
            Open verified ayah pages with Tajweed ON. Colours come only from the stored Quran.com annotations.
          </p>
          <ul className="mt-4 space-y-2">
            {lesson.relatedRuleIds.map((id) => {
              const rule = getTajweedRule(id);
              if (!rule) return null;
              return (
                <li key={id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: rule.color }} />
                  <span className="text-sm font-medium text-slate-800">{rule.name}</span>
                </li>
              );
            })}
          </ul>
          <ul className="mt-4 space-y-2">
            {lesson.exampleRefs.map((ex) => (
              <li key={`${ex.surah}:${ex.ayah}`}>
                <Link
                  href={getSurahPath(ex.surah)}
                  onClick={() => markPracticed(slug, 1)}
                  className="block rounded-xl border border-slate-200 px-4 py-3 text-sm hover:border-[var(--accent)]"
                >
                  <span className="font-semibold text-[var(--accent)]">
                    Surah {ex.surah}, Ayah {ex.ayah}
                  </span>
                  <span className="mt-1 block text-slate-600">{ex.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
  actionLabel,
  onAction,
}: {
  title: string;
  children: React.ReactNode;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-3 text-slate-700 leading-relaxed">{children}</div>
      <button
        type="button"
        onClick={onAction}
        className="mt-5 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-90"
      >
        {actionLabel}
      </button>
    </section>
  );
}

function LessonBody({
  slug,
  banner,
  stepPercent,
  dots,
  onPractice,
}: {
  slug: TajweedLessonSlug;
  banner: string | null;
  stepPercent: number;
  dots: React.ReactNode;
  onPractice: () => void;
}) {
  const lesson = getTajweedLesson(slug)!;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        {dots}
        <span>{stepPercent}%</span>
      </div>
      {banner}
      <p className="text-sm text-slate-600">{lesson.summary}</p>
      <button
        type="button"
        onClick={onPractice}
        className="text-sm font-semibold text-[var(--accent)] hover:underline"
      >
        Count another practice visit
      </button>
    </div>
  );
}
