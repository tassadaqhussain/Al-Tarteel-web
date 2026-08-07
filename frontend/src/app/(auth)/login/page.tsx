'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { SiteLogo } from '@/components/SiteLogo';
import { useAuthStore } from '@/stores/authStore';
import { ApiError } from '@/lib/api';
import { registerHref, sanitizeReturnUrl } from '@/lib/auth-redirect';
import { cn } from '@/lib/utils';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = useMemo(
    () => sanitizeReturnUrl(searchParams.get('returnUrl')),
    [searchParams],
  );
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const status = useAuthStore((s) => s.status);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const resetOk = searchParams.get('reset') === '1';

  useEffect(() => {
    if (status !== 'loading' && isAuthenticated) {
      router.replace(returnUrl);
    }
  }, [status, isAuthenticated, returnUrl, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      void remember;
      router.replace(returnUrl);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 429)) {
        setError(
          err.status === 429
            ? 'Too many attempts. Please wait a moment and try again.'
            : 'Invalid email or password.',
        );
      } else if (err instanceof Error) {
        setError(err.message || 'Unable to sign in. Please try again.');
      } else {
        setError('Unable to sign in. Please try again.');
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
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in to sync bookmarks and reading progress.</p>
      </div>

      {resetOk && (
        <p role="status" className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-center text-sm text-emerald-800">
          Password updated. You can sign in now.
        </p>
      )}

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur"
        noValidate
      >
        <label className="block text-sm font-medium text-slate-700" htmlFor="email">
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
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
        />

        <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="password">
          Password
        </label>
        <div className="relative mt-1.5">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-11 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-800"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <label className="inline-flex items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="rounded border-slate-300 text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            Remember me
          </label>
          <Link href="/forgot-password" className="font-medium text-[var(--accent)] hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={cn(
            'mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-bold text-white transition hover:opacity-90',
            submitting && 'opacity-70',
          )}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{' '}
        <Link href={registerHref(returnUrl)} className="font-semibold text-[var(--accent)] hover:underline">
          Create account
        </Link>
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
