'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { CheckCircle2, Mail } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export function QuranInYearSubscribe() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated && user?.email && !email) {
      setEmail(user.email);
    }
  }, [isAuthenticated, user?.email, email]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setStatus('submitting');
    setMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, source: 'quran_in_year' }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Could not subscribe. Please try again.');
        return;
      }
      setStatus('success');
      setMessage(
        data.message || 'You are subscribed! Please check your inbox to confirm.'
      );
      try {
        localStorage.setItem('quranpilot_daily_ayah_subscribed_v1', '1');
      } catch {
        /* ignore */
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-7">
      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
          <Mail className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-ink sm:text-xl">
            Get weekly Quran in a Year reminders
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-3">
            Receive this week&apos;s reading range and reflection prompts by email. Free, no spam, unsubscribe anytime.
          </p>

          {status === 'success' ? (
            <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address for Quran in a Year reminders"
                className="min-w-0 flex-1 rounded-xl border border-line bg-surface-app px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-[var(--accent)]"
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-brand-contrast transition hover:bg-[var(--accent)]/90 disabled:opacity-60"
              >
                {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
          )}

          {status === 'error' && message && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{message}</p>
          )}

          {isAuthenticated && (
            <p className="mt-3 text-xs text-ink-muted">
              Want to adjust account preferences?{' '}
              <Link href="/settings" className="font-medium text-[var(--accent)] hover:underline">
                Manage reminder settings
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
