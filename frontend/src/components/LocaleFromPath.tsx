'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { isPrefixedLocale } from '@/lib/i18n/content-locales';
import { useSettingsStore, type UiLocale } from '@/stores/settingsStore';
import {
  fetchTranslatorsForLocale,
  pickTranslatorForLocale,
} from '@/lib/i18n/preferred-translations';
import { setTranslationCookie } from '@/lib/translation-preference';

export function LocaleFromPath() {
  const pathname = usePathname();
  const setUiLocale = useSettingsStore((s) => s.setUiLocale);
  const setTranslationSlugs = useSettingsStore((s) => s.setTranslationSlugs);
  const setShowTranslation = useSettingsStore((s) => s.setShowTranslation);
  const synced = useRef<string | null>(null);

  useEffect(() => {
    const segment = pathname.split('/').filter(Boolean)[0];
    if (!segment || !isPrefixedLocale(segment)) return;
    if (synced.current === pathname) return;
    synced.current = pathname;

    const locale = segment as UiLocale;
    setUiLocale(locale);

    void (async () => {
      try {
        const translators = await fetchTranslatorsForLocale(locale);
        const selected = pickTranslatorForLocale(translators, locale);
        if (selected) {
          setTranslationSlugs([selected.slug]);
          setTranslationCookie([selected.slug]);
          setShowTranslation(true);
        }
      } catch {}
    })();
  }, [pathname, setShowTranslation, setTranslationSlugs, setUiLocale]);

  return null;
}
