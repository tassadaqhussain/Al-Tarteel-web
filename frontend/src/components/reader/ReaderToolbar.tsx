'use client';

import { useState } from 'react';
import {
  Languages,
  BookMarked,
  AArrowDown,
  AArrowUp,
  Eye,
  EyeOff,
  AlignJustify,
  Pilcrow,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TranslationSheet } from './TranslationSheet';
import { useSettingsStore, type FontSize } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';

const FONT_SIZES: FontSize[] = ['sm', 'md', 'lg', 'xl'];
const FONT_SIZE_LABELS: Record<FontSize, string> = {
  sm: 'Small',
  md: 'Medium',
  lg: 'Large',
  xl: 'X-Large',
};

interface Props {
  /** Number of active translations (from URL param, authoritative) */
  activeTranslationCount: number;
  surahNumber: number;
}

export function ReaderToolbar({ activeTranslationCount, surahNumber }: Props) {
  const {
    fontSize,
    setFontSize,
    showTranslation,
    setShowTranslation,
    showWordByWord,
    setShowWordByWord,
  } = useSettingsStore();

  const [translationOpen, setTranslationOpen] = useState(false);

  const cycleFontSize = (dir: 'up' | 'down') => {
    const idx = FONT_SIZES.indexOf(fontSize);
    const next = dir === 'up'
      ? FONT_SIZES[Math.min(idx + 1, FONT_SIZES.length - 1)]
      : FONT_SIZES[Math.max(idx - 1, 0)];
    setFontSize(next);
  };

  return (
    <>
      <div
        className="flex items-center gap-1 overflow-x-auto border-b border-[var(--border)] bg-[var(--bg)]/95 px-4 py-2 backdrop-blur scrollbar-none"
        role="toolbar"
        aria-label="Reader controls"
      >
        {/* Translation toggle + selector */}
        <div className="flex items-center gap-1 pr-3 border-r border-[var(--border)]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTranslation(!showTranslation)}
            className={cn(
              'gap-2 text-xs',
              showTranslation ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
            )}
            aria-pressed={showTranslation}
            title={showTranslation ? 'Hide translation' : 'Show translation'}
          >
            {showTranslation ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Translation</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTranslationOpen(true)}
            className="relative gap-2 text-xs text-[var(--fg)] hover:text-[var(--accent)]"
            title="Choose translations"
          >
            <Languages className="h-4 w-4" />
            <span className="hidden sm:inline">
              {activeTranslationCount > 0
                ? `${activeTranslationCount} selected`
                : 'Select'}
            </span>
            {activeTranslationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-white">
                {activeTranslationCount}
              </span>
            )}
          </Button>
        </div>

        {/* Tafsir */}
        <div className="flex items-center gap-1 px-3 border-r border-[var(--border)]">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-xs text-[var(--muted)] hover:text-[var(--accent)]"
            title="Tafsir (available per verse)"
          >
            <BookMarked className="h-4 w-4" />
            <span className="hidden sm:inline">Tafsir</span>
          </Button>
        </div>

        {/* Word-by-word */}
        <div className="flex items-center gap-1 px-3 border-r border-[var(--border)]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowWordByWord(!showWordByWord)}
            className={cn(
              'gap-2 text-xs',
              showWordByWord ? 'text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--fg)]'
            )}
            aria-pressed={showWordByWord}
            title={showWordByWord ? 'Hide word by word' : 'Show word by word'}
          >
            <Pilcrow className="h-4 w-4" />
            <span className="hidden sm:inline">Words</span>
          </Button>
        </div>

        {/* Font size controls */}
        <div className="flex items-center gap-1 px-3 border-r border-[var(--border)]">
          <span className="mr-1 hidden text-xs text-[var(--muted)] sm:block">
            {FONT_SIZE_LABELS[fontSize]}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[var(--muted)] hover:text-[var(--fg)]"
            onClick={() => cycleFontSize('down')}
            disabled={fontSize === 'sm'}
            aria-label="Decrease font size"
            title="Decrease font size"
          >
            <AArrowDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[var(--muted)] hover:text-[var(--fg)]"
            onClick={() => cycleFontSize('up')}
            disabled={fontSize === 'xl'}
            aria-label="Increase font size"
            title="Increase font size"
          >
            <AArrowUp className="h-4 w-4" />
          </Button>
        </div>

        {/* Reading layout hint */}
        <div className="flex items-center gap-1 px-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-xs text-[var(--muted)] hover:text-[var(--fg)]"
            title="Reading layout"
          >
            <AlignJustify className="h-4 w-4" />
            <span className="hidden sm:inline">Layout</span>
          </Button>
        </div>
      </div>

      {/* Translation selector sheet */}
      <TranslationSheet
        open={translationOpen}
        onOpenChange={setTranslationOpen}
      />
    </>
  );
}
