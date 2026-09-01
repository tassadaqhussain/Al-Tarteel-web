import { isInAppChannel, type CampaignChannelId } from './campaigns.constants';

export type CampaignCopySource = {
  headline: string;
  body: string;
  ctaLabel: string;
  destination: string;
};

export type ChannelCopy = {
  channel: CampaignChannelId;
  title: string;
  text: string;
  shareUrl?: string;
};

function siteOrigin(): string {
  return (process.env.PUBLIC_SITE_URL || 'https://quranpilot.com').replace(/\/$/, '');
}

function absoluteDestination(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${siteOrigin()}${path.startsWith('/') ? path : `/${path}`}`;
}

function encode(value: string): string {
  return encodeURIComponent(value);
}

export function buildChannelCopy(
  campaign: CampaignCopySource,
  channel: CampaignChannelId,
): ChannelCopy {
  const url = absoluteDestination(campaign.destination);
  const { headline, body, ctaLabel } = campaign;

  switch (channel) {
    case 'x': {
      const text = `${headline}\n\n${url}`;
      return {
        channel,
        title: 'X post',
        text,
        shareUrl: `https://twitter.com/intent/tweet?text=${encode(text)}`,
      };
    }
    case 'facebook': {
      const text = `${headline}\n\n${body}\n\n${ctaLabel}: ${url}`;
      return {
        channel,
        title: 'Facebook post',
        text,
        shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encode(url)}`,
      };
    }
    case 'instagram': {
      const text = `${headline}\n\n${body}\n\n${ctaLabel}\n${url}\n\n#Quran #QuranPilot #Islam`;
      return { channel, title: 'Instagram caption', text };
    }
    case 'whatsapp': {
      const text = `${headline}\n${body}\n\n${url}`;
      return {
        channel,
        title: 'WhatsApp message',
        text,
        shareUrl: `https://wa.me/?text=${encode(text)}`,
      };
    }
    case 'telegram': {
      const text = `${headline}\n${body}`;
      return {
        channel,
        title: 'Telegram message',
        text: `${text}\n\n${url}`,
        shareUrl: `https://t.me/share/url?url=${encode(url)}&text=${encode(text)}`,
      };
    }
    case 'email': {
      const text = `${body}\n\n${ctaLabel}: ${url}`;
      return {
        channel,
        title: headline,
        text,
        shareUrl: `mailto:?subject=${encode(headline)}&body=${encode(text)}`,
      };
    }
    default: {
      return {
        channel,
        title: isInAppChannel(channel) ? 'In-app banner' : channel,
        text: `${headline}\n${body}\n${ctaLabel} → ${url}`,
      };
    }
  }
}

export function buildCopies(campaign: CampaignCopySource, channels: string[]): ChannelCopy[] {
  return channels
    .filter((ch): ch is CampaignChannelId => true)
    .map((ch) => buildChannelCopy(campaign, ch as CampaignChannelId));
}
