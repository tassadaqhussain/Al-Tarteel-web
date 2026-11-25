import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { READER_SHELL } from '@/components/layout/MainContainer';
import { quranApi, type AyahWithRelations } from '@/lib/api';
import { cleanTranslationText } from '@/lib/clean-translation';
import {
  DEFAULT_CONTENT_LOCALE,
  localeConfig,
  localePath,
} from '@/lib/i18n/content-locales';
import { getSurahLocalizedName } from '@/lib/i18n/surah-localized-names';
import { absoluteUrl, buildPageMetadata, SITE_NAME } from '@/lib/seo';
import { getAyahPath, getSurahArabicName, getSurahMeta, getSurahPath } from '@/lib/surah-meta';
import { getSurahAyahCount } from '@/lib/surah-pagination';
import {
  MANZILS,
  TOPICS,
  getTopic,
  manzilSpanLabel,
  topicPath,
  type TopicLocale,
} from '@/lib/topics';

const UI = {
  en: {
    home: 'Home',
    topics: 'Topics',
    surahsHeading: 'Surahs on this page',
    readFull: (n: string) => `Read full Surah ${n}`,
    ayahLink: 'Open ayah',
    versesOf: (from: number, to: number) => (from === to ? `Verse ${from}` : `Verses ${from}–${to}`),
    manzilHeading: 'The seven manzils',
    manzilLabel: (n: number) => `Manzil ${n}`,
    openingVerse: 'Opening verse',
    related: 'More topics',
    otherLanguages: 'Read in other languages:',
    note: 'Arabic text and translation are shown as stored in the Quran database; nothing here is a religious ruling.',
  },
  ur: {
    home: 'ہوم',
    topics: 'موضوعات',
    surahsHeading: 'اس صفحے کی سورتیں',
    readFull: (n: string) => `پوری سورہ ${n} پڑھیں`,
    ayahLink: 'آیت کھولیں',
    versesOf: (from: number, to: number) => (from === to ? `آیت ${from}` : `آیات ${from}–${to}`),
    manzilHeading: 'سات منزلیں',
    manzilLabel: (n: number) => `منزل ${n}`,
    openingVerse: 'ابتدائی آیت',
    related: 'مزید موضوعات',
    otherLanguages: 'دیگر زبانوں میں پڑھیں:',
    note: 'عربی متن اور ترجمہ قرآنی ڈیٹا بیس کے مطابق دکھایا گیا ہے؛ اس صفحے میں کوئی فتویٰ یا شرعی حکم نہیں۔',
  },
} as const;

type Props = { params: Promise<{ slug: string }> };

export function topicMetadata(locale: TopicLocale, slug: string) {
  const topic = getTopic(slug);
  if (!topic) return {};
  const copy = topic.copy[locale];
  return buildPageMetadata({
    title: `${copy.title} | ${SITE_NAME}`,
    description: copy.description,
    path: topicPath(locale, topic.slug),
    locale,
    type: 'article',
    hreflangLanguages: {
      en: absoluteUrl(topicPath('en', topic.slug)),
      ur: absoluteUrl(topicPath('ur', topic.slug)),
      'x-default': absoluteUrl(topicPath(DEFAULT_CONTENT_LOCALE, topic.slug)),
    },
    keywords: [copy.label, copy.h1],
  });
}

async function loadInline(
  surah: number,
  from: number,
  to: number,
  translationSlug: string,
): Promise<AyahWithRelations[]> {
  const rows = await quranApi
    .ayahsBySurah(surah, { page: 1, limit: to, translations: translationSlug, words: false })
    .catch(() => [] as AyahWithRelations[]);
  return (Array.isArray(rows) ? rows : []).filter((a) => a.number >= from && a.number <= to);
}

export async function renderTopicPage(locale: TopicLocale, { params }: Props) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  const copy = topic.copy[locale];
  const ui = UI[locale];
  const cfg = localeConfig(locale);
  const path = topicPath(locale, topic.slug);
  const surahName = (n: number) =>
    locale === 'ur' ? getSurahLocalizedName(n, 'ur') : getSurahMeta(n).nameSimple;

  const sections = await Promise.all(
    topic.inline.map(async (entry) => {
      const count = getSurahAyahCount(entry.surah);
      const from = entry.from ?? 1;
      const to = Math.min(entry.to ?? count, count);
      return {
        ...entry,
        from,
        to,
        count,
        ayahs: await loadInline(entry.surah, from, to, cfg.translationSlug),
      };
    }),
  );

  const surahNumbers = Array.from(new Set(topic.inline.map((i) => i.surah)));

  return (
    <div lang={cfg.hreflang} dir={cfg.dir} className="flex min-h-screen flex-col bg-surface-app">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: copy.h1,
          description: copy.description,
          url: absoluteUrl(path),
          inLanguage: cfg.hreflang,
          isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: absoluteUrl('/') },
        }}
      />
      <Header />
      <main className={`${READER_SHELL} flex-1 py-6 pb-16 sm:py-8`}>
        <Breadcrumbs
          items={[
            { name: ui.home, path: localePath(locale, '/') },
            { name: copy.label, path },
          ]}
        />
        <h1 className="mt-4 text-2xl font-extrabold text-ink sm:text-3xl">{copy.h1}</h1>
        {copy.intro.map((p) => (
          <p key={p.slice(0, 24)} className="mt-4 text-sm leading-7 text-ink-2 sm:text-base">
            {p}
          </p>
        ))}

        {topic.slug === 'manzil' && (
          <section aria-labelledby="manzil-list" className="mt-8">
            <h2 id="manzil-list" className="text-lg font-bold text-ink">
              {ui.manzilHeading}
            </h2>
            <ol className="mt-3 space-y-2">
              {MANZILS.map((m) => (
                <li key={m.n} className="rounded-lg border border-line bg-surface px-4 py-3 text-sm">
                  <span className="font-semibold text-ink">{ui.manzilLabel(m.n)}</span>
                  <span className="text-ink-2"> — {manzilSpanLabel(locale, m)}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {surahNumbers.length > 1 && (
          <nav aria-label={ui.surahsHeading} className="mt-6 flex flex-wrap gap-2">
            {surahNumbers.map((n) => (
              <Link
                key={n}
                href={localePath(locale, getSurahPath(n))}
                className="rounded-full border border-line bg-surface-2 px-3 py-1 text-xs font-medium text-ink-2 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {n}. {surahName(n)}
              </Link>
            ))}
          </nav>
        )}

        {sections.map((sec, i) => (
          <section
            key={`${sec.surah}-${sec.from}-${i}`}
            aria-labelledby={`sec-${i}`}
            className="mt-8 rounded-xl border border-line bg-surface p-5 sm:p-6"
          >
            <h2 id={`sec-${i}`} className="text-lg font-bold text-ink">
              <Link href={localePath(locale, getSurahPath(sec.surah))} className="hover:underline">
                {sec.surah}. {surahName(sec.surah)}
              </Link>{' '}
              <span className="font-arabic text-base text-ink-3" dir="rtl" lang="ar">
                {getSurahArabicName(sec.surah)}
              </span>
              <span className="block text-xs font-medium text-ink-muted">
                {topic.slug === 'manzil'
                  ? `${ui.manzilLabel(i + 1)} — ${ui.openingVerse}`
                  : ui.versesOf(sec.from, sec.to)}
              </span>
            </h2>
            {sec.ayahs.length > 0 && (
              <ol className="mt-4 space-y-4">
                {sec.ayahs.map((a) => {
                  const tr =
                    a.translations?.find((t) => t.translatorSlug === cfg.translationSlug) ??
                    a.translations?.[0];
                  return (
                    <li key={a.id} className="border-t border-line-subtle pt-4 first:border-t-0 first:pt-0">
                      <p dir="rtl" lang="ar" className="font-arabic text-2xl leading-loose text-ink">
                        {a.textUthmani}
                      </p>
                      {tr?.text ? (
                        <p className="mt-2 text-sm leading-7 text-ink-2 sm:text-base">
                          {cleanTranslationText(tr.text)}
                        </p>
                      ) : null}
                      <Link
                        href={localePath(locale, getAyahPath(sec.surah, a.number))}
                        className="mt-1 inline-block text-xs font-semibold text-[var(--accent)] hover:underline"
                      >
                        {sec.surah}:{a.number} · {ui.ayahLink}
                      </Link>
                    </li>
                  );
                })}
              </ol>
            )}
            <Link
              href={localePath(locale, getSurahPath(sec.surah))}
              className="mt-4 inline-block text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              {ui.readFull(surahName(sec.surah))}
            </Link>
          </section>
        ))}

        <nav aria-label={ui.related} className="mt-10">
          <h2 className="text-base font-bold text-ink">{ui.related}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {TOPICS.filter((t) => t.slug !== topic.slug).map((t) => (
              <li key={t.slug}>
                <Link
                  href={topicPath(locale, t.slug)}
                  className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-2 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {t.copy[locale].label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={ui.otherLanguages} className="mt-6 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
          <span className="font-medium text-ink-3">{ui.otherLanguages}</span>
          {(['en', 'ur'] as const)
            .filter((l) => l !== locale)
            .map((l) => (
              <Link
                key={l}
                href={topicPath(l, topic.slug)}
                hrefLang={localeConfig(l).hreflang}
                prefetch={false}
                className="rounded border border-line bg-surface px-2.5 py-1 font-medium text-ink-2 hover:border-[var(--accent)]"
              >
                {localeConfig(l).nativeName}
              </Link>
            ))}
        </nav>
        <p className="mt-6 text-xs text-ink-muted">{ui.note}</p>
      </main>
      <SiteFooter />
    </div>
  );
}
