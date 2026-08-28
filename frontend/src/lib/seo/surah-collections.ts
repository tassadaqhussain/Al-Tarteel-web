import { POPULAR_SURAHS } from '@/lib/surah-meta';

export type SurahCollection = {
  id: string;
  title: string;
  description: string;
  numbers: number[];
};

export const SURAH_COLLECTIONS: SurahCollection[] = [
  {
    id: 'popular',
    title: 'Popular Surahs',
    description:
      'Chapters Muslims read and search for most often — from Al-Fatihah and Ya-Sin to Al-Mulk and the three Quls.',
    numbers: POPULAR_SURAHS,
  },
  {
    id: 'friday',
    title: 'Surahs for Friday',
    description:
      'Surah Al-Kahf is widely read on Fridays; Al-Jumu’ah and As-Sajdah are also linked to Jumu’ah prayer and reflection.',
    numbers: [18, 62, 32],
  },
  {
    id: 'night',
    title: 'Surahs for Night',
    description:
      'Commonly recited before sleep or in the last third of the night — including Al-Mulk, Ya-Sin, Ar-Rahman, and the short surahs.',
    numbers: [67, 36, 56, 55, 32, 112, 113, 114],
  },
  {
    id: 'short',
    title: 'Short Surahs',
    description:
      'Brief chapters ideal for memorization, daily recitation, and learning — especially Juz Amma and the three Quls.',
    numbers: [103, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 87, 93, 94, 95, 97, 98, 99, 100, 101, 102],
  },
];
