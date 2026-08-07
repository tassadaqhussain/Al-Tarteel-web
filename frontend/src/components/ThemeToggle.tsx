'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';

interface Props {
  /** Icon-only control, or a full menu row with label. */
  variant?: 'icon' | 'labeled';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className }: Props) {
  const { theme, setTheme, resolved } = useTheme();
  const { t } = useT();

  const cycle = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const Icon = theme === 'dark' ? Moon : theme === 'system' ? Monitor : Sun;
  const themeLabel =
    theme === 'dark' ? t('dark') : theme === 'system' ? t('system') : t('light');

  if (variant === 'labeled') {
    return (
      <button
        type="button"
        onClick={cycle}
        className={cn(
          'inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 px-4 text-base font-medium transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]',
          className,
        )}
        aria-label={`${t('theme')}: ${themeLabel}`}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span>
          {t('theme')}: {themeLabel}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={cycle}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--accent)]',
        className,
      )}
      aria-label={`${t('theme')}: ${themeLabel}. ${resolved}`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
