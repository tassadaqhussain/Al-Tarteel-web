'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { TWO_RAKAH_FARD_LESSON } from '@/lib/salah/lesson-data';
import { useSalahSpeech } from '@/lib/salah/audio';
import { cn } from '@/lib/utils';

interface Props {
  onSelectStep?: (stepIndex: number) => void;
}

export function SalahPosterGrid({ onSelectStep }: Props) {
  const { isPlaying, speak, stop, currentText } = useSalahSpeech();
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);

  // The 10 panels corresponding to the 2x5 reference sheet
  const steps = TWO_RAKAH_FARD_LESSON.steps.slice(1); // Steps 1 to 10

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-[#52634f]/30 bg-gradient-to-br from-[#fbf8f0] via-[#f5f0e3] to-[#ebe3d0] dark:from-[#111c16] dark:via-[#0c1611] dark:to-[#070e0a] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#52634f]/20 text-[#52634f] dark:text-emerald-300">
                <Sparkles className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                10-Step Salah Visual Chart (نماز کا مصور چارٹ)
              </h2>
            </div>
            <p className="mt-1 text-xs text-ink-muted sm:text-sm">
              Complete two-rak‘ah prayer sequence displayed in the standard 10-panel visual layout.
              Click any step to listen to the recitation or practice the movement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[#52634f]/40 bg-surface px-3 py-1 text-xs font-bold text-[#52634f] dark:text-emerald-300">
              10 Visual Steps · Adult Male Hanafi
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Visual Grid (Matching the uploaded image reference) */}
      <div className="overflow-hidden rounded-3xl border-2 border-[#52634f]/40 bg-[#f7f3e8] dark:bg-[#07130d] p-1.5 sm:p-3 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2.5">
          {steps.map((step, idx) => {
            const stepNumber = idx + 1;
            const primaryRecitation = step.recitations[0];
            const isThisPlaying =
              isPlaying && currentText === (primaryRecitation?.arabicText || '');

            return (
              <div
                key={step.stepIndex}
                onMouseEnter={() => setActiveCardIndex(idx)}
                onMouseLeave={() => setActiveCardIndex(null)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#52634f]/30 bg-[#fbf9f4] dark:bg-[#0b1b13] transition hover:shadow-lg hover:border-[#52634f]"
              >
                {/* Illustration Frame */}
                <div className="relative aspect-[334/194] w-full overflow-hidden bg-[#f4efe0] dark:bg-[#06120b]">
                  {step.imageSrc ? (
                    <Image
                      src={step.imageSrc}
                      alt={step.title.en}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                      priority={idx < 4}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-ink-muted">
                      Pose Illustration
                    </div>
                  )}

                  {/* Step Number Badge */}
                  <span className="absolute top-2.5 left-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#3d4d3a] text-xs font-bold text-white shadow-sm">
                    {stepNumber}
                  </span>

                  {/* Arabic Title Overlay */}
                  <span
                    className="absolute top-2.5 right-2.5 rounded-full bg-[#fbf9f4]/90 dark:bg-black/80 px-2.5 py-0.5 font-arabic text-xs font-bold text-[#2e3b2b] dark:text-emerald-200 backdrop-blur-xs shadow-xs"
                    lang="ar"
                    dir="rtl"
                  >
                    {step.titleArabic}
                  </span>
                </div>

                {/* Content Section */}
                <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
                  <div>
                    <h3 className="text-sm font-bold text-ink sm:text-base">
                      {step.title.en}
                    </h3>
                    <p className="text-xs font-medium text-ink-muted">
                      {step.title.ur}
                    </p>

                    {/* Recitation Banner */}
                    {primaryRecitation && (
                      <div className="mt-2.5 rounded-xl border border-line bg-surface p-2.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                            Recitation
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (isThisPlaying) {
                                stop();
                              } else {
                                speak(primaryRecitation.arabicText, primaryRecitation.transliteration);
                              }
                            }}
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold transition',
                              isThisPlaying
                                ? 'bg-rose-500 text-white'
                                : 'bg-[var(--accent)] text-white hover:opacity-90',
                            )}
                          >
                            {isThisPlaying ? (
                              <>
                                <VolumeX className="h-3 w-3" />
                                <span>Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="h-3 w-3" />
                                <span>Listen</span>
                              </>
                            )}
                          </button>
                        </div>

                        <p
                          className="mt-1 font-arabic text-sm font-bold text-ink leading-relaxed"
                          lang="ar"
                          dir="rtl"
                        >
                          {primaryRecitation.arabicText}
                        </p>
                        <p className="text-[11px] font-medium text-ink-muted">
                          {primaryRecitation.transliteration}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 pt-2.5 border-t border-line/60 flex items-center justify-between">
                    <span className="text-[11px] text-ink-muted line-clamp-1">
                      {step.checkpoints?.[0] || 'Proper posture alignment'}
                    </span>

                    {onSelectStep && (
                      <button
                        type="button"
                        onClick={() => onSelectStep(step.stepIndex)}
                        className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[var(--accent)] hover:underline"
                      >
                        <GraduationCap className="h-3.5 w-3.5" />
                        <span>Practice Step</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
