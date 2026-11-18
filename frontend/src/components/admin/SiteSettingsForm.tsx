'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Globe, Save } from 'lucide-react';
import { adminApi, ApiError, type PublicSiteSettings } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { AdminCard } from './AdminShell';

const FIELD =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none ring-emerald-600 focus:ring-2 dark:border-slate-700 dark:bg-slate-900';

type Provider = PublicSiteSettings['analyticsProvider'];

export function SiteSettingsForm({
  settings,
  onSaved,
}: {
  settings: PublicSiteSettings | null;
  onSaved: (next: PublicSiteSettings) => void;
}) {
  const [provider, setProvider] = useState<Provider>('');
  const [gaId, setGaId] = useState('');
  const [plausibleDomain, setPlausibleDomain] = useState('');
  const [plausibleScript, setPlausibleScript] = useState('');
  const [umamiId, setUmamiId] = useState('');
  const [umamiScript, setUmamiScript] = useState('');
  const [googleVerification, setGoogleVerification] = useState('');
  const [bingVerification, setBingVerification] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!settings) return;
    setProvider(settings.analyticsProvider || '');
    setGaId(settings.gaMeasurementId || '');
    setPlausibleDomain(settings.plausibleDomain || '');
    setPlausibleScript(settings.plausibleScriptSrc || '');
    setUmamiId(settings.umamiWebsiteId || '');
    setUmamiScript(settings.umamiScriptSrc || '');
    setGoogleVerification(settings.googleSiteVerification || '');
    setBingVerification(settings.bingSiteVerification || '');
  }, [settings]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const next = await adminApi.saveSiteSettings({
        analyticsProvider: provider,
        gaMeasurementId: gaId.trim(),
        plausibleDomain: plausibleDomain.trim(),
        plausibleScriptSrc: plausibleScript.trim(),
        umamiWebsiteId: umamiId.trim(),
        umamiScriptSrc: umamiScript.trim(),
        googleSiteVerification: googleVerification.trim(),
        bingSiteVerification: bingVerification.trim(),
      });
      setNotice('Site settings saved. Analytics/SEO tags update without a rebuild (may take ~30s).');
      onSaved(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save site settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminCard className="mb-8">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-emerald-700" aria-hidden />
          <h2 className="text-base font-semibold text-ink dark:text-slate-100">SEO & analytics</h2>
        </div>
        <p className="text-sm text-ink-3">
          Store measurement and verification IDs in the database. Leave a field blank to clear it.
          Env vars remain a fallback until you save here.
          {settings?.source ? (
            <>
              {' '}
              Current source: <span className="font-medium text-ink">{settings.source}</span>
              {settings.analyticsEnabled ? ' · analytics on' : ' · analytics off'}.
            </>
          ) : null}
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

        <div>
          <label htmlFor="analytics-provider" className="mb-1.5 block text-sm font-medium text-ink-3">
            Analytics provider
          </label>
          <select
            id="analytics-provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value as Provider)}
            className={FIELD}
          >
            <option value="">Disabled</option>
            <option value="ga4">Google Analytics 4</option>
            <option value="plausible">Plausible</option>
            <option value="umami">Umami</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ga-id" className="mb-1.5 block text-sm font-medium text-ink-3">
              GA4 measurement ID
            </label>
            <input
              id="ga-id"
              value={gaId}
              onChange={(e) => setGaId(e.target.value)}
              className={FIELD}
              placeholder="G-XXXXXXXXXX"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="google-verify" className="mb-1.5 block text-sm font-medium text-ink-3">
              Google site verification
            </label>
            <input
              id="google-verify"
              value={googleVerification}
              onChange={(e) => setGoogleVerification(e.target.value)}
              className={FIELD}
              placeholder="Search Console meta content value"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="plausible-domain" className="mb-1.5 block text-sm font-medium text-ink-3">
              Plausible domain
            </label>
            <input
              id="plausible-domain"
              value={plausibleDomain}
              onChange={(e) => setPlausibleDomain(e.target.value)}
              className={FIELD}
              placeholder="quranpilot.com"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="plausible-script" className="mb-1.5 block text-sm font-medium text-ink-3">
              Plausible script URL (optional)
            </label>
            <input
              id="plausible-script"
              value={plausibleScript}
              onChange={(e) => setPlausibleScript(e.target.value)}
              className={FIELD}
              placeholder="https://plausible.io/js/script.js"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="umami-id" className="mb-1.5 block text-sm font-medium text-ink-3">
              Umami website ID
            </label>
            <input
              id="umami-id"
              value={umamiId}
              onChange={(e) => setUmamiId(e.target.value)}
              className={FIELD}
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="umami-script" className="mb-1.5 block text-sm font-medium text-ink-3">
              Umami script URL (optional)
            </label>
            <input
              id="umami-script"
              value={umamiScript}
              onChange={(e) => setUmamiScript(e.target.value)}
              className={FIELD}
              placeholder="https://cloud.umami.is/script.js"
              autoComplete="off"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="bing-verify" className="mb-1.5 block text-sm font-medium text-ink-3">
              Bing site verification (msvalidate.01)
            </label>
            <input
              id="bing-verify"
              value={bingVerification}
              onChange={(e) => setBingVerification(e.target.value)}
              className={FIELD}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="gap-2">
            <Save className="h-4 w-4" aria-hidden />
            {saving ? 'Saving…' : 'Save site settings'}
          </Button>
        </div>
      </form>
    </AdminCard>
  );
}
