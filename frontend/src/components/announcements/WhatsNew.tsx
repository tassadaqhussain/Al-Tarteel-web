'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Bell, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useT } from '@/lib/i18n';
import type { Announcement, AnnouncementText } from '@/lib/api';
import type { UiLocale } from '@/stores/settingsStore';
import { useAnnouncementsStore } from '@/stores/announcementsStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

/** Pages where a popup would interrupt a focused task. */
const NO_POPUP_PREFIXES = ['/admin', '/login', '/register', '/forgot-password', '/reset-password', '/unsubscribe'];
const POPUP_DELAY_MS = 1200;

function pick(text: AnnouncementText, locale: UiLocale) {
  const value = text[locale];
  return value ? { text: value, lang: locale } : { text: text.en, lang: 'en' };
}

function formatDate(iso: string, locale: UiLocale) {
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

/**
 * "What's new" for signed-in users: a bell with an unread count, and a
 * one-time popup for the newest unread announcement. Renders nothing for
 * guests.
 */
export function WhatsNew() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const load = useAnnouncementsStore((s) => s.load);
  const reset = useAnnouncementsStore((s) => s.reset);

  useEffect(() => {
    if (isAuthenticated) void load();
    else reset();
  }, [isAuthenticated, userId, load, reset]);

  if (!isAuthenticated) return null;
  return (
    <>
      <WhatsNewBell />
      <WhatsNewPopup />
    </>
  );
}

function WhatsNewBell() {
  const { t, locale, isRtl } = useT();
  const items = useAnnouncementsStore((s) => s.items);
  const unread = useAnnouncementsStore((s) => s.unread);
  const markAllRead = useAnnouncementsStore((s) => s.markAllRead);
  const [open, setOpen] = useState(false);
  // Keep "New" labels visible for this viewing even after the badge clears.
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open) {
      setFreshIds(new Set(items.filter((a) => !a.read).map((a) => a.id)));
      void markAllRead();
    }
    setOpen((v) => !v);
  };

  const label = unread > 0 ? `${t('whatsNew')} (${unread})` : t('whatsNew');

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-2 transition hover:bg-surface-2 sm:h-10 sm:w-10"
      >
        <Bell className="h-5 w-5" aria-hidden />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute -top-0.5 end-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white ring-2 ring-surface"
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={t('whatsNew')}
          className={cn(
            'absolute z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-line bg-surface p-2 shadow-xl',
            isRtl ? 'left-0' : 'right-0',
          )}
        >
          <p className="px-3 pb-1 pt-2 text-sm font-bold text-ink">{t('whatsNew')}</p>
          {items.length === 0 ? (
            <p className="px-3 py-4 text-sm text-ink-muted">{t('whatsNewEmpty')}</p>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto">
              {items.map((a) => (
                <AnnouncementRow
                  key={a.id}
                  announcement={a}
                  locale={locale}
                  fresh={freshIds.has(a.id)}
                  newLabel={t('newLabel')}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function AnnouncementRow({
  announcement: a,
  locale,
  fresh,
  newLabel,
  onNavigate,
}: {
  announcement: Announcement;
  locale: UiLocale;
  fresh: boolean;
  newLabel: string;
  onNavigate: () => void;
}) {
  const title = pick(a.title, locale);
  const body = pick(a.body, locale);
  const cta = pick(a.ctaLabel, locale);
  return (
    <li className="rounded-xl px-3 py-3 hover:bg-surface-2">
      <div className="flex items-center gap-2">
        {fresh && (
          <span className="rounded-full bg-[var(--ayah-highlight)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--accent)]">
            {newLabel}
          </span>
        )}
        <span className="text-[11px] text-ink-faint">{formatDate(a.publishedAt, locale)}</span>
      </div>
      <p lang={title.lang} dir="auto" className="mt-1 text-sm font-semibold text-ink">{title.text}</p>
      <p lang={body.lang} dir="auto" className="mt-0.5 text-sm leading-relaxed text-ink-3">{body.text}</p>
      <Link
        href={a.ctaPath}
        onClick={onNavigate}
        lang={cta.lang}
        className="mt-2 inline-block text-sm font-semibold text-[var(--accent)] hover:underline"
      >
        {cta.text} <span aria-hidden className="inline-block rtl:rotate-180">→</span>
      </Link>
    </li>
  );
}

function WhatsNewPopup() {
  const { t, locale } = useT();
  const pathname = usePathname() || '/';
  const router = useRouter();
  const items = useAnnouncementsStore((s) => s.items);
  const markRead = useAnnouncementsStore((s) => s.markRead);
  const [shownId, setShownId] = useState<string | null>(null);
  const handled = useRef<Set<string>>(new Set());

  const newest = items.find((a) => !a.read);

  useEffect(() => {
    if (!newest || handled.current.has(newest.id)) return;
    if (NO_POPUP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return;
    // Already on the feature's page: no need to announce it.
    if (pathname === newest.ctaPath || pathname.startsWith(`${newest.ctaPath}/`)) {
      handled.current.add(newest.id);
      void markRead([newest.id]);
      return;
    }
    const timer = window.setTimeout(() => {
      handled.current.add(newest.id);
      setShownId(newest.id);
    }, POPUP_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [newest, pathname, markRead]);

  const current = items.find((a) => a.id === shownId);
  const close = () => {
    if (shownId) void markRead([shownId]);
    setShownId(null);
  };

  if (!current) return null;
  const title = pick(current.title, locale);
  const body = pick(current.body, locale);
  const cta = pick(current.ctaLabel, locale);

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-md rounded-2xl border border-line bg-surface p-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--ayah-highlight)] text-[var(--accent)]">
          <Sparkles className="h-5 w-5" aria-hidden />
        </span>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">{t('whatsNew')}</p>
        <DialogTitle lang={title.lang} dir="auto" className="mt-1 text-xl font-bold text-ink">
          {title.text}
        </DialogTitle>
        <DialogDescription lang={body.lang} dir="auto" className="mt-2 text-sm leading-relaxed text-ink-2">
          {body.text}
        </DialogDescription>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={close}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-2 hover:border-[var(--accent)]"
          >
            {t('maybeLater')}
          </button>
          <button
            type="button"
            onClick={() => {
              close();
              router.push(current.ctaPath);
            }}
            lang={cta.lang}
            className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-bold text-brand-contrast hover:opacity-90"
          >
            {cta.text}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
