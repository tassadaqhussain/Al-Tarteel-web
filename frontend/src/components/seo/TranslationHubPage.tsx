import Link from 'next/link';
import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { absoluteUrl, SITE_NAME } from '@/lib/seo';
import {
  getSurahArabicName,
  getSurahMeaning,
  getSurahPath,
  SURAH_SIMPLE_NAMES,
} from '@/lib/surah-meta';
import { localeConfig, localePath } from '@/lib/i18n/content-locales';
import type { TranslationHubConfig } from '@/lib/i18n/translation-hubs';

export function TranslationHubPage({ hub }: { hub: TranslationHubConfig }) {
  const config = localeConfig(hub.locale);
  const dir = hub.locale === 'en' ? 'ltr' : config.dir;
  const lang = hub.locale === 'en' ? 'en' : config.hreflang;

  const surahHref = (number: number) =>
    hub.locale === 'en'
      ? getSurahPath(number)
      : localePath(hub.locale, getSurahPath(number));

  return (
    <div lang={lang} dir={dir}>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: hub.h1,
          description: hub.metaDescription,
          url: absoluteUrl(hub.path),
          inLanguage: lang,
          isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: absoluteUrl('/') },
        }}
      />
      <Header />

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Surahs', path: '/surahs' },
            { name: hub.h1, path: hub.path },
          ]}
        />

        <article className="mt-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{hub.h1}</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-2">{hub.intro}</p>
          {hub.body.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="mt-4 leading-relaxed text-ink-2">
              {paragraph}
            </p>
          ))}
        </article>

        <section aria-labelledby="hub-features" className="mt-8 rounded-xl border border-line bg-surface p-5 sm:p-6">
          <h2 id="hub-features" className="text-lg font-bold text-ink">
            {hub.featuresHeading}
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-2">
            {hub.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="surah-index" className="mt-10">
          <h2 id="surah-index" className="text-xl font-bold text-ink">
            {hub.surahIndexHeading}
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 114 }, (_, index) => {
              const number = index + 1;
              const name = SURAH_SIMPLE_NAMES[number] || `Surah ${number}`;
              const meaning = getSurahMeaning(number);
              return (
                <li key={number}>
                  <Link
                    href={surahHref(number)}
                    hrefLang={lang}
                    className="flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-sm hover:bg-surface-2"
                  >
                    <span className="min-w-0">
                      <span className="font-medium text-ink">
                        {number}. {name}
                      </span>
                      {meaning ? (
                        <span className="mt-0.5 block truncate text-xs text-ink-muted">{meaning}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-ink-3">{getSurahArabicName(number)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <nav aria-labelledby="related-hubs" className="mt-10 border-t border-line pt-8">
          <h2 id="related-hubs" className="text-lg font-bold text-ink">
            {hub.relatedHeading}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {hub.relatedLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  hrefLang={link.hrefLang}
                  className="font-medium text-brand underline-offset-2 hover:underline"
                >
                  {link.label}
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
