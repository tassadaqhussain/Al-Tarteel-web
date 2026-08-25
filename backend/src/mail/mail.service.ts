import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Transporter } from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import {
  createTransporter,
  envMailConfig,
  notifyAddress,
  ResolvedMailConfig,
  sendWithTransporter,
} from './mail.util';
import { UpsertMailSettingsDto } from './dto/upsert-mail-settings.dto';

export type PublicMailSettings = {
  configured: boolean;
  source: 'database' | 'env' | null;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  fromAddress: string;
  notifyEmail: string;
  passwordSet: boolean;
};

@Injectable()
export class MailService {
  private readonly log = new Logger(MailService.name);
  private cachedConfig: ResolvedMailConfig | null | undefined;
  private cachedTransport: Transporter | null | undefined;

  constructor(private readonly prisma: PrismaService) {}

  invalidate() {
    this.cachedConfig = undefined;
    this.cachedTransport = undefined;
  }

  async isConfigured(): Promise<boolean> {
    return (await this.resolveConfig()) != null;
  }

  async getPublicSettings(): Promise<PublicMailSettings> {
    const row = await this.readRow();
    const env = envMailConfig();
    const resolved = await this.resolveConfig();

    if (row) {
      return {
        configured: resolved != null,
        source: resolved?.source ?? 'database',
        host: row.host,
        port: row.port,
        secure: row.secure,
        username: row.username,
        fromAddress: row.fromAddress ?? '',
        notifyEmail: row.notifyEmail ?? '',
        passwordSet: Boolean(row.password),
      };
    }

    if (env) {
      return {
        configured: true,
        source: 'env',
        host: env.host,
        port: env.port,
        secure: env.secure,
        username: env.user,
        fromAddress: env.from ?? '',
        notifyEmail: env.notifyEmail ?? '',
        passwordSet: Boolean(env.pass || env.smtpUrl),
      };
    }

    return {
      configured: false,
      source: null,
      host: '',
      port: 587,
      secure: false,
      username: '',
      fromAddress: '',
      notifyEmail: '',
      passwordSet: false,
    };
  }

  async upsertSettings(dto: UpsertMailSettingsDto): Promise<PublicMailSettings> {
    const host = dto.host.trim();
    const username = dto.username.trim();
    const incomingPass = dto.password?.trim() ?? '';
    const existing = await this.readRow();
    const password = incomingPass || existing?.password || '';

    if (!host || !username || !password) {
      throw new BadRequestException('Host, username, and password are required.');
    }

    const port = dto.port ?? 587;
    const secure = dto.secure ?? port === 465;

    try {
      await this.prisma.mailSetting.upsert({
        where: { id: 1 },
        create: {
          id: 1,
          host,
          port,
          secure,
          username,
          password,
          fromAddress: dto.fromAddress?.trim() || null,
          notifyEmail: dto.notifyEmail?.trim() || null,
        },
        update: {
          host,
          port,
          secure,
          username,
          password,
          fromAddress: dto.fromAddress?.trim() || null,
          notifyEmail: dto.notifyEmail?.trim() || null,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2021') {
        throw new BadRequestException('Mail settings table is missing. Run the database migration.');
      }
      throw err;
    }

    this.invalidate();
    this.log.log(`SMTP settings saved (host=${host} port=${port})`);
    return this.getPublicSettings();
  }

  async sendMail(opts: {
    to: string;
    subject: string;
    text: string;
    html?: string;
    replyTo?: string;
  }): Promise<boolean> {
    const result = await this.sendMailResult(opts);
    return result.ok;
  }

  async sendMailResult(opts: {
    to: string;
    subject: string;
    text: string;
    html?: string;
    replyTo?: string;
  }): Promise<{ ok: true } | { ok: false; error: string }> {
    const config = await this.resolveConfig();
    const transport = await this.getTransporter();
    if (!config || !transport) {
      this.log.warn('SMTP not configured — email skipped');
      return { ok: false, error: 'SMTP is not configured. Save settings in Admin → Email.' };
    }
    return sendWithTransporter(transport, config, opts);
  }

  async feedbackNotifyAddress(): Promise<string | null> {
    const config = await this.resolveConfig();
    if (!config) return null;
    return notifyAddress(config);
  }

  private async getTransporter(): Promise<Transporter | null> {
    if (this.cachedTransport !== undefined) return this.cachedTransport;
    const config = await this.resolveConfig();
    if (!config) {
      this.cachedTransport = null;
      return null;
    }
    try {
      this.cachedTransport = createTransporter(config);
    } catch (err) {
      this.log.warn(`SMTP transporter init failed: ${err instanceof Error ? err.message : err}`);
      this.cachedTransport = null;
    }
    return this.cachedTransport;
  }

  private async resolveConfig(): Promise<ResolvedMailConfig | null> {
    if (this.cachedConfig !== undefined) return this.cachedConfig;
    const row = await this.readRow();
    if (row?.host && row.username && row.password) {
      this.cachedConfig = {
        host: row.host,
        port: row.port,
        secure: row.secure || row.port === 465,
        user: row.username,
        pass: row.password,
        from: row.fromAddress,
        notifyEmail: row.notifyEmail,
        smtpUrl: null,
        source: 'database',
      };
      return this.cachedConfig;
    }
    this.cachedConfig = envMailConfig();
    return this.cachedConfig;
  }

  private async readRow() {
    try {
      return await this.prisma.mailSetting.findUnique({ where: { id: 1 } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2021') {
        return null;
      }
      throw err;
    }
  }
}
