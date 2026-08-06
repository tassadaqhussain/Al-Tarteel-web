'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useSettingsStore, type ExperienceMode } from '@/stores/settingsStore';
import { getSurahNumberFromSlug } from '@/lib/surah-meta';

type Theme = 'light' | 'dark' | 'system';

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolved: 'light' | 'dark';
} | null>(null);

/** Kids/elderly chrome stays on browse pages; reader uses calm default styling. */
function experienceForPath(pathname: string, preferred: ExperienceMode): ExperienceMode {
  if (pathname.startsWith('/surah/') || pathname.startsWith('/juz/')) return 'default';
  const slug = pathname.replace(/^\//, '').split('/')[0] ?? '';
  if (slug && !slug.includes('.') && getSurahNumberFromSlug(slug)) return 'default';
  return preferred;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const uiLocale = useSettingsStore((state) => state.uiLocale);
  const experienceMode = useSettingsStore((state) => state.experienceMode);
  const readerViewMode = useSettingsStore((state) => state.readerViewMode);
  const [theme, setThemeState] = useState<Theme>('light');
  const [resolved, setResolved] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  const activeExperience = useMemo(
    () => experienceForPath(pathname, experienceMode),
    [pathname, experienceMode],
  );

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', t);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const stored = (localStorage.getItem('theme') as Theme) || 'light';
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

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.lang = uiLocale;
    root.dir = ['ar', 'fa', 'ur'].includes(uiLocale) ? 'rtl' : 'ltr';
  }, [mounted, uiLocale]);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove('experience-default', 'experience-kids', 'experience-elderly');
    root.classList.add(`experience-${activeExperience}`);
  }, [mounted, activeExperience]);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove('view-mode-verse', 'view-mode-arabic', 'view-mode-translation');
    root.classList.add(`view-mode-${readerViewMode}`);
  }, [mounted, readerViewMode]);

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
