import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Headphones, Languages, ShieldCheck, AlertCircle, Lock } from 'lucide-react';
import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  buildPageMetadata,
  organizationJsonLd,
} from '@/lib/seo';
import { MAINTAINER_INFO } from '@/lib/site-contact';

export const revalidate = 86400;

export const metadata: Metadata = buildPageMetadata({
  title: 'About QuranPilot – Mission, Sources & Accuracy',
  description:
    'Learn who builds QuranPilot, our verified Quran text, translation, and audio sources, and how to report any mistake in text, translation, or recitation.',
  path: '/about',
  keywords: ['About QuranPilot', 'Quran sources', 'Saheeh International', 'Quran audio reciters'],
});

export default function AboutPage() {
  const aboutPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${SITE_NAME}`,
    url: absoluteUrl('/about'),
    description:
      'Mission, maintainer information, verified Quranic text, translation, and audio sources, and accuracy standards for QuranPilot.',
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntity: organizationJsonLd(),
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface-app text-ink">
      <Header />
      <JsonLd data={[aboutPageJsonLd, organizationJsonLd()]} />

      <main lang="en" dir="ltr" className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
          ]}
        />

        <header className="mt-6 border-b border-line pb-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            About {SITE_NAME}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Read, Listen, Memorize, and Understand the Holy Quran
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-2">
            QuranPilot is a free, distraction-free web application built to help readers around the
            world engage with the Holy Quran—whether you are reading a daily surah, listening to
            verse-by-verse recitation, practicing memorization (Hifz), studying Tajweed rules, or
            exploring translations in English, Urdu, Pashto, and Persian.
          </p>
        </header>

        {/* Maintainer / E-E-A-T block (editable in frontend/src/lib/site-contact.ts) */}
        <section
          aria-labelledby="who-builds-heading"
          className="mt-8 rounded-2xl border border-line bg-surface p-6 sm:p-7"
        >
          <h2 id="who-builds-heading" className="flex items-center gap-2 text-xl font-bold text-ink">
            <ShieldCheck className="h-5 w-5 text-[var(--accent)]" aria-hidden />
            Who Builds QuranPilot
          </h2>
          <p className="mt-3 text-sm leading-7 text-ink-2 sm:text-[15px]">
            {MAINTAINER_INFO.summary}
          </p>
          <p className="mt-2 text-sm leading-7 text-ink-3">
            Our goal is to keep the Quran accessible on every device without paywalls, intrusive
            advertising, or unnecessary sign-in barriers, while treating every letter of revelation
            and its attributions with care and transparency.
          </p>
        </section>

        {/* Content Sources & Attribution */}
        <section
          aria-labelledby="sources-heading"
          className="mt-8 space-y-6 rounded-2xl border border-line bg-surface p-6 sm:p-7"
        >
          <div>
            <h2 id="sources-heading" className="text-xl font-bold text-ink">
              Content Sources &amp; Attribution
            </h2>
            <p className="mt-2 text-sm leading-7 text-ink-3">
              We never rewrite, paraphrase, or alter Quranic Arabic text, translations, or reciter
              attributions. Every text and audio track is sourced from established Quranic datasets
              and APIs:
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-line-subtle bg-surface-2/50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                <BookOpen className="h-4 w-4 text-[var(--accent)]" aria-hidden />
                Arabic Script &amp; Verse Data
              </h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-6 text-ink-2 sm:text-sm">
                <li>
                  Uthmani and IndoPak Arabic Quranic scripts, verse numbering, and Juz/Hizb/Page
                  metadata sourced via the Quran Foundation Content API (
                  <code>apis.quran.foundation</code>).
                </li>
                <li>
                  Word-by-word morphology, transliteration, and meanings loaded from verified
                  word-level Quranic datasets.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-line-subtle bg-surface-2/50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                <Languages className="h-4 w-4 text-[var(--accent)]" aria-hidden />
                Quran Translations
              </h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-6 text-ink-2 sm:text-sm">
                <li>
                  <strong>English:</strong> Saheeh International (<code>en-sahih-international</code>)
                </li>
                <li>
                  <strong>Urdu (اردو):</strong> Bayan-ul-Quran (<code>bayan-ul-quran</code>)
                </li>
                <li>
                  <strong>Pashto (پښتو):</strong> Zakaria Abulsalam (
                  <code>ps-zakaria-abulsalam-118</code>)
                </li>
                <li>
                  <strong>Persian (فارسی):</strong> Quran Foundation Persian translation (
                  <code>qf-translation-135</code>){/* TODO: verify exact Persian translator name from DB */}
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-line-subtle bg-surface-2/50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                <Headphones className="h-4 w-4 text-[var(--accent)]" aria-hidden />
                Audio Recitations &amp; Spoken Translations
              </h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-6 text-ink-2 sm:text-sm">
                <li>
                  <strong>Arabic Reciters (via EveryAyah.com):</strong> Mahmoud Khalil Al-Husary
                  (Murattal, Mujawwad, Muallim), Abu Bakr Ash-Shaatree, Saad Al-Ghamdi, Ahmed ibn
                  Ali al-Ajamy, Maher Al-Muaiqly, Ali Al-Hudhaify, Muhammad Ayyoub, Abdullah Basfar,
                  Yasser Ad-Dussary, Nasser Al-Qatami, Abdullah Awwad Al-Juhaynee, and Ali Jaber.
                </li>
                <li>
                  <strong>Spoken Translation Audio (via EveryAyah.com):</strong> Ibrahim Walk
                  (English, Saheeh International), Shamshad Ali Khan &amp; Dr. Farhat Hashmi (Urdu),
                  and Makarem Shirazi / Fooladvand (Persian).
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-line-subtle bg-surface-2/50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                <BookOpen className="h-4 w-4 text-[var(--accent)]" aria-hidden />
                Tafsir &amp; Hadith References
              </h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-6 text-ink-2 sm:text-sm">
                <li>
                  <strong>Tafsir:</strong> Official tafsir resources served via the Quran Foundation
                  Content API (<code>/content/api/v4/tafsirs</code>), displayed with source name and
                  author attribution.
                </li>
                <li>
                  <strong>Hadith:</strong> Editorial guides cite specific authentic narrations by
                  collection and hadith number (e.g., Sahih al-Bukhari, Sahih Muslim, Sunan Abi
                  Dawud, Jami at-Tirmidhi). Unverified claims are omitted rather than guessed.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Accuracy & Error Reporting */}
        <section
          aria-labelledby="accuracy-heading"
          className="mt-8 rounded-2xl border border-line bg-surface p-6 sm:p-7"
        >
          <h2 id="accuracy-heading" className="flex items-center gap-2 text-xl font-bold text-ink">
            <AlertCircle className="h-5 w-5 text-[var(--accent)]" aria-hidden />
            Accuracy Commitment &amp; Reporting Errors
          </h2>
          <p className="mt-3 text-sm leading-7 text-ink-2 sm:text-[15px]">
            Accuracy in Quranic script, diacritics, translation text, and audio synchronization is
            our highest priority. If you ever notice a typographical error, misaligned audio verse,
            missing diacritic, or questionable attribution anywhere on {SITE_NAME}, please report it
            immediately using our{' '}
            <Link href="/contact" className="font-semibold text-[var(--accent)] hover:underline">
              Contact page
            </Link>{' '}
            (or the &ldquo;Report a mistake&rdquo; button on any surah or ayah page). Every report
            is reviewed and verified against the original source before any correction is applied.
          </p>
        </section>

        {/* Privacy Summary */}
        <section
          aria-labelledby="privacy-heading"
          className="mt-8 rounded-2xl border border-line bg-surface p-6 sm:p-7"
        >
          <h2 id="privacy-heading" className="flex items-center gap-2 text-xl font-bold text-ink">
            <Lock className="h-5 w-5 text-[var(--accent)]" aria-hidden />
            Privacy Summary
          </h2>
          <p className="mt-3 text-sm leading-7 text-ink-2 sm:text-[15px]">
            You can read the entire Quran, listen to recitations, and study Tajweed on {SITE_NAME}{' '}
            without creating an account. Reading preferences (such as font size, theme, and last
            read verse) are stored locally in your browser. If you choose to create a free account
            to sync bookmarks, reading goals, or Hifz progress across devices, we store only the
            information required to provide that sync and never sell your personal data.
            {/* TODO: Link to dedicated /privacy page once published. */}
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/surahs"
            className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-brand-contrast transition hover:opacity-90"
          >
            Browse All 114 Surahs
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-[var(--accent)]"
          >
            Contact Us
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
