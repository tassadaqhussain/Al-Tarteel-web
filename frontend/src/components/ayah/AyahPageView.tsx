import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { quranApi } from '@/lib/api';
import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';
import { AyahBlock } from '@/components/reader/AyahBlock';
import { CleanTranslationUrl } from '@/components/reader/CleanTranslationUrl';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  DEFAULT_CONTENT_LOCALE,
  localeConfig,
  localePath,
  type ContentLocale,
} from '@/lib/i18n/content-locales';
import { getSurahLocalizedName } from '@/lib/i18n/surah-localized-names';
import { FAMOUS_AYAHS, ayahJsonLd, ayahSeo } from '@/lib/seo';
import {
  getAyahPath,
  getSurahArabicName,
  getSurahMeta,
  getSurahPath,
  getSurahSlug,
} from '@/lib/surah-meta';
import { getSurahAyahCount } from '@/lib/surah-pagination';
import { resolveTranslations } from '@/lib/translation-preference';
import { READER_SHELL } from '@/components/layout/MainContainer';

export type AyahPageProps = {
  surahNumber: number;
  ayahNumber: number;
  searchParams: Promise<{ trans?: string }>;
  locale?: ContentLocale;
};

export const revalidate = 3600;
export const dynamic = 'force-static';

export function ayahStaticParams() {
  return FAMOUS_AYAHS.map(({ surah, ayah }) => ({
    slug: getSurahSlug(surah),
    ayah: String(ayah),
  }));
}

export async function renderAyahPage({
  surahNumber,
  ayahNumber,
  searchParams,
  locale,
}: AyahPageProps) {
  const activeLocale = locale ?? DEFAULT_CONTENT_LOCALE;
  const { trans } = await searchParams;

  const ayahCount = getSurahAyahCount(surahNumber);
  if (ayahNumber < 1 || ayahNumber > ayahCount) notFound();

  const effectiveTranslations = resolveTranslations({
    cookieValue: undefined,
    queryTrans: trans,
    defaultSlug: localeConfig(activeLocale).translationSlug,
  });

  const [surah, ayah] = await Promise.all([
    quranApi.surah(surahNumber).catch(() => null),
    quranApi
      .ayah(surahNumber, ayahNumber, { translations: effectiveTranslations, words: true })
      .catch(() => null),
  ]);

  if (!ayah) notFound();

  const meta = getSurahMeta(surahNumber, surah?.nameSimple);
  const arabicName = getSurahArabicName(surahNumber, surah?.nameArabic);
  const displayName =
    activeLocale === 'en' ? meta.nameSimple : getSurahLocalizedName(surahNumber, activeLocale);
  const ayahPath = localePath(activeLocale, getAyahPath(surahNumber, ayahNumber));
  const surahPath = localePath(activeLocale, getSurahPath(surahNumber));

  const prevHref =
    ayahNumber > 1
      ? localePath(activeLocale, getAyahPath(surahNumber, ayahNumber - 1))
      : surahNumber > 1
        ? localePath(activeLocale, getAyahPath(surahNumber - 1, getSurahAyahCount(surahNumber - 1)))
        : null;
  const nextHref =
    ayahNumber < ayahCount
      ? localePath(activeLocale, getAyahPath(surahNumber, ayahNumber + 1))
      : surahNumber < 114
        ? localePath(activeLocale, getAyahPath(surahNumber + 1, 1))
        : null;

  const jsonLd = ayahJsonLd({
    surahNumber,
    ayahNumber,
    surahName: meta.nameSimple,
    path: getAyahPath(surahNumber, ayahNumber),
    locale: activeLocale,
  });

  return (
    <div className="flex min-h-screen flex-col bg-surface-app">
      <Header />
      <CleanTranslationUrl />
      <JsonLd data={jsonLd} />
      <main lang={activeLocale} className={`${READER_SHELL} flex-1 py-6 sm:py-8`}>
        <Breadcrumbs
          items={[
            { name: 'Home', path: localePath(activeLocale, '/') },
            { name: 'Quran', path: activeLocale === 'en' ? '/surahs' : localePath(activeLocale, '/') },
            { name: displayName, path: surahPath },
            { name: `Ayah ${ayahNumber}`, path: ayahPath },
          ]}
        />

        <header className="mt-6 border-b border-line pb-6">
          <p className="font-arabic text-2xl font-bold text-ink sm:text-3xl">{arabicName}</p>
          <h1 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
            {ayahSeo(surahNumber, ayahNumber, { locale: activeLocale }).heading}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            <Link href={surahPath} className="font-semibold text-brand hover:underline">
              {activeLocale === 'en' ? `Read full Surah ${meta.nameSimple}` : `Read full ${displayName}`}
            </Link>
          </p>
        </header>

        <div className="mt-8">
          <AyahBlock
            ayah={ayah}
            surahNumber={surahNumber}
            surahName={meta.nameSimple}
            hasTranslations={Boolean(ayah.translations?.length)}
          />
        </div>

        <nav
          aria-label="Ayah navigation"
          className="mt-10 flex flex-col items-stretch justify-between gap-4 border-t border-line pt-8 sm:flex-row"
        >
          {prevHref ? (
            <Link
              href={prevHref}
              className="inline-flex items-center gap-2 rounded-[4px] border border-line bg-surface px-4 py-3 text-sm font-semibold text-ink shadow-xs transition hover:border-[var(--accent)]"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous ayah
            </Link>
          ) : (
            <span />
          )}
          {nextHref ? (
            <Link
              href={nextHref}
              className="inline-flex items-center justify-end gap-2 rounded-[4px] border border-line bg-surface px-4 py-3 text-sm font-semibold text-ink shadow-xs transition hover:border-[var(--accent)] sm:ml-auto"
            >
              Next ayah
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : null}
        </nav>
      </main>
      <SiteFooter />
    </div>
  );
}
