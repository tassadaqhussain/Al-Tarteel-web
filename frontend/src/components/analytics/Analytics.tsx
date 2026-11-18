'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import {
  applySiteAnalyticsConfig,
  GA_DEBUG_MODE,
  getAnalyticsProvider,
  getAnalyticsRuntime,
  getGaMeasurementId,
  getPlausibleDomain,
  getPlausibleScriptSrc,
  getUmamiScriptSrc,
  getUmamiWebsiteId,
  IS_PRODUCTION,
  isAnalyticsEnabled,
  trackOutboundClick,
  trackPageView,
} from '@/lib/analytics';
import { adminApi, apiBase, type PublicSiteSettings } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const qs = searchParams?.toString();
    const fullPath = qs ? `${pathname}?${qs}` : pathname;

    if (lastTrackedPath.current === fullPath) return;
    lastTrackedPath.current = fullPath;

    const timer = setTimeout(() => {
      trackPageView(fullPath);
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return null;
}

function OutboundClickListener() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest('a');
      if (!target || !target.href) return;

      try {
        const url = new URL(target.href);
        const currentHost = window.location.hostname;
        if (url.hostname && url.hostname !== currentHost) {
          trackOutboundClick(
            target.href,
            target.textContent?.trim() || target.getAttribute('aria-label') || undefined,
          );
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

async function loadPublicSiteConfig(): Promise<PublicSiteSettings | null> {
  try {
    const res = await fetch(`${apiBase()}/site/config`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicSiteSettings;
  } catch {
    return null;
  }
}

export function Analytics() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [adminCheckState, setAdminCheckState] = useState<'idle' | 'checking' | 'admin' | 'user'>(
    'idle',
  );
  const [configReady, setConfigReady] = useState(false);
  const [configTick, setConfigTick] = useState(0);
  const isAdminPath = pathname === '/admin' || pathname?.startsWith('/admin/');

  useEffect(() => {
    let cancelled = false;
    loadPublicSiteConfig().then((cfg) => {
      if (cancelled) return;
      if (cfg) applySiteAnalyticsConfig(cfg);
      setConfigReady(true);
      setConfigTick((n) => n + 1);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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

  // Touch runtime after configTick so Script branches re-render with live IDs.
  void configTick;
  const runtime = getAnalyticsRuntime();
  const provider = getAnalyticsProvider();
  const gaId = getGaMeasurementId();
  const plausibleDomain = getPlausibleDomain();
  const plausibleScript = getPlausibleScriptSrc();
  const umamiId = getUmamiWebsiteId();
  const umamiScript = getUmamiScriptSrc();
  const enabled = isAnalyticsEnabled();

  const shouldLoad =
    configReady &&
    IS_PRODUCTION &&
    enabled &&
    !isAdminPath &&
    adminCheckState !== 'admin' &&
    !(isAuthenticated && adminCheckState === 'checking');

  useEffect(() => {
    if (!IS_PRODUCTION && configReady) {
      console.info(
        `[Analytics] provider=${enabled && !isAdminPath ? `${provider} (dev-skipped)` : 'disabled'} source-ready`,
        runtime,
      );
    }
  }, [isAdminPath, configReady, enabled, provider, runtime]);

  if (!shouldLoad) return null;

  return (
    <>
      {provider === 'plausible' && plausibleDomain ? (
        <Script
          defer
          data-domain={plausibleDomain}
          src={plausibleScript}
          strategy="afterInteractive"
        />
      ) : null}

      {provider === 'umami' && umamiId ? (
        <Script
          defer
          src={umamiScript}
          data-website-id={umamiId}
          data-auto-track="false"
          strategy="afterInteractive"
        />
      ) : null}

      {provider === 'ga4' && gaId ? (
        <>
          <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
          <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

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

          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />

          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
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
