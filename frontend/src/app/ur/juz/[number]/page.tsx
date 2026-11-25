import { juzMetadata, renderJuzPage } from '@/components/juz/JuzPageView';

/** Urdu juz (پارہ) pages at /ur/juz/{1-30}. Same data as /juz/{n}, rendered in Urdu. */

interface Props {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ page?: string; trans?: string }>;
}

// No `force-static`: the root layout reads the x-qp-locale header to emit <html lang="ur" dir="rtl">,
// exactly like the other /ur/* routes (/ur/[slug], /ur/[slug]/[ayah]).
export const revalidate = 3600;

export async function generateStaticParams() {
  return Array.from({ length: 30 }, (_, i) => ({ number: String(i + 1) }));
}

export function generateMetadata(props: Props) {
  return juzMetadata({ ...props, locale: 'ur' });
}

export default function UrduJuzPage(props: Props) {
  return renderJuzPage({ ...props, locale: 'ur' });
}
