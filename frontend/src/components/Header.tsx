'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Book,
  Search,
  User,
  Menu,
  X,
  BookOpen,
  Bookmark,
  LayoutGrid,
  ChevronRight,
  Headphones,
  Settings,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Home',      href: '/',          icon: BookOpen,   id: 'home' },
  { label: 'Surahs',   href: '/surahs',    icon: LayoutGrid, id: 'surahs' },
  { label: 'Juz',      href: '/juz',       icon: Book,       id: 'juz' },
  { label: 'Search',   href: '/search',    icon: Search,     id: 'search' },
  { label: 'Bookmarks',href: '/bookmarks', icon: Bookmark,   id: 'bookmarks' },
  { label: 'Audio',    href: '/reciters',  icon: Headphones, id: 'reciters' },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastRead = useSettingsStore((s) => s.lastRead);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 z-50 w-full transition-all duration-300',
          scrolled
            ? 'border-b border-emerald-900/30 bg-emerald-950/95 py-3 shadow-lg shadow-black/20 backdrop-blur-md'
            : 'border-b border-emerald-900/20 bg-emerald-950/80 py-4 backdrop-blur-md'
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500 text-emerald-950 ring-4 ring-gold-500/20 transition-transform group-hover:scale-105">
              <Book className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white transition-colors group-hover:text-gold-500">
              AL-TARTEEL
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'relative rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'text-gold-500'
                    : 'text-slate-300 hover:bg-emerald-900/40 hover:text-white'
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold-500" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/search"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-emerald-900/50 hover:text-gold-500"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Link>
            <Link
              href="/settings"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-emerald-900/50 hover:text-gold-500"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </Link>
            <div className="h-4 w-px bg-emerald-900/50" />
            <ThemeToggle />
            <Link
              href="/profile"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-900/50 text-slate-300 transition-colors hover:text-gold-500"
              aria-label="Profile"
            >
              <User className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/search"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 hover:bg-emerald-900/50"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Link>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-900/50 text-slate-300 hover:text-gold-500"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="flex w-[300px] flex-col bg-emerald-950 p-0 sm:w-[340px]">
          <SheetHeader className="border-b border-emerald-900/30 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500 text-emerald-950">
                  <Book className="h-5 w-5" />
                </div>
                <SheetTitle className="text-lg font-bold text-white">AL-TARTEEL</SheetTitle>
              </div>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>

          {/* Continue Reading card */}
          {lastRead && (
            <div className="mx-4 mt-4">
              <Link
                href={`/surah/${lastRead.surahNumber}`}
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between rounded-xl border border-emerald-900/40 bg-emerald-900/20 px-4 py-3 transition-all hover:border-gold-500/40 hover:bg-emerald-900/30"
              >
                <div>
                  <p className="text-xs font-medium text-gold-500">Continue Reading</p>
                  <p className="mt-0.5 text-sm font-semibold text-white">{lastRead.surahName}</p>
                  <p className="text-xs text-slate-500">Ayah {lastRead.ayahNumber}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}

          {/* Nav links */}
          <nav className="flex-1 overflow-auto px-3 py-4" aria-label="Mobile navigation">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Navigation
            </p>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all',
                  isActive(item.href)
                    ? 'bg-emerald-900/50 text-gold-500'
                    : 'text-slate-300 hover:bg-emerald-900/30 hover:text-white'
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                    isActive(item.href)
                      ? 'bg-gold-500/20 text-gold-500'
                      : 'bg-emerald-900/50 text-slate-400 group-hover:text-white'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </div>
                {item.label}
                {isActive(item.href) && (
                  <ChevronRight className="ml-auto h-3 w-3 text-gold-500" />
                )}
              </Link>
            ))}

            <Separator className="my-4 bg-emerald-900/30" />

            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Account
            </p>
            {[
              { label: 'Settings', href: '/settings', icon: Settings },
              { label: 'Profile',  href: '/profile',  icon: User },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition-all hover:bg-emerald-900/30 hover:text-white"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-900/50 text-slate-400 group-hover:text-white">
                  <item.icon className="h-4 w-4" />
                </div>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Sheet footer */}
          <div className="border-t border-emerald-900/30 px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Appearance</p>
              <ThemeToggle />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
