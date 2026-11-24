import { ContactPageView, contactPageMetadata } from '@/components/contact/ContactPageView';

export const revalidate = 86400;

export const metadata = contactPageMetadata('ur');

export default function UrduContactPage() {
  return <ContactPageView locale="ur" />;
}
