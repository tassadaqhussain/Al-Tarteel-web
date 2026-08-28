'use client';

import { Loader2, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useSettingsStore, type UiLocale } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';
import { LANGUAGES } from '@/lib/i18n/languages';
import { useApplyUiLocale } from '@/hooks/useApplyUiLocale';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LanguagePanel({ open, onOpenChange }: Props) {
  const { t } = useT();
  const uiLocale = useSettingsStore((s) => s.uiLocale);
  const { applyUiLocale, applying } = useApplyUiLocale();

  const selectLanguage = async (locale: UiLocale) => {
    await applyUiLocale(locale);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-[320px] flex-col gap-0 border-l border-line bg-surface p-0 text-ink [&>button]:hidden sm:max-w-[340px]"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <SheetTitle className="text-base font-bold text-ink">{t('selectLanguage')}</SheetTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-3 hover:text-ink"
            aria-label={t('close')}
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
                onClick={() => void selectLanguage(lang.code)}
                disabled={applying !== null}
                className={cn(
                  'flex w-full items-center px-5 py-3 text-left text-[15px] transition hover:bg-surface-2',
                  active ? 'font-semibold text-[var(--accent)]' : 'text-ink'
                )}
              >
                <span>{lang.label}</span>
                {applying === lang.code && (
                  <Loader2 className="ml-auto h-4 w-4 animate-spin" aria-label={t('applyingLanguage')} />
                )}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
