'use client';

import { Loader2, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useSettingsStore, type UiLocale } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';
import { quranApi } from '@/lib/api';
import { getSurahNumberFromSlug } from '@/lib/surah-meta';
import { setTranslationCookie } from '@/lib/translation-preference';

export const LANGUAGES: { code: UiLocale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'fa', label: 'فارسی' },
  { code: 'fr', label: 'Français' },
  { code: 'id', label: 'Indonesia' },
  { code: 'it', label: 'Italiano' },
  { code: 'nl', label: 'Dutch' },
  { code: 'ps', label: 'پښتو' },
  { code: 'pt', label: 'Português' },
  { code: 'ru', label: 'русский' },
  { code: 'sq', label: 'Shqip' },
  { code: 'th', label: 'ภาษาไทย' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'ur', label: 'اردو' },
  { code: 'zh', label: '简体中文' },
  { code: 'ms', label: 'Melayu' },
  { code: 'es', label: 'Español' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'vi', label: 'Tiếng Việt' },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LanguagePanel({ open, onOpenChange }: Props) {
  const pathname = usePathname();
  const uiLocale = useSettingsStore((s) => s.uiLocale);
  const setUiLocale = useSettingsStore((s) => s.setUiLocale);
  const setTranslationSlugs = useSettingsStore((s) => s.setTranslationSlugs);
  const setShowTranslation = useSettingsStore((s) => s.setShowTranslation);
  const [applying, setApplying] = useState<UiLocale | null>(null);

  const applyLanguage = async (locale: UiLocale) => {
    setApplying(locale);
    setUiLocale(locale);
    try {
      const translators = await quranApi.translators(locale);
      const preferred: Partial<Record<UiLocale, string>> = {
        en: 'en-sahih-international',
        ur: 'ur-bayan-ul-quran',
        fa: 'fr-hussein-taji',
        ps: 'ps-zakaria-abulsalam',
      };
      const selected = translators.find((item) => item.slug === preferred[locale]) || translators[0];
      if (selected) {
        setTranslationSlugs([selected.slug]);
        setTranslationCookie([selected.slug]);
        setShowTranslation(true);
      }
      onOpenChange(false);

      const cleanSlug = pathname.split('/').filter(Boolean)[0];
      const isReader = pathname.startsWith('/surah/') || pathname.startsWith('/juz/') || Boolean(cleanSlug && getSurahNumberFromSlug(cleanSlug));
      if (isReader) {
        window.location.assign(pathname);
      }
    } finally {
      setApplying(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-[320px] flex-col gap-0 border-l border-slate-200 bg-white p-0 text-slate-800 [&>button]:hidden sm:max-w-[340px]"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <SheetTitle className="text-base font-bold text-slate-900">Select Language</SheetTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto py-2">
          {LANGUAGES.map((lang) => {
            const active = uiLocale === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => applyLanguage(lang.code)}
                disabled={applying !== null}
                className={cn(
                  'flex w-full items-center px-5 py-3 text-left text-[15px] transition hover:bg-slate-50',
                  active ? 'font-semibold text-[var(--accent)]' : 'text-slate-800'
                )}
              >
                <span>{lang.label}</span>
                {applying === lang.code && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
