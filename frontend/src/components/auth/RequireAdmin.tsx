'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { loginHref, sanitizeReturnUrl } from '@/lib/auth-redirect';
import { adminApi, ApiError } from '@/lib/api';

/**
 * Requires signed-in user whose email is listed in backend ADMIN_EMAILS.
 */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [adminStatus, setAdminStatus] = useState<'loading' | 'admin' | 'forbidden' | 'error'>(
    'loading',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!isAuthenticated) {
      const qs = searchParams?.toString();
      const returnUrl = qs ? `${pathname}?${qs}` : pathname;
      router.replace(loginHref(sanitizeReturnUrl(returnUrl)));
      return;
    }

    let cancelled = false;
    adminApi
      .me()
      .then((res) => {
        if (cancelled) return;
        setAdminStatus(res.isAdmin ? 'admin' : 'forbidden');
      })
      .catch((err) => {
        if (cancelled) return;
        setAdminStatus('error');
        setErrorMessage(err instanceof ApiError ? err.message : 'Unable to verify admin access.');
      });

    return () => {
      cancelled = true;
    };
  }, [status, isAuthenticated, pathname, router, searchParams]);

  if (status === 'loading' || (isAuthenticated && adminStatus === 'loading')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-ink-3">
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        Verifying admin access…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-ink-3">
        Redirecting to sign in…
      </div>
    );
  }

  if (adminStatus === 'forbidden') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">
          QP
        </span>
        <div>
          <p className="text-lg font-semibold text-ink">Admin access required</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-3">
            Your account is signed in but is not authorized for the admin panel. Ask the site owner
            to add your email to <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs">ADMIN_EMAILS</code>{' '}
            on the server.
          </p>
        </div>
        <Link href="/" className="text-sm font-medium text-[var(--accent)] hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  if (adminStatus === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
        <p className="text-lg font-semibold text-ink">Could not verify admin access</p>
        <p className="max-w-md text-sm text-ink-3">{errorMessage}</p>
        <Link href="/" className="text-sm font-medium text-[var(--accent)] hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
