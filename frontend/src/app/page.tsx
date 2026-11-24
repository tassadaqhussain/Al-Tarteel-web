import Link from 'next/link';
import { Header } from '@/components/Header';
import { Hero } from '@/components/home/Hero';
import { PopularSurahsRow } from '@/components/home/PopularSurahsRow';
import { TodaySection } from '@/components/home/TodaySection';
import { FeaturedLearningPlans } from '@/components/home/FeaturedLearningPlans';
import { RecitersSection } from '@/components/home/RecitersSection';
import { StartLearning } from '@/components/home/StartLearning';
import { buildPageMetadata, DEFAULT_DESCRIPTION } from '@/lib/seo';
import { SiteFooter } from '@/components/SiteFooter';
import { SITE_SHELL } from '@/components/layout/MainContainer';

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

        <section
          aria-labelledby="about-quranpilot-heading"
          className="border-t border-line-subtle bg-surface/60 py-12"
        >
          <div className={`${SITE_SHELL} space-y-6`}>
            <div className="max-w-3xl space-y-3">
              <h2
                id="about-quranpilot-heading"
                className="font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl"
              >
                Read, Listen, and Reflect on the Holy Quran Online
              </h2>
              <p className="text-sm leading-7 text-ink-2 sm:text-base">
                QuranPilot is a free, distraction-free online Quran reader designed to help you
                read all 114 surahs in clear Uthmani Arabic script with accurate translations,
                word-by-word meanings, and synchronized verse-by-verse audio recitation. Whether
                you are reciting{' '}
                <Link href="/al-mulk" className="font-medium text-[var(--accent)] hover:underline">
                  Surah Al-Mulk
                </Link>{' '}
                before sleep, reflecting on{' '}
                <Link href="/al-kahf" className="font-medium text-[var(--accent)] hover:underline">
                  Surah Al-Kahf
                </Link>{' '}
                on Friday, memorizing{' '}
                <Link href="/al-baqarah/255" className="font-medium text-[var(--accent)] hover:underline">
                  Ayatul Kursi
                </Link>
                , or reading{' '}
                <Link href="/ya-sin" className="font-medium text-[var(--accent)] hover:underline">
                  Surah Ya-Sin
                </Link>{' '}
                and{' '}
                <Link href="/ar-rahman" className="font-medium text-[var(--accent)] hover:underline">
                  Surah Ar-Rahman
                </Link>
                , every chapter opens cleanly on desktop and mobile with no login required.
              </p>
              <p className="text-sm leading-7 text-ink-2 sm:text-base">
                Explore the Quran by{' '}
                <Link href="/surahs" className="font-medium text-[var(--accent)] hover:underline">
                  all 114 surahs
                </Link>{' '}
                or{' '}
                <Link href="/juz" className="font-medium text-[var(--accent)] hover:underline">
                  30 Juz (parts)
                </Link>
                , study essential{' '}
                <Link href="/tajweed" className="font-medium text-[var(--accent)] hover:underline">
                  Tajweed rules
                </Link>{' '}
                for clearer pronunciation, follow structured{' '}
                <Link href="/learning-plans" className="font-medium text-[var(--accent)] hover:underline">
                  Quran learning plans
                </Link>
                , or read introductory{' '}
                <Link href="/articles" className="font-medium text-[var(--accent)] hover:underline">
                  Islamic articles
                </Link>
                . QuranPilot also offers dedicated multilingual Quran editions in{' '}
                <Link href="/ur" hrefLang="ur" className="font-medium text-[var(--accent)] hover:underline">
                  Urdu (اردو)
                </Link>
                ,{' '}
                <Link href="/ps" hrefLang="ps" className="font-medium text-[var(--accent)] hover:underline">
                  Pashto (پښتو)
                </Link>
                , and{' '}
                <Link href="/fa" hrefLang="fa" className="font-medium text-[var(--accent)] hover:underline">
                  Persian (فارسی)
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
