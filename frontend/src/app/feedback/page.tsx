'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, MessageSquareHeart, Star } from 'lucide-react';
import { Header } from '@/components/Header';
import { ApiError, feedbackApi, type FeedbackCategory } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const CATEGORIES: { id: FeedbackCategory; label: string; hint: string }[] = [
  { id: 'idea', label: 'Idea', hint: 'A feature or improvement' },
  { id: 'bug', label: 'Bug', hint: 'Something is broken' },
  { id: 'hifz', label: 'Hifz', hint: 'Memorization practice' },
  { id: 'translation', label: 'Translation', hint: 'Text accuracy' },
  { id: 'other', label: 'Other', hint: 'Anything else' },
];

export default function FeedbackPage() {
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('idea');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setName((prev) => prev || user.name || '');
    setEmail((prev) => prev || user.email || '');
  }, [user]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(null);
    if (message.trim().length < 10) {
      setError('Please write at least a short message (10+ characters).');
      return;
    }
    setSubmitting(true);
    try {
      const res = await feedbackApi.submit({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        category,
        message: message.trim(),
        rating: rating ?? undefined,
        pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      });
      setDone(res.message);
      setMessage('');
      setRating(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError('Too many submissions. Please wait a moment and try again.');
      } else if (err instanceof ApiError) {
        setError(err.message || 'Could not send feedback.');
      } else {
        setError('Could not send feedback. Is the API running?');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--fg)]">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--accent)]">
            <MessageSquareHeart className="h-3.5 w-3.5" />
            Feedback
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Help us improve QuranPilot</h1>
          <p className="mt-3 text-[var(--muted)]">
            Share bugs, ideas, or anything about reading, hifz, audio, or translations. We read every
            message.
          </p>
        </div>

        {done ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-100">{done}</p>
                <p className="mt-2 text-sm text-emerald-800/80 dark:text-emerald-200/80">
                  Your note is saved. You can send another anytime.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setDone(null)}
                    className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Send more feedback
                  </button>
                  <Link
                    href="/"
                    className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold"
                  >
                    Back home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7"
          >
            <div>
              <p className="mb-2 text-sm font-medium">Topic</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={cn(
                      'rounded-xl border px-3 py-2.5 text-left transition',
                      category === c.id
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                        : 'border-[var(--border)] hover:border-[var(--accent)]/50',
                    )}
                  >
                    <span className="block text-sm font-semibold">{c.label}</span>
                    <span className="block text-xs text-[var(--muted)]">{c.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">How is QuranPilot overall? (optional)</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(rating === n ? null : n)}
                    className="rounded-lg p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label={`${n} stars`}
                  >
                    <Star
                      className={cn(
                        'h-7 w-7',
                        rating && n <= rating
                          ? 'fill-[var(--accent-gold)] text-[var(--accent-gold)]'
                          : 'text-slate-300',
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium" htmlFor="fb-name">
                  Name <span className="font-normal text-[var(--muted)]">(optional)</span>
                </label>
                <input
                  id="fb-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium" htmlFor="fb-email">
                  Email <span className="font-normal text-[var(--muted)]">(optional)</span>
                </label>
                <input
                  id="fb-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
                  autoComplete="email"
                  placeholder="If you want a reply"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="fb-message">
                Your feedback
              </label>
              <textarea
                id="fb-message"
                required
                minLength={10}
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What worked well? What should we fix or add?"
                className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={cn(
                'inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white hover:opacity-90 sm:w-auto',
                submitting && 'opacity-70',
              )}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Send feedback
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
