'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useT } from '@/lib/i18n';
import type { MessageKey } from '@/lib/i18n/messages';
import { PageSection } from '@/components/layout/MainContainer';

const REFLECTIONS: { ref: string; textKey: MessageKey }[] = [
  { ref: 'Al-Baqarah 2:286', textKey: 'reflectionBaqarah' },
  { ref: 'Ash-Sharh 94:5-6', textKey: 'reflectionSharh' },
  { ref: 'Al-Fatihah 1:5', textKey: 'reflectionFatihah' },
];

export function Community() {
  const { t } = useT();

  return (
    <PageSection className="border-t border-slate-100 bg-white">
      <div className="mb-5 flex flex-col gap-1 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h2 className="text-lg font-bold text-slate-800 sm:text-xl md:text-2xl">{t('reflectOnQuran')}</h2>
        <Link
          href="/search"
          className="shrink-0 text-sm font-medium text-slate-600 transition hover:text-[var(--accent)]"
        >
          {t('exploreVerses')}
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {REFLECTIONS.map((r) => (
          <div
            key={r.ref}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <p className="text-sm leading-relaxed text-slate-600">{t(r.textKey)}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
              {r.ref}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3.5 text-sm text-slate-600 sm:mt-6">
        <MessageCircle className="h-4 w-4 shrink-0 text-[var(--accent)]" />
        {t('communityRoadmap')}
      </div>
    </PageSection>
  );
}
