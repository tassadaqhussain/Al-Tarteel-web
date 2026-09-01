import { LocaleHome } from '@/components/locale/LocaleHome';
import { buildPageMetadata } from '@/lib/seo';
import { localePath } from '@/lib/i18n/content-locales';
import { LOCALE_LANDING } from '@/lib/i18n/locale-landing';

const LOCALE = 'fa' as const;

export const revalidate = 3600;

export function generateMetadata() {
  const copy = LOCALE_LANDING[LOCALE];
  return buildPageMetadata({
    title: copy.title,
    description: copy.metaDescription,
    path: localePath(LOCALE, '/'),
    locale: LOCALE,
    alternatePath: '/',
  });
}

export default function Page() {
  return <LocaleHome locale={LOCALE} />;
}
