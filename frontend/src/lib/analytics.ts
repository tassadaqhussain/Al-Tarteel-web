/**
 * Google Analytics 4 & Privacy-Conscious Analytics Integration.
 *
 * Adheres to:
 * - Google Search Central & Google Tag / GA4 best practices
 * - Consent Mode v2 (EEA/UK compliant)
 * - Strict PII sanitization (passwords, tokens, emails never sent to GA4)
 * - Safe error handling (never crashes client runtime)
 */

export type AnalyticsProvider = 'ga4' | 'plausible' | 'umami';

type RuntimeAnalyticsConfig = {
  analyticsProvider: AnalyticsProvider | '';
  gaMeasurementId: string;
  plausibleDomain: string;
  plausibleScriptSrc: string;
  umamiWebsiteId: string;
  umamiScriptSrc: string;
};

function providerFromEnv(): AnalyticsProvider | '' {
  const raw = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER?.trim().toLowerCase() || '';
  if (raw === 'none' || raw === 'disabled' || raw === 'false') return '';
  if (raw === 'ga4' || raw === 'plausible' || raw === 'umami') return raw;
  return '';
}

const ENV_GA =
  process.env.NEXT_PUBLIC_GA_ID?.trim() ||
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ||
  '';
const ENV_PLAUSIBLE = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim() || '';
const ENV_UMAMI = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim() || '';

function resolveProvider(
  explicit: AnalyticsProvider | '',
  ga: string,
  plausible: string,
  umami: string,
): AnalyticsProvider | '' {
  if (explicit) return explicit;
  if (ga) return 'ga4';
  if (plausible) return 'plausible';
  if (umami) return 'umami';
  return '';
}

/** Env fallback; overridden at runtime by Admin → Site (`applySiteAnalyticsConfig`). */
let runtime: RuntimeAnalyticsConfig = {
  analyticsProvider: resolveProvider(providerFromEnv(), ENV_GA, ENV_PLAUSIBLE, ENV_UMAMI),
  gaMeasurementId: ENV_GA,
  plausibleDomain: ENV_PLAUSIBLE,
  plausibleScriptSrc:
    process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC?.trim() || 'https://plausible.io/js/script.js',
  umamiWebsiteId: ENV_UMAMI,
  umamiScriptSrc: process.env.NEXT_PUBLIC_UMAMI_SRC?.trim() || 'https://cloud.umami.is/script.js',
};

/** Apply public `/site/config` values (DB admin settings, else env on API). */
export function applySiteAnalyticsConfig(cfg: {
  analyticsProvider?: string | null;
  gaMeasurementId?: string | null;
  plausibleDomain?: string | null;
  plausibleScriptSrc?: string | null;
  umamiWebsiteId?: string | null;
  umamiScriptSrc?: string | null;
}) {
  const ga = (cfg.gaMeasurementId || '').trim() || ENV_GA;
  const plausible = (cfg.plausibleDomain || '').trim() || ENV_PLAUSIBLE;
  const umami = (cfg.umamiWebsiteId || '').trim() || ENV_UMAMI;
  const raw = (cfg.analyticsProvider || '').trim().toLowerCase();
  const explicit: AnalyticsProvider | '' =
    raw === 'ga4' || raw === 'plausible' || raw === 'umami' ? raw : '';
  // When API sends analyticsProvider (including ''), honor it — do not re-infer from IDs.
  const provider =
    cfg.analyticsProvider !== undefined && cfg.analyticsProvider !== null
      ? explicit
      : resolveProvider('', ga, plausible, umami);
  runtime = {
    analyticsProvider: provider,
    gaMeasurementId: ga,
    plausibleDomain: plausible,
    plausibleScriptSrc:
      (cfg.plausibleScriptSrc || '').trim() ||
      process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC?.trim() ||
      'https://plausible.io/js/script.js',
    umamiWebsiteId: umami,
    umamiScriptSrc:
      (cfg.umamiScriptSrc || '').trim() ||
      process.env.NEXT_PUBLIC_UMAMI_SRC?.trim() ||
      'https://cloud.umami.is/script.js',
  };
}

export function getAnalyticsRuntime(): Readonly<RuntimeAnalyticsConfig> {
  return runtime;
}

/** Live getters — prefer these over snapshot exports after runtime apply. */
export function getAnalyticsProvider(): AnalyticsProvider | '' {
  return runtime.analyticsProvider;
}
export function getGaMeasurementId(): string {
  return runtime.gaMeasurementId;
}
export function getPlausibleDomain(): string {
  return runtime.plausibleDomain;
}
export function getPlausibleScriptSrc(): string {
  return runtime.plausibleScriptSrc;
}
export function getUmamiWebsiteId(): string {
  return runtime.umamiWebsiteId;
}
export function getUmamiScriptSrc(): string {
  return runtime.umamiScriptSrc;
}

/** Env-time snapshot (build/SSR). Client scripts should use getters after apply. */
export const PLAUSIBLE_DOMAIN = runtime.plausibleDomain;
export const GA_MEASUREMENT_ID = runtime.gaMeasurementId;
export const UMAMI_WEBSITE_ID = runtime.umamiWebsiteId;
export const UMAMI_SCRIPT_SRC = runtime.umamiScriptSrc;
export const ANALYTICS_PROVIDER: AnalyticsProvider | '' = runtime.analyticsProvider;
export const PLAUSIBLE_SCRIPT_SRC = runtime.plausibleScriptSrc;

export const analyticsEnabled =
  (ANALYTICS_PROVIDER === 'ga4' && Boolean(GA_MEASUREMENT_ID)) ||
  (ANALYTICS_PROVIDER === 'plausible' && Boolean(PLAUSIBLE_DOMAIN)) ||
  (ANALYTICS_PROVIDER === 'umami' && Boolean(UMAMI_WEBSITE_ID));

export function isAnalyticsEnabled(): boolean {
  return (
    (runtime.analyticsProvider === 'ga4' && Boolean(runtime.gaMeasurementId)) ||
    (runtime.analyticsProvider === 'plausible' && Boolean(runtime.plausibleDomain)) ||
    (runtime.analyticsProvider === 'umami' && Boolean(runtime.umamiWebsiteId))
  );
}

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const GA_DEBUG_MODE =
  !IS_PRODUCTION || process.env.NEXT_PUBLIC_GA_DEBUG === 'true';

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number | boolean> },
    ) => void;
    umami?: {
      track: (payload?: unknown) => void;
    };
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

  const provider = getAnalyticsProvider();

  if (provider === 'plausible' && getPlausibleDomain() && window.plausible) {
    try {
      window.plausible('pageview', { props: { path: cleanPath } });
    } catch {
      /* ignore */
    }
  }

  if (provider === 'umami' && getUmamiWebsiteId() && window.umami) {
    try {
      window.umami.track((props: Record<string, unknown>) => ({
        ...props,
        url: cleanPath,
        title: pageTitle,
      }));
    } catch {
      /* ignore */
    }
  }

  if (provider === 'ga4' && getGaMeasurementId() && window.gtag) {
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

  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || '/api/v1').replace(/\/$/, '');
      void fetch(`${apiBase}/analytics/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: cleanQuery,
          ...(typeof resultsCount === 'number' ? { resultsCount } : {}),
          source: searchType,
        }),
        keepalive: true,
        credentials: 'omit',
      }).catch(() => {});
    } catch {
      /* ignore */
    }
  }
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
 * Conversion Event: start_plan
 */
export function trackStartPlan(planSlug: string, planTitle?: string) {
  safeGtag('event', 'start_plan', {
    plan_slug: sanitizeText(planSlug),
    ...(planTitle ? { plan_title: sanitizeText(planTitle) } : {}),
    ...(GA_DEBUG_MODE ? { debug_mode: true } : {}),
  });
}

/**
 * Conversion Event: newsletter_subscribe
 */
export function trackNewsletterSubscribe(source: string) {
  safeGtag('event', 'newsletter_subscribe', {
    source: sanitizeText(source),
    ...(GA_DEBUG_MODE ? { debug_mode: true } : {}),
  });
}

/**
 * Conversion Event: ask_ai_open
 */
export function trackAskAiOpen(source = 'fab') {
  safeGtag('event', 'ask_ai_open', {
    source: sanitizeText(source),
    ...(GA_DEBUG_MODE ? { debug_mode: true } : {}),
  });
}

/**
 * Conversion Event: continue_reading_click
 */
export function trackContinueReadingClick(surahNumber?: number, ayahNumber?: number) {
  safeGtag('event', 'continue_reading_click', {
    ...(typeof surahNumber === 'number' ? { surah_number: surahNumber } : {}),
    ...(typeof ayahNumber === 'number' ? { ayah_number: ayahNumber } : {}),
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
