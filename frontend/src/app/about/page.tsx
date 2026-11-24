import { AboutPageView, aboutPageMetadata } from '@/components/about/AboutPageView';

export const revalidate = 86400;

export const metadata = aboutPageMetadata('en');

export default function AboutPage() {
  return <AboutPageView locale="en" />;
}
