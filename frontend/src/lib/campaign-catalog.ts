import { ARTICLES } from '@/lib/articles';
import { getFeaturedLearningPlans } from '@/lib/learning-plans';
import { getSurahPath } from '@/lib/surah-meta';
import { TAJWEED_LESSONS } from '@/lib/tajweed/rules';

export const IN_APP_CHANNELS = [
  { id: 'in_app_global', label: 'Site-wide banner', hint: 'Every public page' },
  { id: 'in_app_home', label: 'Homepage', hint: 'Landing only' },
  { id: 'in_app_reader', label: 'Quran reader', hint: 'Surah and Juz pages' },
  { id: 'in_app_tajweed', label: 'Tajweed', hint: 'Lessons and practice' },
  { id: 'in_app_hifz', label: 'Hifz', hint: 'Memorization' },
  { id: 'in_app_plans', label: 'Learning plans', hint: 'Plans hub and details' },
] as const;

export const EXTERNAL_CHANNELS = [
  { id: 'x', label: 'X (Twitter)', hint: 'Short post + link' },
  { id: 'facebook', label: 'Facebook', hint: 'Share dialog' },
  { id: 'instagram', label: 'Instagram', hint: 'Caption to copy' },
  { id: 'whatsapp', label: 'WhatsApp', hint: 'Chat share' },
  { id: 'telegram', label: 'Telegram', hint: 'Share link' },
  { id: 'email', label: 'Email', hint: 'Subject + body' },
] as const;

export type CampaignChannelId =
  | (typeof IN_APP_CHANNELS)[number]['id']
  | (typeof EXTERNAL_CHANNELS)[number]['id'];

export type CampaignDestination = {
  kind: string;
  path: string;
  label: string;
  group: string;
};

const POPULAR_SURAHS: { number: number; label: string }[] = [
  { number: 1, label: 'Al-Fatihah' },
  { number: 2, label: 'Al-Baqarah' },
  { number: 18, label: 'Al-Kahf' },
  { number: 36, label: 'Ya-Sin' },
  { number: 55, label: 'Ar-Rahman' },
  { number: 67, label: 'Al-Mulk' },
  { number: 112, label: 'Al-Ikhlas' },
];

export function campaignDestinations(): CampaignDestination[] {
  const hubs: CampaignDestination[] = [
    { kind: 'home', path: '/', label: 'Homepage', group: 'App hubs' },
    { kind: 'surahs', path: '/surahs', label: 'All 114 Surahs', group: 'App hubs' },
    { kind: 'search', path: '/search', label: 'Search', group: 'App hubs' },
    { kind: 'tajweed', path: '/tajweed', label: 'Tajweed lessons', group: 'App hubs' },
    { kind: 'hifz', path: '/hifz', label: 'Hifz practice', group: 'App hubs' },
    { kind: 'plans', path: '/learning-plans', label: 'Learning plans', group: 'App hubs' },
    { kind: 'articles', path: '/articles', label: 'Articles', group: 'App hubs' },
    { kind: 'custom', path: '/quran-in-year', label: 'Quran in a Year', group: 'App hubs' },
    { kind: 'register', path: '/register', label: 'Create account', group: 'App hubs' },
    { kind: 'donate', path: '/donate', label: 'Donate', group: 'App hubs' },
  ];

  const surahs: CampaignDestination[] = POPULAR_SURAHS.map((s) => ({
    kind: 'surah',
    path: getSurahPath(s.number),
    label: `${s.number}. ${s.label}`,
    group: 'Surahs',
  }));

  const tajweed: CampaignDestination[] = TAJWEED_LESSONS.map((lesson) => ({
    kind: 'tajweed',
    path: `/tajweed/${lesson.slug}`,
    label: lesson.name,
    group: 'Tajweed',
  }));

  const plans: CampaignDestination[] = getFeaturedLearningPlans(8).map((plan) => ({
    kind: 'plans',
    path: `/learning-plans/${plan.slug}`,
    label: plan.title,
    group: 'Learning plans',
  }));

  const articles: CampaignDestination[] = ARTICLES.slice(0, 8).map((article) => ({
    kind: 'articles',
    path: `/articles/${article.slug}`,
    label: article.title,
    group: 'Articles',
  }));

  return [...hubs, ...surahs, ...tajweed, ...plans, ...articles];
}

export const EMPTY_CAMPAIGN_FORM = {
  name: '',
  headline: '',
  body: '',
  ctaLabel: 'Start reading',
  destination: '/',
  destinationKind: 'home',
  imageUrl: '',
  channels: ['in_app_global'] as CampaignChannelId[],
};

export function channelLabel(id: string): string {
  const all = [...IN_APP_CHANNELS, ...EXTERNAL_CHANNELS];
  return all.find((c) => c.id === id)?.label ?? id;
}
