'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Headphones, Loader2, Pause, Play } from 'lucide-react';
import { ReciterTile, type ReciterTileVariant } from '@/components/audio/ReciterTile';
import { Msg } from '@/components/i18n/Msg';
import type { MessageKey } from '@/lib/i18n/messages';
import { SITE_SHELL } from '@/components/layout/MainContainer';
import { useAudioStore } from '@/stores/audioStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { startSurahPlayback } from '@/lib/audio/playback';
import { trackSelectContent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

const RECITERS: Array<{
  variant: ReciterTileVariant;
  name: string;
  desc: MessageKey;
  audioSlug?: string;
}> = [
  { variant: 'alafasy', name: 'Mishary Rashid Alafasy', desc: 'reciterDescAlafasy', audioSlug: 'alafasy' },
  { variant: 'sudais', name: 'Abdul Rahman Al-Sudais', desc: 'reciterDescSudais', audioSlug: 'sudais' },
  { variant: 'basit', name: 'Abdul Basit Abdus Samad', desc: 'reciterDescBasit', audioSlug: 'abdul-basit-murattal' },
  { variant: 'dosari', name: 'Yasser Al-Dosari', desc: 'reciterDescHaramImam', audioSlug: 'dussary' },
  { variant: 'balila', name: 'Abdul Aziz Bin Bandar Balila', desc: 'reciterDescHaramImam' },
  { variant: 'ousi', name: 'Abdur Rahman Al-Ousi', desc: 'reciterDescOusi' },
];

export function RecitersSection() {
  const reciterSlug = useAudioStore((s) => s.reciterSlug);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const setPlaying = useAudioStore((s) => s.setPlaying);
  const setReciter = useAudioStore((s) => s.setReciter);
  const setReciterSlug = useSettingsStore((s) => s.setReciterSlug);
  const [loadingVariant, setLoadingVariant] = useState<ReciterTileVariant | null>(null);

  const handleSamplePlay = async (r: (typeof RECITERS)[number]) => {
    if (!r.audioSlug) return;
    trackSelectContent('reciter', r.audioSlug, r.name);

    if (reciterSlug === r.audioSlug) {
      setPlaying(!isPlaying);
      return;
    }

    setLoadingVariant(r.variant);
    try {
      setReciter(r.audioSlug);
      setReciterSlug(r.audioSlug);
      await startSurahPlayback({ surahNumber: 1, startAyah: 1, playing: true });
    } finally {
      setLoadingVariant(null);
    }
  };

  return (
    <section className="w-full bg-surface py-16 2xl:py-20">
      <div className={SITE_SHELL}>
        <div className="mb-10 flex flex-col items-center justify-between gap-3 text-center lg:flex-row lg:text-left">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl 2xl:text-5xl">
            <Msg k="recitersTitle" /> <br className="sm:hidden" />
            <span className="text-brand"><Msg k="recitersAccent" /></span>
          </h2>
          <Link
            href="/al-fatihah"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline"
          >
            <Headphones className="h-4 w-4" aria-hidden />
            Open full audio reader →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {RECITERS.map((r) => {
            const isThisActive = Boolean(r.audioSlug && reciterSlug === r.audioSlug && isPlaying);
            const isLoading = loadingVariant === r.variant;

            return (
              <div
                key={r.variant}
                className={cn(
                  'group relative flex flex-col items-center rounded-3xl border p-6 text-center transition-all duration-300 hover:shadow-md motion-safe:hover:-translate-y-1',
                  isThisActive
                    ? 'border-brand/50 bg-brand/[0.06] shadow-md'
                    : 'border-line-subtle bg-brand/[0.025] hover:border-brand/30 hover:bg-brand/[0.05]'
                )}
              >
                <div className="relative mb-4 h-28 w-28 overflow-hidden rounded-full border-4 border-surface bg-brand/10 shadow-md transition motion-safe:group-hover:scale-105 sm:h-32 sm:w-32">
                  <ReciterTile variant={r.variant} />
                  {r.audioSlug && (
                    <button
                      type="button"
                      onClick={() => void handleSamplePlay(r)}
                      aria-label={isThisActive ? `Pause ${r.name}` : `Play sample by ${r.name}`}
                      className={cn(
                        'absolute inset-0 flex items-center justify-center bg-emerald-950/45 transition',
                        isThisActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                      ) : isThisActive ? (
                        <Pause className="h-8 w-8 fill-white text-white" />
                      ) : (
                        <Play className="ml-0.5 h-8 w-8 fill-white text-white" />
                      )}
                    </button>
                  )}
                </div>

                <h3 className="text-base font-bold text-ink transition group-hover:text-brand 2xl:text-lg">
                  {r.name}
                </h3>
                <p className="mt-1 text-xs text-ink-muted"><Msg k={r.desc} /></p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  {r.audioSlug ? (
                    <button
                      type="button"
                      onClick={() => void handleSamplePlay(r)}
                      disabled={isLoading}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition',
                        isThisActive
                          ? 'bg-emerald-800 text-white shadow-sm'
                          : 'border border-emerald-900/15 bg-surface text-ink-2 hover:border-brand/40 hover:text-brand'
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : isThisActive ? (
                        <Pause className="h-3.5 w-3.5 fill-current" />
                      ) : (
                        <Play className="h-3.5 w-3.5 fill-current" />
                      )}
                      <span>{isThisActive ? 'Playing Al-Fatihah' : 'Play Sample'}</span>
                    </button>
                  ) : (
                    <span
                      aria-disabled="true"
                      className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-line bg-surface-2 px-4 py-1.5 text-xs font-semibold text-ink-faint opacity-70"
                    >
                      <Play className="h-3.5 w-3.5" aria-hidden />
                      <span>Sample Soon</span>
                    </span>
                  )}

                  <Link
                    href="/al-fatihah"
                    onClick={() => {
                      if (r.audioSlug) {
                        setReciter(r.audioSlug);
                        setReciterSlug(r.audioSlug);
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand/10"
                  >
                    <BookOpen className="h-3.5 w-3.5" aria-hidden />
                    <span>Open Reader</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
