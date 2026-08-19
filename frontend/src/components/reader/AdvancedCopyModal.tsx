'use client';

import { useMemo, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  textUthmani: string;
  translations?: { name: string; text: string }[];
  transliteration?: string;
}

type CopyMode = 'arabic' | 'translation' | 'both' | 'all';

export function AdvancedCopyModal({
  open,
  onOpenChange,
  surahNumber,
  surahName,
  ayahNumber,
  textUthmani,
  translations = [],
  transliteration,
}: Props) {
  const [mode, setMode] = useState<CopyMode>('both');
  const [copied, setCopied] = useState(false);

  const preview = useMemo(() => {
    const parts: string[] = [];
    if (mode === 'arabic' || mode === 'both' || mode === 'all') parts.push(textUthmani);
    if ((mode === 'translation' || mode === 'both' || mode === 'all') && translations.length) {
      parts.push(...translations.map((t) => t.text));
    }
    if (mode === 'all' && transliteration) parts.push(transliteration);
    parts.push(`— ${surahName} ${surahNumber}:${ayahNumber}`);
    return parts.join('\n\n');
  }, [ayahNumber, mode, surahName, surahNumber, textUthmani, translations, transliteration]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(preview).catch(() => null);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const options: { id: CopyMode; label: string }[] = [
    { id: 'arabic', label: 'Arabic only' },
    { id: 'translation', label: 'Translation only' },
    { id: 'both', label: 'Arabic + translation' },
    { id: 'all', label: 'Arabic + translation + transliteration' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0">
        <div className="relative px-6 py-6">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-full p-2 text-ink-faint hover:bg-surface-3 hover:text-ink-2"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <DialogTitle className="text-xl font-bold text-ink">Advanced Copy</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-ink-muted">
            Choose what to copy for {surahName} {surahNumber}:{ayahNumber}
          </DialogDescription>

          <div className="mt-5 space-y-2">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setMode(option.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                  mode === option.id
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]'
                    : 'border-line text-ink-2 hover:bg-surface-2'
                )}
              >
                {option.label}
                {mode === option.id && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>

          <pre className="mt-5 max-h-40 overflow-auto whitespace-pre-wrap rounded-xl bg-surface-2 p-4 text-sm leading-relaxed text-ink-2">
            {preview}
          </pre>

          <button
            type="button"
            onClick={() => void handleCopy()}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-brand-contrast hover:opacity-95"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy to clipboard'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
