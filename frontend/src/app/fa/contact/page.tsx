import { ContactPageView, contactPageMetadata } from '@/components/contact/ContactPageView';

export const revalidate = 86400;

export const metadata = contactPageMetadata('fa');

export default function PersianContactPage() {
  return <ContactPageView locale="fa" />;
}
