import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'My Quran',
  description: 'Your personalized Quran reading space on QuranPilot.',
  path: '/my-quran',
  noIndex: true,
});

export default function MyQuranLayout({ children }: { children: React.ReactNode }) {
  return children;
}
