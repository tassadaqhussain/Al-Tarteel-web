'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Mail, RefreshCw, Save, Send, Trash2 } from 'lucide-react';
import { adminApi, AdminMailSettings, AdminMailTemplate, AdminRegisteredUser, ApiError } from '@/lib/api';
import { EMAIL_LAYOUTS, type EmailLayoutId } from '@/lib/email-layouts';
import { MailSettingsForm } from './MailSettingsForm';
import { EmailTemplatePreview } from './EmailTemplatePreview';
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

const FIELD =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none ring-emerald-600 focus:ring-2 dark:border-slate-700 dark:bg-slate-900';

export function UsersEmailManager() {
  const [users, setUsers] = useState<AdminRegisteredUser[]>([]);
  const [templates, setTemplates] = useState<AdminMailTemplate[]>([]);
  const [mailSettings, setMailSettings] = useState<AdminMailSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [activeTemplateId, setActiveTemplateId] = useState<number | null>(null);
  const [templateName, setTemplateName] = useState('Welcome');
  const [layout, setLayout] = useState<EmailLayoutId>('classic');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [ctaLabel, setCtaLabel] = useState('Open QuranPilot');
  const [ctaUrl, setCtaUrl] = useState('https://quranpilot.com');
  const [sending, setSending] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const appliedDefault = useRef(false);

  const applyTemplate = (item: AdminMailTemplate) => {
    setActiveTemplateId(item.id);
    setTemplateName(item.name);
    setLayout(item.layout);
    setSubject(item.subject);
    setBody(item.body);
    setCtaLabel(item.ctaLabel);
    setCtaUrl(item.ctaUrl);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, settings, saved] = await Promise.all([
        adminApi.listUsers(),
        adminApi.getMailSettings(),
        adminApi.listMailTemplates(),
      ]);
      setUsers(list);
      setMailSettings(settings);
      setTemplates(saved);
      setSelected(new Set(list.map((u) => u.id)));
      if (!appliedDefault.current && saved[0]) {
        appliedDefault.current = true;
        applyTemplate(saved[0]);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const allSelected = users.length > 0 && selected.size === users.length;
  const recipientCount = selected.size;

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(users.map((u) => u.id)));
  };

  const payload = () => ({
    name: templateName.trim(),
    layout,
    subject: subject.trim(),
    body: body.trim(),
    ctaLabel: ctaLabel.trim() || undefined,
    ctaUrl: ctaUrl.trim() || undefined,
  });

  const saveTemplate = async () => {
    const data = payload();
    if (!data.name || !data.subject || !data.body) {
      setError('Template name, subject, and message are required to save.');
      return;
    }
    setSavingTemplate(true);
    setError(null);
    try {
      const saved = activeTemplateId
        ? await adminApi.updateMailTemplate(activeTemplateId, data)
        : await adminApi.createMailTemplate(data);
      setNotice(activeTemplateId ? 'Template updated.' : 'Template saved.');
      setTemplates(await adminApi.listMailTemplates());
      applyTemplate(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save template.');
    } finally {
      setSavingTemplate(false);
    }
  };

  const deleteTemplate = async (id: number) => {
    if (!window.confirm('Delete this email template?')) return;
    setDeletingId(id);
    setError(null);
    try {
      await adminApi.deleteMailTemplate(id);
      const saved = await adminApi.listMailTemplates();
      setTemplates(saved);
      if (activeTemplateId === id) {
        if (saved[0]) applyTemplate(saved[0]);
        else setActiveTemplateId(null);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete template.');
    } finally {
      setDeletingId(null);
    }
  };

  const send = async (preview: boolean) => {
    if (!subject.trim() || !body.trim()) {
      setError('Subject and message are required.');
      return;
    }
    if (!preview && recipientCount === 0) {
      setError('Select at least one user.');
      return;
    }
    const label = preview
      ? 'Send a preview to your admin email?'
      : `Send this email to ${recipientCount} registered user${recipientCount === 1 ? '' : 's'}?`;
    if (!window.confirm(label)) return;

    setSending(true);
    setError(null);
    setNotice(null);
    try {
      const result = await adminApi.sendUserEmail({
        ...payload(),
        preview,
        userIds: preview ? undefined : [...selected],
      });
      const failedNote = result.failed ? ` ${result.failed} failed.` : '';
      setNotice(
        preview
          ? `Preview sent (${result.sent} delivered).`
          : `Sent to ${result.sent} of ${result.total} users.${failedNote}`,
      );
      if (result.errors.length) setError(result.errors.join(' · '));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send email.');
    } finally {
      setSending(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(false);
  };

  const smtpConfigured = mailSettings?.configured ?? null;
  const smtpHint = useMemo(() => {
    if (smtpConfigured === false) {
      return 'SMTP is not configured. Save host, username, and password below.';
    }
    return null;
  }, [smtpConfigured]);

  return (
    <>
      <AdminPageHeader
        title="Email users"
        description="Pick a layout, reuse a saved template, or write a new one. Each recipient is greeted by name."
        action={
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge variant="secondary">{users.length} registered</Badge>
        <Badge variant="secondary">{recipientCount} selected</Badge>
        <Badge variant="secondary">{templates.length} templates</Badge>
        <Badge variant={smtpConfigured ? 'default' : 'outline'}>
          {smtpConfigured == null
            ? 'Checking SMTP…'
            : smtpConfigured
              ? mailSettings?.source === 'database'
                ? 'SMTP ready (database)'
                : 'SMTP ready (env)'
              : 'SMTP missing'}
        </Badge>
      </div>

      {smtpHint ? <AdminErrorBanner message={smtpHint} /> : null}
      {error ? <AdminErrorBanner message={error} /> : null}
      <MailSettingsForm settings={mailSettings} onSaved={setMailSettings} />
      {notice ? (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
          {notice}
        </div>
      ) : null}

      <div className="mb-4">
        <h2 className="mb-3 text-base font-semibold text-ink dark:text-slate-100">Templates</h2>
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {EMAIL_LAYOUTS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLayout(item.id)}
              className={cn(
                'rounded-lg border px-3 py-2 text-left text-sm transition',
                layout === item.id
                  ? 'border-emerald-700 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : 'border-line bg-white text-ink-3 hover:border-emerald-600 dark:border-slate-700 dark:bg-slate-900',
              )}
            >
              <span className="block font-medium">{item.label}</span>
              <span className="block text-xs opacity-80">{item.hint}</span>
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {templates.map((item) => {
            const on = item.id === activeTemplateId;
            return (
              <AdminCard key={item.id} padding={false}>
                <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => applyTemplate(item)}>
                    <p className="text-sm font-semibold text-ink dark:text-slate-100">{item.name}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-3">
                      {EMAIL_LAYOUTS.find((l) => l.id === item.layout)?.label} · {item.subject}
                    </p>
                  </button>
                  <Badge variant={on ? 'default' : 'secondary'}>{on ? 'Editing' : 'Saved'}</Badge>
                  <Button type="button" variant="outline" size="sm" onClick={() => applyTemplate(item)}>
                    Use
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={deletingId === item.id}
                    onClick={() => void deleteTemplate(item.id)}
                    aria-label={`Delete ${item.name}`}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </AdminCard>
            );
          })}
        </div>
        <div className="mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setActiveTemplateId(null);
              setTemplateName('');
              setSubject('');
              setBody('');
              setCtaLabel('Open QuranPilot');
              setCtaUrl('https://quranpilot.com');
            }}
          >
            New template
          </Button>
        </div>
      </div>

      <AdminCard className="mb-8">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-emerald-700" aria-hidden />
            <h2 className="text-base font-semibold text-ink dark:text-slate-100">Compose</h2>
          </div>
          <div>
            <label htmlFor="template-name" className="mb-1.5 block text-sm font-medium text-ink-3">
              Template name
            </label>
            <input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className={FIELD}
              placeholder="Welcome"
            />
          </div>
          <div>
            <label htmlFor="user-email-subject" className="mb-1.5 block text-sm font-medium text-ink-3">
              Subject
            </label>
            <input
              id="user-email-subject"
              required
              minLength={3}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={FIELD}
              placeholder="A note from QuranPilot"
            />
          </div>
          <div>
            <label htmlFor="user-email-body" className="mb-1.5 block text-sm font-medium text-ink-3">
              Message
            </label>
            <textarea
              id="user-email-body"
              required
              minLength={8}
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={FIELD}
              placeholder="Write the email. Blank lines start a new paragraph."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="user-email-cta" className="mb-1.5 block text-sm font-medium text-ink-3">
                Button label
              </label>
              <input
                id="user-email-cta"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                className={FIELD}
                placeholder="Open QuranPilot"
              />
            </div>
            <div>
              <label htmlFor="user-email-cta-url" className="mb-1.5 block text-sm font-medium text-ink-3">
                Button link
              </label>
              <input
                id="user-email-cta-url"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                className={FIELD}
                placeholder="https://quranpilot.com"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={savingTemplate} onClick={() => void saveTemplate()}>
              <Save />
              {activeTemplateId ? 'Update template' : 'Save template'}
            </Button>
            <Button type="button" variant="outline" disabled={sending} onClick={() => void send(true)}>
              Send preview to me
            </Button>
            <Button type="submit" disabled={sending || !smtpConfigured || recipientCount === 0}>
              {sending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Send />
              )}
              Send to {recipientCount} user{recipientCount === 1 ? '' : 's'}
            </Button>
          </div>
        </form>
      </AdminCard>

      <div className="mb-8">
        <h2 className="mb-3 text-base font-semibold text-ink dark:text-slate-100">Template preview</h2>
        <EmailTemplatePreview
          name={users.find((u) => selected.has(u.id))?.name || users[0]?.name || 'there'}
          subject={subject}
          body={body}
          ctaLabel={ctaLabel}
          ctaUrl={ctaUrl}
          layout={layout}
        />
      </div>

      {loading && users.length === 0 ? (
        <AdminLoadingState label="Loading registered users…" />
      ) : users.length === 0 ? (
        <AdminEmptyState
          title="No registered users"
          description="Accounts with an email and password will appear here."
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink dark:text-slate-100">Recipients</h2>
            <Button type="button" variant="ghost" size="sm" onClick={toggleAll}>
              {allSelected ? 'Clear all' : 'Select all'}
            </Button>
          </div>
          {users.map((user) => {
            const on = selected.has(user.id);
            return (
              <AdminCard key={user.id}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 accent-emerald-700"
                    checked={on}
                    onChange={() => toggle(user.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink dark:text-slate-100">
                      {user.name || 'Unnamed'}
                      <span className="font-normal text-ink-3"> · {user.email}</span>
                    </p>
                    <p className="mt-1 text-xs text-ink-3">{formatAdminDate(user.createdAt)}</p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
                      on
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                    )}
                  >
                    {on ? 'Included' : 'Skipped'}
                  </span>
                </label>
              </AdminCard>
            );
          })}
        </div>
      )}
    </>
  );
}
