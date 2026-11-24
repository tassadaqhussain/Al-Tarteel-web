import type { Metadata } from 'next';
import { quranApi, type Surah } from '@/lib/api';
import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';
import { SITE_SHELL } from '@/components/layout/MainContainer';
import { SurahGrid } from '@/components/home/SurahGrid';
import { SURAH_ARABIC, SURAH_SIMPLE_NAMES } from '@/lib/surah-meta';
import { getSurahAyahCount } from '@/lib/surah-pagination';
import { buildPageMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { SurahDirectorySections } from '@/components/seo/SurahDirectorySections';
import Link from 'next/link';
import { BookOpen, Headphones, Languages } from 'lucide-react';

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: 'All 114 Surahs – Read Quran Online | QuranPilot',
  description:
    'Browse all 114 surahs of the Holy Quran. Open any chapter to read Arabic Uthmani text with English translation and verse-by-verse audio.',
  path: '/surahs',
  keywords: ['Quran surahs', '114 chapters', 'Quran index', 'list of surahs', 'read Quran online'],
});

function fallbackSurahs(): Surah[] {
  return Array.from({ length: 114 }, (_, i) => {
    const number = i + 1;
    return {
      id: number,
      number,
      nameArabic: SURAH_ARABIC[number] || '',
      nameSimple: SURAH_SIMPLE_NAMES[number] || `Surah ${number}`,
      nameComplex: null,
      revelationPlace: '',
      revelationOrder: null,
      numberOfAyahs: getSurahAyahCount(number),
    };
  });
}

export default async function SurahsPage() {
  const surahs = await quranApi.surahs().catch(() => [] as Surah[]);
  const list = (Array.isArray(surahs) && surahs.length > 0 ? surahs : fallbackSurahs()).map((surah) => ({
    ...surah,
    numberOfAyahs: surah.numberOfAyahs || getSurahAyahCount(surah.number),
  }));

  return (
    <div className="min-h-screen bg-surface-2">
      <Header />
      <main className={`${SITE_SHELL} py-7`}>
        <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Surahs', path: '/surahs' }]} />
        <header className="relative mt-5 overflow-hidden rounded border border-emerald-900/10 bg-surface-2 shadow-sm">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-950 via-emerald-700 to-amber-500" />
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:p-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
                Quran index
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
                All 114 Surahs of the Holy Quran
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-ink-3">
                Open any chapter to read Uthmani Arabic text with translation and verse-by-verse audio.
                Browse by{' '}
                <Link href="/juz/1" className="font-bold text-brand hover:underline">
                  Juz
                </Link>{' '}
                or{' '}
                <Link href="/search" className="font-bold text-brand hover:underline">
                  search the Quran
                </Link>
                . Also browse{' '}
                <Link href="/quran-english-translation" className="font-bold text-brand hover:underline">
                  English
                </Link>
                ,{' '}
                <Link href="/quran-urdu-translation" hrefLang="ur" className="font-bold text-brand hover:underline">
                  Urdu
                </Link>
                , and{' '}
                <Link href="/quran-pashto-translation" hrefLang="ps" className="font-bold text-brand hover:underline">
                  Pashto
                </Link>{' '}
                translation hubs.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:self-end">
              <div className="rounded bg-emerald-950 p-4 text-white shadow-lg shadow-emerald-950/10">
                <BookOpen className="h-5 w-5" aria-hidden />
                <p className="mt-4 text-2xl font-extrabold">114</p>
                <p className="text-xs font-semibold text-emerald-50/80">Surahs</p>
              </div>
              <div className="rounded border border-warning/[0.18] bg-brand-gold/15 p-4 text-ink">
                <Languages className="h-5 w-5 text-warning" aria-hidden />
                <p className="mt-4 text-sm font-extrabold">Meaning</p>
                <p className="text-xs font-semibold text-ink-muted">Translations</p>
              </div>
              <div className="rounded border border-line bg-surface p-4 text-ink">
                <Headphones className="h-5 w-5 text-brand" aria-hidden />
                <p className="mt-4 text-sm font-extrabold">Audio</p>
                <p className="text-xs font-semibold text-ink-muted">Verse by verse</p>
              </div>
            </div>
          </div>
        </header>
        <SurahDirectorySections surahs={list} />
        <SurahGrid surahs={list} embedded sectionTitle="Complete surah list" />

        <section
          aria-labelledby="surahs-guide-heading"
          className="mt-10 rounded-2xl border border-line bg-surface p-6 sm:p-8"
        >
          <h2 id="surahs-guide-heading" className="font-serif text-xl font-bold text-ink sm:text-2xl">
            How the 114 Surahs of the Holy Quran Are Organized
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-ink-2 sm:text-[15px]">
            <p>
              The Holy Quran consists of 114 chapters (surahs) comprising 6,236 verses (ayahs),
              arranged in a fixed order from{' '}
              <Link href="/al-fatihah" className="font-medium text-[var(--accent)] hover:underline">
                Surah Al-Fatihah
              </Link>{' '}
              (The Opener) to{' '}
              <Link href="/an-nas" className="font-medium text-[var(--accent)] hover:underline">
                Surah An-Nas
              </Link>{' '}
              (Mankind). Chapters revealed before the Prophet Muhammad&apos;s ﷺ migration to Madinah
              are classified as Makki surahs and often emphasize monotheism, the Hereafter, and
              steadfastness in faith. Chapters revealed after the migration are Madani surahs and
              frequently address worship, community ethics, family life, and social justice.
            </p>
            <p>
              For daily recitation, the Quran is also divided into 30 roughly equal parts called{' '}
              <Link href="/juz" className="font-medium text-[var(--accent)] hover:underline">
                Juz (paras)
              </Link>
              , making it practical to complete one full reading over a month or follow a steady{' '}
              <Link href="/quran-in-year" className="font-medium text-[var(--accent)] hover:underline">
                Quran in a Year
              </Link>{' '}
              schedule. Beginners often start with{' '}
              <Link href="/al-fatihah" className="font-medium text-[var(--accent)] hover:underline">
                Al-Fatihah
              </Link>
              ,{' '}
              <Link href="/al-ikhlas" className="font-medium text-[var(--accent)] hover:underline">
                Al-Ikhlas
              </Link>
              ,{' '}
              <Link href="/al-falaq" className="font-medium text-[var(--accent)] hover:underline">
                Al-Falaq
              </Link>
              ,{' '}
              <Link href="/an-nas" className="font-medium text-[var(--accent)] hover:underline">
                An-Nas
              </Link>
              , and{' '}
              <Link href="/al-mulk" className="font-medium text-[var(--accent)] hover:underline">
                Al-Mulk
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
