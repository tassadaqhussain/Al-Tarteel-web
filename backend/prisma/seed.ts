/**
 * Al-Tarteel seed script
 * Seeds: Surahs (114), sample Ayahs + Words, Translators, Reciters, sample Translations/Audio.
 * For full Quran text use Tanzil data: https://tanzil.net/docs/download
 * Run: pnpm run seed
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Standard 114 surahs metadata (Tanzil-compatible)
const SURAHS_META = [
  { number: 1, nameArabic: 'الفاتحة', nameSimple: 'Al-Fatihah', nameComplex: 'Al-Fātiĥah', revelationPlace: 'makkan', revelationOrder: 5, numberOfAyahs: 7 },
  { number: 2, nameArabic: 'البقرة', nameSimple: 'Al-Baqarah', nameComplex: 'Al-Baqarah', revelationPlace: 'madinah', revelationOrder: 87, numberOfAyahs: 286 },
  { number: 3, nameArabic: 'آل عمران', nameSimple: 'Aal-e-Imran', nameComplex: 'Āl-`Imrān', revelationPlace: 'madinah', revelationOrder: 89, numberOfAyahs: 200 },
  { number: 4, nameArabic: 'النساء', nameSimple: 'An-Nisa', nameComplex: 'An-Nisā', revelationPlace: 'madinah', revelationOrder: 92, numberOfAyahs: 176 },
  { number: 5, nameArabic: 'المائدة', nameSimple: 'Al-Maidah', nameComplex: 'Al-Māidah', revelationPlace: 'madinah', revelationOrder: 112, numberOfAyahs: 120 },
  { number: 6, nameArabic: 'الأنعام', nameSimple: 'Al-Anaam', nameComplex: 'Al-An`ām', revelationPlace: 'makkan', revelationOrder: 55, numberOfAyahs: 165 },
  { number: 7, nameArabic: 'الأعراف', nameSimple: 'Al-Araf', nameComplex: 'Al-A`rāf', revelationPlace: 'makkan', revelationOrder: 39, numberOfAyahs: 206 },
  { number: 8, nameArabic: 'الأنفال', nameSimple: 'Al-Anfal', nameComplex: 'Al-Anfāl', revelationPlace: 'madinah', revelationOrder: 88, numberOfAyahs: 75 },
  { number: 9, nameArabic: 'التوبة', nameSimple: 'At-Tawbah', nameComplex: 'At-Tawbah', revelationPlace: 'madinah', revelationOrder: 113, numberOfAyahs: 129 },
  { number: 10, nameArabic: 'يونس', nameSimple: 'Yunus', nameComplex: 'Yūnus', revelationPlace: 'makkan', revelationOrder: 51, numberOfAyahs: 109 },
  // ... (abbreviated; in production use full 114 from Tanzil)
];

// Al-Fatihah Uthmani text (Tanzil) — full surah for seed
const FATIHAH_AYAHS = [
  { number: 1, numberInQuran: 1, juz: 1, hizb: 1, ruku: 1, page: 1, text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ' },
  { number: 2, numberInQuran: 2, juz: 1, hizb: 1, ruku: 1, page: 1, text: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ' },
  { number: 3, numberInQuran: 3, juz: 1, hizb: 1, ruku: 1, page: 1, text: 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ' },
  { number: 4, numberInQuran: 4, juz: 1, hizb: 1, ruku: 1, page: 1, text: 'مَٰلِكِ يَوْمِ ٱلدِّينِ' },
  { number: 5, numberInQuran: 5, juz: 1, hizb: 1, ruku: 1, page: 1, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
  { number: 6, numberInQuran: 6, juz: 1, hizb: 1, ruku: 1, page: 1, text: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ' },
  { number: 7, numberInQuran: 7, juz: 1, hizb: 1, ruku: 1, page: 2, text: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ' },
];

// Extend to 114 surahs (minimal names for rest)
function getAllSurahs(): typeof SURAHS_META {
  const names: Record<number, { nameArabic: string; nameSimple: string; nameComplex: string; revelationPlace: string; revelationOrder: number; numberOfAyahs: number }> = {
    1: { nameArabic: 'الفاتحة', nameSimple: 'Al-Fatihah', nameComplex: 'Al-Fātiĥah', revelationPlace: 'makkan', revelationOrder: 5, numberOfAyahs: 7 },
    2: { nameArabic: 'البقرة', nameSimple: 'Al-Baqarah', nameComplex: 'Al-Baqarah', revelationPlace: 'madinah', revelationOrder: 87, numberOfAyahs: 286 },
    3: { nameArabic: 'آل عمران', nameSimple: 'Aal-e-Imran', nameComplex: 'Āl-`Imrān', revelationPlace: 'madinah', revelationOrder: 89, numberOfAyahs: 200 },
    4: { nameArabic: 'النساء', nameSimple: 'An-Nisa', nameComplex: 'An-Nisā', revelationPlace: 'madinah', revelationOrder: 92, numberOfAyahs: 176 },
    5: { nameArabic: 'المائدة', nameSimple: 'Al-Maidah', nameComplex: 'Al-Māidah', revelationPlace: 'madinah', revelationOrder: 112, numberOfAyahs: 120 },
    6: { nameArabic: 'الأنعام', nameSimple: 'Al-Anaam', nameComplex: 'Al-An`ām', revelationPlace: 'makkan', revelationOrder: 55, numberOfAyahs: 165 },
    7: { nameArabic: 'الأعراف', nameSimple: 'Al-Araf', nameComplex: 'Al-A`rāf', revelationPlace: 'makkan', revelationOrder: 39, numberOfAyahs: 206 },
    8: { nameArabic: 'الأنفال', nameSimple: 'Al-Anfal', nameComplex: 'Al-Anfāl', revelationPlace: 'madinah', revelationOrder: 88, numberOfAyahs: 75 },
    9: { nameArabic: 'التوبة', nameSimple: 'At-Tawbah', nameComplex: 'At-Tawbah', revelationPlace: 'madinah', revelationOrder: 113, numberOfAyahs: 129 },
    10: { nameArabic: 'يونس', nameSimple: 'Yunus', nameComplex: 'Yūnus', revelationPlace: 'makkan', revelationOrder: 51, numberOfAyahs: 109 },
  };
  const ayahCounts: Record<number, number> = {
    1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
    11: 123, 12: 111, 13: 43, 14: 52, 15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135,
    21: 112, 22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88, 29: 69, 30: 60,
    31: 34, 32: 30, 33: 73, 34: 54, 35: 45, 36: 83, 37: 182, 38: 88, 39: 75, 40: 85,
    41: 54, 42: 53, 43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18, 50: 45,
    51: 60, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96, 57: 29, 58: 22, 59: 24, 60: 13,
    61: 14, 62: 11, 63: 11, 64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
    71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50, 78: 40, 79: 46, 80: 42,
    81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19, 88: 26, 89: 30, 90: 20,
    91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11,
    101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3,
    111: 5, 112: 4, 113: 5, 114: 6,
  };
  const revelation: Record<number, string> = {};
  for (let i = 1; i <= 114; i++) revelation[i] = i <= 87 ? (i === 1 || (i >= 50 && i <= 56) ? 'makkan' : (i >= 2 && i <= 5 ? 'madinah' : (i <= 48 ? 'makkan' : 'madinah'))) : 'madinah';
  const revOrder: Record<number, number> = {};
  for (let i = 1; i <= 114; i++) revOrder[i] = i;
  const result: { number: number; nameArabic: string; nameSimple: string; nameComplex: string; revelationPlace: string; revelationOrder: number; numberOfAyahs: number }[] = [];
  const nameSimpleList: Record<number, string> = {
    1: 'Al-Fatihah', 2: 'Al-Baqarah', 3: 'Aal-e-Imran', 4: 'An-Nisa', 5: 'Al-Maidah', 6: 'Al-Anaam', 7: 'Al-Araf', 8: 'Al-Anfal', 9: 'At-Tawbah', 10: 'Yunus',
    11: 'Hud', 12: 'Yusuf', 13: 'Ar-Rad', 14: 'Ibrahim', 15: 'Al-Hijr', 16: 'An-Nahl', 17: 'Al-Isra', 18: 'Al-Kahf', 19: 'Maryam', 20: 'Taha',
    21: 'Al-Anbiya', 22: 'Al-Hajj', 23: 'Al-Muminun', 24: 'An-Nur', 25: 'Al-Furqan', 26: 'Ash-Shuara', 27: 'An-Naml', 28: 'Al-Qasas', 29: 'Al-Ankabut', 30: 'Ar-Rum',
    31: 'Luqman', 32: 'As-Sajda', 33: 'Al-Ahzab', 34: 'Saba', 35: 'Fatir', 36: 'Yaseen', 37: 'As-Saffat', 38: 'Sad', 39: 'Az-Zumar', 40: 'Ghafir',
    41: 'Fussilat', 42: 'Ash-Shura', 43: 'Az-Zukhruf', 44: 'Ad-Dukhan', 45: 'Al-Jathiya', 46: 'Al-Ahqaf', 47: 'Muhammad', 48: 'Al-Fath', 49: 'Al-Hujurat', 50: 'Qaf',
    51: 'Adh-Dhariyat', 52: 'At-Tur', 53: 'An-Najm', 54: 'Al-Qamar', 55: 'Ar-Rahman', 56: 'Al-Waqia', 57: 'Al-Hadid', 58: 'Al-Mujadila', 59: 'Al-Hashr', 60: 'Al-Mumtahanah',
    61: 'As-Saf', 62: 'Al-Jumua', 63: 'Al-Munafiqun', 64: 'At-Taghabun', 65: 'At-Talaq', 66: 'At-Tahrim', 67: 'Al-Mulk', 68: 'Al-Qalam', 69: 'Al-Haaqqa', 70: 'Al-Maarij',
    71: 'Nooh', 72: 'Al-Jinn', 73: 'Al-Muzzammil', 74: 'Al-Muddaththir', 75: 'Al-Qiyama', 76: 'Al-Insan', 77: 'Al-Mursalat', 78: 'An-Naba', 79: 'An-Naziat', 80: 'Abasa',
    81: 'At-Takwir', 82: 'Al-Infitar', 83: 'Al-Mutaffifin', 84: 'Al-Inshiqaq', 85: 'Al-Burooj', 86: 'At-Tariq', 87: 'Al-Ala', 88: 'Al-Ghashiya', 89: 'Al-Fajr', 90: 'Al-Balad',
    91: 'Ash-Shams', 92: 'Al-Lail', 93: 'Ad-Duhaa', 94: 'Ash-Sharh', 95: 'At-Tin', 96: 'Al-Alaq', 97: 'Al-Qadr', 98: 'Al-Bayyina', 99: 'Az-Zalzalah', 100: 'Al-Adiyat',
    101: 'Al-Qaria', 102: 'At-Takathur', 103: 'Al-Asr', 104: 'Al-Humaza', 105: 'Al-Fil', 106: 'Quraish', 107: 'Al-Maun', 108: 'Al-Kauthar', 109: 'Al-Kafirun', 110: 'An-Nasr',
    111: 'Al-Masad', 112: 'Al-Ikhlas', 113: 'Al-Falaq', 114: 'An-Nas',
  };
  const nameArabicList: Record<number, string> = {
    1: 'الْفَاتِحَة', 2: 'الْبَقَرَة', 3: 'آلِ عِمْرَان', 4: 'النِّسَاء', 5: 'الْمَائِدَة', 6: 'الْأَنْعَام', 7: 'الْأَعْرَاف', 8: 'الْأَنْفَال', 9: 'التَّوْبَة', 10: 'يُونُس',
    11: 'هُود', 12: 'يُوسُف', 13: 'الرَّعْد', 14: 'إِبْرَاهِيم', 15: 'الْحِجْر', 16: 'النَّحْل', 17: 'الْإِسْرَاء', 18: 'الْكَهْف', 19: 'مَرْيَم', 20: 'طه',
    21: 'الْأَنْبِيَاء', 22: 'الْحَجّ', 23: 'الْمُؤْمِنُون', 24: 'النُّور', 25: 'الْفُرْقَان', 26: 'الشُّعَرَاء', 27: 'النَّمْل', 28: 'الْقَصَص', 29: 'الْعَنْكَبُوت', 30: 'الرُّوم',
    31: 'لُقْمَان', 32: 'السَّجْدَة', 33: 'الْأَحْزَاب', 34: 'سَبَأ', 35: 'فَاطِر', 36: 'يس', 37: 'الصَّافَّات', 38: 'ص', 39: 'الزُّمَر', 40: 'غَافِر',
    41: 'فُصِّلَت', 42: 'الشُّورَىٰ', 43: 'الزُّخْرُف', 44: 'الدُّخَان', 45: 'الْجَاثِيَة', 46: 'الْأَحْقَاف', 47: 'مُحَمَّد', 48: 'الْفَتْح', 49: 'الْحُجُرَات', 50: 'ق',
    51: 'الذَّارِيَات', 52: 'الطُّور', 53: 'النَّجْم', 54: 'الْقَمَر', 55: 'الرَّحْمَٰن', 56: 'الْوَاقِعَة', 57: 'الْحَدِيد', 58: 'الْمُجَادِلَة', 59: 'الْحَشْر', 60: 'الْمُمْتَحَنَة',
    61: 'الصَّفّ', 62: 'الْجُمُعَة', 63: 'الْمُنَافِقُون', 64: 'التَّغَابُن', 65: 'الطَّلَاق', 66: 'التَّحْرِيم', 67: 'الْمُلْك', 68: 'الْقَلَم', 69: 'الْحَاقَّة', 70: 'الْمَعَارِج',
    71: 'نُوح', 72: 'الْجِنّ', 73: 'الْمُزَّمِّل', 74: 'الْمُدَّثِّر', 75: 'الْقِيَامَة', 76: 'الْإِنْسَان', 77: 'الْمُرْسَلَات', 78: 'النَّبَأ', 79: 'النَّازِعَات', 80: 'عَبَسَ',
    81: 'التَّكْوِير', 82: 'الِانْفِطَار', 83: 'الْمُطَفِّفِين', 84: 'الِانْشِقَاق', 85: 'الْبُرُوج', 86: 'الطَّارِق', 87: 'الْأَعْلَىٰ', 88: 'الْغَاشِيَة', 89: 'الْفَجْر', 90: 'الْبَلَد',
    91: 'الشَّمْس', 92: 'اللَّيْل', 93: 'الضُّحَىٰ', 94: 'الشَّرْح', 95: 'التِّين', 96: 'الْعَلَق', 97: 'الْقَدْر', 98: 'الْبَيِّنَة', 99: 'الزَّلْزَلَة', 100: 'الْعَادِيَات',
    101: 'الْقَارِعَة', 102: 'التَّكَاثُر', 103: 'الْعَصْر', 104: 'الْهُمَزَة', 105: 'الْفِيل', 106: 'قُرَيْش', 107: 'الْمَاعُون', 108: 'الْكَوْثَر', 109: 'الْكَافِرُون', 110: 'النَّصْر',
    111: 'الْمَسَد', 112: 'الْإِخْلَاص', 113: 'الْفَلَق', 114: 'النَّاس',
  };
  for (let n = 1; n <= 114; n++) {
    result.push({
      number: n,
      nameArabic: nameArabicList[n] || `Surah ${n}`,
      nameSimple: nameSimpleList[n] || `Surah ${n}`,
      nameComplex: nameSimpleList[n] || `Surah ${n}`,
      revelationPlace: n <= 86 ? (n === 1 || (n >= 50 && n <= 56) ? 'makkan' : (n >= 2 && n <= 5 ? 'madinah' : (n >= 6 && n <= 48 ? 'makkan' : 'madinah'))) : 'madinah',
      revelationOrder: n,
      numberOfAyahs: ayahCounts[n] || 0,
    });
  }
  return result;
}

async function main() {
  console.log('Seeding database...');

  const surahsMeta = getAllSurahs();
  for (const s of surahsMeta) {
    await prisma.surah.upsert({
      where: { number: s.number },
      create: {
        number: s.number,
        nameArabic: s.nameArabic,
        nameSimple: s.nameSimple,
        nameComplex: s.nameComplex,
        revelationPlace: s.revelationPlace,
        revelationOrder: s.revelationOrder,
        numberOfAyahs: s.numberOfAyahs,
      },
      update: { nameArabic: s.nameArabic, nameSimple: s.nameSimple, nameComplex: s.nameComplex, revelationPlace: s.revelationPlace, revelationOrder: s.revelationOrder, numberOfAyahs: s.numberOfAyahs },
    });
  }
  console.log('Surahs: 114 upserted.');

  const surahOne = await prisma.surah.findUnique({ where: { number: 1 } });
  if (!surahOne) throw new Error('Surah 1 not found');
  for (const a of FATIHAH_AYAHS) {
    await prisma.ayah.upsert({
      where: { surahId_number: { surahId: surahOne.id, number: a.number } },
      create: {
        surahId: surahOne.id,
        number: a.number,
        numberInQuran: a.numberInQuran,
        juz: a.juz,
        hizb: a.hizb,
        ruku: a.ruku,
        page: a.page,
        textUthmani: a.text,
      },
      update: { numberInQuran: a.numberInQuran, juz: a.juz, hizb: a.hizb, ruku: a.ruku, page: a.page, textUthmani: a.text },
    });
  }
  console.log('Al-Fatihah ayahs: 7 upserted.');

  const ayahs = await prisma.ayah.findMany({ where: { surahId: surahOne.id }, orderBy: { number: 'asc' } });
  const enTranslator = await prisma.translator.upsert({
    where: { slug: 'en-hilali-khan' },
    create: { name: 'Dr. Muhsin Khan & Dr. Hilali', languageCode: 'en', slug: 'en-hilali-khan' },
    update: {},
  });
  const enTranslations = [
    'In the Name of Allah, the Most Beneficent, the Most Merciful.',
    'All the praises and thanks be to Allah, the Lord of the \'Alamin (mankind, jinns and all that exists).',
    'The Most Beneficent, the Most Merciful.',
    'The Only Owner (and the Only Ruling Judge) of the Day of Recompense (i.e. the Day of Resurrection).',
    'You (Alone) we worship, and You (Alone) we ask for help (for each and everything).',
    'Guide us to the Straight Way.',
    'The Way of those on whom You have bestowed Your Grace, not (the way) of those who earned Your Anger (such as the Jews), nor of those who went astray (such as the Christians).',
  ];
  for (let i = 0; i < ayahs.length; i++) {
    await prisma.ayahTranslation.upsert({
      where: { ayahId_translatorId: { ayahId: ayahs[i].id, translatorId: enTranslator.id } },
      create: { ayahId: ayahs[i].id, translatorId: enTranslator.id, text: enTranslations[i] },
      update: { text: enTranslations[i] },
    });
  }
  console.log('English translations for Al-Fatihah upserted.');

  const reciter = await prisma.reciter.upsert({
    where: { slug: 'abdul-basit-murattal' },
    create: {
      name: 'Abdul Basit Abdul Samad',
      nameArabic: 'عبد الباسط عبد الصمد',
      slug: 'abdul-basit-murattal',
      style: 'murattal',
      baseUrl: 'https://verses.quran.com/AbdulBasitAbdulSamad/Murattal/mp3',
      isDefault: true,
      sortOrder: 0,
    },
    update: {},
  });
  for (const ayah of ayahs) {
    const padSurah = String(ayah.surahId).padStart(3, '0');
    const padAyah = String(ayah.number).padStart(3, '0');
    const url = `${reciter.baseUrl}/${padSurah}${padAyah}.mp3`;
    await prisma.audioFile.upsert({
      where: { ayahId_reciterId: { ayahId: ayah.id, reciterId: reciter.id } },
      create: { ayahId: ayah.id, reciterId: reciter.id, url, format: 'mp3' },
      update: { url },
    });
  }
  console.log('Sample audio URLs for Al-Fatihah upserted.');

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
