import type { PrefixedLocale } from '@/lib/i18n/content-locales';

/**
 * Landing copy for each locale hub (/ur, /ps, /fa).
 *
 * These hubs are the "Quran with <language> translation" pages. They carry real
 * prose so the page is genuinely differentiated rather than being Quran text
 * under a translated heading — which is what makes a locale URL worth indexing
 * at all. Copy is intentionally short and factual; a native speaker should
 * review it before it is treated as final marketing text.
 */

export type LocaleLanding = {
  /** Page <h1>. */
  heading: string;
  /** SEO title (site name is appended by buildPageMetadata). */
  title: string;
  metaDescription: string;
  /** Lead paragraph shown under the heading. */
  intro: string;
  /** Supporting paragraphs. */
  body: string[];
  /** Heading above the 114-surah index. */
  surahIndexHeading: string;
  /** Label for links into a surah. */
  readLabel: string;
  /** Heading above the other-language links. */
  otherLanguagesHeading: string;
};

export const LOCALE_LANDING: Record<PrefixedLocale, LocaleLanding> = {
  ur: {
    heading: 'قرآن مجید اردو ترجمہ کے ساتھ',
    title: 'قرآن مجید اردو ترجمہ کے ساتھ – آن لائن پڑھیں اور سنیں',
    metaDescription:
      'قرآن مجید کی تمام 114 سورتیں عربی عثمانی متن، اردو ترجمہ اور آیت بہ آیت آڈیو کے ساتھ آن لائن پڑھیں اور سنیں۔',
    intro:
      'یہاں آپ قرآن مجید کی تمام 114 سورتیں عربی عثمانی متن کے ساتھ پڑھ سکتے ہیں، ہر آیت کا اردو ترجمہ دیکھ سکتے ہیں اور آیت بہ آیت تلاوت سن سکتے ہیں۔',
    body: [
      'ہر سورت کا صفحہ مکمل عربی متن، ساتھ ساتھ اردو ترجمہ اور معیاری قاریوں کی تلاوت فراہم کرتا ہے۔ آپ کسی بھی آیت کو دہرا سکتے ہیں، اسے محفوظ کر سکتے ہیں یا مختلف تراجم کا موازنہ کر سکتے ہیں۔',
      'لفظ بہ لفظ معنی کی سہولت سیکھنے والوں کے لیے خاص طور پر مفید ہے، جبکہ تجوید کے اسباق درست تلفظ میں مدد دیتے ہیں۔ پڑھنے کی رفتار اور روزانہ کا ہدف بھی محفوظ رہتا ہے۔',
    ],
    surahIndexHeading: 'تمام سورتیں',
    readLabel: 'پڑھیں',
    otherLanguagesHeading: 'دیگر زبانیں',
  },
  ps: {
    heading: 'قرآن کریم د پښتو ژباړې سره',
    title: 'قرآن کریم د پښتو ژباړې سره – آنلاین ولولئ او واورئ',
    metaDescription:
      'د قرآن کریم ټولې ۱۱۴ سورتونه د عربي عثماني متن، پښتو ژباړې او آیت په آیت غږ سره آنلاین ولولئ او واورئ.',
    intro:
      'دلته تاسو کولی شئ د قرآن کریم ټولې ۱۱۴ سورتونه د عربي عثماني متن سره ولولئ، د هرې آیت پښتو ژباړه وګورئ او آیت په آیت تلاوت واورئ.',
    body: [
      'د هرې سورت پاڼه بشپړ عربي متن، ورسره پښتو ژباړه او د معیاري قاریانو تلاوت وړاندې کوي. تاسو کولی شئ هره آیت تکرار کړئ، خوندي یې کړئ یا مختلفې ژباړې پرتله کړئ.',
      'د کلمې په کلمه معنی زده کوونکو ته ډېره ګټوره ده، او د تجوید زده کړې په سم تلفظ کې مرسته کوي. ستاسو د لوستلو پرمختګ او ورځنی هدف هم خوندي پاتې کېږي.',
    ],
    surahIndexHeading: 'ټول سورتونه',
    readLabel: 'ولولئ',
    otherLanguagesHeading: 'نورې ژبې',
  },
  fa: {
    heading: 'قرآن کریم با ترجمه فارسی',
    title: 'قرآن کریم با ترجمه فارسی – آنلاین بخوانید و گوش دهید',
    metaDescription:
      'هر ۱۱۴ سوره قرآن کریم را با متن عثمانی عربی، ترجمه فارسی و صوت آیه به آیه به صورت آنلاین بخوانید و گوش دهید.',
    intro:
      'در اینجا می‌توانید هر ۱۱۴ سوره قرآن کریم را با متن عثمانی عربی بخوانید، ترجمه فارسی هر آیه را ببینید و تلاوت آیه به آیه را بشنوید.',
    body: [
      'صفحه هر سوره متن کامل عربی، ترجمه فارسی در کنار آن، و تلاوت قاریان برجسته را ارائه می‌دهد. می‌توانید هر آیه را تکرار کنید، آن را ذخیره کنید یا ترجمه‌های مختلف را مقایسه کنید.',
      'معنای کلمه به کلمه برای زبان‌آموزان بسیار مفید است و درس‌های تجوید به تلفظ درست کمک می‌کند. پیشرفت مطالعه و هدف روزانه شما نیز ذخیره می‌شود.',
    ],
    surahIndexHeading: 'همه سوره‌ها',
    readLabel: 'بخوانید',
    otherLanguagesHeading: 'زبان‌های دیگر',
  },
};
