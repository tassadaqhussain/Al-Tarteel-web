import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { ContactForm } from '@/components/contact/ContactForm';
import { SITE_NAME, SITE_URL, absoluteUrl, buildPageMetadata } from '@/lib/seo';
import { CONTACT_EMAIL } from '@/lib/site-contact';
import {
  DEFAULT_CONTENT_LOCALE,
  localeConfig,
  localePath,
  type ContentLocale,
} from '@/lib/i18n/content-locales';

type ContactPageCopy = {
  metaTitle: string;
  metaDescription: string;
  homeLabel: string;
  contactLabel: string;
  badge: string;
  h1: string;
  intro: string;
  directEmailLabel: string;
  aboutPrompt: string;
  aboutLink: string;
};

const CONTACT_PAGE_COPY: Record<ContentLocale, ContactPageCopy> = {
  en: {
    metaTitle: 'Contact QuranPilot – Report a Mistake or Send Feedback',
    metaDescription:
      'Contact the QuranPilot team to report a mistake in Quran text, translation, or audio, request a feature, or ask a general question.',
    homeLabel: 'Home',
    contactLabel: 'Contact',
    badge: `Contact ${SITE_NAME}`,
    h1: 'Get in Touch',
    intro:
      'Found an issue in Arabic script, a translation, or verse-by-verse audio? Have a feature idea or general question? Send us a note below or email us directly.',
    directEmailLabel: 'Direct email:',
    aboutPrompt: 'Want to learn more about our text, translation, and audio sources? Visit our',
    aboutLink: 'About page',
  },
  ur: {
    metaTitle: 'QuranPilot سے رابطہ کریں – غلطی کی نشاندہی یا رائے',
    metaDescription:
      'قرآنی متن، اردو ترجمے یا آڈیو میں کسی غلطی کی نشاندہی کرنے، نئی سہولت تجویز کرنے یا عمومی سوال پوچھنے کے لیے QuranPilot سے رابطہ کریں۔',
    homeLabel: 'ہوم',
    contactLabel: 'رابطہ',
    badge: `رابطہ ${SITE_NAME}`,
    h1: 'ہم سے رابطہ کریں',
    intro:
      'اگر آپ کو عربی متن، ترجمے یا تلاوت کی آڈیو میں کوئی غلطی نظر آئے یا کوئی تجویز یا سوال ہو تو نیچے فارم پُر کریں یا براہِ راست ای میل کریں۔',
    directEmailLabel: 'براہِ راست ای میل:',
    aboutPrompt: 'ہمارے متن، تراجم اور آڈیو ذرائع کے بارے میں مزید جاننے کے لیے دیکھیں:',
    aboutLink: 'تعارف کا صفحہ',
  },
  ps: {
    metaTitle: 'له QuranPilot سره اړیکه – د تېروتنې راپور یا نظر',
    metaDescription:
      'د قرآني متن، پښتو ژباړې یا غږیز تلاوت د تېروتنې راپور ورکولو، وړاندیز کولو یا پوښتنې لپاره له QuranPilot سره اړیکه ونیسئ.',
    homeLabel: 'کور',
    contactLabel: 'اړیکه',
    badge: `له ${SITE_NAME} سره اړیکه`,
    h1: 'موږ سره اړیکه ونیسئ',
    intro:
      'که مو په عربي متن، ژباړه یا تلاوت کې کومه تېروتنه ولیدله یا کومه پوښتنه یا وړاندیز لرئ، لاندې فورم ډک کړئ یا برېښنالیک راولېږئ.',
    directEmailLabel: 'مستقیم برېښنالیک:',
    aboutPrompt: 'زموږ د متن، ژباړو او غږیزو سرچینو په اړه د نورو معلوماتو لپاره وګورئ:',
    aboutLink: 'زموږ په اړه پاڼه',
  },
  fa: {
    metaTitle: 'تماس با QuranPilot – گزارش خطا یا ارسال پیام',
    metaDescription:
      'برای گزارش خطا در متن قرآن، ترجمه فارسی یا صوت تلاوت، پیشنهاد ویژگی جدید یا پرسش عمومی با تیم QuranPilot تماس بگیرید.',
    homeLabel: 'خانه',
    contactLabel: 'تماس',
    badge: `تماس با ${SITE_NAME}`,
    h1: 'با ما در تماس باشید',
    intro:
      'اگر در خط عربی، ترجمه یا صوت آیه به آیه خطایی دیدید، یا پیشنهاد و پرسشی دارید، فرم زیر را پر کنید یا مستقیماً ایمیل بفرستید.',
    directEmailLabel: 'ایمیل مستقیم:',
    aboutPrompt: 'برای آشنایی بیشتر با منابع متن، ترجمه و صوت ما ببینید:',
    aboutLink: 'صفحه درباره ما',
  },
};

export function contactPageMetadata(locale: ContentLocale = DEFAULT_CONTENT_LOCALE): Metadata {
  const copy = CONTACT_PAGE_COPY[locale];
  return buildPageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: localePath(locale, '/contact'),
    locale,
    alternatePath: '/contact',
    keywords: ['Contact QuranPilot', 'report Quran text error', 'QuranPilot support'],
  });
}

export function ContactPageView({ locale = DEFAULT_CONTENT_LOCALE }: { locale?: ContentLocale }) {
  const copy = CONTACT_PAGE_COPY[locale];
  const cfg = localeConfig(locale);
  const pageUrl = absoluteUrl(localePath(locale, '/contact'));

  const contactPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: copy.metaTitle,
    url: pageUrl,
    inLanguage: cfg.hreflang,
    description: copy.metaDescription,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntity: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      email: CONTACT_EMAIL,
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface-app text-ink">
      <Header />
      <JsonLd data={contactPageJsonLd} />

      <main
        lang={cfg.hreflang}
        dir={cfg.dir}
        className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:py-12"
      >
        <Breadcrumbs
          items={[
            { name: copy.homeLabel, path: localePath(locale, '/') },
            { name: copy.contactLabel, path: localePath(locale, '/contact') },
          ]}
        />

        <header className="mt-6 mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            {copy.badge}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {copy.h1}
          </h1>
          <p className="mt-3 text-sm leading-7 text-ink-2 sm:text-base">{copy.intro}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink-2">
            <Mail className="h-4 w-4 text-[var(--accent)]" aria-hidden />
            <span>{copy.directEmailLabel}</span>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              dir="ltr"
              className="font-semibold text-[var(--accent)] hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </header>

        <Suspense
          fallback={
            <div className="rounded-2xl border border-line bg-surface p-8 text-sm text-ink-muted">
              …
            </div>
          }
        >
          <ContactForm locale={locale} />
        </Suspense>

        <p className="mt-6 text-xs text-ink-muted">
          {copy.aboutPrompt}{' '}
          <Link
            href={localePath(locale, '/about')}
            className="font-semibold text-[var(--accent)] hover:underline"
          >
            {copy.aboutLink}
          </Link>
          .
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
