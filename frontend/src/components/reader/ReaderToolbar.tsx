'use client';

import { useState } from 'react';
import { BookOpen, List, Settings } from 'lucide-react';
import { useSettingsStore, type ReaderViewMode } from '@/stores/settingsStore';
import { ReaderSettingsSheet } from './ReaderSettingsSheet';
import { TajweedLegend } from '@/components/tajweed/TajweedLegend';
import { TajweedRulePopover } from '@/components/tajweed/TajweedRulePopover';
import type { TajweedRule } from '@/lib/tajweed/rules';
import { cn } from '@/lib/utils';

interface Props {
  activeTranslationCount: number;
  urlHasTranslations?: boolean;
  surahNumber: number;
}

const MODES: { id: ReaderViewMode; label: string; Icon: typeof List }[] = [
  { id: 'verse', label: 'Verse by Verse', Icon: List },
  { id: 'arabic', label: 'Reading', Icon: BookOpen },
];

export function ReaderToolbar(_props: Props) {
  const readerViewMode = useSettingsStore((state) => state.readerViewMode);
  const setReaderViewMode = useSettingsStore((state) => state.setReaderViewMode);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [ruleDetail, setRuleDetail] = useState<TajweedRule | null>(null);

  return (
    <>
      <div className="flex min-w-0 flex-nowrap items-center justify-end gap-3">
        <div
          className="flex shrink-0 flex-nowrap items-center rounded-lg bg-surface-2 p-0.5"
          role="tablist"
          aria-label="Reading view"
        >
          {MODES.map(({ id, label, Icon }) => {
            const active = id === 'verse' ? readerViewMode === 'verse' : readerViewMode !== 'verse';
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setReaderViewMode(id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-all sm:px-3',
                  active
                    ? 'bg-surface font-semibold text-ink shadow-xs'
                    : 'font-medium text-ink-muted hover:text-ink'
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-ink-3" aria-hidden />
                <span className="hidden sm:inline">{label}</span>
                <span className="sr-only sm:hidden">{label}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-brand hover:bg-brand/10 transition-colors"
          aria-label="Reader settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
      <ReaderSettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
      <TajweedLegend
        open={legendOpen}
        onOpenChange={setLegendOpen}
        onSelectRule={(rule) => setRuleDetail(rule)}
      />
      <TajweedRulePopover
        open={!!ruleDetail}
        onOpenChange={(o) => {
          if (!o) setRuleDetail(null);
        }}
        rule={ruleDetail}
      />
    </>
  );
}
