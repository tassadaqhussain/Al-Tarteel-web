import { ContactPageView, contactPageMetadata } from '@/components/contact/ContactPageView';

export const revalidate = 86400;

export const metadata = contactPageMetadata('ps');

export default function PashtoContactPage() {
  return <ContactPageView locale="ps" />;
}
