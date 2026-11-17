'use client';

import { useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useSettingsStore, type UiLocale } from '@/stores/settingsStore';
import { isPrefixedLocale } from '@/lib/i18n/content-locales';
import { t, type MessageKey, isRtlLocale } from '@/lib/i18n/messages';

export function useT() {
  const pathname = usePathname() || '';
  const storedLocale = useSettingsStore((s) => s.uiLocale);
  const segment = pathname.split('/').filter(Boolean)[0];
  const locale: UiLocale =
    segment && isPrefixedLocale(segment) ? (segment as UiLocale) : storedLocale;
  const translate = useCallback((key: MessageKey) => t(locale, key), [locale]);
  return {
    t: translate,
    locale,
    isRtl: isRtlLocale(locale),
  };
}
