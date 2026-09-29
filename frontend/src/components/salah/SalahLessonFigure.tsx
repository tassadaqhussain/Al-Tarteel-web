'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, ShieldCheck, Sparkles, AlertCircle, Palette, Activity } from 'lucide-react';
import type { LearnerGender, SalahPose } from '@/lib/salah/types';
import { cn } from '@/lib/utils';

interface Props {
  pose: SalahPose;
  learnerGender: LearnerGender;
  imageSrc?: string;
  pngAssetId?: string;
  hasPngAsset?: boolean;
  reducedMotion?: boolean;
  className?: string;
}

export function SalahLessonFigure({
  pose,
  learnerGender,
  imageSrc,
  pngAssetId,
  hasPngAsset = false,
  reducedMotion = false,
  className,
}: Props) {
  const [showGuides, setShowGuides] = useState(true);
  const [displayMode, setDisplayMode] = useState<'art' | 'vector'>('art');

  const isMale = learnerGender === 'male';
  const hasArtImage = Boolean(imageSrc && isMale);
  const showingArt = hasArtImage && displayMode === 'art';

  // Specific key alignment reminder per pose
  const poseTips: Partial<Record<SalahPose, string>> = {
    'takbir': 'Raise thumbs to earlobes, palms facing Qiblah',
    'recite': isMale ? 'Right hand clasps left wrist below navel' : 'Hands flat on chest',
    'ruku': isMale ? 'Back flat at 90°, fingers spread on knees' : 'Slight bow at ~45-60°, fingers closed',
    'itidal': 'Stand fully upright and motionless (I‘tidal)',
    'sujood': isMale ? 'Forehead & nose down, elbows elevated off ground' : 'Forearms flat on floor, body compact',
    'jalsa': isMale ? 'Sit on left foot (Iftirash), right foot upright' : 'Sit on left hip (Tawarruk), feet to right',
    'tashahhud': 'Form circle with thumb & middle finger, raise index on Shahadah',
    'tasleem-right': 'Turn face to right shoulder, greet angels & assembly',
    'tasleem-left': 'Turn face to left shoulder to conclude prayer',
  };

  return (
    <div
      className={cn(
        'relative flex w-full flex-col overflow-hidden rounded-3xl border border-emerald-900/30 bg-gradient-to-b from-[#052820] via-[#031c16] to-[#01100c] p-4 text-emerald-50 shadow-2xl transition-all',
        className,
      )}
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 rounded-full bg-amber-500/10 blur-2xl" />

      {/* Header Badges & View Switcher */}
      <div className="relative z-10 mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800/40 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-bold uppercase tracking-wider',
              isMale
                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-400/30',
            )}
          >
            <span>{isMale ? 'Adult Male' : 'Adult Female'}</span>
            <span className="text-[10px] opacity-75">· Hanafi</span>
          </span>

          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="h-3.5 w-3.5" />
            Reviewed Posture
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Art vs Vector Toggle (when art image is available) */}
          {hasArtImage && (
            <div className="flex rounded-full bg-emerald-950/80 p-0.5 border border-emerald-800/60">
              <button
                type="button"
                onClick={() => setDisplayMode('art')}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition',
                  displayMode === 'art'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-300/70 hover:text-white',
                )}
                title="View authentic reference illustration"
              >
                <Palette className="h-3 w-3" />
                <span>Artwork</span>
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode('vector')}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition',
                  displayMode === 'vector'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-300/70 hover:text-white',
                )}
                title="View vector anatomy blueprint"
              >
                <Activity className="h-3 w-3" />
                <span>Blueprint</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowGuides((prev) => !prev)}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition',
              showGuides
                ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-200'
                : 'border-white/10 bg-white/5 text-emerald-400/60 hover:text-emerald-200',
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{showGuides ? 'Guides On' : 'Guides Off'}</span>
          </button>
        </div>
      </div>

      {/* Main Visual Display (Artwork or SVG Canvas) */}
      {showingArt && imageSrc ? (
        <div className="relative flex flex-1 flex-col items-center justify-center py-2 min-h-[260px] sm:min-h-[300px]">
          <div className="relative aspect-[334/194] w-full max-w-[360px] overflow-hidden rounded-2xl border-2 border-emerald-600/40 bg-[#f7f3e8] p-1 shadow-xl">
            <Image
              src={imageSrc}
              alt={`Salah posture for ${pose}`}
              fill
              sizes="(max-width: 640px) 100vw, 360px"
              className="object-contain"
              priority
            />

            {/* Qiblah Direction Indicator */}
            <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold text-emerald-300 backdrop-blur-xs">
              Facing Qiblah →
            </div>
          </div>

          {/* Alignment Tip Overlay */}
          {showGuides && poseTips[pose] && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-200 text-center"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-400" />
              <span>{poseTips[pose]}</span>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="relative flex flex-1 items-center justify-center py-2 min-h-[260px] sm:min-h-[300px]">
          <svg
            viewBox="0 0 240 260"
            className="h-[260px] w-full max-w-[320px] select-none sm:h-[280px]"
            aria-label={`Salah posture for ${learnerGender} in pose ${pose}`}
          >
            <defs>
              <linearGradient id="rugGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#044336" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#065f4c" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#044336" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="figureGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isMale ? '#f0fdf4' : '#fdf2f8'} />
              <stop offset="100%" stopColor={isMale ? '#bbf7d0' : '#fbcfe8'} />
            </linearGradient>
          </defs>

          {/* Qiblah Orientation Line */}
          <g opacity="0.6">
            <line x1="20" y1="230" x2="220" y2="230" stroke="#065f4c" strokeWidth="1" strokeDasharray="3 3" />
            <text x="215" y="226" fill="#6ee7b7" fontSize="8" textAnchor="end" fontWeight="bold">
              QIBLAH →
            </text>
          </g>

          {/* Prayer Rug */}
          <ellipse cx="120" cy="235" rx="90" ry="14" fill="url(#rugGrad)" stroke="#059669" strokeWidth="1.5" />
          <ellipse cx="120" cy="235" rx="70" ry="9" fill="none" stroke="#10b981" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.7" />

          {/* Animated/Static Pose Container */}
          <AnimatePresence mode="wait">
            <motion.g
              key={`${learnerGender}-${pose}`}
              initial={reducedMotion ? undefined : { opacity: 0, scale: 0.96 }}
              animate={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
            >
              {/* --- PREPARE --- */}
              {pose === 'prepare' && (
                <g>
                  {showGuides && (
                    <g opacity="0.65">
                      <line x1="120" y1="40" x2="120" y2="235" stroke="#10b981" strokeWidth="1" strokeDasharray="2 3" />
                      <line x1="120" y1="55" x2="80" y2="232" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="75" y="225" fill="#7dd3fc" fontSize="7" textAnchor="end">
                        Gaze to Sujud Spot
                      </text>
                    </g>
                  )}
                  {/* Head */}
                  <circle cx="120" cy="52" r="16" fill="url(#figureGrad)" />
                  {/* Female outer head covering (Dupatta/Hijab) */}
                  {!isMale && (
                    <path d="M 102 52 Q 120 30 138 52 Q 140 76 136 90 Q 120 95 104 90 Z" fill="#f472b6" opacity="0.4" />
                  )}
                  {/* Torso */}
                  <path d="M 100 76 L 140 76 L 134 165 L 106 165 Z" fill="url(#figureGrad)" />
                  {/* Arms at sides */}
                  <path d="M 100 80 L 92 145 M 140 80 L 148 145" stroke="url(#figureGrad)" strokeWidth="8" strokeLinecap="round" />
                  {/* Legs */}
                  <path
                    d={isMale ? 'M 110 165 L 106 235 M 130 165 L 134 235' : 'M 115 165 L 115 235 M 125 165 L 125 235'}
                    stroke="url(#figureGrad)"
                    strokeWidth="11"
                    strokeLinecap="round"
                  />
                  {/* Feet */}
                  <ellipse cx={isMale ? '104' : '114'} cy="235" rx="7" ry="4" fill="#a7f3d0" />
                  <ellipse cx={isMale ? '136' : '126'} cy="235" rx="7" ry="4" fill="#a7f3d0" />
                </g>
              )}

              {/* --- TAKBIR --- */}
              {(pose === 'takbir' || pose === 'witr-qunoot-takbir') && (
                <g>
                  {showGuides && (
                    <g opacity="0.75">
                      <line
                        x1="45"
                        y1={isMale ? '55' : '75'}
                        x2="195"
                        y2={isMale ? '55' : '75'}
                        stroke="#f59e0b"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                      />
                      <text x="195" y={isMale ? '51' : '71'} fill="#fcd34d" fontSize="7" textAnchor="end">
                        {isMale ? 'Earlobes Level' : 'Shoulders Level (Under Chador)'}
                      </text>
                    </g>
                  )}

                  {/* Head */}
                  <circle cx="120" cy="52" r="16" fill="url(#figureGrad)" />
                  {!isMale && (
                    <path d="M 102 52 Q 120 30 138 52 Q 140 76 136 90 Q 120 95 104 90 Z" fill="#f472b6" opacity="0.4" />
                  )}
                  {/* Torso */}
                  <path d="M 100 76 L 140 76 L 132 165 L 108 165 Z" fill="url(#figureGrad)" />

                  {/* Arms: Male to ears; Female to shoulders */}
                  {isMale ? (
                    <>
                      {/* Left arm up to earlobe */}
                      <path d="M 100 80 Q 72 78 70 56" fill="none" stroke="url(#figureGrad)" strokeWidth="10" strokeLinecap="round" />
                      <ellipse cx="68" cy="54" rx="5" ry="8" fill="#fef08a" />
                      {/* Right arm up to earlobe */}
                      <path d="M 140 80 Q 168 78 170 56" fill="none" stroke="url(#figureGrad)" strokeWidth="10" strokeLinecap="round" />
                      <ellipse cx="172" cy="54" rx="5" ry="8" fill="#fef08a" />
                    </>
                  ) : (
                    <>
                      {/* Female: hands to shoulders level inside mantle */}
                      <path d="M 100 80 Q 82 82 82 72" fill="none" stroke="url(#figureGrad)" strokeWidth="9" strokeLinecap="round" />
                      <ellipse cx="80" cy="70" rx="5" ry="7" fill="#fef08a" />
                      <path d="M 140 80 Q 158 82 158 72" fill="none" stroke="url(#figureGrad)" strokeWidth="9" strokeLinecap="round" />
                      <ellipse cx="160" cy="70" rx="5" ry="7" fill="#fef08a" />
                    </>
                  )}

                  {/* Legs */}
                  <path
                    d={isMale ? 'M 110 165 L 105 235 M 130 165 L 135 235' : 'M 116 165 L 115 235 M 124 165 L 125 235'}
                    stroke="url(#figureGrad)"
                    strokeWidth="11"
                    strokeLinecap="round"
                  />
                  <ellipse cx={isMale ? '104' : '114'} cy="235" rx="7" ry="4" fill="#a7f3d0" />
                  <ellipse cx={isMale ? '136' : '126'} cy="235" rx="7" ry="4" fill="#a7f3d0" />
                </g>
              )}

              {/* --- RECITE / QIYAM --- */}
              {pose === 'recite' && (
                <g>
                  {showGuides && (
                    <g opacity="0.75">
                      <line
                        x1="60"
                        y1={isMale ? '128' : '98'}
                        x2="180"
                        y2={isMale ? '128' : '98'}
                        stroke="#f59e0b"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                      />
                      <text x="180" y={isMale ? '124' : '94'} fill="#fcd34d" fontSize="7" textAnchor="end">
                        {isMale ? 'Hands Below Navel' : 'Hands on Chest'}
                      </text>
                    </g>
                  )}

                  <circle cx="120" cy="52" r="16" fill="url(#figureGrad)" />
                  {!isMale && (
                    <path d="M 102 52 Q 120 30 138 52 Q 140 76 136 90 Q 120 95 104 90 Z" fill="#f472b6" opacity="0.4" />
                  )}
                  <path d="M 100 76 L 140 76 L 134 165 L 106 165 Z" fill="url(#figureGrad)" />

                  {/* Hand folding distinction */}
                  {isMale ? (
                    <>
                      {/* Arms folded below navel */}
                      <path d="M 100 80 Q 106 128 120 128 Q 134 128 140 80" fill="none" stroke="url(#figureGrad)" strokeWidth="10" strokeLinecap="round" />
                      <rect x="110" y="122" width="20" height="12" rx="4" fill="#fef08a" stroke="#d97706" strokeWidth="1" />
                    </>
                  ) : (
                    <>
                      {/* Female: arms folded higher on chest */}
                      <path d="M 100 80 Q 110 98 120 98 Q 130 98 140 80" fill="none" stroke="url(#figureGrad)" strokeWidth="9" strokeLinecap="round" />
                      <rect x="112" y="93" width="16" height="10" rx="3" fill="#fef08a" stroke="#d97706" strokeWidth="1" />
                    </>
                  )}

                  <path
                    d={isMale ? 'M 110 165 L 106 235 M 130 165 L 134 235' : 'M 116 165 L 115 235 M 124 165 L 125 235'}
                    stroke="url(#figureGrad)"
                    strokeWidth="11"
                    strokeLinecap="round"
                  />
                  <ellipse cx={isMale ? '104' : '114'} cy="235" rx="7" ry="4" fill="#a7f3d0" />
                  <ellipse cx={isMale ? '136' : '126'} cy="235" rx="7" ry="4" fill="#a7f3d0" />
                </g>
              )}

              {/* --- RUKU --- */}
              {pose === 'ruku' && (
                <g>
                  {showGuides && (
                    <g opacity="0.8">
                      <line
                        x1="40"
                        y1={isMale ? '122' : '142'}
                        x2="200"
                        y2={isMale ? '122' : '142'}
                        stroke="#f59e0b"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                      />
                      <text x="42" y={isMale ? '116' : '136'} fill="#fcd34d" fontSize="7" fontWeight="bold">
                        {isMale ? 'Male: 90° Flat Back' : 'Female: Slight Bow (45°–60°)'}
                      </text>
                    </g>
                  )}

                  {isMale ? (
                    <>
                      {/* Male full 90° ruku */}
                      <path d="M 80 135 L 80 232 M 94 135 L 94 232" stroke="url(#figureGrad)" strokeWidth="10" strokeLinecap="round" />
                      <ellipse cx="80" cy="232" rx="7" ry="4" fill="#a7f3d0" />
                      <ellipse cx="94" cy="232" rx="7" ry="4" fill="#a7f3d0" />
                      <path d="M 80 135 L 165 125 L 165 110 L 80 120 Z" fill="url(#figureGrad)" />
                      <circle cx="180" cy="120" r="14" fill="url(#figureGrad)" />
                      <path d="M 150 124 L 140 178" stroke="url(#figureGrad)" strokeWidth="9" strokeLinecap="round" />
                      <circle cx="140" cy="180" r="7" fill="#fef08a" stroke="#d97706" strokeWidth="1.5" />
                    </>
                  ) : (
                    <>
                      {/* Female slight modest bow */}
                      <path d="M 90 145 L 88 232 M 102 145 L 100 232" stroke="url(#figureGrad)" strokeWidth="10" strokeLinecap="round" />
                      <ellipse cx="88" cy="232" rx="6" ry="4" fill="#a7f3d0" />
                      <ellipse cx="100" cy="232" rx="6" ry="4" fill="#a7f3d0" />
                      {/* Torso angled at ~45-55 deg */}
                      <path d="M 90 145 L 155 105 L 165 118 L 100 155 Z" fill="url(#figureGrad)" />
                      <circle cx="170" cy="100" r="14" fill="url(#figureGrad)" />
                      <path d="M 102 52 Q 120 30 138 52 Q 140 76 136 90 Z" fill="#f472b6" opacity="0.4" />
                      {/* Arms tucked in resting on knees with fingers closed */}
                      <path d="M 140 115 L 118 165" stroke="url(#figureGrad)" strokeWidth="8" strokeLinecap="round" />
                      <ellipse cx="118" cy="166" rx="6" ry="4" fill="#fef08a" />
                    </>
                  )}
                </g>
              )}

              {/* --- ITIDAL / QAWMAH --- */}
              {pose === 'itidal' && (
                <g>
                  {showGuides && (
                    <g opacity="0.65">
                      <line x1="120" y1="40" x2="120" y2="235" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 3" />
                      <text x="126" y="90" fill="#6ee7b7" fontSize="7">
                        Stillness (Tuma’ninah)
                      </text>
                    </g>
                  )}

                  <circle cx="120" cy="52" r="16" fill="url(#figureGrad)" />
                  {!isMale && (
                    <path d="M 102 52 Q 120 30 138 52 Q 140 76 136 90 Q 120 95 104 90 Z" fill="#f472b6" opacity="0.4" />
                  )}
                  <path d="M 100 76 L 140 76 L 134 165 L 106 165 Z" fill="url(#figureGrad)" />
                  <path d="M 100 80 L 92 145 M 140 80 L 148 145" stroke="url(#figureGrad)" strokeWidth="8" strokeLinecap="round" />
                  <path
                    d={isMale ? 'M 110 165 L 106 235 M 130 165 L 134 235' : 'M 116 165 L 115 235 M 124 165 L 125 235'}
                    stroke="url(#figureGrad)"
                    strokeWidth="11"
                    strokeLinecap="round"
                  />
                  <ellipse cx={isMale ? '104' : '114'} cy="235" rx="7" ry="4" fill="#a7f3d0" />
                  <ellipse cx={isMale ? '136' : '126'} cy="235" rx="7" ry="4" fill="#a7f3d0" />
                </g>
              )}

              {/* --- SUJOOD (1 & 2) --- */}
              {(pose === 'sujood' || pose === 'sujood-2') && (
                <g>
                  {showGuides && (
                    <g opacity="0.85">
                      <text x="20" y="160" fill="#fcd34d" fontSize="7">
                        {isMale
                          ? 'Male: Elbows Elevated, Abdomen Away from Thighs'
                          : 'Female: Compact (Inkhifad), Forearms Flat on Floor'}
                      </text>
                    </g>
                  )}

                  {isMale ? (
                    <>
                      {/* Male Sujood: Elevated elbows & clear gap */}
                      <circle cx="62" cy="216" r="13" fill="url(#figureGrad)" />
                      <ellipse cx="50" cy="226" rx="4" ry="2" fill="#fef08a" />
                      <path d="M 72 212 L 135 160 L 160 216 L 145 224 L 125 180 L 78 220 Z" fill="url(#figureGrad)" />
                      {/* Arms raised up off mat */}
                      <path d="M 85 200 L 100 170 L 96 226" fill="none" stroke="url(#figureGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                      <ellipse cx="96" cy="227" rx="8" ry="3" fill="#fef08a" />
                      <ellipse cx="150" cy="226" rx="9" ry="4" fill="#fef08a" />
                      {/* Feet upright with toes bent toward Qiblah */}
                      <path d="M 155 220 L 188 195 L 195 224" fill="none" stroke="url(#figureGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                      <ellipse cx="196" cy="227" rx="7" ry="3" fill="#fef08a" />
                    </>
                  ) : (
                    <>
                      {/* Female Sujood: Compact Inkhifad */}
                      <circle cx="62" cy="218" r="12" fill="url(#figureGrad)" />
                      <ellipse cx="52" cy="226" rx="4" ry="2" fill="#fef08a" />
                      {/* Torso flattened against thighs */}
                      <path d="M 72 216 L 125 190 L 155 222 L 135 226 L 115 205 L 76 222 Z" fill="url(#figureGrad)" />
                      {/* Forearms flat on floor */}
                      <path d="M 75 220 L 115 226" stroke="url(#figureGrad)" strokeWidth="7" strokeLinecap="round" />
                      <ellipse cx="80" cy="227" rx="8" ry="3" fill="#fef08a" />
                      {/* Feet exiting to the right side flat */}
                      <ellipse cx="165" cy="228" rx="14" ry="4" fill="#a7f3d0" />
                    </>
                  )}
                </g>
              )}

              {/* --- JALSA & TASHAHHUD --- */}
              {(pose === 'jalsa' || pose === 'tashahhud') && (
                <g>
                  {showGuides && (
                    <g opacity="0.85">
                      <text x="20" y="70" fill="#fcd34d" fontSize="7">
                        {isMale ? 'Male: Iftirash (Sitting on left foot)' : 'Female: Tawarruk (Sitting on floor, feet to right)'}
                      </text>
                    </g>
                  )}

                  <circle cx="125" cy="95" r="16" fill="url(#figureGrad)" />
                  {!isMale && (
                    <path d="M 108 95 Q 125 74 142 95 Q 144 116 140 130 Z" fill="#f472b6" opacity="0.4" />
                  )}
                  <path d="M 110 115 L 145 115 L 140 185 L 105 185 Z" fill="url(#figureGrad)" />

                  {/* Hands on thighs */}
                  <path d="M 115 125 L 100 170 M 135 125 L 138 172" stroke="url(#figureGrad)" strokeWidth="8" strokeLinecap="round" />
                  <ellipse cx="98" cy="172" rx="6" ry="3" fill="#fef08a" />
                  <ellipse cx="138" cy="172" rx="6" ry="3" fill="#fef08a" />

                  {/* Pointing finger during tashahhud */}
                  {pose === 'tashahhud' && (
                    <g>
                      <circle cx="95" cy="165" r="5" fill="#f59e0b" />
                      <line x1="95" y1="165" x2="86" y2="162" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                    </g>
                  )}

                  {/* Base seating */}
                  {isMale ? (
                    <>
                      {/* Left foot flat beneath, right foot upright */}
                      <path d="M 105 185 L 90 220 L 155 220 L 140 185 Z" fill="url(#figureGrad)" />
                      <ellipse cx="140" cy="225" rx="14" ry="4" fill="#a7f3d0" />
                      <path d="M 152 210 L 160 225" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                    </>
                  ) : (
                    <>
                      {/* Female Tawarruk: sitting on left hip, both legs exit to right */}
                      <path d="M 105 185 L 85 225 L 145 225 L 140 185 Z" fill="url(#figureGrad)" />
                      <ellipse cx="155" cy="226" rx="18" ry="4" fill="#a7f3d0" />
                    </>
                  )}
                </g>
              )}

              {/* --- TASLEEM --- */}
              {(pose === 'tasleem-right' || pose === 'tasleem-left') && (
                <g>
                  {showGuides && (
                    <g opacity="0.85">
                      <text x="20" y="70" fill="#7dd3fc" fontSize="7" fontWeight="bold">
                        {pose === 'tasleem-right' ? 'Turn Head to Right Shoulder' : 'Turn Head to Left Shoulder'}
                      </text>
                    </g>
                  )}

                  {/* Head turned sideways */}
                  <ellipse cx={pose === 'tasleem-right' ? '135' : '115'} cy="92" rx="14" ry="16" fill="url(#figureGrad)" />
                  <path
                    d={pose === 'tasleem-right' ? 'M 148 92 L 154 94 L 148 97 Z' : 'M 102 92 L 96 94 L 102 97 Z'}
                    fill="#fef08a"
                  />
                  <path d="M 110 115 L 145 115 L 140 185 L 105 185 Z" fill="url(#figureGrad)" />
                  <path d="M 115 125 L 105 175 M 135 125 L 140 175" stroke="url(#figureGrad)" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 105 185 L 90 220 L 155 220 L 140 185 Z" fill="url(#figureGrad)" />
                </g>
              )}
            </motion.g>
          </AnimatePresence>
        </svg>
      </div>
      )}

      {/* Asset Status Badge (Transparently reports illustration status) */}
      <div className="relative z-10 mt-2 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-900/50 bg-emerald-950/70 px-3 py-2 text-[11px] text-emerald-200/90">
        <span className="flex items-center gap-1.5 font-medium">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>
            {showingArt
              ? 'Active View: Authentic Reference Artwork (Hanafi Male)'
              : isMale
              ? 'Active View: Reviewed Vector Blueprint'
              : 'Active View: Reviewed Female Hanafi Posture'}
          </span>
        </span>

        {showingArt ? (
          <span className="text-[10px] text-emerald-300 font-semibold">
            Extracted Reference Panel
          </span>
        ) : isMale && pngAssetId && !hasPngAsset ? (
          <span className="inline-flex items-center gap-1 text-[10px] text-amber-300/80">
            <AlertCircle className="h-3 w-3" />
            <span>Asset Slot: {pngAssetId} (Awaiting Studio Photography)</span>
          </span>
        ) : (
          <span className="text-[10px] text-emerald-400">Verified SVG Frame</span>
        )}
      </div>
    </div>
  );
}
