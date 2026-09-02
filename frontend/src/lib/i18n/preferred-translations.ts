import type { UiLocale } from '@/stores/settingsStore';
import type { Translator } from '@/lib/api';
import { DEFAULT_TRANSLATION } from '@/lib/translation-preference';
import { LOCALE_TEXT_TRANSLATION_SLUG } from '@/lib/i18n/locale-translation-slugs';

export const PREFERRED_TRANSLATION: Partial<Record<UiLocale, string>> = {
  en: LOCALE_TEXT_TRANSLATION_SLUG.en,
  ur: LOCALE_TEXT_TRANSLATION_SLUG.ur,
  ps: LOCALE_TEXT_TRANSLATION_SLUG.ps,
  fa: LOCALE_TEXT_TRANSLATION_SLUG.fa,
  ar: 'qf-translation-1014',
  bn: 'bn-mujibur-rahman',
  id: 'id-indonesian-ministry',
  tr: 'tr-diyanet',
  fr: 'fr-hamidullah',
  es: 'es-garcia',
  hi: 'hi-hindi',
  ru: 'ru-kuliev',
  zh: 'zh-chinese',
  ms: 'ms-basmeih',
  pt: 'pt-helmi-nasr',
  nl: 'nl-siregar',
  it: 'it-piccardo',
  th: 'th-thai',
  vi: 'vi-hasan',
  sw: 'sw-barwani',
  sq: 'sq-nahi',
};

export async function fetchTranslatorsForLocale(locale: UiLocale): Promise<Translator[]> {
  const { quranApi } = await import('@/lib/api');
  const primary = await quranApi.translators(locale).catch(() => [] as Translator[]);
  if (primary.length > 0) return primary;
  const all = await quranApi.translators().catch(() => [] as Translator[]);
  return all.filter((item) => item.languageCode === locale);
}

export function pickTranslatorForLocale(
  translators: Translator[],
  locale: UiLocale,
): Translator | undefined {
  if (!translators.length) return undefined;
  const preferredSlug = PREFERRED_TRANSLATION[locale];
  return (
    (preferredSlug ? translators.find((item) => item.slug === preferredSlug) : undefined) ||
    translators.find((item) => item.languageCode === locale) ||
    translators[0]
  );
}

export function defaultTranslationSlugForLocale(locale: UiLocale): string {
  return PREFERRED_TRANSLATION[locale] ?? DEFAULT_TRANSLATION;
}
