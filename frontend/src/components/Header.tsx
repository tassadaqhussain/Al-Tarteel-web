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
  MessageSquareHeart,
} from 'lucide-react';
import { AgeModeSelector } from '@/components/AgeModeSelector';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useSettingsStore, type LastRead } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { POPULAR_SURAHS, getSurahMeta, getSurahPath } from '@/lib/surah-meta';
import { SiteLogo } from '@/components/SiteLogo';
import { NavigateQuranDrawer } from '@/components/home/NavigateQuranDrawer';
import { LanguagePanel, LANGUAGES } from '@/components/LanguagePanel';
import { SearchDrawer } from '@/components/SearchDrawer';
import { VoiceSearchButton } from '@/components/VoiceSearchButton';
import { loginHref, registerHref } from '@/lib/auth-redirect';
import { useT } from '@/lib/i18n';
import { CHROME_SHELL } from '@/components/layout/MainContainer';

type SpeechRecognitionCtor = new () => {
  lang: string;
  start: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale } = useT();
  const [open, setOpen] = useState(false);
  const [navigateOpen, setNavigateOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [popularOpen, setPopularOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [ageOpen, setAgeOpen] = useState(false);
  const [query, setQuery] = useState('');
  const lastRead = useSettingsStore((s) => s.lastRead);
  const languageLabel = LANGUAGES.find((l) => l.code === locale)?.label ?? 'English';
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const logout = useAuthStore((s) => s.logout);
  const initials = (user?.name || user?.email || 'U')
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!accountOpen && !ageOpen) return;
    const onClickOutside = () => {
      setAccountOpen(false);
      setAgeOpen(false);
    };
    window.addEventListener('click', onClickOutside);
    return () => window.removeEventListener('click', onClickOutside);
  }, [accountOpen, ageOpen]);

  useEffect(() => {
    setOpen(false);
    setPopularOpen(false);
    setNavigateOpen(false);
    setLanguageOpen(false);
    setSearchOpen(false);
    setAccountOpen(false);
    setAgeOpen(false);
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
      <header className="sticky top-0 z-50 w-full border-b border-emerald-950/10 bg-white/88 shadow-sm shadow-slate-900/[0.03] backdrop-blur-xl supports-[backdrop-filter]:bg-white/82">
        <div className={cn(CHROME_SHELL, 'flex h-14 items-center justify-between gap-3 sm:h-[58px]')}>
          <Link
            href="/"
            className="flex items-center gap-2.5 font-serif text-[1.35rem] font-bold tracking-tight text-slate-950 sm:text-[1.7rem]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-900/10 bg-[#f7f4ea] shadow-sm">
              <SiteLogo size={30} className="h-7 w-7" priority alt="QuranPilot" />
            </span>
            <span className="truncate">QuranPilot</span>
          </Link>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-2.5">
            {!authLoading && !isAuthenticated && (
              <>
                <Link
                  href={loginHref(pathname)}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-emerald-900/30 bg-white px-3 text-sm font-bold text-emerald-900 transition hover:bg-emerald-900 hover:text-white sm:px-5"
                >
                  {t('signIn')}
                </Link>
                <Link
                  href={registerHref(pathname)}
                  className="hidden h-10 items-center justify-center rounded-full bg-emerald-900 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-950/10 transition hover:bg-emerald-950 sm:inline-flex"
                >
                  {t('createAccount')}
                </Link>
              </>
            )}
            {!authLoading && isAuthenticated && (
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAgeOpen(false);
                    setAccountOpen((v) => !v);
                  }}
                  className="flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-2 pr-3 text-sm font-semibold text-slate-800 transition hover:border-[var(--accent)] sm:h-10"
                  aria-label={t('accountMenu')}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
                    {initials}
                  </span>
                  <span className="hidden max-w-[7rem] truncate sm:inline">{user?.name || t('account')}</span>
                </button>
                {accountOpen && (
                  <div
                    className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href="/feedback"
                      className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-50"
                      onClick={() => setAccountOpen(false)}
                    >
                      {t('feedback')}
                    </Link>
                    <Link
                      href="/my-quran"
                      className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-50"
                      onClick={() => setAccountOpen(false)}
                    >
                      {t('myQuran')}
                    </Link>
                    <Link
                      href="/bookmarks"
                      className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-50"
                      onClick={() => setAccountOpen(false)}
                    >
                      {t('bookmarks')}
                    </Link>
                    <Link
                      href="/profile"
                      className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-50"
                      onClick={() => setAccountOpen(false)}
                    >
                      {t('profileAndSettings')}
                    </Link>
                    <button
                      type="button"
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-red-700 hover:bg-red-50"
                      onClick={async () => {
                        setAccountOpen(false);
                        await logout();
                        router.push('/');
                      }}
                    >
                      {t('logOut')}
                    </button>
                  </div>
                )}
              </div>
            )}
            {authLoading && (
              <div className="h-9 w-20 animate-pulse rounded-full bg-slate-100 sm:w-28" aria-hidden />
            )}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAccountOpen(false);
                  setAgeOpen((v) => !v);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
                aria-label={t('selectAgeStyle')}
              >
                <Smile className="h-5 w-5" strokeWidth={1.75} />
              </button>
              {ageOpen && (
                <div
                  className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400">{t('selectAgeStyle')}</div>
                  <AgeModeSelector variant="dropdown" onSelect={() => setAgeOpen(false)} />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setLanguageOpen(true)}
              className="hidden h-10 items-center justify-center gap-1.5 rounded-full px-2 text-slate-700 transition hover:bg-slate-100 sm:inline-flex sm:h-10 sm:min-w-10"
              aria-label={t('language')}
            >
              <Globe className="h-5 w-5" strokeWidth={1.75} />
              <span className="hidden max-w-[5.5rem] truncate text-xs font-semibold lg:inline">{languageLabel}</span>
            </button>
            <VoiceSearchButton />
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 sm:h-10 sm:w-10"
              aria-label={t('search')}
            >
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 sm:h-10 sm:w-10"
              aria-label={t('openMenu')}
            >
              <Menu className="h-6 w-6" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>


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
        pathname={pathname}
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
  pathname,
  lastRead,
  isActive,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onLanguageOpen: () => void;
  pathname: string;
  lastRead: LastRead | null;
  isActive: (href: string) => boolean;
}) {
  const experienceMode = useSettingsStore((s) => s.experienceMode);
  const { t, locale } = useT();
  const languageLabel = LANGUAGES.find((l) => l.code === locale)?.label ?? 'English';
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showClose={false}
        className="flex h-full max-h-dvh w-[min(100vw,460px)] max-w-none flex-col overflow-hidden bg-white p-0 text-slate-800 sm:w-[460px] sm:max-w-[460px]"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4 sm:h-[72px] sm:px-6">
          <SheetTitle className="font-serif text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">QuranPilot</SheetTitle>
          <div className="flex items-center gap-2 sm:gap-3">
            {!isAuthenticated ? (
              <Link
                href={loginHref(pathname)}
                onClick={() => onOpenChange(false)}
                className="rounded-full border border-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-white sm:px-4 sm:py-2 sm:text-base"
              >
                {t('signIn')}
              </Link>
            ) : (
              <Link
                href="/profile"
                onClick={() => onOpenChange(false)}
                className="max-w-[8rem] truncate rounded-full bg-[var(--accent)]/10 px-3 py-1.5 text-sm font-semibold text-[var(--accent)] sm:px-4 sm:py-2"
              >
                {user?.name || t('account')}
              </Link>
            )}
            <button type="button" onClick={() => onOpenChange(false)} className="rounded-full p-2 text-slate-900 hover:bg-slate-100" aria-label={t('close')}>
              <X className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
          </div>
        </div>

        {/* Single scroll region so nav links stay reachable on short phones */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {lastRead && (
            <div className="mx-4 mt-4 sm:mx-7 sm:mt-5">
              <Link
                href={getSurahPath(lastRead.surahNumber)}
                onClick={() => onOpenChange(false)}
                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-[var(--accent)]"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[var(--accent)]">{t('continueReading')}</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{lastRead.surahName}</p>
                  <p className="text-xs text-slate-500">{t('ayah')} {lastRead.ayahNumber}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
              </Link>
            </div>
          )}

          <nav className="px-4 py-4 sm:px-7 sm:py-5" aria-label={t('mainNavigation')}>
            {[
              { label: t('read'), href: '/surahs', icon: Home, id: 'read' },
              { label: t('learn'), href: '/learning-plans', icon: GraduationCap, id: 'learn' },
              { label: t('myQuran'), href: '/my-quran', icon: Bookmark, id: 'my-quran' },
              { label: t('hifz'), href: '/hifz', icon: BookOpen, id: 'hifz' },
              { label: t('bookmarks'), href: '/bookmarks', icon: BookOpen, id: 'bookmarks' },
              { label: t('tajweed'), href: '/tajweed', icon: GraduationCap, id: 'tajweed' },
              { label: t('quranInYear'), href: '/quran-in-year', icon: LayoutGrid, id: 'quran-year' },
              { label: t('settings'), href: '/settings', icon: Settings, id: 'settings' },
              { label: t('feedback'), href: '/feedback', icon: MessageSquareHeart, id: 'feedback' },
              ...(isAuthenticated
                ? [{ label: t('profile'), href: '/profile', icon: Smile, id: 'profile' }]
                : [
                    { label: t('signIn'), href: loginHref(pathname), icon: Smile, id: 'login' },
                    { label: t('createAccount'), href: registerHref(pathname), icon: Smile, id: 'register' },
                  ]),
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
            {isAuthenticated && (
              <button
                type="button"
                onClick={async () => {
                  onOpenChange(false);
                  await logout();
                  router.push('/');
                }}
                className="mt-2 flex w-full items-center gap-4 rounded-xl px-3 py-3 text-lg font-semibold text-red-700 hover:bg-red-50 sm:gap-6 sm:py-4 sm:text-xl"
              >
                {t('logOut')}
              </button>
            )}
          </nav>

          <div className="border-t border-slate-100 px-4 py-4 sm:px-7 sm:py-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{t('chooseProfile')}</p>
            <AgeModeSelector variant="list" onSelect={() => onOpenChange(false)} />
            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={onLanguageOpen}
                className="flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 px-4 text-base font-medium hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                <Globe className="h-5 w-5 shrink-0" />
                <span>{languageLabel}</span>
              </button>
              <ThemeToggle variant="labeled" />
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-100 px-4 py-3 sm:px-7 sm:py-4">
          <Link
            href="/quran-in-year"
            onClick={() => onOpenChange(false)}
            className="flex w-full items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-center text-sm font-bold text-white transition hover:opacity-90 sm:text-base"
          >
            {experienceMode === 'kids' ? t('startAdventure') : t('startJourney')}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
