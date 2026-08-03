import Link from 'next/link';
import { quranApi } from '@/lib/api';
import { Header } from '@/components/Header';

export const revalidate = 3600;

export const metadata = {
  title: 'Surahs',
  description: 'List of all 114 surahs of the Holy Quran.',
};

export default async function SurahsPage() {
  const surahs = await quranApi.surahs().catch(() => []);
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-[var(--fg)]">All Surahs</h1>
        <ul className="grid gap-2 sm:grid-cols-2">
          {Array.isArray(surahs) &&
            surahs.map((s) => (
              <li key={s.number}>
                <Link
                  href={`/surah/${s.number}`}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 transition hover:border-[var(--accent)] hover:bg-[var(--ayah-highlight)]"
                >
                  <span className="font-arabic text-[var(--fg)]">{s.nameArabic}</span>
                  <span className="text-sm text-[var(--muted)]">
                    {s.number}. {s.nameSimple} · {s.numberOfAyahs}
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      </main>
    </div>
  );
}
