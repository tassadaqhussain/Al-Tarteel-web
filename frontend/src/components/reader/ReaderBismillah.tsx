'use client';

import type { ContentLocale } from '@/lib/i18n/content-locales';

const BISMILLAH_CAPTION: Record<ContentLocale, string> = {
  en: 'In the Name of Allah—the Most Compassionate, Most Merciful',
  ur: 'شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے',
  ps: 'د لوراند او لورین الله په نامه',
  fa: 'به نام خداوند بخشنده مهربان',
};

/**
 * Chapter Bismillah — rendered with the U+FDFD calligraphic ligature so the
 * marks never collide with the caption (matches the Quran.com chapter header).
 */
export function ReaderBismillah({ locale = 'en' }: { locale?: ContentLocale }) {
  return (
    <div className="mt-2.5 mb-5 flex flex-col items-center justify-center text-center">
      {/* The U+FDFD ligature overshoots its line box, so pad rather than lead it. */}
      <span
        aria-hidden
        translate="no"
        style={{ lineHeight: 1, paddingTop: '0.15em', paddingBottom: '0.72em' }}
        className="font-arabic block max-w-full select-none text-[22px] text-ink min-[420px]:text-[26px] sm:text-[36px]"
      >
        ﷽
      </span>
      <span className="sr-only" lang="ar">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span>
      <p className="mt-[5px] font-sans text-sm text-ink-3">
        {BISMILLAH_CAPTION[locale] ?? BISMILLAH_CAPTION.en}
      </p>
    </div>
  );
}
