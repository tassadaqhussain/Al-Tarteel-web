'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[QuranPilot ErrorBoundary]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-surface-app text-ink">
      <Header />
      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-brand">Something went wrong</p>
        <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-ink">
          Unable to load this page
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          An unexpected error occurred. You can retry loading the page or return to the Quran directory.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-950"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink-2 transition hover:border-emerald-800/40"
          >
            Home
          </Link>
          <Link
            href="/surahs"
            className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink-2 transition hover:border-emerald-800/40"
          >
            All Surahs
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

