'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Copy,
  ExternalLink,
  Link2,
  Megaphone,
  Pause,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  Trash2,
} from 'lucide-react';
import {
  adminApi,
  ApiError,
  type AdminCampaign,
  type CampaignCopy,
  type CampaignPayload,
} from '@/lib/api';
import {
  campaignDestinations,
  channelLabel,
  EMPTY_CAMPAIGN_FORM,
  EXTERNAL_CHANNELS,
  IN_APP_CHANNELS,
  type CampaignChannelId,
} from '@/lib/campaign-catalog';
import { formatAdminDate } from '@/lib/admin-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AdminCard,
  AdminEmptyState,
  AdminErrorBanner,
  AdminLoadingState,
  AdminPageHeader,
} from './AdminShell';
import { cn } from '@/lib/utils';

type FormState = typeof EMPTY_CAMPAIGN_FORM;
type StatusFilter = '' | 'live' | 'draft' | 'paused';

type PreviewChannel = 'facebook' | 'instagram' | 'x' | 'in_app' | 'whatsapp';

function buildLiveChannelDrafts(
  form: {
    headline: string;
    body: string;
    ctaLabel: string;
    destination: string;
    channels: CampaignChannelId[];
  },
  origin = 'https://quranpilot.com',
) {
  const path = form.destination.startsWith('/') ? form.destination : `/${form.destination}`;
  const baseUrl = `${origin.replace(/\/$/, '')}${path}`;
  const withUtm = (ch: string) => `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}utm_source=${ch}`;
  const headline = form.headline.trim() || 'Read and reflect on the Quran daily';
  const body = form.body.trim() || 'Build a steady daily habit with guided reading, tajweed, and audio.';
  const cta = form.ctaLabel.trim() || 'Start reading';

  const entries: Array<{
    channel: CampaignChannelId;
    label: string;
    text: string;
    shareUrl?: string;
  }> = [];

  if (form.channels.includes('facebook')) {
    const url = withUtm('facebook');
    entries.push({
      channel: 'facebook',
      label: 'Facebook',
      text: `${headline}\n\n${body}\n\n${cta}: ${url}`,
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`${headline} — ${body}`)}`,
    });
  }
  if (form.channels.includes('instagram')) {
    const url = withUtm('instagram');
    entries.push({
      channel: 'instagram',
      label: 'Instagram',
      text: `${headline}\n\n${body}\n\nLink in bio: ${url}\n#QuranPilot #Quran #Tajweed`,
    });
  }
  if (form.channels.includes('x')) {
    const url = withUtm('x');
    const xText = `${headline} — ${body}`.slice(0, 220);
    entries.push({
      channel: 'x',
      label: 'X (Twitter)',
      text: `${xText}\n${url}`,
      shareUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(xText)}&url=${encodeURIComponent(url)}`,
    });
  }
  if (form.channels.includes('whatsapp')) {
    const url = withUtm('whatsapp');
    entries.push({
      channel: 'whatsapp',
      label: 'WhatsApp',
      text: `*${headline}*\n${body}\n\n${cta}: ${url}`,
      shareUrl: `https://wa.me/?text=${encodeURIComponent(`*${headline}*\n${body}\n${url}`)}`,
    });
  }
  if (form.channels.includes('telegram')) {
    const url = withUtm('telegram');
    entries.push({
      channel: 'telegram',
      label: 'Telegram',
      text: `${headline}\n${body}\n${url}`,
      shareUrl: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`${headline} — ${body}`)}`,
    });
  }
  if (form.channels.includes('email')) {
    const url = withUtm('email');
    entries.push({
      channel: 'email',
      label: 'Email Newsletter',
      text: `Subject: ${headline}\n\n${body}\n\n${cta}: ${url}`,
      shareUrl: `mailto:?subject=${encodeURIComponent(headline)}&body=${encodeURIComponent(`${body}\n\n${cta}: ${url}`)}`,
    });
  }
  return entries;
}

const FIELD =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none ring-emerald-600 focus:ring-2 dark:border-slate-700 dark:bg-slate-900';

const STATUS_PILL: Record<AdminCampaign['status'], string> = {
  live: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  paused: 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

function payloadFromForm(form: FormState): CampaignPayload {
  return {
    name: form.name.trim() || form.headline.trim(),
    headline: form.headline.trim(),
    body: form.body.trim(),
    ctaLabel: form.ctaLabel.trim(),
    destination: form.destination.trim() || '/',
    destinationKind: form.destinationKind,
    imageUrl: form.imageUrl.trim() || undefined,
    channels: form.channels,
  };
}

function formFromCampaign(item: AdminCampaign): FormState {
  return {
    name: item.name,
    headline: item.headline,
    body: item.body,
    ctaLabel: item.ctaLabel,
    destination: item.destination,
    destinationKind: item.destinationKind,
    imageUrl: item.imageUrl ?? '',
    channels: item.channels.filter((c) => c.enabled).map((c) => c.channel) as CampaignChannelId[],
  };
}

function ChannelGrid({
  channels,
  selected,
  onToggle,
}: {
  channels: typeof IN_APP_CHANNELS | typeof EXTERNAL_CHANNELS;
  selected: CampaignChannelId[];
  onToggle: (id: CampaignChannelId) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {channels.map((ch) => {
        const on = selected.includes(ch.id);
        return (
          <label
            key={ch.id}
            className={cn(
              'flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors',
              on
                ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
                : 'border-line hover:border-line-strong dark:border-slate-700',
            )}
          >
            <input
              type="checkbox"
              className="mt-0.5 accent-emerald-700"
              checked={on}
              onChange={() => onToggle(ch.id)}
            />
            <span>
              <span className="block font-medium text-ink dark:text-slate-100">{ch.label}</span>
              <span className="text-xs text-ink-3">{ch.hint}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

export function CampaignBuilder() {
  const destinations = useMemo(() => campaignDestinations(), []);
  const destinationGroups = useMemo(
    () => [...new Set(destinations.map((d) => d.group))],
    [destinations],
  );

  const [items, setItems] = useState<AdminCampaign[]>([]);
  const [status, setStatus] = useState<StatusFilter>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_CAMPAIGN_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [copies, setCopies] = useState<CampaignCopy[]>([]);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [copiedChannel, setCopiedChannel] = useState<string | null>(null);
  const [customPath, setCustomPath] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await adminApi.listCampaigns());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load campaigns.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = status ? items.filter((item) => item.status === status) : items;
  const liveCount = items.filter((item) => item.status === 'live').length;

  const resetForm = () => {
    setForm(EMPTY_CAMPAIGN_FORM);
    setEditingId(null);
    setCopies([]);
    setCustomPath(false);
    setShowForm(false);
  };

  const openNew = () => {
    setForm(EMPTY_CAMPAIGN_FORM);
    setEditingId(null);
    setCopies([]);
    setCustomPath(false);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleChannel = (id: CampaignChannelId) => {
    setForm((f) => ({
      ...f,
      channels: f.channels.includes(id) ? f.channels.filter((c) => c !== id) : [...f.channels, id],
    }));
  };

  const setGroup = (ids: CampaignChannelId[], on: boolean) => {
    setForm((f) => {
      const rest = f.channels.filter((c) => !ids.includes(c));
      return { ...f, channels: on ? [...rest, ...ids] : rest };
    });
  };

  const onDestinationChange = (path: string) => {
    if (path === '__custom') {
      setCustomPath(true);
      setForm((f) => ({ ...f, destinationKind: 'custom' }));
      return;
    }
    const match = destinations.find((d) => d.path === path);
    setCustomPath(false);
    setForm((f) => ({
      ...f,
      destination: path,
      destinationKind: match?.kind ?? 'custom',
      name: f.name.trim() ? f.name : (match?.label ?? f.name),
    }));
  };

  const save = async (): Promise<AdminCampaign | null> => {
    const body = payloadFromForm(form);
    if (!body.channels.length) {
      setError('Select at least one channel.');
      return null;
    }
    if (editingId) return adminApi.updateCampaign(editingId, body);
    return adminApi.createCampaign(body);
  };

  const onSaveDraft = async (e?: FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const saved = await save();
      if (!saved) return;
      setEditingId(saved.id);
      setCopies(saved.copies ?? []);
      setShowForm(true);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save campaign.');
    } finally {
      setSaving(false);
    }
  };

  const onPublish = async () => {
    setPublishing(true);
    setError(null);
    try {
      const saved = await save();
      if (!saved) return;
      const published = await adminApi.publishCampaign(saved.id, payloadFromForm(form).channels);
      setEditingId(published.id);
      setCopies(published.copies ?? []);
      setShowForm(true);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to publish campaign.');
    } finally {
      setPublishing(false);
    }
  };

  const onEdit = async (item: AdminCampaign) => {
    setEditingId(item.id);
    setForm(formFromCampaign(item));
    setCustomPath(!destinations.some((d) => d.path === item.destination));
    setShowForm(true);
    try {
      const full = await adminApi.getCampaign(item.id);
      setCopies(full.copies ?? []);
    } catch {
      setCopies([]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onPause = async (id: number) => {
    setError(null);
    try {
      await adminApi.pauseCampaign(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to pause campaign.');
    }
  };

  const onPublishExisting = async (item: AdminCampaign) => {
    setPublishing(true);
    setError(null);
    try {
      await adminApi.publishCampaign(
        item.id,
        item.channels.filter((c) => c.enabled).map((c) => c.channel),
      );
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to publish campaign.');
    } finally {
      setPublishing(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!window.confirm('Delete this campaign permanently?')) return;
    setDeletingId(id);
    setError(null);
    try {
      await adminApi.deleteCampaign(id);
      if (editingId === id) resetForm();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete campaign.');
    } finally {
      setDeletingId(null);
    }
  };

  const copyText = async (channel: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedChannel(channel);
      window.setTimeout(() => setCopiedChannel(null), 1600);
    } catch {
      setError('Could not copy to clipboard.');
    }
  };

  const [previewChannel, setPreviewChannel] = useState<PreviewChannel>('facebook');
  const [copiedAll, setCopiedAll] = useState(false);
  const [connectionsOpen, setConnectionsOpen] = useState(false);
  const [smtpConfigured, setSmtpConfigured] = useState<boolean | null>(null);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchResults, setDispatchResults] = useState<
    Array<{ channel: string; ok: boolean; detail: string }>
  >([]);
  const [connections, setConnections] = useState({
    webhookUrl: '',
    telegramBotToken: '',
    telegramChatId: '',
    metaPageId: '',
    metaAccessToken: '',
    instagramAccountId: '',
  });

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('qp_campaign_connections');
      if (saved) setConnections((prev) => ({ ...prev, ...JSON.parse(saved) }));
    } catch {
      // ignore storage errors
    }
    adminApi
      .getMailSettings()
      .then((s) => setSmtpConfigured(s.configured))
      .catch(() => setSmtpConfigured(false));
  }, []);

  const updateConnection = (key: keyof typeof connections, value: string) => {
    setConnections((prev) => {
      const next = { ...prev, [key]: value };
      try {
        window.localStorage.setItem('qp_campaign_connections', JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const hasTelegram = Boolean(connections.telegramBotToken.trim() && connections.telegramChatId.trim());
  const hasMeta = Boolean(connections.metaPageId.trim() && connections.metaAccessToken.trim());
  const hasWebhook = Boolean(connections.webhookUrl.trim());
  const connectedExternalCount =
    (hasWebhook ? 1 : 0) + (hasTelegram ? 1 : 0) + (hasMeta ? 1 : 0) + (smtpConfigured ? 1 : 0);

  const onDispatch = async () => {
    if (!editingId) {
      setError('Save or publish the campaign first before dispatching to external connections.');
      return;
    }
    setDispatching(true);
    setError(null);
    setDispatchResults([]);
    try {
      const res = await adminApi.dispatchCampaign(editingId, connections);
      setDispatchResults(res.results);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to dispatch campaign.');
    } finally {
      setDispatching(false);
    }
  };

  const knownDestination = destinations.some((d) => d.path === form.destination);
  const inAppIds = IN_APP_CHANNELS.map((c) => c.id);
  const externalIds = EXTERNAL_CHANNELS.map((c) => c.id);
  const allChannelIds = [...inAppIds, ...externalIds];
  const allSelected = allChannelIds.every((id) => form.channels.includes(id));
  const liveDrafts = buildLiveChannelDrafts(form);

  const copyAllExternal = async () => {
    if (!liveDrafts.length || typeof navigator === 'undefined' || !navigator.clipboard) return;
    const bundle = liveDrafts.map((d) => `=== ${d.label} ===\n${d.text}`).join('\n\n');
    await navigator.clipboard.writeText(bundle);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <>
      <AdminPageHeader
        title="Campaigns"
        description="Create one ad and publish it across the app and social channels. Publishing pauses any other live campaign."
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConnectionsOpen((v) => !v)}
            >
              <Link2 className="h-3.5 w-3.5" />
              Connections ({6 + connectedExternalCount})
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={loading ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button type="button" size="sm" onClick={openNew}>
              <Plus />
              New campaign
            </Button>
          </div>
        }
      />

      {connectionsOpen && (
        <AdminCard className="mb-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/80 pb-3 dark:border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-ink dark:text-slate-100">
                Channel Connections
              </h2>
              <p className="text-xs text-ink-3">
                In-app surfaces are built in and go live automatically. Connect external channels below for 1-click auto-dispatch.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-medium">
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                6 In-App Live
              </span>
              <span
                className={cn(
                  'rounded-md px-2 py-0.5',
                  smtpConfigured
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                )}
              >
                Email: {smtpConfigured ? 'SMTP Ready' : 'Not configured'}
              </span>
              <span
                className={cn(
                  'rounded-md px-2 py-0.5',
                  hasMeta
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                )}
              >
                Meta (FB/IG): {hasMeta ? 'Connected' : 'Share link'}
              </span>
              <span
                className={cn(
                  'rounded-md px-2 py-0.5',
                  hasTelegram
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                )}
              >
                Telegram: {hasTelegram ? 'Bot Ready' : 'Share link'}
              </span>
              <span
                className={cn(
                  'rounded-md px-2 py-0.5',
                  hasWebhook
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                )}
              >
                Webhook (X / WhatsApp): {hasWebhook ? 'Connected' : 'Optional'}
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2.5 rounded-lg border border-slate-200/80 p-3.5 dark:border-slate-800">
              <p className="text-xs font-semibold text-ink dark:text-slate-100">
                Meta (Facebook Page &amp; Instagram)
              </p>
              <input
                type="text"
                value={connections.metaPageId}
                onChange={(e) => updateConnection('metaPageId', e.target.value)}
                placeholder="Facebook Page ID"
                className={FIELD}
              />
              <input
                type="password"
                value={connections.metaAccessToken}
                onChange={(e) => updateConnection('metaAccessToken', e.target.value)}
                placeholder="Meta Page Access Token"
                className={FIELD}
              />
              <input
                type="text"
                value={connections.instagramAccountId}
                onChange={(e) => updateConnection('instagramAccountId', e.target.value)}
                placeholder="Instagram Business ID (optional)"
                className={FIELD}
              />
            </div>

            <div className="space-y-2.5 rounded-lg border border-slate-200/80 p-3.5 dark:border-slate-800">
              <p className="text-xs font-semibold text-ink dark:text-slate-100">
                Telegram Bot API
              </p>
              <input
                type="password"
                value={connections.telegramBotToken}
                onChange={(e) => updateConnection('telegramBotToken', e.target.value)}
                placeholder="Bot Token (from @BotFather)"
                className={FIELD}
              />
              <input
                type="text"
                value={connections.telegramChatId}
                onChange={(e) => updateConnection('telegramChatId', e.target.value)}
                placeholder="Channel / Chat ID (e.g. @quranpilot)"
                className={FIELD}
              />
              <p className="text-[11px] text-ink-4">
                Add your bot as an administrator on your Telegram channel to auto-post.
              </p>
            </div>

            <div className="space-y-2.5 rounded-lg border border-slate-200/80 p-3.5 dark:border-slate-800">
              <p className="text-xs font-semibold text-ink dark:text-slate-100">
                Automation Webhook &amp; Email
              </p>
              <input
                type="url"
                value={connections.webhookUrl}
                onChange={(e) => updateConnection('webhookUrl', e.target.value)}
                placeholder="https://hooks.zapier.com/... (Make / n8n)"
                className={FIELD}
              />
              <p className="text-[11px] text-ink-4">
                Sends full JSON + per-channel copies for X, WhatsApp Business, or custom integrations.
              </p>
              <div className="pt-1">
                <Link
                  href="/admin/email"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline dark:text-emerald-400"
                >
                  {smtpConfigured ? 'Manage SMTP & Email Broadcast →' : 'Configure SMTP in Email Settings →'}
                </Link>
              </div>
            </div>
          </div>
        </AdminCard>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="campaign-status" className="text-sm font-medium text-ink-3">
            Status
          </label>
          <select
            id="campaign-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none ring-emerald-600 focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">All statuses</option>
            <option value="live">Live</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
          </select>
        </div>
        <Badge variant="secondary">{items.length} campaigns</Badge>
        {liveCount > 0 ? <Badge variant="secondary">{liveCount} live</Badge> : null}
      </div>

      {error ? <AdminErrorBanner message={error} /> : null}

      {showForm && (
        <AdminCard className="mb-8">
          <form onSubmit={(e) => void onSaveDraft(e)} className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-ink dark:text-slate-100">
                {editingId ? `Edit campaign #${editingId}` : 'New campaign'}
              </h2>
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                Cancel
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-3" htmlFor="campaign-name">
                    Internal name
                  </label>
                  <input
                    id="campaign-name"
                    required
                    minLength={2}
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className={FIELD}
                    placeholder="Ramadan — Tajweed"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-3" htmlFor="campaign-headline">
                    Headline
                  </label>
                  <input
                    id="campaign-headline"
                    required
                    minLength={4}
                    value={form.headline}
                    onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
                    className={FIELD}
                    placeholder="Learn Tajweed, one rule at a time"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-3" htmlFor="campaign-body">
                    Body
                  </label>
                  <textarea
                    id="campaign-body"
                    required
                    minLength={8}
                    rows={4}
                    value={form.body}
                    onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                    className={FIELD}
                    placeholder="Short copy used in the in-app banner and as the base for every channel."
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink-3" htmlFor="campaign-cta">
                      Button label
                    </label>
                    <input
                      id="campaign-cta"
                      required
                      value={form.ctaLabel}
                      onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))}
                      className={FIELD}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink-3" htmlFor="campaign-destination">
                      Destination
                    </label>
                    <select
                      id="campaign-destination"
                      value={customPath || !knownDestination ? '__custom' : form.destination}
                      onChange={(e) => onDestinationChange(e.target.value)}
                      className={FIELD}
                    >
                      {destinationGroups.map((group) => (
                        <optgroup key={group} label={group}>
                          {destinations
                            .filter((d) => d.group === group)
                            .map((d) => (
                              <option key={d.path} value={d.path}>
                                {d.label}
                              </option>
                            ))}
                        </optgroup>
                      ))}
                      <option value="__custom">Custom path…</option>
                    </select>
                  </div>
                </div>
                {(customPath || !knownDestination) && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink-3" htmlFor="campaign-path">
                      Custom path
                    </label>
                    <input
                      id="campaign-path"
                      value={form.destination}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, destination: e.target.value, destinationKind: 'custom' }))
                      }
                      className={FIELD}
                      placeholder="/tajweed/ghunnah"
                    />
                  </div>
                )}

                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <label className="text-sm font-medium text-ink-3" htmlFor="campaign-image-url">
                      Creative / Image URL <span className="font-normal text-ink-4">(optional, shown on Facebook &amp; Instagram)</span>
                    </label>
                    {form.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
                        className="text-xs font-medium text-ink-4 hover:text-ink"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    id="campaign-image-url"
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                    className={FIELD}
                    placeholder="https://quranpilot.com/og-image.png"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink-3">Live Ad Preview</p>
                  <span className="text-[11px] font-medium text-ink-4">
                    {form.channels.length}/{allChannelIds.length} channels
                  </span>
                </div>

                <div className="mb-2.5 flex flex-wrap gap-1 rounded-lg border border-line bg-slate-100/80 p-1 dark:border-slate-800 dark:bg-slate-900/70">
                  {(
                    [
                      ['facebook', 'Facebook'],
                      ['instagram', 'Instagram'],
                      ['x', 'X'],
                      ['in_app', 'In-App'],
                      ['whatsapp', 'WhatsApp'],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPreviewChannel(id)}
                      className={`flex-1 rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                        previewChannel === id
                          ? 'bg-white text-emerald-800 shadow-xs dark:bg-slate-800 dark:text-emerald-300'
                          : 'text-ink-3 hover:text-ink'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {previewChannel === 'facebook' && (
                  <div className="overflow-hidden rounded-xl border border-line bg-white shadow-xs dark:border-slate-700 dark:bg-slate-950">
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-800 text-xs font-bold text-white">
                        QP
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-ink dark:text-slate-100">QuranPilot</p>
                        <p className="text-[10px] text-ink-4">Sponsored · Omni-channel</p>
                      </div>
                    </div>
                    <p className="px-3.5 pb-2.5 text-xs leading-relaxed text-ink-2 dark:text-slate-300">
                      {form.body || 'Build a steady daily Quran habit with guided reading, tajweed, and audio.'}
                    </p>
                    {form.imageUrl ? (
                      <img
                        src={form.imageUrl}
                        alt={form.headline || 'Campaign creative'}
                        className="h-40 w-full object-cover bg-slate-100 dark:bg-slate-900"
                      />
                    ) : (
                      <div className="flex h-32 flex-col justify-between bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 p-4 text-white">
                        <span className="w-fit rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-200">
                          QuranPilot
                        </span>
                        <p className="line-clamp-2 text-sm font-semibold leading-snug">
                          {form.headline || 'Read and reflect on the Quran daily'}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2 border-t border-line bg-slate-50 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-900">
                      <div className="min-w-0">
                        <p className="truncate text-[10px] uppercase tracking-wide text-ink-4">
                          quranpilot.com{form.destination || '/'}
                        </p>
                        <p className="truncate text-xs font-semibold text-ink dark:text-slate-100">
                          {form.headline || 'Headline'}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-md bg-emerald-800 px-2.5 py-1.5 text-[11px] font-semibold text-white">
                        {form.ctaLabel || 'Start reading'}
                      </span>
                    </div>
                  </div>
                )}

                {previewChannel === 'instagram' && (
                  <div className="overflow-hidden rounded-xl border border-line bg-white shadow-xs dark:border-slate-700 dark:bg-slate-950">
                    <div className="flex items-center gap-2 px-3.5 py-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-800 text-[10px] font-bold text-white">
                        QP
                      </span>
                      <p className="text-xs font-semibold text-ink dark:text-slate-100">quranpilot.app</p>
                    </div>
                    {form.imageUrl ? (
                      <img
                        src={form.imageUrl}
                        alt={form.headline || 'Instagram creative'}
                        className="h-44 w-full object-cover bg-slate-100 dark:bg-slate-900"
                      />
                    ) : (
                      <div className="flex h-40 flex-col justify-center bg-gradient-to-br from-slate-900 via-emerald-950 to-emerald-900 p-5 text-center text-white">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-300">
                          QuranPilot
                        </p>
                        <p className="mt-1.5 text-sm font-semibold leading-snug">
                          {form.headline || 'Headline'}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between bg-emerald-800 px-3.5 py-2 text-xs font-semibold text-white">
                      <span>{form.ctaLabel || 'Start reading'}</span>
                      <span>→</span>
                    </div>
                    <p className="px-3.5 py-2.5 text-xs leading-relaxed text-ink-2 dark:text-slate-300">
                      <span className="font-semibold text-ink dark:text-slate-100">quranpilot.app</span>{' '}
                      {form.body || 'Body copy appears here.'}
                    </p>
                  </div>
                )}

                {previewChannel === 'x' && (
                  <div className="rounded-xl border border-line bg-white p-3.5 shadow-xs dark:border-slate-700 dark:bg-slate-950">
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-xs font-bold text-white">
                        QP
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-ink dark:text-slate-100">QuranPilot</span>
                          <span className="text-[11px] text-ink-4">@quranpilot</span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-ink-2 dark:text-slate-300">
                          <span className="font-semibold text-ink dark:text-slate-100">
                            {form.headline || 'Headline'}
                          </span>{' '}
                          — {form.body || 'Body copy appears here.'}
                        </p>
                        <div className="mt-2.5 rounded-lg border border-line bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
                          <p className="truncate font-mono text-[10px] text-emerald-700 dark:text-emerald-400">
                            quranpilot.com{form.destination || '/'}
                          </p>
                          <p className="truncate text-xs font-medium text-ink dark:text-slate-100">
                            {form.ctaLabel || 'Start reading'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {previewChannel === 'in_app' && (
                  <div className="rounded-xl border border-emerald-700/30 bg-emerald-950/[0.04] p-4 dark:border-emerald-700/40 dark:bg-emerald-950/30">
                    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                      In-App Surface
                    </span>
                    <p className="mt-2 text-sm font-semibold text-ink dark:text-slate-100">
                      {form.headline || 'Headline'}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-3">
                      {form.body || 'Body copy appears here.'}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="inline-flex rounded-full bg-emerald-800 px-3 py-1 text-[11px] font-semibold text-white">
                        {form.ctaLabel || 'Start reading'}
                      </span>
                      <span className="truncate font-mono text-[11px] text-ink-4">{form.destination || '/'}</span>
                    </div>
                  </div>
                )}

                {previewChannel === 'whatsapp' && (
                  <div className="rounded-xl border border-line bg-slate-100 p-3.5 dark:border-slate-700 dark:bg-slate-900">
                    <div className="rounded-lg bg-white p-3 shadow-xs dark:bg-slate-950">
                      <p className="text-xs font-bold text-ink dark:text-slate-100">
                        *{form.headline || 'Headline'}*
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-2 dark:text-slate-300">
                        {form.body || 'Body copy appears here.'}
                      </p>
                      <p className="mt-2 text-xs font-medium text-emerald-700 underline dark:text-emerald-400">
                        https://quranpilot.com{form.destination || '/'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-emerald-700/20 bg-emerald-950/[0.03] p-3.5 dark:border-emerald-800/40 dark:bg-emerald-950/20">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink dark:text-slate-100">
                    Omni-channel placement ({form.channels.length} of {allChannelIds.length} active)
                  </p>
                  <p className="text-xs text-ink-3">
                    Place this single campaign across every QuranPilot in-app surface and social channel at once.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, channels: allSelected ? ['in_app_global'] : [...allChannelIds] }))}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      allSelected
                        ? 'border border-emerald-700/40 bg-emerald-800 text-white'
                        : 'border border-line bg-white text-ink hover:border-emerald-700 dark:border-slate-700 dark:bg-slate-900'
                    }`}
                  >
                    {allSelected ? 'All 12 channels selected' : 'Select all 12 channels'}
                  </button>
                  {liveDrafts.length > 0 && (
                    <button
                      type="button"
                      onClick={copyAllExternal}
                      className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-emerald-700 dark:border-slate-700 dark:bg-slate-900"
                    >
                      {copiedAll ? 'Copied all channels' : 'Copy all channel texts'}
                    </button>
                  )}
                </div>
              </div>
              {liveDrafts.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line/70 pt-2.5 dark:border-slate-800">
                  <span className="mr-1 text-[11px] font-medium text-ink-4">Quick share:</span>
                  {liveDrafts.map((draft) =>
                    draft.shareUrl ? (
                      <a
                        key={draft.channel}
                        href={draft.shareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md border border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-2 transition hover:border-emerald-700 hover:text-emerald-800 dark:border-slate-700 dark:bg-slate-900 dark:hover:text-emerald-300"
                      >
                        {draft.label} ↗
                      </a>
                    ) : (
                      <button
                        key={draft.channel}
                        type="button"
                        onClick={() => navigator.clipboard?.writeText(draft.text)}
                        className="rounded-md border border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-2 transition hover:border-emerald-700 hover:text-emerald-800 dark:border-slate-700 dark:bg-slate-900 dark:hover:text-emerald-300"
                      >
                        Copy {draft.label}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-ink-3">In-app surfaces</p>
                <button
                  type="button"
                  className="text-xs font-semibold text-[var(--accent)] hover:underline"
                  onClick={() => setGroup(inAppIds, !inAppIds.every((id) => form.channels.includes(id)))}
                >
                  {inAppIds.every((id) => form.channels.includes(id)) ? 'Clear' : 'Select all'}
                </button>
              </div>
              <ChannelGrid channels={IN_APP_CHANNELS} selected={form.channels} onToggle={toggleChannel} />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-ink-3">Social & email</p>
                <button
                  type="button"
                  className="text-xs font-semibold text-[var(--accent)] hover:underline"
                  onClick={() => setGroup(externalIds, !externalIds.every((id) => form.channels.includes(id)))}
                >
                  {externalIds.every((id) => form.channels.includes(id)) ? 'Clear' : 'Select all'}
                </button>
              </div>
              <ChannelGrid channels={EXTERNAL_CHANNELS} selected={form.channels} onToggle={toggleChannel} />
            </div>

            {copies.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-ink-3">Channel copy</p>
                <div className="space-y-2">
                  {copies.map((copy) => (
                    <div
                      key={copy.channel}
                      className="rounded-lg border border-line px-3 py-2.5 dark:border-slate-700"
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-ink dark:text-slate-100">
                          {channelLabel(copy.channel)}
                        </p>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => void copyText(copy.channel, copy.text)}
                          >
                            {copiedChannel === copy.channel ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copiedChannel === copy.channel ? 'Copied' : 'Copy'}
                          </Button>
                          {copy.shareUrl ? (
                            <a
                              href={copy.shareUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-ink-3 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              Open
                            </a>
                          ) : null}
                        </div>
                      </div>
                      <p className="whitespace-pre-wrap text-xs leading-relaxed text-ink-3">{copy.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" variant="outline" disabled={saving || publishing || dispatching}>
                {saving ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                ) : null}
                Save draft
              </Button>
              <Button type="button" onClick={() => void onPublish()} disabled={saving || publishing || dispatching}>
                {publishing ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Megaphone />
                )}
                Publish to channels
              </Button>
              {(hasWebhook || hasTelegram || hasMeta) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void onDispatch()}
                  disabled={saving || publishing || dispatching || !editingId}
                  title={!editingId ? 'Save or publish the campaign first' : 'Send directly to your connected channels'}
                >
                  {dispatching ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Dispatch to connected APIs
                </Button>
              )}
            </div>

            {dispatchResults.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="mb-2 text-xs font-semibold text-ink dark:text-slate-100">
                  Channel Dispatch Results
                </p>
                <div className="space-y-1.5">
                  {dispatchResults.map((res) => (
                    <div key={res.channel} className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium capitalize text-ink-2">{res.channel}</span>
                      <span
                        className={cn(
                          'font-medium',
                          res.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
                        )}
                      >
                        {res.detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </AdminCard>
      )}

      {loading && items.length === 0 ? (
        <AdminLoadingState label="Loading campaigns…" />
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          title={items.length === 0 ? 'No campaigns yet' : 'No campaigns in this status'}
          description="Create one ad, choose in-app and social channels, then publish."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const enabled = item.channels.filter((c) => c.enabled);
            return (
              <AdminCard key={item.id}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
                          STATUS_PILL[item.status],
                        )}
                      >
                        {item.status}
                      </span>
                      <span className="text-xs text-ink-3">{formatAdminDate(item.updatedAt)}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-ink dark:text-slate-100">{item.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-2">{item.headline}</p>
                    <p className="mt-3 text-xs text-ink-3">
                      {enabled.map((c) => channelLabel(c.channel)).join(' · ') || 'No channels'}
                    </p>
                    <p className="mt-1 truncate text-xs text-ink-3">
                      Destination:{' '}
                      <span className="font-medium text-[var(--accent)]">{item.destination}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => void onEdit(item)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    {item.status === 'live' ? (
                      <Button type="button" variant="ghost" size="sm" onClick={() => void onPause(item.id)}>
                        <Pause className="h-4 w-4" />
                        Pause
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={publishing}
                        onClick={() => void onPublishExisting(item)}
                      >
                        <Megaphone className="h-4 w-4" />
                        Publish
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => void onDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="text-ink-3 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                    >
                      {deletingId === item.id ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}
    </>
  );
}
