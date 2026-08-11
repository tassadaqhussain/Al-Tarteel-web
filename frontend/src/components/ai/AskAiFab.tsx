'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useAudioStore } from '@/stores/audioStore';
import { useAskAiStore } from '@/stores/askAiStore';
import { useT } from '@/lib/i18n';
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
          'fixed right-4 z-[55] flex h-12 items-center gap-2 rounded-full bg-[var(--accent)] px-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--accent)]/25 transition hover:scale-[1.03] hover:bg-[var(--accent)]/90 active:scale-95 sm:right-6 sm:h-14 sm:px-4',
          // Sit just above the audio bar (or a comfortable default when no player).
          hasPlaylist
            ? 'bottom-[calc(var(--audio-bar-height,0px)+0.75rem)]'
            : 'bottom-[max(1.25rem,env(safe-area-inset-bottom,0px)+0.75rem)] sm:bottom-8',
          open && 'pointer-events-none opacity-0',
        )}
        aria-label={t('askAi')}
        aria-hidden={open}
        tabIndex={open ? -1 : 0}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="hidden min-[380px]:inline">{t('askAi')}</span>
        <span className="min-[380px]:hidden">{t('askAiShort')}</span>
      </button>
      {loaded && <AskAiSheet open={open} onOpenChange={setOpen} />}
    </>
  );
}
