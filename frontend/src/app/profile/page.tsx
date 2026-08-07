'use client';

import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuthStore } from '@/stores/authStore';
import { authApi, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

function ProfileContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setSubmitting(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setMessage('Password updated. Please sign in again.');
      await logout();
      router.replace('/login');
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Unable to change password.');
    } finally {
      setSubmitting(false);
    }
  };

  const initials = (user?.name || user?.email || 'U')
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-16">
      <Header />
      <main className="mx-auto max-w-lg px-4 py-10">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-lg font-bold text-white">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{user?.name || 'Account'}</h1>
            <p className="text-sm text-slate-600">{user?.email}</p>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Change password</h2>
          <form onSubmit={onChangePassword} className="mt-4 space-y-3">
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            />
            <input
              type="password"
              required
              autoComplete="new-password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            />
            {message && <p className="text-sm text-emerald-700">{message}</p>}
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className={cn(
                'inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white',
                submitting && 'opacity-70',
              )}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Update password
            </button>
          </form>
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/bookmarks" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium hover:border-[var(--accent)]">
            Bookmarks
          </Link>
          <Link href="/my-quran" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium hover:border-[var(--accent)]">
            My Quran
          </Link>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push('/');
            }}
            className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Log out
          </button>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading…</div>}>
      <RequireAuth>
        <ProfileContent />
      </RequireAuth>
    </Suspense>
  );
}
