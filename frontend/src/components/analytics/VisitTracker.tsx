'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4010/api/v1';

/** Fire-and-forget page view for the admin visitor counts. */
export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname === '/admin' || pathname.startsWith('/admin/')) return;
    const send = () => {
      const url = `${API_BASE}/analytics/visit`;
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const source = params?.get('utm_source')?.trim() || undefined;
      const referrer = typeof document !== 'undefined' && document.referrer ? document.referrer : undefined;
      const body = JSON.stringify({ path: pathname, source, referrer });
      try {
        void fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
          credentials: 'omit',
        }).catch(() => {
          /* ignore offline/network errors */
        });
      } catch {
        /* ignore */
      }
    };
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof win.requestIdleCallback === 'function') {
      const id = win.requestIdleCallback(send, { timeout: 2000 });
      return () => win.cancelIdleCallback?.(id);
    }
    const timer = setTimeout(send, 1200);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
