import { rukuForAyah } from './ruku-map';

/** Spoken translations. Most publish one file per verse; some, per ruku. */
export type TranslationReciter = {
  slug: string;
  name: string;
  style: string;
  languageCode: string;
  languageName: string;
  baseUrl: string;
  sortOrder: number;
  granularity?: 'ayah' | 'ruku';
  /** Served from our own storage; baseUrl is the folder under AUDIO_PUBLIC_BASE_URL. */
  selfHosted?: boolean;
  /** Remote origin used only by the download mirror. */
  originUrl?: string;
};

const localAudioBase = () =>
  (process.env.AUDIO_PUBLIC_BASE_URL || 'http://localhost:4010/api/v1/audio/files').replace(/\/$/, '');

export const TRANSLATION_RECITERS: TranslationReciter[] = [
  {
    slug: 'en-ibrahim-walk',
    name: 'Ibrahim Walk',
    style: 'Sahih International',
    languageCode: 'en',
    languageName: 'English',
    baseUrl: 'en-ibrahim-walk',
    originUrl: 'https://everyayah.com/data/English/Sahih_Intnl_Ibrahim_Walk_192kbps',
    sortOrder: 1,
    selfHosted: true,
  },
  {
    slug: 'ur-shamshad-ali-khan',
    name: 'Shamshad Ali Khan',
    style: 'Urdu translation',
    languageCode: 'ur',
    languageName: 'Urdu',
    baseUrl: 'ur-shamshad-ali-khan',
    originUrl: 'https://everyayah.com/data/translations/urdu_shamshad_ali_khan_46kbps',
    sortOrder: 2,
    selfHosted: true,
  },
  {
    slug: 'ur-farhat-hashmi',
    name: 'Farhat Hashmi',
    style: 'Urdu translation',
    languageCode: 'ur',
    languageName: 'Urdu',
    baseUrl: 'ur-farhat-hashmi',
    originUrl: 'https://everyayah.com/data/translations/urdu_farhat_hashmi',
    sortOrder: 3,
    selfHosted: true,
  },
  {
    slug: 'fa-makarem',
    name: 'Naser Makarem Shirazi',
    style: 'Persian translation',
    languageCode: 'fa',
    languageName: 'Persian',
    baseUrl: 'fa-makarem',
    originUrl: 'https://everyayah.com/data/translations/Makarem_Kabiri_16Kbps',
    sortOrder: 4,
    selfHosted: true,
  },
  {
    slug: 'fa-fooladvand',
    name: 'Mohammad Mahdi Fooladvand',
    style: 'Persian translation',
    languageCode: 'fa',
    languageName: 'Persian',
    baseUrl: 'fa-fooladvand',
    originUrl: 'https://everyayah.com/data/translations/Fooladvand_Hedayatfar_40Kbps',
    sortOrder: 5,
    selfHosted: true,
  },
  {
    slug: 'ps-shafeeq-ur-rahman',
    name: 'Shafeeq ur Rahman',
    style: 'Pashto translation (recitation by Mishari Alafasy)',
    languageCode: 'ps',
    languageName: 'Pashto',
    baseUrl: 'ps-shafeeq-ur-rahman',
    sortOrder: 6,
    granularity: 'ruku',
    selfHosted: true,
  },
];

export function translationBaseUrl(reciter: TranslationReciter): string {
  return reciter.selfHosted
    ? `${localAudioBase()}/${reciter.slug}`
    : reciter.baseUrl.replace(/\/$/, '');
}

export function translationOriginUrl(reciter: TranslationReciter): string | null {
  return reciter.originUrl ? reciter.originUrl.replace(/\/$/, '') : null;
}

export function getTranslationReciter(slug: string): TranslationReciter | undefined {
  return TRANSLATION_RECITERS.find((item) => item.slug === slug);
}

export function translationVerseUrl(slug: string, surahNumber: number, ayahNumber: number): string | null {
  const reciter = getTranslationReciter(slug);
  if (!reciter) return null;
  if (reciter.granularity === 'ruku') {
    const ruku = rukuForAyah(surahNumber, ayahNumber);
    if (!ruku) return null;
    return `${translationBaseUrl(reciter)}/ruku-${String(ruku).padStart(3, '0')}.mp3`;
  }
  const file = `${String(surahNumber).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`;
  return `${translationBaseUrl(reciter)}/${file}`;
}
