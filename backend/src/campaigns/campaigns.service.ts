import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CAMPAIGN_CHANNELS,
  isCampaignChannel,
  isInAppChannel,
} from './campaigns.constants';
import { buildCopies } from './campaigns.copy';
import { UpsertCampaignDto } from './dto/upsert-campaign.dto';

const CHANNEL_INCLUDE = { channels: { orderBy: { channel: 'asc' as const } } };

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.campaign.findMany({
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      include: CHANNEL_INCLUDE,
    });
  }

  async get(id: number) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: CHANNEL_INCLUDE,
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return this.withCopies(campaign);
  }

  async create(dto: UpsertCampaignDto) {
    const data = this.normalize(dto);
    const campaign = await this.prisma.campaign.create({
      data: {
        ...data.fields,
        channels: {
          create: data.channels.map((channel) => ({ channel, enabled: true })),
        },
      },
      include: CHANNEL_INCLUDE,
    });
    return this.withCopies(campaign);
  }

  async update(id: number, dto: UpsertCampaignDto) {
    await this.ensureExists(id);
    const data = this.normalize(dto);
    await this.prisma.$transaction(async (tx) => {
      await tx.campaign.update({ where: { id }, data: data.fields });
      const existing = await tx.campaignChannel.findMany({ where: { campaignId: id } });
      const wanted = new Set<string>(data.channels);
      for (const row of existing) {
        if (!wanted.has(row.channel)) {
          await tx.campaignChannel.update({
            where: { id: row.id },
            data: { enabled: false },
          });
        }
      }
      for (const channel of data.channels) {
        await tx.campaignChannel.upsert({
          where: { campaignId_channel: { campaignId: id, channel } },
          create: { campaignId: id, channel, enabled: true },
          update: { enabled: true },
        });
      }
    });
    return this.get(id);
  }

  async remove(id: number) {
    try {
      await this.prisma.campaign.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Campaign not found');
    }
    return { ok: true };
  }

  async publish(id: number, channels?: string[]) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: CHANNEL_INCLUDE,
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    const selected = (channels?.length
      ? channels
      : campaign.channels.filter((c) => c.enabled).map((c) => c.channel)
    ).filter(isCampaignChannel);

    if (!selected.length) {
      throw new BadRequestException('Select at least one channel to publish');
    }

    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.campaign.updateMany({
        where: { status: 'live', id: { not: id } },
        data: { status: 'paused' },
      });
      await tx.campaign.update({
        where: { id },
        data: { status: 'live' },
      });
      for (const channel of selected) {
        await tx.campaignChannel.upsert({
          where: { campaignId_channel: { campaignId: id, channel } },
          create: { campaignId: id, channel, enabled: true, publishedAt: now },
          update: { enabled: true, publishedAt: now },
        });
      }
    });
    return this.get(id);
  }

  async pause(id: number) {
    await this.ensureExists(id);
    await this.prisma.campaign.update({ where: { id }, data: { status: 'paused' } });
    return this.get(id);
  }

  async getActive(surface?: string) {
    const now = new Date();
    const campaign = await this.prisma.campaign.findFirst({
      where: {
        status: 'live',
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        channels: { where: { enabled: true } },
      },
    });
    if (!campaign) return { campaign: null };

    const inApp = campaign.channels
      .map((c) => c.channel)
      .filter(isInAppChannel);

    if (!inApp.length) return { campaign: null };

    if (surface && surface !== 'global' && !this.matchesSurface(surface, inApp)) {
      return { campaign: null };
    }

    return {
      campaign: {
        id: campaign.id,
        headline: campaign.headline,
        body: campaign.body,
        ctaLabel: campaign.ctaLabel,
        destination: campaign.destination,
        destinationKind: campaign.destinationKind,
        imageUrl: campaign.imageUrl,
        channels: inApp,
      },
    };
  }

  private matchesSurface(surface: string, channels: string[]): boolean {
    if (channels.includes('in_app_global')) return true;
    const map: Record<string, string> = {
      home: 'in_app_home',
      reader: 'in_app_reader',
      tajweed: 'in_app_tajweed',
      hifz: 'in_app_hifz',
      plans: 'in_app_plans',
    };
    const needed = map[surface];
    return needed ? channels.includes(needed) : false;
  }

  private async ensureExists(id: number) {
    const found = await this.prisma.campaign.findUnique({ where: { id }, select: { id: true } });
    if (!found) throw new NotFoundException('Campaign not found');
  }

  private withCopies<
    T extends {
      headline: string;
      body: string;
      ctaLabel: string;
      destination: string;
      channels: { channel: string; enabled: boolean }[];
    },
  >(campaign: T) {
    const enabled = campaign.channels.filter((c) => c.enabled).map((c) => c.channel);
    return {
      ...campaign,
      copies: buildCopies(campaign, enabled),
    };
  }

  private normalize(dto: UpsertCampaignDto) {
    const destination = this.sanitizeDestination(dto.destination);
    const channels = [...new Set(dto.channels)].filter(isCampaignChannel);
    if (!channels.length) {
      throw new BadRequestException('Select at least one channel');
    }
    const unknown = dto.channels.filter((c) => !(CAMPAIGN_CHANNELS as readonly string[]).includes(c));
    if (unknown.length) {
      throw new BadRequestException(`Unknown channels: ${unknown.join(', ')}`);
    }
    const imageUrl = dto.imageUrl?.trim() || null;
    if (imageUrl && !this.isSafeImageUrl(imageUrl)) {
      throw new BadRequestException('Image URL must be https or a site path');
    }
    return {
      channels,
      fields: {
        name: dto.name.trim(),
        headline: dto.headline.trim(),
        body: dto.body.trim(),
        ctaLabel: dto.ctaLabel.trim(),
        destination,
        destinationKind: dto.destinationKind,
        imageUrl,
      },
    };
  }

  private sanitizeDestination(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('://')) {
      throw new BadRequestException('Destination must be a site path such as /tajweed');
    }
    return trimmed.slice(0, 300);
  }

  private isSafeImageUrl(url: string): boolean {
    if (url.startsWith('/') && !url.startsWith('//')) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
