'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Save, Server } from 'lucide-react';
import { adminApi, AdminMailSettings, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { AdminCard } from './AdminShell';

const FIELD =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none ring-emerald-600 focus:ring-2 dark:border-slate-700 dark:bg-slate-900';

export function MailSettingsForm({
  settings,
  onSaved,
}: {
  settings: AdminMailSettings | null;
  onSaved: (next: AdminMailSettings) => void;
}) {
  const [host, setHost] = useState('');
  const [port, setPort] = useState(587);
  const [secure, setSecure] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!settings) return;
    setHost(settings.host);
    setPort(settings.port || 587);
    setSecure(settings.secure);
    setUsername(settings.username);
    setFromAddress(settings.fromAddress);
    setNotifyEmail(settings.notifyEmail);
    setPassword('');
  }, [settings]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!host.trim() || !username.trim()) {
      setError('Host and username are required.');
      return;
    }
    if (!password && !settings?.passwordSet) {
      setError('Password is required the first time you save SMTP.');
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const next = await adminApi.saveMailSettings({
        host: host.trim(),
        port,
        secure: secure || port === 465,
        username: username.trim(),
        password: password || undefined,
        fromAddress: fromAddress.trim() || undefined,
        notifyEmail: notifyEmail.trim() || undefined,
      });
      setPassword('');
      setNotice('SMTP settings saved.');
      onSaved(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save SMTP settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminCard className="mb-8">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-emerald-700" aria-hidden />
          <h2 className="text-base font-semibold text-ink dark:text-slate-100">SMTP configuration</h2>
        </div>
        <p className="text-sm text-ink-3">
          Saved in the database. Gmail needs an app password, not your normal login password.
        </p>
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
            {notice}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label htmlFor="smtp-host" className="mb-1.5 block text-sm font-medium text-ink-3">
              Host
            </label>
            <input
              id="smtp-host"
              required
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className={FIELD}
              placeholder="smtp.gmail.com"
            />
          </div>
          <div>
            <label htmlFor="smtp-port" className="mb-1.5 block text-sm font-medium text-ink-3">
              Port
            </label>
            <input
              id="smtp-port"
              type="number"
              min={1}
              max={65535}
              value={port}
              onChange={(e) => {
                const next = Number(e.target.value);
                setPort(next);
                if (next === 465) setSecure(true);
              }}
              className={FIELD}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink dark:text-slate-100">
          <input
            type="checkbox"
            className="accent-emerald-700"
            checked={secure}
            onChange={(e) => setSecure(e.target.checked)}
          />
          Secure (TLS, typically port 465)
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="smtp-user" className="mb-1.5 block text-sm font-medium text-ink-3">
              Username
            </label>
            <input
              id="smtp-user"
              required
              autoComplete="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={FIELD}
              placeholder="you@gmail.com"
            />
          </div>
          <div>
            <label htmlFor="smtp-pass" className="mb-1.5 block text-sm font-medium text-ink-3">
              Password
            </label>
            <input
              id="smtp-pass"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={FIELD}
              placeholder={settings?.passwordSet ? 'Leave blank to keep current' : 'App password'}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="smtp-from" className="mb-1.5 block text-sm font-medium text-ink-3">
              From (optional)
            </label>
            <input
              id="smtp-from"
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              className={FIELD}
              placeholder='QuranPilot &lt;you@gmail.com&gt;'
            />
          </div>
          <div>
            <label htmlFor="smtp-notify" className="mb-1.5 block text-sm font-medium text-ink-3">
              Feedback notify email (optional)
            </label>
            <input
              id="smtp-notify"
              type="email"
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              className={FIELD}
              placeholder="you@gmail.com"
            />
          </div>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Save />
          )}
          Save SMTP
        </Button>
      </form>
    </AdminCard>
  );
}
