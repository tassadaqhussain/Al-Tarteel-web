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
        'inline-flex items-center gap-1 rounded-[4px] border border-line bg-surface p-1',
        className,
      )}
      role="group"
      aria-label="Tajweed highlighting"
    >
      <span className="hidden px-2 text-xs font-semibold text-ink-muted sm:inline">Tajweed</span>
      <button
        type="button"
        disabled={disabled}
        aria-pressed={!enabled}
        onClick={() => onChange(false)}
        className={cn(
          'rounded-[3px] px-2.5 py-1.5 text-xs font-semibold transition sm:text-sm',
          !enabled ? 'bg-ink text-surface' : 'text-ink-3 hover:bg-surface-2',
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
          'rounded-[3px] px-2.5 py-1.5 text-xs font-semibold transition sm:text-sm',
          enabled ? 'bg-[var(--accent)] text-brand-contrast' : 'text-ink-3 hover:bg-surface-2',
          disabled && 'opacity-50',
        )}
      >
        On
      </button>
    </div>
  );
}
