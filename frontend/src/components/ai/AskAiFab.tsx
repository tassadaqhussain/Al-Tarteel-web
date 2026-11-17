'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { useAudioStore } from '@/stores/audioStore';
import { useAskAiStore } from '@/stores/askAiStore';
import { useT } from '@/lib/i18n';
import { isQuranReaderPath } from '@/lib/reader-path';
import { trackAskAiOpen } from '@/lib/analytics';
import { cn } from '@/lib/utils';

const AskAiSheet = dynamic(
  () => import('@/components/ai/AskAiSheet').then((m) => m.AskAiSheet),
  { ssr: false }
);

/** Global floating entry point for Ask AI (text + voice). Sheet JS loads on demand. */
export function AskAiFab() {
  const { t } = useT();
  const open = useAskAiStore((s) => s.open);
  const setOpen = useAskAiStore((s) => s.setOpen);
  const [loaded, setLoaded] = useState(false);
  const [hiddenOnMobileScroll, setHiddenOnMobileScroll] = useState(false);
  const pathname = usePathname();
  const hasPlaylist = useAudioStore((s) => s.playlist.length > 0);
  const onReader = isQuranReaderPath(pathname);
  const onAdmin = (pathname || '').startsWith('/admin');

  useEffect(() => {
    if (open) setLoaded(true);
  }, [open]);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      if (window.innerWidth > 480) {
        setHiddenOnMobileScroll(false);
        return;
      }
      const y = window.scrollY;
      if (y <= 120) {
        setHiddenOnMobileScroll(false);
      } else if (y > lastY + 8) {
        setHiddenOnMobileScroll(true);
      } else if (y < lastY - 8) {
        setHiddenOnMobileScroll(false);
      }
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (onAdmin || (onReader && hasPlaylist)) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setLoaded(true);
          setOpen(true);
          trackAskAiOpen(onReader ? 'reader_fab' : 'global_fab');
        }}
        className={cn(
          'fixed right-4 z-[55] flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-800 px-4 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-900 active:scale-95 sm:right-6 sm:h-12 sm:px-4',
          hasPlaylist
            ? 'bottom-[calc(var(--audio-bar-height,0px)+0.75rem)]'
            : 'bottom-[max(1.25rem,env(safe-area-inset-bottom,0px)+0.75rem)] sm:bottom-8',
          open && 'pointer-events-none opacity-0',
          !open && hiddenOnMobileScroll && 'max-[480px]:pointer-events-none max-[480px]:translate-y-4 max-[480px]:opacity-0',
        )}
        aria-label={t('askAi')}
        aria-hidden={open}
        tabIndex={open ? -1 : 0}
      >
        <MessageCircle className="h-4 w-4 shrink-0" />
        <span>{t('askAi')}</span>
      </button>
      {loaded && <AskAiSheet open={open} onOpenChange={setOpen} />}
    </>
  );
}
