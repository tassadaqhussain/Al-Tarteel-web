import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { DonationCard } from '@/components/donate/DonationCard';

export const metadata: Metadata = {
  title: 'Donate',
  description: 'Support QuranPilot — help millions connect with the Quran through secure Stripe donations.',
};

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
