import type { Metadata } from 'next';
import { quranApi, type Surah } from '@/lib/api';
import { Header } from '@/components/Header';
import { SurahGrid } from '@/components/home/SurahGrid';
import { SURAH_ARABIC, SURAH_SIMPLE_NAMES } from '@/lib/surah-meta';
import { buildPageMetadata } from '@/lib/seo';
import Link from 'next/link';

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: 'All 114 Surahs of the Holy Quran',
  description:
    'Browse and read all 114 surahs (chapters) of the Holy Quran with Arabic Uthmani text, translations, and audio on QuranPilot.',
  path: '/surahs',
  keywords: ['Quran surahs', '114 chapters', 'Quran index', 'list of surahs'],
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
      numberOfAyahs: 0,
    };
  });
}

export default async function SurahsPage() {
  const surahs = await quranApi.surahs().catch(() => [] as Surah[]);
  const list = Array.isArray(surahs) && surahs.length > 0 ? surahs : fallbackSurahs();

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            All 114 Surahs of the Holy Quran
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
            Open any chapter to read Uthmani Arabic text with translation and verse-by-verse audio.
            You can also browse by{' '}
            <Link href="/juz/1" className="font-medium text-emerald-800 hover:underline">
              Juz
            </Link>{' '}
            or{' '}
            <Link href="/search" className="font-medium text-emerald-800 hover:underline">
              search the Quran
            </Link>
            .
          </p>
        </header>
        <SurahGrid surahs={list} />
      </main>
    </div>
  );
}
