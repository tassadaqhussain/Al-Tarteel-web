'use client';

import { useState } from 'react';
import { ChevronDown, Info, Play } from 'lucide-react';
import { TranslationSheet } from './TranslationSheet';

export function ChapterControls({ translationCount }: { translationCount: number }) {
  const [translationOpen, setTranslationOpen] = useState(false);
  return (
    <>
      <div className="grid w-full gap-2 sm:w-[430px] sm:grid-cols-2">
        <button type="button" className="flex h-9 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white text-sm font-medium shadow-sm hover:border-[var(--accent)]">
          <Play className="h-3.5 w-3.5 fill-[var(--accent)] text-[var(--accent)]" /> Listen
        </button>
        <button type="button" className="flex h-9 items-center justify-center gap-2 rounded-full border border-[var(--accent)] bg-white text-sm font-medium">
          <Info className="h-4 w-4 text-[var(--accent)]" /> Info
        </button>
        <button type="button" onClick={() => setTranslationOpen(true)} className="flex h-9 items-center justify-between rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-600 shadow-sm sm:col-span-2">
          <span className="truncate">Translation: {translationCount > 0 ? `${translationCount} selected` : 'Select translation'}</span>
          <ChevronDown className="h-4 w-4 shrink-0" />
        </button>
      </div>
      <TranslationSheet open={translationOpen} onOpenChange={setTranslationOpen} />
    </>
  );
}
