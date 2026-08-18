import type { Metadata } from 'next';
import { quranApi, type Surah } from '@/lib/api';
import { Header } from '@/components/Header';
import { SurahGrid } from '@/components/home/SurahGrid';
import { SURAH_ARABIC, SURAH_SIMPLE_NAMES } from '@/lib/surah-meta';
import { buildPageMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
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
      numberOfAyahs: 0,
    };
  });
}

export default async function SurahsPage() {
  const surahs = await quranApi.surahs().catch(() => [] as Surah[]);
  const list = Array.isArray(surahs) && surahs.length > 0 ? surahs : fallbackSurahs();

  return (
    <div className="min-h-screen bg-[#f7f8f7]">
      <Header />
      <main className="mx-auto w-full max-w-[1120px] px-4 py-7 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Surahs', path: '/surahs' }]} />
        <header className="relative mt-5 overflow-hidden rounded border border-emerald-900/10 bg-[#fbfcfa] shadow-sm">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-950 via-emerald-700 to-amber-500" />
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:p-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
                Quran index
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                All 114 Surahs of the Holy Quran
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                Open any chapter to read Uthmani Arabic text with translation and verse-by-verse audio.
                Browse by{' '}
                <Link href="/juz/1" className="font-bold text-emerald-800 hover:underline">
                  Juz
                </Link>{' '}
                or{' '}
                <Link href="/search" className="font-bold text-emerald-800 hover:underline">
                  search the Quran
                </Link>
                .
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:self-end">
              <div className="rounded bg-emerald-950 p-4 text-white shadow-lg shadow-emerald-950/10">
                <BookOpen className="h-5 w-5" aria-hidden />
                <p className="mt-4 text-2xl font-extrabold">114</p>
                <p className="text-xs font-semibold text-emerald-50/80">Surahs</p>
              </div>
              <div className="rounded border border-amber-200/60 bg-[#f7f0e2] p-4 text-slate-900">
                <Languages className="h-5 w-5 text-amber-700" aria-hidden />
                <p className="mt-4 text-sm font-extrabold">Meaning</p>
                <p className="text-xs font-semibold text-slate-500">Translations</p>
              </div>
              <div className="rounded border border-slate-200 bg-white p-4 text-slate-900">
                <Headphones className="h-5 w-5 text-emerald-800" aria-hidden />
                <p className="mt-4 text-sm font-extrabold">Audio</p>
                <p className="text-xs font-semibold text-slate-500">Verse by verse</p>
              </div>
            </div>
          </div>
        </header>
        <SurahGrid surahs={list} embedded />
      </main>
    </div>
  );
}
