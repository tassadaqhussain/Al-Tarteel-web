/**
 * Surah aliases and famous verse references for voice search & command parsing.
 * Supports English, Arabic, Urdu, and Roman Urdu.
 */

import { SURAH_ARABIC, SURAH_SIMPLE_NAMES, SURAH_MEANINGS } from '@/lib/surah-meta';

export interface SurahVoiceAlias {
  number: number;
  nameSimple: string;
  nameArabic: string;
  meaning: string;
  aliases: string[];
}

/** Famous Quranic verse/phrase aliases pointing to specific Surah + Ayah references */
export const FAMOUS_VERSE_ALIASES: Record<string, { surahNumber: number; ayahNumber: number; title: string }> = {
  // Ayatul Kursi
  'ayatul kursi': { surahNumber: 2, ayahNumber: 255, title: 'Ayat al-Kursi' },
  'ayat al kursi': { surahNumber: 2, ayahNumber: 255, title: 'Ayat al-Kursi' },
  'ayatal kursi': { surahNumber: 2, ayahNumber: 255, title: 'Ayat al-Kursi' },
  'ayat ul kursi': { surahNumber: 2, ayahNumber: 255, title: 'Ayat al-Kursi' },
  'throne verse': { surahNumber: 2, ayahNumber: 255, title: 'Ayat al-Kursi' },
  'آیت الکرسی': { surahNumber: 2, ayahNumber: 255, title: 'Ayat al-Kursi' },
  'آیۃ الکرسی': { surahNumber: 2, ayahNumber: 255, title: 'Ayat al-Kursi' },

  // Amanar Rasulu
  'amanar rasulu': { surahNumber: 2, ayahNumber: 285, title: 'Amanar Rasulu' },
  'amana rasulu': { surahNumber: 2, ayahNumber: 285, title: 'Amanar Rasulu' },
  'آمن الرسول': { surahNumber: 2, ayahNumber: 285, title: 'Amanar Rasulu' },

  // Surah Yaseen starting verse
  'yaseen wal quranil hakim': { surahNumber: 36, ayahNumber: 1, title: 'Surah Ya-Sin' },
  'یس والقرآن الحکیم': { surahNumber: 36, ayahNumber: 1, title: 'Surah Ya-Sin' },

  // Surah Mulk opening
  'tabarakalladhi biyadihil mulk': { surahNumber: 67, ayahNumber: 1, title: 'Surah Al-Mulk' },
  'تبارك الذي بيده الملك': { surahNumber: 67, ayahNumber: 1, title: 'Surah Al-Mulk' },

  // Last 2 verses of Baqarah
  'last verses of baqarah': { surahNumber: 2, ayahNumber: 285, title: 'Surah Al-Baqarah 2:285' },
};

/** Known aliases for surahs in Roman Urdu, English, Urdu */
const CUSTOM_SURAH_ALIASES: Record<number, string[]> = {
  1: ['fatiha', 'fateha', 'fateh', 'fatha', 'opening', 'al fatiha', 'al fateh', 'فاتحہ', 'سورة الفاتحة'],
  2: ['baqarah', 'baqara', 'bakara', 'baqra', 'cow', 'بقرة', 'البقرة'],
  3: ['imran', 'ali imran', 'aal imran', 'imraan', 'عمران', 'آل عمران'],
  4: ['nisa', 'nesa', 'women', 'نساء', 'النساء'],
  5: ['maidah', 'maida', 'table spread', 'مائدة', 'المائدة'],
  6: ['anam', 'anaam', 'cattle', 'انعام', 'الأنعام'],
  7: ['araf', 'araaf', 'heights', 'اعراف', 'الأعراف'],
  8: ['anfal', 'anfaal', 'spoils', 'انفال', 'الأنفال'],
  9: ['tawbah', 'tawba', 'toba', 'repentance', 'توبة', 'التوبة'],
  10: ['yunus', 'yunas', 'jonah', 'يونس'],
  11: ['hud', 'hood', 'هود'],
  12: ['yusuf', 'yousuf', 'yusef', 'joseph', 'يوسف'],
  13: ['rad', "ra'd", 'thunder', 'رعد', 'الرعد'],
  14: ['ibrahim', 'ibraheem', 'abraham', 'إبراهيم'],
  15: ['hijr', 'rocky tract', 'حجر', 'الحجر'],
  16: ['nahl', 'bee', 'نحل', 'النحل'],
  17: ['isra', 'israa', 'bani israel', 'night journey', 'إسراء', 'الإسراء', 'بني إسرائيل'],
  18: ['kahf', 'kahaf', 'cave', 'کہف', 'الكهف'],
  19: ['maryam', 'mariam', 'mary', 'مریم', 'مريم'],
  20: ['taha', 'ta ha', 'طه'],
  21: ['anbiya', 'anbya', 'prophets', 'أنبياء', 'الأنبياء'],
  22: ['hajj', 'pilgrimage', 'حج', 'الحج'],
  23: ['muminun', 'mominun', 'believers', 'مؤمنون', 'المؤمنون'],
  24: ['nur', 'noor', 'light', 'نور', 'النور'],
  25: ['furqan', 'criterion', 'فرقان', 'الفرقان'],
  26: ['shuara', 'poets', 'شعراء', 'الشعراء'],
  27: ['naml', 'ant', 'نمل', 'النمل'],
  28: ['qasas', 'stories', 'قصص', 'القصص'],
  29: ['ankabut', 'spider', 'عنكبوت', 'العنكبوت'],
  30: ['rum', 'romans', 'روم', 'الروم'],
  31: ['luqman', 'lokman', 'لقمان'],
  32: ['sajdah', 'sajda', 'prostration', 'سجدة', 'السجدة'],
  33: ['ahzab', 'combined forces', 'أحزاب', 'الأحزاب'],
  34: ['saba', 'sheba', 'سبأ'],
  35: ['fatir', 'originator', 'فاطر'],
  36: ['yasin', 'yaseen', 'ya sin', 'ya seen', 'یاسین', 'يس'],
  37: ['saffat', 'ranks', 'صافات', 'الصافات'],
  38: ['sad', 'saad', 'ص'],
  39: ['zumar', 'troops', 'زمر', 'الزمر'],
  40: ['ghafir', 'mumin', 'forgiver', 'غافر'],
  41: ['fussilat', 'ha mim sajdah', 'فصلت'],
  42: ['shura', 'shuraa', 'consultation', 'شورى', 'الشورى'],
  43: ['zukhruf', 'gold ornaments', 'زخرف', 'الزخرف'],
  44: ['dukhan', 'smoke', 'دخان', 'الدخان'],
  45: ['jathiyah', 'jathiya', 'crouching', 'جاثية', 'الجاثية'],
  46: ['ahqaf', 'sandhills', 'أحقاف', 'الأحقاف'],
  47: ['muhammad', 'mohammad', 'محمد'],
  48: ['fath', 'fateh', 'victory', 'فتح', 'الفتح'],
  49: ['hujurat', 'rooms', 'حجرات', 'الحجرات'],
  50: ['qaf', 'qaaf', 'ق'],
  51: ['dhariyat', 'winnowing winds', 'ذاريات', 'الذاريات'],
  52: ['tur', 'toor', 'mount', 'طور', 'الطور'],
  53: ['najm', 'star', 'نجم', 'النجم'],
  54: ['qamar', 'moon', 'قمر', 'القمر'],
  55: ['rahman', 'rehman', 'ar rahman', 'beneficent', 'رحمن', 'الرحمن'],
  56: ['waqiah', 'waqiya', 'inevitable', 'واقعة', 'الواقعة'],
  57: ['hadid', 'hadeed', 'iron', 'حديد', 'الحديد'],
  58: ['mujadila', 'pleading woman', 'مجادلة', 'المجادلة'],
  59: ['hashr', 'exile', 'حشر', 'الحشر'],
  60: ['mumtahanah', 'examined', 'ممتحنة', 'الممتحنة'],
  61: ['saf', 'saff', 'ranks', 'صف', 'الصف'],
  62: ['jumuah', 'jummah', 'friday', 'congregation', 'جمعة', 'الجمعة'],
  63: ['munafiqun', 'hypocrites', 'منافقون', 'المنافقون'],
  64: ['taghabun', 'mutual disillusion', 'تغابن', 'التغابن'],
  65: ['talaq', 'divorce', 'طلاق', 'الطلاق'],
  66: ['tahrim', 'prohibition', 'تحريم', 'التحريم'],
  67: ['mulk', 'sovereignty', 'dominion', 'ملک', 'الملك'],
  68: ['qalam', 'pen', 'nun', 'قلم', 'القلم'],
  69: ['haqqah', 'reality', 'حاقة', 'الحاقة'],
  70: ['maarij', 'ascending stairways', 'معارج', 'المعارج'],
  71: ['nuh', 'nooh', 'noah', 'نوح'],
  72: ['jinn', 'spirits', 'جن', 'الجن'],
  73: ['muzzammil', 'enshrouded one', 'مزمل', 'المزمل'],
  74: ['muddaththir', 'cloaked one', 'مدثر', 'المدثر'],
  75: ['qiyamah', 'resurrection', 'قیامة', 'القيامة'],
  76: ['insan', 'dahr', 'man', 'إنسان', 'الإنسان'],
  77: ['mursalat', 'emissaries', 'مرسلات', 'المرسلات'],
  78: ['naba', 'tidings', 'نبأ', 'النبأ'],
  79: ['naziat', 'drag forth', 'نازعات', 'النازعات'],
  80: ['abasa', 'he frowned', 'عبس'],
  81: ['takwir', 'overthrowing', 'تكوير', 'التكوير'],
  82: ['infitar', 'cleaving', 'انفطار', 'الانفطار'],
  83: ['mutaffifin', 'defrauding', 'مطففين', 'المطففين'],
  84: ['inshiqaq', 'sundering', 'انشقاق', 'الانشقاق'],
  85: ['buruj', 'constellations', 'بروج', 'البروج'],
  86: ['tariq', 'nightcomer', 'طارق', 'الطارق'],
  87: ['ala', 'most high', 'أعلى', 'الأعلى'],
  88: ['ghashiyah', 'overwhelming', 'غاشية', 'الغاشية'],
  89: ['fajr', 'dawn', 'فجر', 'الفجر'],
  90: ['balad', 'city', 'بلد', 'البلد'],
  91: ['shams', 'sun', 'شمس', 'الشمس'],
  92: ['layl', 'night', 'ليل', 'الليل'],
  93: ['duha', 'duhaa', 'morning hours', 'ضحى', 'الضحى'],
  94: ['sharh', 'inshirah', 'relief', 'شرح', 'الشرح'],
  95: ['tin', 'teen', 'fig', 'تين', 'التين'],
  96: ['alaq', 'iqra', 'clot', 'علق', 'العلق'],
  97: ['qadr', 'power', 'laylatul qadr', 'قدر', 'القدر'],
  98: ['bayyinah', 'clear proof', 'بينة', 'البينة'],
  99: ['zalzalah', 'zilzal', 'earthquake', 'زلزلة', 'الزلزلة'],
  100: ['adiyat', 'courser', 'عاديات', 'العاديات'],
  101: ['qariah', 'calamity', 'قارعة', 'القارعة'],
  102: ['takathur', 'rivalry', 'تكاثر', 'التكاثر'],
  103: ['asr', 'declining day', 'time', 'عصر', 'العصر'],
  104: ['humazah', 'traducer', 'همزة', 'الهمزة'],
  105: ['fil', 'feel', 'elephant', 'فيل', 'الفيل'],
  106: ['quraysh', 'quraish', 'قريش'],
  107: ['maun', 'small kindnesses', 'ماعون', 'الماعون'],
  108: ['kawthar', 'kauthar', 'abundance', 'كوثر', 'الكوثر'],
  109: ['kafirun', 'disbelievers', 'كافرون', 'الكافرون'],
  110: ['nasr', 'divine support', 'نصر', 'النصر'],
  111: ['masad', 'lahab', 'palm fiber', 'مسد', 'المسد'],
  112: ['ikhlas', 'sincerity', 'tawhid', 'إخلاص', 'الإخلاص'],
  113: ['falaq', 'daybreak', 'فلق', 'الفلق'],
  114: ['nas', 'mankind', 'people', 'ناس', 'الناس'],
};

export const SURAH_VOICE_CATALOG: SurahVoiceAlias[] = Array.from({ length: 114 }, (_, i) => {
  const number = i + 1;
  const nameSimple = SURAH_SIMPLE_NAMES[number] || `Surah ${number}`;
  const nameArabic = SURAH_ARABIC[number] || '';
  const meaning = SURAH_MEANINGS[number] || '';
  const custom = CUSTOM_SURAH_ALIASES[number] || [];

  const aliases = [
    nameSimple.toLowerCase(),
    nameSimple.toLowerCase().replace(/[^a-z0-9]/g, ''),
    meaning.toLowerCase(),
    ...custom.map((c) => c.toLowerCase()),
  ];

  return {
    number,
    nameSimple,
    nameArabic,
    meaning,
    aliases,
  };
});
