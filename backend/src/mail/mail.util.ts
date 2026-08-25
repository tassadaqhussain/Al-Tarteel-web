import { Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const log = new Logger('Mail');

export type ResolvedMailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string | null;
  notifyEmail: string | null;
  smtpUrl: string | null;
  source: 'database' | 'env';
};

export function envMailConfig(): ResolvedMailConfig | null {
  const smtpUrl = process.env.SMTP_URL?.trim() || null;
  const host = process.env.SMTP_HOST?.trim() || '';
  const user = process.env.SMTP_USER?.trim() || '';
  const pass = process.env.SMTP_PASS?.trim() || '';
  if (!smtpUrl && (!host || !user || !pass)) return null;

  const port = Number(process.env.SMTP_PORT || (smtpUrl ? 465 : 587));
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  return {
    host,
    port: Number.isFinite(port) ? port : 587,
    secure,
    user,
    pass,
    from: process.env.SMTP_FROM?.trim() || null,
    notifyEmail: process.env.FEEDBACK_NOTIFY_EMAIL?.trim() || null,
    smtpUrl,
    source: 'env',
  };
}

export function isEnvMailConfigured(): boolean {
  return envMailConfig() != null;
}

export function createTransporter(config: ResolvedMailConfig): Transporter {
  if (config.smtpUrl) {
    return nodemailer.createTransport(config.smtpUrl);
  }
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });
}

export function fromAddress(config: ResolvedMailConfig): string {
  return config.from?.trim() || config.user?.trim() || 'noreply@quranpilot.com';
}

export function notifyAddress(config: ResolvedMailConfig): string | null {
  return config.notifyEmail?.trim() || config.user?.trim() || null;
}

export async function sendWithTransporter(
  transport: Transporter,
  config: ResolvedMailConfig,
  opts: {
    to: string;
    subject: string;
    text: string;
    html?: string;
    replyTo?: string;
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await transport.sendMail({
      from: fromAddress(config),
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
      replyTo: opts.replyTo,
    });
    return { ok: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    log.error(`Failed to send mail: ${error}`);
    return { ok: false, error };
  }
}
