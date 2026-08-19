'use client';

import { useSettingsStore, type ExperienceMode } from '@/stores/settingsStore';
import { Monitor, Compass, Eye, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  variant?: 'list' | 'dropdown' | 'grid';
  onSelect?: () => void;
}

export function AgeModeSelector({ className, variant = 'grid', onSelect }: Props) {
  const experienceMode = useSettingsStore((state) => state.experienceMode);
  const setExperienceMode = useSettingsStore((state) => state.setExperienceMode);

  const options: {
    value: ExperienceMode;
    label: string;
    description: string;
    icon: typeof Monitor;
    color: string;
    bgColor: string;
  }[] = [
    {
      value: 'default',
      label: 'Standard',
      description: 'Balanced typography, focused spacing, and a calm reading experience.',
      icon: Monitor,
      color: 'text-brand',
      bgColor: 'bg-brand/10',
    },
    {
      value: 'kids',
      label: 'Kids Explorer',
      description: 'Friendly type, lively accents, clear labels, and comfortable touch targets.',
      icon: Compass,
      color: 'text-warning',
      bgColor: 'bg-warning-surface',
    },
    {
      value: 'elderly',
      label: 'Easy Read',
      description: 'Larger text, generous controls, and a warm high-contrast reading view.',
      icon: Eye,
      color: 'text-brand',
      bgColor: 'bg-brand/10',
    },
  ];

  if (variant === 'list') {
    return (
      <div className={cn('space-y-2', className)}>
        {options.map((opt) => {
          const active = experienceMode === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setExperienceMode(opt.value);
                onSelect?.();
              }}
              className={cn(
                'flex w-full items-start gap-3 rounded border px-3 py-3 text-left transition-all duration-150 sm:items-center sm:justify-between sm:px-4',
                active
                  ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                  : 'border-[var(--border)] bg-transparent hover:bg-surface-2'
              )}
            >
              <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded', opt.bgColor, opt.color)}>
                  <opt.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm font-semibold', active ? 'text-[var(--accent)]' : 'text-ink')}>
                    {opt.label}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-ink-muted">{opt.description}</p>
                </div>
              </div>
              {active && <Check className="mt-1 h-5 w-5 shrink-0 text-[var(--accent)] sm:mt-0" />}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={cn('flex flex-col gap-1', className)}>
        {options.map((opt) => {
          const active = experienceMode === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setExperienceMode(opt.value);
                onSelect?.();
              }}
              className={cn(
                'flex items-center gap-3 rounded px-3 py-2 text-left text-sm transition hover:bg-surface-2',
                active ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-semibold' : 'text-ink-2'
              )}
            >
              <opt.icon className={cn('h-4 w-4 shrink-0', active ? 'text-[var(--accent)]' : 'text-ink-faint')} />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{opt.label}</p>
              </div>
              {active && <Check className="h-4 w-4 shrink-0" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4 sm:grid-cols-3', className)}>
      {options.map((opt) => {
        const active = experienceMode === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              setExperienceMode(opt.value);
              onSelect?.();
            }}
            className={cn(
              'group relative flex flex-col justify-between rounded border bg-surface p-5 text-left transition-all duration-200 shadow-sm hover:shadow-md',
              active
                ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/10'
                : 'border-[var(--border)] hover:border-line-strong'
            )}
          >
            <div>
              <div className={cn('mb-4 flex h-11 w-11 items-center justify-center rounded transition-colors', opt.bgColor, opt.color)}>
                <opt.icon className="h-6 w-6" />
              </div>
              <h3 className={cn('text-base font-bold transition-colors', active ? 'text-[var(--accent)]' : 'text-ink')}>
                {opt.label}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                {opt.description}
              </p>
            </div>
            {active && (
              <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-brand-contrast">
                <Check className="h-3.5 w-3.5" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
