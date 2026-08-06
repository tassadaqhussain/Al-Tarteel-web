'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { NavigateQuranDrawer } from '@/components/home/NavigateQuranDrawer';
import { ReadingProgressBar } from '@/components/reader/ReadingProgressBar';

interface Props {
  surahNumber: number;
  surahName: string;
}

/** Reader sub-header control: opens the Quran.com-style Surah/Verse/Juz/Page picker. */
export function SurahNavTrigger({ surahNumber, surahName }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="inline-flex max-w-full flex-col">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex max-w-full items-center gap-1.5 truncate text-left text-sm font-semibold text-slate-800 transition hover:text-[var(--recite-highlight)]"
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className="truncate">
            {surahNumber}. {surahName}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
        </button>
        {/* Quran.com: progress sits under the surah title */}
        <ReadingProgressBar variant="under-title" />
      </div>
      <NavigateQuranDrawer
        open={open}
        onOpenChange={setOpen}
        currentSurahNumber={surahNumber}
        currentSurahName={surahName}
      />
    </>
  );
}
