'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { SalahPose } from '@/lib/salah/steps';
import { cn } from '@/lib/utils';

/**
 * Side-view silhouettes aligned with common beginner guides
 * (BBC salah gallery, HowDoIPray, Abu Khadeejah Simple Guide to Prayer):
 * - Takbir: hands to ear/shoulder level
 * - Qiyam: standing, hands folded on chest/abdomen
 * - Ruku: back level / parallel to ground, hands on knees
 * - Sujood: seven points — forehead+nose, palms, knees, toes
 * - Jalsa / Tashahhud: sitting between / final sitting
 */

type PosePaths = {
  body: string;
  label: string;
};

const SIDE_POSES: Record<SalahPose, PosePaths> = {
  stand: {
    label: 'Standing',
    // upright, arms at sides
    body: `
      M 118 42
      a 16 16 0 1 1 -0.1 0
      M 118 58 L 118 148
      M 118 78 L 98 118
      M 118 78 L 138 118
      M 118 148 L 104 220
      M 118 148 L 132 220
      M 96 220 L 112 220
      M 124 220 L 140 220
    `,
  },
  takbir: {
    label: 'Takbir — hands to ears',
    // upright, both arms raised to ear level (classic opening)
    body: `
      M 118 42
      a 16 16 0 1 1 -0.1 0
      M 118 58 L 118 148
      M 118 72 L 92 48
      M 118 72 L 144 48
      M 118 148 L 104 220
      M 118 148 L 132 220
      M 96 220 L 112 220
      M 124 220 L 140 220
    `,
  },
  recite: {
    label: 'Qiyam — hands folded',
    // right over left on chest (side view: arms tucked to torso)
    body: `
      M 118 42
      a 16 16 0 1 1 -0.1 0
      M 118 58 L 118 148
      M 118 78 L 108 108
      M 108 108 L 118 118
      M 118 78 L 128 108
      M 128 108 L 118 118
      M 118 148 L 104 220
      M 118 148 L 132 220
      M 96 220 L 112 220
      M 124 220 L 140 220
    `,
  },
  ruku: {
    label: 'Ruku — back level',
    // torso horizontal, hands on knees, head in line with back
    body: `
      M 168 98
      a 14 14 0 1 1 -0.1 0
      M 154 108 L 78 108
      M 78 108 L 78 148
      M 154 108 L 154 148
      M 118 108 L 118 78
      M 118 78 L 168 98
      M 70 148 L 86 148
      M 148 148 L 164 148
    `,
  },
  itidal: {
    label: 'Standing after ruku',
    // upright, hands loosely at sides
    body: `
      M 118 42
      a 16 16 0 1 1 -0.1 0
      M 118 58 L 118 148
      M 118 78 L 102 130
      M 118 78 L 134 130
      M 118 148 L 104 220
      M 118 148 L 132 220
      M 96 220 L 112 220
      M 124 220 L 140 220
    `,
  },
  sujood: {
    label: 'Sujood — 7 points on ground',
    // knees + toes + palms + forehead on ground; hips raised (classic)
    body: `
      M 72 198
      a 12 12 0 1 1 -0.1 0
      M 84 198 L 130 130
      M 130 130 L 158 198
      M 130 130 L 118 168
      M 118 168 L 100 198
      M 158 198 L 172 198
      M 64 198 L 88 198
      M 108 198 L 128 198
    `,
  },
  jalsa: {
    label: 'Sitting between sujood',
    // seated on heels / left foot, torso upright
    body: `
      M 130 88
      a 14 14 0 1 1 -0.1 0
      M 130 102 L 130 158
      M 130 120 L 112 148
      M 130 120 L 148 148
      M 130 158 L 108 198
      M 130 158 L 152 198
      M 100 198 L 160 198
    `,
  },
  tashahhud: {
    label: 'Tashahhud — final sitting',
    // sitting, right index finger raised (hint)
    body: `
      M 130 88
      a 14 14 0 1 1 -0.1 0
      M 130 102 L 130 158
      M 130 120 L 112 150
      M 130 120 L 152 108
      M 152 108 L 156 92
      M 130 158 L 108 198
      M 130 158 L 152 198
      M 100 198 L 160 198
    `,
  },
  tasleem: {
    label: 'Tasleem — concluding salam',
    // sitting, head turned sideways
    body: `
      M 130 88
      a 14 14 0 1 1 -0.1 0
      M 130 102 L 130 158
      M 130 120 L 112 150
      M 130 120 L 148 150
      M 130 158 L 108 198
      M 130 158 L 152 198
      M 100 198 L 160 198
    `,
  },
};

type Props = {
  pose: SalahPose;
  className?: string;
  playing?: boolean;
};

export function SalahFigure({ pose, className, playing }: Props) {
  const current = SIDE_POSES[pose];

  return (
    <div
      className={cn(
        'relative mx-auto flex h-[340px] w-full max-w-md flex-col overflow-hidden rounded-3xl',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_18%,rgba(16,185,129,0.16),transparent_50%),linear-gradient(180deg,#0b3d36_0%,#062820_58%,#041c17_100%)]" />

      <div className="relative z-[1] flex flex-1 flex-col items-center justify-end px-4 pb-4 pt-6">
        <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-200/80">
          Side view · standard posture
        </p>

        <svg viewBox="0 0 240 240" className="h-[240px] w-full max-w-[280px]" aria-hidden>
          {/* Prayer mat */}
          <ellipse cx="120" cy="210" rx="78" ry="10" fill="#064e3b" opacity="0.7" />
          <ellipse cx="120" cy="208" rx="68" ry="6" fill="#10b981" opacity="0.22" />

          {/* Soft ground line */}
          <line x1="40" y1="200" x2="200" y2="200" stroke="#047857" strokeWidth="2" opacity="0.35" />

          <AnimatePresence mode="wait">
            <motion.g
              key={pose}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <motion.path
                d={current.body.replace(/\s+/g, ' ').trim()}
                fill="none"
                stroke="#ecfdf5"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0.85, opacity: 0.7 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.45 }}
              />
              {/* Head fill for clarity on stand poses */}
              {(pose === 'stand' ||
                pose === 'takbir' ||
                pose === 'recite' ||
                pose === 'itidal') && (
                <circle cx="118" cy="42" r="15" fill="#ecfdf5" />
              )}
              {pose === 'ruku' && <circle cx="168" cy="98" r="13" fill="#ecfdf5" />}
              {pose === 'sujood' && <circle cx="72" cy="198" r="11" fill="#ecfdf5" />}
              {(pose === 'jalsa' || pose === 'tashahhud' || pose === 'tasleem') && (
                <circle cx="130" cy="88" r="13" fill="#ecfdf5" />
              )}
            </motion.g>
          </AnimatePresence>
        </svg>

        <motion.p
          key={`label-${pose}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1 text-center text-sm font-semibold text-emerald-50"
        >
          {current.label}
        </motion.p>

        {playing && (
          <motion.div
            className="mt-2 rounded-full bg-emerald-400/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Motion playing
          </motion.div>
        )}
      </div>
    </div>
  );
}
