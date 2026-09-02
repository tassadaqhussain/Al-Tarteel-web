import { TranslationHubPage } from '@/components/seo/TranslationHubPage';
import { buildPageMetadata, translationHubHreflang } from '@/lib/seo';
import { getTranslationHub } from '@/lib/i18n/translation-hubs';

const hub = getTranslationHub('pashto');

export const revalidate = 3600;

export function generateMetadata() {
  return buildPageMetadata({
    title: hub.title,
    description: hub.metaDescription,
    path: hub.path,
    keywords: hub.keywords,
    locale: 'ps',
    hreflangLanguages: translationHubHreflang(),
  });
}

export default function Page() {
  return <TranslationHubPage hub={hub} />;
}
