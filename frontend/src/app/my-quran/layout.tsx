import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Quran',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function MyQuranLayout({ children }: { children: React.ReactNode }) {
  return children;
}
