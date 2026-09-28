import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import {
  escapeHtml,
  publicSiteOrigin,
  renderUserEmailHtml,
  renderUserEmailText,
  resolveCtaUrl,
} from '../mail/user-email.template';
import {
  findAnnouncement,
  publishedAnnouncements,
  type Announcement,
} from './announcements.data';

const EMAIL_BATCH = 200;

/** Users who can receive announcement email: registered, with an address, not opted out. */
const EMAIL_AUDIENCE = {
  passwordHash: { not: null },
  email: { not: null },
  featureEmailsOptOut: false,
} as const;

@Injectable()
export class AnnouncementsService {
  private readonly log = new Logger(AnnouncementsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  // ── In-app ──────────────────────────────────────────────────────────────

  async listForUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const items = publishedAnnouncements();
    const reads = await this.prisma.announcementRead.findMany({
      where: { userId, announcementId: { in: items.map((a) => a.id) } },
      select: { announcementId: true },
    });
    const readIds = new Set(reads.map((r) => r.announcementId));
    // Features that shipped before the account existed are not "new" to this user.
    const joined = user.createdAt.toISOString().slice(0, 10);

    const list = items.map((a) => ({
      id: a.id,
      publishedAt: a.publishedAt,
      title: a.title,
      body: a.body,
      ctaLabel: a.ctaLabel,
      ctaPath: a.ctaPath,
      read: readIds.has(a.id) || a.publishedAt < joined,
    }));
    return { items: list, unread: list.filter((a) => !a.read).length };
  }

  async markRead(userId: number, ids: string[]) {
    const known = ids.filter((id) => findAnnouncement(id));
    if (!known.length) return { ok: true, marked: 0 };
    const result = await this.prisma.announcementRead.createMany({
      data: known.map((announcementId) => ({ userId, announcementId })),
      skipDuplicates: true,
    });
    return { ok: true, marked: result.count };
  }

  async markAllRead(userId: number) {
    return this.markRead(
      userId,
      publishedAnnouncements().map((a) => a.id),
    );
  }

  // ── Email preference & unsubscribe ─────────────────────────────────────

  async getEmailPreference(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { featureEmailsOptOut: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return { featureEmails: !user.featureEmailsOptOut };
  }

  async setEmailPreference(userId: number, featureEmails: boolean) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { featureEmailsOptOut: !featureEmails },
    });
    return { featureEmails };
  }

  unsubscribeToken(userId: number): string {
    return `${userId}.${this.sign(userId)}`;
  }

  async unsubscribe(token: string) {
    const userId = this.verifyToken(token);
    if (!userId) throw new BadRequestException('This unsubscribe link is invalid.');
    const updated = await this.prisma.user.updateMany({
      where: { id: userId },
      data: { featureEmailsOptOut: true },
    });
    if (!updated.count) throw new BadRequestException('This unsubscribe link is invalid.');
    return { ok: true };
  }

  private sign(userId: number): string {
    const secret = process.env.JWT_SECRET || 'default-secret-change-me';
    return createHmac('sha256', secret).update(`feature-emails:${userId}`).digest('base64url');
  }

  private verifyToken(token: string): number | null {
    const match = /^(\d{1,10})\.([A-Za-z0-9_-]{20,})$/.exec(token?.trim() ?? '');
    if (!match) return null;
    const userId = Number(match[1]);
    const expected = Buffer.from(this.sign(userId));
    const given = Buffer.from(match[2]);
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
    return userId;
  }

  // ── Admin: one-time email broadcast ────────────────────────────────────

  async adminList() {
    const [audience, logs] = await Promise.all([
      this.prisma.user.count({ where: EMAIL_AUDIENCE }),
      this.prisma.announcementEmail.findMany(),
    ]);
    const byId = new Map(logs.map((l) => [l.announcementId, l]));
    return {
      audience,
      items: publishedAnnouncements().map((a) => ({
        id: a.id,
        publishedAt: a.publishedAt,
        title: a.title.en,
        ctaPath: a.ctaPath,
        emailSubject: a.email?.subject ?? null,
        email: byId.get(a.id) ?? null,
      })),
    };
  }

  /**
   * Preview goes to the admin only. A real send is allowed once per
   * announcement (enforced by the AnnouncementEmail primary key) and runs in
   * the background; progress is visible in `adminList`.
   */
  async sendEmail(id: string, opts: { preview: boolean; adminEmail?: string | null }) {
    const announcement = findAnnouncement(id);
    if (!announcement || !publishedAnnouncements().some((a) => a.id === id)) {
      throw new NotFoundException('Announcement not found or not yet published');
    }
    if (!announcement.email) throw new BadRequestException('This announcement has no email copy.');
    if (!(await this.mail.isConfigured())) {
      throw new BadRequestException('SMTP is not configured. Save settings in Admin → Email.');
    }

    if (opts.preview) {
      const to = opts.adminEmail?.trim().toLowerCase();
      if (!to) throw new BadRequestException('Admin email is required for a preview.');
      const result = await this.mail.sendMailResult({
        to,
        ...this.render(announcement, 'Admin', null),
      });
      if (!result.ok) throw new BadRequestException(result.error);
      return { ok: true, preview: true };
    }

    const total = await this.prisma.user.count({ where: EMAIL_AUDIENCE });
    if (!total) throw new BadRequestException('No subscribed users to email.');
    const previous = await this.prisma.announcementEmail.findUnique({ where: { announcementId: id } });
    if (previous && !previous.finishedAt) {
      throw new ConflictException('This announcement is being emailed right now.');
    }
    if (previous && previous.sent > 0) {
      throw new ConflictException('This announcement has already been emailed.');
    }
    // A finished attempt that delivered nothing (e.g. broken SMTP) may be retried.
    if (previous) {
      await this.prisma.announcementEmail.deleteMany({
        where: { announcementId: id, sent: 0, finishedAt: { not: null } },
      });
    }
    try {
      await this.prisma.announcementEmail.create({
        data: { announcementId: id, total, startedBy: opts.adminEmail ?? null },
      });
    } catch {
      throw new ConflictException('This announcement has already been emailed.');
    }

    void this.broadcast(announcement).catch((err) =>
      this.log.error(`Announcement email ${id} failed: ${err instanceof Error ? err.message : err}`),
    );
    return { ok: true, started: true, total };
  }

  private async broadcast(announcement: Announcement) {
    let cursor = 0;
    let sent = 0;
    let failed = 0;
    for (;;) {
      const users = await this.prisma.user.findMany({
        where: { ...EMAIL_AUDIENCE, id: { gt: cursor } },
        orderBy: { id: 'asc' },
        take: EMAIL_BATCH,
        select: { id: true, email: true, name: true },
      });
      if (!users.length) break;
      for (const user of users) {
        cursor = user.id;
        if (!user.email) continue;
        const result = await this.mail.sendMailResult({
          to: user.email,
          ...this.render(announcement, user.name?.trim() || 'there', user.id),
        });
        if (result.ok) sent += 1;
        else failed += 1;
      }
      await this.prisma.announcementEmail.update({
        where: { announcementId: announcement.id },
        data: { sent, failed },
      });
    }
    await this.prisma.announcementEmail.update({
      where: { announcementId: announcement.id },
      data: { sent, failed, finishedAt: new Date() },
    });
    this.log.log(`Announcement email ${announcement.id}: sent=${sent} failed=${failed}`);
  }

  private render(announcement: Announcement, name: string, userId: number | null) {
    const email = announcement.email!;
    const content = {
      name,
      subject: email.subject,
      body: email.body,
      ctaLabel: announcement.ctaLabel.en,
      ctaUrl: resolveCtaUrl(announcement.ctaPath),
      layout: 'announcement' as const,
    };
    const unsubscribeUrl =
      userId === null
        ? `${publicSiteOrigin()}/unsubscribe`
        : `${publicSiteOrigin()}/unsubscribe?token=${encodeURIComponent(this.unsubscribeToken(userId))}`;
    const note = 'You receive this because you have a QuranPilot account. Turn off new-feature emails:';
    const footer =
      `<p style="margin:16px auto;max-width:560px;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;text-align:center;">` +
      `${escapeHtml(note)} <a href="${escapeHtml(unsubscribeUrl)}" style="color:#065f46;">Unsubscribe</a></p>`;
    const html = renderUserEmailHtml(content);
    return {
      subject: email.subject,
      text: `${renderUserEmailText(content)}\n\n${note}\n${unsubscribeUrl}`,
      html: html.includes('</body>') ? html.replace('</body>', `${footer}</body>`) : html + footer,
    };
  }
}
