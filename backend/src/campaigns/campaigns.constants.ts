export const CAMPAIGN_STATUSES = ['draft', 'live', 'paused'] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const IN_APP_CHANNELS = [
  'in_app_global',
  'in_app_home',
  'in_app_reader',
  'in_app_tajweed',
  'in_app_hifz',
  'in_app_plans',
] as const;

export const EXTERNAL_CHANNELS = [
  'x',
  'facebook',
  'instagram',
  'whatsapp',
  'telegram',
  'email',
] as const;

export const CAMPAIGN_CHANNELS = [...IN_APP_CHANNELS, ...EXTERNAL_CHANNELS] as const;
export type CampaignChannelId = (typeof CAMPAIGN_CHANNELS)[number];

export const DESTINATION_KINDS = [
  'home',
  'surahs',
  'surah',
  'tajweed',
  'hifz',
  'plans',
  'articles',
  'search',
  'register',
  'donate',
  'custom',
] as const;
export type DestinationKind = (typeof DESTINATION_KINDS)[number];

export function isCampaignChannel(value: string): value is CampaignChannelId {
  return (CAMPAIGN_CHANNELS as readonly string[]).includes(value);
}

export function isInAppChannel(value: string): boolean {
  return (IN_APP_CHANNELS as readonly string[]).includes(value);
}
