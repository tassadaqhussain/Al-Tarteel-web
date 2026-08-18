import {
  AudioLines,
  Headphones,
  Mic,
  Music,
  Radio,
  Volume2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const RECITER_TILE_VARIANTS = [
  'alafasy',
  'sudais',
  'basit',
  'dosari',
  'balila',
  'ousi',
] as const;

export type ReciterTileVariant = (typeof RECITER_TILE_VARIANTS)[number];

const TILES: Record<ReciterTileVariant, { bg: string; icon: LucideIcon }> = {
  alafasy: { bg: 'bg-emerald-800', icon: Mic },
  sudais: { bg: 'bg-teal-800', icon: Headphones },
  basit: { bg: 'bg-stone-700', icon: AudioLines },
  dosari: { bg: 'bg-slate-800', icon: Volume2 },
  balila: { bg: 'bg-amber-800', icon: Radio },
  ousi: { bg: 'bg-green-800', icon: Music },
};

type Props = {
  variant: ReciterTileVariant;
  className?: string;
  title?: string;
};

export function ReciterTile({ variant, className, title }: Props) {
  const { bg, icon: Icon } = TILES[variant];

  return (
    <span
      className={cn('flex h-full w-full items-center justify-center text-white', bg, className)}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <Icon className="h-[42%] w-[42%]" strokeWidth={1.6} aria-hidden />
    </span>
  );
}
