'use client';

import { useSettingsStore } from '@/stores/settingsStore';

export function ReaderBismillah() {
  const readerViewMode = useSettingsStore((s) => s.readerViewMode);
  if (readerViewMode === 'translation') {
    return (
      <div className="mb-5 border-y border-slate-200 bg-white/60 py-5 text-center">
        <p className="font-arabic text-2xl leading-loose text-slate-800">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
        <p className="mt-2 text-sm text-slate-600">
          In the Name of Allah—the Most Compassionate, Most Merciful
        </p>
      </div>
    );
  }
  return (
    <div className="mb-5 border-y border-slate-200 bg-white/60 py-5 text-center">
      <p className="font-arabic text-3xl leading-loose text-slate-800">
        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      </p>
      {readerViewMode === 'verse' && (
        <p className="mt-2 text-sm text-slate-600">
          In the Name of Allah—the Most Compassionate, Most Merciful
        </p>
      )}
    </div>
  );
}
