import { quranApi } from '@/lib/api';
import { cleanTranslationText } from '@/lib/clean-translation';
import { localeConfig, type ContentLocale } from '@/lib/i18n/content-locales';

/** Cut at a word boundary; never alters wording, only shortens. */
export function truncateAtWord(text: string, max = 120): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).replace(/\s+\S*$/, '').replace(/[\s,;:،؛.\-–—]+$/, '')}…`;
}

/**
 * First ~120 chars of the ayah's translation in the page language, for the meta description.
 * Returns undefined when the API has no translation (callers fall back to the generic template).
 */
export async function fetchAyahSnippet(
  surah: number,
  ayah: number,
  locale: ContentLocale,
): Promise<string | undefined> {
  const slug = localeConfig(locale).translationSlug;
  try {
    const data = await quranApi.ayah(surah, ayah, { translations: slug, words: false });
    const tr =
      data.translations?.find((t) => t.translatorSlug === slug) ?? data.translations?.[0];
    const text = tr?.text ? cleanTranslationText(tr.text) : '';
    return text ? truncateAtWord(text, 120) : undefined;
  } catch {
    return undefined;
  }
}
