'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, X } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  isPrefixedLocale,
  localeConfig,
  type PrefixedLocale,
} from '@/lib/i18n/content-locales';
import { pathForUiLocale } from '@/lib/i18n/locale-routing';

const DISMISS_KEY = 'qp-locale-banner-dismissed';

const BANNER_COPY: Record<PrefixedLocale, { prompt: string; cta: string }> = {
  ur: {
    prompt: 'کیا آپ یہ صفحہ اردو میں پڑھنا چاہتے ہیں؟',
    cta: 'اردو میں کھولیں',
  },
  ps: {
    prompt: 'ایا غواړئ دا پاڼه په پښتو کې ولولئ؟',
    cta: 'په پښتو کې پرانیزئ',
  },
  fa: {
    prompt: 'آیا می‌خواهید این صفحه را به فارسی بخوانید؟',
    cta: 'مشاهده به فارسی',
  },
};

function detectBrowserPrefixedLocale(): PrefixedLocale | null {
  if (typeof navigator === 'undefined') return null;
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const raw of langs) {
    const code = (raw || '').toLowerCase().split('-')[0];
    if (isPrefixedLocale(code)) return code;
  }
  return null;
}

/**
 * Non-intrusive, dismissible banner suggesting a localized URL (/ur, /ps, /fa)
 * when a visitor on an English canonical route has a stored or browser preference
 * for one of our published localized trees. Never auto-redirects and never swaps
 * the canonical URL's content.
 */
export function LocaleSuggestionBanner() {
  const pathname = usePathname() || '/';
  const storedUiLocale = useSettingsStore((s) => s.uiLocale);
  const [suggested, setSuggested] = useState<PrefixedLocale | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const firstSeg = pathname.split('/').filter(Boolean)[0];
    if (firstSeg && isPrefixedLocale(firstSeg)) {
      setDismissed(true);
      return;
    }

    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') {
        setDismissed(true);
        return;
      }
    } catch {
      // sessionStorage unavailable
    }

    const candidate: PrefixedLocale | null = isPrefixedLocale(storedUiLocale)
      ? storedUiLocale
      : detectBrowserPrefixedLocale();

    if (!candidate) {
      setDismissed(true);
      return;
    }

    const target = pathForUiLocale(pathname, candidate);
    if (target === pathname) {
      setDismissed(true);
      return;
    }

    setSuggested(candidate);
    setDismissed(false);
  }, [pathname, storedUiLocale]);

  if (dismissed || !suggested) return null;

  const targetHref = pathForUiLocale(pathname, suggested);
  const copy = BANNER_COPY[suggested];
  const cfg = localeConfig(suggested);

  return (
    <div
      role="region"
      aria-label={`Switch to ${cfg.englishName}`}
      className="border-b border-line bg-surface-2 px-4 py-2 text-xs text-ink-2 sm:text-sm"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Globe className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
          <span dir={cfg.dir} lang={cfg.hreflang}>
            {copy.prompt}
          </span>
          <Link
            href={targetHref}
            dir={cfg.dir}
            lang={cfg.hreflang}
            className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
          >
            {copy.cta}
          </Link>
        </div>
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            try {
              sessionStorage.setItem(DISMISS_KEY, '1');
            } catch {
              // ignore
            }
          }}
          aria-label="Dismiss language suggestion"
          className="rounded-full p-1 text-ink-muted transition hover:bg-surface-3 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
