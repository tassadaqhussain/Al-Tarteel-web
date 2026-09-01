import {
  localeSurahMetadata,
  localeSurahStaticParams,
  renderLocaleSurah,
  type LocaleSurahProps,
} from '@/components/locale/LocaleSurahPage';

const LOCALE = 'ps' as const;

export const revalidate = 3600;

export const generateStaticParams = localeSurahStaticParams;

export function generateMetadata(props: LocaleSurahProps) {
  return localeSurahMetadata(LOCALE, props);
}

export default function Page(props: LocaleSurahProps) {
  return renderLocaleSurah(LOCALE, props);
}
