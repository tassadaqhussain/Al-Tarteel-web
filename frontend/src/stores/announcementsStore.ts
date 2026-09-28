import { create } from 'zustand';
import { announcementsApi, type Announcement } from '@/lib/api';

type AnnouncementsState = {
  items: Announcement[];
  unread: number;
  status: 'idle' | 'loading' | 'ready' | 'error';
  load: () => Promise<void>;
  markRead: (ids: string[]) => Promise<void>;
  markAllRead: () => Promise<void>;
  reset: () => void;
};

function withRead(items: Announcement[], ids: Set<string> | null) {
  const next = items.map((a) => (ids === null || ids.has(a.id) ? { ...a, read: true } : a));
  return { items: next, unread: next.filter((a) => !a.read).length };
}

/** "What's new" for the signed-in user. Read state is stored server-side. */
export const useAnnouncementsStore = create<AnnouncementsState>((set, get) => ({
  items: [],
  unread: 0,
  status: 'idle',

  load: async () => {
    if (get().status === 'loading') return;
    set({ status: 'loading' });
    try {
      const res = await announcementsApi.list();
      set({ items: res.items, unread: res.unread, status: 'ready' });
    } catch {
      set({ status: 'error' });
    }
  },

  // Optimistic: the badge clears at once; a failed request is retried on next load.
  markRead: async (ids) => {
    const unreadIds = ids.filter((id) => get().items.some((a) => a.id === id && !a.read));
    if (!unreadIds.length) return;
    set(withRead(get().items, new Set(unreadIds)));
    await announcementsApi.markRead(unreadIds).catch(() => undefined);
  },

  markAllRead: async () => {
    if (!get().unread) return;
    set(withRead(get().items, null));
    await announcementsApi.markAllRead().catch(() => undefined);
  },

  reset: () => set({ items: [], unread: 0, status: 'idle' }),
}));
