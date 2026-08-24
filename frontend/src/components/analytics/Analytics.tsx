'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import {
  analyticsEnabled,
  GA_MEASUREMENT_ID,
  PLAUSIBLE_DOMAIN,
  PLAUSIBLE_SCRIPT_SRC,
  trackPageView,
} from '@/lib/analytics';

function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams?.toString();
    const path = qs ? `${pathname}?${qs}` : pathname;
    trackPageView(path);
  }, [pathname, searchParams]);

  return null;
}

export function Analytics() {
  if (!analyticsEnabled) return null;

  return (
    <>
      {PLAUSIBLE_DOMAIN ? (
        <Script
          defer
          data-domain={PLAUSIBLE_DOMAIN}
          src={PLAUSIBLE_SCRIPT_SRC}
          strategy="afterInteractive"
        />
      ) : null}

      {GA_MEASUREMENT_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: true });
            `}
          </Script>
        </>
      ) : null}

      <Suspense fallback={null}>
        <RouteChangeTracker />
      </Suspense>
    </>
  );
}
