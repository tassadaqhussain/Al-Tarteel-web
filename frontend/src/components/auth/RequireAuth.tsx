'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { loginHref, sanitizeReturnUrl } from '@/lib/auth-redirect';

/**
 * Client-side route guard for personalized pages.
 * Public Quran SEO routes must NOT use this.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (status === 'loading') return;
    if (!isAuthenticated) {
      const qs = searchParams?.toString();
      const returnUrl = qs ? `${pathname}?${qs}` : pathname;
      router.replace(loginHref(sanitizeReturnUrl(returnUrl)));
    }
  }, [status, isAuthenticated, pathname, router, searchParams]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-[var(--muted)]">
        Checking your session…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-[var(--muted)]">
        Redirecting to sign in…
      </div>
    );
  }

  return <>{children}</>;
}
