import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EYEBROW, GOLD_TEXT } from './tokens';

type SectionHeaderProps = {
  label?: React.ReactNode;
  title: React.ReactNode;
  /** Colour of the small uppercase label. */
  tone?: 'accent' | 'gold';
  viewAll?: { href: string; label?: React.ReactNode };
  as?: 'h2' | 'h3';
  className?: string;
};

/** Small uppercase label + serif H2 + optional "View all →". */
export function SectionHeader({
  label,
  title,
  tone = 'accent',
  viewAll,
  as: Heading = 'h2',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-5 flex items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        {label && (
          <p className={cn(EYEBROW, tone === 'gold' ? GOLD_TEXT : 'text-[var(--accent)]')}>{label}</p>
        )}
        <Heading className="mt-1 font-serif text-[26px] font-bold tracking-tight text-ink">{title}</Heading>
      </div>
      {viewAll && (
        <Link
          href={viewAll.href}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:underline"
        >
          <span>{viewAll.label ?? 'View all'}</span>
          <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
        </Link>
      )}
    </div>
  );
}
