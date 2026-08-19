'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/Header';
import { HifzPracticeSession } from '@/components/hifz/HifzPracticeSession';
import { quranApi, type AyahWithRelations } from '@/lib/api';
import { getSurahMeta, getSurahPath } from '@/lib/surah-meta';

export default function HifzSurahPracticePage() {
  const params = useParams();
  const surahNumber = Number(params?.number);
  const [ayahs, setAyahs] = useState<AyahWithRelations[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const valid = Number.isFinite(surahNumber) && surahNumber >= 1 && surahNumber <= 114;
  const meta = valid ? getSurahMeta(surahNumber) : null;

  useEffect(() => {
    if (!valid) {
      setLoading(false);
      setError('Invalid surah');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    quranApi
      .ayahsBySurah(surahNumber, { limit: 286 })
      .then((rows) => {
        if (!cancelled) setAyahs(rows);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load ayahs. Is the API running?');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [surahNumber, valid]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--fg)]">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/hifz" className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              All hifz surahs
            </Link>
            <h1 className="text-2xl font-bold sm:text-3xl">
              {meta ? `${surahNumber}. ${meta.nameSimple}` : 'Hifz'}
            </h1>
            {meta && (
              <p dir="rtl" lang="ar" className="mt-1 font-arabic text-xl text-[var(--muted)]">
                {meta.nameArabic}
              </p>
            )}
          </div>
          {valid && (
            <Link
              href={getSurahPath(surahNumber)}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium hover:border-[var(--accent)]"
            >
              Open reader
            </Link>
          )}
        </div>

        {loading && <p className="text-sm text-[var(--muted)]">Loading blank surah…</p>}
        {error && (
          <p className="rounded-xl border border-danger/30 bg-danger-surface px-4 py-3 text-sm text-rose-800">
            {error}
          </p>
        )}
        {!loading && !error && ayahs && (
          <HifzPracticeSession
            surahNumber={surahNumber}
            ayahs={ayahs.map((a) => ({
              id: a.id,
              number: a.number,
              textUthmani: a.textUthmani,
            }))}
          />
        )}
      </main>
    </div>
  );
}
