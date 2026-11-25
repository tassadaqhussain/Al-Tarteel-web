import Link from 'next/link';
import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';
import { JsonLd } from '@/components/seo/JsonLd';
import { getSurahArabicName, getSurahPath, SURAH_SIMPLE_NAMES } from '@/lib/surah-meta';
import { getSurahLocalizedName } from '@/lib/i18n/surah-localized-names';
import { absoluteUrl, SITE_NAME } from '@/lib/seo';
import {
  localeConfig,
  localePath,
  PREFIXED_LOCALES,
  type PrefixedLocale,
} from '@/lib/i18n/content-locales';
import { hasJuzLocale, juzPath as buildJuzPath } from '@/lib/i18n/juz-copy';
import { TOPICS, topicPath } from '@/lib/topics';
import { LOCALE_LANDING } from '@/lib/i18n/locale-landing';

/**
 * Locale hub at /ur, /ps, /fa — the "Quran with <language> translation" landing
 * page. It carries real prose plus a full 114-surah index so crawlers can reach
 * every localised surah page from one entry point, mirroring how the English
 * homepage links all 114 chapters.
 */
export function LocaleHome({ locale }: { locale: PrefixedLocale }) {
  const config = localeConfig(locale);
  const copy = LOCALE_LANDING[locale];
  const others = PREFIXED_LOCALES.filter((code) => code !== locale);
  const homePath = localePath(locale, '/');

  return (
    <div lang={config.hreflang} dir={config.dir}>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: copy.heading,
          description: copy.metaDescription,
          url: absoluteUrl(homePath),
          inLanguage: config.hreflang,
          isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: absoluteUrl('/') },
        }}
      />
      <Header />

      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <article>
          <h1 className="text-3xl font-bold text-ink sm:text-4xl">{copy.heading}</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-2">{copy.intro}</p>
          {copy.body.map((paragraph) => (
            <p key={paragraph} className="mt-4 leading-relaxed text-ink-2">
              {paragraph}
            </p>
          ))}
        </article>

        <section aria-labelledby="surah-index" className="mt-10">
          <h2 id="surah-index" className="text-xl font-bold text-ink">
            {copy.surahIndexHeading}
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 114 }, (_, index) => {
              const number = index + 1;
              const localized = getSurahLocalizedName(number, locale);
              const english = SURAH_SIMPLE_NAMES[number] || `Surah ${number}`;
              return (
                <li key={number}>
                  <Link
                    href={localePath(locale, getSurahPath(number))}
                    className="flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-sm hover:bg-surface-2"
                  >
                    <span className="font-medium text-ink">
                      {number}. {localized}
                    </span>
                    <span className="text-xs text-ink-3" dir="ltr">
                      {english}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {locale === 'ur' ? (
          <nav aria-label="موضوعات" className="mt-10">
            <h2 className="text-xl font-bold text-ink">مقبول موضوعات</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={topicPath('ur', t.slug)}
                    className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {t.copy.ur.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <section aria-labelledby="juz-index" className="mt-10">
          <h2 id="juz-index" className="text-xl font-bold text-ink">
            {locale === 'fa'
              ? '۳۰ جزء قرآن کریم'
              : locale === 'ps'
                ? 'د قرآن کریم ۳۰ سپارې'
                : 'قرآن مجید کے 30 پارے'}
          </h2>
          <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
            {Array.from({ length: 30 }, (_, index) => {
              const juz = index + 1;
              const prefix = locale === 'fa' ? 'جزء' : locale === 'ps' ? 'سپاره' : 'پارہ';
              return (
                <li key={juz}>
                  <Link
                    href={hasJuzLocale(locale) ? buildJuzPath(locale, juz) : buildJuzPath('en', juz)}
                    className="flex items-center justify-center rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {prefix} {juz}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <nav aria-labelledby="other-languages" className="mt-10">
          <h2 id="other-languages" className="text-xl font-bold text-ink">
            {copy.otherLanguagesHeading}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-3">
            <li>
              <Link href="/" className="text-emerald-800 underline hover:no-underline">
                English
              </Link>
            </li>
            {others.map((code) => (
              <li key={code}>
                <Link
                  href={localePath(code, '/')}
                  hrefLang={localeConfig(code).hreflang}
                  className="text-emerald-800 underline hover:no-underline"
                >
                  {localeConfig(code).nativeName}
                </Link>
              </li>
            ))}
          </ul>
          {locale === 'ur' ? (
            <p className="mt-3 text-sm text-ink-2">
              <Link href="/quran-urdu-translation" className="font-medium text-brand hover:underline">
                Quran Urdu translation hub
              </Link>{' '}
              — English URL index for all 114 surahs in Urdu.
            </p>
          ) : null}
          {locale === 'ps' ? (
            <p className="mt-3 text-sm text-ink-2">
              <Link href="/quran-pashto-translation" className="font-medium text-brand hover:underline">
                Quran Pashto translation hub
              </Link>{' '}
              — English URL index for all 114 surahs in Pashto.
            </p>
          ) : null}
        </nav>
      </main>

      <SiteFooter />
    </div>
  );
}
