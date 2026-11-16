import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_REQUESTS = 5;

const rateBucket = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const prev = rateBucket.get(ip) ?? [];
  const recent = prev.filter((ts) => now - ts < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX_REQUESTS) {
    rateBucket.set(ip, recent);
    return true;
  }
  recent.push(now);
  rateBucket.set(ip, recent);
  return false;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

function getStorePath(): string {
  return (
    process.env.SUBSCRIBE_STORE_PATH?.trim() ||
    path.join(os.tmpdir(), 'quranpilot-subscribers.jsonl')
  );
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Please try again in a few minutes.' },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 });
  }

  // Honeypot spam protection: silently accept bot submissions without storing.
  const honeypot = typeof body.website === 'string' ? body.website.trim() : '';
  if (honeypot.length > 0) {
    return NextResponse.json({
      ok: true,
      status: 'pending_confirmation',
      message: 'Thanks! Please check your inbox to confirm your subscription.',
    });
  }

  const rawEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!rawEmail || rawEmail.length > 254 || !EMAIL_RE.test(rawEmail)) {
    return NextResponse.json(
      { ok: false, error: 'Please enter a valid email address.' },
      { status: 400 },
    );
  }

  const source = typeof body.source === 'string' ? body.source.slice(0, 60) : 'inline';
  const locale = typeof body.locale === 'string' ? body.locale.slice(0, 10) : 'en';
  const confirmToken = randomBytes(24).toString('hex');

  const storePath = getStorePath();
  try {
    await mkdir(path.dirname(storePath), { recursive: true });
    let alreadyExists = false;
    try {
      const existing = await readFile(storePath, 'utf8');
      alreadyExists = existing.includes(`"email":"${rawEmail}"`);
    } catch {
      // File does not exist yet.
    }

    if (!alreadyExists) {
      const record = {
        email: rawEmail,
        source,
        locale,
        status: 'pending_confirmation',
        doubleOptInReady: true,
        confirmToken,
        createdAt: new Date().toISOString(),
      };
      await appendFile(storePath, `${JSON.stringify(record)}\n`, 'utf8');
    }
  } catch (err) {
    console.error('[subscribe] Failed to persist subscriber:', err);
    return NextResponse.json(
      { ok: false, error: 'Unable to save subscription right now. Please try again.' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    status: 'pending_confirmation',
    message: 'You are subscribed! Please check your inbox to confirm your daily ayah.',
  });
}
