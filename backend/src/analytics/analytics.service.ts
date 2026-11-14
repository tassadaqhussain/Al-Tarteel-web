import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const BOT_UA =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|preview|lighthouse|headless|pingdom|monitor/i;

function utcDay(daysAgo = 0): string {
  const now = new Date();
  const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysAgo));
  return day.toISOString().slice(0, 10);
}

function sanitizePath(path?: string): string {
  if (!path || typeof path !== 'string') return '/';
  const trimmed = path.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return '/';
  return trimmed.slice(0, 200).split('?')[0] || '/';
}

function resolveChannelSource(rawSource?: string, rawReferrer?: string): string {
  const s = (rawSource || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  if (s) {
    if (s === 'fb' || s === 'facebook') return 'facebook';
    if (s === 'ig' || s === 'instagram') return 'instagram';
    if (s === 'twitter' || s === 'x') return 'x';
    if (s === 'wa' || s === 'whatsapp') return 'whatsapp';
    if (s === 'tg' || s === 'telegram') return 'telegram';
    if (s === 'newsletter' || s === 'email') return 'email';
    if (s.startsWith('in_app_')) return 'in_app';
    return s.slice(0, 40);
  }

  const ref = (rawReferrer || '').trim();
  if (!ref) return 'direct';

  try {
    const host = new URL(ref).hostname.toLowerCase();
    if (!host || host === 'localhost' || host === '127.0.0.1' || host.endsWith('quranpilot.com')) {
      return 'direct';
    }
    if (host.includes('facebook.com') || host === 'fb.com' || host.endsWith('.fb.com')) return 'facebook';
    if (host.includes('instagram.com')) return 'instagram';
    if (host === 't.co' || host.includes('twitter.com') || host === 'x.com' || host.endsWith('.x.com')) return 'x';
    if (host.includes('whatsapp.com') || host === 'wa.me') return 'whatsapp';
    if (host === 't.me' || host.includes('telegram.org')) return 'telegram';
    if (host.includes('google.') || host.includes('bing.com') || host.includes('duckduckgo.com') || host.includes('yahoo.com')) {
      return 'search';
    }
    return 'referral';
  } catch {
    return 'direct';
  }
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async recordVisit(meta: { ip?: string; userAgent?: string; path?: string; source?: string; referrer?: string }) {
    const userAgent = meta.userAgent?.slice(0, 400) || '';
    if (BOT_UA.test(userAgent)) return { ok: true as const, skipped: true as const };

    const path = sanitizePath(meta.path);
    if (path === '/admin' || path.startsWith('/admin/')) {
      return { ok: true as const, skipped: true as const };
    }

    const ip = (meta.ip || '').replace(/^::ffff:/, '').slice(0, 64);
    if (!ip) return { ok: true as const, skipped: true as const };

    const salt = process.env.ANALYTICS_SALT || process.env.JWT_SECRET || 'qp-analytics';
    const visitorHash = createHash('sha256').update(`${salt}|${ip}|${userAgent}`).digest('hex').slice(0, 40);
    const day = utcDay(0);
    const source = resolveChannelSource(meta.source, meta.referrer);

    await this.prisma.siteVisitor.upsert({
      where: { day_visitorHash: { day, visitorHash } },
      create: { day, visitorHash, hits: 1, landingPath: path, source },
      update: {
        hits: { increment: 1 },
        ...(source !== 'direct' ? { source } : {}),
      },
    });

    return { ok: true as const };
  }

  async trafficOverview() {
    const today = utcDay(0);
    const since7 = utcDay(6);
    const since30 = utcDay(29);

    const [todayRow, week, month, daily, channelsLast30Days] = await Promise.all([
      this.dayTotals(today, today),
      this.rangeTotals(since7),
      this.rangeTotals(since30),
      this.visitorsByDay(30),
      this.channelsSince(since30),
    ]);

    return {
      visitorsToday: todayRow.visitors,
      pageViewsToday: todayRow.pageViews,
      visitorsLast7Days: week.visitors,
      pageViewsLast7Days: week.pageViews,
      visitorsLast30Days: month.visitors,
      pageViewsLast30Days: month.pageViews,
      visitorsByDay: daily,
      channelsLast30Days,
    };
  }

  private async channelsSince(sinceDay: string) {
    const rows = await this.prisma.$queryRaw<
      Array<{ channel: string; visitors: number; page_views: number }>
    >(Prisma.sql`
      SELECT COALESCE(NULLIF(source, ''), 'direct') AS channel,
             COUNT(DISTINCT visitor_hash)::int AS visitors,
             COALESCE(SUM(hits), 0)::int AS page_views
      FROM site_visitors
      WHERE day >= ${sinceDay}
      GROUP BY COALESCE(NULLIF(source, ''), 'direct')
      ORDER BY visitors DESC, page_views DESC
    `);
    return rows.map((row) => ({
      channel: String(row.channel),
      visitors: Number(row.visitors),
      pageViews: Number(row.page_views),
    }));
  }

  private async dayTotals(from: string, to: string) {
    const row = await this.prisma.siteVisitor.aggregate({
      where: { day: { gte: from, lte: to } },
      _count: { _all: true },
      _sum: { hits: true },
    });
    return { visitors: row._count._all, pageViews: row._sum.hits ?? 0 };
  }

  private async rangeTotals(sinceDay: string) {
    const rows = await this.prisma.$queryRaw<Array<{ visitors: number; page_views: number }>>(Prisma.sql`
      SELECT COUNT(DISTINCT visitor_hash)::int AS visitors,
             COALESCE(SUM(hits), 0)::int AS page_views
      FROM site_visitors
      WHERE day >= ${sinceDay}
    `);
    return { visitors: Number(rows[0]?.visitors ?? 0), pageViews: Number(rows[0]?.page_views ?? 0) };
  }

  private async visitorsByDay(days: number) {
    const since = utcDay(days - 1);
    const rows = await this.prisma.$queryRaw<Array<{ day: string; visitors: number; page_views: number }>>(Prisma.sql`
      SELECT day,
             COUNT(*)::int AS visitors,
             COALESCE(SUM(hits), 0)::int AS page_views
      FROM site_visitors
      WHERE day >= ${since}
      GROUP BY day
      ORDER BY day ASC
    `);
    const byDay = new Map(
      rows.map((row) => [String(row.day).slice(0, 10), { visitors: Number(row.visitors), pageViews: Number(row.page_views) }]),
    );
    const series: Array<{ date: string; visitors: number; pageViews: number }> = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const date = utcDay(i);
      series.push({ date, visitors: byDay.get(date)?.visitors ?? 0, pageViews: byDay.get(date)?.pageViews ?? 0 });
    }
    return series;
  }
}
