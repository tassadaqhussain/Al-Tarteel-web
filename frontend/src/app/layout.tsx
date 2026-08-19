import type { Metadata, Viewport } from 'next';
import { Amiri, Amiri_Quran, Figtree } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AudioPlayerProvider } from '@/components/audio/AudioPlayerProvider';
import { AudioBar } from '@/components/audio/AudioBar';
import { ScrollToCurrentAyah } from '@/components/audio/ScrollToCurrentAyah';
import { ScrollToHashAyah } from '@/components/reader/ScrollToHashAyah';
import { AskAiFab } from '@/components/ai/AskAiFab';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { TajweedStyles } from '@/components/tajweed/TajweedStyles';
import { JsonLd } from '@/components/seo/JsonLd';
import { BackToTopButton } from '@/components/BackToTopButton';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  DEFAULT_OG_IMAGE_PATH,
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

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
    title: {
    default: `${SITE_NAME} – Read Quran Online with Translation & Audio`,
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
    title: `${SITE_NAME} – Read Quran Online with Translation & Audio`,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Holy Quran reader`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} – Read Quran Online with Translation & Audio`,
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
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
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/images/logo.png', type: 'image/png' },
    ],
    apple: '/images/apple-touch-icon.png',
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

import { VoiceSearchProvider } from '@/providers/VoiceSearchProvider';
import { GlobalVoiceSearch } from '@/components/GlobalVoiceSearch';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Apply the stored (or system) theme before first paint — no light flash at night. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var r=document.documentElement;" +
              "var t=localStorage.getItem('theme')||'system';" +
              "var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);" +
              "r.classList.toggle('dark',d);" +
              // Experience + view mode also drive theme tokens, so they must land
              // before first paint too or Kids/Easy Read flash the default palette.
              "var s=JSON.parse(localStorage.getItem('al-tarteel-settings')||'{}').state||{};" +
              "var e=s.experienceMode||'default';" +
              // Mirrors isQuranReaderPath(): /surah/*, /juz/* and bare surah
              // slugs read as reader routes. Any single unknown segment is a
              // surah slug; ThemeProvider re-checks properly after hydration.
              "var p=location.pathname,seg=p.split('/').filter(Boolean);" +
              "var known=['search','surahs','bookmarks','settings','profile','my-quran','donate'," +
              "'feedback','articles','hifz','tajweed','learning-plans','quran-in-year','reading-goal'," +
              "'login','register','forgot-password','reset-password'];" +
              "if(p.indexOf('/surah/')===0||p.indexOf('/juz/')===0||" +
              "(seg.length===1&&known.indexOf(seg[0])<0&&seg[0].indexOf('.')<0))e='default';" +
              "r.classList.add('experience-'+e);" +
              "r.classList.add('view-mode-'+(s.readerViewMode||'verse'));" +
              "if(s.uiLocale){r.lang=s.uiLocale;" +
              // keep in sync with RTL_LOCALES in lib/i18n/messages.ts
              "r.dir=['ar','fa','ur','ps'].indexOf(s.uiLocale)>-1?'rtl':'ltr';}" +
              "}catch(e){}})();",
          }}
        />
      </head>
      <body className={`${amiri.variable} ${amiriQuran.variable} ${figtree.variable} antialiased min-h-screen font-sans bg-[var(--bg)] text-[var(--fg)]`}>
        <JsonLd data={[websiteJsonLd(), organizationJsonLd()]} />
        <TajweedStyles />
        <ThemeProvider>
          <AuthProvider>
            <AudioPlayerProvider>
              <VoiceSearchProvider>
                <ScrollToCurrentAyah />
                <ScrollToHashAyah />
                <div className="relative flex min-h-screen flex-col">
                  {children}
                </div>
                <AudioBar />
                <BackToTopButton />
                <AskAiFab />
                <GlobalVoiceSearch />
              </VoiceSearchProvider>
            </AudioPlayerProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
