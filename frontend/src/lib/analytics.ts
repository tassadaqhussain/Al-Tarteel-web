/** Analytics IDs from build-time env (NEXT_PUBLIC_*). */

export const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim() || '';
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || 'G-X74S7JHWCL';

export const analyticsEnabled = Boolean(PLAUSIBLE_DOMAIN || GA_MEASUREMENT_ID);

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

export function trackPageView(path: string) {
  if (typeof window === 'undefined') return;

  if (PLAUSIBLE_DOMAIN && window.plausible) {
    window.plausible('pageview', { props: { path } });
  }

  if (GA_MEASUREMENT_ID && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
}
