import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Search the Quran',
  description:
    'Search the Holy Quran by surah name, ayah reference, or meaning. Find verses instantly with smart suggestions on QuranPilot.',
  path: '/search',
  keywords: ['Quran search', 'find ayah', 'search verse', 'Ayat al-Kursi'],
});

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
