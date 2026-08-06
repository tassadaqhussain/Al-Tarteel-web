'use client';

import { useSettingsStore, type ExperienceMode } from '@/stores/settingsStore';
import { Smile, User, Eye, Check } from 'lucide-react';
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
    icon: typeof User;
    color: string;
    bgColor: string;
  }[] = [
    {
      value: 'default',
      label: 'Standard Modern',
      description: 'Elegant UI with default fonts, sleek spacing, and dynamic modes.',
      icon: User,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
    },
    {
      value: 'kids',
      label: 'Playful Kids Mode',
      description: 'Friendly rounded font, warm pastel tones, bubbly cards, and big buttons.',
      icon: Smile,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50 dark:bg-pink-950/30',
    },
    {
      value: 'elderly',
      label: 'Easy Read (Elderly)',
      description: 'Max text sizes, extra-large touch buttons, and warm high-contrast paper view.',
      icon: Eye,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
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
                'flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-150 sm:items-center sm:justify-between sm:px-4',
                active
                  ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                  : 'border-[var(--border)] bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50'
              )}
            >
              <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', opt.bgColor, opt.color)}>
                  <opt.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm font-semibold', active ? 'text-[var(--accent)]' : 'text-slate-800 dark:text-slate-200')}>
                    {opt.label}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-slate-500">{opt.description}</p>
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
                'flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-slate-900/40',
                active ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-semibold' : 'text-slate-700 dark:text-slate-300'
              )}
            >
              <opt.icon className={cn('h-4 w-4 shrink-0', active ? 'text-[var(--accent)]' : 'text-slate-400')} />
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
              'group relative flex flex-col justify-between rounded-2xl border bg-white p-5 text-left transition-all duration-200 shadow-sm hover:shadow-md dark:bg-slate-900',
              active
                ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/10'
                : 'border-[var(--border)] hover:border-slate-300 dark:hover:border-slate-700'
            )}
          >
            <div>
              <div className={cn('mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-colors', opt.bgColor, opt.color)}>
                <opt.icon className="h-6 w-6" />
              </div>
              <h3 className={cn('text-base font-bold transition-colors', active ? 'text-[var(--accent)]' : 'text-slate-900 dark:text-white')}>
                {opt.label}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {opt.description}
              </p>
            </div>
            {active && (
              <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-white">
                <Check className="h-3.5 w-3.5" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
