import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Real Server Action IDs are long opaque hashes; scanners send "x", "test", etc. */
const MIN_SERVER_ACTION_ID_LENGTH = 40;

/**
 * Request proxy:
 * - Block fake Next-Action probes (react2shell scanners)
 * - SEO headers for /search?q=… (noindex)
 */
export function proxy(request: NextRequest) {
  if (request.method === 'POST') {
    const actionId = request.headers.get('next-action');
    if (actionId && actionId.length < MIN_SERVER_ACTION_ID_LENGTH) {
      return new NextResponse(null, { status: 400 });
    }
  }

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
  matcher: '/:path*',
};
