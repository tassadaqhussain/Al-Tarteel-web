import Link from 'next/link';
import { Header } from '@/components/Header';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-app">
      <Header />
      <main className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">Page not found</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          This page does not exist. Try browsing all surahs or return to the homepage.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-950"
          >
            Home
          </Link>
          <Link
            href="/surahs"
            className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink-2 hover:border-emerald-800/40"
          >
            All Surahs
          </Link>
          <Link
            href="/search"
            className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink-2 hover:border-emerald-800/40"
          >
            Search
          </Link>
        </div>
      </main>
    </div>
  );
}
