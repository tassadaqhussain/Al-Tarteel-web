'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { UiLocale } from '@/stores/settingsStore';
import { isPrefixedLocale } from '@/lib/i18n/content-locales';
import { isRtlLocale } from '@/lib/i18n/messages';

/**
 * Keeps `<html lang>` and `<html dir>` strictly synchronized with the URL prefix
 * (`/ = en`, `/ur`, `/ps`, `/fa`). Never swaps a canonical URL's language based
 * on localStorage, cookies, or browser headers.
 */
export function LocaleSync() {
  const pathname = usePathname() || '';
  const router = useRouter();
  const segment = pathname.split('/').filter(Boolean)[0];
  const effectiveLocale: UiLocale =
    segment && isPrefixedLocale(segment) ? (segment as UiLocale) : 'en';

  useEffect(() => {
    document.documentElement.lang = effectiveLocale;
    document.documentElement.dir = isRtlLocale(effectiveLocale) ? 'rtl' : 'ltr';
  }, [effectiveLocale]);

  useEffect(() => {
    const onLocaleChanged = () => {
      router.refresh();
    };
    window.addEventListener('qp:locale-changed', onLocaleChanged);
    return () => window.removeEventListener('qp:locale-changed', onLocaleChanged);
  }, [router]);

  return null;
}
