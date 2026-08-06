import type { Metadata, Viewport } from 'next';
import { Amiri, Amiri_Quran, Outfit } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AudioPlayerProvider } from '@/components/audio/AudioPlayerProvider';
import { AudioBar } from '@/components/audio/AudioBar';
import { ScrollToCurrentAyah } from '@/components/audio/ScrollToCurrentAyah';

const amiri = Amiri({
  weight: ['400', '700'],
  subsets: ['arabic', 'latin'],
  variable: '--font-amiri',
  display: 'swap',
});

/** Quran-specialized face — includes waqf / small annotation glyphs Amiri lacks. */
const amiriQuran = Amiri_Quran({
  weight: '400',
  subsets: ['arabic', 'latin'],
  variable: '--font-amiri-quran',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'QuranPilot — Quran Reader', template: '%s | QuranPilot' },
  description: 'Read the Holy Quran with translations, tafsir, and verse-by-verse audio. Uthmani script, multiple languages.',
  keywords: ['Quran', 'recitation', 'translation', 'tafsir', 'Arabic'],
  authors: [{ name: 'QuranPilot' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'QuranPilot',
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
        <ThemeProvider>
          <AudioPlayerProvider>
            <ScrollToCurrentAyah />
            <div className="relative flex min-h-screen flex-col">
              {children}
            </div>
            <AudioBar />
          </AudioPlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
