'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpenCheck, ChevronRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { HifzDailyChart } from '@/components/hifz/HifzDailyChart';
import { hifzApi } from '@/lib/api';
import { SURAH_ARABIC, SURAH_SIMPLE_NAMES, getSurahMeta } from '@/lib/surah-meta';
import { useAuthStore } from '@/stores/authStore';
import { useHifzStore } from '@/stores/hifzStore';
import { loginHref } from '@/lib/auth-redirect';
import { lastLocalDateKeys } from '@/lib/hifz/compare';

const POPULAR = [1, 36, 55, 67, 112, 113, 114, 18, 2];

export default function HifzHomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const status = useAuthStore((s) => s.status);
  const daysMap = useHifzStore((s) => s.days);
  const today = useHifzStore((s) => s.today());
  const [remoteDays, setRemoteDays] = useState<
    Array<{ date: string; avgAccuracy: number; attempts: number }> | null
  >(null);
  const [query, setQuery] = useState('');

  const localDays = useMemo(() => {
    return lastLocalDateKeys(14).map((key) => {
      const row = daysMap[key];
      return row
        ? { date: row.date, avgAccuracy: row.avgAccuracy, attempts: row.attempts }
        : { date: key, avgAccuracy: 0, attempts: 0 };
    });
  }, [daysMap]);

  useEffect(() => {
    if (!isAuthenticated) {
      setRemoteDays(null);
      return;
    }
    let cancelled = false;
    hifzApi
      .daily(14)
      .then((rows) => {
        if (cancelled) return;
        const map = new Map(rows.map((r) => [r.date, r]));
        const filled = localDays.map((d) => {
          const r = map.get(d.date);
          return r
            ? {
                date: r.date,
                avgAccuracy: r.avgAccuracy,
                attempts: r.attempts,
              }
            : d;
        });
        setRemoteDays(filled);
      })
      .catch(() => {
        if (!cancelled) setRemoteDays(null);
      });
    return () => {
      cancelled = true;
    };
    // Refresh remote once auth is ready; local merge uses latest localDays snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const chartDays = remoteDays ?? localDays;

  const surahs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return Array.from({ length: 114 }, (_, i) => i + 1).filter((n) => {
      if (!q) return true;
      const meta = getSurahMeta(n);
      return (
        String(n).includes(q) ||
        meta.nameSimple.toLowerCase().includes(q) ||
        meta.nameArabic.includes(query.trim()) ||
        meta.meaning.toLowerCase().includes(q)
      );
    });
  }, [query]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--fg)]">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--accent)]">
            <BookOpenCheck className="h-3.5 w-3.5" />
            Hifz
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Practice from memory</h1>
          <p className="mt-3 text-[var(--muted)]">
            See the whole surah as blank lines with hidden numbers. Recite ayah by ayah — text and
            numbers only reveal when you get them right. Track daily accuracy as you learn.
          </p>
          {status !== 'loading' && !isAuthenticated && (
            <p className="mt-3 text-sm text-[var(--muted)]">
              Signed-out progress stays on this device.{' '}
              <Link href={loginHref('/hifz')} className="font-medium text-[var(--accent)] hover:underline">
                Sign in
              </Link>{' '}
              to sync daily accuracy across devices.
            </p>
          )}
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Today</p>
            <p className="mt-2 text-3xl font-bold">{today ? `${Math.round(today.avgAccuracy)}%` : '—'}</p>
            <p className="text-sm text-[var(--muted)]">{today?.attempts ?? 0} attempts</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:col-span-2">
            <HifzDailyChart days={chartDays} className="border-0 bg-transparent p-0" />
          </div>
        </div>

        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Start with a popular surah</h2>
          <div className="flex flex-wrap gap-2">
            {POPULAR.map((n) => (
              <Link
                key={n}
                href={`/hifz/${n}`}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {n}. {SURAH_SIMPLE_NAMES[n]}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-lg font-semibold">All surahs</h2>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search surah…"
              className="w-full max-w-xs rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            {surahs.map((n) => {
              const meta = getSurahMeta(n);
              return (
                <Link
                  key={n}
                  href={`/hifz/${n}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-[var(--accent)]/5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 text-sm font-semibold text-[var(--accent)]">
                      {n}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{meta.nameSimple}</p>
                      <p className="truncate text-sm text-[var(--muted)]">{meta.meaning}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span dir="rtl" lang="ar" className="font-arabic text-lg">
                      {SURAH_ARABIC[n]}
                    </span>
                    <ChevronRight className="h-4 w-4 text-[var(--muted)] rtl:rotate-180" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
