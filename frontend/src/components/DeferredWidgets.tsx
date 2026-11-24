'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useAudioStore } from '@/stores/audioStore';

const AudioBar = dynamic(
  () => import('@/components/audio/AudioBar').then((m) => m.AudioBar),
  { ssr: false },
);

const AskAiFab = dynamic(
  () => import('@/components/ai/AskAiFab').then((m) => m.AskAiFab),
  { ssr: false },
);

const GlobalVoiceSearch = dynamic(
  () => import('@/components/GlobalVoiceSearch').then((m) => m.GlobalVoiceSearch),
  { ssr: false },
);

const DailyAyahSlideIn = dynamic(
  () => import('@/components/lead/DailyAyahSubscribe').then((m) => m.DailyAyahSlideIn),
  { ssr: false },
);

/**
 * Non-critical floating widgets and audio bar, code-split out of the initial
 * page bundle and deferred until browser idle / interaction to reduce TBT.
 */
export function DeferredWidgets() {
  const [idleReady, setIdleReady] = useState(false);
  const hasActiveAudio = useAudioStore((s) => Boolean(s.isPlaying || s.playlist.length));

  useEffect(() => {
    let cancelled = false;
    const activate = () => {
      if (!cancelled) setIdleReady(true);
    };

    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    let idleId: number | undefined;
    let timerId: ReturnType<typeof setTimeout> | undefined;

    if (typeof win.requestIdleCallback === 'function') {
      idleId = win.requestIdleCallback(activate, { timeout: 2000 });
    } else {
      timerId = setTimeout(activate, 1200);
    }

    const onInteract = () => activate();
    window.addEventListener('pointerdown', onInteract, { once: true, passive: true });
    window.addEventListener('keydown', onInteract, { once: true, passive: true });

    return () => {
      cancelled = true;
      if (idleId !== undefined && typeof win.cancelIdleCallback === 'function') {
        win.cancelIdleCallback(idleId);
      }
      if (timerId !== undefined) clearTimeout(timerId);
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
  }, []);

  return (
    <>
      {(idleReady || hasActiveAudio) && <AudioBar />}
      <AskAiFab />
      {idleReady && (
        <>
          <GlobalVoiceSearch />
          <DailyAyahSlideIn />
        </>
      )}
    </>
  );
}
