'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bookmark, Check, Clock, StickyNote } from 'lucide-react';
import { Header } from '@/components/Header';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useBookmarksStore } from '@/stores/bookmarksStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { getSurahArabicName, getSurahMeta, getSurahPath } from '@/lib/surah-meta';
import { loginHref } from '@/lib/auth-redirect';
import { cn } from '@/lib/utils';
import { TajweedJourneyPanel } from '@/components/tajweed/TajweedJourneyPanel';
import { DailyMotivation } from '@/components/daily/DailyMotivation';

type Tab = 'saved' | 'recent' | 'notes';

function MyQuranContent() {
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
    <div className="flex min-h-screen flex-col bg-surface-app text-ink">
      <Header />

      {/* Title band */}
      <div className="relative overflow-hidden border-b border-line-subtle bg-surface-app">
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
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-3 transition hover:bg-surface hover:text-ink"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">My Quran</h1>
        </div>
      </div>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        {/* Tabs */}
        <div className="mx-auto mb-10 flex max-w-md justify-center">
          <div className="inline-flex w-full rounded-full bg-surface-3 p-1 sm:w-auto">
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
                    ? 'bg-surface text-ink shadow-sm'
                    : 'text-ink-muted hover:text-ink-2'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'saved' && (
          <div className="space-y-10">
            <section>
              <h2 className="mb-4 text-xl font-bold text-ink">Assalamu Alaikum</h2>
              <DailyMotivation variant="full" showGoalPicker showAyahOfDay showTajweedOfDay />
            </section>

            <section>
              <h2 className="mb-4 text-xl font-bold text-ink">Tajweed Journey</h2>
              <TajweedJourneyPanel showPersonal />
            </section>

            {/* Reading bookmark */}
            <section>
              <h2 className="mb-4 text-xl font-bold text-ink">My Reading Bookmark</h2>
              {lastRead ? (
                <Link
                  href={getSurahPath(lastRead.surahNumber)}
                  className="group flex items-center justify-between rounded-2xl border border-line bg-surface px-5 py-5 transition hover:border-[var(--accent)]"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                      Continue reading
                    </p>
                    <p className="mt-1 text-lg font-semibold text-ink">
                      {lastRead.surahNumber}. {lastRead.surahName}
                    </p>
                    <p className="text-sm text-ink-muted">Verse {lastRead.ayahNumber}</p>
                  </div>
                  <span className="font-arabic text-3xl text-ink-2" dir="rtl" lang="ar">
                    {getSurahArabicName(lastRead.surahNumber, lastRead.surahNameArabic)}
                  </span>
                </Link>
              ) : (
                <p className="py-10 text-center text-ink-faint">
                  Start reading and save a Reading Bookmark!
                </p>
              )}
            </section>

            {/* Saved bookmarks list */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-ink">Saved Verses</h2>
                {bookmarks.length > 0 && (
                  <Link href="/bookmarks" className="text-sm font-medium text-[var(--accent)] hover:underline">
                    Manage all
                  </Link>
                )}
              </div>
              {bookmarks.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-line py-10 text-center text-ink-faint">
                  No saved verses yet. Bookmark ayahs while reading.
                </p>
              ) : (
                <div className="space-y-3">
                  {bookmarks.slice(0, 8).map((b) => (
                    <Link
                      key={b.id}
                      href={getSurahPath(b.surahNumber)}
                      className="block rounded-2xl border border-line px-5 py-4 transition hover:border-[var(--accent)]"
                    >
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
                        <Bookmark className="h-4 w-4" />
                        {b.surahName} {b.surahNumber}:{b.ayahNumber}
                      </div>
                      <p className="font-arabic text-xl leading-loose text-ink" dir="rtl" lang="ar">
                        {b.textUthmani}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Collections */}
            <section>
              <h2 className="mb-4 text-xl font-bold text-ink">Collections</h2>
              <div className="rounded-2xl border border-line px-6 py-6">
                <ul className="space-y-3 text-sm text-ink-2">
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={3} />
                    Create custom collections
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={3} />
                    Compare and contrast verses
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={3} />
                    <Link href="/hifz" className="font-medium text-[var(--accent)] hover:underline">
                      Practice hifz with blank ayahs
                    </Link>
                  </li>
                </ul>
                {readingGoal && (
                  <p className="mt-4 text-sm text-ink-muted">
                    Active goal:{' '}
                    <Link href="/reading-goal" className="font-medium text-[var(--accent)] hover:underline">
                      {readingGoal.title}
                    </Link>
                  </p>
                )}
                <Link
                  href={loginHref('/my-quran')}
                  className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-brand-contrast transition hover:bg-[var(--accent)]/90"
                >
                  Sign in
                </Link>
              </div>
            </section>
          </div>
        )}

        {tab === 'recent' && (
          <section>
            <h2 className="mb-4 text-xl font-bold text-ink">Recently Read</h2>
            {recentSurahs.length === 0 && !lastRead ? (
              <p className="py-10 text-center text-ink-faint">
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
                      href={getSurahPath(n)}
                      className="flex items-center gap-4 rounded-2xl border border-line px-4 py-4 transition hover:border-[var(--accent)]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-ink-muted">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink">
                          {n}. {meta.nameSimple}
                        </p>
                        <p className="text-xs text-ink-muted">{meta.meaning}</p>
                      </div>
                      <span className="font-arabic text-xl text-ink-3" dir="rtl">
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
            <h2 className="mb-4 text-xl font-bold text-ink">Notes & Reflections</h2>
            {notes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line px-6 py-12 text-center">
                <StickyNote className="mx-auto mb-3 h-8 w-8 text-ink-faint" />
                <p className="text-ink-faint">No notes yet.</p>
                <p className="mt-1 text-sm text-ink-faint">
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
                    href={getSurahPath(b.surahNumber)}
                    className="block rounded-2xl border border-line px-5 py-4 transition hover:border-[var(--accent)]"
                  >
                    <p className="text-sm font-medium text-[var(--accent)]">
                      {b.surahName} {b.surahNumber}:{b.ayahNumber}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-2">{b.note}</p>
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

export default function MyQuranPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-ink-muted">Loading…</div>}>
      <RequireAuth>
        <MyQuranContent />
      </RequireAuth>
    </Suspense>
  );
}
