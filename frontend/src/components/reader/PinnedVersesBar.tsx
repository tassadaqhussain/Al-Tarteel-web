'use client';

import { X } from 'lucide-react';
import { useComparePinStore } from '@/stores/comparePinStore';
import { cn } from '@/lib/utils';

/** Sticky chip strip for pinned verses (opens compare modal). */
export function PinnedVersesBar() {
  const pins = useComparePinStore((s) => s.pins);
  const activeAyahId = useComparePinStore((s) => s.activeAyahId);
  const unpin = useComparePinStore((s) => s.unpin);
  const openModal = useComparePinStore((s) => s.openModal);
  const setActive = useComparePinStore((s) => s.setActive);
  const clear = useComparePinStore((s) => s.clear);

  if (!pins.length) return null;

  return (
    <div className="border-b border-line bg-surface px-3 py-2.5 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <p className="shrink-0 text-xs font-medium text-ink-muted">Pinned verses</p>
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {pins.map((pin) => {
            const active = pin.ayahId === activeAyahId;
            return (
              <div key={pin.ayahId} className="flex shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => setActive(pin.ayahId)}
                  className={cn(
                    'inline-flex h-7 items-center rounded-l-full border px-2.5 text-xs font-semibold tabular-nums transition',
                    active
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-brand-contrast'
                      : 'border-[var(--accent)]/40 bg-surface text-[var(--accent)] hover:bg-[var(--accent)]/10'
                  )}
                >
                  {pin.surahNumber}:{pin.ayahNumber}
                </button>
                <button
                  type="button"
                  onClick={() => unpin(pin.ayahId)}
                  className={cn(
                    'inline-flex h-7 items-center rounded-r-full border border-l-0 px-1.5 transition',
                    active
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-brand-contrast hover:bg-[var(--accent)]/90'
                      : 'border-[var(--accent)]/40 text-[var(--accent)] hover:bg-[var(--accent)]/10'
                  )}
                  aria-label={`Unpin ${pin.surahNumber}:${pin.ayahNumber}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="hidden shrink-0 text-xs font-medium text-[var(--accent)] hover:underline sm:inline"
        >
          Compare
        </button>
        {pins.length > 1 && (
          <button
            type="button"
            onClick={() => clear()}
            className="shrink-0 text-xs text-ink-faint hover:text-ink-3"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
