import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Donation successful',
  description: 'Thank you for supporting QuranPilot.',
  path: '/donate/success',
  noIndex: true,
});

export default function DonateSuccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
