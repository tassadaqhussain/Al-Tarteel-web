import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { Amiri, Amiri_Quran, Figtree, Fredoka } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AudioPlayerProvider } from '@/components/audio/AudioPlayerProvider';
import { ScrollToCurrentAyah } from '@/components/audio/ScrollToCurrentAyah';
import { ScrollToHashAyah } from '@/components/reader/ScrollToHashAyah';
import { VisitTracker } from '@/components/analytics/VisitTracker';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { JsonLd } from '@/components/seo/JsonLd';
import { BackToTopButton } from '@/components/BackToTopButton';
import { Analytics } from '@/components/analytics/Analytics';
import { DeferredWidgets } from '@/components/DeferredWidgets';
import { CampaignBanner } from '@/components/campaign/CampaignBanner';
import { LocaleSync } from '@/components/LocaleSync';
import { LocaleFromPath } from '@/components/LocaleFromPath';
import { LocaleSuggestionBanner } from '@/components/LocaleSuggestionBanner';
import { fetchPublicSiteConfig } from '@/lib/site-config';
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
  preload: true,
});

/** Kids experience only. Self-hosted, so no render-blocking third-party CSS. */
const fredoka = Fredoka({
  subsets: ['latin'],
  variable: '--font-fredoka',
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
      { url: '/images/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/images/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  // Verification meta tags are injected from Admin → Site (or env fallback) in RootLayout.
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f7f7' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1214' },
  ],
};

import { VoiceSearchProvider } from '@/providers/VoiceSearchProvider';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const reqHeaders = await headers();
  const rawLocale = reqHeaders.get('x-qp-locale');
  const ssrLocale =
    rawLocale === 'ur' || rawLocale === 'ps' || rawLocale === 'fa' ? rawLocale : 'en';
  const ssrDir = ssrLocale === 'en' ? 'ltr' : 'rtl';
  const siteConfig = await fetchPublicSiteConfig();
  const analyticsProviderAttr =
    process.env.NODE_ENV === 'production' && siteConfig.analyticsEnabled
      ? siteConfig.analyticsProvider || 'disabled'
      : 'disabled';

  return (
    <html
      lang={ssrLocale}
      dir={ssrDir}
      data-scroll-behavior="smooth"
      data-analytics-provider={analyticsProviderAttr}
      suppressHydrationWarning
    >
      <head>
        {siteConfig.googleSiteVerification ? (
          <meta name="google-site-verification" content={siteConfig.googleSiteVerification} />
        ) : null}
        {siteConfig.bingSiteVerification ? (
          <meta name="msvalidate.01" content={siteConfig.bingSiteVerification} />
        ) : null}
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
              "var known=['search','surahs','bookmarks','settings','profile','my-quran','donate','admin'," +
              "'feedback','about','contact','articles','hifz','tajweed','learning-plans','quran-in-year','reading-goal'," +
              "'quran-english-translation','quran-urdu-translation','quran-pashto-translation'," +
              "'login','register','forgot-password','reset-password','admin','ur','ps','fa'];" +
              "if(p.indexOf('/surah/')===0||p.indexOf('/juz/')===0||" +
              "(seg.length===1&&known.indexOf(seg[0])<0&&seg[0].indexOf('.')<0))e='default';" +
              "r.classList.add('experience-'+e);" +
              "r.classList.add('view-mode-'+(s.readerViewMode||'verse'));" +
              // Locale is decided strictly by URL prefix (/ = en, /ur, /ps, /fa).
              // Never swap a canonical URL's lang/dir based on localStorage or cookies.
              "if(['ur','ps','fa'].indexOf(seg[0])>-1){r.lang=seg[0];r.dir='rtl';}else{r.lang='en';r.dir='ltr';}" +
              "}catch(e){}})();",
          }}
        />
      </head>
      <body className={`${amiri.variable} ${amiriQuran.variable} ${figtree.variable} ${fredoka.variable} antialiased min-h-screen font-sans bg-[var(--bg)] text-[var(--fg)]`}>
        <JsonLd data={[websiteJsonLd(), organizationJsonLd()]} />
        <ThemeProvider>
          <AuthProvider>
            <AudioPlayerProvider>
              <VoiceSearchProvider>
                <ScrollToCurrentAyah />
                <ScrollToHashAyah />
                <div className="relative flex min-h-screen flex-col">
                  <LocaleSync />
                  <LocaleFromPath />
                  <LocaleSuggestionBanner />
                  <CampaignBanner />
                  {children}
                </div>
                <BackToTopButton />
                <DeferredWidgets />
                <VisitTracker />
                <Analytics />
              </VoiceSearchProvider>
            </AudioPlayerProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
