/**
 * Google Analytics 4 & Privacy-Conscious Analytics Integration.
 *
 * Adheres to:
 * - Google Search Central & Google Tag / GA4 best practices
 * - Consent Mode v2 (EEA/UK compliant)
 * - Strict PII sanitization (passwords, tokens, emails never sent to GA4)
 * - Safe error handling (never crashes client runtime)
 */

export const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim() || '';
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || '';

export const analyticsEnabled = Boolean(PLAUSIBLE_DOMAIN || GA_MEASUREMENT_ID);

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const GA_DEBUG_MODE =
  !IS_PRODUCTION || process.env.NEXT_PUBLIC_GA_DEBUG === 'true';

/** Optional custom Plausible script host (self-hosted). Defaults to plausible.io. */
export const PLAUSIBLE_SCRIPT_SRC =
  process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC?.trim() || 'https://plausible.io/js/script.js';

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number | boolean> },
    ) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Sensitive query parameters that must never be sent to Google Analytics. */
const SENSITIVE_QUERY_PARAMS = new Set([
  'token',
  'resettoken',
  'reset_token',
  'auth',
  'access_token',
  'id_token',
  'code',
  'password',
  'key',
  'secret',
  'email',
  'session_id',
  'client_secret',
  'payment_intent_client_secret',
]);

const EMAIL_REGEX = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g;

/**
 * Remove sensitive query parameters and emails from URLs before transmitting to GA4.
 */
export function sanitizeUrl(urlStr: string): string {
  try {
    if (!urlStr) return '';
    const isAbsolute = urlStr.startsWith('http://') || urlStr.startsWith('https://');
    const dummyBase = 'https://quranpilot.com';
    const parsed = new URL(urlStr, dummyBase);

    // Redact sensitive query parameters
    const toDelete: string[] = [];
    parsed.searchParams.forEach((_, key) => {
      if (SENSITIVE_QUERY_PARAMS.has(key.toLowerCase())) {
        toDelete.push(key);
      }
    });
    for (const key of toDelete) {
      parsed.searchParams.delete(key);
    }

    const cleanPathAndQuery = `${parsed.pathname}${parsed.search ? parsed.search : ''}`;
    const cleanFull = cleanPathAndQuery.replace(EMAIL_REGEX, '[REDACTED_EMAIL]');

    if (isAbsolute) {
      return `${parsed.origin}${cleanFull}`;
    }
    return cleanFull;
  } catch {
    return urlStr.replace(EMAIL_REGEX, '[REDACTED_EMAIL]');
  }
}

/** Sanitize search queries and text strings to prevent accidental PII leakage. */
export function sanitizeText(text: string): string {
  if (!text) return '';
  return text.trim().slice(0, 100).replace(EMAIL_REGEX, '[REDACTED_EMAIL]');
}

/**
 * Safe invocation of window.gtag with try/catch wrapping.
 */
function safeGtag(command: string, ...args: unknown[]) {
  if (typeof window === 'undefined' || !window.gtag) return;
  try {
    window.gtag(command, ...args);
  } catch (err) {
    if (GA_DEBUG_MODE) {
      console.warn('[GA4] Event dispatch error:', err);
    }
  }
}

/**
 * Track page view with sanitized paths, ensuring single execution per route.
 */
export function trackPageView(path: string, customTitle?: string) {
  if (typeof window === 'undefined') return;

  const cleanPath = sanitizeUrl(path);
  const cleanLocation = sanitizeUrl(window.location.href);
  const pageTitle = sanitizeText(customTitle || document.title);

  if (PLAUSIBLE_DOMAIN && window.plausible) {
    try {
      window.plausible('pageview', { props: { path: cleanPath } });
    } catch {
      /* ignore */
    }
  }

  if (GA_MEASUREMENT_ID && window.gtag) {
    safeGtag('event', 'page_view', {
      page_path: cleanPath,
      page_location: cleanLocation,
      page_title: pageTitle,
      ...(GA_DEBUG_MODE ? { debug_mode: true } : {}),
    });
  }
}

/**
 * GA4 Standard Event: login
 */
export function trackLogin(method = 'email') {
  safeGtag('event', 'login', {
    method: sanitizeText(method),
    ...(GA_DEBUG_MODE ? { debug_mode: true } : {}),
  });
}

/**
 * GA4 Standard Event: sign_up
 */
export function trackSignUp(method = 'email') {
  safeGtag('event', 'sign_up', {
    method: sanitizeText(method),
    ...(GA_DEBUG_MODE ? { debug_mode: true } : {}),
  });
}

/**
 * GA4 Standard Event: search
 */
export function trackSearch(query: string, resultsCount?: number, searchType = 'text') {
  const cleanQuery = sanitizeText(query);
  if (!cleanQuery) return;

  safeGtag('event', 'search', {
    search_term: cleanQuery,
    search_type: searchType,
    ...(typeof resultsCount === 'number' ? { results_count: resultsCount } : {}),
    ...(GA_DEBUG_MODE ? { debug_mode: true } : {}),
  });
}

/**
 * GA4 Standard Event: select_content
 */
export function trackSelectContent(contentType: string, itemId: string, itemName?: string) {
  safeGtag('event', 'select_content', {
    content_type: sanitizeText(contentType),
    item_id: sanitizeText(itemId),
    ...(itemName ? { item_name: sanitizeText(itemName) } : {}),
    ...(GA_DEBUG_MODE ? { debug_mode: true } : {}),
  });
}

/**
 * Audio / recitation engagement event (maps to GA4 media engagement).
 */
export function trackAudioEvent(
  action: 'play' | 'pause' | 'complete',
  details?: {
    surahNumber?: number;
    ayahNumber?: number;
    reciterSlug?: string;
    trackKind?: string;
  },
) {
  safeGtag('event', `audio_${action}`, {
    surah_number: details?.surahNumber,
    ayah_number: details?.ayahNumber,
    reciter: details?.reciterSlug ? sanitizeText(details.reciterSlug) : undefined,
    track_kind: details?.trackKind ? sanitizeText(details.trackKind) : undefined,
    ...(GA_DEBUG_MODE ? { debug_mode: true } : {}),
  });
}

/**
 * GA4 Standard Event: begin_checkout
 */
export function trackBeginCheckout(params: { value?: number; currency?: string }) {
  safeGtag('event', 'begin_checkout', {
    value: params.value ?? 0,
    currency: params.currency || 'USD',
    ...(GA_DEBUG_MODE ? { debug_mode: true } : {}),
  });
}

/**
 * GA4 Standard Event: purchase (e.g. donation completed)
 */
export function trackPurchase(params: {
  transactionId: string;
  value: number;
  currency?: string;
}) {
  safeGtag('event', 'purchase', {
    transaction_id: sanitizeText(params.transactionId),
    value: params.value,
    currency: params.currency || 'USD',
    ...(GA_DEBUG_MODE ? { debug_mode: true } : {}),
  });
}

/**
 * Track form interactions (privacy-safe, never records sensitive fields).
 */
export function trackFormSubmit(formName: string, success = true) {
  safeGtag('event', 'form_submit', {
    form_name: sanitizeText(formName),
    form_status: success ? 'success' : 'error',
    ...(GA_DEBUG_MODE ? { debug_mode: true } : {}),
  });
}

/**
 * GA4 Standard Event: share
 */
export function trackShare(contentType: string, itemId: string, method?: string) {
  safeGtag('event', 'share', {
    content_type: sanitizeText(contentType),
    item_id: sanitizeText(itemId),
    ...(method ? { method: sanitizeText(method) } : {}),
    ...(GA_DEBUG_MODE ? { debug_mode: true } : {}),
  });
}

/**
 * Outbound link click tracking.
 */
export function trackOutboundClick(url: string, label?: string) {
  safeGtag('event', 'click', {
    link_url: sanitizeUrl(url),
    link_domain: getHostname(url),
    outbound: true,
    ...(label ? { link_text: sanitizeText(label) } : {}),
    ...(GA_DEBUG_MODE ? { debug_mode: true } : {}),
  });
}

function getHostname(urlStr: string): string {
  try {
    return new URL(urlStr).hostname;
  } catch {
    return '';
  }
}

/**
 * Google Consent Mode v2 Updater.
 */
export function updateAnalyticsConsent(consent: { analytics: boolean; marketing?: boolean }) {
  safeGtag('consent', 'update', {
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    ad_storage: consent.marketing ? 'granted' : 'denied',
    ad_user_data: consent.marketing ? 'granted' : 'denied',
    ad_personalization: consent.marketing ? 'granted' : 'denied',
  });
}
