import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';

const ACCOUNT_WHERE = { passwordHash: { not: null } } as const;

function utcDayStart(daysAgo: number): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysAgo));
}

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
  ) {}

  async overview() {
    const [totalAccounts, today, last7Days, last30Days, daily, traffic] = await Promise.all([
      this.prisma.user.count({ where: ACCOUNT_WHERE }),
      this.prisma.user.count({ where: { ...ACCOUNT_WHERE, createdAt: { gte: utcDayStart(0) } } }),
      this.prisma.user.count({ where: { ...ACCOUNT_WHERE, createdAt: { gte: utcDayStart(6) } } }),
      this.prisma.user.count({ where: { ...ACCOUNT_WHERE, createdAt: { gte: utcDayStart(29) } } }),
      this.signupsByDay(30),
      this.analytics.trafficOverview(),
    ]);

    return { totalAccounts, today, last7Days, last30Days, signupsByDay: daily, traffic };
  }

  async listUsers(query: { page?: number; limit?: number; q?: string }) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 25));
    const q = query.q?.trim();
    const where: Prisma.UserWhereInput = {
      ...ACCOUNT_WHERE,
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: 'insensitive' } },
              { name: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: { id: true, email: true, name: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      users,
    };
  }

  private async signupsByDay(days: number) {
    const since = utcDayStart(days - 1);
    const rows = await this.prisma.$queryRaw<Array<{ day: Date; count: number }>>(Prisma.sql`
      SELECT created_at::date AS day,
             COUNT(*)::int AS count
      FROM users
      WHERE password_hash IS NOT NULL
        AND created_at >= ${since}
      GROUP BY 1
      ORDER BY 1 ASC
    `);

    const byDay = new Map(
      rows.map((row) => [new Date(row.day).toISOString().slice(0, 10), Number(row.count)]),
    );
    const series: Array<{ date: string; count: number }> = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const date = utcDayStart(i).toISOString().slice(0, 10);
      series.push({ date, count: byDay.get(date) ?? 0 });
    }
    return series;
  }
}
