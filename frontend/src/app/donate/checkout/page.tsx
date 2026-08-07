import type { Metadata } from 'next';
import { DonateCheckoutForm } from '@/components/donate/DonateCheckoutForm';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Checkout · Donate',
  description: 'Complete your QuranPilot donation.',
  path: '/donate/checkout',
  noIndex: true,
});

export default function DonateCheckoutPage() {
  return <DonateCheckoutForm />;
}
