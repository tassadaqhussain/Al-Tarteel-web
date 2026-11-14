import { NextRequest } from 'next/server';

export function GET(request: NextRequest) {
  const configured = process.env.INDEXNOW_KEY?.trim();
  const requested = request.nextUrl.searchParams.get('key')?.trim();

  if (!configured || !requested || requested !== configured) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(configured, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
