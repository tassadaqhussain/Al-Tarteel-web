import { apiBase } from '@/lib/api';
import { rukuForAyah } from '@/lib/audio/ruku-map';

/** Spoken translations. Most publish one file per verse; some, per ruku. */
export type TranslationReciterCatalog = {
  slug: string;
  name: string;
  style: string;
  languageCode: string;
  languageName: string;
  baseUrl: string;
  sortOrder: number;
  /**
   * 'ayah' (default) — one MP3 per verse, named SSSAAA.mp3.
   * 'ruku' — one MP3 per section, named ruku-NNN.mp3 (global ruku 1-558).
   */
  granularity?: 'ayah' | 'ruku';
  /** Resolve baseUrl at call time (self-hosted files follow the API origin). */
  selfHosted?: boolean;
};

export const TRANSLATION_RECITERS: TranslationReciterCatalog[] = [
  {
    slug: 'en-ibrahim-walk',
    name: 'Ibrahim Walk',
    style: 'Sahih International',
    languageCode: 'en',
    languageName: 'English',
    baseUrl: 'https://everyayah.com/data/English/Sahih_Intnl_Ibrahim_Walk_192kbps',
    sortOrder: 1,
  },
  {
    slug: 'ur-shamshad-ali-khan',
    name: 'Shamshad Ali Khan',
    style: 'Urdu translation',
    languageCode: 'ur',
    languageName: 'Urdu',
    baseUrl: '/audio/files/ur-shamshad-ali-khan',
    sortOrder: 2,
    selfHosted: true,
  },
  {
    slug: 'ur-farhat-hashmi',
    name: 'Farhat Hashmi',
    style: 'Urdu translation',
    languageCode: 'ur',
    languageName: 'Urdu',
    baseUrl: '/audio/files/ur-farhat-hashmi',
    sortOrder: 3,
    selfHosted: true,
  },
  {
    slug: 'fa-makarem',
    name: 'Naser Makarem Shirazi',
    style: 'Persian translation',
    languageCode: 'fa',
    languageName: 'Persian',
    baseUrl: 'https://everyayah.com/data/translations/Makarem_Kabiri_16Kbps',
    sortOrder: 4,
  },
  {
    slug: 'fa-fooladvand',
    name: 'Mohammad Mahdi Fooladvand',
    style: 'Persian translation',
    languageCode: 'fa',
    languageName: 'Persian',
    baseUrl: 'https://everyayah.com/data/translations/Fooladvand_Hedayatfar_40Kbps',
    sortOrder: 5,
  },
  {
    // Mirrored into our own storage: the origin is HTTP-only with no CORS, so it
    // cannot be played from an HTTPS page. See scripts/fetch-pashto-audio.mjs.
    slug: 'ps-shafeeq-ur-rahman',
    name: 'Shafeeq ur Rahman',
    style: 'Pashto translation (recitation by Mishari Alafasy)',
    languageCode: 'ps',
    languageName: 'Pashto',
    baseUrl: '/audio/files/ps-shafeeq-ur-rahman',
    sortOrder: 6,
    granularity: 'ruku',
    selfHosted: true,
  },
];

function reciterBaseUrl(reciter: TranslationReciterCatalog): string {
  const base = reciter.selfHosted
    ? `${apiBase().replace(/\/$/, '')}${reciter.baseUrl}`
    : reciter.baseUrl;
  return base.replace(/\/$/, '');
}

export function translationVerseUrl(slug: string, surahNumber: number, ayahNumber: number): string | null {
  const reciter = TRANSLATION_RECITERS.find((item) => item.slug === slug);
  if (!reciter) return null;
  if (reciter.granularity === 'ruku') {
    const ruku = rukuForAyah(surahNumber, ayahNumber);
    if (!ruku) return null;
    return `${reciterBaseUrl(reciter)}/ruku-${String(ruku).padStart(3, '0')}.mp3`;
  }
  const file = `${String(surahNumber).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`;
  return `${reciterBaseUrl(reciter)}/${file}`;
}

export function catalogTranslationReciters() {
  return TRANSLATION_RECITERS.map((reciter) => ({
    id: -reciter.sortOrder,
    name: reciter.name,
    nameArabic: null,
    slug: reciter.slug,
    style: reciter.style,
    baseUrl: reciterBaseUrl(reciter),
    isDefault: false,
    sortOrder: 1000 + reciter.sortOrder,
    kind: 'translation' as const,
    languageCode: reciter.languageCode,
    languageName: reciter.languageName,
    granularity: reciter.granularity ?? 'ayah',
  }));
}

/** Playback granularity for a translation reciter ('ayah' when unknown). */
export function translationGranularity(slug: string): 'ayah' | 'ruku' {
  return TRANSLATION_RECITERS.find((item) => item.slug === slug)?.granularity ?? 'ayah';
}
