/** Spoken verse translations (everyayah.com SSSAAA.mp3). Not stored in DB. */
export type TranslationReciter = {
  slug: string;
  name: string;
  style: string;
  languageCode: string;
  languageName: string;
  baseUrl: string;
  sortOrder: number;
};

export const TRANSLATION_RECITERS: TranslationReciter[] = [
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
    baseUrl: 'https://everyayah.com/data/translations/urdu_shamshad_ali_khan_46kbps',
    sortOrder: 2,
  },
  {
    slug: 'ur-farhat-hashmi',
    name: 'Farhat Hashmi',
    style: 'Urdu translation',
    languageCode: 'ur',
    languageName: 'Urdu',
    baseUrl: 'https://everyayah.com/data/translations/urdu_farhat_hashmi',
    sortOrder: 3,
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
];

export function getTranslationReciter(slug: string): TranslationReciter | undefined {
  return TRANSLATION_RECITERS.find((item) => item.slug === slug);
}

export function translationVerseUrl(slug: string, surahNumber: number, ayahNumber: number): string | null {
  const reciter = getTranslationReciter(slug);
  if (!reciter) return null;
  const file = `${String(surahNumber).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`;
  return `${reciter.baseUrl.replace(/\/$/, '')}/${file}`;
}
