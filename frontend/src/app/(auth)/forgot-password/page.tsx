'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { SiteLogo } from '@/components/SiteLogo';
import { authApi, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      setMessage(res.message);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError('Too many attempts. Please wait and try again.');
      } else {
        setError('Unable to process request. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 font-serif text-2xl font-bold text-slate-900">
          <SiteLogo size={36} priority alt="QuranPilot" />
          QuranPilot
        </Link>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">Forgot password</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your email and we&apos;ll send a reset link if an account exists.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur"
      >
        <label className="block text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
        />

        {message && (
          <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {message}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={cn(
            'mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-bold text-white hover:opacity-90',
            submitting && 'opacity-70',
          )}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Send reset link
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="font-semibold text-[var(--accent)] hover:underline">
          Back to sign in
        </Link>
      </p>
    </main>
  );
}
