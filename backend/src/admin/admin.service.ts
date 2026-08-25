import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { renderUserEmailHtml, renderUserEmailText, STARTER_MAIL_TEMPLATES, isEmailLayout } from '../mail/user-email.template';
import { UpsertMotivationDto } from './dto/upsert-motivation.dto';
import { SendUserEmailDto } from './dto/send-user-email.dto';
import { UpsertMailSettingsDto } from '../mail/dto/upsert-mail-settings.dto';
import { UpsertMailTemplateDto } from '../mail/dto/upsert-mail-template.dto';

@Injectable()
export class AdminService {
  private readonly log = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  /** Prefer zeros over dashboard 500s when a local DB is missing optional tables. */
  private async safeCount(query: () => Promise<number>): Promise<number> {
    try {
      return await query();
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2021') {
        return 0;
      }
      throw err;
    }
  }

  private async safeFindMany<T>(query: () => Promise<T[]>, fallback: T[] = []): Promise<T[]> {
    try {
      return await query();
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2021') {
        return fallback;
      }
      throw err;
    }
  }

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
      this.safeCount(() => this.prisma.user.count()),
      this.safeCount(() => this.prisma.user.count({ where: { passwordHash: { not: null } } })),
      this.safeCount(() => this.prisma.user.count({ where: { createdAt: { gte: last7 } } })),
      this.safeCount(() => this.prisma.user.count({ where: { createdAt: { gte: last30 } } })),
      this.safeCount(() => this.prisma.feedback.count()),
      this.safeCount(() => this.prisma.feedback.count({ where: { createdAt: { gte: last7 } } })),
      this.safeCount(() => this.prisma.readingHistory.count()),
      this.safeCount(() => this.prisma.readingHistory.count({ where: { readAt: { gte: last7 } } })),
      this.safeFindMany(() =>
        this.prisma.readingHistory.findMany({
          where: { readAt: { gte: last7 } },
          distinct: ['userId'],
          select: { userId: true },
        }),
      ),
      this.safeCount(() => this.prisma.hifzAttempt.count()),
      this.safeCount(() => this.prisma.hifzAttempt.count({ where: { createdAt: { gte: last7 } } })),
      this.safeCount(() => this.prisma.bookmark.count()),
      this.safeFindMany(() =>
        this.prisma.user.findMany({
          where: { passwordHash: { not: null } },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { id: true, email: true, name: true, createdAt: true },
        }),
      ),
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

  mailStatus() {
    return this.mail.getPublicSettings();
  }

  getMailSettings() {
    return this.mail.getPublicSettings();
  }

  saveMailSettings(dto: UpsertMailSettingsDto) {
    return this.mail.upsertSettings(dto);
  }

  async listMailTemplates() {
    try {
      const existing = await this.prisma.mailTemplate.findMany({ select: { name: true } });
      const names = new Set(existing.map((row) => row.name));
      const missing = STARTER_MAIL_TEMPLATES.filter((row) => !names.has(row.name));
      if (missing.length) {
        await this.prisma.mailTemplate.createMany({ data: missing });
      }
      return this.prisma.mailTemplate.findMany({ orderBy: { updatedAt: 'desc' } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2021') {
        return [];
      }
      throw err;
    }
  }

  async createMailTemplate(dto: UpsertMailTemplateDto) {
    return this.prisma.mailTemplate.create({
      data: {
        name: dto.name.trim(),
        layout: dto.layout,
        subject: dto.subject.trim(),
        body: dto.body.trim(),
        ctaLabel: dto.ctaLabel?.trim() || 'Open QuranPilot',
        ctaUrl: dto.ctaUrl?.trim() || 'https://quranpilot.com',
      },
    });
  }

  async updateMailTemplate(id: number, dto: UpsertMailTemplateDto) {
    try {
      return await this.prisma.mailTemplate.update({
        where: { id },
        data: {
          name: dto.name.trim(),
          layout: dto.layout,
          subject: dto.subject.trim(),
          body: dto.body.trim(),
          ctaLabel: dto.ctaLabel?.trim() || 'Open QuranPilot',
          ctaUrl: dto.ctaUrl?.trim() || 'https://quranpilot.com',
        },
      });
    } catch {
      throw new NotFoundException('Email template not found');
    }
  }

  async deleteMailTemplate(id: number) {
    try {
      await this.prisma.mailTemplate.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Email template not found');
    }
    return { ok: true };
  }

  async listRegisteredUsers() {
    return this.prisma.user.findMany({
      where: { passwordHash: { not: null }, email: { not: null } },
      orderBy: { createdAt: 'desc' },
      take: 500,
      select: { id: true, email: true, name: true, createdAt: true },
    });
  }

  async sendUserEmail(dto: SendUserEmailDto, adminEmail?: string | null) {
    if (!(await this.mail.isConfigured())) {
      throw new BadRequestException(
        'SMTP is not configured. Save host, username, and password in Admin → Email.',
      );
    }

    const subject = dto.subject.trim();
    const body = dto.body.trim();
    let recipients: { id: number; email: string | null; name: string | null }[];

    if (dto.preview) {
      const to = adminEmail?.trim().toLowerCase();
      if (!to) {
        throw new BadRequestException('Admin email is required for a preview send.');
      }
      recipients = [{ id: 0, email: to, name: 'Admin' }];
    } else if (dto.userIds?.length) {
      recipients = await this.prisma.user.findMany({
        where: {
          id: { in: dto.userIds },
          passwordHash: { not: null },
          email: { not: null },
        },
        select: { id: true, email: true, name: true },
      });
    } else {
      recipients = await this.prisma.user.findMany({
        where: { passwordHash: { not: null }, email: { not: null } },
        select: { id: true, email: true, name: true },
        take: 500,
      });
    }

    const withEmail = recipients.filter((u): u is { id: number; email: string; name: string | null } =>
      Boolean(u.email),
    );
    if (!withEmail.length) {
      throw new BadRequestException('No registered users with email addresses to send to.');
    }

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    const content = {
      subject,
      body,
      ctaLabel: dto.ctaLabel?.trim() || undefined,
      ctaUrl: dto.ctaUrl?.trim() || undefined,
      layout: isEmailLayout(dto.layout) ? dto.layout : ('classic' as const),
    };

    for (const user of withEmail) {
      const greetingName = user.name?.trim() || 'there';
      const payload = { ...content, name: greetingName };
      const result = await this.mail.sendMailResult({
        to: user.email,
        subject,
        text: renderUserEmailText(payload),
        html: renderUserEmailHtml(payload),
      });
      if (result.ok) {
        sent += 1;
      } else {
        failed += 1;
        if (errors.length < 5) errors.push(`${user.email}: ${result.error}`);
      }
    }

    this.log.log(`Admin email "${subject}" sent=${sent} failed=${failed} preview=${Boolean(dto.preview)}`);
    return { ok: failed === 0, sent, failed, total: withEmail.length, errors };
  }
}
