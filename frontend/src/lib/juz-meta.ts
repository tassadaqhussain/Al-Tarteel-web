export interface JuzMeta {
  number: number;
  name: string;
  nameArabic: string;
  startRef: string;
  endRef: string;
  startSurah: number;
  endSurah: number;
}

/** Traditional names and exact verse spans for all 30 Juz (Para) of the Quran. */
export const JUZ_META: Record<number, JuzMeta> = {
  1: { number: 1, name: 'Alif Lam Mim', nameArabic: 'آلم', startRef: 'Al-Fatihah 1:1', endRef: 'Al-Baqarah 2:141', startSurah: 1, endSurah: 2 },
  2: { number: 2, name: 'Sayaqul', nameArabic: 'سيقول', startRef: 'Al-Baqarah 2:142', endRef: 'Al-Baqarah 2:252', startSurah: 2, endSurah: 2 },
  3: { number: 3, name: 'Tilkar-Rusul', nameArabic: 'تلك الرسل', startRef: 'Al-Baqarah 2:253', endRef: 'Ali Imran 3:92', startSurah: 2, endSurah: 3 },
  4: { number: 4, name: 'Lan Tanalu', nameArabic: 'لن تنالوا', startRef: 'Ali Imran 3:93', endRef: 'An-Nisa 4:23', startSurah: 3, endSurah: 4 },
  5: { number: 5, name: 'Wal-Muhsanat', nameArabic: 'والمحصنات', startRef: 'An-Nisa 4:24', endRef: 'An-Nisa 4:147', startSurah: 4, endSurah: 4 },
  6: { number: 6, name: 'La Yuhibbullah', nameArabic: 'لا يحب الله', startRef: 'An-Nisa 4:148', endRef: 'Al-Maidah 5:81', startSurah: 4, endSurah: 5 },
  7: { number: 7, name: 'Wa Idha Samiu', nameArabic: 'وإذا سمعوا', startRef: 'Al-Maidah 5:82', endRef: 'Al-Anam 6:110', startSurah: 5, endSurah: 6 },
  8: { number: 8, name: 'Wa Law Annana', nameArabic: 'ولو أننا', startRef: 'Al-Anam 6:111', endRef: 'Al-Araf 7:87', startSurah: 6, endSurah: 7 },
  9: { number: 9, name: 'Qalal-Mala', nameArabic: 'قال الملأ', startRef: 'Al-Araf 7:88', endRef: 'Al-Anfal 8:40', startSurah: 7, endSurah: 8 },
  10: { number: 10, name: 'Wa Lamu', nameArabic: 'واعلموا', startRef: 'Al-Anfal 8:41', endRef: 'At-Tawbah 9:92', startSurah: 8, endSurah: 9 },
  11: { number: 11, name: 'Yatadhirun', nameArabic: 'يعتذرون', startRef: 'At-Tawbah 9:93', endRef: 'Hud 11:5', startSurah: 9, endSurah: 11 },
  12: { number: 12, name: 'Wa Ma Min Dabbah', nameArabic: 'وما من دابة', startRef: 'Hud 11:6', endRef: 'Yusuf 12:52', startSurah: 11, endSurah: 12 },
  13: { number: 13, name: 'Wa Ma Ubarri', nameArabic: 'وما أبرئ', startRef: 'Yusuf 12:53', endRef: 'Ibrahim 14:52', startSurah: 12, endSurah: 14 },
  14: { number: 14, name: 'Rubama', nameArabic: 'ربما', startRef: 'Al-Hijr 15:1', endRef: 'An-Nahl 16:128', startSurah: 15, endSurah: 16 },
  15: { number: 15, name: 'Subhanalladhi', nameArabic: 'سبحان الذي', startRef: 'Al-Isra 17:1', endRef: 'Al-Kahf 18:74', startSurah: 17, endSurah: 18 },
  16: { number: 16, name: 'Qala Alam', nameArabic: 'قال ألم', startRef: 'Al-Kahf 18:75', endRef: 'Taha 20:135', startSurah: 18, endSurah: 20 },
  17: { number: 17, name: 'Iqtaraba', nameArabic: 'اقترب للناس', startRef: 'Al-Anbya 21:1', endRef: 'Al-Hajj 22:78', startSurah: 21, endSurah: 22 },
  18: { number: 18, name: 'Qad Aflaha', nameArabic: 'قد أفلح', startRef: 'Al-Muminun 23:1', endRef: 'Al-Furqan 25:20', startSurah: 23, endSurah: 25 },
  19: { number: 19, name: 'Wa Qalalladhina', nameArabic: 'وقال الذين', startRef: 'Al-Furqan 25:21', endRef: 'An-Naml 27:55', startSurah: 25, endSurah: 27 },
  20: { number: 20, name: 'Amman Khalaqa', nameArabic: 'أمن خلق', startRef: 'An-Naml 27:56', endRef: 'Al-Ankabut 29:45', startSurah: 27, endSurah: 29 },
  21: { number: 21, name: 'Utlu Ma Uhiya', nameArabic: 'اتل ما أوحي', startRef: 'Al-Ankabut 29:46', endRef: 'Al-Ahzab 33:30', startSurah: 29, endSurah: 33 },
  22: { number: 22, name: 'Wa Man Yaqnut', nameArabic: 'ومن يقنت', startRef: 'Al-Ahzab 33:31', endRef: 'Ya-Sin 36:27', startSurah: 33, endSurah: 36 },
  23: { number: 23, name: 'Wa Ma Liya', nameArabic: 'وما لي', startRef: 'Ya-Sin 36:28', endRef: 'Az-Zumar 39:31', startSurah: 36, endSurah: 39 },
  24: { number: 24, name: 'Faman Azlam', nameArabic: 'فمن أظلم', startRef: 'Az-Zumar 39:32', endRef: 'Fussilat 41:46', startSurah: 39, endSurah: 41 },
  25: { number: 25, name: 'Ilayhi Yuraddu', nameArabic: 'إليه يرد', startRef: 'Fussilat 41:47', endRef: 'Al-Jathiyah 45:37', startSurah: 41, endSurah: 45 },
  26: { number: 26, name: 'Ha Mim', nameArabic: 'حم', startRef: 'Al-Ahqaf 46:1', endRef: 'Adh-Dhariyat 51:30', startSurah: 46, endSurah: 51 },
  27: { number: 27, name: 'Qala Fama Khatbukum', nameArabic: 'قال فما خطبكم', startRef: 'Adh-Dhariyat 51:31', endRef: 'Al-Hadid 57:29', startSurah: 51, endSurah: 57 },
  28: { number: 28, name: 'Qad Sami Allah', nameArabic: 'قد سمع الله', startRef: 'Al-Mujadila 58:1', endRef: 'At-Tahrim 66:12', startSurah: 58, endSurah: 66 },
  29: { number: 29, name: 'Tabarakalladhi', nameArabic: 'تبارك الذي', startRef: 'Al-Mulk 67:1', endRef: 'Al-Mursalat 77:50', startSurah: 67, endSurah: 77 },
  30: { number: 30, name: 'Amma Yatasaalun', nameArabic: 'عم يتساءلون', startRef: 'An-Naba 78:1', endRef: 'An-Nas 114:6', startSurah: 78, endSurah: 114 },
};

export function getJuzMeta(juzNumber: number): JuzMeta {
  return (
    JUZ_META[juzNumber] ?? {
      number: juzNumber,
      name: `Juz ${juzNumber}`,
      nameArabic: `الجزء ${juzNumber}`,
      startRef: '',
      endRef: '',
      startSurah: 1,
      endSurah: 114,
    }
  );
}
