import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_TYPES = new Set(['mistake', 'feature', 'general'] as const);
type ContactType = 'mistake' | 'feature' | 'general';

const TYPE_TO_FEEDBACK_CATEGORY: Record<ContactType, string> = {
  mistake: 'translation',
  feature: 'idea',
  general: 'other',
};

/** Simple in-memory sliding-window rate limiter (5 requests / 10 min per IP). */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const rateBuckets = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (rateBuckets.get(ip) ?? []).filter((ts) => now - ts < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    rateBuckets.set(ip, recent);
    return true;
  }
  recent.push(now);
  rateBuckets.set(ip, recent);
  return false;
}

function getClientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

function backendApiBase(): string {
  const internal = process.env.INTERNAL_API_URL?.trim();
  if (internal) return internal.replace(/\/$/, '');
  const pub = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (pub && /^https?:\/\//i.test(pub)) return pub.replace(/\/$/, '');
  return 'http://127.0.0.1:4010/api/v1';
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many messages sent. Please wait a few minutes and try again.' },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // Honeypot spam trap: bots fill hidden "website" field; pretend success without storing.
  if (typeof body.website === 'string' && body.website.trim().length > 0) {
    return NextResponse.json({ ok: true, message: 'Thank you. Your message has been received.' });
  }

  const rawType = typeof body.type === 'string' ? body.type.trim().toLowerCase() : 'general';
  const type: ContactType = ALLOWED_TYPES.has(rawType as ContactType)
    ? (rawType as ContactType)
    : 'general';

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : '';
  const email = typeof body.email === 'string' ? body.email.trim().slice(0, 180) : '';
  const reference = typeof body.reference === 'string' ? body.reference.trim().slice(0, 80) : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const pageUrl = typeof body.pageUrl === 'string' ? body.pageUrl.trim().slice(0, 500) : undefined;

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  if (message.length < 10 || message.length > 4000) {
    return NextResponse.json(
      { error: 'Please enter a message between 10 and 4,000 characters.' },
      { status: 400 },
    );
  }

  const formattedMessage = [
    `[Contact: ${type}]`,
    reference ? `[Ref: ${reference}]` : null,
    message,
  ]
    .filter(Boolean)
    .join(' ');

  // Persist to the existing backend Postgres Feedback table so messages appear in /admin/feedback
  // and are never silently dropped even when no outbound email provider is configured.
  try {
    const res = await fetch(`${backendApiBase()}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent') || 'QuranPilot-Contact',
      },
      body: JSON.stringify({
        name: name || undefined,
        email: email || undefined,
        category: TYPE_TO_FEEDBACK_CATEGORY[type],
        message: formattedMessage,
        pageUrl,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('[api/contact] Backend persistence failed:', res.status, errText);
      return NextResponse.json(
        { error: 'Could not save your message right now. Please try again or email us directly.' },
        { status: 502 },
      );
    }

    // TODO: Wire an outbound email notification (e.g. Resend / SES / SMTP) to CONTACT_EMAIL
    // in addition to Postgres storage once mail credentials are configured.
    return NextResponse.json({
      ok: true,
      message: 'Thank you! Your message has been saved and our team will review it.',
    });
  } catch (err) {
    console.error('[api/contact] Failed to reach backend feedback service:', err);
    return NextResponse.json(
      { error: 'Could not save your message right now. Please try again or email us directly.' },
      { status: 503 },
    );
  }
}
