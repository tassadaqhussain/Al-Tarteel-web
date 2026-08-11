import dynamic from 'next/dynamic';
import { quranApi, type Surah } from '@/lib/api';
import { Header } from '@/components/Header';
import { Hero } from '@/components/home/Hero';
import { ContinueReading } from '@/components/home/ContinueReading';
import { SurahGrid } from '@/components/home/SurahGrid';
import { DailyMotivationHome } from '@/components/daily/DailyMotivationHome';
import { SURAH_ARABIC, SURAH_SIMPLE_NAMES } from '@/lib/surah-meta';
import { buildPageMetadata, DEFAULT_DESCRIPTION } from '@/lib/seo';
import { SiteLogo } from '@/components/SiteLogo';
import Link from 'next/link';

const TranslationsPreview = dynamic(
  () => import('@/components/home/TranslationsPreview').then((m) => m.TranslationsPreview),
  {
    loading: () => (
      <div className="mx-auto my-10 h-72 max-w-[1200px] animate-pulse rounded-3xl bg-slate-100 px-4" aria-hidden />
    ),
  }
);
const RecitersSection = dynamic(
  () => import('@/components/home/RecitersSection').then((m) => m.RecitersSection),
  {
    loading: () => (
      <div className="mx-auto my-10 h-64 max-w-[1200px] animate-pulse rounded-3xl bg-slate-100 px-4" aria-hidden />
    ),
  }
);
const StartLearning = dynamic(
  () => import('@/components/home/StartLearning').then((m) => m.StartLearning),
  {
    loading: () => (
      <div className="mx-auto my-10 h-72 max-w-[1200px] animate-pulse rounded-3xl bg-slate-100 px-4" aria-hidden />
    ),
  }
);
const QuranInYear = dynamic(
  () => import('@/components/home/QuranInYear').then((m) => m.QuranInYear),
  {
    loading: () => (
      <div className="mx-auto my-10 h-48 max-w-[1200px] animate-pulse rounded-3xl bg-slate-100 px-4" aria-hidden />
    ),
  }
);
const Community = dynamic(
  () => import('@/components/home/Community').then((m) => m.Community),
  {
    loading: () => (
      <div className="mx-auto my-10 h-40 max-w-[1200px] animate-pulse rounded-3xl bg-slate-100 px-4" aria-hidden />
    ),
  }
);
const QuranApps = dynamic(
  () => import('@/components/home/QuranApps').then((m) => m.QuranApps),
  {
    loading: () => (
      <div className="mx-auto my-10 h-40 max-w-[1200px] animate-pulse rounded-3xl bg-slate-100 px-4" aria-hidden />
    ),
  }
);

export const revalidate = 3600;

export const metadata = buildPageMetadata({
  title: 'QuranPilot – Read Quran Online with Translation & Audio',
  description: DEFAULT_DESCRIPTION,
  path: '/',
  keywords: [
    'read Quran online',
    'Quran with translation',
    'listen to Quran',
    'Quran reader',
    'online mushaf',
  ],
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

export default async function HomePage() {
  const surahs = await quranApi.surahs().catch(() => [] as Surah[]);
  const list = (Array.isArray(surahs) && surahs.length > 0 ? surahs : fallbackSurahs()).map((surah) => ({
    ...surah,
    nameArabic: SURAH_ARABIC[surah.number] || surah.nameArabic,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-[#fcfdfd] text-slate-800">
      <Header />

      <main className="w-full flex-1">
        <Hero />
        <ContinueReading />
        <DailyMotivationHome />
        <SurahGrid surahs={list} />
        <TranslationsPreview surahs={list} />
        <RecitersSection />
        <StartLearning />
        <QuranInYear />
        <Community />
        <QuranApps />
      </main>

      <footer className="w-full border-t border-slate-200 bg-white py-12">
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 font-serif text-xl font-bold text-slate-900">
                <SiteLogo size={24} className="h-6 w-6" alt="QuranPilot logo" />
                <span>QuranPilot</span>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
                QuranPilot is a modern, high-fidelity web application designed to help you read, listen, study, and reflect on the Holy Quran with translations and guidance.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sitemap</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/" className="text-slate-500 hover:text-emerald-800">Home</Link></li>
                <li><Link href="/surahs" className="text-slate-500 hover:text-emerald-800">Chapters</Link></li>
                <li><Link href="/learning-plans" className="text-slate-500 hover:text-emerald-800">Learning Plans</Link></li>
                <li><Link href="/feedback" className="text-slate-500 hover:text-emerald-800">Feedback</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Resources</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/quran-in-year" className="text-slate-500 hover:text-emerald-800">Quran in a Year</Link></li>
                <li><Link href="/search" className="text-slate-500 hover:text-emerald-800">Search</Link></li>
                <li><Link href="/donate" className="text-slate-500 hover:text-emerald-800">Donate</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} QuranPilot. Built for guidance and wisdom. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
