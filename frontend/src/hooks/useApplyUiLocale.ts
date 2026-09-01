'use client';

import { useCallback, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSettingsStore, WORD_BY_WORD_LOCALES, type UiLocale } from '@/stores/settingsStore';
import { setTranslationCookie } from '@/lib/translation-preference';
import { isReaderPath, pathForUiLocale } from '@/lib/i18n/locale-routing';
import {
  fetchTranslatorsForLocale,
  pickTranslatorForLocale,
} from '@/lib/i18n/preferred-translations';

export function useApplyUiLocale() {
  const pathname = usePathname();
  const setUiLocale = useSettingsStore((s) => s.setUiLocale);
  const setTranslationSlugs = useSettingsStore((s) => s.setTranslationSlugs);
  const setShowTranslation = useSettingsStore((s) => s.setShowTranslation);
  const setWordByWordLocale = useSettingsStore((s) => s.setWordByWordLocale);
  const [applying, setApplying] = useState<UiLocale | null>(null);

  const applyUiLocale = useCallback(
    async (locale: UiLocale) => {
      setApplying(locale);
      setUiLocale(locale);

      if (WORD_BY_WORD_LOCALES.some((item) => item.code === locale)) {
        setWordByWordLocale(locale);
      }

      try {
        const translators = await fetchTranslatorsForLocale(locale);
        const selected = pickTranslatorForLocale(translators, locale);
        if (selected) {
          setTranslationSlugs([selected.slug]);
          setTranslationCookie([selected.slug]);
          setShowTranslation(true);
        }
      } catch {} finally {
        setApplying(null);
      }

      const nextPath = pathForUiLocale(pathname, locale);
      if (nextPath !== pathname || isReaderPath(pathname)) {
        window.location.assign(nextPath);
        return;
      }
      window.dispatchEvent(new Event('qp:locale-changed'));
    },
    [pathname, setShowTranslation, setTranslationSlugs, setUiLocale, setWordByWordLocale],
  );

  return { applyUiLocale, applying };
}
