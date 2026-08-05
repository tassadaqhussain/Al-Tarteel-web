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
} from 'lucide-react';
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
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState('');
  const lastRead = useSettingsStore((s) => s.lastRead);

  useEffect(() => {
    setOpen(false);
    setPopularOpen(false);
    setNavigateOpen(false);
    setLanguageOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          scrolled
            ? 'border-b border-slate-200/80 bg-white/95 py-2.5 shadow-sm backdrop-blur-md'
            : cn(
                'border-b border-transparent py-2.5 backdrop-blur-md sm:py-3',
                isHome ? 'bg-[#f7f7f7]/95' : 'bg-white/95'
              )
        )}
      >
        <div className="flex w-full items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className="truncate font-serif text-lg font-bold tracking-tight text-slate-800 sm:text-xl md:text-2xl"
            >
              QuranPilot
            </Link>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <Link
              href="/settings"
              className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[var(--accent)] sm:inline-flex"
            >
              Sign in
            </Link>
            <button
              type="button"
              onClick={() => setLanguageOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-[var(--accent)]"
              aria-label="Language"
            >
              <Globe className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-[var(--accent)]"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-[var(--accent)]"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
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
                  placeholder="Search the Quran..."
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
                Navigate Quran
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPopularOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[var(--accent)]/50 hover:text-[var(--accent)] sm:px-5 sm:py-2.5"
                >
                  <TrendingUp className="h-4 w-4 text-[var(--accent)]" />
                  Popular
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
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full max-w-none flex-col bg-white p-0 text-slate-800 [&>button]:hidden sm:w-[460px] sm:max-w-[460px]">
        <div className="flex h-[88px] items-center justify-between border-b border-slate-200 px-6">
          <SheetTitle className="font-serif text-3xl font-bold tracking-tight text-slate-900">QuranPilot</SheetTitle>
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              onClick={() => onOpenChange(false)}
              className="rounded-full border-2 border-[var(--accent)] px-4 py-2 text-base font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-white"
            >
              Sign in
            </Link>
            <button type="button" onClick={() => onOpenChange(false)} className="rounded-full p-2 text-slate-900 hover:bg-slate-100" aria-label="Close menu">
              <X className="h-7 w-7" />
            </button>
          </div>
        </div>

        {lastRead && (
          <div className="mx-7 mt-5">
            <Link
              href={`/surah/${lastRead.surahNumber}`}
              onClick={() => onOpenChange(false)}
              className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-[var(--accent)]"
            >
              <div>
                <p className="text-xs font-medium text-[var(--accent)]">Continue Reading</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-800">{lastRead.surahName}</p>
                <p className="text-xs text-slate-500">Ayah {lastRead.ayahNumber}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}

        <nav className="flex-1 overflow-auto px-7 py-5" aria-label="Main navigation">
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
                'flex items-center gap-6 rounded-xl px-3 py-4 text-xl font-semibold transition',
                isActive(item.href)
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'text-slate-800 hover:bg-slate-50'
              )}
            >
              <item.icon className="h-6 w-6 text-slate-300" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-100 px-7 py-5">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onLanguageOpen}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 text-base font-medium hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <Globe className="h-5 w-5" /> English
            </button>
            <div className="flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 pr-4 text-base font-medium">
              <ThemeToggle />
              Change Theme
            </div>
          </div>
          <Link
            href="/quran-in-year"
            onClick={() => onOpenChange(false)}
            className="mt-4 flex w-full items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-base font-bold text-white transition hover:opacity-90"
          >
            ✦ Start Your Quran Journey
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
