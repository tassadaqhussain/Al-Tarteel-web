import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Set a Quran Reading Goal',
  description:
    'Choose a daily or weekly Quran reading goal and stay consistent. Track streaks and progress on QuranPilot.',
  path: '/reading-goal',
  keywords: ['Quran reading goal', 'Quran habit', 'daily Quran'],
  noIndex: true,
});

export default function ReadingGoalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
