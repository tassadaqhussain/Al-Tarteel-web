'use client';

import Link from 'next/link';
import { BookOpenText, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { TAJWEED_RULE_LIST, type TajweedRule } from '@/lib/tajweed/rules';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectRule?: (rule: TajweedRule) => void;
};

/** Legend of Quran.com tajweed colour classes used by QuranPilot. */
export function TajweedLegend({ open, onOpenChange, onSelectRule }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-hidden p-0 sm:rounded-2xl">
        <div className="relative border-b border-line-subtle px-5 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 rounded-full p-2 text-ink-muted hover:bg-surface-3"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <DialogTitle className="text-xl font-bold text-ink">Tajweed Guide</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-ink-3">
            Colours follow the verified Quran.com Uthmani tajweed annotations. Colour is never the only cue—tap a
            rule for its name and explanation.
          </DialogDescription>
        </div>
        <ul className="max-h-[55vh] space-y-1 overflow-y-auto px-3 py-3">
          {TAJWEED_RULE_LIST.map((rule) => (
            <li key={rule.id}>
              <button
                type="button"
                onClick={() => {
                  onSelectRule?.(rule);
                  onOpenChange(false);
                }}
                className={cn(
                  'flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-surface-2',
                )}
              >
                <span
                  className="mt-1 inline-block h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-black/10"
                  style={{ backgroundColor: rule.color }}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">{rule.name}</span>
                  <span className="block font-arabic text-sm text-ink-muted" lang="ar" dir="rtl">
                    {rule.nameArabic}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-muted">{rule.shortLabel}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-line-subtle px-5 py-3">
          <Link
            href="/tajweed"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            <BookOpenText className="h-4 w-4" />
            Open Tajweed lessons
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
