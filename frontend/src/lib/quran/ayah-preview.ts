/**
 * Homepage verse-preview helpers.
 * Sacred text is never invented here — we only accept ayahs that already
 * include Uthmani text from the API / database snapshot.
 */

export const PREVIEW_FETCH_LIMIT = 12;
export const PREVIEW_AYAHS = 5;
export const PREVIEW_SURAH_NUMBER = 1;

/** Copy that must never ship in the homepage HTML. */
export const FORBIDDEN_EMPTY_PREVIEW_COPY =
  'No verses available for this chapter yet.';

export type AyahPreviewUi = 'loading' | 'ready' | 'retry';

export type PreviewAyah = {
  id?: number;
  number: number;
  textUthmani: string;
  translations?: Array<{
    translatorSlug?: string;
    translatorName?: string;
    text: string;
  }>;
};

function unwrapAyahPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    for (const key of ['data', 'ayahs', 'items'] as const) {
      const nested = record[key];
      if (Array.isArray(nested)) return nested;
    }
  }
  return [];
}

function isUsableAyah(row: unknown): row is PreviewAyah {
  if (!row || typeof row !== 'object') return false;
  const ayah = row as Record<string, unknown>;
  return (
    typeof ayah.number === 'number' &&
    Number.isFinite(ayah.number) &&
    ayah.number > 0 &&
    typeof ayah.textUthmani === 'string' &&
    ayah.textUthmani.trim().length > 0
  );
}

/** Drop empty/malformed rows so an empty verse array cannot render as "ready". */
export function normalizeAyahList(payload: unknown): PreviewAyah[] {
  return unwrapAyahPayload(payload).filter(isUsableAyah);
}

export function ayahPreviewUi(input: {
  loading: boolean;
  ayahs: Pick<PreviewAyah, 'textUthmani'>[];
}): AyahPreviewUi {
  if (input.loading) return 'loading';
  if (input.ayahs.length > 0) return 'ready';
  return 'retry';
}

export function translationAttribution(ayahs: PreviewAyah[]): string | null {
  const first = ayahs
    .map((ayah) => ayah.translations?.find((item) => item.text?.trim()) ?? ayah.translations?.[0])
    .find(Boolean);
  const name = first?.translatorName?.trim();
  return name || null;
}
