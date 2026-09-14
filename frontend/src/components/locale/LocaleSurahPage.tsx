import { notFound, permanentRedirect } from 'next/navigation';
import SurahPage, { generateMetadata as generateSurahMetadata } from '@/app/surah/[number]/page';
import { getSurahNumberFromSlug, getSurahSlug } from '@/lib/surah-meta';
import { localePath, type PrefixedLocale } from '@/lib/i18n/content-locales';

/**
 * Shared implementation behind /ur/[slug], /ps/[slug] and /fa/[slug].
 *
 * Mirrors the root `app/[slug]` route (same slug canonicalisation and redirect
 * behaviour) but renders in the prefixed locale and keeps redirects inside it.
 */

export type LocaleSurahProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; trans?: string }>;
};

export function localeSurahStaticParams() {
  return Array.from({ length: 114 }, (_, index) => ({ slug: getSurahSlug(index + 1) }));
}

export async function localeSurahMetadata(
  locale: PrefixedLocale,
  { params, searchParams }: LocaleSurahProps,
) {
  const { slug } = await params;
  const number = getSurahNumberFromSlug(slug);
  if (!number) return {};
  return generateSurahMetadata({
    params: Promise.resolve({ number: String(number) }),
    searchParams,
    locale,
  });
}

export async function renderLocaleSurah(
  locale: PrefixedLocale,
  { params, searchParams }: LocaleSurahProps,
) {
  const { slug } = await params;
  const number = getSurahNumberFromSlug(slug);
  if (!number) notFound();

  const canonical = getSurahSlug(number);
  if (slug !== canonical) {
    const qs = new URLSearchParams();
    const sp = await searchParams;
    if (sp.page) qs.set('page', sp.page);
    if (sp.trans) qs.set('trans', sp.trans);
    const query = qs.toString();
    const target = localePath(locale, `/${canonical}`);
    permanentRedirect(query ? `${target}?${query}` : target);
  }

  return SurahPage({
    params: Promise.resolve({ number: String(number) }),
    searchParams,
    locale,
  });
}
