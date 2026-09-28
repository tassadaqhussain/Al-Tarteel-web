'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { PositionId } from '@/lib/namaz/types';

/**
 * Simple, faceless side-view figure for each prayer position. Every pose uses
 * the same number of points, so moving between steps morphs smoothly (or
 * snaps instantly when the learner prefers reduced motion).
 */

type Pose = {
  head: [number, number];
  torso: [number, number][]; // neck → hip
  leg: [number, number][]; // hip → knee → ankle → toe
  arm: [number, number][]; // shoulder → elbow → hand
};

const POSES: Record<PositionId, Pose> = {
  standing: {
    head: [60, 18],
    torso: [[60, 29], [60, 66]],
    leg: [[60, 66], [60, 89], [60, 110], [68, 112]],
    arm: [[60, 34], [60, 51], [61, 66]],
  },
  takbir: {
    head: [60, 18],
    torso: [[60, 29], [60, 66]],
    leg: [[60, 66], [60, 89], [60, 110], [68, 112]],
    arm: [[60, 34], [70, 36], [69, 20]],
  },
  folded: {
    head: [60, 18],
    torso: [[60, 29], [60, 66]],
    leg: [[60, 66], [60, 89], [60, 110], [68, 112]],
    arm: [[60, 34], [62, 51], [70, 52]],
  },
  rising: {
    head: [60, 18],
    torso: [[60, 29], [60, 66]],
    leg: [[60, 66], [60, 89], [60, 110], [68, 112]],
    arm: [[60, 34], [60, 51], [61, 66]],
  },
  bowing: {
    head: [95, 66],
    torso: [[85, 64], [55, 64]],
    leg: [[55, 64], [57, 88], [57, 110], [65, 112]],
    arm: [[80, 65], [72, 78], [60, 86]],
  },
  prostrating: {
    head: [91, 104],
    torso: [[81, 100], [46, 84]],
    leg: [[46, 84], [60, 111], [36, 111], [30, 106]],
    arm: [[78, 99], [72, 111], [88, 112]],
  },
  sitting: {
    head: [54, 50],
    torso: [[53, 61], [50, 98]],
    leg: [[50, 98], [80, 110], [48, 112], [40, 110]],
    arm: [[53, 66], [60, 84], [72, 100]],
  },
  salamRight: {
    head: [57, 50],
    torso: [[53, 61], [50, 98]],
    leg: [[50, 98], [80, 110], [48, 112], [40, 110]],
    arm: [[53, 66], [60, 84], [72, 100]],
  },
  salamLeft: {
    head: [51, 50],
    torso: [[53, 61], [50, 98]],
    leg: [[50, 98], [80, 110], [48, 112], [40, 110]],
    arm: [[53, 66], [60, 84], [72, 100]],
  },
};

function path(points: [number, number][]): string {
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
}

type Props = { position: PositionId; label: string; className?: string };

export function PositionFigure({ position, label, className }: Props) {
  const reduce = useReducedMotion();
  const pose = POSES[position];
  const transition = reduce ? { duration: 0 } : { duration: 0.7, ease: [0.4, 0, 0.2, 1] as const };
  const turn = position === 'salamRight' ? 'right' : position === 'salamLeft' ? 'left' : null;

  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label={label}
      className={className}
    >
      <title>{label}</title>
      {/* Prayer mat */}
      <rect x="18" y="112" width="84" height="4" rx="2" className="fill-[var(--accent)] opacity-20" />
      <g
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={6}
        className="stroke-[var(--accent)]"
      >
        <motion.path initial={false} animate={{ d: path(pose.leg) }} transition={transition} />
        <motion.path initial={false} animate={{ d: path(pose.torso) }} transition={transition} />
        <motion.path initial={false} animate={{ d: path(pose.arm) }} transition={transition} strokeWidth={5} className="opacity-80" />
      </g>
      <motion.circle
        initial={false}
        r={8}
        animate={{ cx: pose.head[0], cy: pose.head[1] }}
        transition={transition}
        className="fill-[var(--accent)]"
      />
      {turn && (
        <g className="stroke-[var(--accent-gold)]" fill="none" strokeWidth={2} strokeLinecap="round">
          {turn === 'right' ? (
            <path d="M62 34 q10 -6 18 0 m-4 -4 l4 4 l-5 2" />
          ) : (
            <path d="M46 34 q-10 -6 -18 0 m4 -4 l-4 4 l5 2" />
          )}
        </g>
      )}
    </svg>
  );
}
