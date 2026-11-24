import { ContactPageView, contactPageMetadata } from '@/components/contact/ContactPageView';

export const revalidate = 86400;

export const metadata = contactPageMetadata('en');

export default function ContactPage() {
  return <ContactPageView locale="en" />;
}
