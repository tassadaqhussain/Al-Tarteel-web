'use client';

import { useCallback } from 'react';
import { usePathname } from 'next/navigation';
import type { UiLocale } from '@/stores/settingsStore';
import { isPrefixedLocale } from '@/lib/i18n/content-locales';
import { t, type MessageKey, isRtlLocale } from '@/lib/i18n/messages';

/**
 * UI translation hook. Locale is determined strictly by the URL prefix
 * (`/ = en`, `/ur`, `/ps`, `/fa`) so canonical English URLs never swap UI
 * language for returning visitors or crawlers.
 */
export function useT() {
  const pathname = usePathname() || '';
  const segment = pathname.split('/').filter(Boolean)[0];
  const locale: UiLocale =
    segment && isPrefixedLocale(segment) ? (segment as UiLocale) : 'en';
  const translate = useCallback((key: MessageKey) => t(locale, key), [locale]);
  return {
    t: translate,
    locale,
    isRtl: isRtlLocale(locale),
  };
}
