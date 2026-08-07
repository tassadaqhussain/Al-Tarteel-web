'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { loginHref } from '@/lib/auth-redirect';
import { useBookmarksStore } from '@/stores/bookmarksStore';
import { usersApi } from '@/lib/api';

type PendingAction = {
  key: string;
  run: () => void | Promise<void>;
};

let pendingAction: PendingAction | null = null;

export function setPendingAuthAction(action: PendingAction | null) {
  pendingAction = action;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const status = useAuthStore((s) => s.status);
  const syncedForUser = useRef<number | null>(null);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  // After login, pull server bookmarks into local store for reader UX.
  useEffect(() => {
    if (status !== 'authenticated' || !isAuthenticated) {
      syncedForUser.current = null;
      return;
    }
    const userId = useAuthStore.getState().user?.id;
    if (!userId || syncedForUser.current === userId) return;
    syncedForUser.current = userId;

    void (async () => {
      try {
        const remote = await usersApi.bookmarks();
        useBookmarksStore.getState().replaceFromServer(
          remote.map((b) => ({
            ayahId: b.ayahId,
            surahNumber: b.surah.number,
            surahName: b.surah.nameSimple,
            ayahNumber: b.ayah.number,
            textUthmani: b.ayah.textUthmani,
            note: b.note ?? '',
            color: 'gold' as const,
            createdAt: new Date(b.createdAt).getTime(),
          })),
        );
      } catch {
        /* keep local until retry */
      }

      const pending = pendingAction;
      pendingAction = null;
      if (pending) {
        try {
          await pending.run();
        } catch {
          /* action may retry via UI */
        }
      }
    })();
  }, [isAuthenticated, status]);

  useEffect(() => {
    if (status === 'anonymous') {
      pendingAction = null;
    }
  }, [status]);

  return <>{children}</>;
}

/**
 * Gate personalized actions on public pages.
 * Logged-in → runs action.
 * Logged-out → saves pending action + redirects to login with returnUrl.
 */
export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  return useCallback(
    (action: () => void | Promise<void>, opts?: { key?: string; returnUrl?: string }) => {
      if (isLoading) return false;
      if (isAuthenticated) {
        void action();
        return true;
      }
      setPendingAuthAction({
        key: opts?.key ?? 'action',
        run: action,
      });
      const returnUrl = opts?.returnUrl ?? `${pathname}${typeof window !== 'undefined' ? window.location.search : ''}`;
      router.push(loginHref(returnUrl));
      return false;
    },
    [isAuthenticated, isLoading, pathname, router],
  );
}
