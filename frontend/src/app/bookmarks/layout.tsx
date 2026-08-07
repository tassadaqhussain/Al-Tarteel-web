import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Bookmarks',
  description: 'Your saved Quran verses on QuranPilot.',
  path: '/bookmarks',
  noIndex: true,
});

export default function BookmarksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
