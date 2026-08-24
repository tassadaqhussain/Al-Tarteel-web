import Link from 'next/link';
import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';
import { JsonLd } from '@/components/seo/JsonLd';
import { getSurahArabicName, getSurahPath, SURAH_SIMPLE_NAMES } from '@/lib/surah-meta';
import { absoluteUrl, SITE_NAME } from '@/lib/seo';
import {
  localeConfig,
  localePath,
  PREFIXED_LOCALES,
  type PrefixedLocale,
} from '@/lib/i18n/content-locales';
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
              const name = SURAH_SIMPLE_NAMES[number] || `Surah ${number}`;
              return (
                <li key={number}>
                  <Link
                    href={localePath(locale, getSurahPath(number))}
                    className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm hover:bg-surface-2"
                  >
                    <span className="font-medium text-ink">
                      {number}. {name}
                    </span>
                    <span className="text-ink-3">{getSurahArabicName(number)}</span>
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
        </nav>
      </main>

      <SiteFooter />
    </div>
  );
}
