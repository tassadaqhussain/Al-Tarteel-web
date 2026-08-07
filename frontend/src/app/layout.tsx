import type { Metadata, Viewport } from 'next';
import { Amiri, Amiri_Quran, Outfit } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AudioPlayerProvider } from '@/components/audio/AudioPlayerProvider';
import { AudioBar } from '@/components/audio/AudioBar';
import { ScrollToCurrentAyah } from '@/components/audio/ScrollToCurrentAyah';
import { AskAiFab } from '@/components/ai/AskAiFab';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  organizationJsonLd,
  websiteJsonLd,
} from '@/lib/seo';

const amiri = Amiri({
  weight: ['400', '700'],
  subsets: ['arabic', 'latin'],
  variable: '--font-amiri',
  display: 'swap',
  preload: false, // reader/Arabic-heavy routes; keep homepage LCP light
});

/** Quran-specialized face — includes waqf / small annotation glyphs Amiri lacks. */
const amiriQuran = Amiri_Quran({
  weight: '400',
  subsets: ['arabic', 'latin'],
  variable: '--font-amiri-quran',
  display: 'swap',
  preload: false,
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
    title: {
    default: `${SITE_NAME} – Read, Listen & Understand the Quran`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  category: 'religion',
  referrer: 'origin-when-cross-origin',
  formatDetection: { telephone: false, email: false, address: false },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} – Read, Listen & Understand the Quran`,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: absoluteUrl('/images/hero_mosque.png'),
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Holy Quran reader`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} – Read, Listen & Understand the Quran`,
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl('/images/hero_mosque.png')],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
  },
  manifest: '/manifest.webmanifest',
  // Set via env after Google Search Console / Bing give you real tokens.
  // Never commit real tokens to git if the repo is public — use server env / deploy secrets.
  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? {
          other: {
            'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
          },
        }
      : {}),
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f7f7' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1214' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${amiri.variable} ${amiriQuran.variable} ${outfit.variable} antialiased min-h-screen font-sans bg-[var(--bg)] text-[var(--fg)]`}>
        <JsonLd data={[websiteJsonLd(), organizationJsonLd()]} />
        <ThemeProvider>
          <AudioPlayerProvider>
            <ScrollToCurrentAyah />
            <div className="relative flex min-h-screen flex-col">
              {children}
            </div>
            <AudioBar />
            <AskAiFab />
          </AudioPlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
