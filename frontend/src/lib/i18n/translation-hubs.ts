import type { ContentLocale } from '@/lib/i18n/content-locales';

export type TranslationHubId = 'english' | 'urdu' | 'pashto';

export type TranslationHubConfig = {
  id: TranslationHubId;
  path: string;
  locale: ContentLocale;
  title: string;
  metaDescription: string;
  keywords: string[];
  h1: string;
  intro: string;
  body: string[];
  featuresHeading: string;
  features: string[];
  surahIndexHeading: string;
  relatedHeading: string;
  relatedLinks: { label: string; href: string; hrefLang?: string }[];
};

export const TRANSLATION_HUBS: Record<TranslationHubId, TranslationHubConfig> = {
  english: {
    id: 'english',
    path: '/quran-english-translation',
    locale: 'en',
    title: 'Quran English Translation – Read All 114 Surahs Online',
    metaDescription:
      'Read the Holy Quran with Saheeh International English translation. Browse all 114 surahs with Arabic Uthmani text, verse-by-verse audio, and clear chapter meanings.',
    keywords: [
      'Quran English translation',
      'read Quran in English',
      'Saheeh International',
      'Quran with English translation',
      'Holy Quran English',
    ],
    h1: 'Quran English Translation',
    intro:
      'Read the complete Holy Quran online with Saheeh International English translation alongside authentic Uthmani Arabic text. Every surah page is server-rendered with full verse text — not a client-side language toggle — so search engines and readers get the same content.',
    body: [
      'Saheeh International is one of the most widely read English renderings of the Quran. On QuranPilot each of the 114 chapters opens with Arabic script, an English translation aligned to Saheeh International, and optional verse-by-verse recitation from trusted qaris.',
      'Use the index below to jump straight to any surah — from Al-Fatihah and Al-Baqarah to Ya-Sin, Al-Kahf, and the short surahs of Juz Amma. You can also browse by juz, follow a learning plan, or open the Urdu and Pashto translation hubs if you read in those languages.',
    ],
    featuresHeading: 'What you get on every English surah page',
    features: [
      'Uthmani Arabic text with verse numbers',
      'Saheeh International English translation',
      'Verse-by-verse audio from multiple reciters',
      'Word-by-word meanings, bookmarks, and reading progress',
    ],
    surahIndexHeading: 'All 114 surahs in English',
    relatedHeading: 'Other Quran translations on QuranPilot',
    relatedLinks: [
      { label: 'Quran Urdu translation hub', href: '/quran-urdu-translation' },
      { label: 'Quran Pashto translation hub', href: '/quran-pashto-translation' },
      { label: 'Full surah directory', href: '/surahs' },
      { label: 'Learning plans', href: '/learning-plans' },
    ],
  },

  urdu: {
    id: 'urdu',
    path: '/quran-urdu-translation',
    locale: 'ur',
    title: 'Quran Urdu Translation – Read All 114 Surahs Online',
    metaDescription:
      'Read the Holy Quran with Urdu translation online. All 114 surahs with Arabic Uthmani text, Urdu tarjuma, and verse-by-verse audio on QuranPilot.',
    keywords: [
      'Quran Urdu translation',
      'Quran in Urdu',
      'Urdu tarjuma Quran',
      'read Quran online Urdu',
      'قرآن اردو ترجمہ',
    ],
    h1: 'Quran Urdu Translation',
    intro:
      'Read the complete Holy Quran with Urdu translation on QuranPilot. Each surah has its own URL with Arabic Uthmani text and Urdu tarjuma rendered on the server — genuine language-specific pages that link into all 114 chapters.',
    body: [
      'قرآن مجید کی تمام 114 سورتیں یہاں سے کھولیں — ہر صفحے پر عربی عثمانی متن، اردو ترجمہ، اور آیت بہ آیت آڈیو دستیاب ہے۔ لفظ بہ لفظ معانی اور تجوید کے اسباق بھی سیکھنے میں مدد دیتے ہیں۔',
      'Popular chapters such as Surah Yaseen, Surah Al-Kahf, and Surah Al-Mulk are included with the same full Urdu translation experience. For the Urdu homepage with additional navigation, visit the /ur hub.',
    ],
    featuresHeading: 'ہر اردو سورت صفحے پر',
    features: [
      'عربی عثمانی متن',
      'اردو ترجمہ (ہر آیت کے ساتھ)',
      'آیت بہ آیت تلاوت',
      'محفوظ bookmarks اور پڑھنے کا ہدف',
    ],
    surahIndexHeading: 'تمام 114 سورتیں — اردو ترجمہ',
    relatedHeading: 'متعلقہ صفحات',
    relatedLinks: [
      { label: 'اردو قرآن ہوم', href: '/ur', hrefLang: 'ur' },
      { label: 'English translation hub', href: '/quran-english-translation', hrefLang: 'en' },
      { label: 'Pashto translation hub', href: '/quran-pashto-translation', hrefLang: 'ps' },
      { label: 'Learning plans', href: '/learning-plans' },
    ],
  },

  pashto: {
    id: 'pashto',
    path: '/quran-pashto-translation',
    locale: 'ps',
    title: 'قرآن پښتو ژباړه – ټولې ۱۱۴ سورتونه آنلاین ولولئ',
    metaDescription:
      'Read the Holy Quran with Pashto translation online. All 114 surahs with Arabic Uthmani text, Pashto tarjuma, and verse-by-verse audio on QuranPilot.',
    keywords: [
      'Quran Pashto translation',
      'Quran in Pashto',
      'Pashto tarjuma Quran',
      'read Quran online Pashto',
      'قرآن پښتو ژباړه',
    ],
    h1: 'Quran Pashto Translation',
    intro:
      'Read the complete Holy Quran with Pashto translation on QuranPilot. Every surah has a dedicated page with Arabic Uthmani script and Pashto tarjuma in crawlable HTML — not a JavaScript-only translation switch.',
    body: [
      'د قرآن کریم ټولې ۱۱۴ سورتونه دلته پرانیزئ — په هر پاڼه کې عربي عثماني متن، پښتو ژباړه، او آیت په آیت غږ شامل دی. د یادولو، شپه او ورځني لوستلو لپاره لنډې سورتونه هم په بشپړ پښتو متن سره موجودې دي.',
      'For navigation in Pashto with the full locale homepage, visit /ps. English and Urdu translation hubs are also available if you read in those languages.',
    ],
    featuresHeading: 'په هر پښتو سورت پاڼه کې',
    features: [
      'عربي عثماني متن',
      'پښتو ژباړه (هرې آیت سره)',
      'آیت په آیت تلاوت',
      'خوندي bookmarks او لوستلو هدف',
    ],
    surahIndexHeading: 'ټولې ۱۱۴ سورتونه — پښتو ژباړه',
    relatedHeading: 'اړوند پاڼې',
    relatedLinks: [
      { label: 'پښتو قرآن کریم', href: '/ps', hrefLang: 'ps' },
      { label: 'English translation hub', href: '/quran-english-translation', hrefLang: 'en' },
      { label: 'Urdu translation hub', href: '/quran-urdu-translation', hrefLang: 'ur' },
      { label: 'Learning plans', href: '/learning-plans' },
    ],
  },
};

export function getTranslationHub(id: TranslationHubId): TranslationHubConfig {
  return TRANSLATION_HUBS[id];
}
