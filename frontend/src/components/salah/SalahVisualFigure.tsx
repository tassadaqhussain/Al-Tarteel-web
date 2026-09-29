'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, Info, Sparkles } from 'lucide-react';
import type { SalahPose, VisualCheckItem } from '@/lib/salah/steps';
import { cn } from '@/lib/utils';

type Props = {
  pose: SalahPose;
  className?: string;
  activeCheckId?: string | null;
  onSelectCheck?: (id: string) => void;
  visualChecks?: VisualCheckItem[];
};

type Marker = {
  id: string;
  x: number;
  y: number;
  label: string;
  detail: string;
};

export function SalahVisualFigure({
  pose,
  className,
  activeCheckId,
  onSelectCheck,
  visualChecks = [],
}: Props) {
  const [showGuides, setShowGuides] = useState(true);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  // Markers mapped per pose for visual inspection
  const markers: Record<SalahPose, Marker[]> = {
    takbir: [
      {
        id: 'takbir-hands',
        x: 68,
        y: 65,
        label: 'Hands at Ears/Shoulders',
        detail: 'Palms face Qiblah, fingertips align with earlobes or shoulders.',
      },
      {
        id: 'takbir-gaze',
        x: 140,
        y: 110,
        label: 'Gaze on Mat',
        detail: 'Eyes directed downward to prostration area.',
      },
      {
        id: 'takbir-feet',
        x: 120,
        y: 245,
        label: 'Feet Parallel',
        detail: 'Shoulder width apart, toes pointing forward toward Qiblah.',
      },
    ],
    recite: [
      {
        id: 'qiyam-hands',
        x: 120,
        y: 115,
        label: 'Right Over Left Hand',
        detail: 'Right hand clasps or rests over left wrist on chest/upper abdomen.',
      },
      {
        id: 'qiyam-posture',
        x: 155,
        y: 85,
        label: 'Spine Upright',
        detail: 'Stand straight without slouching, serene and motionless.',
      },
      {
        id: 'qiyam-gaze',
        x: 135,
        y: 155,
        label: 'Eyes on Sujood Spot',
        detail: 'Keep gaze focused at the place of prostration.',
      },
    ],
    ruku: [
      {
        id: 'ruku-back',
        x: 135,
        y: 120,
        label: '90° Flat Back',
        detail: 'Horizontal back plane — level enough that water would not spill.',
      },
      {
        id: 'ruku-head',
        x: 185,
        y: 122,
        label: 'Head in Line',
        detail: 'Head aligned with spine, not drooping down or arched up.',
      },
      {
        id: 'ruku-knees',
        x: 150,
        y: 185,
        label: 'Fingers Clasping Knees',
        detail: 'Hands firmly grip knees with fingers spread wide.',
      },
      {
        id: 'ruku-legs',
        x: 82,
        y: 200,
        label: 'Vertical Legs',
        detail: 'Legs straight and firm without locking knees.',
      },
    ],
    itidal: [
      {
        id: 'itidal-spine',
        x: 120,
        y: 100,
        label: 'Full Extension',
        detail: 'Stand completely upright with calm pause before descending.',
      },
      {
        id: 'itidal-stillness',
        x: 120,
        y: 140,
        label: 'Stillness (Tuma’ninah)',
        detail: 'Mandatory pillar: all bones return to their resting position.',
      },
    ],
    sujood: [
      {
        id: 'sujood-head',
        x: 65,
        y: 200,
        label: 'Point 1: Forehead & Nose',
        detail: 'Both forehead AND bridge of nose must touch the prayer mat.',
      },
      {
        id: 'sujood-palms',
        x: 95,
        y: 200,
        label: 'Points 2 & 3: Both Palms',
        detail: 'Palms flat on mat beside shoulders or ears, fingers together.',
      },
      {
        id: 'sujood-knees',
        x: 150,
        y: 200,
        label: 'Points 4 & 5: Both Knees',
        detail: 'Both knees firmly on ground, weight balanced.',
      },
      {
        id: 'sujood-toes',
        x: 195,
        y: 200,
        label: 'Points 6 & 7: Both Toes',
        detail: 'Both feet upright on toe tips, toes curled toward Qiblah.',
      },
      {
        id: 'sujood-elbows',
        x: 100,
        y: 160,
        label: 'Elbows Raised',
        detail: 'Elevated off the mat — never rest forearms flat like a dog.',
      },
    ],
    jalsa: [
      {
        id: 'jalsa-feet',
        x: 165,
        y: 215,
        label: 'Iftirash Sitting',
        detail: 'Sit on flattened left foot while right foot remains upright.',
      },
      {
        id: 'jalsa-spine',
        x: 130,
        y: 110,
        label: 'Upright Torso',
        detail: 'Spine erect, shoulders relaxed, complete stillness.',
      },
      {
        id: 'jalsa-hands',
        x: 115,
        y: 175,
        label: 'Hands on Thighs',
        detail: 'Palms rest comfortably over lower thighs/knees.',
      },
    ],
    tashahhud: [
      {
        id: 'tashahhud-finger',
        x: 155,
        y: 145,
        label: 'Index Finger Pointing',
        detail: 'Right index finger points toward Qiblah during testimony.',
      },
      {
        id: 'tashahhud-left-hand',
        x: 115,
        y: 175,
        label: 'Left Hand Calm',
        detail: 'Resting flat upon the left knee.',
      },
      {
        id: 'tashahhud-sitting',
        x: 150,
        y: 215,
        label: 'Calm Seated Base',
        detail: 'Iftirash in middle sitting, or Tawarruk in final sitting.',
      },
    ],
    tasleem: [
      {
        id: 'tasleem-right',
        x: 145,
        y: 95,
        label: 'Turn to Right Shoulder',
        detail: 'Cheek visible from behind: "As-salamu ‘alaykum wa rahmatullah".',
      },
      {
        id: 'tasleem-torso',
        x: 120,
        y: 150,
        label: 'Torso Stays Forward',
        detail: 'Only head and neck rotate; chest remains oriented to Qiblah.',
      },
    ],
    stand: [
      {
        id: 'stand-posture',
        x: 120,
        y: 100,
        label: 'Standing for Next Rak‘ah',
        detail: 'Rise with Takbir, steadying your stance before recitation.',
      },
    ],
  };

  const currentMarkers = markers[pose] || [];
  const selectedMarker = currentMarkers.find(
    (m) => m.id === (activeCheckId || activeMarkerId),
  );

  return (
    <div
      className={cn(
        'relative flex w-full flex-col overflow-hidden rounded-3xl border border-emerald-900/30 bg-gradient-to-b from-[#062c24] via-[#041e18] to-[#02130f] p-4 text-emerald-50 shadow-xl transition-all',
        className,
      )}
    >
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl" />

      {/* Top Controls Header */}
      <div className="relative z-10 mb-2 flex items-center justify-between gap-2 border-b border-emerald-800/40 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            Visual Alignment Guide
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowGuides((prev) => !prev)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition',
            showGuides
              ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-200'
              : 'border-white/10 bg-white/5 text-emerald-400/60 hover:text-emerald-200',
          )}
          title="Toggle alignment guidelines and posture check markers"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>{showGuides ? 'Guides On' : 'Guides Off'}</span>
        </button>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative flex flex-1 items-center justify-center py-2">
        <svg
          viewBox="0 0 240 260"
          className="h-[250px] w-full max-w-[300px] select-none"
          aria-label={`Visual illustration for posture: ${pose}`}
        >
          <defs>
            {/* Prayer Mat Gradient */}
            <linearGradient id="rugGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#044336" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#065f4c" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#044336" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="bodyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#bbf7d0" />
            </linearGradient>

            {/* Glowing marker filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Qiblah Direction Indicator */}
          <g opacity="0.6">
            <line x1="20" y1="230" x2="220" y2="230" stroke="#065f4c" strokeWidth="1" strokeDasharray="3 3" />
            <text x="215" y="226" fill="#6ee7b7" fontSize="8" textAnchor="end" fontWeight="bold">
              QIBLAH →
            </text>
          </g>

          {/* Prayer Mat (Isometric 3D ellipse base) */}
          <ellipse cx="120" cy="235" rx="90" ry="14" fill="url(#rugGradient)" stroke="#059669" strokeWidth="1.5" />
          {/* Mat center mihrab arch pattern */}
          <ellipse cx="120" cy="235" rx="70" ry="9" fill="none" stroke="#10b981" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.7" />

          {/* Posture-Specific Graphics */}
          <AnimatePresence mode="wait">
            <motion.g
              key={pose}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.28 }}
            >
              {/* TAKBIR POSTURE */}
              {pose === 'takbir' && (
                <g>
                  {/* Alignment guide: ear level horizontal line */}
                  {showGuides && (
                    <g opacity="0.65">
                      <line x1="45" y1="62" x2="195" y2="62" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="195" y="58" fill="#fcd34d" fontSize="7" textAnchor="end">
                        Ear/Shoulder Level
                      </text>
                      {/* Downward gaze line */}
                      <line x1="120" y1="60" x2="80" y2="232" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
                    </g>
                  )}

                  {/* Figure silhouette */}
                  {/* Head */}
                  <circle cx="120" cy="55" r="16" fill="url(#bodyGradient)" />
                  {/* Neck */}
                  <rect x="116" y="70" width="8" height="8" rx="2" fill="url(#bodyGradient)" />
                  {/* Torso */}
                  <path d="M 100 78 L 140 78 L 132 165 L 108 165 Z" fill="url(#bodyGradient)" />
                  {/* Arms raised up beside ears */}
                  {/* Left arm */}
                  <path d="M 100 82 Q 72 80 70 60" fill="none" stroke="url(#bodyGradient)" strokeWidth="10" strokeLinecap="round" />
                  {/* Left palm facing front */}
                  <ellipse cx="68" cy="56" rx="5" ry="8" fill="#fef08a" />
                  {/* Right arm */}
                  <path d="M 140 82 Q 168 80 170 60" fill="none" stroke="url(#bodyGradient)" strokeWidth="10" strokeLinecap="round" />
                  {/* Right palm facing front */}
                  <ellipse cx="172" cy="56" rx="5" ry="8" fill="#fef08a" />
                  {/* Legs */}
                  <path d="M 110 165 L 104 235 M 130 165 L 136 235" stroke="url(#bodyGradient)" strokeWidth="11" strokeLinecap="round" />
                  {/* Feet */}
                  <ellipse cx="102" cy="235" rx="8" ry="4" fill="#a7f3d0" />
                  <ellipse cx="138" cy="235" rx="8" ry="4" fill="#a7f3d0" />
                </g>
              )}

              {/* RECITE / QIYAM POSTURE */}
              {pose === 'recite' && (
                <g>
                  {/* Plumb-line vertical alignment */}
                  {showGuides && (
                    <g opacity="0.6">
                      <line x1="120" y1="40" x2="120" y2="235" stroke="#10b981" strokeWidth="1" strokeDasharray="2 3" />
                      <line x1="120" y1="55" x2="80" y2="232" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="76" y="224" fill="#7dd3fc" fontSize="7" textAnchor="end">
                        Gaze Line
                      </text>
                    </g>
                  )}

                  {/* Head */}
                  <circle cx="120" cy="52" r="16" fill="url(#bodyGradient)" />
                  {/* Torso */}
                  <path d="M 100 76 L 140 76 L 134 165 L 106 165 Z" fill="url(#bodyGradient)" />
                  {/* Arms folded on chest / upper abdomen */}
                  <path d="M 100 80 Q 110 115 120 116 Q 130 115 140 80" fill="none" stroke="url(#bodyGradient)" strokeWidth="10" strokeLinecap="round" />
                  {/* Right hand clasping left wrist badge */}
                  <rect x="110" y="110" width="20" height="12" rx="4" fill="#fef08a" stroke="#d97706" strokeWidth="1" />
                  {/* Legs */}
                  <path d="M 110 165 L 108 235 M 130 165 L 132 235" stroke="url(#bodyGradient)" strokeWidth="11" strokeLinecap="round" />
                  {/* Feet */}
                  <ellipse cx="106" cy="235" rx="8" ry="4" fill="#a7f3d0" />
                  <ellipse cx="134" cy="235" rx="8" ry="4" fill="#a7f3d0" />
                </g>
              )}

              {/* RUKU POSTURE */}
              {pose === 'ruku' && (
                <g>
                  {/* Spirit-level horizontal guide */}
                  {showGuides && (
                    <g opacity="0.8">
                      <line x1="40" y1="122" x2="200" y2="122" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
                      <text x="42" y="116" fill="#fcd34d" fontSize="8" fontWeight="bold">
                        90° Horizontal Level
                      </text>
                      {/* Angle arch */}
                      <path d="M 85 145 A 25 25 0 0 1 110 122" fill="none" stroke="#f59e0b" strokeWidth="1" />
                    </g>
                  )}

                  {/* Legs standing vertical */}
                  <path d="M 80 135 L 80 232 M 94 135 L 94 232" stroke="url(#bodyGradient)" strokeWidth="10" strokeLinecap="round" />
                  {/* Feet */}
                  <ellipse cx="80" cy="232" rx="7" ry="4" fill="#a7f3d0" />
                  <ellipse cx="94" cy="232" rx="7" ry="4" fill="#a7f3d0" />
                  {/* Torso horizontal */}
                  <path d="M 80 135 L 165 125 L 165 110 L 80 120 Z" fill="url(#bodyGradient)" />
                  {/* Head aligned horizontal with spine */}
                  <circle cx="180" cy="120" r="14" fill="url(#bodyGradient)" />
                  {/* Arms extending down to knees */}
                  <path d="M 150 124 L 140 178" stroke="url(#bodyGradient)" strokeWidth="9" strokeLinecap="round" />
                  {/* Hands firmly gripping knees with spread fingers */}
                  <circle cx="140" cy="180" r="7" fill="#fef08a" stroke="#d97706" strokeWidth="1.5" />
                  <path d="M 135 180 L 128 177 M 135 183 L 126 182 M 136 186 L 128 187" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
                </g>
              )}

              {/* I'TIDAL POSTURE */}
              {pose === 'itidal' && (
                <g>
                  {/* Full upright posture guide */}
                  {showGuides && (
                    <g opacity="0.6">
                      <line x1="120" y1="40" x2="120" y2="235" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 3" />
                      <text x="126" y="90" fill="#6ee7b7" fontSize="7">
                        Stillness (Tuma’ninah)
                      </text>
                    </g>
                  )}

                  {/* Head */}
                  <circle cx="120" cy="52" r="16" fill="url(#bodyGradient)" />
                  {/* Torso */}
                  <path d="M 100 76 L 140 76 L 134 165 L 106 165 Z" fill="url(#bodyGradient)" />
                  {/* Arms at sides */}
                  <path d="M 100 80 L 92 145 M 140 80 L 148 145" stroke="url(#bodyGradient)" strokeWidth="8" strokeLinecap="round" />
                  {/* Legs */}
                  <path d="M 110 165 L 108 235 M 130 165 L 132 235" stroke="url(#bodyGradient)" strokeWidth="11" strokeLinecap="round" />
                  {/* Feet */}
                  <ellipse cx="106" cy="235" rx="8" ry="4" fill="#a7f3d0" />
                  <ellipse cx="134" cy="235" rx="8" ry="4" fill="#a7f3d0" />
                </g>
              )}

              {/* SUJOOD POSTURE (7 POINTS OF CONTACT HIGHLIGHTED) */}
              {pose === 'sujood' && (
                <g>
                  {showGuides && (
                    <g opacity="0.85">
                      {/* Elbow clearance curve */}
                      <path d="M 85 185 Q 100 150 115 185" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
                      <text x="100" y="152" fill="#fcd34d" fontSize="7" textAnchor="middle">
                        Elbows Elevated
                      </text>
                    </g>
                  )}

                  {/* Body in prostration */}
                  {/* Head and forehead on mat */}
                  <circle cx="62" cy="216" r="13" fill="url(#bodyGradient)" />
                  {/* Nose touching floor indicator */}
                  <ellipse cx="50" cy="226" rx="4" ry="2" fill="#fef08a" />

                  {/* Torso & hips angled up */}
                  <path d="M 72 212 L 135 160 L 160 216 L 145 224 L 125 180 L 78 220 Z" fill="url(#bodyGradient)" />

                  {/* Arms: palms flat beside head, elbows bent up */}
                  <path d="M 85 200 L 100 170 L 96 226" fill="none" stroke="url(#bodyGradient)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Palms flat on mat */}
                  <ellipse cx="96" cy="227" rx="8" ry="3" fill="#fef08a" />

                  {/* Knees resting on floor */}
                  <ellipse cx="150" cy="226" rx="9" ry="4" fill="#fef08a" />

                  {/* Feet upright with toes bent forward toward Qiblah */}
                  <path d="M 155 220 L 188 195 L 195 224" fill="none" stroke="url(#bodyGradient)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                  <ellipse cx="196" cy="227" rx="7" ry="3" fill="#fef08a" />

                  {/* 7 Glowing Contact Point Number Badges */}
                  {showGuides && (
                    <g>
                      {/* 1. Forehead/Nose */}
                      <circle cx="56" cy="226" r="5" fill="#10b981" />
                      <text x="56" y="229" fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle">
                        1
                      </text>
                      {/* 2 & 3. Palms */}
                      <circle cx="96" cy="227" r="5" fill="#10b981" />
                      <text x="96" y="230" fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle">
                        2
                      </text>
                      {/* 4 & 5. Knees */}
                      <circle cx="150" cy="226" r="5" fill="#10b981" />
                      <text x="150" y="229" fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle">
                        3
                      </text>
                      {/* 6 & 7. Toes */}
                      <circle cx="196" cy="227" r="5" fill="#10b981" />
                      <text x="196" y="230" fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle">
                        4
                      </text>
                    </g>
                  )}
                </g>
              )}

              {/* JALSA (SITTING BETWEEN SUJOOD) */}
              {pose === 'jalsa' && (
                <g>
                  {/* Head */}
                  <circle cx="125" cy="95" r="16" fill="url(#bodyGradient)" />
                  {/* Upright Torso */}
                  <path d="M 110 115 L 145 115 L 140 185 L 105 185 Z" fill="url(#bodyGradient)" />
                  {/* Hands resting on thighs */}
                  <path d="M 115 125 L 100 170" stroke="url(#bodyGradient)" strokeWidth="8" strokeLinecap="round" />
                  <ellipse cx="98" cy="172" rx="6" ry="3" fill="#fef08a" />
                  {/* Thighs horizontal */}
                  <path d="M 105 185 L 90 220 L 155 220 L 140 185 Z" fill="url(#bodyGradient)" />
                  {/* Feet: Left flat, right vertical */}
                  <ellipse cx="140" cy="225" rx="14" ry="4" fill="#a7f3d0" />
                  <path d="M 152 210 L 160 225" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                </g>
              )}

              {/* TASHAHHUD (TESTIMONY SITTING & INDEX FINGER) */}
              {pose === 'tashahhud' && (
                <g>
                  {/* Ray extending from pointing finger */}
                  {showGuides && (
                    <g opacity="0.8">
                      <line x1="95" y1="162" x2="30" y2="155" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />
                      <circle cx="30" cy="155" r="3" fill="#fbbf24" />
                      <text x="35" y="148" fill="#fde68a" fontSize="7" fontWeight="bold">
                        Towards Qiblah
                      </text>
                    </g>
                  )}

                  {/* Head */}
                  <circle cx="125" cy="95" r="16" fill="url(#bodyGradient)" />
                  {/* Torso */}
                  <path d="M 110 115 L 145 115 L 140 185 L 105 185 Z" fill="url(#bodyGradient)" />
                  {/* Left hand flat on knee */}
                  <path d="M 135 125 L 138 175" stroke="url(#bodyGradient)" strokeWidth="8" strokeLinecap="round" />
                  <ellipse cx="138" cy="176" rx="7" ry="3" fill="#a7f3d0" />
                  {/* Right arm and hand with pointing index finger */}
                  <path d="M 115 125 L 102 165" stroke="url(#bodyGradient)" strokeWidth="8" strokeLinecap="round" />
                  {/* Raised index finger badge */}
                  <circle cx="98" cy="165" r="7" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
                  <line x1="98" y1="165" x2="88" y2="162" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Seated base */}
                  <path d="M 105 185 L 90 220 L 155 220 L 140 185 Z" fill="url(#bodyGradient)" />
                </g>
              )}

              {/* TASLEEM (TURNING RIGHT & LEFT) */}
              {pose === 'tasleem' && (
                <g>
                  {/* Directional rotation arrows */}
                  {showGuides && (
                    <g opacity="0.85">
                      <path d="M 130 80 Q 155 75 165 95" fill="none" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#arrow)" />
                      <text x="170" y="90" fill="#7dd3fc" fontSize="7" fontWeight="bold">
                        Turn to Right
                      </text>
                    </g>
                  )}

                  {/* Head turned sideways */}
                  <ellipse cx="135" cy="92" rx="14" ry="16" fill="url(#bodyGradient)" />
                  {/* Nose profile pointing right */}
                  <path d="M 148 92 L 154 94 L 148 97 Z" fill="#fef08a" />
                  {/* Torso straight facing front */}
                  <path d="M 110 115 L 145 115 L 140 185 L 105 185 Z" fill="url(#bodyGradient)" />
                  {/* Hands resting on thighs */}
                  <path d="M 115 125 L 105 175 M 135 125 L 140 175" stroke="url(#bodyGradient)" strokeWidth="8" strokeLinecap="round" />
                  {/* Base */}
                  <path d="M 105 185 L 90 220 L 155 220 L 140 185 Z" fill="url(#bodyGradient)" />
                </g>
              )}

              {/* STAND POSTURE (NEXT RAK'AH) */}
              {pose === 'stand' && (
                <g>
                  <circle cx="120" cy="52" r="16" fill="url(#bodyGradient)" />
                  <path d="M 100 76 L 140 76 L 134 165 L 106 165 Z" fill="url(#bodyGradient)" />
                  <path d="M 100 80 L 92 145 M 140 80 L 148 145" stroke="url(#bodyGradient)" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 110 165 L 108 235 M 130 165 L 132 235" stroke="url(#bodyGradient)" strokeWidth="11" strokeLinecap="round" />
                  <ellipse cx="106" cy="235" rx="8" ry="4" fill="#a7f3d0" />
                  <ellipse cx="134" cy="235" rx="8" ry="4" fill="#a7f3d0" />
                </g>
              )}
            </motion.g>
          </AnimatePresence>

          {/* Interactive Checkpoint Markers */}
          {showGuides &&
            currentMarkers.map((marker, index) => {
              const isSelected =
                marker.id === activeCheckId || marker.id === activeMarkerId;

              return (
                <g
                  key={marker.id}
                  className="cursor-pointer transition-transform hover:scale-110"
                  onClick={() => {
                    setActiveMarkerId(marker.id);
                    onSelectCheck?.(marker.id);
                  }}
                >
                  {/* Pulsing Outer Glow */}
                  <circle
                    cx={marker.x}
                    cy={marker.y}
                    r={isSelected ? 10 : 8}
                    fill={isSelected ? '#f59e0b' : '#10b981'}
                    opacity="0.3"
                    className="animate-ping"
                  />
                  {/* Marker Core */}
                  <circle
                    cx={marker.x}
                    cy={marker.y}
                    r={isSelected ? 7 : 5}
                    fill={isSelected ? '#f59e0b' : '#34d399'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x={marker.x}
                    y={marker.y + 2.5}
                    fill="#041e18"
                    fontSize="6"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {index + 1}
                  </text>
                </g>
              );
            })}
        </svg>
      </div>

      {/* Selected Marker Detail Card Tooltip */}
      <div className="relative z-10 min-h-[56px] rounded-2xl border border-emerald-800/40 bg-emerald-950/70 p-2.5 backdrop-blur-sm">
        {selectedMarker ? (
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-amber-950">
              ✓
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-amber-300">
                {selectedMarker.label}
              </p>
              <p className="text-[11px] leading-4 text-emerald-100/90">
                {selectedMarker.detail}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-emerald-300/70">
            <Info className="h-4 w-4 shrink-0 text-emerald-400" />
            <p className="text-[11px]">
              Tap any numbered marker on the figure to inspect the visual alignment checkpoint.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
