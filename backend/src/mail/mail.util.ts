import { Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const log = new Logger('Mail');

let transporter: Transporter | null | undefined;

function buildTransporter(): Transporter | null {
  const url = process.env.SMTP_URL?.trim();
  if (url) {
    return nodemailer.createTransport(url);
  }

  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT || 587);
  const secure =
    process.env.SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;
  try {
    transporter = buildTransporter();
  } catch (err) {
    log.warn(`SMTP transporter init failed: ${err instanceof Error ? err.message : err}`);
    transporter = null;
  }
  return transporter;
}

export function isMailConfigured(): boolean {
  return Boolean(process.env.SMTP_URL?.trim() || (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS));
}

/** Prefer FEEDBACK_NOTIFY_EMAIL, else SMTP_USER (Gmail account used to send). */
export function feedbackNotifyAddress(): string | null {
  const explicit = process.env.FEEDBACK_NOTIFY_EMAIL?.trim();
  if (explicit) return explicit;
  return process.env.SMTP_USER?.trim() || null;
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    log.warn('SMTP not configured — email skipped');
    return false;
  }

  const from =
    process.env.SMTP_FROM?.trim() ||
    process.env.SMTP_USER?.trim() ||
    'noreply@quranpilot.com';

  try {
    await transport.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
      replyTo: opts.replyTo,
    });
    return true;
  } catch (err) {
    log.error(`Failed to send mail: ${err instanceof Error ? err.message : err}`);
    return false;
  }
}
