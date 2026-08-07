'use client';

import { cn } from '@/lib/utils';

type Props = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  className?: string;
  disabled?: boolean;
};

export function TajweedToggle({ enabled, onChange, className, disabled }: Props) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1',
        className,
      )}
      role="group"
      aria-label="Tajweed highlighting"
    >
      <span className="hidden px-2 text-xs font-semibold text-slate-500 sm:inline">Tajweed</span>
      <button
        type="button"
        disabled={disabled}
        aria-pressed={!enabled}
        onClick={() => onChange(false)}
        className={cn(
          'rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm',
          !enabled ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50',
          disabled && 'opacity-50',
        )}
      >
        Off
      </button>
      <button
        type="button"
        disabled={disabled}
        aria-pressed={enabled}
        onClick={() => onChange(true)}
        className={cn(
          'rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm',
          enabled ? 'bg-[var(--accent)] text-white' : 'text-slate-600 hover:bg-slate-50',
          disabled && 'opacity-50',
        )}
      >
        On
      </button>
    </div>
  );
}
