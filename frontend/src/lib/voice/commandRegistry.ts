/**
 * Registry of global application navigation routes, player commands, and translation options.
 */

export interface NavRoute {
  id: string;
  path: string;
  label: string;
  keywords: string[];
}

export const GLOBAL_NAV_ROUTES: NavRoute[] = [
  {
    id: 'home',
    path: '/',
    label: 'Home',
    keywords: ['home', 'home page', 'main', 'start', 'گھر', 'ہوم', 'ہوم پیج', 'main page'],
  },
  {
    id: 'quran',
    path: '/surahs',
    label: 'Quran',
    keywords: ['quran', 'read quran', 'surahs', 'chapters', 'read', 'قرآن', 'قرآن پڑھیں', 'سورتیں', 'surah list'],
  },
  {
    id: 'bookmarks',
    path: '/bookmarks',
    label: 'Bookmarks',
    keywords: ['bookmarks', 'bookmark', 'saved', 'saved verses', 'بک مارک', 'بک مارکس', 'تلاش شدہ'],
  },
  {
    id: 'my-quran',
    path: '/my-quran',
    label: 'My Quran',
    keywords: ['my quran', 'personal quran', 'my saved', 'مائی قرآن'],
  },
  {
    id: 'tajweed',
    path: '/tajweed',
    label: 'Tajweed',
    keywords: ['tajweed', 'tajweed rules', 'tajweeed', 'تجویید', 'تجویيد'],
  },
  {
    id: 'daily',
    path: '/an-nas',
    label: 'Daily Ayah',
    keywords: ['daily ayah', 'daily verse', 'today verse', 'verse of the day', 'روزانہ کی آیت', 'ڈیلی آیت'],
  },
  {
    id: 'profile',
    path: '/profile',
    label: 'Profile',
    keywords: ['profile', 'my profile', 'account', 'user profile', 'پروفائل', 'اکاؤنٹ', 'میرا پروفائل'],
  },
  {
    id: 'settings',
    path: '/settings',
    label: 'Settings',
    keywords: ['settings', 'preferences', 'options', 'سیٹنگز', 'ترتیبات'],
  },
  {
    id: 'quran-in-year',
    path: '/quran-in-year',
    label: 'Quran in a Year',
    keywords: ['quran in a year', 'quran in year', 'year journey', 'ایک سال میں قرآن'],
  },
  {
    id: 'learning-plans',
    path: '/learning-plans',
    label: 'Learning Plans',
    keywords: ['learning plans', 'plans', 'courses', 'تعلیمی منصوبے'],
  },
  {
    id: 'donate',
    path: '/donate',
    label: 'Donate',
    keywords: ['donate', 'donation', 'support', 'عطیہ'],
  },
];

export interface PlayerCommandSpec {
  command: 'play' | 'pause' | 'continue' | 'next' | 'prev' | 'repeat' | 'repeat_count' | 'play_from_here';
  keywords: string[];
}

export const PLAYER_COMMANDS: PlayerCommandSpec[] = [
  {
    command: 'play',
    keywords: ['play', 'start recitation', 'chalao', 'chalaen', 'شروع کریں', 'چلاؤ', 'تلاوت', 'play audio'],
  },
  {
    command: 'pause',
    keywords: ['pause', 'stop', 'hold', 'rok do', 'roko', 'روک دیں', 'روکو', 'اسٹاپ'],
  },
  {
    command: 'continue',
    keywords: ['continue', 'resume', 'jari rakho', 'جاری رکھیں', 'دوبارہ'],
  },
  {
    command: 'next',
    keywords: ['next ayah', 'next verse', 'agli ayah', 'agla verse', 'اگلی آیت', 'آگے'],
  },
  {
    command: 'prev',
    keywords: ['previous ayah', 'prev ayah', 'pichli ayah', 'پچھلی آیت', 'پیچھے'],
  },
  {
    command: 'repeat',
    keywords: ['repeat ayah', 'repeat verse', 'dohrao', 'دہرائیں', 'دوبارہ پڑھیں', 'repeat this ayah'],
  },
];

export interface TranslationCommandSpec {
  keywords: string[];
  action: 'show' | 'hide' | 'set_lang';
  language?: string;
}

export const TRANSLATION_COMMANDS: TranslationCommandSpec[] = [
  {
    keywords: ['show translation', 'display translation', 'tarjuma dikhao', 'ترجمہ دکھائیں'],
    action: 'show',
  },
  {
    keywords: ['hide translation', 'tarjuma chhupao', 'ترجمہ چھپائیں'],
    action: 'hide',
  },
  {
    keywords: ['show urdu translation', 'urdu translation', 'urdu tarjuma', 'اردو ترجمہ'],
    action: 'set_lang',
    language: 'ur',
  },
  {
    keywords: ['show english translation', 'english translation', 'انگریزی ترجمہ'],
    action: 'set_lang',
    language: 'en',
  },
  {
    keywords: ['show tafsir', 'tafsir dikhao', 'تفسیر'],
    action: 'show',
    language: 'tafsir',
  },
];
