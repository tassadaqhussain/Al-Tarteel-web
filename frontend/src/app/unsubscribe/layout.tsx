import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Email preferences | QuranPilot',
  description: 'Manage QuranPilot new-feature emails.',
  path: '/unsubscribe',
  noIndex: true,
});

export default function UnsubscribeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
