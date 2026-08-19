'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { useAudioStore } from '@/stores/audioStore';
import { useAskAiStore } from '@/stores/askAiStore';
import { useT } from '@/lib/i18n';
import { isQuranReaderPath } from '@/lib/reader-path';
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
  const hasPlaylist = useAudioStore((s) => s.playlist.length > 0);
  const onReader = isQuranReaderPath(usePathname());

  useEffect(() => {
    if (open) setLoaded(true);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setLoaded(true);
          setOpen(true);
        }}
        className={cn(
          'fixed right-4 z-[55] flex items-center rounded-full transition active:scale-95 sm:right-6',
          onReader
            ? 'h-11 w-11 justify-center border border-line bg-surface text-ink-2 shadow-sm hover:border-line-strong hover:bg-surface-2'
            : 'h-12 w-12 justify-center bg-emerald-800 text-sm font-bold text-white shadow-lg hover:bg-emerald-900 sm:h-14 sm:w-auto sm:gap-2 sm:px-4',
          hasPlaylist
            ? 'bottom-[calc(var(--audio-bar-height,0px)+0.75rem)]'
            : 'bottom-[max(1.25rem,env(safe-area-inset-bottom,0px)+0.75rem)] sm:bottom-8',
          open && 'pointer-events-none opacity-0',
        )}
        aria-label={t('askAi')}
        aria-hidden={open}
        tabIndex={open ? -1 : 0}
      >
        <span className={cn('flex items-center justify-center', onReader ? '' : 'h-8 w-8 rounded-full bg-white/15')}>
          <MessageCircle className="h-4 w-4" />
        </span>
        {!onReader && (
          <span className="hidden sm:inline">{t('askAi')}</span>
        )}
      </button>
      {loaded && <AskAiSheet open={open} onOpenChange={setOpen} />}
    </>
  );
}
