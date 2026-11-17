import Link from 'next/link';
import { Check } from 'lucide-react';
import { getSurahArabicName, getSurahMeta, getSurahPath } from '@/lib/surah-meta';
import { getSurahAyahCount } from '@/lib/surah-pagination';
import { cn } from '@/lib/utils';
import { CARD_BASE, CARD_INTERACTIVE } from './tokens';

type SurahCardProps = {
  number: number;
  /** 0–100 read progress for signed-in users; omit to hide the mark. */
  progress?: number;
  href?: string;
  /** Short caption override (default: meaning · N verses). */
  caption?: string;
  className?: string;
};

/** Surah card in the homepage "Popular surahs" style. */
export function SurahCard({ number, progress, href, caption, className }: SurahCardProps) {
  const meta = getSurahMeta(number);
  const arabic = getSurahArabicName(number, meta.nameArabic);
  const verses = getSurahAyahCount(number);
  const done = typeof progress === 'number' && progress >= 100;
  const started = typeof progress === 'number' && progress > 0 && !done;
  return (
    <Link
      href={href ?? getSurahPath(number)}
      className={cn(CARD_BASE, CARD_INTERACTIVE, 'group relative flex min-h-[7.5rem] flex-col justify-between p-4', className)}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex h-7 min-w-[2rem] items-center justify-center rounded-full bg-[var(--accent)]/10 px-2 text-xs font-bold text-[var(--accent)]">
          {String(number).padStart(2, '0')}
        </span>
        <span className="font-arabic text-2xl leading-none text-ink" dir="rtl" lang="ar">
          {arabic}
        </span>
      </div>
      <div className="mt-4">
        <p className="flex items-center gap-1.5 text-base font-bold text-ink group-hover:text-[var(--accent)]">
          {meta.nameSimple}
          {done && <Check className="h-4 w-4 text-[var(--accent)]" strokeWidth={3} aria-label="Completed" />}
        </p>
        <p className="mt-0.5 truncate text-xs text-ink-muted">
          {caption ??
            `${
              meta.meaning && meta.meaning.toLowerCase() !== meta.nameSimple.toLowerCase()
                ? `${meta.meaning} · `
                : ''
            }${verses} verses`}
        </p>
        {started && (
          <div
            className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface-3"
            role="progressbar"
            aria-valuenow={Math.round(progress!)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </Link>
  );
}
