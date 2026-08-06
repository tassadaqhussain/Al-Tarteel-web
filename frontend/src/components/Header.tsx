'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import {
  BookOpen,
  Bookmark,
  GraduationCap,
  Globe,
  Home,
  LayoutGrid,
  List,
  Menu,
  Mic,
  Search,
  Settings,
  TrendingUp,
  X,
  ChevronRight,
  Smile,
} from 'lucide-react';
import { AgeModeSelector } from '@/components/AgeModeSelector';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useSettingsStore, type LastRead } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';
import { POPULAR_SURAHS, getSurahMeta } from '@/lib/surah-meta';
import { NavigateQuranDrawer } from '@/components/home/NavigateQuranDrawer';
import { LanguagePanel } from '@/components/LanguagePanel';
import { SearchDrawer } from '@/components/SearchDrawer';

type SpeechRecognitionCtor = new () => {
  lang: string;
  start: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';
  const [open, setOpen] = useState(false);
  const [navigateOpen, setNavigateOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [popularOpen, setPopularOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const lastRead = useSettingsStore((s) => s.lastRead);
  const experienceMode = useSettingsStore((s) => s.experienceMode);

  useEffect(() => {
    if (!profileOpen) return;
    const onClickOutside = () => setProfileOpen(false);
    window.addEventListener('click', onClickOutside);
    return () => window.removeEventListener('click', onClickOutside);
  }, [profileOpen]);

  useEffect(() => {
    setOpen(false);
    setPopularOpen(false);
    setNavigateOpen(false);
    setLanguageOpen(false);
    setSearchOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setNavigateOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      router.push('/search');
      return;
    }
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const startVoiceSearch = () => {
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      router.push('/search');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const spoken = event.results[0]?.[0]?.transcript?.trim();
      if (spoken) {
        setQuery(spoken);
        router.push(`/search?q=${encodeURIComponent(spoken)}`);
      }
    };
    recognition.start();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center justify-between gap-3 px-4 sm:h-[57px] sm:px-6">
          <Link
            href="/"
            className="truncate font-serif text-[1.35rem] font-bold tracking-tight text-slate-900 sm:text-2xl"
          >
            QuranPilot
          </Link>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-2.5">
            <Link
              href="/settings"
              className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--accent)] px-2.5 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-white sm:px-4"
            >
              Sign in
            </Link>
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setProfileOpen((v) => !v); }}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
                aria-label="Look Profile Selector"
              >
                <Smile className="h-5 w-5" strokeWidth={1.75} />
              </button>
              {profileOpen && (
                <div 
                  className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400">Select Age/Look Style</div>
                  <AgeModeSelector variant="dropdown" onSelect={() => setProfileOpen(false)} />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setLanguageOpen(true)}
              className="hidden h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 sm:flex"
              aria-label="Language"
            >
              <Globe className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 sm:h-10 sm:w-10"
              aria-label="Search"
            >
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 sm:h-10 sm:w-10"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {isHome && (
        <section className="relative w-full overflow-hidden bg-[#f7f7f7] px-3 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-4 md:px-6">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(15,23,42,0.06) 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="relative mx-auto w-full max-w-3xl">
            <form onSubmit={onSearch} className="group relative">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition focus-within:border-[var(--accent)]/50 focus-within:ring-4 focus-within:ring-[var(--accent)]/10 sm:gap-3 sm:px-5 sm:py-3.5">
                <Search className="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={experienceMode === 'kids' ? "Search for a surah or verse! 🌟🔍" : "Search the Quran..."}
                  className="w-full min-w-0 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none sm:text-base"
                  aria-label="Search the Quran"
                />
                <button
                  type="button"
                  onClick={startVoiceSearch}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-[var(--accent)]"
                  aria-label="Voice search"
                >
                  <Mic className="h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:mt-4 sm:gap-3">
              <button
                type="button"
                onClick={() => setNavigateOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent)]/90 sm:px-5 sm:py-2.5"
              >
                <List className="h-4 w-4" />
                {experienceMode === 'kids' ? 'Choose a Surah! 🚀' : 'Navigate Quran'}
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPopularOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[var(--accent)]/50 hover:text-[var(--accent)] sm:px-5 sm:py-2.5"
                >
                  <TrendingUp className="h-4 w-4 text-[var(--accent)]" />
                  {experienceMode === 'kids' ? 'Super Popular! 🔥' : 'Popular'}
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-sky-500" />
                </button>
                {popularOpen && (
                  <div className="absolute left-1/2 z-40 mt-2 w-[min(16rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                    {POPULAR_SURAHS.map((n) => {
                      const meta = getSurahMeta(n);
                      return (
                        <Link
                          key={n}
                          href={`/surah/${n}`}
                          className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                          onClick={() => setPopularOpen(false)}
                        >
                          <span>
                            {n}. {meta.nameSimple}
                          </span>
                          <span className="font-arabic text-base text-slate-500" dir="rtl">
                            {meta.nameArabic}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <NavigateQuranDrawer open={navigateOpen} onOpenChange={setNavigateOpen} />
      <LanguagePanel open={languageOpen} onOpenChange={setLanguageOpen} />
      <SearchDrawer open={searchOpen} onOpenChange={setSearchOpen} />
      <MobileNav
        open={open}
        onOpenChange={setOpen}
        onLanguageOpen={() => {
          setOpen(false);
          window.setTimeout(() => setLanguageOpen(true), 150);
        }}
        lastRead={lastRead}
        isActive={isActive}
      />
    </>
  );
}

function MobileNav({
  open,
  onOpenChange,
  onLanguageOpen,
  lastRead,
  isActive,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onLanguageOpen: () => void;
  lastRead: LastRead | null;
  isActive: (href: string) => boolean;
}) {
  const experienceMode = useSettingsStore((s) => s.experienceMode);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" showClose={false} className="flex w-[min(100vw,460px)] max-w-none flex-col bg-white p-0 text-slate-800 sm:w-[460px] sm:max-w-[460px]">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4 sm:h-[88px] sm:px-6">
          <SheetTitle className="font-serif text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">QuranPilot</SheetTitle>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/settings"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-white sm:px-4 sm:py-2 sm:text-base"
            >
              Sign in
            </Link>
            <button type="button" onClick={() => onOpenChange(false)} className="rounded-full p-2 text-slate-900 hover:bg-slate-100" aria-label="Close menu">
              <X className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
          </div>
        </div>

        {lastRead && (
          <div className="mx-4 mt-4 sm:mx-7 sm:mt-5">
            <Link
              href={`/surah/${lastRead.surahNumber}`}
              onClick={() => onOpenChange(false)}
              className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-[var(--accent)]"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-[var(--accent)]">Continue Reading</p>
                <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{lastRead.surahName}</p>
                <p className="text-xs text-slate-500">Ayah {lastRead.ayahNumber}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}

        <nav className="flex-1 overflow-auto px-4 py-4 sm:px-7 sm:py-5" aria-label="Main navigation">
          {[
            { label: 'Read', href: '/surahs', icon: Home, id: 'read' },
            { label: 'Learn', href: '/learning-plans', icon: GraduationCap, id: 'learn' },
            { label: 'My Quran', href: '/my-quran', icon: Bookmark, id: 'my-quran' },
            { label: 'Bookmarks', href: '/bookmarks', icon: BookOpen, id: 'bookmarks' },
            { label: 'Quran in a Year', href: '/quran-in-year', icon: LayoutGrid, id: 'quran-year' },
            { label: 'Settings', href: '/settings', icon: Settings, id: 'settings' },
          ].map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => onOpenChange(false)}
              className={cn(
                'flex items-center gap-4 rounded-xl px-3 py-3 text-lg font-semibold transition sm:gap-6 sm:py-4 sm:text-xl',
                isActive(item.href)
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'text-slate-800 hover:bg-slate-50'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0 text-slate-300 sm:h-6 sm:w-6" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="shrink-0 border-t border-slate-100 px-4 py-4 sm:px-7 sm:py-5">
          <div className="mb-4 sm:mb-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Choose Profile Style</p>
            <AgeModeSelector variant="list" onSelect={() => onOpenChange(false)} />
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={onLanguageOpen}
              className="flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 px-4 text-base font-medium hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <Globe className="h-5 w-5 shrink-0" />
              <span>English</span>
            </button>
            <ThemeToggle variant="labeled" />
          </div>
          <Link
            href="/quran-in-year"
            onClick={() => onOpenChange(false)}
            className="mt-4 flex w-full items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-center text-sm font-bold text-white transition hover:opacity-90 sm:text-base"
          >
            {experienceMode === 'kids' ? '✦ Start Your Quran Adventure! 🚀' : '✦ Start Your Quran Journey'}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
