import { getSurahLocalizedName } from '@/lib/i18n/surah-localized-names';
import { localePath, type ContentLocale } from '@/lib/i18n/content-locales';
import { getSurahMeta } from '@/lib/surah-meta';

/**
 * Topic landing pages that match real searches ("4 Quls", "surahs before sleeping", …).
 * English and Urdu only. Everything here is descriptive — no rulings, no hadith text, no virtue
 * claims. Wording needs review by a qualified person before it is treated as final.
 */
export type TopicLocale = 'en' | 'ur';
export const TOPIC_LOCALES: readonly TopicLocale[] = ['en', 'ur'];

export type TopicSlug =
  | '4-quls'
  | 'surahs-to-read-on-friday'
  | 'surahs-before-sleeping'
  | 'manzil'
  | 'short-surahs-for-prayer';

/** Ayahs shown inline. Omit `from`/`to` for the whole surah. */
export type TopicInline = { surah: number; from?: number; to?: number };

type TopicCopy = {
  /** Meta title, without the brand suffix. */
  title: string;
  h1: string;
  description: string;
  intro: string[];
  /** Short link label for homepage / related-topic lists. */
  label: string;
};

export type Topic = {
  slug: TopicSlug;
  /** Surahs this topic is about — also drives "related topics" links on surah pages. */
  surahs: number[];
  inline: TopicInline[];
  copy: Record<TopicLocale, TopicCopy>;
};

/** Traditional seven manzils (stages), one per day to finish the Quran in a week. */
export const MANZILS: readonly { n: number; start: [number, number]; end: [number, number] }[] = [
  { n: 1, start: [1, 1], end: [4, 176] },
  { n: 2, start: [5, 1], end: [9, 129] },
  { n: 3, start: [10, 1], end: [16, 128] },
  { n: 4, start: [17, 1], end: [25, 77] },
  { n: 5, start: [26, 1], end: [36, 83] },
  { n: 6, start: [37, 1], end: [49, 18] },
  { n: 7, start: [50, 1], end: [114, 6] },
];

export function manzilSpanLabel(locale: TopicLocale, m: (typeof MANZILS)[number]): string {
  const name = (s: number) =>
    locale === 'ur' ? getSurahLocalizedName(s, 'ur') : getSurahMeta(s).nameSimple;
  const a = `${name(m.start[0])} ${m.start[0]}:${m.start[1]}`;
  const b = `${name(m.end[0])} ${m.end[0]}:${m.end[1]}`;
  return locale === 'ur' ? `${a} سے ${b} تک` : `${a} – ${b}`;
}

export const TOPICS: readonly Topic[] = [
  {
    slug: '4-quls',
    surahs: [109, 112, 113, 114],
    inline: [{ surah: 109 }, { surah: 112 }, { surah: 113 }, { surah: 114 }],
    copy: {
      en: {
        title: '4 Quls – Al-Kafirun, Al-Ikhlas, Al-Falaq & An-Nas with Translation & Audio',
        h1: 'The 4 Quls: Al-Kafirun, Al-Ikhlas, Al-Falaq and An-Nas',
        label: '4 Quls',
        description:
          'Read the 4 Quls — Surah Al-Kafirun, Al-Ikhlas, Al-Falaq and An-Nas — with Arabic text, English translation and verse-by-verse audio on QuranPilot.',
        intro: [
          'The 4 Quls are four short surahs of the Quran whose opening verse begins with the word “Qul” (Say): Surah Al-Kafirun (109), Surah Al-Ikhlas (112), Surah Al-Falaq (113) and Surah An-Nas (114).',
          'Because they are short, they are among the first chapters many Muslims memorise, and they are commonly recited in prayer and daily remembrance. Below you can read all four in full with translation, then open any surah for audio, word meanings and more.',
        ],
      },
      ur: {
        title: 'چار قل (4 Quls) – الکافرون، الاخلاص، الفلق اور الناس اردو ترجمہ کے ساتھ',
        h1: 'چار قل: سورہ الکافرون، الاخلاص، الفلق اور الناس',
        label: 'چار قل',
        description:
          'چار قل — سورہ الکافرون، الاخلاص، الفلق اور الناس — عربی متن، اردو ترجمہ اور آیت بہ آیت تلاوت کے ساتھ QuranPilot پر پڑھیں۔',
        intro: [
          'چار قل قرآن مجید کی وہ چار مختصر سورتیں ہیں جن کی پہلی آیت لفظ «قُل» سے شروع ہوتی ہے: سورہ الکافرون (109)، سورہ الاخلاص (112)، سورہ الفلق (113) اور سورہ الناس (114)۔',
          'مختصر ہونے کی وجہ سے یہ ان پہلی سورتوں میں سے ہیں جو بہت سے مسلمان یاد کرتے ہیں، اور نماز اور روزمرہ اذکار میں عام طور پر پڑھی جاتی ہیں۔ نیچے چاروں سورتیں مکمل اردو ترجمہ کے ساتھ دی گئی ہیں؛ تلاوت اور مزید تفصیل کے لیے کسی بھی سورت کا مکمل صفحہ کھولیں۔',
        ],
      },
    },
  },
  {
    slug: 'surahs-to-read-on-friday',
    surahs: [18],
    inline: [{ surah: 18, from: 1, to: 10 }],
    copy: {
      en: {
        title: 'Surah Al-Kahf on Friday – Read with English Translation & Audio',
        h1: 'Surahs to Read on Friday: Surah Al-Kahf',
        label: 'Surahs to read on Friday',
        description:
          'Surah Al-Kahf (18) is the surah many Muslims read on Fridays. Read its opening verses with translation here, then continue to the full surah with audio.',
        intro: [
          'Many Muslims make it a habit to read Surah Al-Kahf (chapter 18, “The Cave”) on Fridays. This habit is based on reports from the Sunnah; if you want the details or the strength of a particular narration, please consult a qualified scholar.',
          'Surah Al-Kahf has 110 verses. The opening ten verses are shown below with translation, followed by a link to the complete surah with audio so you can read it in one sitting or in parts through the day.',
        ],
      },
      ur: {
        title: 'جمعہ کے دن سورہ الکہف – اردو ترجمہ اور تلاوت کے ساتھ',
        h1: 'جمعہ کے دن پڑھی جانے والی سورتیں: سورہ الکہف',
        label: 'جمعہ کے دن پڑھی جانے والی سورتیں',
        description:
          'سورہ الکہف (18) وہ سورت ہے جسے بہت سے مسلمان جمعہ کے دن پڑھتے ہیں۔ ابتدائی آیات اردو ترجمہ کے ساتھ یہاں پڑھیں، پھر تلاوت کے ساتھ مکمل سورت کھولیں۔',
        intro: [
          'بہت سے مسلمان جمعہ کے دن سورہ الکہف (سورت نمبر 18) پڑھنے کا معمول رکھتے ہیں۔ یہ معمول سنت سے منقول روایات پر مبنی ہے؛ کسی خاص روایت کی تفصیل یا درجہ جاننے کے لیے کسی مستند عالم سے رجوع کریں۔',
          'سورہ الکہف کی 110 آیات ہیں۔ نیچے ابتدائی دس آیات اردو ترجمہ کے ساتھ دی گئی ہیں، اور مکمل سورت کا لنک بھی ہے تاکہ آپ تلاوت کے ساتھ اسے ایک نشست میں یا دن بھر میں حصوں میں پڑھ سکیں۔',
        ],
      },
    },
  },
  {
    slug: 'surahs-before-sleeping',
    surahs: [67, 32],
    inline: [
      { surah: 67, from: 1, to: 10 },
      { surah: 32, from: 1, to: 10 },
    ],
    copy: {
      en: {
        title: 'Surahs to Read Before Sleeping – Al-Mulk & As-Sajdah with Translation',
        h1: 'Surahs to Read Before Sleeping: Al-Mulk and As-Sajdah',
        label: 'Surahs before sleeping',
        description:
          'Surah Al-Mulk (67) and Surah As-Sajdah (32) are the two surahs many Muslims read before sleeping. Read their opening verses with translation and open the full surahs with audio.',
        intro: [
          'Many Muslims read Surah Al-Mulk (chapter 67) and Surah As-Sajdah (chapter 32) before going to sleep as part of their night routine. This practice is based on reports from the Sunnah; please consult a qualified scholar for details on a specific narration.',
          'Each surah has 30 verses. The first ten verses of each are shown below with translation; open the full surah for all 30 verses with audio.',
        ],
      },
      ur: {
        title: 'سونے سے پہلے پڑھی جانے والی سورتیں – الملک اور السجدہ اردو ترجمہ کے ساتھ',
        h1: 'سونے سے پہلے پڑھی جانے والی سورتیں: الملک اور السجدہ',
        label: 'سونے سے پہلے پڑھی جانے والی سورتیں',
        description:
          'سورہ الملک (67) اور سورہ السجدہ (32) وہ دو سورتیں ہیں جنہیں بہت سے مسلمان سونے سے پہلے پڑھتے ہیں۔ ابتدائی آیات اردو ترجمہ کے ساتھ پڑھیں اور تلاوت کے ساتھ مکمل سورتیں کھولیں۔',
        intro: [
          'بہت سے مسلمان رات کے معمول کے طور پر سونے سے پہلے سورہ الملک (سورت نمبر 67) اور سورہ السجدہ (سورت نمبر 32) پڑھتے ہیں۔ یہ معمول سنت سے منقول روایات پر مبنی ہے؛ کسی خاص روایت کی تفصیل کے لیے کسی مستند عالم سے رجوع کریں۔',
          'ہر سورت کی 30 آیات ہیں۔ نیچے دونوں سورتوں کی ابتدائی دس دس آیات اردو ترجمہ کے ساتھ دی گئی ہیں؛ تمام 30 آیات اور تلاوت کے لیے مکمل سورت کھولیں۔',
        ],
      },
    },
  },
  {
    slug: 'manzil',
    surahs: [],
    inline: MANZILS.map((m) => ({ surah: m.start[0], from: m.start[1], to: m.start[1] })),
    copy: {
      en: {
        title: 'Manzil 1–7 of the Quran – Where Each Manzil Starts and Ends',
        h1: 'The 7 Manzils of the Quran',
        label: 'Manzil (7 stages)',
        description:
          'The Quran is traditionally divided into seven manzils. See where each manzil begins and ends, read its opening verse with translation, and jump to the surah.',
        intro: [
          'A manzil (plural manazil, “stage”) is one of seven traditional divisions of the Quran, arranged so that the whole Quran can be recited over the course of a week — one manzil each day.',
          'The list below gives the first and last verse of each manzil and shows the opening verse of each one with translation. Use the surah links to start reading from there.',
        ],
      },
      ur: {
        title: 'قرآن مجید کی سات منزلیں – ہر منزل کہاں سے کہاں تک',
        h1: 'قرآن مجید کی سات منزلیں',
        label: 'منزل (سات منزلیں)',
        description:
          'قرآن مجید کو روایتی طور پر سات منزلوں میں تقسیم کیا گیا ہے۔ ہر منزل کی ابتدا اور اختتام دیکھیں، پہلی آیت اردو ترجمہ کے ساتھ پڑھیں اور سورت کھولیں۔',
        intro: [
          'منزل قرآن مجید کی سات روایتی تقسیموں میں سے ایک حصہ ہے، جو اس طرح بنائی گئی ہیں کہ پورا قرآن ایک ہفتے میں پڑھا جا سکے — یعنی ہر دن ایک منزل۔',
          'نیچے ہر منزل کی پہلی اور آخری آیت دی گئی ہے اور ہر منزل کی ابتدائی آیت اردو ترجمہ کے ساتھ دکھائی گئی ہے۔ وہاں سے پڑھنا شروع کرنے کے لیے سورت کے لنک استعمال کریں۔',
        ],
      },
    },
  },
  {
    slug: 'short-surahs-for-prayer',
    surahs: [103, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114],
    inline: [103, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114].map((surah) => ({ surah })),
    copy: {
      en: {
        title: 'Short Surahs for Prayer (Salah) – Read & Memorise with Translation',
        h1: 'Short Surahs for Prayer: Read and Memorise',
        label: 'Short surahs for prayer',
        description:
          'Short surahs commonly recited in prayer — Al-Asr, Al-Fil, Quraysh, Al-Maun, Al-Kawthar, Al-Kafirun, An-Nasr, Al-Masad, Al-Ikhlas, Al-Falaq and An-Nas — with translation and audio.',
        intro: [
          'In the prayer (salah), after Surah Al-Fatihah, worshippers recite additional verses from the Quran. Many people, especially those learning, choose the short surahs near the end of the Quran because they are easy to memorise.',
          'Below are eleven short surahs in full with translation: Al-Asr, Al-Fil, Quraysh, Al-Maun, Al-Kawthar, Al-Kafirun, An-Nasr, Al-Masad, Al-Ikhlas, Al-Falaq and An-Nas. Open any surah for audio and word-by-word meanings.',
        ],
      },
      ur: {
        title: 'نماز کے لیے چھوٹی سورتیں – اردو ترجمہ کے ساتھ پڑھیں اور یاد کریں',
        h1: 'نماز کے لیے چھوٹی سورتیں: پڑھیں اور یاد کریں',
        label: 'نماز کے لیے چھوٹی سورتیں',
        description:
          'نماز میں عام طور پر پڑھی جانے والی چھوٹی سورتیں — العصر، الفیل، قریش، الماعون، الکوثر، الکافرون، النصر، المسد، الاخلاص، الفلق اور الناس — اردو ترجمہ اور تلاوت کے ساتھ۔',
        intro: [
          'نماز میں سورہ الفاتحہ کے بعد قرآن کی مزید آیات پڑھی جاتی ہیں۔ بہت سے لوگ، خاص طور پر سیکھنے والے، قرآن کے آخر کی چھوٹی سورتیں منتخب کرتے ہیں کیونکہ وہ آسانی سے یاد ہو جاتی ہیں۔',
          'نیچے گیارہ چھوٹی سورتیں مکمل اردو ترجمہ کے ساتھ دی گئی ہیں: العصر، الفیل، قریش، الماعون، الکوثر، الکافرون، النصر، المسد، الاخلاص، الفلق اور الناس۔ تلاوت اور لفظ بہ لفظ معنی کے لیے کسی بھی سورت کا صفحہ کھولیں۔',
        ],
      },
    },
  },
];

export function getTopic(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug);
}

export function topicPath(locale: ContentLocale, slug: TopicSlug): string {
  return localePath(locale, `/${slug}`);
}

/** Topics that feature a given surah — used for "related topics" links on surah pages. */
export function topicsForSurah(surah: number): Topic[] {
  return TOPICS.filter((t) => t.surahs.includes(surah));
}

export function isTopicLocale(locale: ContentLocale): locale is TopicLocale {
  return (TOPIC_LOCALES as readonly string[]).includes(locale);
}
