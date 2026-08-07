import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { DonationCard } from '@/components/donate/DonationCard';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Donate — Support QuranPilot',
  description:
    'Support free Quran access for everyone. Donate securely to help QuranPilot provide translations, tafsir, and audio worldwide.',
  path: '/donate',
  keywords: ['donate Quran', 'support Islamic app', 'QuranPilot donation'],
});

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-[#f4f5f7] pb-20">
      <Header />
      <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-10 sm:py-14">
        <Suspense
          fallback={
            <div className="h-[32rem] w-full max-w-md animate-pulse rounded-2xl bg-white shadow-sm" />
          }
        >
          <DonationCard />
        </Suspense>
      </main>
    </div>
  );
}
