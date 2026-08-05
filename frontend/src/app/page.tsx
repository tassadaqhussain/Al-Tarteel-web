import { quranApi, type Surah } from '@/lib/api';
import { Header } from '@/components/Header';
import { ContinueReading } from '@/components/home/ContinueReading';
import { ExploreTopics } from '@/components/home/ExploreTopics';
import { StartLearning } from '@/components/home/StartLearning';
import { VerseOfTheDay } from '@/components/home/VerseOfTheDay';
import { VerseOfTheWeek } from '@/components/home/VerseOfTheWeek';
import { QuranInYear } from '@/components/home/QuranInYear';
import { SurahGrid } from '@/components/home/SurahGrid';
import { Community } from '@/components/home/Community';
import { QuranApps } from '@/components/home/QuranApps';
import { SURAH_ARABIC, SURAH_SIMPLE_NAMES } from '@/lib/surah-meta';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

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

export default async function HomePage() {
  const surahs = await quranApi.surahs().catch(() => [] as Surah[]);
  const list = Array.isArray(surahs) && surahs.length > 0 ? surahs : fallbackSurahs();

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f7] text-slate-800">
      <Header />

      <main className="w-full flex-1">
        <ContinueReading />
        <ExploreTopics />
        <StartLearning />
        <VerseOfTheDay />
        <VerseOfTheWeek />
        <QuranInYear />
        <SurahGrid surahs={list} />
        <Community />
        <QuranApps />
      </main>

      <footer className="w-full border-t border-slate-200 bg-white py-6">
        <div className="w-full px-3 text-center sm:px-4 md:px-6">
          <p className="font-serif text-lg font-bold text-slate-800">QuranPilot</p>
          <p className="mt-1 text-sm text-slate-500">
            © {new Date().getFullYear()} QuranPilot. Built for guidance and wisdom.
          </p>
        </div>
      </footer>
    </div>
  );
}
