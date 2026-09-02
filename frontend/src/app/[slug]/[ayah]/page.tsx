import { notFound, permanentRedirect } from 'next/navigation';
import { ayahStaticParams, renderAyahPage } from '@/components/ayah/AyahPageView';
import { ayahSeo } from '@/lib/seo';
import { getSurahArabicName, getSurahNumberFromSlug, getSurahSlug } from '@/lib/surah-meta';
import { getSurahAyahCount } from '@/lib/surah-pagination';

interface Props {
  params: Promise<{ slug: string; ayah: string }>;
  searchParams: Promise<{ trans?: string }>;
}

export const revalidate = 3600;
export const dynamic = 'force-static';

export function generateStaticParams() {
  return ayahStaticParams();
}

export async function generateMetadata({ params }: Props) {
  const { slug, ayah: ayahStr } = await params;
  const surahNumber = getSurahNumberFromSlug(slug);
  const ayahNumber = parseInt(ayahStr, 10);
  if (!surahNumber || Number.isNaN(ayahNumber)) return {};
  if (ayahNumber < 1 || ayahNumber > getSurahAyahCount(surahNumber)) return {};
  return ayahSeo(surahNumber, ayahNumber, {
    arabicName: getSurahArabicName(surahNumber),
  }).metadata;
}

export default async function AyahRoutePage({ params, searchParams }: Props) {
  const { slug, ayah: ayahStr } = await params;
  const surahNumber = getSurahNumberFromSlug(slug);
  const ayahNumber = parseInt(ayahStr, 10);
  if (!surahNumber || Number.isNaN(ayahNumber)) notFound();

  const canonical = getSurahSlug(surahNumber);
  if (slug.toLowerCase() !== canonical) {
    const sp = await searchParams;
    const qs = sp.trans ? `?trans=${encodeURIComponent(sp.trans)}` : '';
    permanentRedirect(`/${canonical}/${ayahNumber}${qs}`);
  }

  return renderAyahPage({ surahNumber, ayahNumber, searchParams });
}
