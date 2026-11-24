'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  ChevronRight,
  Globe,
  Menu,
  Search,
  SlidersHorizontal,
  TrendingUp,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { POPULAR_SURAHS, getSurahMeta, getSurahPath } from '@/lib/surah-meta';
import { SiteLogo } from '@/components/SiteLogo';
import { LANGUAGES } from '@/lib/i18n/languages';
import { VoiceSearchButton } from '@/components/VoiceSearchButton';
import { loginHref } from '@/lib/auth-redirect';
import { useT } from '@/lib/i18n';
import { CHROME_SHELL } from '@/components/layout/MainContainer';
import { isQuranReaderPath } from '@/lib/reader-path';

const AgeModeSelector = dynamic(
  () => import('@/components/AgeModeSelector').then((m) => m.AgeModeSelector),
  { ssr: false },
);
const ThemeToggle = dynamic(
  () => import('@/components/ThemeToggle').then((m) => m.ThemeToggle),
  { ssr: false },
);
const NavigateQuranDrawer = dynamic(
  () => import('@/components/home/NavigateQuranDrawer').then((m) => m.NavigateQuranDrawer),
  { ssr: false },
);
const LanguagePanel = dynamic(
  () => import('@/components/LanguagePanel').then((m) => m.LanguagePanel),
  { ssr: false },
);
const SearchDrawer = dynamic(
  () => import('@/components/SearchDrawer').then((m) => m.SearchDrawer),
  { ssr: false },
);
const MobileNav = dynamic(
  () => import('@/components/MobileNav').then((m) => m.MobileNav),
  { ssr: false },
);

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
  const [mountedDrawers, setMountedDrawers] = useState({
    nav: false,
    navigate: false,
    language: false,
    search: false,
  });
  useEffect(() => {
    if (open || navigateOpen || languageOpen || searchOpen) {
      setMountedDrawers((prev) => ({
        nav: prev.nav || open,
        navigate: prev.navigate || navigateOpen,
        language: prev.language || languageOpen,
        search: prev.search || searchOpen,
      }));
    }
  }, [open, navigateOpen, languageOpen, searchOpen]);
  const [popularOpen, setPopularOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [ageOpen, setAgeOpen] = useState(false);
  const displayButtonRef = useRef<HTMLButtonElement | null>(null);
  const displayMenuRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState('');
  const lastRead = useSettingsStore((s) => s.lastRead);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const setFontSize = useSettingsStore((s) => s.setFontSize);
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
    if (!ageOpen) return;
    const menu = displayMenuRef.current;
    const focusables = menu
      ? Array.from(
          menu.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        )
      : [];
    focusables[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setAgeOpen(false);
        displayButtonRef.current?.focus();
        return;
      }
      if (e.key === 'Tab' && focusables.length > 0) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [ageOpen]);

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
      <header className={cn(
        'w-full border-b border-line bg-[var(--header-bg)] shadow-sm shadow-black/[0.03] backdrop-blur-xl',
        'dark:shadow-none',
        // On reader routes the surah/juz sub-bar is sticky (z-40); keep site header
        // in normal flow with z-50 so its dropdowns layer above the sub-bar.
        pathname && isQuranReaderPath(pathname) ? 'relative z-50' : 'sticky top-0 z-50'
      )}>
        <div className={cn(CHROME_SHELL, 'flex h-16 items-center justify-between gap-3')}>
          <div className="flex min-w-0 items-center gap-5 xl:gap-7">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2.5 font-serif text-[1.25rem] font-bold tracking-tight text-ink sm:text-[1.5rem]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-900/15 bg-brand-gold/10 shadow-sm">
                <SiteLogo size={30} className="h-7 w-7" priority alt="QuranPilot" />
              </span>
              <span className="truncate">QuranPilot</span>
            </Link>

            <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
              {[
                { href: '/surahs', label: t('navSurahs') },
                { href: '/juz', label: t('tabJuz') },
                { href: '/hifz', label: t('hifz') },
                { href: '/learning-plans', label: t('learn') },
                { href: '/articles', label: t('navArticles') },
              ].map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-sm font-semibold transition',
                      active
                        ? 'bg-[var(--accent)]/12 text-[var(--accent)]'
                        : 'text-ink-2 hover:bg-surface-3 hover:text-ink'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <form
            onSubmit={onSearch}
            className="hidden h-10 max-w-xs flex-1 items-center gap-1.5 rounded-full border border-line bg-surface-2 pl-3 pr-1.5 transition focus-within:border-[var(--accent)] focus-within:bg-surface md:flex"
            role="search"
          >
            <Search className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search')}
              aria-label={t('search')}
              className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
            />
            <VoiceSearchButton className="h-8 w-8 shrink-0" />
          </form>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {/* Mobile search icon */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-ink-2 transition hover:bg-surface-3 md:hidden"
              aria-label={t('search')}
            >
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </button>

            {/* Unified Display dropdown: Theme + Age/Look Style + Arabic font size */}
            <div className="relative">
              <button
                ref={displayButtonRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAccountOpen(false);
                  setAgeOpen((v) => !v);
                }}
                className="flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-2.5 text-ink-2 transition hover:bg-surface-3 sm:h-10 sm:border sm:border-line sm:bg-surface sm:px-3"
                aria-label="Display settings"
                aria-expanded={ageOpen}
                aria-haspopup="dialog"
              >
                <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
                <span className="hidden text-xs font-semibold sm:inline">{t('actDisplay')}</span>
              </button>
              {ageOpen && (
                <div
                  ref={displayMenuRef}
                  role="dialog"
                  aria-label="Display settings"
                  className="end-0 absolute z-50 mt-2 w-72 rounded-2xl border border-line bg-surface p-3.5 shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-3">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                      {t('theme')}
                    </p>
                    <ThemeToggle variant="labeled" />
                  </div>
                  <div className="mb-3 border-t border-line-subtle pt-3">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                      {t('selectAgeStyle')}
                    </p>
                    <AgeModeSelector variant="dropdown" onSelect={() => setAgeOpen(false)} />
                  </div>
                  <div className="border-t border-line-subtle pt-3">
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                      Arabic font size
                    </p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setFontSize(sz)}
                          className={cn(
                            'rounded-lg border py-1.5 text-xs font-semibold uppercase transition',
                            fontSize === sz
                              ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                              : 'border-line text-ink-2 hover:bg-surface-2',
                          )}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setLanguageOpen(true)}
              className="hidden h-10 items-center justify-center gap-1.5 rounded-full px-2.5 text-ink-2 transition hover:bg-surface-3 sm:inline-flex"
              aria-label={t('language')}
            >
              <Globe className="h-4 w-4" strokeWidth={1.75} />
              <span className="hidden max-w-[5.5rem] truncate text-xs font-semibold xl:inline">{languageLabel}</span>
            </button>

            {!authLoading && !isAuthenticated && (
              <button
                type="button"
                onClick={() => router.push(loginHref(pathname))}
                className="hidden h-10 items-center justify-center rounded-full border border-emerald-900/30 bg-surface px-4 text-sm font-bold text-brand transition hover:bg-emerald-900 hover:text-white sm:inline-flex"
              >
                {t('signIn')}
              </button>
            )}
            {!authLoading && isAuthenticated && (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAgeOpen(false);
                    setAccountOpen((v) => !v);
                  }}
                  className="flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-1.5 pr-2.5 text-sm font-semibold text-ink transition hover:border-[var(--accent)]"
                  aria-label={t('accountMenu')}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-brand-contrast">
                    {initials}
                  </span>
                  <span className="hidden max-w-[6rem] truncate xl:inline">{user?.name || t('account')}</span>
                </button>
                {accountOpen && (
                  <div
                    className="end-0 absolute z-50 mt-2 w-56 rounded-2xl border border-line bg-surface p-2 shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href="/feedback"
                      className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-surface-2"
                      onClick={() => setAccountOpen(false)}
                    >
                      {t('feedback')}
                    </Link>
                    <Link
                      href="/my-quran"
                      className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-surface-2"
                      onClick={() => setAccountOpen(false)}
                    >
                      {t('myQuran')}
                    </Link>
                    <Link
                      href="/bookmarks"
                      className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-surface-2"
                      onClick={() => setAccountOpen(false)}
                    >
                      {t('bookmarks')}
                    </Link>
                    <Link
                      href="/profile"
                      className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-surface-2"
                      onClick={() => setAccountOpen(false)}
                    >
                      {t('profileAndSettings')}
                    </Link>
                    {user?.isAdmin && (
                      <Link
                        href="/admin"
                        className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-surface-2"
                        onClick={() => setAccountOpen(false)}
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      type="button"
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-danger hover:bg-danger-surface"
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
              <div className="hidden h-9 w-20 animate-pulse rounded-full bg-surface-3 sm:block" aria-hidden />
            )}

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-2 transition hover:bg-surface-3 lg:hidden"
              aria-label={t('openMenu')}
            >
              <Menu className="h-6 w-6" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>


      {mountedDrawers.navigate && (
        <NavigateQuranDrawer open={navigateOpen} onOpenChange={setNavigateOpen} />
      )}
      {mountedDrawers.language && (
        <LanguagePanel open={languageOpen} onOpenChange={setLanguageOpen} />
      )}
      {mountedDrawers.search && (
        <SearchDrawer open={searchOpen} onOpenChange={setSearchOpen} />
      )}
      {mountedDrawers.nav && (
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
      )}
    </>
  );
}

