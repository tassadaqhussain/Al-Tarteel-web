import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

@Injectable()
export class SubscribeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  private publicApiBase(): string {
    const frontend = (process.env.FRONTEND_URL || 'https://quranpilot.com').replace(/\/$/, '');
    return `${frontend}/api/v1`;
  }

  async subscribe(rawEmail: string, source = 'inline', locale = 'en') {
    const email = (rawEmail || '').trim().toLowerCase();
    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      throw new BadRequestException('Please enter a valid email address.');
    }

    const cleanSource = (source || 'inline').slice(0, 60);
    const cleanLocale = (locale || 'en').slice(0, 10);
    const existing = await this.prisma.dailySubscriber.findUnique({ where: { email } });

    if (existing?.status === 'confirmed') {
      return {
        ok: true,
        status: 'confirmed',
        message: 'You are already subscribed to Daily Quran Reflection.',
      };
    }

    const confirmToken = existing?.confirmToken || randomBytes(24).toString('hex');
    await this.prisma.dailySubscriber.upsert({
      where: { email },
      update: {
        source: cleanSource,
        locale: cleanLocale,
        status: 'pending',
        confirmToken,
      },
      create: {
        email,
        source: cleanSource,
        locale: cleanLocale,
        status: 'pending',
        confirmToken,
      },
    });

    const confirmUrl = `${this.publicApiBase()}/subscribe/confirm?token=${encodeURIComponent(confirmToken)}`;
    const unsubUrl = `${this.publicApiBase()}/subscribe/unsubscribe?token=${encodeURIComponent(confirmToken)}`;
    const sent = await this.mail.sendMailResult({
      to: email,
      subject: 'Confirm your Daily Quran Reflection subscription',
      text: [
        'Assalamu alaikum,',
        '',
        'Confirm your Daily Quran Reflection subscription on QuranPilot:',
        confirmUrl,
        '',
        'If you did not request this, you can ignore this email or unsubscribe:',
        unsubUrl,
      ].join('\n'),
      html: `
        <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0f172a">
          <h2 style="margin:0 0 12px;color:#064e3b">Daily Quran Reflection</h2>
          <p style="margin:0 0 16px;line-height:1.6">Assalamu alaikum — click below to confirm your daily ayah &amp; reflection subscription on QuranPilot.</p>
          <p style="margin:20px 0">
            <a href="${confirmUrl}" style="display:inline-block;background:#064e3b;color:#ffffff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600">Confirm subscription</a>
          </p>
          <p style="margin:16px 0 0;font-size:12px;color:#64748b">Didn&rsquo;t ask for this? Ignore this email or <a href="${unsubUrl}" style="color:#064e3b">unsubscribe</a>.</p>
        </div>
      `,
    });

    return {
      ok: true,
      status: sent.ok ? 'pending_confirmation' : 'saved',
      message: sent.ok
        ? 'Subscribed! Please check your inbox to confirm your daily ayah.'
        : 'You are subscribed for Daily Quran Reflection!',
    };
  }

  async confirm(token: string) {
    const clean = (token || '').trim();
    if (!clean) return false;
    const sub = await this.prisma.dailySubscriber.findUnique({ where: { confirmToken: clean } });
    if (!sub) return false;
    await this.prisma.dailySubscriber.update({
      where: { id: sub.id },
      data: { status: 'confirmed', confirmedAt: sub.confirmedAt ?? new Date() },
    });
    return true;
  }

  async unsubscribe(token: string) {
    const clean = (token || '').trim();
    if (!clean) return false;
    const sub = await this.prisma.dailySubscriber.findUnique({ where: { confirmToken: clean } });
    if (!sub) return false;
    await this.prisma.dailySubscriber.update({
      where: { id: sub.id },
      data: { status: 'unsubscribed' },
    });
    return true;
  }
}
