import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSurahPath } from '@/lib/surah-meta';

const MIN_SERVER_ACTION_ID_LENGTH = 40;

export function proxy(request: NextRequest) {
  if (request.method === 'POST') {
    const actionId = request.headers.get('next-action');
    if (actionId && actionId.length < MIN_SERVER_ACTION_ID_LENGTH) {
      return new NextResponse(null, { status: 400 });
    }
  }

  const { pathname, searchParams } = request.nextUrl;
  // next.config handles /surah/1 through /surah/114. Normalize their
  // zero-padded aliases too, preserving every query parameter and its encoding.
  const paddedSurah = /^\/surah\/(0+\d+)$/.exec(pathname);
  if (paddedSurah && (request.method === 'GET' || request.method === 'HEAD')) {
    const number = Number(paddedSurah[1]);
    if (Number.isInteger(number) && number >= 1 && number <= 114) {
      const canonical = request.nextUrl.clone();
      canonical.pathname = getSurahPath(number);
      return NextResponse.redirect(canonical, 308);
    }
  }

  const response = NextResponse.next();

  if (pathname === '/search') {
    const q = searchParams.get('q')?.trim();
    if (q) {
      response.headers.set('X-Robots-Tag', 'noindex, follow');
    }
  }

  return response;
}

export const config = {
  matcher: '/:path*',
};
