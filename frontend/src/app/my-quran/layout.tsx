import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Quran',
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export default function MyQuranLayout({ children }: { children: React.ReactNode }) {
  return children;
}
