import { renderTopicPage, topicMetadata } from '@/components/topics/TopicPageView';

export const revalidate = 3600;

const SLUG = 'surahs-before-sleeping';

export function generateMetadata() {
  return topicMetadata('en', SLUG);
}

export default function Page() {
  return renderTopicPage('en', { params: Promise.resolve({ slug: SLUG }) });
}
