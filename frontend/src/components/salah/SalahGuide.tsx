'use client';

import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Droplets,
  GraduationCap,
  Layers,
  LayoutGrid,
  Sparkles,
  Video,
} from 'lucide-react';
import {
  CORE_SALAH_STEPS,
  SALAH_DISCLAIMER,
  type SalahStep,
} from '@/lib/salah/steps';
import { SALAH_GUIDE_VIDEO } from '@/lib/salah/video';
import { SalahVisualFigure } from '@/components/salah/SalahVisualFigure';
import { SalahStepCard } from '@/components/salah/SalahStepCard';
import { SalahChecklistMatrix } from '@/components/salah/SalahChecklistMatrix';
import { SalahPrayerSequence } from '@/components/salah/SalahPrayerSequence';
import { SalahWuduGuide } from '@/components/salah/SalahWuduGuide';
import { SalahLessonPlayer } from '@/components/salah/SalahLessonPlayer';
import { SalahPosterGrid } from '@/components/salah/SalahPosterGrid';
import { cn } from '@/lib/utils';

type ActiveTab =
  | 'lesson'
  | 'poster'
  | 'walkthrough'
  | 'matrix'
  | 'prayers'
  | 'wudu'
  | 'video';

export function SalahGuide() {
  const steps: SalahStep[] = CORE_SALAH_STEPS;
  const [activeTab, setActiveTab] = useState<ActiveTab>('lesson');
  const [index, setIndex] = useState(0);
  const [activeCheckId, setActiveCheckId] = useState<string | null>(null);
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});

  const step = steps[Math.min(index, steps.length - 1)];

  const go = useCallback(
    (next: number) => {
      setIndex(Math.max(0, Math.min(steps.length - 1, next)));
      setActiveCheckId(null);
    },
    [steps.length],
  );

  const toggleCheck = useCallback((id: string) => {
    setCheckedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const resetAllChecks = useCallback(() => {
    setCheckedMap({});
  }, []);

  // Total verified count across all steps
  const totalCheckpoints = steps.reduce(
    (acc, s) => acc + s.visualChecks.length,
    0,
  );
  const verifiedCount = steps.reduce(
    (acc, s) => acc + s.visualChecks.filter((c) => checkedMap[c.id]).length,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Top Main Mode Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-surface-2 p-1 border border-line">
          {(
            [
              ['lesson', 'Guided Salah Lesson', GraduationCap],
              ['poster', '10-Step Visual Chart', LayoutGrid],
              ['walkthrough', 'Visual Posture Checker', Sparkles],
              ['matrix', 'Checklist Matrix', CheckSquare],
              ['prayers', '5 Daily Prayers', Layers],
              ['wudu', 'Wudu Check', Droplets],
              ['video', 'Video Reference', Video],
            ] as const
          ).map(([tabId, label, Icon]) => (
            <button
              key={tabId}
              type="button"
              onClick={() => setActiveTab(tabId)}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition sm:text-sm',
                activeTab === tabId
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-ink-muted hover:bg-surface hover:text-ink',
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Verification Progress Badge */}
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-ink-muted">
            <span className="font-bold text-[var(--accent)]">
              {verifiedCount}/{totalCheckpoints}
            </span>{' '}
            Checkpoints Verified
          </span>
        </div>
      </div>

      {/* TAB 1: GUIDED SALAH LESSON (DEFAULT FEATURE) */}
      {activeTab === 'lesson' && <SalahLessonPlayer />}

      {/* TAB 2: 10-STEP VISUAL POSTER CHART (MATCHING USER REFERENCE ARTWORK) */}
      {activeTab === 'poster' && (
        <SalahPosterGrid
          onSelectStep={(_stepIdx) => {
            setActiveTab('lesson');
          }}
        />
      )}

      {/* TAB 2: STEP BY STEP VISUAL WALKTHROUGH */}
      {activeTab === 'walkthrough' && (
        <div className="space-y-6">
          {/* Posture Quick-Select Carousel / Thumbnails */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {steps.map((item, i) => {
              const isSelected = i === index;
              const allDone =
                item.visualChecks.length > 0 &&
                item.visualChecks.every((c) => checkedMap[c.id]);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(i)}
                  className={cn(
                    'flex min-w-[130px] flex-col items-start rounded-2xl border p-3 text-left transition',
                    isSelected
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 shadow-sm'
                      : 'border-line bg-surface hover:border-line hover:bg-surface-2',
                  )}
                >
                  <div className="flex w-full items-center justify-between gap-1">
                    <span
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                        isSelected
                          ? 'bg-[var(--accent)] text-white'
                          : 'bg-surface-3 text-ink-faint',
                      )}
                    >
                      {i + 1}
                    </span>
                    {allDone && (
                      <span className="text-[11px] font-bold text-emerald-500">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="mt-1.5 block truncate text-xs font-bold text-ink">
                    {item.title.split('—')[0].trim()}
                  </span>
                  <span
                    className="mt-0.5 block truncate font-arabic text-[11px] text-ink-muted"
                    lang="ar"
                    dir="rtl"
                  >
                    {item.titleArabic}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Side by Side Layout: Visual Figure + Step Card */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start">
            {/* Left Column: Visual SVG Figure with Alignment Guides */}
            <div className="space-y-4">
              <SalahVisualFigure
                pose={step.pose}
                activeCheckId={activeCheckId}
                onSelectCheck={(id) => setActiveCheckId(id)}
                visualChecks={step.visualChecks}
              />

              {/* Navigation Controls under Figure */}
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-3">
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  disabled={index === 0}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-xs font-semibold text-ink transition hover:border-[var(--accent)] disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <span className="text-xs font-bold text-ink-muted">
                  {index + 1} / {steps.length}
                </span>

                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  disabled={index >= steps.length - 1}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Right Column: Step Card with Recitation, Audio, & Visual Checklist */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
              >
                <SalahStepCard
                  step={step}
                  stepIndex={index}
                  totalSteps={steps.length}
                  activeCheckId={activeCheckId}
                  onSelectCheck={(id) => setActiveCheckId(id)}
                  checkedMap={checkedMap}
                  onToggleCheck={toggleCheck}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* TAB 3: VISUAL CHECK MATRIX */}
      {activeTab === 'matrix' && (
        <SalahChecklistMatrix
          checkedMap={checkedMap}
          onToggleCheck={toggleCheck}
          onResetChecks={resetAllChecks}
          onSelectStepToView={(targetIdx) => {
            setIndex(targetIdx);
            setActiveTab('walkthrough');
          }}
        />
      )}

      {/* TAB 4: 5 DAILY PRAYERS BREAKDOWN */}
      {activeTab === 'prayers' && (
        <SalahPrayerSequence
          onSelectStepToView={(targetIdx) => {
            setIndex(targetIdx);
            setActiveTab('walkthrough');
          }}
        />
      )}

      {/* TAB 5: WUDU PURIFICATION CHECK */}
      {activeTab === 'wudu' && <SalahWuduGuide />}

      {/* TAB 6: VIDEO REFERENCE */}
      {activeTab === 'video' && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="space-y-3">
              <div className="overflow-hidden rounded-3xl border border-line bg-black shadow-sm">
                <div className="relative aspect-video w-full">
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={SALAH_GUIDE_VIDEO.embedUrl}
                    title={SALAH_GUIDE_VIDEO.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              </div>
              <p className="text-center text-xs text-ink-faint sm:text-sm">
                <span className="font-semibold text-ink-muted">
                  {SALAH_GUIDE_VIDEO.title}
                </span>{' '}
                · {SALAH_GUIDE_VIDEO.channel} ·{' '}
                <a
                  href={SALAH_GUIDE_VIDEO.watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] underline-offset-2 hover:underline"
                >
                  Open on YouTube
                </a>
              </p>
            </div>

            <div className="space-y-3 rounded-3xl border border-line bg-surface p-5 sm:p-6">
              <h3 className="text-lg font-bold text-ink">
                Posture Breakdown from Video
              </h3>
              <p className="text-xs leading-relaxed text-ink-muted">
                Use the timestamps or switch to the{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('lesson')}
                  className="font-bold text-[var(--accent)] underline"
                >
                  Guided Salah Lesson
                </button>{' '}
                to examine posture alignment lines, angles, and check off each point.
              </p>

              <ol className="space-y-2 pt-2">
                {steps.map((item, i) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setIndex(i);
                        setActiveTab('walkthrough');
                      }}
                      className="flex w-full items-center justify-between rounded-xl border border-line/70 bg-surface-2 p-2.5 text-left text-xs font-semibold text-ink transition hover:border-[var(--accent)]"
                    >
                      <span className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-3 text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <span>{item.title}</span>
                      </span>
                      <span className="font-arabic text-ink-muted" lang="ar" dir="rtl">
                        {item.titleArabic}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Islamic Jurisprudence Disclaimer */}
      <p className="rounded-2xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-ink-muted sm:text-sm">
        {SALAH_DISCLAIMER}
      </p>
    </div>
  );
}
