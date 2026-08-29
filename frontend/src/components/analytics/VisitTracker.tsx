'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { apiBase } from '@/lib/api';

/** Fire-and-forget page view for the admin visitor counts. */
export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname === '/admin' || pathname.startsWith('/admin/')) return;
    const url = `${apiBase()}/analytics/visit`;
    const body = JSON.stringify({ path: pathname });
    try {
      void fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
        credentials: 'omit',
      });
    } catch {
      /* ignore */
    }
  }, [pathname]);

  return null;
}
