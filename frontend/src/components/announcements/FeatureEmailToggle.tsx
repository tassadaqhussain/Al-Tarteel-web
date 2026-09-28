'use client';

import { useEffect, useState } from 'react';
import { announcementsApi } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/** Profile switch for new-feature emails (in-app announcements always show). */
export function FeatureEmailToggle() {
  const { t } = useT();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    announcementsApi
      .emailPreference()
      .then((res) => !cancelled && setEnabled(res.featureEmails))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = async () => {
    if (enabled === null || saving) return;
    const next = !enabled;
    setSaving(true);
    setFailed(false);
    setEnabled(next);
    try {
      const res = await announcementsApi.setEmailPreference(next);
      setEnabled(res.featureEmails);
    } catch {
      setEnabled(!next);
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-line bg-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="feature-emails-label" className="text-sm font-semibold text-ink">{t('featureEmails')}</h2>
          <p className="mt-1 text-sm text-ink-3">{t('featureEmailsHint')}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(enabled)}
          aria-labelledby="feature-emails-label"
          disabled={enabled === null || saving}
          onClick={toggle}
          className={cn(
            'relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50',
            enabled ? 'bg-[var(--accent)]' : 'bg-line-strong',
          )}
        >
          <span
            className={cn(
              'inline-block h-5 w-5 rounded-full bg-white shadow transition',
              enabled ? 'translate-x-[22px] rtl:-translate-x-[22px]' : 'translate-x-0.5 rtl:-translate-x-0.5',
            )}
          />
        </button>
      </div>
      {failed && <p role="alert" className="mt-2 text-sm text-danger">Could not update this setting. Please try again.</p>}
    </section>
  );
}
