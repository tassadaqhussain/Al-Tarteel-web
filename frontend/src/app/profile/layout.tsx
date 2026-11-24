import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile',
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
