import { Header } from '@/components/Header';
import { Hero } from '@/components/home/Hero';
import { PopularSurahsRow } from '@/components/home/PopularSurahsRow';
import { TodaySection } from '@/components/home/TodaySection';
import { FeaturedLearningPlans } from '@/components/home/FeaturedLearningPlans';
import { RecitersSection } from '@/components/home/RecitersSection';
import { StartLearning } from '@/components/home/StartLearning';
import { buildPageMetadata, DEFAULT_DESCRIPTION } from '@/lib/seo';
import { SiteFooter } from '@/components/SiteFooter';

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
  alternatePath: '/',
});

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-app text-ink">
      <Header />

      <main className="w-full flex-1">
        <Hero />
        <PopularSurahsRow />
        <TodaySection />
        <FeaturedLearningPlans />
        <RecitersSection />
        <StartLearning />
      </main>

      <SiteFooter />
    </div>
  );
}
