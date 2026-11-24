import { AboutPageView, aboutPageMetadata } from '@/components/about/AboutPageView';

export const revalidate = 86400;

export const metadata = aboutPageMetadata('fa');

export default function PersianAboutPage() {
  return <AboutPageView locale="fa" />;
}
