'use client';

import React from 'react';
import { Mic } from 'lucide-react';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { cn } from '@/lib/utils';

interface VoiceSearchButtonProps {
  className?: string;
  variant?: 'icon' | 'pill' | 'fab';
  label?: string;
}

export function VoiceSearchButton({ className, variant = 'icon', label }: VoiceSearchButtonProps) {
  const { isListening, startListening } = useVoiceSearch();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    startListening();
  };

  if (variant === 'fab') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'fixed bottom-24 left-4 z-[55] flex h-13 items-center gap-2 rounded-full bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-xl shadow-emerald-950/20 transition hover:scale-[1.03] hover:bg-emerald-800 active:scale-95 sm:bottom-28 sm:left-6',
          isListening && 'ring-4 ring-emerald-400 ring-offset-2 animate-pulse',
          className
        )}
        aria-label="Voice Search"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
          <Mic className="h-4 w-4" />
        </span>
        <span className="hidden sm:inline">{label || 'Voice'}</span>
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-2 shadow-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)]',
          isListening && 'border-emerald-600 bg-brand/10 text-brand animate-pulse',
          className
        )}
        aria-label="Voice Search"
      >
        <Mic className="h-4 w-4 text-[var(--accent)]" />
        <span>{label || 'Voice Search'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-full text-ink-2 transition hover:bg-surface-3 sm:h-10 sm:w-10',
        isListening && 'bg-brand/15 text-brand ring-2 ring-emerald-500 animate-pulse',
        className
      )}
      aria-label="Global Voice Search"
      title="Voice Search & Commands"
    >
      <Mic className="h-5 w-5" strokeWidth={1.75} />
      {isListening && (
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
      )}
    </button>
  );
}
