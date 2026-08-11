import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { feedbackNotifyAddress, isMailConfigured, sendMail } from '../mail/mail.util';

@Injectable()
export class FeedbackService {
  private readonly log = new Logger(FeedbackService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFeedbackDto, meta?: { userAgent?: string; userId?: number }) {
    const row = await this.prisma.feedback.create({
      data: {
        name: dto.name?.trim() || null,
        email: dto.email?.trim().toLowerCase() || null,
        category: dto.category,
        message: dto.message.trim(),
        rating: dto.rating ?? null,
        pageUrl: dto.pageUrl?.trim() || null,
        userAgent: meta?.userAgent?.slice(0, 500) || null,
        userId: meta?.userId ?? null,
      },
    });

    // Fire-and-forget notify — never block or fail the user submit on mail errors.
    void this.notifyInbox(row.id, dto).catch((err) => {
      this.log.warn(`Feedback notify failed: ${err instanceof Error ? err.message : err}`);
    });

    return {
      ok: true,
      id: row.id,
      message: 'Thank you — your feedback was received.',
    };
  }

  private async notifyInbox(id: number, dto: CreateFeedbackDto) {
    if (!isMailConfigured()) {
      this.log.debug(`Feedback #${id} saved (SMTP not configured — no email sent)`);
      return;
    }
    const to = feedbackNotifyAddress();
    if (!to) {
      this.log.warn(`Feedback #${id} saved but no notify address (SMTP_USER / FEEDBACK_NOTIFY_EMAIL)`);
      return;
    }

    const name = dto.name?.trim() || 'Anonymous';
    const email = dto.email?.trim() || '—';
    const rating = dto.rating != null ? `${dto.rating}/5` : '—';
    const page = dto.pageUrl?.trim() || '—';
    const subject = `[QuranPilot Feedback] ${dto.category} · #${id}`;
    const text = [
      `New feedback #${id}`,
      ``,
      `Category: ${dto.category}`,
      `Rating: ${rating}`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Page: ${page}`,
      ``,
      `Message:`,
      dto.message.trim(),
    ].join('\n');

    const html = `
      <h2>New QuranPilot feedback #${id}</h2>
      <p><strong>Category:</strong> ${escapeHtml(dto.category)}<br/>
      <strong>Rating:</strong> ${escapeHtml(rating)}<br/>
      <strong>Name:</strong> ${escapeHtml(name)}<br/>
      <strong>Email:</strong> ${escapeHtml(email)}<br/>
      <strong>Page:</strong> ${escapeHtml(page)}</p>
      <hr/>
      <p style="white-space:pre-wrap">${escapeHtml(dto.message.trim())}</p>
    `;

    const sent = await sendMail({
      to,
      subject,
      text,
      html,
      replyTo: dto.email?.trim() || undefined,
    });
    if (sent) this.log.log(`Feedback #${id} emailed to ${to}`);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
