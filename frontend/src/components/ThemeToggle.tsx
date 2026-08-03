'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme, resolved } = useTheme();

  const cycle = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <button
      type="button"
      onClick={cycle}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900/50 text-slate-300 transition-colors hover:text-gold-500"
      aria-label={`Theme: ${theme}. Current: ${resolved}. Click to cycle.`}
    >
      {theme === 'light' && <Sun className="h-5 w-5" />}
      {theme === 'dark' && <Moon className="h-5 w-5" />}
      {theme === 'system' && <Monitor className="h-5 w-5" />}
    </button>
  );
}
