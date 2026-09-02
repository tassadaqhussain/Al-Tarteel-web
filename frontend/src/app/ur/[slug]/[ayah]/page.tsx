import {
  localeAyahMetadata,
  localeAyahStaticParams,
  renderLocaleAyah,
  type LocaleAyahProps,
} from '@/components/locale/LocaleAyahPage';

const LOCALE = 'ur' as const;

export const revalidate = 3600;

export const generateStaticParams = localeAyahStaticParams;

export function generateMetadata(props: LocaleAyahProps) {
  return localeAyahMetadata(LOCALE, props);
}

export default function Page(props: LocaleAyahProps) {
  return renderLocaleAyah(LOCALE, props);
}
