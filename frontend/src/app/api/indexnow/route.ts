import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/seo';

/**
 * Optional IndexNow submission endpoint for Bing/Yandex.
 * Requires INDEXNOW_KEY in environment variables.
 */
export async function POST(request: Request) {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!key) {
    return NextResponse.json(
      { ok: false, error: 'INDEXNOW_KEY is not configured' },
      { status: 503 },
    );
  }

  let body: { urls?: string[] } = {};
  try {
    body = (await request.json()) as { urls?: string[] };
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const urlList = Array.isArray(body.urls)
    ? body.urls
        .filter((u): u is string => typeof u === 'string' && u.startsWith(SITE_URL))
        .slice(0, 10000)
    : [];

  if (!urlList.length) {
    return NextResponse.json(
      { ok: false, error: `Provide at least one URL starting with ${SITE_URL}` },
      { status: 400 },
    );
  }

  const host = new URL(SITE_URL).host;
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key,
      keyLocation: `${SITE_URL}/${key}.txt`,
      urlList,
    }),
  });

  return NextResponse.json({ ok: res.ok, status: res.status, submitted: urlList.length });
}

