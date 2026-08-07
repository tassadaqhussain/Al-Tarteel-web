/**
 * Safe returnUrl handling — only same-origin relative paths.
 * Blocks open redirects (//evil.com, https://..., javascript:, etc.).
 */
export function sanitizeReturnUrl(
  value: string | null | undefined,
  fallback = '/',
): string {
  if (!value) return fallback;
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }
  const trimmed = decoded.trim();
  if (!trimmed.startsWith('/')) return fallback;
  if (trimmed.startsWith('//')) return fallback;
  if (trimmed.includes('\\')) return fallback;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return fallback;
  // Auth pages as return targets create loops
  if (
    trimmed === '/login' ||
    trimmed === '/register' ||
    trimmed.startsWith('/login?') ||
    trimmed.startsWith('/register?') ||
    trimmed.startsWith('/forgot-password') ||
    trimmed.startsWith('/reset-password')
  ) {
    return fallback;
  }
  return trimmed;
}

export function loginHref(returnUrl?: string | null): string {
  const safe = sanitizeReturnUrl(returnUrl, '/');
  if (safe === '/') return '/login';
  return `/login?returnUrl=${encodeURIComponent(safe)}`;
}

export function registerHref(returnUrl?: string | null): string {
  const safe = sanitizeReturnUrl(returnUrl, '/');
  if (safe === '/') return '/register';
  return `/register?returnUrl=${encodeURIComponent(safe)}`;
}
