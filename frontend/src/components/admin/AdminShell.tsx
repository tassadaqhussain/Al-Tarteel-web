'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ExternalLink,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Sparkles,
  X,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
  { href: '/admin/messages', label: 'Motivation', icon: Sparkles },
] as const;

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-1 px-3" aria-label="Admin navigation">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-slate-300 hover:bg-white/10 hover:text-white',
            )}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .me()
      .then((res) => {
        setAdminEmail(res.email);
        setAdminName(res.name);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const initials = (adminName || adminEmail || 'A')
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold text-white">
            QP
          </span>
          <div>
            <p className="text-sm font-semibold text-white">QuranPilot</p>
            <p className="text-xs text-slate-400">Administration</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 py-4">
        <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{adminName || 'Admin'}</p>
            <p className="truncate text-xs text-slate-400">{adminEmail || 'Signed in'}</p>
          </div>
        </div>
        <Link
          href="/"
          className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
          View public site
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-ink dark:bg-slate-950">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-800/50 bg-slate-900 lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-800/50 bg-slate-900 transition-transform duration-200 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-end p-3">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {sidebar}
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink dark:text-slate-100">
              {NAV.find((item) =>
                item.exact ? pathname === item.href : pathname.startsWith(item.href),
              )?.label ?? 'Admin'}
            </p>
          </div>
          <Link
            href="/"
            className="hidden items-center gap-1.5 text-sm text-ink-3 hover:text-[var(--accent)] sm:inline-flex"
          >
            <ExternalLink className="h-4 w-4" />
            Site
          </Link>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-slate-50">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-3">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function AdminCard({
  children,
  className,
  padding = true,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-line bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900',
        padding && 'p-5 sm:p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminStatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: string;
}) {
  return (
    <AdminCard className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">{label}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-ink dark:text-slate-50">
            {value}
          </p>
          {hint ? <p className="mt-1.5 text-xs leading-relaxed text-ink-3">{hint}</p> : null}
          {trend ? (
            <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">{trend}</p>
          ) : null}
        </div>
        {Icon ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
        ) : null}
      </div>
    </AdminCard>
  );
}

export function AdminEmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <AdminCard className="py-12 text-center">
      <p className="text-base font-semibold text-ink dark:text-slate-100">{title}</p>
      {description ? <p className="mx-auto mt-2 max-w-sm text-sm text-ink-3">{description}</p> : null}
    </AdminCard>
  );
}

export function AdminLoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <AdminCard className="flex items-center justify-center gap-2 py-16 text-sm text-ink-3">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      {label}
    </AdminCard>
  );
}

export function AdminErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
      {message}
    </div>
  );
}
