'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSettingsStore } from '@/stores/settingsStore';
import { setTranslationCookie } from '@/lib/translation-preference';

/**
 * Migrates legacy ?trans=… query params into cookie + settings,
 * then replaces the URL with a clean pathname (keeps ?page= if needed).
 * Also ensures cookie stays in sync with persisted settings.
 */
export function CleanTranslationUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const translationSlugs = useSettingsStore((s) => s.translationSlugs);
  const setTranslationSlugs = useSettingsStore((s) => s.setTranslationSlugs);

  useEffect(() => {
    const trans = searchParams.get('trans');
    if (!trans) {
      if (translationSlugs.length) setTranslationCookie(translationSlugs);
      return;
    }

    const slugs = trans.split(',').map((s) => s.trim()).filter(Boolean);
    if (slugs.length) {
      setTranslationSlugs(slugs);
      setTranslationCookie(slugs);
    }

    const next = new URLSearchParams(searchParams.toString());
    next.delete('trans');
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams, setTranslationSlugs, translationSlugs]);

  return null;
}
