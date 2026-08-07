import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(6,95,70,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(192,136,41,0.1),_transparent_45%)]"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
