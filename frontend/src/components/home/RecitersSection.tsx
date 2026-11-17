'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Headphones, Loader2, Pause, Play } from 'lucide-react';
import { Msg } from '@/components/i18n/Msg';
import type { MessageKey } from '@/lib/i18n/messages';
import { PageSection } from '@/components/layout/MainContainer';
import { useAudioStore } from '@/stores/audioStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { startSurahPlayback } from '@/lib/audio/playback';
import { trackSelectContent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

const RECITERS: Array<{
  id: string;
  initials: string;
  name: string;
  desc: MessageKey;
  audioSlug?: string;
}> = [
  { id: 'alafasy', initials: 'MA', name: 'Mishary Rashid Alafasy', desc: 'reciterDescAlafasy', audioSlug: 'alafasy' },
  { id: 'sudais', initials: 'AS', name: 'Abdul Rahman Al-Sudais', desc: 'reciterDescSudais', audioSlug: 'sudais' },
  { id: 'basit', initials: 'AB', name: 'Abdul Basit Abdus Samad', desc: 'reciterDescBasit', audioSlug: 'abdul-basit-murattal' },
  { id: 'dosari', initials: 'YD', name: 'Yasser Al-Dosari', desc: 'reciterDescHaramImam', audioSlug: 'dussary' },
];

export function RecitersSection() {
  const reciterSlug = useAudioStore((s) => s.reciterSlug);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const setPlaying = useAudioStore((s) => s.setPlaying);
  const setReciter = useAudioStore((s) => s.setReciter);
  const setReciterSlug = useSettingsStore((s) => s.setReciterSlug);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSamplePlay = async (r: (typeof RECITERS)[number]) => {
    if (!r.audioSlug) return;
    trackSelectContent('reciter', r.audioSlug, r.name);

    if (reciterSlug === r.audioSlug) {
      setPlaying(!isPlaying);
      return;
    }

    setLoadingId(r.id);
    try {
      setReciter(r.audioSlug);
      setReciterSlug(r.audioSlug);
      await startSurahPlayback({ surahNumber: 1, startAyah: 1, playing: true });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <PageSection>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
            Audio recitation
          </p>
          <h2 className="mt-1 font-serif text-[26px] font-bold tracking-tight text-ink">
            Reciters
          </h2>
        </div>
        <Link
          href="/al-fatihah"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:underline"
        >
          <Headphones className="h-4 w-4" aria-hidden />
          <span>Open audio reader →</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {RECITERS.map((r) => {
          const isThisActive = Boolean(r.audioSlug && reciterSlug === r.audioSlug && isPlaying);
          const isLoading = loadingId === r.id;

          return (
            <article
              key={r.id}
              className={cn(
                'flex flex-col justify-between rounded-2xl border bg-surface p-5 transition',
                isThisActive ? 'border-[var(--accent)]' : 'border-line hover:border-[var(--accent)]/60',
              )}
            >
              <div className="flex items-center gap-3.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 text-sm font-bold text-[var(--accent)]">
                  {r.initials}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-ink">{r.name}</h3>
                  <p className="mt-0.5 truncate text-xs text-ink-muted">
                    <Msg k={r.desc} />
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-line-subtle pt-3">
                {r.audioSlug ? (
                  <button
                    type="button"
                    onClick={() => void handleSamplePlay(r)}
                    className={cn(
                      'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition',
                      isThisActive
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-surface-2 text-ink-2 hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]',
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isThisActive ? (
                      <Pause className="h-3.5 w-3.5" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                    <span>{isThisActive ? 'Pause sample' : 'Play sample'}</span>
                  </button>
                ) : (
                  <p className="py-2 text-center text-xs text-ink-muted">Sample coming soon</p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </PageSection>
  );
}
