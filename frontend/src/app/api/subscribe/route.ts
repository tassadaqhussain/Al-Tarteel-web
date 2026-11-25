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

function backendApiBase(): string {
  const internal = process.env.API_URL?.trim() || process.env.INTERNAL_API_URL?.trim();
  if (internal) return internal.replace(/\/$/, '');
  const pub = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (pub && /^https?:\/\//i.test(pub)) return pub.replace(/\/$/, '');
  return 'http://127.0.0.1:4010/api/v1';
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

  try {
    const upstream = await fetch(`${backendApiBase()}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: rawEmail, source, locale }),
      signal: AbortSignal.timeout(8000),
    });
    const data = (await upstream.json().catch(() => null)) as {
      ok?: boolean;
      status?: string;
      message?: string;
      error?: string;
    } | null;
    if (upstream.ok && data?.ok) {
      return NextResponse.json(data);
    }
    if (upstream.status >= 400 && upstream.status < 500 && data) {
      return NextResponse.json(
        { ok: false, error: data.message || data.error || 'Could not subscribe.' },
        { status: upstream.status },
      );
    }
  } catch {
    // Backend unavailable; fall back to local JSONL store.
  }

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
        status: 'saved',
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
    status: 'saved',
    message: 'You are subscribed for Daily Quran Reflection!',
  });
}

