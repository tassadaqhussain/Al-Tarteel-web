'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronUp } from 'lucide-react';
import { useAudioStore } from '@/stores/audioStore';
import { isQuranReaderPath } from '@/lib/reader-path';
import { cn } from '@/lib/utils';

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  const [scrollingDownMobile, setScrollingDownMobile] = useState(false);
  const pathname = usePathname();
  const hasPlaylist = useAudioStore((s) => s.playlist.length > 0);
  const onReader = isQuranReaderPath(pathname);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const threshold = Math.max(900, window.innerHeight * 2);
      setVisible(y > threshold);
      if (window.innerWidth <= 480) {
        if (y <= threshold) setScrollingDownMobile(false);
        else if (y > lastY + 8) setScrollingDownMobile(true);
        else if (y < lastY - 8) setScrollingDownMobile(false);
      } else {
        setScrollingDownMobile(false);
      }
      lastY = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (onReader && hasPlaylist) return null;

  const show = visible && !scrollingDownMobile;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        'fixed right-4 z-[54] flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/85 bg-emerald-800 text-white shadow-xl backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 active:scale-95 sm:right-6',
        'bottom-[calc(var(--audio-bar-height,0px)+5rem)] sm:bottom-[calc(var(--audio-bar-height,0px)+6rem)]',
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
      )}
      aria-label="Back to top"
      title="Back to top"
    >
      <ChevronUp className="h-5 w-5" aria-hidden />
    </button>
  );
}
