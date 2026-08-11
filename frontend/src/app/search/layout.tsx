import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

/** Search hub + results stay out of the index (thin / personalized). */
export const metadata: Metadata = buildPageMetadata({
  title: 'Search the Quran',
  description:
    'Search the Holy Quran by surah name, ayah reference, or meaning on QuranPilot.',
  path: '/search',
  keywords: ['Quran search', 'find ayah', 'search verse'],
  noIndex: true,
});

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
