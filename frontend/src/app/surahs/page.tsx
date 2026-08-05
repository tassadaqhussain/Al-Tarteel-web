import { quranApi, type Surah } from '@/lib/api';
import { Header } from '@/components/Header';
import { SurahGrid } from '@/components/home/SurahGrid';
import { SURAH_ARABIC, SURAH_SIMPLE_NAMES } from '@/lib/surah-meta';

export const revalidate = 3600;

export const metadata = {
  title: 'Surahs',
  description: 'List of all 114 surahs of the Holy Quran.',
};

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
      <main className="w-full px-3 py-6 sm:px-4 sm:py-8 md:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">All Surahs</h1>
          <p className="mt-1 text-sm text-slate-500">Explore all 114 chapters of the Holy Quran</p>
        </div>

        <SurahGrid surahs={list} />
      </main>
    </div>
  );
}
