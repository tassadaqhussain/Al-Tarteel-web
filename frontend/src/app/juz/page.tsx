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
          Browse the Holy Quran by Juz (30 Parts)
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-ink-3 sm:text-base">
          The Holy Quran is divided into 30 roughly equal sections called Juz (plural: Ajza, also
          known as Paras in South Asia) so readers can complete one full reading over a month or
          follow a steady daily schedule. Select any Juz below to read with Uthmani Arabic text,
          translation, and verse-by-verse audio, or{' '}
          <Link href="/surahs" className="font-semibold text-[var(--accent)] hover:underline">
            browse all 114 surahs
          </Link>
          .
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

        <section className="mt-10 rounded-2xl border border-line bg-surface-2/40 p-6">
          <h2 className="text-lg font-bold text-ink">How Juz Divisions Help Daily Recitation</h2>
          <p className="mt-2 text-sm leading-7 text-ink-2">
            Unlike surahs—which vary in length from 3 verses to 286 verses—each Juz is roughly
            equal in length, making it practical to read one Juz per day during Ramadan or one
            quarter (Rub&apos;) at a time. Popular starting points include{' '}
            <Link href="/juz/1" className="font-medium text-[var(--accent)] hover:underline">
              Juz 1
            </Link>{' '}
            (Al-Fatihah and Al-Baqarah),{' '}
            <Link href="/juz/29" className="font-medium text-[var(--accent)] hover:underline">
              Juz 29 (Juz Tabarak)
            </Link>{' '}
            beginning with Surah Al-Mulk, and{' '}
            <Link href="/juz/30" className="font-medium text-[var(--accent)] hover:underline">
              Juz 30 (Juz Amma)
            </Link>{' '}
            containing the short closing chapters. You can also follow the{' '}
            <Link href="/quran-in-year" className="font-medium text-[var(--accent)] hover:underline">
              Quran in a Year
            </Link>{' '}
            reading guide.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
