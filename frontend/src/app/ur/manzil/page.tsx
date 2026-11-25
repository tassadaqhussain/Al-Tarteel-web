import { renderTopicPage, topicMetadata } from '@/components/topics/TopicPageView';

export const revalidate = 3600;

const SLUG = 'manzil';

export function generateMetadata() {
  return topicMetadata('ur', SLUG);
}

export default function Page() {
  return renderTopicPage('ur', { params: Promise.resolve({ slug: SLUG }) });
}
