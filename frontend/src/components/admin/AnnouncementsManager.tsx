'use client';

import { useCallback, useEffect, useState } from 'react';
import { Eye, Send } from 'lucide-react';
import { announcementsApi, ApiError, type AdminAnnouncement } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  AdminCard,
  AdminEmptyState,
  AdminErrorBanner,
  AdminLoadingState,
  AdminPageHeader,
} from './AdminShell';

function describeEmail(item: AdminAnnouncement): string {
  const e = item.email;
  if (!e) return 'Not emailed yet';
  if (!e.finishedAt) return `Sending… ${e.sent + e.failed} of ${e.total}`;
  if (e.sent === 0) return `Failed: none of ${e.total} delivered — you can retry`;
  return `Emailed ${new Date(e.finishedAt).toLocaleString()} · ${e.sent} sent${e.failed ? `, ${e.failed} failed` : ''}`;
}

/**
 * Announcements are defined in code (backend/src/announcements/announcements.data.ts)
 * and appear in every signed-in user's "What's new" automatically. This page
 * only handles the optional, one-time email.
 */
export function AnnouncementsManager() {
  const [data, setData] = useState<{ audience: number; items: AdminAnnouncement[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setData(await announcementsApi.adminList());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load announcements.');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Poll while a broadcast is running.
  const sending = data?.items.some((i) => i.email && !i.email.finishedAt);
  useEffect(() => {
    if (!sending) return;
    const id = window.setInterval(() => void refresh(), 3000);
    return () => window.clearInterval(id);
  }, [sending, refresh]);

  const send = async (item: AdminAnnouncement, preview: boolean) => {
    if (!preview) {
      const ok = window.confirm(
        `Email “${item.emailSubject}” to ${data?.audience ?? 0} subscribed users? This can only be sent once.`,
      );
      if (!ok) return;
    }
    setBusy(`${item.id}:${preview}`);
    setError(null);
    setNotice(null);
    try {
      const res = await announcementsApi.adminEmail(item.id, preview);
      setNotice(preview ? 'Preview sent to your admin email.' : `Sending to ${res.total} users…`);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Announcements"
        description="New-feature announcements appear in every signed-in user's “What's new” as soon as they are deployed. Add them in backend/src/announcements/announcements.data.ts. Emailing is optional and happens once per announcement, only to users who have not opted out."
      />
      {error && <AdminErrorBanner message={error} />}
      {notice && (
        <div role="status" className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
          {notice}
        </div>
      )}
      {!data && !error && <AdminLoadingState />}
      {data && data.items.length === 0 && (
        <AdminEmptyState title="No published announcements" description="Add one in announcements.data.ts and deploy." />
      )}
      {data && data.items.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-ink-3">
            Email audience: <strong className="text-ink">{data.audience}</strong> registered users who have not opted out.
          </p>
          {data.items.map((item) => {
            const locked = Boolean(item.email && (!item.email.finishedAt || item.email.sent > 0));
            return (
              <AdminCard key={item.id}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-ink-faint">
                      {item.publishedAt} · <code>{item.id}</code>
                    </p>
                    <h2 className="mt-1 text-base font-semibold text-ink">{item.title}</h2>
                    <p className="mt-1 text-sm text-ink-3">
                      Links to <code>{item.ctaPath}</code>
                      {item.emailSubject ? <> · Email subject: “{item.emailSubject}”</> : ' · No email copy'}
                    </p>
                    <p className="mt-2 text-sm font-medium text-ink-2">{describeEmail(item)}</p>
                  </div>
                  {item.emailSubject && (
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button variant="outline" size="sm" disabled={busy !== null} onClick={() => send(item, true)}>
                        <Eye /> Send preview
                      </Button>
                      <Button size="sm" disabled={busy !== null || locked || !data.audience} onClick={() => send(item, false)}>
                        <Send /> Email users
                      </Button>
                    </div>
                  )}
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
