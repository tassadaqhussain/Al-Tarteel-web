'use client';

import { useCallback } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { t, type MessageKey, isRtlLocale } from '@/lib/i18n/messages';

export function useT() {
  const locale = useSettingsStore((s) => s.uiLocale);
  const translate = useCallback((key: MessageKey) => t(locale, key), [locale]);
  return {
    t: translate,
    locale,
    isRtl: isRtlLocale(locale),
  };
}
