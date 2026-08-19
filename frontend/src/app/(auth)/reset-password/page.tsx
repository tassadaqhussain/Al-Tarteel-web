'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { SiteLogo } from '@/components/SiteLogo';
import { authApi, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError('This reset link is invalid or incomplete.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.resetPassword({ token, password, confirmPassword });
      router.replace('/login?reset=1');
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError('Too many attempts. Please wait and try again.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to reset password.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 font-serif text-2xl font-bold text-ink">
          <SiteLogo size={36} priority alt="QuranPilot" />
          QuranPilot
        </Link>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink">Set a new password</h1>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-line bg-surface/90 p-6 shadow-sm backdrop-blur"
      >
        <label className="block text-sm font-medium text-ink-2" htmlFor="password">
          New password
        </label>
        <div className="relative mt-1.5">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-line px-3 py-2.5 pr-11 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-muted"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <label className="mt-4 block text-sm font-medium text-ink-2" htmlFor="confirmPassword">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
        />

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-danger-surface px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !token}
          className={cn(
            'mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-bold text-brand-contrast hover:opacity-90',
            submitting && 'opacity-70',
          )}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Update password
        </button>
      </form>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-ink-muted">Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
