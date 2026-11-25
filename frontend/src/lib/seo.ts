import type { Metadata } from 'next';
import { getSurahPath, SURAH_MEANINGS, SURAH_SIMPLE_NAMES, getAyahPath } from '@/lib/surah-meta';
import { SURAH_PAGE_SIZE } from '@/lib/surah-pagination';
import { surahCopy } from '@/lib/i18n/seo-strings';
import { getJuzMeta } from '@/lib/juz-meta';
import { JUZ_LOCALES, juzPath, juzUrCopy } from '@/lib/i18n/juz-copy';
import {
  featuredAyahList,
  indexableAyahLocales,
  isAyahIndexable,
  isFeaturedAyah,
  languageIndexesAllAyahs,
} from '@/lib/seo/ayah-policy';
import { getSurahLocalizedName } from '@/lib/i18n/surah-localized-names';
import { popularSurahSeoOverride } from '@/lib/i18n/surah-seo-overrides';
import {
  CONTENT_LOCALES,
  DEFAULT_CONTENT_LOCALE,
  localeConfig,
  localePath,
  type ContentLocale,
} from '@/lib/i18n/content-locales';

/** Primary production origin — used for canonicals, OG, sitemap. */
export const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL || 'https://quranpilot.com').replace(/\/$/, '');

export const SITE_NAME = 'QuranPilot';

export const DEFAULT_DESCRIPTION =
  'Read the Holy Quran online with Arabic Uthmani text, English translation, and verse-by-verse audio. Browse all 114 surahs on QuranPilot.';

export const DEFAULT_KEYWORDS = [
  'Quran',
  'Holy Quran',
  'Quran online',
  'read Quran',
  'read Quran online',
  'Quran translation',
  'Quran audio',
  'listen to Quran',
  'Surah',
  'ayah',
  'Islamic',
  'QuranPilot',
  'Uthmani script',
  'Quran English translation',
];

/** Default OG/Twitter image from `app/opengraph-image.tsx`. */
export const DEFAULT_OG_IMAGE_PATH = '/opengraph-image';

export function absoluteUrl(path = '/'): string {
  if (!path || path === '/') return SITE_URL;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** OG locale codes for the locales we publish. */
const OG_LOCALES: Record<ContentLocale, string> = {
  en: 'en_US',
  ur: 'ur_PK',
  ps: 'ps_AF',
  fa: 'fa_IR',
};

export function openGraphLocale(locale: ContentLocale): string {
  return OG_LOCALES[locale] ?? OG_LOCALES[DEFAULT_CONTENT_LOCALE];
}

/**
 * hreflang set for a page that exists in every content locale.
 *
 * Returns undefined when `alternatePath` is omitted, so single-locale pages
 * emit no alternates rather than claiming translations that do not exist.
 * Every locale in the set points at the others AND at itself, and English
 * doubles as x-default — both required for Google to honour the cluster.
 */
export function hreflangAlternates(
  alternatePath?: string,
): Record<string, string> | undefined {
  if (!alternatePath) return undefined;
  const languages: Record<string, string> = {};
  for (const code of CONTENT_LOCALES) {
    languages[localeConfig(code).hreflang] = absoluteUrl(localePath(code, alternatePath));
  }
  languages['x-default'] = absoluteUrl(localePath(DEFAULT_CONTENT_LOCALE, alternatePath));
  return languages;
}

export function buildPageMetadata({
  title,
  description,
  path = '/',
  keywords = [],
  noIndex = false,
  type = 'website',
  locale = DEFAULT_CONTENT_LOCALE,
  alternatePath,
  hreflangLanguages,
  image,
  publishedTime,
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  type?: 'website' | 'article';
  image?: { path: string; alt: string };
  publishedTime?: string;
  /** Locale this page is written in — drives og:locale and the hreflang set. */
  locale?: ContentLocale;
  /**
   * Unprefixed path this page exists at in every locale (e.g. `/al-ikhlas`).
   * Omit for pages that exist in one locale only — they get no hreflang set.
   */
  alternatePath?: string;
  /** Custom hreflang map when sibling URLs are not locale-prefixed variants of one path. */
  hreflangLanguages?: Record<string, string>;
}): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = title.includes(SITE_NAME) ? title : undefined;
  const ogTitle = fullTitle || `${title} | ${SITE_NAME}`;
  const ogImage = image ? { url: absoluteUrl(image.path), alt: image.alt } : {
    url: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
    width: 1200,
    height: 630,
    alt: `${SITE_NAME} — Holy Quran`,
  };
  return {
    title: fullTitle ? { absolute: fullTitle } : title,
    description,
    keywords: [...DEFAULT_KEYWORDS, ...keywords],
    alternates: {
      canonical: url,
      languages: hreflangLanguages ?? hreflangAlternates(alternatePath),
    },
    robots: noIndex
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : {
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
    openGraph: {
      type,
      ...(type === 'article' && publishedTime ? { publishedTime } : {}),
      url,
      siteName: SITE_NAME,
      title: ogTitle,
      description,
      locale: openGraphLocale(locale),
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [ogImage.url],
    },
  };
}

export function surahSeo(
  number: number,
  opts?: {
    ayahCount?: number;
    arabicName?: string;
    page?: number;
    locale?: ContentLocale;
  }
) {
  const locale = opts?.locale ?? DEFAULT_CONTENT_LOCALE;
  const englishName = SURAH_SIMPLE_NAMES[number] || `Surah ${number}`;
  const name = locale === 'en' ? englishName : getSurahLocalizedName(number, locale);
  const meaning = SURAH_MEANINGS[number];
  const arabic = opts?.arabicName || '';
  const ayahs = opts?.ayahCount ?? 0;
  const path = getSurahPath(number);
  const page = opts?.page && opts.page > 1 ? opts.page : 1;
  const range =
    page > 1 && ayahs > 0
      ? {
          start: (page - 1) * SURAH_PAGE_SIZE + 1,
          end: Math.min(ayahs, page * SURAH_PAGE_SIZE),
        }
      : null;

  const copy =
    popularSurahSeoOverride(number, locale, range) ??
    surahCopy(locale, { name, meaning: meaning || '', arabic, ayahCount: ayahs }, range);
  const title = `${copy.title} | ${SITE_NAME}`;
  const description = copy.description;

  // Canonical stays inside this locale; hreflang points at the sibling locales.
  const localisedPath = localePath(locale, path);
  const canonicalPath = page > 1 ? `${localisedPath}?page=${page}` : localisedPath;

  return {
    number,
    name: englishName,
    meaning,
    arabic,
    path,
    metadata: buildPageMetadata({
      title,
      description,
      path: canonicalPath,
      keywords: [
        `Surah ${englishName}`,
        englishName,
        name !== englishName ? name : '',
        arabic,
        meaning,
        `Surah ${number}`,
        range ? `verses ${range.start}-${range.end}` : '',
        'read Surah',
        'listen Quran',
        'Quran chapter',
      ].filter(Boolean) as string[],
      type: 'article',
      locale,
      noIndex: page > 1,
      // Only page 1 is indexed and carries reciprocal language alternates; ?page=N is noindex, follow.
      alternatePath: page > 1 ? undefined : path,
    }),
  };
}

/**
 * Unique metadata for Juz pages — ?page=N is consistently noindex, follow.
 * hreflang lists only the languages that really have a juz page (see JUZ_LOCALES).
 */
export function juzSeo(juzNumber: number, page = 1, locale: ContentLocale = DEFAULT_CONTENT_LOCALE) {
  const p = page > 1 ? page : 1;
  const meta = getJuzMeta(juzNumber);
  const basePath = juzPath(locale, juzNumber);
  const path = p > 1 ? `${basePath}?page=${p}` : basePath;

  const hreflang: Record<string, string> = {};
  for (const loc of JUZ_LOCALES) {
    hreflang[localeConfig(loc).hreflang] = absoluteUrl(juzPath(loc, juzNumber));
  }
  hreflang['x-default'] = absoluteUrl(juzPath(DEFAULT_CONTENT_LOCALE, juzNumber));
  const hreflangLanguages = p > 1 ? undefined : hreflang;

  if (locale === 'ur') {
    const copy = juzUrCopy(juzNumber, p);
    return buildPageMetadata({
      title: copy.title,
      description: copy.description,
      path,
      noIndex: p > 1,
      hreflangLanguages,
      locale,
      keywords: [
        `پارہ ${juzNumber}`,
        `${copy.label} اردو ترجمہ`,
        meta.nameArabic,
        'قرآن پارے',
        `Para ${juzNumber}`,
      ].filter(Boolean),
      type: 'article',
    });
  }

  const span = meta.startRef && meta.endRef ? `${meta.startRef} to ${meta.endRef}` : '';
  const title =
    p > 1
      ? `Juz ${juzNumber} (${meta.name}) – Page ${p} | ${SITE_NAME}`
      : `Juz ${juzNumber} (${meta.name})${span ? ` – ${span}` : ''} | ${SITE_NAME}`;
  const description =
    p > 1
      ? `Continue reading Juz ${juzNumber} (${meta.name}, ${span}) — page ${p} with Uthmani Arabic text, English translation, and audio on QuranPilot.`
      : `Read Juz ${juzNumber} (${meta.name}, Para ${juzNumber}) of the Holy Quran, from ${span}, with Uthmani Arabic script, English translation, and verse-by-verse audio on QuranPilot.`;

  return buildPageMetadata({
    title,
    description,
    path,
    noIndex: p > 1,
    hreflangLanguages,
    keywords: [
      `Juz ${juzNumber}`,
      `Para ${juzNumber}`,
      meta.name,
      meta.nameArabic,
      'Quran juz',
      'Quran para',
    ].filter(Boolean),
    type: 'article',
  });
}

/** Featured ayahs (see `seo/ayah-policy`) — used for static generation. */
export const FAMOUS_AYAHS: { surah: number; ayah: number }[] = featuredAyahList();

const AYAH_SEO_NAMES: Partial<Record<string, Partial<Record<ContentLocale, string>>>> = {
  '2:255': {
    en: 'Ayatul Kursi (Verse of the Throne)',
    ur: 'آیت الکرسی اردو ترجمہ کے ساتھ',
    ps: 'آیت الکرسي له پښتو ژباړې سره',
    fa: 'آیت الکرسی با ترجمه فارسی',
  },
  '2:285': {
    en: 'Last 2 Ayahs of Surah Al-Baqarah (Amanar-Rasul)',
    ur: 'سورہ البقرہ کی آخری دو آیات (آمن الرسول)',
    ps: 'د سورت البقرې وروستي دوه آیتونه (آمن الرسول)',
    fa: 'دو آیه پایانی سوره بقره (آمن الرسول)',
  },
  '2:286': {
    en: 'Last Ayah of Surah Al-Baqarah (La Yukallifullahu)',
    ur: 'سورہ البقرہ کی آخری آیت (لا یکلف اللہ)',
    ps: 'د سورت البقرې وروستی آیت',
    fa: 'آخرین آیه سوره بقره (لا یکلف الله)',
  },
  '24:35': {
    en: 'Light Verse (Ayat an-Nur)',
    ur: 'آیت نور',
    ps: 'د نور آیت',
    fa: 'آیه نور',
  },
  '3:18': {
    en: 'Shahada Verse',
    ur: 'آیت شہادت',
    ps: 'د شهادت آیت',
    fa: 'آیه شهادت',
  },
};

function ayahSeoName(surah: number, ayah: number, locale: ContentLocale): string | null {
  return AYAH_SEO_NAMES[`${surah}:${ayah}`]?.[locale] ?? AYAH_SEO_NAMES[`${surah}:${ayah}`]?.en ?? null;
}

export function isVersePageIndexed(locale: ContentLocale): boolean {
  return languageIndexesAllAyahs(locale);
}

export { isFeaturedAyah };

export function isAyahPageIndexed(locale: ContentLocale, surah: number, ayah: number): boolean {
  return isAyahIndexable(locale, surah, ayah);
}

/** Localized "Surah X Ayah N" label — also the page name when an ayah has no special name. */
export function ayahLabel(
  locale: ContentLocale,
  surahNumber: number,
  ayahNumber: number,
): string {
  const en = SURAH_SIMPLE_NAMES[surahNumber] || `Surah ${surahNumber}`;
  const name = locale === 'en' ? en : getSurahLocalizedName(surahNumber, locale);
  if (locale === 'ur') return `سورہ ${name} آیت ${ayahNumber}`;
  if (locale === 'ps') return `د سورت ${name} آیت ${ayahNumber}`;
  if (locale === 'fa') return `سوره ${name} آیه ${ayahNumber}`;
  return `Surah ${en} Ayah ${ayahNumber}`;
}

export function ayahSeo(
  surahNumber: number,
  ayahNumber: number,
  opts?: {
    arabicName?: string;
    locale?: ContentLocale;
    /** First ~120 chars of this ayah's translation in the page language (never invented). */
    translationSnippet?: string;
  },
) {
  const locale = opts?.locale ?? DEFAULT_CONTENT_LOCALE;
  const englishSurah = SURAH_SIMPLE_NAMES[surahNumber] || `Surah ${surahNumber}`;
  const localizedSurah = locale === 'en' ? englishSurah : getSurahLocalizedName(surahNumber, locale);
  const famousName = ayahSeoName(surahNumber, ayahNumber, locale);
  const path = getAyahPath(surahNumber, ayahNumber);
  const localisedPath = localePath(locale, path);

  const heading = famousName
    ? `${famousName} — ${localizedSurah} ${surahNumber}:${ayahNumber}`
    : `${ayahLabel(locale, surahNumber, ayahNumber)} (${surahNumber}:${ayahNumber})`;
  const titles: Record<ContentLocale, string> = {
    en: `Surah ${englishSurah} Ayah ${ayahNumber} (${surahNumber}:${ayahNumber}) – Arabic, Translation & Audio`,
    ur: `${ayahLabel('ur', surahNumber, ayahNumber)} اردو ترجمہ کے ساتھ`,
    ps: `${ayahLabel('ps', surahNumber, ayahNumber)} له پښتو ژباړې سره`,
    fa: `${ayahLabel('fa', surahNumber, ayahNumber)} با ترجمه فارسی`,
  };
  const title = `${famousName ? heading : titles[locale]} | ${SITE_NAME}`;

  const reference = `${localizedSurah} ${surahNumber}:${ayahNumber}`;
  const descriptions: Record<ContentLocale, string> = {
    en: `Read ${famousName ? `${famousName} (${reference})` : reference} with Arabic Uthmani text, English translation, and verse-by-verse Quran audio on QuranPilot.`,
    ur: `${famousName ? `${famousName} — ` : ''}${reference} عربی عثمانی متن، اردو ترجمہ اور آیت بہ آیت تلاوت کے ساتھ QuranPilot پر پڑھیں اور سنیں۔`,
    ps: `${famousName ? `${famousName} — ` : ''}${reference} په QuranPilot کې له عربي عثماني متن، پښتو ژباړې او د آیت له تلاوت سره ولولئ او واورئ.`,
    fa: `${famousName ? `${famousName} — ` : ''}${reference} را با متن عربی عثمانی، ترجمه فارسی و تلاوت آیه به آیه در QuranPilot بخوانید و بشنوید.`,
  };
  const snippet = opts?.translationSnippet?.trim();
  const snippetDescriptions: Record<ContentLocale, string> = {
    en: `${famousName ? `${famousName} — ` : ''}${reference}: ${snippet} Read with Arabic Uthmani text and verse audio on QuranPilot.`,
    ur: `${famousName ? `${famousName} — ` : ''}${reference}: ${snippet} عربی متن اور آیت کی تلاوت کے ساتھ QuranPilot پر پڑھیں۔`,
    ps: `${famousName ? `${famousName} — ` : ''}${reference}: ${snippet} له عربي متن او د آیت له تلاوت سره په QuranPilot کې ولولئ.`,
    fa: `${famousName ? `${famousName} — ` : ''}${reference}: ${snippet} با متن عربی و تلاوت آیه در QuranPilot بخوانید.`,
  };
  const description = snippet ? snippetDescriptions[locale] : descriptions[locale];

  const indexedAyahLocales = indexableAyahLocales(surahNumber, ayahNumber);
  // A noindex page must not advertise itself in a hreflang cluster, and the indexable versions
  // never list it either (they only list indexable locales).
  const ayahHreflang =
    isAyahPageIndexed(locale, surahNumber, ayahNumber) && indexedAyahLocales.length > 1
      ? Object.fromEntries([
          ...indexedAyahLocales.map((loc) => [
            localeConfig(loc).hreflang,
            absoluteUrl(localePath(loc, path)),
          ]),
          ['x-default', absoluteUrl(localePath(DEFAULT_CONTENT_LOCALE, path))],
        ])
      : undefined;

  return {
    path,
    heading,
    metadata: buildPageMetadata({
      title,
      description,
      path: localisedPath,
      keywords: [
        famousName || '',
        `${englishSurah} ${ayahNumber}`,
        `${englishSurah} ${surahNumber}:${ayahNumber}`,
        localizedSurah,
        opts?.arabicName || '',
        'Quran ayah',
        'read Quran online',
      ].filter(Boolean) as string[],
      type: 'article',
      noIndex: !isAyahPageIndexed(locale, surahNumber, ayahNumber),
      locale,
      hreflangLanguages: ayahHreflang,
    }),
  };
}

export function ayahJsonLd(input: {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  path: string;
  locale?: ContentLocale;
  /** Localized page description (same text as the meta description). */
  description?: string;
  /** Localized page name (e.g. «آیت الکرسی اردو ترجمہ کے ساتھ — البقرہ 2:255»). */
  pageName?: string;
}) {
  const locale = input.locale ?? DEFAULT_CONTENT_LOCALE;
  const famousName = ayahSeoName(input.surahNumber, input.ayahNumber, locale);
  const url = absoluteUrl(localePath(locale, input.path));
  const name = famousName || `${input.surahName} ${input.surahNumber}:${input.ayahNumber}`;
  const lang = localeConfig(locale).hreflang;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: input.pageName || name,
      description:
        input.description ||
        `Verse ${input.ayahNumber} of Surah ${input.surahName} in the Holy Quran.`,
      url,
      inLanguage: lang,
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name,
      description: `Verse ${input.ayahNumber} of Surah ${input.surahName} in the Holy Quran.`,
      inLanguage: locale === 'en' ? 'ar' : locale,
      isPartOf: {
        '@type': 'Book',
        name: 'The Holy Quran',
        inLanguage: 'ar',
      },
      position: input.ayahNumber,
      url,
      mainEntityOfPage: url,
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
  ];
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: ['en', 'ar', 'ur', 'ps', 'fa'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function organizationJsonLd() {
  const sameAs = (process.env.NEXT_PUBLIC_SOCIAL_PROFILES || '')
    .split(',')
    .map((u) => u.trim())
    .filter((u) => u.startsWith('https://'));

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/images/logo.png'),
    description: 'Free online Quran reader with translations and audio.',
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function surahJsonLd(input: {
  number: number;
  name: string;
  arabic?: string;
  meaning?: string;
  ayahCount?: number;
  path: string;
  locale?: ContentLocale;
  description?: string;
}) {
  const locale = input.locale ?? DEFAULT_CONTENT_LOCALE;
  const localizedName = getSurahLocalizedName(input.number, locale);
  const displayName = locale === 'en' ? `Surah ${input.name}` : localizedName;
  const url = absoluteUrl(input.path);
  const desc =
    input.description ||
    `Chapter ${input.number} of the Holy Quran${input.ayahCount ? ` with ${input.ayahCount} verses` : ''}.`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: displayName,
      description: desc,
      url,
      inLanguage: localeConfig(locale).hreflang,
      isPartOf: {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: displayName,
      alternateName: [input.arabic, input.meaning, localizedName].filter(Boolean),
      description: desc,
      inLanguage: localeConfig(locale).hreflang,
      isPartOf: {
        '@type': 'Book',
        name: 'The Holy Quran',
        inLanguage: 'ar',
      },
      position: input.number,
      url,
      mainEntityOfPage: url,
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
  ];
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(
  faqs: { question: string; answer: string }[],
  inLanguage?: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    ...(inLanguage ? { inLanguage } : {}),
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  image?: string;
  category?: string;
}) {
  const url = absoluteUrl(`/articles/${input.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    datePublished: input.publishedAt,
    image: input.image ? absoluteUrl(input.image) : absoluteUrl(DEFAULT_OG_IMAGE_PATH),
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: absoluteUrl('/images/logo.png'),
    },
    inLanguage: 'en',
    articleSection: input.category || 'Islam',
    isAccessibleForFree: true,
    mainEntityOfPage: url,
    url,
  };
}

export function learningPlanJsonLd(input: {
  title: string;
  summary: string;
  slug: string;
  days: number;
}) {
  const url = absoluteUrl(`/learning-plans/${input.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: input.title,
    description: input.summary,
    educationalLevel: 'Beginner to Intermediate',
    isAccessibleForFree: true,
    inLanguage: 'en',
    url,
    mainEntityOfPage: url,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: `P${input.days}D`,
    },
  };
}

export function tajweedLessonJsonLd(input: {
  name: string;
  nameArabic: string;
  summary: string;
  slug: string;
}) {
  const url = absoluteUrl(`/tajweed/${input.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${input.name} – Tajweed Lesson`,
    name: input.name,
    alternateName: input.nameArabic,
    description: input.summary,
    inLanguage: 'en',
    articleSection: 'Tajweed',
    isAccessibleForFree: true,
    url,
    mainEntityOfPage: url,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: absoluteUrl('/images/logo.png'),
    },
  };
}

