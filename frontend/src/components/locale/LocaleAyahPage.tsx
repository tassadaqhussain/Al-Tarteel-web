import { notFound, permanentRedirect } from 'next/navigation';
import { ayahStaticParams, renderAyahPage } from '@/components/ayah/AyahPageView';
import { ayahSeo } from '@/lib/seo';
import { localePath, type PrefixedLocale } from '@/lib/i18n/content-locales';
import { getSurahArabicName, getSurahNumberFromSlug, getSurahSlug } from '@/lib/surah-meta';
import { parseAyahNumber } from '@/lib/surah-pagination';

export type LocaleAyahProps = {
  params: Promise<{ slug: string; ayah: string }>;
  searchParams: Promise<{ trans?: string }>;
};

export function localeAyahStaticParams() {
  return ayahStaticParams();
}

export async function localeAyahMetadata(
  locale: PrefixedLocale,
  { params }: LocaleAyahProps,
) {
  const { slug, ayah: ayahStr } = await params;
  const surahNumber = getSurahNumberFromSlug(slug);
  const ayahNumber = surahNumber ? parseAyahNumber(ayahStr, surahNumber) : null;
  if (!surahNumber || !ayahNumber) return {};
  return ayahSeo(surahNumber, ayahNumber, {
    arabicName: getSurahArabicName(surahNumber),
    locale,
  }).metadata;
}

export async function renderLocaleAyah(
  locale: PrefixedLocale,
  { params, searchParams }: LocaleAyahProps,
) {
  const { slug, ayah: ayahStr } = await params;
  const surahNumber = getSurahNumberFromSlug(slug);
  const ayahNumber = surahNumber ? parseAyahNumber(ayahStr, surahNumber) : null;
  if (!surahNumber || !ayahNumber) notFound();

  const canonical = getSurahSlug(surahNumber);
  if (slug !== canonical || ayahStr !== String(ayahNumber)) {
    const sp = await searchParams;
    const qs = sp.trans ? `?trans=${encodeURIComponent(sp.trans)}` : '';
    permanentRedirect(`${localePath(locale, `/${canonical}/${ayahNumber}`)}${qs}`);
  }

  return renderAyahPage({ surahNumber, ayahNumber, searchParams, locale });
}
