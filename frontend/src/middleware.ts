import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * SEO headers for URLs that should not enter the organic index:
 * - /search?q=… (internal search result URLs)
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
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
  matcher: ['/search'],
};
