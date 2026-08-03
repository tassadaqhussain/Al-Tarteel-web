import { quranApi } from '@/lib/api';
import { Header } from '@/components/Header';
import { Hero } from '@/components/home/Hero';
import { DailyVerse } from '@/components/home/DailyVerse';
import { QuickAccess } from '@/components/home/QuickAccess';
import { SurahGrid } from '@/components/home/SurahGrid';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function HomePage() {
  const surahs = await quranApi.surahs().catch(() => []);

  return (
    <div className="flex min-h-screen flex-col bg-emerald-950">
      <Header />

      <main className="flex-1 pt-16">
        <Hero />

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-900/50 to-emerald-950" />
          <div className="relative">
            <DailyVerse />
            <QuickAccess />
            <SurahGrid surahs={Array.isArray(surahs) ? surahs : []} />
          </div>
        </div>
      </main>

      <footer className="border-t border-emerald-900/30 bg-emerald-950 py-12">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="mb-6 flex justify-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gold-500 text-emerald-950 flex items-center justify-center font-bold">
              T
            </div>
            <span className="text-xl font-bold text-white">AL-TARTEEL</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2026 Al-Tarteel Quran. All rights reserved. <br />
            Built for guidance and wisdom.
          </p>
        </div>
      </footer>
    </div>
  );
}
