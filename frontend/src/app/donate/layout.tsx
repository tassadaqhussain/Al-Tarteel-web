import { notFound } from 'next/navigation';
import { DONATE_ENABLED } from '@/lib/features';

export default function DonateLayout({ children }: { children: React.ReactNode }) {
  if (!DONATE_ENABLED) notFound();
  return children;
}
