'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Bookmark,
  BrainCircuit,
  CheckCircle2,
  Database,
  Download,
  Mail,
  Megaphone,
  MessageSquare,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  analyticsEnabled,
  GA_MEASUREMENT_ID,
  PLAUSIBLE_DOMAIN,
} from '@/lib/analytics';
import { adminApi, ApiError } from '@/lib/api';
import { formatAdminDate, formatAdminNumber } from '@/lib/admin-utils';
import { Button } from '@/components/ui/button';
import {
  AdminCard,
  AdminErrorBanner,
  AdminLoadingState,
  AdminStatCard,
} from './AdminShell';

function userInitials(name: string | null | undefined, email: string | null | undefined): string {
  const source = (name || email || 'U').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function EngagementDonut({
  reading,
  hifz,
  bookmarks,
}: {
  reading: number;
  hifz: number;
  bookmarks: number;
}) {
  const total = reading + hifz + bookmarks;
  const r = 46;
  const c = 2 * Math.PI * r;

  const segments = [
    { label: 'Reading events', value: reading, color: '#065f46', dotClass: 'bg-emerald-800' },
    { label: 'Hifz attempts', value: hifz, color: '#475569', dotClass: 'bg-slate-600' },
    { label: 'Bookmarks', value: bookmarks, color: '#c08829', dotClass: 'bg-amber-600' },
  ];

  let cumulativeOffset = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="14"
            className="text-slate-100 dark:text-slate-800"
          />
          {total > 0 &&
            segments.map((seg) => {
              if (seg.value <= 0) return null;
              const segLen = (seg.value / total) * c;
              const dashArray = `${segLen} ${c - segLen}`;
              const dashOffset = -cumulativeOffset;
              cumulativeOffset += segLen;
              return (
                <circle
                  key={seg.label}
                  cx="60"
                  cy="60"
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="14"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="butt"
                />
              );
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-extrabold tabular-nums text-ink dark:text-slate-50">
            {formatAdminNumber(total)}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">
            Events
          </span>
        </div>
      </div>

      <div className="w-full flex-1 space-y-3">
        {segments.map((seg) => {
          const share = total > 0 ? Math.round((seg.value / total) * 100) : 0;
          return (
            <div key={seg.label} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${seg.dotClass}`} aria-hidden />
                <span className="font-medium text-ink-2">{seg.label}</span>
              </div>
              <div className="flex items-center gap-2 tabular-nums">
                <span className="font-bold text-ink dark:text-slate-100">
                  {formatAdminNumber(seg.value)}
                </span>
                <span className="w-9 text-right text-ink-3">{share}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ShareProgressBar({
  part,
  total,
  barClass = 'bg-emerald-700',
}: {
  part: number;
  total: number;
  barClass?: string;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((part / total) * 100)) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full ${barClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-[11px] font-medium tabular-nums text-ink-3">
        {pct}%
      </span>
    </div>
  );
}

const CHANNEL_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  x: 'X (Twitter)',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  email: 'Email Newsletter',
  in_app: 'In-App Banner',
  search: 'Organic Search',
  referral: 'External Referral',
  direct: 'Direct / Typed URL',
};

export function OverviewDashboard() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof adminApi.stats>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await adminApi.stats());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load dashboard stats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRecentUsers = useMemo(() => {
    if (!stats?.users.recent) return [];
    const q = userQuery.trim().toLowerCase();
    if (!q) return stats.users.recent;
    return stats.users.recent.filter(
      (u) =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q),
    );
  }, [stats, userQuery]);

  const exportRecentCsv = () => {
    if (!filteredRecentUsers.length) return;
    const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const rows = [
      ['Name', 'Email', 'Joined'].join(','),
      ...filteredRecentUsers.map((u) =>
        [escape(u.name || ''), escape(u.email || ''), escape(u.createdAt || '')].join(','),
      ),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quranpilot-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Canvas Page Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-slate-800 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 ring-1 ring-inset ring-emerald-700/15 dark:bg-emerald-950/60 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden />
              System Online
            </span>
            {analyticsEnabled ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <BarChart3 className="h-3 w-3 text-emerald-700 dark:text-emerald-400" aria-hidden />
                {GA_MEASUREMENT_ID ? `GA4 · ${GA_MEASUREMENT_ID}` : `Plausible · ${PLAUSIBLE_DOMAIN}`}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                Analytics unconfigured
              </span>
            )}
            {stats ? (
              <span className="text-xs text-ink-3">
                Updated {formatAdminDate(stats.generatedAt)}
              </span>
            ) : null}
          </div>
          <h1 className="mt-2.5 text-2xl font-bold tracking-tight text-ink dark:text-slate-50">
            Platform Overview
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-3">
            Monitor registered accounts, Quran reading activity, Hifz memorization, and community feedback.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Link
            href="/admin/campaigns"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-800 px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-900"
          >
            <Megaphone className="h-3.5 w-3.5" aria-hidden />
            New Campaign
          </Link>
        </div>
      </div>

      {error ? <AdminErrorBanner message={error} /> : null}

      {loading && !stats ? (
        <AdminLoadingState label="Loading dashboard…" />
      ) : stats ? (
        <div className="space-y-7">
          {/* Primary KPI Row */}
          <section>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <AdminStatCard
                label="Registered accounts"
                value={formatAdminNumber(stats.users.registered)}
                icon={Users}
                accent="emerald"
                hint="Verified email & password accounts"
              />
              <AdminStatCard
                label="New this week"
                value={formatAdminNumber(stats.users.newLast7Days)}
                icon={TrendingUp}
                accent="slate"
                trend={`${formatAdminNumber(stats.users.newLast30Days)} in last 30 days`}
              />
              <AdminStatCard
                label="Feedback total"
                value={formatAdminNumber(stats.feedback.total)}
                icon={MessageSquare}
                accent="slate"
                hint={`${formatAdminNumber(stats.feedback.last7Days)} received this week`}
              />
              <AdminStatCard
                label="Active readers (7d)"
                value={formatAdminNumber(stats.engagement.activeReadersLast7Days)}
                icon={Activity}
                accent="emerald"
                hint="Distinct signed-in users"
              />
            </div>
          </section>

          {/* Engagement Cards + Distribution Chart */}
          <section className="grid gap-6 lg:grid-cols-12">
            {/* Left 7 cols: Paired Engagement Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
              <AdminCard className="flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-slate-700">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-ink-3">Reading Events</p>
                    <p className="mt-2 text-2xl font-bold tabular-nums text-ink dark:text-slate-50 sm:text-3xl">
                      {formatAdminNumber(stats.engagement.readingEventsTotal)}
                    </p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200/70 bg-emerald-50 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <BookOpen className="h-4 w-4" aria-hidden />
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                    {formatAdminNumber(stats.engagement.readingEventsLast7Days)} in last 7d
                  </span>
                  <ShareProgressBar
                    part={stats.engagement.readingEventsLast7Days}
                    total={stats.engagement.readingEventsTotal}
                    barClass="bg-emerald-700"
                  />
                </div>
              </AdminCard>

              <AdminCard className="flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-slate-700">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-ink-3">Hifz Attempts</p>
                    <p className="mt-2 text-2xl font-bold tabular-nums text-ink dark:text-slate-50 sm:text-3xl">
                      {formatAdminNumber(stats.engagement.hifzAttemptsTotal)}
                    </p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <BrainCircuit className="h-4 w-4" aria-hidden />
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {formatAdminNumber(stats.engagement.hifzAttemptsLast7Days)} in last 7d
                  </span>
                  <ShareProgressBar
                    part={stats.engagement.hifzAttemptsLast7Days}
                    total={stats.engagement.hifzAttemptsTotal}
                    barClass="bg-slate-600"
                  />
                </div>
              </AdminCard>

              <AdminCard className="flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-slate-700">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-ink-3">Saved Bookmarks</p>
                    <p className="mt-2 text-2xl font-bold tabular-nums text-ink dark:text-slate-50 sm:text-3xl">
                      {formatAdminNumber(stats.engagement.bookmarksTotal)}
                    </p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <Bookmark className="h-4 w-4" aria-hidden />
                  </span>
                </div>
                <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-ink-3 dark:border-slate-800">
                  Verses bookmarked by signed-in readers
                </p>
              </AdminCard>

              <AdminCard className="flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-slate-700">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-ink-3">Total User Rows</p>
                    <p className="mt-2 text-2xl font-bold tabular-nums text-ink dark:text-slate-50 sm:text-3xl">
                      {formatAdminNumber(stats.users.total)}
                    </p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <Database className="h-4 w-4" aria-hidden />
                  </span>
                </div>
                <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-ink-3 dark:border-slate-800">
                  Includes legacy passwordless rows
                </p>
              </AdminCard>
            </div>

            {/* Right 5 cols: Donut Chart + Quick Actions */}
            <div className="flex flex-col gap-4 lg:col-span-5">
              <AdminCard className="flex-1">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-ink dark:text-slate-100">
                    Engagement Distribution
                  </h2>
                  <span className="text-xs font-medium text-ink-3">All time</span>
                </div>
                <EngagementDonut
                  reading={stats.engagement.readingEventsTotal}
                  hifz={stats.engagement.hifzAttemptsTotal}
                  bookmarks={stats.engagement.bookmarksTotal}
                />
              </AdminCard>

              <AdminCard>
                <p className="mb-3 text-sm font-bold text-ink dark:text-slate-100">
                  Admin Shortcuts
                </p>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2">
                  <Link
                    href="/admin/campaigns"
                    className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2.5 text-xs font-semibold text-ink-2 transition hover:border-emerald-700/30 hover:bg-emerald-50/40 hover:text-emerald-900 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:text-emerald-300"
                  >
                    <Megaphone className="h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden />
                    Campaigns
                  </Link>
                  <Link
                    href="/admin/email"
                    className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2.5 text-xs font-semibold text-ink-2 transition hover:border-emerald-700/30 hover:bg-emerald-50/40 hover:text-emerald-900 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:text-emerald-300"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden />
                    Email Users
                  </Link>
                  <Link
                    href="/admin/feedback"
                    className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2.5 text-xs font-semibold text-ink-2 transition hover:border-emerald-700/30 hover:bg-emerald-50/40 hover:text-emerald-900 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:text-emerald-300"
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden />
                    Feedback
                  </Link>
                  <Link
                    href="/admin/messages"
                    className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2.5 text-xs font-semibold text-ink-2 transition hover:border-emerald-700/30 hover:bg-emerald-50/40 hover:text-emerald-900 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:text-emerald-300"
                  >
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden />
                    Motivation
                  </Link>
                </div>
              </AdminCard>
            </div>
          </section>

          {/* Visitors by Channel (30d) */}
          <section>
            <AdminCard>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <h2 className="text-sm font-bold text-ink dark:text-slate-100">
                    Visitors by Channel
                  </h2>
                  <p className="text-xs text-ink-3">
                    Unique daily visitors &amp; page views over the last 30 days (tracked via UTM &amp; referrers)
                  </p>
                </div>
                {stats.traffic && (
                  <div className="flex flex-wrap items-center gap-4 text-xs tabular-nums">
                    <div>
                      <span className="text-ink-3">Today: </span>
                      <span className="font-semibold text-ink dark:text-slate-100">
                        {formatAdminNumber(stats.traffic.visitorsToday)}
                      </span>
                    </div>
                    <div>
                      <span className="text-ink-3">7d: </span>
                      <span className="font-semibold text-ink dark:text-slate-100">
                        {formatAdminNumber(stats.traffic.visitorsLast7Days)}
                      </span>
                    </div>
                    <div>
                      <span className="text-ink-3">30d: </span>
                      <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                        {formatAdminNumber(stats.traffic.visitorsLast30Days)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {!stats.traffic || stats.traffic.channelsLast30Days.length === 0 ? (
                <p className="py-4 text-xs text-ink-3">
                  No channel visits recorded yet. Share a campaign link (with <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">?utm_source=...</code>) or visit the public site to see channel attribution here.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {stats.traffic.channelsLast30Days.map((row) => {
                    const maxVisitors = Math.max(
                      1,
                      ...stats.traffic!.channelsLast30Days.map((c) => c.visitors),
                    );
                    const pct = Math.round((row.visitors / maxVisitors) * 100);
                    return (
                      <div
                        key={row.channel}
                        className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-ink dark:text-slate-100">
                            {CHANNEL_LABELS[row.channel] || row.channel}
                          </span>
                          <span className="font-mono text-[11px] tabular-nums text-ink-3">
                            {formatAdminNumber(row.visitors)} visitors · {formatAdminNumber(row.pageViews)} views
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-emerald-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </AdminCard>

            <AdminCard className="mt-4 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-ink dark:text-slate-100">
                    Top Searches (Last 30 Days)
                  </h2>
                  <p className="mt-0.5 text-xs text-ink-3">
                    Most searched topics, verses, and surahs on QuranPilot.
                  </p>
                </div>
                <span className="text-xs text-ink-3">
                  {stats.traffic?.topSearchesLast30Days?.length ?? 0} tracked terms
                </span>
              </div>

              {!stats.traffic?.topSearchesLast30Days ||
              stats.traffic.topSearchesLast30Days.length === 0 ? (
                <p className="py-4 text-xs text-ink-3">
                  No searches recorded yet. Site searches from the hero bar and /search page will appear here ranked by popularity.
                </p>
              ) : (
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  {stats.traffic.topSearchesLast30Days.map((row, idx) => (
                    <a
                      key={row.query}
                      href={`/search?q=${encodeURIComponent(row.query)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-200/80 bg-slate-50/50 px-3 py-2.5 text-xs transition hover:border-emerald-700/40 dark:border-slate-800 dark:bg-slate-900/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink dark:text-slate-100">
                          <span className="mr-1.5 font-mono text-[11px] text-ink-3">
                            #{idx + 1}
                          </span>
                          {row.query}
                        </p>
                        <p className="mt-0.5 text-[11px] text-ink-3">
                          {row.resultsCount !== null ? `${row.resultsCount} results` : 'Direct / search'}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-emerald-800/10 px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300">
                        {formatAdminNumber(row.count)}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </AdminCard>
          </section>

          {/* Recent Registrations Table */}
          {stats.users.recent.length > 0 && (
            <section>
              <AdminCard padding={false} className="overflow-hidden">
                <div className="flex flex-col justify-between gap-3 border-b border-slate-200/80 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-base font-bold text-ink dark:text-slate-100">
                      Recent Registrations
                    </h2>
                    <p className="text-xs text-ink-3">
                      Latest {stats.users.recent.length} accounts created on QuranPilot
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" />
                      <input
                        type="search"
                        value={userQuery}
                        onChange={(e) => setUserQuery(e.target.value)}
                        placeholder="Filter users…"
                        aria-label="Filter recent registrations"
                        className="h-8 w-48 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-ink outline-none transition focus:border-emerald-700 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:w-56"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={exportRecentCsv}
                      disabled={filteredRecentUsers.length === 0}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-ink-2 transition hover:border-emerald-700/40 hover:text-emerald-800 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden />
                      Export CSV
                    </button>
                    <Link
                      href="/admin/email"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline dark:text-emerald-400"
                    >
                      <span>Manage all</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-ink-3 dark:border-slate-800 dark:bg-slate-800/50">
                        <th className="px-5 py-3">User</th>
                        <th className="px-5 py-3">Email</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredRecentUsers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-5 py-8 text-center text-xs text-ink-3">
                            No recent registrations match &ldquo;{userQuery}&rdquo;.
                          </td>
                        </tr>
                      ) : (
                        filteredRecentUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                  {userInitials(user.name, user.email)}
                                </span>
                                <span className="font-semibold text-ink dark:text-slate-100">
                                  {user.name || 'Unnamed user'}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-xs text-ink-3">
                              {user.email || '—'}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                <CheckCircle2 className="h-3 w-3" aria-hidden />
                                Active
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right text-xs text-ink-3">
                              {formatAdminDate(user.createdAt)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </AdminCard>
            </section>
          )}
        </div>
      ) : null}
    </div>
  );
}
