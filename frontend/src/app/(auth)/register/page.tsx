'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { SiteLogo } from '@/components/SiteLogo';
import { useAuthStore } from '@/stores/authStore';
import { ApiError } from '@/lib/api';
import { loginHref, sanitizeReturnUrl } from '@/lib/auth-redirect';
import { cn } from '@/lib/utils';

const PASSWORD_HINT =
  'Use 8+ characters with uppercase, lowercase, and a number.';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = useMemo(
    () => sanitizeReturnUrl(searchParams.get('returnUrl')),
    [searchParams],
  );
  const register = useAuthStore((s) => s.register);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const status = useAuthStore((s) => s.status);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status !== 'loading' && isAuthenticated) {
      router.replace(returnUrl);
    }
  }, [status, isAuthenticated, returnUrl, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });
      router.replace(returnUrl);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Unable to create account with that email.');
      } else if (err instanceof ApiError && err.status === 429) {
        setError('Too many attempts. Please wait a moment and try again.');
      } else if (err instanceof Error) {
        setError(err.message || 'Unable to create account.');
      } else {
        setError('Unable to create account.');
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
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink">Create your account</h1>
        <p className="mt-2 text-sm text-ink-3">Save bookmarks and progress across devices.</p>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-line bg-surface/90 p-6 shadow-sm backdrop-blur"
        noValidate
      >
        <label className="block text-sm font-medium text-ink-2" htmlFor="name">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
        />

        <label className="mt-4 block text-sm font-medium text-ink-2" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
        />

        <label className="mt-4 block text-sm font-medium text-ink-2" htmlFor="password">
          Password
        </label>
        <div className="relative mt-1.5">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 pr-11 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-muted hover:text-ink"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-ink-muted">{PASSWORD_HINT}</p>

        <label className="mt-4 block text-sm font-medium text-ink-2" htmlFor="confirmPassword">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
        />

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-danger-surface px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={cn(
            'mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-bold text-brand-contrast transition hover:opacity-90',
            submitting && 'opacity-70',
          )}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-3">
        Already have an account?{' '}
        <Link href={loginHref(returnUrl)} className="font-semibold text-[var(--accent)] hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-ink-muted">Loading…</div>}>
      <RegisterForm />
    </Suspense>
  );
}
