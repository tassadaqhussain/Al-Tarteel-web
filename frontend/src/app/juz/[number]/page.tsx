import { juzMetadata, renderJuzPage } from '@/components/juz/JuzPageView';

interface Props {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ page?: string; trans?: string }>;
}

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function generateStaticParams() {
  return Array.from({ length: 30 }, (_, i) => ({ number: String(i + 1) }));
}

export function generateMetadata(props: Props) {
  return juzMetadata(props);
}

export default function JuzPage(props: Props) {
  return renderJuzPage(props);
}
