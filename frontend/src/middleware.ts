import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Real Server Action IDs are long opaque hashes; scanners send "x", "test", etc. */
const MIN_SERVER_ACTION_ID_LENGTH = 40;

export function middleware(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.next();
  }

  const actionId = request.headers.get('next-action');
  if (!actionId) {
    return NextResponse.next();
  }

  if (actionId.length < MIN_SERVER_ACTION_ID_LENGTH) {
    return new NextResponse(null, { status: 400 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
