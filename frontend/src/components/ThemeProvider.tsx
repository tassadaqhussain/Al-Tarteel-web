'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolved: 'light' | 'dark';
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolved, setResolved] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', t);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const stored = (localStorage.getItem('theme') as Theme) || 'system';
    setThemeState(stored);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const dark =
      theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setResolved(dark ? 'dark' : 'light');
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const m = window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => setResolved(theme === 'system' ? 'dark' : theme === 'dark' ? 'dark' : 'light');
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [mounted, theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
