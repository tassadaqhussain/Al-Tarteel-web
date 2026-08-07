/** Lightweight surah metadata for landing-page UI. */

export type SurahMeta = {
  nameSimple: string;
  nameArabic: string;
  meaning: string;
};

/** English meanings commonly used on Quran.com-style UIs. */
export const SURAH_MEANINGS: Record<number, string> = {
  1: 'The Opener',
  2: 'The Cow',
  3: 'Family of Imran',
  4: 'The Women',
  5: 'The Table Spread',
  6: 'The Cattle',
  7: 'The Heights',
  8: 'The Spoils of War',
  9: 'The Repentance',
  10: 'Jonah',
  11: 'Hud',
  12: 'Joseph',
  13: 'The Thunder',
  14: 'Abraham',
  15: 'The Rocky Tract',
  16: 'The Bee',
  17: 'The Night Journey',
  18: 'The Cave',
  19: 'Mary',
  20: 'Ta-Ha',
  21: 'The Prophets',
  22: 'The Pilgrimage',
  23: 'The Believers',
  24: 'The Light',
  25: 'The Criterion',
  26: 'The Poets',
  27: 'The Ant',
  28: 'The Stories',
  29: 'The Spider',
  30: 'The Romans',
  31: 'Luqman',
  32: 'The Prostration',
  33: 'The Combined Forces',
  34: 'Sheba',
  35: 'Originator',
  36: 'Ya-Sin',
  37: 'Those who set the Ranks',
  38: 'The Letter Sad',
  39: 'The Troops',
  40: 'The Forgiver',
  41: 'Explained in Detail',
  42: 'The Consultation',
  43: 'The Ornaments of Gold',
  44: 'The Smoke',
  45: 'The Crouching',
  46: 'The Wind-Curved Sandhills',
  47: 'Muhammad',
  48: 'The Victory',
  49: 'The Rooms',
  50: 'The Letter Qaf',
  51: 'The Winnowing Winds',
  52: 'The Mount',
  53: 'The Star',
  54: 'The Moon',
  55: 'The Beneficent',
  56: 'The Inevitable',
  57: 'The Iron',
  58: 'The Pleading Woman',
  59: 'The Exile',
  60: 'She that is to be examined',
  61: 'The Ranks',
  62: 'The Congregation',
  63: 'The Hypocrites',
  64: 'The Mutual Disillusion',
  65: 'The Divorce',
  66: 'The Prohibition',
  67: 'The Sovereignty',
  68: 'The Pen',
  69: 'The Reality',
  70: 'The Ascending Stairways',
  71: 'Noah',
  72: 'The Jinn',
  73: 'The Enshrouded One',
  74: 'The Cloaked One',
  75: 'The Resurrection',
  76: 'The Man',
  77: 'The Emissaries',
  78: 'The Tidings',
  79: 'Those who drag forth',
  80: 'He Frowned',
  81: 'The Overthrowing',
  82: 'The Cleaving',
  83: 'The Defrauding',
  84: 'The Sundering',
  85: 'The Mansions of the Stars',
  86: 'The Nightcommer',
  87: 'The Most High',
  88: 'The Overwhelming',
  89: 'The Dawn',
  90: 'The City',
  91: 'The Sun',
  92: 'The Night',
  93: 'The Morning Hours',
  94: 'The Relief',
  95: 'The Fig',
  96: 'The Clot',
  97: 'The Power',
  98: 'The Clear Proof',
  99: 'The Earthquake',
  100: 'The Courser',
  101: 'The Calamity',
  102: 'The Rivalry in world increase',
  103: 'The Declining Day',
  104: 'The Traducer',
  105: 'The Elephant',
  106: 'Quraysh',
  107: 'The Small Kindnesses',
  108: 'The Abundance',
  109: 'The Disbelievers',
  110: 'The Divine Support',
  111: 'The Palm Fiber',
  112: 'The Sincerity',
  113: 'The Daybreak',
  114: 'Mankind',
};

/** Common English transliterations (Quran.com-style). */
export const SURAH_SIMPLE_NAMES: Record<number, string> = {
  1: 'Al-Fatihah',
  2: 'Al-Baqarah',
  3: "Ali 'Imran",
  4: 'An-Nisa',
  5: "Al-Ma'idah",
  6: "Al-An'am",
  7: "Al-A'raf",
  8: 'Al-Anfal',
  9: 'At-Tawbah',
  10: 'Yunus',
  11: 'Hud',
  12: 'Yusuf',
  13: "Ar-Ra'd",
  14: 'Ibrahim',
  15: 'Al-Hijr',
  16: 'An-Nahl',
  17: 'Al-Isra',
  18: 'Al-Kahf',
  19: 'Maryam',
  20: 'Ta-Ha',
  21: 'Al-Anbya',
  22: 'Al-Hajj',
  23: "Al-Mu'minun",
  24: 'An-Nur',
  25: 'Al-Furqan',
  26: "Ash-Shu'ara",
  27: 'An-Naml',
  28: 'Al-Qasas',
  29: 'Al-Ankabut',
  30: 'Ar-Rum',
  31: 'Luqman',
  32: 'As-Sajdah',
  33: 'Al-Ahzab',
  34: 'Saba',
  35: 'Fatir',
  36: 'Ya-Sin',
  37: 'As-Saffat',
  38: 'Sad',
  39: 'Az-Zumar',
  40: 'Ghafir',
  41: 'Fussilat',
  42: 'Ash-Shuraa',
  43: 'Az-Zukhruf',
  44: 'Ad-Dukhan',
  45: 'Al-Jathiyah',
  46: 'Al-Ahqaf',
  47: 'Muhammad',
  48: 'Al-Fath',
  49: 'Al-Hujurat',
  50: 'Qaf',
  51: 'Adh-Dhariyat',
  52: 'At-Tur',
  53: 'An-Najm',
  54: 'Al-Qamar',
  55: 'Ar-Rahman',
  56: "Al-Waqi'ah",
  57: 'Al-Hadid',
  58: 'Al-Mujadila',
  59: 'Al-Hashr',
  60: 'Al-Mumtahanah',
  61: 'As-Saf',
  62: "Al-Jumu'ah",
  63: 'Al-Munafiqun',
  64: 'At-Taghabun',
  65: 'At-Talaq',
  66: 'At-Tahrim',
  67: 'Al-Mulk',
  68: 'Al-Qalam',
  69: 'Al-Haqqah',
  70: "Al-Ma'arij",
  71: 'Nuh',
  72: 'Al-Jinn',
  73: 'Al-Muzzammil',
  74: 'Al-Muddaththir',
  75: 'Al-Qiyamah',
  76: 'Al-Insan',
  77: 'Al-Mursalat',
  78: 'An-Naba',
  79: "An-Nazi'at",
  80: 'Abasa',
  81: 'At-Takwir',
  82: 'Al-Infitar',
  83: 'Al-Mutaffifin',
  84: 'Al-Inshiqaq',
  85: 'Al-Buruj',
  86: 'At-Tariq',
  87: "Al-A'la",
  88: 'Al-Ghashiyah',
  89: 'Al-Fajr',
  90: 'Al-Balad',
  91: 'Ash-Shams',
  92: 'Al-Layl',
  93: 'Ad-Duhaa',
  94: 'Ash-Sharh',
  95: 'At-Tin',
  96: 'Al-Alaq',
  97: 'Al-Qadr',
  98: 'Al-Bayyinah',
  99: 'Az-Zalzalah',
  100: 'Al-Adiyat',
  101: "Al-Qari'ah",
  102: 'At-Takathur',
  103: 'Al-Asr',
  104: 'Al-Humazah',
  105: 'Al-Fil',
  106: 'Quraysh',
  107: "Al-Ma'un",
  108: 'Al-Kawthar',
  109: 'Al-Kafirun',
  110: 'An-Nasr',
  111: 'Al-Masad',
  112: 'Al-Ikhlas',
  113: 'Al-Falaq',
  114: 'An-Nas',
};

export const SURAH_ARABIC: Record<number, string> = {
  1: 'الْفَاتِحَةُ',
  2: 'الْبَقَرَةُ',
  3: 'آلُ عِمْرَانَ',
  4: 'النِّسَاءُ',
  5: 'الْمَائِدَةُ',
  6: 'الْأَنْعَامُ',
  7: 'الْأَعْرَافُ',
  8: 'الْأَنْفَالُ',
  9: 'التَّوْبَةُ',
  10: 'يُونُسُ',
  11: 'هُودٌ',
  12: 'يُوسُفُ',
  13: 'الرَّعْدُ',
  14: 'إِبْرَاهِيمُ',
  15: 'الْحِجْرُ',
  16: 'النَّحْلُ',
  17: 'الْإِسْرَاءُ',
  18: 'الْكَهْفُ',
  19: 'مَرْيَمُ',
  20: 'طه',
  21: 'الْأَنْبِيَاءُ',
  22: 'الْحَجُّ',
  23: 'الْمُؤْمِنُونَ',
  24: 'النُّورُ',
  25: 'الْفُرْقَانُ',
  26: 'الشُّعَرَاءُ',
  27: 'النَّمْلُ',
  28: 'الْقَصَصُ',
  29: 'الْعَنْكَبُوتُ',
  30: 'الرُّومُ',
  31: 'لُقْمَانُ',
  32: 'السَّجْدَةُ',
  33: 'الْأَحْزَابُ',
  34: 'سَبَأٌ',
  35: 'فَاطِرٌ',
  36: 'يس',
  37: 'الصَّافَّاتُ',
  38: 'ص',
  39: 'الزُّمَرُ',
  40: 'غَافِرٌ',
  41: 'فُصِّلَتْ',
  42: 'الشُّورَىٰ',
  43: 'الزُّخْرُفُ',
  44: 'الدُّخَانُ',
  45: 'الْجَاثِيَةُ',
  46: 'الْأَحْقَافُ',
  47: 'مُحَمَّدٌ',
  48: 'الْفَتْحُ',
  49: 'الْحُجُرَاتُ',
  50: 'ق',
  51: 'الذَّارِيَاتُ',
  52: 'الطُّورُ',
  53: 'النَّجْمُ',
  54: 'الْقَمَرُ',
  55: 'الرَّحْمَٰنُ',
  56: 'الْوَاقِعَةُ',
  57: 'الْحَدِيدُ',
  58: 'الْمُجَادَلَةُ',
  59: 'الْحَشْرُ',
  60: 'الْمُمْتَحَنَةُ',
  61: 'الصَّفُّ',
  62: 'الْجُمُعَةُ',
  63: 'الْمُنَافِقُونَ',
  64: 'التَّغَابُنُ',
  65: 'الطَّلَاقُ',
  66: 'التَّحْرِيمُ',
  67: 'الْمُلْكُ',
  68: 'الْقَلَمُ',
  69: 'الْحَاقَّةُ',
  70: 'الْمَعَارِجُ',
  71: 'نُوحٌ',
  72: 'الْجِنُّ',
  73: 'الْمُزَّمِّلُ',
  74: 'الْمُدَّثِّرُ',
  75: 'الْقِيَامَةُ',
  76: 'الْإِنْسَانُ',
  77: 'الْمُرْسَلَاتُ',
  78: 'النَّبَأُ',
  79: 'النَّازِعَاتُ',
  80: 'عَبَسَ',
  81: 'التَّكْوِيرُ',
  82: 'الِانْفِطَارُ',
  83: 'الْمُطَفِّفِينَ',
  84: 'الِانْشِقَاقُ',
  85: 'الْبُرُوجُ',
  86: 'الطَّارِقُ',
  87: 'الْأَعْلَىٰ',
  88: 'الْغَاشِيَةُ',
  89: 'الْفَجْرُ',
  90: 'الْبَلَدُ',
  91: 'الشَّمْسُ',
  92: 'اللَّيْلُ',
  93: 'الضُّحَىٰ',
  94: 'الشَّرْحُ',
  95: 'التِّينُ',
  96: 'الْعَلَقُ',
  97: 'الْقَدْرُ',
  98: 'الْبَيِّنَةُ',
  99: 'الزَّلْزَلَةُ',
  100: 'الْعَادِيَاتُ',
  101: 'الْقَارِعَةُ',
  102: 'التَّكَاثُرُ',
  103: 'الْعَصْرُ',
  104: 'الْهُمَزَةُ',
  105: 'الْفِيلُ',
  106: 'قُرَيْشٌ',
  107: 'الْمَاعُونُ',
  108: 'الْكَوْثَرُ',
  109: 'الْكَافِرُونَ',
  110: 'النَّصْرُ',
  111: 'الْمَسَدُ',
  112: 'الْإِخْلَاصُ',
  113: 'الْفَلَقُ',
  114: 'النَّاسُ',
};

export const POPULAR_SURAHS = [67, 36, 18, 56, 55, 112, 113, 114, 1, 78];

export function getSurahSlug(number: number): string {
  return (SURAH_SIMPLE_NAMES[number] || `surah-${number}`)
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getSurahPath(number: number): string {
  return `/${getSurahSlug(number)}`;
}

/** Canonical reader href (slug URL). Optional hash targets a mounted ayah block. */
export function getSurahHref(number: number, opts?: { ayahId?: number | string; ayahNumber?: number }): string {
  const base = getSurahPath(number);
  if (opts?.ayahId != null) return `${base}#ayah-${opts.ayahId}`;
  if (opts?.ayahNumber != null) return `${base}#ayah-${opts.ayahNumber}`;
  return base;
}

export function getSurahNumberFromSlug(slug: string): number | null {
  for (let number = 1; number <= 114; number += 1) {
    if (getSurahSlug(number) === slug.toLowerCase()) return number;
  }
  return null;
}

export function getSurahMeta(number: number, fallbackName?: string): SurahMeta {
  return {
    nameSimple: fallbackName || SURAH_SIMPLE_NAMES[number] || `Surah ${number}`,
    nameArabic: SURAH_ARABIC[number] || '',
    meaning: SURAH_MEANINGS[number] || '',
  };
}

export function getSurahMeaning(number: number): string {
  return SURAH_MEANINGS[number] || '';
}

/** Vocalized Arabic surah name (with zair/zaber). Prefer this over API plain names. */
export function getSurahArabicName(number: number, fallback?: string | null): string {
  return SURAH_ARABIC[number] || fallback || '';
}

/** ISO-ish week of year (1–52/53). */
export function getWeekOfYear(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const day = Math.floor((date.getTime() - start.getTime()) / 86400000) + 1;
  return Math.min(52, Math.max(1, Math.ceil(day / 7)));
}

export type ReadingRef = { surah: number; ayah: number; nameSimple: string; nameArabic: string };

/** Approximate 52-week full-Quran schedule (≈2+ surahs/week). */
export function getWeekReading(
  week: number,
  ayahCounts?: Record<number, number>
): { week: number; start: ReadingRef; end: ReadingRef } {
  const w = Math.min(52, Math.max(1, week));
  const startSurah = Math.min(114, Math.floor(((w - 1) * 114) / 52) + 1);
  const endSurah = Math.min(114, Math.max(startSurah, Math.floor((w * 114) / 52)));
  const endAyah = ayahCounts?.[endSurah] || 1;
  const startMeta = getSurahMeta(startSurah);
  const endMeta = getSurahMeta(endSurah);
  return {
    week: w,
    start: {
      surah: startSurah,
      ayah: 1,
      nameSimple: startMeta.nameSimple,
      nameArabic: startMeta.nameArabic,
    },
    end: {
      surah: endSurah,
      ayah: endAyah,
      nameSimple: endMeta.nameSimple,
      nameArabic: endMeta.nameArabic,
    },
  };
}

/** Day of year (1–366). */
export function getDayOfYear(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.floor((date.getTime() - start.getTime()) / 86400000) + 1;
}

/** Deterministic day-of-year surah/ayah pick, spread across the full Quran. */
export function getDayReading(day: number): ReadingRef {
  const d = Math.min(365, Math.max(1, day));
  const surah = Math.min(114, Math.floor(((d - 1) * 114) / 365) + 1);
  const ayah = ((d - 1) % 7) + 1;
  const meta = getSurahMeta(surah);
  return { surah, ayah, nameSimple: meta.nameSimple, nameArabic: meta.nameArabic };
}

export function formatHijriDate(date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-US-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
}
