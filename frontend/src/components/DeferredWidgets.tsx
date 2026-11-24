'use client';

import dynamic from 'next/dynamic';

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
 * page bundle and skipped during SSR to reduce HTML payload and improve LCP/INP.
 */
export function DeferredWidgets() {
  return (
    <>
      <AudioBar />
      <AskAiFab />
      <GlobalVoiceSearch />
      <DailyAyahSlideIn />
    </>
  );
}
