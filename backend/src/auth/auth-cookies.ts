import type { CookieOptions, Response } from 'express';

export const ACCESS_COOKIE = 'qp_access';
export const REFRESH_COOKIE = 'qp_refresh';

const isProd = () => process.env.NODE_ENV === 'production';

function baseCookieOptions(): CookieOptions {
  const domain = process.env.COOKIE_DOMAIN?.trim();
  return {
    httpOnly: true,
    secure: isProd(),
    sameSite: 'lax',
    path: '/',
    ...(domain ? { domain } : {}),
  };
}

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string; accessMaxAgeMs: number; refreshMaxAgeMs: number },
) {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...baseCookieOptions(),
    maxAge: tokens.accessMaxAgeMs,
  });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...baseCookieOptions(),
    maxAge: tokens.refreshMaxAgeMs,
  });
}

export function clearAuthCookies(res: Response) {
  const opts = baseCookieOptions();
  res.clearCookie(ACCESS_COOKIE, opts);
  res.clearCookie(REFRESH_COOKIE, opts);
}

export function parseDurationMs(value: string | undefined, fallbackMs: number): number {
  if (!value) return fallbackMs;
  const m = /^(\d+)(ms|s|m|h|d)$/.exec(value.trim());
  if (!m) return fallbackMs;
  const n = parseInt(m[1], 10);
  switch (m[2]) {
    case 'ms':
      return n;
    case 's':
      return n * 1000;
    case 'm':
      return n * 60_000;
    case 'h':
      return n * 3_600_000;
    case 'd':
      return n * 86_400_000;
    default:
      return fallbackMs;
  }
}
