import type { Metadata } from 'next';
import { DonateCheckoutForm } from '@/components/donate/DonateCheckoutForm';

export const metadata: Metadata = {
  title: 'Checkout · Donate',
  description: 'Complete your QuranPilot donation.',
};

export default function DonateCheckoutPage() {
  return <DonateCheckoutForm />;
}
