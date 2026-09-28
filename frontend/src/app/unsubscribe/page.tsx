'use client';

import Link from 'next/link';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, TriangleAlert } from 'lucide-react';
import { Header } from '@/components/Header';
import { announcementsApi } from '@/lib/api';
import { useT } from '@/lib/i18n';

function UnsubscribeContent() {
  const { t } = useT();
  const token = useSearchParams().get('token') ?? '';
  const [status, setStatus] = useState<'working' | 'done' | 'invalid'>(token ? 'working' : 'invalid');
  const sent = useRef(false);

  useEffect(() => {
    if (!token || sent.current) return;
    sent.current = true;
    announcementsApi
      .unsubscribe(token)
      .then(() => setStatus('done'))
      .catch(() => setStatus('invalid'));
  }, [token]);

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-line bg-surface p-6 text-center" role="status" aria-live="polite">
        {status === 'working' && <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--accent)]" aria-hidden />}
        {status === 'done' && <CheckCircle2 className="mx-auto h-8 w-8 text-[var(--accent)]" aria-hidden />}
        {status === 'invalid' && <TriangleAlert className="mx-auto h-8 w-8 text-warning" aria-hidden />}
        <h1 className="mt-3 text-xl font-bold text-ink">{t('unsubscribeTitle')}</h1>
        <p className="mt-2 text-sm text-ink-3">
          {status === 'working' ? t('unsubscribing') : status === 'done' ? t('unsubscribeDone') : t('unsubscribeInvalid')}
        </p>
        {status !== 'working' && (
          <Link href="/profile" className="mt-5 inline-block text-sm font-semibold text-[var(--accent)] hover:underline">
            {t('manageEmailPrefs')}
          </Link>
        )}
      </div>
    </main>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Header />
      <Suspense fallback={null}>
        <UnsubscribeContent />
      </Suspense>
    </div>
  );
}
