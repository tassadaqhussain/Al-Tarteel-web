'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Bookmark,
  MessageSquare,
  RefreshCw,
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
  AdminPageHeader,
  AdminStatCard,
} from './AdminShell';

export function OverviewDashboard() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof adminApi.stats>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Registration counts, signed-in engagement, and feedback at a glance."
        action={
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        }
      />

      {error ? <AdminErrorBanner message={error} /> : null}

      {loading && !stats ? (
        <AdminLoadingState label="Loading dashboard…" />
      ) : stats ? (
        <div className="space-y-8">
          {analyticsEnabled ? (
            <AdminCard className="border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <p className="text-sm leading-relaxed text-emerald-950 dark:text-emerald-100">
                <strong className="font-semibold">Analytics active.</strong>{' '}
                {PLAUSIBLE_DOMAIN ? (
                  <>
                    Plausible is tracking <code className="rounded bg-white/60 px-1 text-xs">{PLAUSIBLE_DOMAIN}</code>
                    {GA_MEASUREMENT_ID ? ' · ' : '. '}
                  </>
                ) : null}
                {GA_MEASUREMENT_ID ? (
                  <>
                    GA4 is tracking <code className="rounded bg-white/60 px-1 text-xs">{GA_MEASUREMENT_ID}</code>.{' '}
                  </>
                ) : null}
                View traffic in your Plausible or Google Analytics dashboard — page views are not stored in this admin
                panel.
              </p>
            </AdminCard>
          ) : (
            <AdminCard className="border-amber-200/80 bg-amber-50/80 dark:border-amber-900/40 dark:bg-amber-950/20">
              <p className="text-sm leading-relaxed text-amber-950 dark:text-amber-100">
                {stats.trafficNote} Set{' '}
                <code className="rounded bg-white/60 px-1 text-xs">NEXT_PUBLIC_PLAUSIBLE_DOMAIN</code> and/or{' '}
                <code className="rounded bg-white/60 px-1 text-xs">NEXT_PUBLIC_GA_MEASUREMENT_ID</code>, then rebuild
                the web image.
              </p>
            </AdminCard>
          )}

          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-3">
              Registrations
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <AdminStatCard
                label="Registered accounts"
                value={formatAdminNumber(stats.users.registered)}
                icon={Users}
              />
              <AdminStatCard
                label="New this week"
                value={formatAdminNumber(stats.users.newLast7Days)}
                icon={TrendingUp}
                trend={`${formatAdminNumber(stats.users.newLast30Days)} in last 30 days`}
              />
              <AdminStatCard
                label="Feedback total"
                value={formatAdminNumber(stats.feedback.total)}
                icon={MessageSquare}
                hint={`${formatAdminNumber(stats.feedback.last7Days)} this week`}
              />
              <AdminStatCard
                label="Active readers (7d)"
                value={formatAdminNumber(stats.engagement.activeReadersLast7Days)}
                icon={Sparkles}
                hint="Distinct signed-in users"
              />
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-3">
              Engagement
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AdminStatCard
                label="Reading events (7d)"
                value={formatAdminNumber(stats.engagement.readingEventsLast7Days)}
              />
              <AdminStatCard
                label="Reading events (all time)"
                value={formatAdminNumber(stats.engagement.readingEventsTotal)}
              />
              <AdminStatCard
                label="Hifz attempts (7d)"
                value={formatAdminNumber(stats.engagement.hifzAttemptsLast7Days)}
              />
              <AdminStatCard
                label="Hifz attempts (all time)"
                value={formatAdminNumber(stats.engagement.hifzAttemptsTotal)}
              />
              <AdminStatCard
                label="Bookmarks"
                value={formatAdminNumber(stats.engagement.bookmarksTotal)}
                icon={Bookmark}
              />
              <AdminStatCard
                label="User rows"
                value={formatAdminNumber(stats.users.total)}
                hint="Includes legacy rows without passwords"
              />
            </div>
          </section>

          {stats.users.recent.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-3">
                Recent registrations
              </h2>
              <AdminCard padding={false} className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-line bg-slate-50/80 text-xs uppercase tracking-wide text-ink-3 dark:border-slate-800 dark:bg-slate-800/50">
                        <th className="px-5 py-3 font-semibold">Name</th>
                        <th className="px-5 py-3 font-semibold">Email</th>
                        <th className="px-5 py-3 font-semibold">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line dark:divide-slate-800">
                      {stats.users.recent.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-5 py-3.5 font-medium text-ink dark:text-slate-100">
                            {user.name || '—'}
                          </td>
                          <td className="px-5 py-3.5 text-ink-3">{user.email || '—'}</td>
                          <td className="px-5 py-3.5 text-ink-3">{formatAdminDate(user.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AdminCard>
            </section>
          )}

          <p className="text-xs text-ink-3">Last updated {formatAdminDate(stats.generatedAt)}</p>
        </div>
      ) : null}
    </>
  );
}
