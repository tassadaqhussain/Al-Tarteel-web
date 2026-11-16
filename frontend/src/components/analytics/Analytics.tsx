'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import {
  ANALYTICS_PROVIDER,
  analyticsEnabled,
  GA_DEBUG_MODE,
  GA_MEASUREMENT_ID,
  IS_PRODUCTION,
  PLAUSIBLE_DOMAIN,
  PLAUSIBLE_SCRIPT_SRC,
  UMAMI_SCRIPT_SRC,
  UMAMI_WEBSITE_ID,
  trackOutboundClick,
  trackPageView,
} from '@/lib/analytics';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const qs = searchParams?.toString();
    const fullPath = qs ? `${pathname}?${qs}` : pathname;

    // Prevent duplicate page_view events for the identical URL
    if (lastTrackedPath.current === fullPath) return;
    lastTrackedPath.current = fullPath;

    // Small delay allows Next.js to update document.title
    const timer = setTimeout(() => {
      trackPageView(fullPath);
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return null;
}

/**
 * Delegated outbound link click listener for automatic GA4 outbound tracking.
 */
function OutboundClickListener() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest('a');
      if (!target || !target.href) return;

      try {
        const url = new URL(target.href);
        const currentHost = window.location.hostname;
        if (url.hostname && url.hostname !== currentHost) {
          trackOutboundClick(target.href, target.textContent?.trim() || target.getAttribute('aria-label') || undefined);
        }
      } catch {
        /* ignore invalid URLs */
      }
    };

    document.addEventListener('click', handleClick, { passive: true });
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}

export function Analytics() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [adminCheckState, setAdminCheckState] = useState<'idle' | 'checking' | 'admin' | 'user'>('idle');
  const isAdminPath = pathname === '/admin' || pathname?.startsWith('/admin/');

  useEffect(() => {
    if (!isAuthenticated) {
      setAdminCheckState('user');
      return;
    }
    let cancelled = false;
    setAdminCheckState('checking');
    adminApi
      .me()
      .then((res) => {
        if (!cancelled) setAdminCheckState(res.isAdmin ? 'admin' : 'user');
      })
      .catch(() => {
        if (!cancelled) setAdminCheckState('user');
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const shouldLoad =
    IS_PRODUCTION &&
    analyticsEnabled &&
    !isAdminPath &&
    adminCheckState !== 'admin' &&
    !(isAuthenticated && adminCheckState === 'checking');

  useEffect(() => {
    if (!IS_PRODUCTION) {
      console.info(
        `[Analytics] provider=${analyticsEnabled && !isAdminPath ? `${ANALYTICS_PROVIDER} (dev-skipped)` : 'disabled'}`,
      );
    }
  }, [isAdminPath]);

  if (!shouldLoad) return null;

  return (
    <>
      {ANALYTICS_PROVIDER === 'plausible' && PLAUSIBLE_DOMAIN ? (
        <Script
          defer
          data-domain={PLAUSIBLE_DOMAIN}
          src={PLAUSIBLE_SCRIPT_SRC}
          strategy="afterInteractive"
        />
      ) : null}

      {ANALYTICS_PROVIDER === 'umami' && UMAMI_WEBSITE_ID ? (
        <Script
          defer
          src={UMAMI_SCRIPT_SRC}
          data-website-id={UMAMI_WEBSITE_ID}
          data-auto-track="false"
          strategy="afterInteractive"
        />
      ) : null}

      {ANALYTICS_PROVIDER === 'ga4' && GA_MEASUREMENT_ID ? (
        <>
          {/* Preconnect to Google Tag Manager for faster resource retrieval */}
          <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
          <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

          {/* Consent Mode v2 Default Configuration before Tag Loader */}
          <Script id="ga4-consent-default" strategy="beforeInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'analytics_storage': 'granted',
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'wait_for_update': 500
              });
            `}
          </Script>

          {/* GA4 Core Script */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />

          {/* Initialize with send_page_view: false to prevent duplicate initial page_views */}
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                send_page_view: false,
                debug_mode: ${GA_DEBUG_MODE ? 'true' : 'false'},
                anonymize_ip: true,
                cookie_flags: 'SameSite=None;Secure'
              });
            `}
          </Script>
        </>
      ) : null}

      <Suspense fallback={null}>
        <RouteChangeTracker />
      </Suspense>
      <OutboundClickListener />
    </>
  );
}
