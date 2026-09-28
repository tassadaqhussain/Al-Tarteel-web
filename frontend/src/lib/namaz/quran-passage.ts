'use client';

import { audioApi, quranApi, type AyahWithRelations } from '@/lib/api';
import { unavailableReciterReason } from '@/lib/audio/availability';
import { PREFERRED_TRANSLATION } from '@/lib/i18n/preferred-translations';
import { DEFAULT_TRANSLATION } from '@/lib/translation-preference';
import type { UiLocale } from '@/stores/settingsStore';

/**
 * Loads Quran passages for the lesson from QuranPilot's verified Quran API:
 * Uthmani text, Quran.com word transliteration, the learner's translation
 * and the learner's reciter. Nothing here is typed in by hand.
 */

export type LoadedAyah = {
  number: number;
  arabic: string;
  transliteration: string | null;
  translation: string | null;
  audioUrl: string | null;
};

export type LoadedPassage = {
  surah: number;
  surahName: string | null;
  ayahs: LoadedAyah[];
  translatorName: string | null;
  /** True when no translation exists for the learner's language and English is shown. */
  translationIsFallback: boolean;
  reciterName: string | null;
};

const cache = new Map<string, Promise<LoadedPassage>>();

function stripMarkup(text: string): string {
  return text.replace(/<sup[^>]*>.*?<\/sup>/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function wordTransliteration(ayah: AyahWithRelations): string | null {
  const words = (ayah.words ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((w) => w.transliteration?.trim())
    .filter((w): w is string => Boolean(w));
  return words.length ? words.join(' ') : null;
}

async function fetchAyahs(surah: number, from: number, to: number, translation: string) {
  if (from === to) {
    const one = await quranApi.ayah(surah, from, { translations: translation, words: true });
    return [one];
  }
  const list = await quranApi.ayahsBySurah(surah, { limit: to, translations: translation, words: true });
  return list.filter((a) => a.number >= from && a.number <= to);
}

async function resolveReciter(preferred: string | null) {
  const reciters = await audioApi.reciters();
  const usable = reciters.filter((r) => r.kind !== 'translation' && !unavailableReciterReason(r.slug));
  return (
    usable.find((r) => r.slug === preferred) ??
    usable.find((r) => r.isDefault) ??
    usable[0] ??
    null
  );
}

async function load(
  surah: number,
  from: number,
  to: number,
  locale: UiLocale,
  preferredReciter: string | null,
): Promise<LoadedPassage> {
  const translation = PREFERRED_TRANSLATION[locale] ?? DEFAULT_TRANSLATION;
  let ayahs = await fetchAyahs(surah, from, to, translation);
  if (ayahs.length !== to - from + 1 || ayahs.some((a) => !a.textUthmani)) {
    throw new Error('Incomplete Quran passage');
  }

  let translationIsFallback = false;
  const hasTranslation = ayahs.every((a) => a.translations?.some((t) => t.text));
  if (!hasTranslation && translation !== DEFAULT_TRANSLATION) {
    const english = await fetchAyahs(surah, from, to, DEFAULT_TRANSLATION).catch(() => null);
    if (english) {
      const byNumber = new Map(english.map((a) => [a.number, a.translations]));
      ayahs = ayahs.map((a) => ({ ...a, translations: byNumber.get(a.number) ?? a.translations }));
      translationIsFallback = true;
    }
  }

  const reciter = await resolveReciter(preferredReciter).catch(() => null);
  const audio = reciter ? await audioApi.surah(surah, reciter.slug).catch(() => []) : [];
  const audioByAyah = new Map(audio.map((item) => [item.ayahNumber, item.url ?? null]));

  const first = ayahs[0]?.translations?.find((t) => t.text);
  return {
    surah,
    surahName: ayahs[0]?.surah?.nameSimple ?? null,
    translatorName: first?.translatorName ?? first?.translatorSlug ?? null,
    translationIsFallback,
    reciterName: reciter?.name ?? null,
    ayahs: ayahs
      .slice()
      .sort((a, b) => a.number - b.number)
      .map((a) => {
        const text = a.translations?.find((t) => t.text)?.text;
        return {
          number: a.number,
          arabic: a.textUthmani,
          transliteration: wordTransliteration(a),
          translation: text ? stripMarkup(text) : null,
          audioUrl: audioByAyah.get(a.number) ?? null,
        };
      }),
  };
}

export function loadQuranPassage(
  surah: number,
  from: number,
  to: number,
  locale: UiLocale,
  preferredReciter: string | null,
): Promise<LoadedPassage> {
  const key = `${surah}:${from}-${to}:${locale}:${preferredReciter ?? ''}`;
  let pending = cache.get(key);
  if (!pending) {
    pending = load(surah, from, to, locale, preferredReciter);
    // Let a failed load be retried (e.g. after reconnecting).
    pending.catch(() => cache.delete(key));
    cache.set(key, pending);
  }
  return pending;
}
