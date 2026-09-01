'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/stores/settingsStore';
import { isRtlLocale } from '@/lib/i18n/messages';

export function LocaleSync() {
  const uiLocale = useSettingsStore((s) => s.uiLocale);
  const router = useRouter();

  useEffect(() => {
    document.documentElement.lang = uiLocale;
    document.documentElement.dir = isRtlLocale(uiLocale) ? 'rtl' : 'ltr';
  }, [uiLocale]);

  useEffect(() => {
    const onLocaleChanged = () => {
      router.refresh();
    };
    window.addEventListener('qp:locale-changed', onLocaleChanged);
    return () => window.removeEventListener('qp:locale-changed', onLocaleChanged);
  }, [router]);

  return null;
}
