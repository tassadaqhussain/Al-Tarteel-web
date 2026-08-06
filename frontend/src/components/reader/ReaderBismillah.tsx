'use client';

import { useSettingsStore } from '@/stores/settingsStore';

export function ReaderBismillah() {
  const readerViewMode = useSettingsStore((s) => s.readerViewMode);
  if (readerViewMode === 'translation') {
    return (
      <div className="mb-5 py-4 text-center">
        <p className="font-arabic text-2xl leading-loose text-slate-400">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
        <p className="mt-2 text-sm text-slate-400">
          In the Name of Allah—the Most Compassionate, Most Merciful
        </p>
      </div>
    );
  }
  return (
    <div className="mb-5 py-4 text-center">
      <p className="font-arabic text-3xl leading-loose text-slate-800">
        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      </p>
      {readerViewMode === 'verse' && (
        <p className="mt-2 text-xs text-[var(--muted)]">
          In the Name of Allah—the Most Compassionate, Most Merciful
        </p>
      )}
    </div>
  );
}
