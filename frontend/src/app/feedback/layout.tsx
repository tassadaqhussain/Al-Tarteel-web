import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Feedback',
  description: 'Share ideas, report bugs, or tell us how QuranPilot can improve.',
  path: '/feedback',
  noIndex: true,
});

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
