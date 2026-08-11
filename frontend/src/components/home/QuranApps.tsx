'use client';

import { Bookmark, Search, Volume2 } from 'lucide-react';
import { useT } from '@/lib/i18n';
import type { MessageKey } from '@/lib/i18n/messages';

const FEATURES: { icon: typeof Search; labelKey: MessageKey }[] = [
  { icon: Search, labelKey: 'appsFeatureSearch' },
  { icon: Volume2, labelKey: 'appsFeatureRecitation' },
  { icon: Bookmark, labelKey: 'appsFeatureBookmarks' },
];

export function QuranApps() {
  const { t } = useT();

  return (
    <section className="w-full px-3 py-3 sm:px-4 sm:py-4 md:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 sm:text-xl md:text-2xl">
              {t('appsWhereverTitle')}
            </h2>
            <p className="mt-1 max-w-md text-sm text-slate-500">{t('appsWhereverBody')}</p>
          </div>
          <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-[var(--accent)]/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            {t('mobileAppComingSoon')}
          </span>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, labelKey }) => (
            <li
              key={labelKey}
              className="flex items-start gap-2 rounded-xl bg-slate-50 px-3.5 py-3 text-sm text-slate-600"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
              {t(labelKey)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
