'use client';

import { Suspense } from 'react';
import { RequireAdmin } from '@/components/auth/RequireAdmin';
import { AdminShell } from '@/components/admin/AdminShell';

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-ink-3">
          Loading admin…
        </div>
      }
    >
      <RequireAdmin>
        <AdminShell>{children}</AdminShell>
      </RequireAdmin>
    </Suspense>
  );
}
