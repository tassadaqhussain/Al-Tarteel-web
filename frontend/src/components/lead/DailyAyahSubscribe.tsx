'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Mail, Sparkles, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { trackNewsletterSubscribe } from '@/lib/analytics';

const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const PROMPT_AT_KEY = 'quranpilot-subscribe-prompt-at';
const SUBSCRIBED_KEY = 'quranpilot-subscribed';

function SubscribeForm({
  source,
  compact = false,
  onSuccess,
}: {
  source: string;
  compact?: boolean;
  onSuccess?: () => void;
}) {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === 'submitting') return;

    setStatus('submitting');
    setMessage('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), website, source }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      if (!res.ok || !data.ok) {
        setStatus('error');
        setMessage(data.error || 'Could not subscribe. Please check your email.');
        return;
      }
      setStatus('success');
      setMessage(data.message || 'Subscribed! Check your inbox to confirm.');
      setEmail('');
      try {
        localStorage.setItem(SUBSCRIBED_KEY, '1');
      } catch {}
      trackNewsletterSubscribe(source);
      onSuccess?.();
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? 'mt-3 space-y-2' : 'mt-4 flex flex-col gap-2 sm:flex-row'}>
      {/* Honeypot field for bots */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email address for daily ayah"
        className="min-w-0 flex-1 rounded-lg border border-line bg-surface-app px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-[var(--accent)]"
      />
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-brand-contrast transition hover:bg-[var(--accent)]/90 disabled:opacity-60"
      >
        {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
      </button>
      {status === 'error' && message && (
        <p className="text-xs text-red-600 dark:text-red-400 sm:col-span-2">{message}</p>
      )}
    </form>
  );
}

export function DailyAyahSubscribeCard({
  source,
  className = '',
}: {
  source: string;
  className?: string;
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const status = useAuthStore((s) => s.status);

  if (status === 'loading' || isAuthenticated) return null;

  return (
    <section
      aria-label="Daily ayah email subscription"
      className={`rounded-2xl border border-line bg-surface p-5 sm:p-6 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
          <Mail className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-ink sm:text-lg">
            Get a daily ayah + reflection by email
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted sm:text-sm">
            One short Quran verse and a thoughtful reflection in your inbox each morning. Free, no spam, unsubscribe anytime.
          </p>
          <SubscribeForm source={source} />
        </div>
      </div>
    </section>
  );
}

export function DailyAyahSlideIn() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authStatus = useAuthStore((s) => s.status);
  const [visible, setVisible] = useState(false);

  const isExcludedPath =
    !pathname ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');

  useEffect(() => {
    if (authStatus === 'loading' || isAuthenticated || isExcludedPath) return;

    try {
      if (localStorage.getItem(SUBSCRIBED_KEY) === '1') return;
      const lastPrompt = Number(localStorage.getItem(PROMPT_AT_KEY) || '0');
      if (lastPrompt && Date.now() - lastPrompt < COOLDOWN_MS) return;
    } catch {
      return;
    }

    let triggered = false;
    const show = () => {
      if (triggered) return;
      triggered = true;
      setVisible(true);
      try {
        localStorage.setItem(PROMPT_AT_KEY, String(Date.now()));
      } catch {}
    };

    const timer = window.setTimeout(show, 45_000);
    const onScroll = () => {
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - window.innerHeight;
      if (maxScroll > 0 && window.scrollY / maxScroll >= 0.5) {
        show();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [authStatus, isAuthenticated, isExcludedPath]);

  if (!visible || isAuthenticated || isExcludedPath) return null;

  return (
    <aside
      aria-label="Daily ayah email signup"
      className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-md rounded-2xl border border-line bg-surface p-4 shadow-xl sm:left-auto sm:right-6 sm:bottom-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
          <Sparkles className="h-3.5 w-3.5" />
          Daily Quran Reflection
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Dismiss"
          className="rounded-full p-1 text-ink-muted hover:bg-surface-2 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-1.5 text-sm font-bold text-ink">
        Get a daily ayah + reflection by email
      </p>
      <p className="mt-0.5 text-xs text-ink-muted">
        Build a calm daily Quran habit in 1 minute a day.
      </p>
      <SubscribeForm
        source="slide_in"
        compact
        onSuccess={() => {
          window.setTimeout(() => setVisible(false), 1800);
        }}
      />
    </aside>
  );
}
