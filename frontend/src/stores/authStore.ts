import { create } from 'zustand';
import { ApiError, authApi, type AuthUser } from '@/lib/api';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

type AuthState = {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  setUser: (user: AuthUser | null) => void;
};

function applyUser(user: AuthUser | null): Pick<AuthState, 'user' | 'status' | 'isAuthenticated' | 'isLoading'> {
  return {
    user,
    status: user ? 'authenticated' : 'anonymous',
    isAuthenticated: !!user,
    isLoading: false,
  };
}

let bootstrapped = false;
let bootstrapPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'loading',
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set(applyUser(user)),

  bootstrap: async () => {
    if (bootstrapped) return;
    if (bootstrapPromise) return bootstrapPromise;

    bootstrapPromise = (async () => {
      try {
        const user = await authApi.me();
        set(applyUser(user));
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          try {
            const session = await authApi.refresh();
            set(applyUser(session.user));
          } catch {
            set(applyUser(null));
          }
        } else {
          set(applyUser(null));
        }
      } finally {
        bootstrapped = true;
        bootstrapPromise = null;
      }
    })();

    return bootstrapPromise;
  },

  login: async (email, password) => {
    const session = await authApi.login({ email, password });
    set(applyUser(session.user));
    bootstrapped = true;
    return session.user;
  },

  register: async (input) => {
    const session = await authApi.register(input);
    set(applyUser(session.user));
    bootstrapped = true;
    return session.user;
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      /* still clear local session */
    }
    set(applyUser(null));
    bootstrapped = true;
    // Lazy import avoids circular deps with AuthProvider ↔ bookmarks
    const { useBookmarksStore } = await import('@/stores/bookmarksStore');
    useBookmarksStore.getState().clear();
  },

  refreshUser: async () => {
    try {
      const user = await authApi.me();
      set(applyUser(user));
      return user;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        try {
          const session = await authApi.refresh();
          set(applyUser(session.user));
          return session.user;
        } catch {
          set(applyUser(null));
          return null;
        }
      }
      if (!get().user) set(applyUser(null));
      return get().user;
    }
  },
}));
