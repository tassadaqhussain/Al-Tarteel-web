import { AboutPageView, aboutPageMetadata } from '@/components/about/AboutPageView';

export const revalidate = 86400;

export const metadata = aboutPageMetadata('ps');

export default function PashtoAboutPage() {
  return <AboutPageView locale="ps" />;
}
