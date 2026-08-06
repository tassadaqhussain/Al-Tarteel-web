'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  /** full = edge-to-edge under sticky bar; under-title = grows under surah name (Quran.com) */
  variant?: 'full' | 'under-title';
  className?: string;
}

/**
 * Thin accent bar tracking scroll progress through the reader page.
 */
export function ReadingProgressBar({ variant = 'full', className }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      const next = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
      setProgress(next);
    };

    const onScrollOrResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(onScrollOrResize)
      : null;
    ro?.observe(document.documentElement);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      ro?.disconnect();
    };
  }, []);

  return (
    <div
      className={cn(
        'pointer-events-none h-0.5 overflow-hidden bg-slate-200/70',
        variant === 'full' && 'absolute inset-x-0 bottom-0',
        variant === 'under-title' && 'mt-1 w-full min-w-[4.5rem] max-w-[11rem] rounded-full',
        className,
      )}
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    >
      <div
        className="h-full bg-[var(--recite-highlight)] transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
