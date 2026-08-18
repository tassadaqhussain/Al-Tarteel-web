import { notFound, permanentRedirect } from 'next/navigation';
import SurahPage, { generateMetadata as generateSurahMetadata } from '@/app/surah/[number]/page';
import { getSurahNumberFromSlug, getSurahSlug } from '@/lib/surah-meta';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; trans?: string }>;
}

export const revalidate = 3600;

export function generateStaticParams() {
  return Array.from({ length: 114 }, (_, index) => ({ slug: getSurahSlug(index + 1) }));
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { slug } = await params;
  const number = getSurahNumberFromSlug(slug);
  if (!number) return {};
  return generateSurahMetadata({
    params: Promise.resolve({ number: String(number) }),
    searchParams,
  });
}

export default async function CleanSurahPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const number = getSurahNumberFromSlug(slug);
  if (!number) notFound();

  const canonical = getSurahSlug(number);
  if (slug.toLowerCase() !== canonical) {
    const qs = new URLSearchParams();
    const sp = await searchParams;
    if (sp.page) qs.set('page', sp.page);
    if (sp.trans) qs.set('trans', sp.trans);
    const query = qs.toString();
    permanentRedirect(query ? `/${canonical}?${query}` : `/${canonical}`);
  }

  return SurahPage({ params: Promise.resolve({ number: String(number) }), searchParams });
}
