'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Settings } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { ReaderSettingsSheet } from './ReaderSettingsSheet';

interface Props {
  activeTranslationCount: number;
  urlHasTranslations?: boolean;
  surahNumber: number;
}

export function ReaderToolbar({ urlHasTranslations = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const translationSlugs = useSettingsStore((state) => state.translationSlugs);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (urlHasTranslations || translationSlugs.length === 0) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('trans', translationSlugs.join(','));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams, translationSlugs, urlHasTranslations]);

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="hidden rounded-full bg-slate-100 p-1 sm:flex">
          <button type="button" className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-slate-800 shadow-sm">
            Verse by Verse
          </button>
          <button type="button" className="rounded-full px-4 py-1.5 text-xs font-medium text-slate-500">
            Reading
          </button>
        </div>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--accent)] hover:bg-[var(--accent)]/10"
          aria-label="Reader settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
      <ReaderSettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
