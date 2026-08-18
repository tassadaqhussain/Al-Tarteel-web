'use client';

import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        'fixed right-4 z-[54] flex h-11 w-11 items-center justify-center rounded-full border border-emerald-900/15 bg-white/92 text-emerald-900 shadow-lg shadow-emerald-950/10 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-900 hover:text-white active:scale-95 sm:right-6',
        'bottom-[calc(var(--audio-bar-height,0px)+5rem)] sm:bottom-[calc(var(--audio-bar-height,0px)+6rem)]',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
      )}
      aria-label="Back to top"
      title="Back to top"
    >
      <ChevronUp className="h-5 w-5" aria-hidden />
    </button>
  );
}
