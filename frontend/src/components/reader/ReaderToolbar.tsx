'use client';

import { useState } from 'react';
import { Languages, List, Settings, Type } from 'lucide-react';
import { useSettingsStore, type ReaderViewMode } from '@/stores/settingsStore';
import { ReaderSettingsSheet } from './ReaderSettingsSheet';
import { cn } from '@/lib/utils';

interface Props {
  activeTranslationCount: number;
  urlHasTranslations?: boolean;
  surahNumber: number;
}

const MODES: { id: ReaderViewMode; label: string; Icon: typeof List }[] = [
  { id: 'verse', label: 'Verse by Verse', Icon: List },
  { id: 'arabic', label: 'Arabic', Icon: Type },
  { id: 'translation', label: 'Translation', Icon: Languages },
];

export function ReaderToolbar(_props: Props) {
  const readerViewMode = useSettingsStore((state) => state.readerViewMode);
  const setReaderViewMode = useSettingsStore((state) => state.setReaderViewMode);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        <div
          className="flex max-w-[min(100vw-8rem,28rem)] flex-wrap justify-end rounded-full bg-slate-100 p-1"
          role="tablist"
          aria-label="Reading view"
        >
          {MODES.map(({ id, label, Icon }) => {
            const active = readerViewMode === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setReaderViewMode(id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-medium transition-colors sm:px-3',
                  active
                    ? 'bg-[var(--recite-highlight)]/15 text-[var(--recite-highlight)] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="hidden md:inline">{label}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--recite-highlight)] hover:bg-[var(--recite-highlight)]/10"
          aria-label="Reader settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
      <ReaderSettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
