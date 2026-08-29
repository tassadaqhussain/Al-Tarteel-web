'use client';

import { FormEvent, Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, ShieldAlert, Users } from 'lucide-react';
import { Header } from '@/components/Header';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuthStore } from '@/stores/authStore';
import { adminApi, ApiError, type AdminOverview, type AdminUserList } from '@/lib/api';
import { SITE_SHELL } from '@/components/layout/MainContainer';
import { cn } from '@/lib/utils';

function SignupChart({ points }: { points: { date: string; count: number }[] }) {
  const max = Math.max(1, ...points.map((point) => point.count));
  return (
    <div className="flex h-28 items-end gap-1">
      {points.map((point) => (
        <div key={point.date} className="flex h-full min-w-0 flex-1 items-end" title={`${point.date}: ${point.count}`}>
          <div
            className="w-full max-w-[14px] mx-auto rounded-t bg-[var(--accent)]/80"
            style={{ height: `${Math.max(point.count ? 6 : 2, Math.round((point.count / max) * 100))}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function AdminDashboard() {
  const isAdmin = Boolean(useAuthStore((s) => s.user?.isAdmin));
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [list, setList] = useState<AdminUserList | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (nextPage: number, nextSearch: string) => {
    setLoading(true);
    setError(null);
    try {
      const [nextOverview, nextList] = await Promise.all([
        adminApi.overview(),
        adminApi.users({ page: nextPage, limit: 25, q: nextSearch || undefined }),
      ]);
      setOverview(nextOverview);
      setList(nextList);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError('forbidden');
      } else {
        setError('Unable to load admin data.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(page, search);
  }, [load, page, search]);

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(query.trim());
  };

  if (error === 'forbidden' || (!loading && !isAdmin && !overview)) {
    return (
      <div className="min-h-screen bg-surface-2 pb-16">
        <Header />
        <main className={cn(SITE_SHELL, 'py-16')}>
          <div className="mx-auto max-w-lg rounded-2xl border border-line bg-surface p-8 text-center">
            <ShieldAlert className="mx-auto h-10 w-10 text-ink-faint" />
            <h1 className="mt-4 text-xl font-bold text-ink">Admin access required</h1>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Sign in with an account listed in <code className="rounded bg-surface-3 px-1.5 py-0.5 text-xs">ADMIN_EMAILS</code> on the API.
            </p>
            <Link href="/profile" className="mt-6 inline-block text-sm font-medium text-[var(--accent)] hover:underline">
              Back to profile
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const stats = [
    { label: 'Total accounts', value: overview?.totalAccounts ?? '—' },
    { label: 'Today', value: overview?.today ?? '—' },
    { label: 'Last 7 days', value: overview?.last7Days ?? '—' },
    { label: 'Last 30 days', value: overview?.last30Days ?? '—' },
  ];

  return (
    <div className="min-h-screen bg-surface-2 pb-16">
      <Header />
      <main className={cn(SITE_SHELL, 'py-10')}>
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-ink">Admin</h1>
            <p className="text-sm text-ink-muted">Site visitors and registered accounts</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Visitors today', value: overview?.traffic?.visitorsToday ?? '—' },
            { label: 'Page views today', value: overview?.traffic?.pageViewsToday ?? '—' },
            { label: 'Visitors · 7 days', value: overview?.traffic?.visitorsLast7Days ?? '—' },
            { label: 'Visitors · 30 days', value: overview?.traffic?.visitorsLast30Days ?? '—' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-line bg-surface p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-ink">{stat.value}</p>
            </div>
          ))}
        </div>

        <section className="mt-6 rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold text-ink">Unique visitors · last 30 days</h2>
          <div className="mt-4 overflow-x-auto">
            {overview?.traffic?.visitorsByDay ? (
              <SignupChart points={overview.traffic.visitorsByDay.map((point) => ({ date: point.date, count: point.visitors }))} />
            ) : (
              <div className="h-28 animate-pulse rounded-xl bg-surface-3" />
            )}
          </div>
        </section>

        <div className="mt-8 mb-3">
          <h2 className="text-lg font-bold text-ink">Accounts</h2>
          <p className="text-sm text-ink-muted">People who created a QuranPilot login</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-line bg-surface p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-ink">{stat.value}</p>
            </div>
          ))}
        </div>

        <section className="mt-6 rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold text-ink">Sign-ups · last 30 days</h2>
          <div className="mt-4 overflow-x-auto">
            {overview ? <SignupChart points={overview.signupsByDay} /> : <div className="h-36 animate-pulse rounded-xl bg-surface-3" />}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-line bg-surface p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-ink">Accounts</h2>
            <form onSubmit={onSearch} className="flex gap-2">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name or email"
                className="w-56 rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              />
              <button type="submit" className="rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-brand-contrast">
                Search
              </button>
            </form>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                  <th className="py-2 pr-3 font-medium">Name</th>
                  <th className="py-2 pr-3 font-medium">Email</th>
                  <th className="py-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {list?.users.map((user) => (
                  <tr key={user.id} className="border-b border-line/70">
                    <td className="py-2.5 pr-3 text-ink">{user.name || '—'}</td>
                    <td className="py-2.5 pr-3 text-ink-muted">{user.email || '—'}</td>
                    <td className="py-2.5 tabular-nums text-ink-muted">
                      {new Date(user.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loading && (
              <p className="mt-4 inline-flex items-center gap-2 text-sm text-ink-muted">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </p>
            )}
            {!loading && list && list.users.length === 0 && (
              <p className="mt-4 text-sm text-ink-muted">No accounts match this search.</p>
            )}
          </div>

          {list && list.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <p className="text-ink-muted">
                {list.total} accounts · page {list.page} of {list.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="rounded-lg border border-line px-3 py-1.5 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= list.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-line px-3 py-1.5 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-ink-muted">Loading…</div>}>
      <RequireAuth>
        <AdminDashboard />
      </RequireAuth>
    </Suspense>
  );
}
