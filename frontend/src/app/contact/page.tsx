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

export const revalidate = 86400;

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact QuranPilot – Report a Mistake or Send Feedback',
  description:
    'Contact the QuranPilot team to report a mistake in Quran text, translation, or audio, request a feature, or ask a general question.',
  path: '/contact',
  keywords: ['Contact QuranPilot', 'report Quran text error', 'QuranPilot support'],
});

export default function ContactPage() {
  const contactPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact ${SITE_NAME}`,
    url: absoluteUrl('/contact'),
    description:
      'Contact QuranPilot to report a mistake in text, translation, or audio, request a feature, or send a general inquiry.',
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

      <main lang="en" dir="ltr" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' },
          ]}
        />

        <header className="mt-6 mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            Contact {SITE_NAME}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Get in Touch
          </h1>
          <p className="mt-3 text-sm leading-7 text-ink-2 sm:text-base">
            Found an issue in Arabic script, a translation, or verse-by-verse audio? Have a feature
            idea or general question? Send us a note below or email us directly.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink-2">
            <Mail className="h-4 w-4 text-[var(--accent)]" aria-hidden />
            <span>Direct email:</span>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-semibold text-[var(--accent)] hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </header>

        <Suspense
          fallback={
            <div className="rounded-2xl border border-line bg-surface p-8 text-sm text-ink-muted">
              Loading contact form…
            </div>
          }
        >
          <ContactForm />
        </Suspense>

        <p className="mt-6 text-xs text-ink-muted">
          Want to learn more about our text, translation, and audio sources? Visit our{' '}
          <Link href="/about" className="font-semibold text-[var(--accent)] hover:underline">
            About page
          </Link>
          .
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
