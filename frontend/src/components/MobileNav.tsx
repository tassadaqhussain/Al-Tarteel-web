'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Bookmark,
  ChevronRight,
  Globe,
  GraduationCap,
  Home,
  LayoutGrid,
  MessageSquareHeart,
  Settings,
  Shield,
  Smile,
  X,
} from 'lucide-react';
import { AgeModeSelector } from '@/components/AgeModeSelector';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useSettingsStore, type LastRead } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { getSurahPath } from '@/lib/surah-meta';
import { LANGUAGES } from '@/lib/i18n/languages';
import { loginHref, registerHref } from '@/lib/auth-redirect';
import { useT } from '@/lib/i18n';

export function MobileNav({
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
        className="flex h-full max-h-dvh w-[min(100vw,460px)] max-w-none flex-col overflow-hidden bg-surface p-0 text-ink sm:w-[460px] sm:max-w-[460px]"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4 sm:h-[72px] sm:px-6">
          <SheetTitle className="font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl">QuranPilot</SheetTitle>
          <div className="flex items-center gap-2 sm:gap-3">
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  router.push(loginHref(pathname));
                }}
                className="rounded-full border border-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-white sm:px-4 sm:py-2 sm:text-base"
              >
                {t('signIn')}
              </button>
            ) : (
              <Link
                href="/profile"
                onClick={() => onOpenChange(false)}
                className="max-w-[8rem] truncate rounded-full bg-[var(--accent)]/10 px-3 py-1.5 text-sm font-semibold text-[var(--accent)] sm:px-4 sm:py-2"
              >
                {user?.name || t('account')}
              </Link>
            )}
            <button type="button" onClick={() => onOpenChange(false)} className="rounded-full p-2 text-ink hover:bg-surface-3" aria-label={t('close')}>
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
                className="group flex items-center justify-between rounded-xl border border-line bg-surface-2 px-4 py-3 transition hover:border-[var(--accent)]"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[var(--accent)]">{t('continueReading')}</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-ink">{lastRead.surahName}</p>
                  <p className="text-xs text-ink-muted">{t('ayah')} {lastRead.ayahNumber}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-1 rtl:rotate-180" />
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
              ...(user?.isAdmin ? [{ label: 'Admin', href: '/admin', icon: Shield, id: 'admin' }] : []),
              ...(isAuthenticated
                ? [{ label: t('profile'), href: '/profile', icon: Smile, id: 'profile' }]
                : []),
            ].map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  'flex items-center gap-4 rounded-xl px-3 py-3 text-lg font-semibold transition sm:gap-6 sm:py-4 sm:text-xl',
                  isActive(item.href)
                    ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                    : 'text-ink hover:bg-surface-2'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0 text-ink-faint sm:h-6 sm:w-6" />
                {item.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    router.push(loginHref(pathname));
                  }}
                  className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left text-lg font-semibold text-ink transition hover:bg-surface-2 sm:gap-6 sm:py-4 sm:text-xl"
                >
                  <Smile className="h-5 w-5 shrink-0 text-ink-faint sm:h-6 sm:w-6" />
                  {t('signIn')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    router.push(registerHref(pathname));
                  }}
                  className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left text-lg font-semibold text-ink transition hover:bg-surface-2 sm:gap-6 sm:py-4 sm:text-xl"
                >
                  <Smile className="h-5 w-5 shrink-0 text-ink-faint sm:h-6 sm:w-6" />
                  {t('createAccount')}
                </button>
              </>
            )}
            {isAuthenticated && (
              <button
                type="button"
                onClick={async () => {
                  onOpenChange(false);
                  await logout();
                  router.push('/');
                }}
                className="mt-2 flex w-full items-center gap-4 rounded-xl px-3 py-3 text-lg font-semibold text-danger hover:bg-danger-surface sm:gap-6 sm:py-4 sm:text-xl"
              >
                {t('logOut')}
              </button>
            )}
          </nav>

          <div className="border-t border-line-subtle px-4 py-4 sm:px-7 sm:py-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">{t('chooseProfile')}</p>
            <AgeModeSelector variant="list" onSelect={() => onOpenChange(false)} />
            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={onLanguageOpen}
                className="flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-line px-4 text-base font-medium hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                <Globe className="h-5 w-5 shrink-0" />
                <span>{languageLabel}</span>
              </button>
              <ThemeToggle variant="labeled" />
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-line-subtle px-4 py-3 sm:px-7 sm:py-4">
          <Link
            href="/quran-in-year"
            onClick={() => onOpenChange(false)}
            className="flex w-full items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-center text-sm font-bold text-brand-contrast transition hover:opacity-90 sm:text-base"
          >
            {experienceMode === 'kids' ? t('startAdventure') : t('startJourney')}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
