'use client';

import { useRouter } from 'next/navigation';
import { Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEFAULT_CONTENT_LOCALE, type ContentLocale } from '@/lib/i18n/content-locales';
import { reportMistakeLabel } from '@/lib/i18n/surah-ui-strings';

interface Props {
  surahNumber: number;
  ayahNumber?: number;
  locale?: ContentLocale;
  className?: string;
}

/**
 * Client-side navigation button to `/contact?type=mistake&ref=...`.
 * Rendered as a `<button>` rather than `<a href>` so crawlers do not waste
 * crawl budget on parameterized contact URLs across 6,000+ pages.
 */
export function ReportMistakeButton({
  surahNumber,
  ayahNumber,
  locale = DEFAULT_CONTENT_LOCALE,
  className,
}: Props) {
  const router = useRouter();
  const ref = ayahNumber ? `${surahNumber}:${ayahNumber}` : String(surahNumber);

  return (
    <button
      type="button"
      onClick={() => router.push(`/contact?type=mistake&ref=${encodeURIComponent(ref)}`)}
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted transition hover:text-[var(--accent)]',
        className,
      )}
    >
      <Flag className="h-3.5 w-3.5" aria-hidden />
      {reportMistakeLabel(locale)}
    </button>
  );
}
