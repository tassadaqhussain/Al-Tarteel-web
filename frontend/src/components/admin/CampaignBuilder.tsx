'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Megaphone,
  Pause,
  Pencil,
  Plus,
  RefreshCw,
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

  const knownDestination = destinations.some((d) => d.path === form.destination);
  const inAppIds = IN_APP_CHANNELS.map((c) => c.id);
  const externalIds = EXTERNAL_CHANNELS.map((c) => c.id);

  return (
    <>
      <AdminPageHeader
        title="Campaigns"
        description="Create one ad and publish it across the app and social channels. Publishing pauses any other live campaign."
        action={
          <div className="flex gap-2">
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

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
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
              </div>

              <div>
                <p className="mb-1.5 text-sm font-medium text-ink-3">Preview</p>
                <div className="rounded-lg border border-line bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                  <p className="text-sm font-semibold text-ink dark:text-slate-100">
                    {form.headline || 'Headline'}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-3">
                    {form.body || 'Body copy appears here.'}
                  </p>
                  <span className="mt-3 inline-flex rounded-full bg-emerald-700 px-3 py-1 text-[11px] font-semibold text-white">
                    {form.ctaLabel || 'Button'}
                  </span>
                  <p className="mt-2 truncate font-mono text-[11px] text-ink-3">{form.destination || '/'}</p>
                </div>
              </div>
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

            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="outline" disabled={saving || publishing}>
                {saving ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                ) : null}
                Save draft
              </Button>
              <Button type="button" onClick={() => void onPublish()} disabled={saving || publishing}>
                {publishing ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Megaphone />
                )}
                Publish to channels
              </Button>
            </div>
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
