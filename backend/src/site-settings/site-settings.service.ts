import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertSiteSettingsDto } from './dto/upsert-site-settings.dto';

export type PublicSiteSettings = {
  source: 'database' | 'env' | null;
  analyticsProvider: '' | 'ga4' | 'plausible' | 'umami';
  gaMeasurementId: string;
  plausibleDomain: string;
  plausibleScriptSrc: string;
  umamiWebsiteId: string;
  umamiScriptSrc: string;
  googleSiteVerification: string;
  bingSiteVerification: string;
  analyticsEnabled: boolean;
};

const empty = (): PublicSiteSettings => ({
  source: null,
  analyticsProvider: '',
  gaMeasurementId: '',
  plausibleDomain: '',
  plausibleScriptSrc: '',
  umamiWebsiteId: '',
  umamiScriptSrc: '',
  googleSiteVerification: '',
  bingSiteVerification: '',
  analyticsEnabled: false,
});

function normalizeProvider(raw: string | null | undefined): PublicSiteSettings['analyticsProvider'] {
  const v = (raw || '').trim().toLowerCase();
  if (v === 'ga4' || v === 'plausible' || v === 'umami') return v;
  if (v === 'none' || v === 'disabled' || v === 'false') return '';
  return '';
}

function envFallback(): PublicSiteSettings {
  const ga =
    process.env.NEXT_PUBLIC_GA_ID?.trim() ||
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ||
    process.env.GA_MEASUREMENT_ID?.trim() ||
    '';
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim() || '';
  const umami = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim() || '';
  let provider = normalizeProvider(process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER);
  if (!provider) {
    if (ga) provider = 'ga4';
    else if (plausible) provider = 'plausible';
    else if (umami) provider = 'umami';
  }
  const google =
    process.env.GOOGLE_SITE_VERIFICATION?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() ||
    process.env.GSC_VERIFICATION?.trim() ||
    process.env.NEXT_PUBLIC_GSC_VERIFICATION?.trim() ||
    '';
  const bing =
    process.env.BING_SITE_VERIFICATION?.trim() ||
    process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim() ||
    '';

  const out: PublicSiteSettings = {
    source: null,
    analyticsProvider: provider,
    gaMeasurementId: ga,
    plausibleDomain: plausible,
    plausibleScriptSrc: process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC?.trim() || '',
    umamiWebsiteId: umami,
    umamiScriptSrc: process.env.NEXT_PUBLIC_UMAMI_SRC?.trim() || '',
    googleSiteVerification: google,
    bingSiteVerification: bing,
    analyticsEnabled: false,
  };
  out.analyticsEnabled = isAnalyticsEnabled(out);
  if (
    out.analyticsProvider ||
    out.gaMeasurementId ||
    out.plausibleDomain ||
    out.umamiWebsiteId ||
    out.googleSiteVerification ||
    out.bingSiteVerification
  ) {
    out.source = 'env';
  }
  return out;
}

function isAnalyticsEnabled(cfg: PublicSiteSettings): boolean {
  if (cfg.analyticsProvider === 'ga4') return Boolean(cfg.gaMeasurementId);
  if (cfg.analyticsProvider === 'plausible') return Boolean(cfg.plausibleDomain);
  if (cfg.analyticsProvider === 'umami') return Boolean(cfg.umamiWebsiteId);
  return false;
}

function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

@Injectable()
export class SiteSettingsService {
  private readonly log = new Logger(SiteSettingsService.name);
  private cache: PublicSiteSettings | undefined;
  private cacheAt = 0;
  private readonly ttlMs = 30_000;

  constructor(private readonly prisma: PrismaService) {}

  invalidate() {
    this.cache = undefined;
    this.cacheAt = 0;
  }

  async getPublicSettings(): Promise<PublicSiteSettings> {
    const now = Date.now();
    if (this.cache && now - this.cacheAt < this.ttlMs) return this.cache;

    const env = envFallback();
    try {
      const row = await this.prisma.siteSetting.findUnique({ where: { id: 1 } });
      if (!row) {
        this.cache = env;
        this.cacheAt = now;
        return env;
      }

      const ga = (row.gaMeasurementId || '').trim() || env.gaMeasurementId;
      const plausible = (row.plausibleDomain || '').trim() || env.plausibleDomain;
      const umami = (row.umamiWebsiteId || '').trim() || env.umamiWebsiteId;
      // null = never set → infer; explicit '' / none / ga4|… = honor admin choice
      let provider: PublicSiteSettings['analyticsProvider'];
      if (row.analyticsProvider == null) {
        provider = '';
        if (ga) provider = 'ga4';
        else if (plausible) provider = 'plausible';
        else if (umami) provider = 'umami';
      } else {
        provider = normalizeProvider(row.analyticsProvider);
      }

      const out: PublicSiteSettings = {
        source: 'database',
        analyticsProvider: provider,
        gaMeasurementId: ga,
        plausibleDomain: plausible,
        plausibleScriptSrc: (row.plausibleScriptSrc || '').trim() || env.plausibleScriptSrc,
        umamiWebsiteId: umami,
        umamiScriptSrc: (row.umamiScriptSrc || '').trim() || env.umamiScriptSrc,
        googleSiteVerification:
          (row.googleSiteVerification || '').trim() || env.googleSiteVerification,
        bingSiteVerification: (row.bingSiteVerification || '').trim() || env.bingSiteVerification,
        analyticsEnabled: false,
      };
      out.analyticsEnabled = isAnalyticsEnabled(out);
      this.cache = out;
      this.cacheAt = now;
      return out;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2021') {
        this.log.warn('site_settings table missing — using env fallback');
        this.cache = env.source ? env : empty();
        this.cacheAt = now;
        return this.cache;
      }
      throw err;
    }
  }

  async upsertSettings(dto: UpsertSiteSettingsDto): Promise<PublicSiteSettings> {
    const existing = await this.prisma.siteSetting.findUnique({ where: { id: 1 } }).catch(() => null);

    const next = {
      analyticsProvider:
        dto.analyticsProvider !== undefined
          ? normalizeProvider(dto.analyticsProvider) || 'none'
          : (existing?.analyticsProvider ?? null),
      gaMeasurementId:
        dto.gaMeasurementId !== undefined
          ? blankToNull(dto.gaMeasurementId)
          : (existing?.gaMeasurementId ?? null),
      plausibleDomain:
        dto.plausibleDomain !== undefined
          ? blankToNull(dto.plausibleDomain)
          : (existing?.plausibleDomain ?? null),
      plausibleScriptSrc:
        dto.plausibleScriptSrc !== undefined
          ? blankToNull(dto.plausibleScriptSrc)
          : (existing?.plausibleScriptSrc ?? null),
      umamiWebsiteId:
        dto.umamiWebsiteId !== undefined
          ? blankToNull(dto.umamiWebsiteId)
          : (existing?.umamiWebsiteId ?? null),
      umamiScriptSrc:
        dto.umamiScriptSrc !== undefined
          ? blankToNull(dto.umamiScriptSrc)
          : (existing?.umamiScriptSrc ?? null),
      googleSiteVerification:
        dto.googleSiteVerification !== undefined
          ? blankToNull(dto.googleSiteVerification)
          : (existing?.googleSiteVerification ?? null),
      bingSiteVerification:
        dto.bingSiteVerification !== undefined
          ? blankToNull(dto.bingSiteVerification)
          : (existing?.bingSiteVerification ?? null),
    };

    await this.prisma.siteSetting.upsert({
      where: { id: 1 },
      create: { id: 1, ...next },
      update: next,
    });

    this.invalidate();
    return this.getPublicSettings();
  }
}
