import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAyahPath, getSurahPath } from '@/lib/surah-meta';
import { parseAyahNumber } from '@/lib/surah-pagination';

const MIN_SERVER_ACTION_ID_LENGTH = 40;
const CANONICAL_HOST = 'quranpilot.com';
const WWW_HOST = 'www.quranpilot.com';

function canonicalOriginRedirect(request: NextRequest, pathname: string): NextResponse {
  const search = request.nextUrl.search || '';
  return NextResponse.redirect(`https://${CANONICAL_HOST}${pathname}${search}`, 301);
}

function redirectPath(request: NextRequest, targetPathname: string): NextResponse {
  const search = request.nextUrl.search || '';
  return NextResponse.redirect(new URL(`${targetPathname}${search}`, request.nextUrl.origin), 301);
}

function resolveNumericRedirect(pathname: string): string | null {
  if (pathname === '/surah' || pathname === '/surah/') {
    return '/surahs';
  }

  const localeMatch = /^\/(ur|ps|fa)(\/.*)$/.exec(pathname);
  const localePrefix = localeMatch ? `/${localeMatch[1]}` : '';
  const rest = localeMatch ? localeMatch[2] : pathname;

  // /surah/{n} or /surah/{n}/{ayah} (including zero-padded)
  const surahMatch = /^\/surah\/(\d+)(?:\/(\d+))?$/.exec(rest);
  if (surahMatch) {
    const surahNum = Number(surahMatch[1]);
    if (Number.isInteger(surahNum) && surahNum >= 1 && surahNum <= 114) {
      if (surahMatch[2] !== undefined) {
        const ayahNum = parseAyahNumber(surahMatch[2], surahNum);
        if (ayahNum) return `${localePrefix}${getAyahPath(surahNum, ayahNum)}`;
      } else {
        return `${localePrefix}${getSurahPath(surahNum)}`;
      }
    }
    return null;
  }

  // /{n} or /{n}/{ayah} (including zero-padded)
  const numericMatch = /^\/(\d+)(?:\/(\d+))?$/.exec(rest);
  if (numericMatch) {
    const surahNum = Number(numericMatch[1]);
    if (Number.isInteger(surahNum) && surahNum >= 1 && surahNum <= 114) {
      if (numericMatch[2] !== undefined) {
        const ayahNum = parseAyahNumber(numericMatch[2], surahNum);
        if (ayahNum) return `${localePrefix}${getAyahPath(surahNum, ayahNum)}`;
      } else {
        return `${localePrefix}${getSurahPath(surahNum)}`;
      }
    }
  }

  return null;
}

export function proxy(request: NextRequest) {
  if (request.method === 'POST') {
    const actionId = request.headers.get('next-action');
    if (actionId && actionId.length < MIN_SERVER_ACTION_ID_LENGTH) {
      return new NextResponse(null, { status: 400 });
    }
  }

  const { pathname, searchParams } = request.nextUrl;

  if (request.method === 'GET' || request.method === 'HEAD') {
    // 1. Single-hop canonical host + HTTPS enforcement (www → apex, http → https).
    const rawHost = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '')
      .split(',')[0]
      .trim()
      .toLowerCase()
      .replace(/:\d+$/, '');
    const proto = (request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(/:$/, ''))
      .split(',')[0]
      .trim()
      .toLowerCase();

    const canonicalTargetPath = resolveNumericRedirect(pathname) ?? pathname;
    if (rawHost === WWW_HOST || (rawHost === CANONICAL_HOST && proto === 'http')) {
      return canonicalOriginRedirect(request, canonicalTargetPath);
    }

    // 2. Numeric and legacy /surah/{n}, /{n}, /{n}/{ayah}, /surah/{n}/{ayah} → canonical slug (301).
    if (canonicalTargetPath !== pathname) {
      return redirectPath(request, canonicalTargetPath);
    }
  }

  const firstSeg = pathname.split('/').filter(Boolean)[0];
  const routeLocale =
    firstSeg === 'ur' || firstSeg === 'ps' || firstSeg === 'fa' ? firstSeg : 'en';
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-qp-locale', routeLocale);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

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
