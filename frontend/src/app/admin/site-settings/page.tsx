'use client';

import { useEffect, useState } from 'react';
import { adminApi, type PublicSiteSettings } from '@/lib/api';
import { SiteSettingsForm } from '@/components/admin/SiteSettingsForm';

export default function AdminSiteSettingsPage() {
  const [settings, setSettings] = useState<PublicSiteSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getSiteSettings()
      .then(setSettings)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load settings'));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 font-serif text-2xl font-bold text-ink dark:text-slate-100">Site settings</h1>
      <p className="mb-6 text-sm text-ink-3">
        Manage Google Analytics, Plausible/Umami, and Search Console / Bing verification IDs without
        redeploying.
      </p>
      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      <SiteSettingsForm settings={settings} onSaved={setSettings} />
    </div>
  );
}
