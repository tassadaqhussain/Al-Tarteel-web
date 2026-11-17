'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSettingsStore } from '@/stores/settingsStore';
import { isPrefixedLocale } from '@/lib/i18n/content-locales';
import { isRtlLocale, type UiLocale } from '@/lib/i18n/messages';

export function LocaleSync() {
  const pathname = usePathname() || '';
  const uiLocale = useSettingsStore((s) => s.uiLocale);
  const router = useRouter();
  const segment = pathname.split('/').filter(Boolean)[0];
  const effectiveLocale: UiLocale =
    segment && isPrefixedLocale(segment) ? (segment as UiLocale) : uiLocale;

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
