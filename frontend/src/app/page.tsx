import { quranApi, type Surah } from '@/lib/api';
import { Header } from '@/components/Header';
import { Hero } from '@/components/home/Hero';
import { ContinueReading } from '@/components/home/ContinueReading';
import { SurahGrid } from '@/components/home/SurahGrid';
import { TranslationsPreview } from '@/components/home/TranslationsPreview';
import { RecitersSection } from '@/components/home/RecitersSection';
import { StartLearning } from '@/components/home/StartLearning';
import { QuranInYear } from '@/components/home/QuranInYear';
import { Community } from '@/components/home/Community';
import { QuranApps } from '@/components/home/QuranApps';
import { SURAH_ARABIC, SURAH_SIMPLE_NAMES } from '@/lib/surah-meta';
import Link from 'next/link';

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
  const list = (Array.isArray(surahs) && surahs.length > 0 ? surahs : fallbackSurahs()).map((surah) => ({
    ...surah,
    nameArabic: SURAH_ARABIC[surah.number] || surah.nameArabic,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-[#fcfdfd] text-slate-800">
      <Header />

      <main className="w-full flex-1">
        {/* Mockup Landing Page Redesign Sections */}
        <Hero />
        <ContinueReading />
        <SurahGrid surahs={list} />
        <TranslationsPreview surahs={list} />
        <RecitersSection />
        <StartLearning />
        <QuranInYear />
        <Community />
        <QuranApps />
      </main>

      {/* Styled Mockup Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-12">
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 font-serif text-xl font-bold text-slate-900">
                <img src="/images/logo.png" alt="QP Logo" className="h-6 w-6 object-contain" />
                <span>QuranPilot</span>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
                QuranPilot is a modern, high-fidelity web application designed to help you read, listen, study, and reflect on the Holy Quran with translations and guidance.
              </p>
            </div>
            
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sitemap</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/" className="text-slate-500 hover:text-emerald-805">Home</Link></li>
                <li><Link href="/surahs" className="text-slate-500 hover:text-emerald-805">Chapters</Link></li>
                <li><Link href="/learning-plans" className="text-slate-500 hover:text-emerald-805">Learning Plans</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Resources</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/quran-in-year" className="text-slate-500 hover:text-emerald-805">Quran in a Year</Link></li>
                <li><Link href="/settings" className="text-slate-500 hover:text-emerald-805">Settings</Link></li>
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
