'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bookmark, Check, Clock, StickyNote } from 'lucide-react';
import { Header } from '@/components/Header';
import { useBookmarksStore } from '@/stores/bookmarksStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { getSurahArabicName, getSurahMeta } from '@/lib/surah-meta';
import { cn } from '@/lib/utils';

type Tab = 'saved' | 'recent' | 'notes';

export default function MyQuranPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('saved');
  const bookmarks = useBookmarksStore((s) => s.bookmarks);
  const lastRead = useSettingsStore((s) => s.lastRead);
  const recentSurahs = useSettingsStore((s) => s.recentSurahs);
  const readingGoal = useSettingsStore((s) => s.readingGoal);

  const notes = useMemo(
    () => bookmarks.filter((b) => b.note.trim().length > 0),
    [bookmarks]
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f7] text-slate-800">
      <Header />

      {/* Title band */}
      <div className="relative overflow-hidden border-b border-slate-100 bg-[#f7f7f7]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 40%, rgba(44,164,171,0.35), transparent 40%), radial-gradient(circle at 80% 20%, rgba(15,23,42,0.08), transparent 35%)',
          }}
        />
        <div className="relative mx-auto flex max-w-4xl items-center gap-3 px-4 py-8 sm:px-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-white hover:text-slate-900"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">My Quran</h1>
        </div>
      </div>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        {/* Tabs */}
        <div className="mx-auto mb-10 flex max-w-md justify-center">
          <div className="inline-flex w-full rounded-full bg-slate-100 p-1 sm:w-auto">
            {(
              [
                ['saved', 'Saved'],
                ['recent', 'Recent'],
                ['notes', 'Notes & Reflections'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  'flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition sm:flex-none sm:px-5',
                  tab === id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'saved' && (
          <div className="space-y-10">
            {/* Reading bookmark */}
            <section>
              <h2 className="mb-4 text-xl font-bold text-slate-900">My Reading Bookmark</h2>
              {lastRead ? (
                <Link
                  href={`/surah/${lastRead.surahNumber}`}
                  className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-5 transition hover:border-[var(--accent)]"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                      Continue reading
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {lastRead.surahNumber}. {lastRead.surahName}
                    </p>
                    <p className="text-sm text-slate-500">Verse {lastRead.ayahNumber}</p>
                  </div>
                  <span className="font-arabic text-3xl text-slate-700" dir="rtl" lang="ar">
                    {getSurahArabicName(lastRead.surahNumber, lastRead.surahNameArabic)}
                  </span>
                </Link>
              ) : (
                <p className="py-10 text-center text-slate-400">
                  Start reading and save a Reading Bookmark!
                </p>
              )}
            </section>

            {/* Saved bookmarks list */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Saved Verses</h2>
                {bookmarks.length > 0 && (
                  <Link href="/bookmarks" className="text-sm font-medium text-[var(--accent)] hover:underline">
                    Manage all
                  </Link>
                )}
              </div>
              {bookmarks.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-slate-400">
                  No saved verses yet. Bookmark ayahs while reading.
                </p>
              ) : (
                <div className="space-y-3">
                  {bookmarks.slice(0, 8).map((b) => (
                    <Link
                      key={b.id}
                      href={`/surah/${b.surahNumber}`}
                      className="block rounded-2xl border border-slate-200 px-5 py-4 transition hover:border-[var(--accent)]"
                    >
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
                        <Bookmark className="h-4 w-4" />
                        {b.surahName} {b.surahNumber}:{b.ayahNumber}
                      </div>
                      <p className="font-arabic text-xl leading-loose text-slate-800" dir="rtl" lang="ar">
                        {b.textUthmani}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Collections */}
            <section>
              <h2 className="mb-4 text-xl font-bold text-slate-900">Collections</h2>
              <div className="rounded-2xl border border-slate-200 px-6 py-6">
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={3} />
                    Create custom collections
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={3} />
                    Compare and contrast verses
                  </li>
                </ul>
                {readingGoal && (
                  <p className="mt-4 text-sm text-slate-500">
                    Active goal:{' '}
                    <Link href="/reading-goal" className="font-medium text-[var(--accent)] hover:underline">
                      {readingGoal.title}
                    </Link>
                  </p>
                )}
                <Link
                  href="/settings"
                  className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent)]/90"
                >
                  Sign in
                </Link>
              </div>
            </section>
          </div>
        )}

        {tab === 'recent' && (
          <section>
            <h2 className="mb-4 text-xl font-bold text-slate-900">Recently Read</h2>
            {recentSurahs.length === 0 && !lastRead ? (
              <p className="py-10 text-center text-slate-400">
                Your recent surahs will appear here as you read.
              </p>
            ) : (
              <div className="space-y-2">
                {(recentSurahs.length
                  ? recentSurahs
                  : lastRead
                    ? [lastRead.surahNumber]
                    : []
                ).map((n) => {
                  const meta = getSurahMeta(n);
                  return (
                    <Link
                      key={n}
                      href={`/surah/${n}`}
                      className="flex items-center gap-4 rounded-2xl border border-slate-200 px-4 py-4 transition hover:border-[var(--accent)]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900">
                          {n}. {meta.nameSimple}
                        </p>
                        <p className="text-xs text-slate-500">{meta.meaning}</p>
                      </div>
                      <span className="font-arabic text-xl text-slate-600" dir="rtl">
                        {meta.nameArabic}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {tab === 'notes' && (
          <section>
            <h2 className="mb-4 text-xl font-bold text-slate-900">Notes & Reflections</h2>
            {notes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center">
                <StickyNote className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                <p className="text-slate-400">No notes yet.</p>
                <p className="mt-1 text-sm text-slate-400">
                  Add reflections when you bookmark a verse.
                </p>
                <Link
                  href="/bookmarks"
                  className="mt-5 inline-flex text-sm font-medium text-[var(--accent)] hover:underline"
                >
                  Open bookmarks
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((b) => (
                  <Link
                    key={b.id}
                    href={`/surah/${b.surahNumber}`}
                    className="block rounded-2xl border border-slate-200 px-5 py-4 transition hover:border-[var(--accent)]"
                  >
                    <p className="text-sm font-medium text-[var(--accent)]">
                      {b.surahName} {b.surahNumber}:{b.ayahNumber}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{b.note}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
