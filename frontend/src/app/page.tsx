import dynamic from 'next/dynamic';
import { quranApi, type Surah } from '@/lib/api';
import { Header } from '@/components/Header';
import { Hero } from '@/components/home/Hero';
import { ContinueReading } from '@/components/home/ContinueReading';
import { SurahGrid } from '@/components/home/SurahGrid';
import { DailyMotivationHome } from '@/components/daily/DailyMotivationHome';
import { SURAH_ARABIC, SURAH_SIMPLE_NAMES } from '@/lib/surah-meta';
import { buildPageMetadata, DEFAULT_DESCRIPTION } from '@/lib/seo';
import { SiteFooter } from '@/components/SiteFooter';
import { DEFAULT_TRANSLATION } from '@/lib/translation-preference';
import {
  normalizeAyahList,
  PREVIEW_FETCH_LIMIT,
  PREVIEW_SURAH_NUMBER,
} from '@/lib/quran/ayah-preview';

const TranslationsPreview = dynamic(
  () => import('@/components/home/TranslationsPreview').then((m) => m.TranslationsPreview),
  {
    loading: () => (
      <div className="mx-auto my-10 h-72 w-full max-w-[1120px] animate-pulse rounded-3xl bg-surface-3 px-4 xl:max-w-[1180px]" aria-hidden />
    ),
  }
);
const RecitersSection = dynamic(
  () => import('@/components/home/RecitersSection').then((m) => m.RecitersSection),
  {
    loading: () => (
      <div className="mx-auto my-10 h-64 w-full max-w-[1120px] animate-pulse rounded-3xl bg-surface-3 px-4 xl:max-w-[1180px]" aria-hidden />
    ),
  }
);
const StartLearning = dynamic(
  () => import('@/components/home/StartLearning').then((m) => m.StartLearning),
  {
    loading: () => (
      <div className="mx-auto my-10 h-72 w-full max-w-[1120px] animate-pulse rounded-3xl bg-surface-3 px-4 xl:max-w-[1180px]" aria-hidden />
    ),
  }
);
const QuranInYear = dynamic(
  () => import('@/components/home/QuranInYear').then((m) => m.QuranInYear),
  {
    loading: () => (
      <div className="mx-auto my-10 h-48 w-full max-w-[1120px] animate-pulse rounded-3xl bg-surface-3 px-4 xl:max-w-[1180px]" aria-hidden />
    ),
  }
);
const Community = dynamic(
  () => import('@/components/home/Community').then((m) => m.Community),
  {
    loading: () => (
      <div className="mx-auto my-10 h-40 w-full max-w-[1120px] animate-pulse rounded-3xl bg-surface-3 px-4 xl:max-w-[1180px]" aria-hidden />
    ),
  }
);
const QuranApps = dynamic(
  () => import('@/components/home/QuranApps').then((m) => m.QuranApps),
  {
    loading: () => (
      <div className="mx-auto my-10 h-40 w-full max-w-[1120px] animate-pulse rounded-3xl bg-surface-3 px-4 xl:max-w-[1180px]" aria-hidden />
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
  const [surahs, previewRows] = await Promise.all([
    quranApi.surahs().catch(() => [] as Surah[]),
    quranApi
      .ayahsBySurah(PREVIEW_SURAH_NUMBER, {
        translations: DEFAULT_TRANSLATION,
        limit: PREVIEW_FETCH_LIMIT,
      })
      .catch(() => []),
  ]);
  const list = (Array.isArray(surahs) && surahs.length > 0 ? surahs : fallbackSurahs()).map((surah) => ({
    ...surah,
    nameArabic: SURAH_ARABIC[surah.number] || surah.nameArabic,
  }));
  const initialPreviewAyahs = normalizeAyahList(previewRows);

  const firstSurahBatch = list.slice(0, 30);
  const secondSurahBatch = list.slice(30);

  return (
    <div className="flex min-h-screen flex-col bg-surface-app text-ink">
      <Header />

      <main className="w-full flex-1">
        <Hero />
        <ContinueReading />
        <SurahGrid surahs={firstSurahBatch} showHeader={true} showTabs={true} />
        <TranslationsPreview
          surahs={list}
          initialSurahNumber={PREVIEW_SURAH_NUMBER}
          initialAyahs={initialPreviewAyahs}
        />
        <SurahGrid surahs={secondSurahBatch} showHeader={false} showTabs={false} />
        <RecitersSection />
        <StartLearning />
        <QuranInYear />
        <DailyMotivationHome />
        <Community />
        <QuranApps />
      </main>

      <SiteFooter />
    </div>
  );
}
