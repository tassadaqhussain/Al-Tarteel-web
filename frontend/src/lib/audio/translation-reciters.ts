/** Spoken verse translations (everyayah.com SSSAAA.mp3). */
export type TranslationReciterCatalog = {
  slug: string;
  name: string;
  style: string;
  languageCode: string;
  languageName: string;
  baseUrl: string;
  sortOrder: number;
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

export function translationVerseUrl(slug: string, surahNumber: number, ayahNumber: number): string | null {
  const reciter = TRANSLATION_RECITERS.find((item) => item.slug === slug);
  if (!reciter) return null;
  const file = `${String(surahNumber).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`;
  return `${reciter.baseUrl.replace(/\/$/, '')}/${file}`;
}

export function catalogTranslationReciters() {
  return TRANSLATION_RECITERS.map((reciter) => ({
    id: -reciter.sortOrder,
    name: reciter.name,
    nameArabic: null,
    slug: reciter.slug,
    style: reciter.style,
    baseUrl: reciter.baseUrl,
    isDefault: false,
    sortOrder: 1000 + reciter.sortOrder,
    kind: 'translation' as const,
    languageCode: reciter.languageCode,
    languageName: reciter.languageName,
  }));
}
