import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BookmarkColor = 'gold' | 'green' | 'blue' | 'red' | 'purple';

export interface BookmarkItem {
  id: string; // `${ayahId}`
  ayahId: number;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  textUthmani: string;
  translation?: string;
  note: string;
  color: BookmarkColor;
  createdAt: number;
}

export interface BookmarksState {
  bookmarks: BookmarkItem[];
  add: (item: Omit<BookmarkItem, 'id' | 'createdAt'> & { createdAt?: number }) => void;
  remove: (ayahId: number) => void;
  updateNote: (ayahId: number, note: string) => void;
  updateColor: (ayahId: number, color: BookmarkColor) => void;
  clear: () => void;
  replaceFromServer: (
    items: Array<Omit<BookmarkItem, 'id'> & { id?: string }>,
  ) => void;
  /**
   * Fold server bookmarks into the local list without losing either side, and
   * return the bookmarks that exist only locally so the caller can upload them.
   *
   * Signing in must never discard work done while signed out, so this is a
   * union by ayahId rather than a replace:
   *  - on the server only  -> added locally
   *  - locally only        -> kept, and returned for upload
   *  - on both sides       -> server row wins for Quran fields, but colour is
   *                           local-only (the server has no such column) and a
   *                           note is taken from whichever side actually has
   *                           one, preferring the server. createdAt keeps the
   *                           earlier timestamp, since that is when the
   *                           bookmark really started.
   */
  mergeFromServer: (
    items: Array<Omit<BookmarkItem, 'id'> & { id?: string }>,
  ) => BookmarkItem[];
  isBookmarked: (ayahId: number) => boolean;
  get: (ayahId: number) => BookmarkItem | undefined;
}

export const useBookmarksStore = create<BookmarksState>()(
  persist(
    (set, get) => ({
      bookmarks: [],

      add: (item) => {
        const exists = get().bookmarks.some((b) => b.ayahId === item.ayahId);
        if (exists) return;
        set((s) => ({
          bookmarks: [
            {
              ...item,
              id: String(item.ayahId),
              createdAt: item.createdAt ?? Date.now(),
            },
            ...s.bookmarks,
          ],
        }));
      },

      remove: (ayahId) =>
        set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.ayahId !== ayahId) })),

      updateNote: (ayahId, note) =>
        set((s) => ({
          bookmarks: s.bookmarks.map((b) =>
            b.ayahId === ayahId ? { ...b, note } : b
          ),
        })),

      updateColor: (ayahId, color) =>
        set((s) => ({
          bookmarks: s.bookmarks.map((b) =>
            b.ayahId === ayahId ? { ...b, color } : b
          ),
        })),

      clear: () => set({ bookmarks: [] }),

      replaceFromServer: (items) =>
        set({
          bookmarks: items.map((item) => ({
            ...item,
            id: item.id ?? String(item.ayahId),
            color: item.color ?? 'gold',
            note: item.note ?? '',
          })),
        }),

      mergeFromServer: (items) => {
        const incoming = new Map(items.map((i) => [i.ayahId, i]));
        const localList = get().bookmarks;
        const localByAyah = new Map(localList.map((b) => [b.ayahId, b]));

        const merged: BookmarkItem[] = [];
        for (const [ayahId, item] of incoming) {
          const local = localByAyah.get(ayahId);
          const serverNote = (item.note ?? '').trim();
          merged.push({
            ...item,
            id: item.id ?? String(ayahId),
            color: local?.color ?? item.color ?? 'gold',
            note: serverNote || local?.note || '',
            createdAt: Math.min(
              item.createdAt ?? Date.now(),
              local?.createdAt ?? Number.POSITIVE_INFINITY,
            ),
          });
        }

        const localOnly = localList.filter((b) => !incoming.has(b.ayahId));
        set({
          bookmarks: [...merged, ...localOnly].sort((a, b) => b.createdAt - a.createdAt),
        });
        return localOnly;
      },

      isBookmarked: (ayahId) => get().bookmarks.some((b) => b.ayahId === ayahId),
      get: (ayahId) => get().bookmarks.find((b) => b.ayahId === ayahId),
    }),
    { name: 'al-tarteel-bookmarks' }
  )
);
