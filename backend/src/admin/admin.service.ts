import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertMotivationDto } from './dto/upsert-motivation.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const last7 = daysAgo(7);
    const last30 = daysAgo(30);

    const [
      totalUsers,
      registeredUsers,
      newUsersLast7Days,
      newUsersLast30Days,
      totalFeedback,
      feedbackLast7Days,
      readingHistoryTotal,
      readingHistoryLast7Days,
      activeReadersLast7Days,
      hifzAttemptsTotal,
      hifzAttemptsLast7Days,
      bookmarksTotal,
      recentRegistrations,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { passwordHash: { not: null } } }),
      this.prisma.user.count({ where: { createdAt: { gte: last7 } } }),
      this.prisma.user.count({ where: { createdAt: { gte: last30 } } }),
      this.prisma.feedback.count(),
      this.prisma.feedback.count({ where: { createdAt: { gte: last7 } } }),
      this.prisma.readingHistory.count(),
      this.prisma.readingHistory.count({ where: { readAt: { gte: last7 } } }),
      this.prisma.readingHistory.findMany({
        where: { readAt: { gte: last7 } },
        distinct: ['userId'],
        select: { userId: true },
      }),
      this.prisma.hifzAttempt.count(),
      this.prisma.hifzAttempt.count({ where: { createdAt: { gte: last7 } } }),
      this.prisma.bookmark.count(),
      this.prisma.user.findMany({
        where: { passwordHash: { not: null } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, email: true, name: true, createdAt: true },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        registered: registeredUsers,
        newLast7Days: newUsersLast7Days,
        newLast30Days: newUsersLast30Days,
        recent: recentRegistrations,
      },
      engagement: {
        activeReadersLast7Days: activeReadersLast7Days.length,
        readingEventsTotal: readingHistoryTotal,
        readingEventsLast7Days: readingHistoryLast7Days,
        hifzAttemptsTotal,
        hifzAttemptsLast7Days,
        bookmarksTotal,
      },
      feedback: {
        total: totalFeedback,
        last7Days: feedbackLast7Days,
      },
      /** Anonymous page views are not stored in the app DB — use nginx or analytics for traffic. */
      trafficNote:
        'Page views and anonymous visitors are not tracked in the database. Use nginx access logs or Google Search Console for site traffic.',
      generatedAt: now.toISOString(),
    };
  }

  async listFeedback(params: { page?: number; limit?: number; category?: string }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 25));
    const where = params.category ? { category: params.category } : undefined;

    const [items, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.feedback.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) || 1 };
  }

  async deleteFeedback(id: number) {
    try {
      await this.prisma.feedback.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Feedback not found');
    }
    return { ok: true };
  }

  async listMotivationalMessages(language?: string) {
    return this.prisma.motivationalMessage.findMany({
      where: language ? { language } : undefined,
      orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async createMotivationalMessage(dto: UpsertMotivationDto) {
    return this.prisma.motivationalMessage.create({
      data: {
        message: dto.message.trim(),
        category: dto.category.trim().toUpperCase(),
        language: (dto.language ?? 'en').trim().toLowerCase(),
        status: dto.status ?? 'approved',
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateMotivationalMessage(id: number, dto: Partial<UpsertMotivationDto>) {
    try {
      return await this.prisma.motivationalMessage.update({
        where: { id },
        data: {
          ...(dto.message !== undefined ? { message: dto.message.trim() } : {}),
          ...(dto.category !== undefined ? { category: dto.category.trim().toUpperCase() } : {}),
          ...(dto.language !== undefined ? { language: dto.language.trim().toLowerCase() } : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
      });
    } catch {
      throw new NotFoundException('Motivational message not found');
    }
  }

  async deleteMotivationalMessage(id: number) {
    try {
      await this.prisma.motivationalMessage.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Motivational message not found');
    }
    return { ok: true };
  }
}
