'use client';

import { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { DAILY_PRAYERS, type PrayerInfo } from '@/lib/salah/steps';
import { cn } from '@/lib/utils';

type Props = {
  onSelectStepToView: (stepIndex: number) => void;
};

export function SalahPrayerSequence({ onSelectStepToView }: Props) {
  const [selectedPrayerId, setSelectedPrayerId] = useState<string>('fajr');
  const prayer =
    DAILY_PRAYERS.find((p) => p.id === selectedPrayerId) || DAILY_PRAYERS[0];

  return (
    <div className="space-y-6">
      {/* Prayer Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {DAILY_PRAYERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedPrayerId(item.id)}
            className={cn(
              'flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold transition shadow-sm',
              selectedPrayerId === item.id
                ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                : 'border-line bg-surface text-ink hover:border-[var(--accent)]/40',
            )}
          >
            <span>{item.name.split(' ')[0]}</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs',
                selectedPrayerId === item.id
                  ? 'bg-white/20 text-white'
                  : 'bg-surface-3 text-ink-muted',
              )}
            >
              {item.rakahs} Rak‘ahs
            </span>
          </button>
        ))}
      </div>

      {/* Selected Prayer Overview Card */}
      <div className="rounded-3xl border border-line bg-surface p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-line pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-ink">
                {prayer.name}
              </h2>
              <span className="font-arabic text-2xl text-[var(--accent)]" lang="ar" dir="rtl">
                {prayer.nameArabic}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-muted leading-relaxed">
              {prayer.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1 font-semibold text-ink">
              <Clock className="h-3.5 w-3.5 text-[var(--accent)]" />
              {prayer.timeWindow}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1 font-semibold text-ink">
              {prayer.recitationType.includes('Loud') ? (
                <Volume2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 text-amber-500" />
              )}
              {prayer.recitationType}
            </span>
          </div>
        </div>

        {/* Rak'ah Composition Badges */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-line bg-surface-2 p-3 text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
              Sunnah Before
            </p>
            <p className="mt-1 text-xl font-bold text-ink">
              {prayer.sunnahBefore > 0 ? `${prayer.sunnahBefore} Rak‘ahs` : 'None'}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-3 text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
              Obligatory (Fard)
            </p>
            <p className="mt-1 text-xl font-bold text-[var(--accent)]">
              {prayer.rakahs} Rak‘ahs
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-surface-2 p-3 text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
              Sunnah After
            </p>
            <p className="mt-1 text-xl font-bold text-ink">
              {prayer.sunnahAfter > 0 ? `${prayer.sunnahAfter} Rak‘ahs` : 'None'}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-surface-2 p-3 text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
              Recitation
            </p>
            <p className="mt-1 text-sm font-bold text-ink truncate">
              {prayer.recitationType}
            </p>
          </div>
        </div>
      </div>

      {/* Step-by-Step Breakdown for Each Rak'ah of this Prayer */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-ink flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[var(--accent)]" />
          Full Rak‘ah Progression for {prayer.name.split(' ')[0]}
        </h3>

        <div className="grid gap-4">
          {Array.from({ length: prayer.rakahs }, (_, i) => {
            const rakahNumber = i + 1;
            const isFirst = rakahNumber === 1;
            const isMiddleTashahhud =
              (prayer.rakahs === 3 || prayer.rakahs === 4) && rakahNumber === 2;
            const isFinalRakah = rakahNumber === prayer.rakahs;
            const isLoud =
              (prayer.id === 'fajr') ||
              (prayer.id === 'maghrib' && rakahNumber <= 2) ||
              (prayer.id === 'isha' && rakahNumber <= 2);

            return (
              <div
                key={rakahNumber}
                className="rounded-3xl border border-line bg-surface p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
                      R{rakahNumber}
                    </span>
                    <h4 className="text-base font-bold text-ink">
                      Rak‘ah {rakahNumber} of {prayer.rakahs}
                    </h4>
                  </div>

                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-bold',
                      isLoud
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                    )}
                  >
                    {isLoud ? 'Recited Aloud (Jahr)' : 'Recited Silently (Sirr)'}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                  {isFirst && (
                    <div className="rounded-xl border border-line bg-surface-2 p-2.5">
                      <p className="font-bold text-ink">1. Opening Takbir</p>
                      <p className="text-ink-muted">Raise hands, say Allahu Akbar with Niyyah in heart.</p>
                    </div>
                  )}

                  <div className="rounded-xl border border-line bg-surface-2 p-2.5">
                    <p className="font-bold text-ink">
                      {isFirst ? '2. Recitation' : '1. Recitation'}
                    </p>
                    <p className="text-ink-muted">
                      {rakahNumber <= 2
                        ? 'Al-Fatihah + another short Surah.'
                        : 'Surah Al-Fatihah only (in Rak‘ahs 3 & 4).'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-line bg-surface-2 p-2.5">
                    <p className="font-bold text-ink">
                      {isFirst ? '3. Ruku‘ & Rise' : '2. Ruku‘ & Rise'}
                    </p>
                    <p className="text-ink-muted">
                      Bow with flat back (3x Subhana Rabbiyal-Azim), rise upright with calmness.
                    </p>
                  </div>

                  <div className="rounded-xl border border-line bg-surface-2 p-2.5">
                    <p className="font-bold text-ink">
                      {isFirst ? '4. Two Sujoods' : '3. Two Sujoods'}
                    </p>
                    <p className="text-ink-muted">
                      Two prostrations on 7 points, pausing upright in Jalsa between them.
                    </p>
                  </div>

                  {isMiddleTashahhud && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 sm:col-span-2 lg:col-span-4">
                      <p className="font-bold text-amber-800 dark:text-amber-300">
                        Middle Sitting (At-Tashahhud Al-Awwal)
                      </p>
                      <p className="text-amber-700 dark:text-amber-400">
                        Sit in Iftirash after second Sujood and recite At-Tahiyyat only. Then say Allahu Akbar and stand for Rak‘ah 3.
                      </p>
                    </div>
                  )}

                  {isFinalRakah && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 sm:col-span-2 lg:col-span-4">
                      <p className="font-bold text-emerald-800 dark:text-emerald-300">
                        Final Sitting (Tashahhud, Salawat & Salam)
                      </p>
                      <p className="text-emerald-700 dark:text-emerald-400">
                        Recite At-Tahiyyat, Durood Ibrahim (Salawat), and du‘a. Conclude with Tasleem: turning face right, then left saying "As-salamu ‘alaykum wa rahmatullah".
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
