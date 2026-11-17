import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BAND_COLORS, CARD_BASE, CARD_INTERACTIVE } from './tokens';

type PlanCardProps = {
  href: string;
  title: string;
  days: number;
  arabic: string;
  /** Index used to pick the band colour. */
  colorIndex?: number;
  /** 1-based current day for in-progress plans. */
  currentDay?: number;
  className?: string;
};

/** Solid colour band + geometric motif + Arabic name (homepage style). */
export function PlanCard({ href, title, days, arabic, colorIndex = 0, currentDay, className }: PlanCardProps) {
  const bg = BAND_COLORS[colorIndex % BAND_COLORS.length];
  const pct = currentDay ? Math.min(100, Math.round(((currentDay - 1) / Math.max(1, days)) * 100)) : 0;
  return (
    <Link href={href} className={cn(CARD_BASE, CARD_INTERACTIVE, 'group block overflow-hidden', className)}>
      <div
        className="relative flex h-32 items-center justify-center overflow-hidden px-5"
        style={{ backgroundColor: bg }}
      >
        <svg
          viewBox="0 0 200 120"
          className="pointer-events-none absolute inset-0 h-full w-full text-white/35"
          fill="none"
          aria-hidden
        >
          <circle cx="100" cy="60" r="46" stroke="currentColor" strokeWidth="1" />
          <rect x="68" y="28" width="64" height="64" transform="rotate(45 100 60)" stroke="currentColor" strokeWidth="1" />
          <rect x="68" y="28" width="64" height="64" stroke="currentColor" strokeWidth="1" />
        </svg>
        <span className="relative font-arabic text-4xl font-bold text-white" dir="rtl" lang="ar">
          {arabic}
        </span>
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          {currentDay ? `Day ${currentDay} of ${days}` : `${days}-day plan`}
        </p>
        <h3 className="mt-1.5 font-serif text-lg font-bold leading-snug text-ink group-hover:text-[var(--accent)]">
          {title}
        </h3>
        {currentDay ? (
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
            <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
          </div>
        ) : null}
      </div>
    </Link>
  );
}
