import type { Metadata } from 'next';
import { getLearningPlan, LEARNING_PLANS } from '@/lib/learning-plans';
import { buildPageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return LEARNING_PLANS.map((plan) => ({ slug: plan.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const plan = getLearningPlan(slug);
  if (!plan) {
    return buildPageMetadata({
      title: 'Learning Plan',
      description: 'Quran learning plan on QuranPilot.',
      path: `/learning-plans/${slug}`,
    });
  }
  return buildPageMetadata({
    title: plan.title,
    description: plan.summary,
    path: `/learning-plans/${plan.slug}`,
    keywords: [plan.title, 'Quran learning plan', `${plan.days} day plan`],
    type: 'article',
  });
}

export default function LearningPlanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
