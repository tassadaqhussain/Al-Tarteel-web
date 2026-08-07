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

      isBookmarked: (ayahId) => get().bookmarks.some((b) => b.ayahId === ayahId),
      get: (ayahId) => get().bookmarks.find((b) => b.ayahId === ayahId),
    }),
    { name: 'al-tarteel-bookmarks' }
  )
);
