import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hifz practice',
  description: 'Memorize the Quran ayah by ayah with speech or typing, and track daily accuracy.',
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export default function HifzLayout({ children }: { children: React.ReactNode }) {
  return children;
}
