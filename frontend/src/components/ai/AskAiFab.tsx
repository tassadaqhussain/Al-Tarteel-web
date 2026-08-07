'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { AskAiSheet } from '@/components/ai/AskAiSheet';

/** Global floating entry point for Ask AI (text + voice). */
export function AskAiFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-[55] flex h-14 items-center gap-2 rounded-full bg-[var(--accent)] px-4 text-sm font-bold text-white shadow-lg shadow-[var(--accent)]/25 transition hover:scale-[1.03] hover:bg-[var(--accent)]/90 active:scale-95 sm:bottom-28 sm:right-6"
        aria-label="Ask AI"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
          <Sparkles className="h-4 w-4" />
        </span>
        Ask AI
      </button>
      <AskAiSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
