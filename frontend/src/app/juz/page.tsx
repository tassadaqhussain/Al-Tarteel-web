import Link from 'next/link';
import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Browse Quran by Juz (30 Parts)',
  description: 'Read the Holy Quran divided into 30 Juz (parts) with Arabic text, translations, and audio.',
  path: '/juz',
});

export default function JuzIndexPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-ink">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Juz', path: '/juz' },
          ]}
        />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Browse by Juz
        </h1>
        <p className="mt-2 text-sm text-ink-3 sm:text-base">
          Choose any of the 30 parts of the Quran to start reading.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={`/juz/${n}`}
              className="group flex flex-col items-center justify-center rounded-2xl border border-line bg-surface-2/60 px-4 py-5 text-center transition hover:border-[var(--accent)] hover:bg-surface"
            >
              <span className="font-arabic text-2xl font-bold text-ink" dir="rtl" lang="ar">
                الجزء {n}
              </span>
              <span className="mt-1.5 text-sm font-semibold text-ink-2 group-hover:text-[var(--accent)]">
                Juz {n}
              </span>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
