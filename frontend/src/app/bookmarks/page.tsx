'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  BookmarkX,
  ExternalLink,
  StickyNote,
  Check,
  Trash2,
  ChevronLeft,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { useBookmarksStore, type BookmarkColor } from '@/stores/bookmarksStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const COLOR_MAP: Record<BookmarkColor, { dot: string; ring: string; label: string }> = {
  gold:   { dot: 'bg-gold-500',    ring: 'ring-gold-500/50',    label: 'Gold' },
  green:  { dot: 'bg-emerald-500', ring: 'ring-emerald-500/50', label: 'Green' },
  blue:   { dot: 'bg-blue-400',    ring: 'ring-blue-400/50',    label: 'Blue' },
  red:    { dot: 'bg-red-400',     ring: 'ring-red-400/50',     label: 'Red' },
  purple: { dot: 'bg-purple-400',  ring: 'ring-purple-400/50',  label: 'Purple' },
};
const COLORS = Object.keys(COLOR_MAP) as BookmarkColor[];

function formatDate(ts: number) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(ts));
}

export default function BookmarksPage() {
  const { bookmarks, remove, updateNote, updateColor } = useBookmarksStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const startEdit = (id: string, currentNote: string) => {
    setEditingId(id);
    setNoteText(currentNote);
  };

  const saveNote = (ayahId: number) => {
    updateNote(ayahId, noteText);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-16">
      <Header />

      <div className="sticky top-[57px] z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link href="/my-quran" className="flex items-center gap-1 text-sm text-[var(--accent)] transition-colors hover:text-[var(--accent)]">
            <ChevronLeft className="h-4 w-4" />
            My Quran
          </Link>
          <h1 className="text-sm font-semibold text-slate-800">
            Bookmarks {bookmarks.length > 0 && <span className="ml-1 text-slate-400">({bookmarks.length})</span>}
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Empty state */}
        {bookmarks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <Bookmark className="h-8 w-8 text-[var(--border)]" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-[var(--fg)]">No bookmarks yet</h2>
            <p className="mb-6 max-w-sm text-sm text-[var(--muted)]">
              Tap the bookmark icon on any verse while reading to save it here.
            </p>
            <Button asChild>
              <Link href="/surahs">Browse Surahs</Link>
            </Button>
          </div>
        )}

        {/* Bookmark list */}
        <div className="space-y-4">
          {bookmarks.map((bm) => {
            const color = COLOR_MAP[bm.color];
            const isEditing = editingId === bm.id;

            return (
              <div
                key={bm.id}
                className={cn(
                  'group relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all',
                  'hover:border-[var(--accent)]/30'
                )}
              >
                {/* Color indicator */}
                <div className={cn('absolute left-0 top-4 bottom-4 w-1 rounded-full', color.dot)} />

                <div className="pl-4">
                  {/* Header row */}
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                        {bm.surahName}
                      </span>
                      <span className="rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">
                        {bm.ayahNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {/* Color picker */}
                      <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-2 py-1">
                        {COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => updateColor(bm.ayahId, c)}
                            title={COLOR_MAP[c].label}
                            className={cn(
                              'h-4 w-4 rounded-full transition-all',
                              COLOR_MAP[c].dot,
                              bm.color === c && `ring-2 ring-offset-1 ${COLOR_MAP[c].ring}`
                            )}
                            aria-label={`Color: ${COLOR_MAP[c].label}`}
                          />
                        ))}
                      </div>

                      {/* Note */}
                      <button
                        type="button"
                        onClick={() => startEdit(bm.id, bm.note)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--ayah-highlight)] hover:text-[var(--fg)] transition-colors"
                        aria-label="Edit note"
                      >
                        <StickyNote className="h-3.5 w-3.5" />
                      </button>

                      {/* Open verse */}
                      <Link
                        href={`/surah/${bm.surahNumber}#ayah-${bm.ayahId}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--ayah-highlight)] hover:text-[var(--fg)] transition-colors"
                        aria-label="Open verse"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>

                      {/* Delete */}
                      {confirmDelete === bm.ayahId ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => { remove(bm.ayahId); setConfirmDelete(null); }}
                            className="flex h-7 items-center gap-1 rounded-lg bg-red-500/10 px-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(null)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--ayah-highlight)] transition-colors"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(bm.ayahId)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          aria-label="Remove bookmark"
                        >
                          <BookmarkX className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Arabic text */}
                  <p className="font-arabic ayah-arabic text-xl leading-loose text-[var(--fg)]">
                    {bm.textUthmani}
                  </p>

                  {/* Translation */}
                  {bm.translation && (
                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{bm.translation}</p>
                  )}

                  {/* Note editor */}
                  {isEditing ? (
                    <div className="mt-3">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add a note..."
                        rows={3}
                        className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
                        autoFocus
                      />
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" onClick={() => saveNote(bm.ayahId)}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : bm.note ? (
                    <div
                      className="mt-3 cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--muted)]"
                      onClick={() => startEdit(bm.id, bm.note)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && startEdit(bm.id, bm.note)}
                    >
                      {bm.note}
                    </div>
                  ) : null}

                  {/* Footer */}
                  <p className="mt-3 text-[10px] text-[var(--muted)]">
                    Saved {formatDate(bm.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
