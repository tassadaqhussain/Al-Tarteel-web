'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { NavigateQuranDrawer } from '@/components/home/NavigateQuranDrawer';

interface Props {
  surahNumber: number;
  surahName: string;
}

/** Reader sub-header control: opens the Quran.com-style Surah/Verse/Juz/Page picker. */
export function SurahNavTrigger({ surahNumber, surahName }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="relative flex h-11 min-w-0 items-center sm:h-12">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative inline-flex h-full min-w-0 max-w-full items-center gap-1.5 text-left text-base font-semibold text-ink transition hover:text-brand"
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className="truncate">
            {surahNumber}. {surahName}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
        </button>
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
