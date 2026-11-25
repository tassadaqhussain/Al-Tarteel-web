import type { ContentLocale } from '@/lib/i18n/content-locales';
import { getSurahLocalizedName } from '@/lib/i18n/surah-localized-names';
import { JUZ_META } from '@/lib/juz-meta';
import { SURAH_MEANINGS, SURAH_SIMPLE_NAMES } from '@/lib/surah-meta';
import { getSurahAyahCount } from '@/lib/surah-pagination';

/** Madani surah numbers (all other surahs are Makki). */
const MADANI_SURAHS = new Set([
  2, 3, 4, 5, 8, 9, 13, 22, 24, 33, 47, 48, 49, 55, 57, 58, 59, 60, 61, 62, 63,
  64, 65, 66, 76, 98, 99, 110,
]);

export function getSurahRevelationType(surahNumber: number): 'makki' | 'madani' {
  return MADANI_SURAHS.has(surahNumber) ? 'madani' : 'makki';
}

/** Return the Juz number(s) that contain any verse of `surahNumber`. */
export function getSurahJuzNumbers(surahNumber: number): number[] {
  const result: number[] = [];
  for (let juz = 1; juz <= 30; juz += 1) {
    const meta = JUZ_META[juz];
    if (meta && surahNumber >= meta.startSurah && surahNumber <= meta.endSurah) {
      result.push(juz);
    }
  }
  return result.length > 0 ? result : [30];
}

/** Curated summaries (2–3 sentences) for high-intent surahs across all 4 locales. */
const CURATED_SUMMARIES: Partial<Record<number, Record<ContentLocale, string>>> = {
  1: {
    en: 'Surah Al-Fatihah (The Opener) is the opening chapter of the Quran and is recited in every unit of the daily prayer. Its seven verses combine praise of Allah, acknowledgment of His mercy and sovereignty, and a direct supplication for guidance along the straight path.',
    ur: 'سورہ الفاتحہ قرآن مجید کی پہلی اور سب سے عظیم سورت ہے جو ہر نماز کی ہر رکعت میں پڑھی جاتی ہے۔ اس کی سات آیات میں اللہ کی حمد و ثنا، رحمت اور مالکِ یومِ دین ہونے کا اقرار، اور صراطِ مستقیم کی دعا شامل ہے۔',
    fa: 'سوره فاتحه نخستین سوره قرآن کریم است که در هر رکعت از نمازهای روزانه خوانده می‌شود. هفت آیه این سوره شامل ستایش خداوند، یادآوری رحمت و مالکیت او در روز جزا و دعای هدایت به راه راست است.',
    ps: 'سورت الفاتحه د قرآن کریم لومړنی سورت دی چې د هر لمانځه په هر رکعت کې لوستل کېږي. د دې سورت اووه آیتونه د الله ستاینه، د هغه د رحمت یادونه او د سمې لارې د هدایت دعا رانغاړي.',
  },
  2: {
    en: 'Surah Al-Baqarah (The Cow) is the longest chapter of the Quran, revealed in Madinah with 286 verses. It establishes core principles of faith, worship, charity, and community law, and contains Ayat al-Kursi (2:255) as well as the concluding supplication of the final two verses (2:285–286).',
    ur: 'سورہ البقرہ قرآن مجید کی سب سے طویل مدنی سورت ہے جس میں 286 آیات ہیں۔ اس میں ایمان، عبادات، انفاق اور معاشرتی احکام کی تفصیل کے ساتھ آیت الکرسی (2:255) اور آخری دو عظیم آیات (2:285–286) شامل ہیں۔',
    fa: 'سوره بقره طولانی‌ترین سوره قرآن کریم و از سوره‌های مدنی با ۲۸۶ آیه است. این سوره اصول ایمان، عبادات و احکام اجتماعی را بیان می‌کند و شامل آیة‌الکرسی (۲:۲۵۵) و دو آیه پایانی پر فضیلت بقره است.',
    ps: 'سورت البقره د قرآن کریم تر ټولو اوږد مدني سورت دی چې ۲۸۶ آیتونه لري. په دې سورت کې د ایمان، عباداتو او ټولنیزو احکامو ترڅنګ آیت الکرسي (۲:۲۵۵) او د البقرې وروستي دوه آیتونه هم شامل دي.',
  },
  4: {
    en: 'Surah An-Nisa (The Women) is a major Madani chapter of 176 verses addressing family justice, inheritance, orphan rights, and social equity. It repeatedly calls believers to uphold fairness, compassion, and accountability before Allah.',
    ur: 'سورہ النساء 176 آیات پر مشتمل اہم مدنی سورت ہے جس میں خاندانی عدل، وراثت، یتیموں کے حقوق اور معاشرتی انصاف کے احکام بیان کیے گئے ہیں۔ یہ سورت اہلِ ایمان کو اللہ کے سامنے جوابدہی اور عدل قائم رکھنے کی تلقین کرتی ہے۔',
    fa: 'سوره نساء از سوره‌های مهم مدنی با ۱۷۶ آیه است که به عدالت خانوادگی، احکام ارث، حقوق یتیمان و انصاف اجتماعی می‌پردازد. این سوره مؤمنان را به رعایت عدل، مهربانی و تقوای الهی فرا می‌خواند.',
    ps: 'سورت النساء یو مهم مدني سورت دی چې ۱۷۶ آیتونه لري او د کورني عدالت، میراث، د یتیمانو حقونو او ټولنیز انصاف احکام بیانوي. دا سورت مؤمنان د الله په وړاندې تقوا او عدل ته رابولي.',
  },
  18: {
    en: 'Surah Al-Kahf (The Cave) is a Makki chapter of 110 verses traditionally recited on Fridays. Through four vivid narratives—the Companions of the Cave, the owner of two gardens, Musa and Khidr, and Dhul-Qarnayn—it teaches steadiness of faith amid trials of wealth, knowledge, and power.',
    ur: 'سورہ الکہف 110 آیات پر مشتمل مکی سورت ہے جسے جمعہ کے دن پڑھنے کی فضیلت احادیث میں آئی ہے۔ اس میں اصحابِ کہف، دو باغوں والے، حضرت موسیٰ و خضرؑ اور ذوالقرنین کے واقعات کے ذریعے ایمان، مال، علم اور اقتدار کی آزمائشوں میں استقامت کا درس دیا گیا ہے۔',
    fa: 'سوره کهف از سوره‌های مکی با ۱۱۰ آیه است که تلاوت آن در روز جمعه بسیار توصیه شده است. این سوره از طریق داستان اصحاب کهف، صاحب دو باغ، موسی و خضر و ذوالقرنین، پایداری در ایمان را در برابر آزمایش‌های مال، علم و قدرت می‌آموزد.',
    ps: 'سورت الکهف یو مکی سورت دی چې ۱۱۰ آیتونه لري او د جمعې په ورځ یې تلاوت ډېر فضیلت لري. په دې سورت کې د اصحاب کهف، د دوو باغونو څښتن، موسی او خضر او ذوالقرنین د کیسو له لارې د ایمان د استقامت درس ورکړل شوی دی.',
  },
  36: {
    en: 'Surah Ya-Sin (Yasin) is a Makki chapter of 83 verses often called the heart of the Quran. It affirms the truthfulness of revelation, recounts the steadfast believer of the city, and points to signs of creation in nature as proof of resurrection.',
    ur: 'سورہ یٰسین 83 آیات پر مشتمل مکی سورت ہے جو قرآن کریم کی معروف اور کثرت سے پڑھی جانے والی سورتوں میں سے ہے۔ اس میں رسالت کی حقانیت، کائنات میں اللہ کی نشانیوں اور آخرت و بعث بعد الموت کے دلائل کو مؤثر انداز میں بیان کیا گیا ہے۔',
    fa: 'سوره یس از سوره‌های مکی با ۸۳ آیه است که در میان مسلمانان به قلب قرآن شهرت دارد. این سوره بر حقانیت رسالت، نشانه‌های قدرت خداوند در آفرینش و حقیقت معاد و رستاخیز تأکید می‌کند.',
    ps: 'سورت یس یو مکی سورت دی چې ۸۳ آیتونه لري او د قرآن کریم له خورا مشهورو سورتونو څخه دی. په دې سورت کې د رسالت حقانیت، په کائناتو کې د الله نښې او د قیامت حقیقت په روښانه توګه بیان شوي دي.',
  },
  55: {
    en: 'Surah Ar-Rahman (The Most Merciful) is a 78-verse chapter celebrated for its rhythmic refrain asking which favors of the Lord can be denied. It pairs the blessings of creation and guidance in this world with the recompense of the Hereafter.',
    ur: 'سورہ الرحمٰن 78 آیات پر مشتمل سورت ہے جس میں اللہ تعالیٰ کی نعمتوں کو نہایت دلکش اور مؤثر اسلوب میں یاد دلایا گیا ہے۔ اس میں بار بار یہ سوال دہرایا گیا ہے کہ تم اپنے رب کی کن کن نعمتوں کو جھٹلاؤ گے۔',
    fa: 'سوره الرحمن دارای ۷۸ آیه است که با آهنگ دلنشین خود نعمت‌های بی‌شمار خداوند در آفرینش، هدایت و آخرت را یادآوری می‌کند و بارها می‌پرسد پس کدام‌یک از نعمت‌های پروردگارتان را انکار می‌کنید.',
    ps: 'سورت الرحمن ۷۸ آیتونه لري چې په کې د الله تعالی نعمتونه، د قرآن ښوونه او د آخرت انعامونه په ډېر اغېزناک انداز یاد شوي دي او په تکرار سره پوښتنه کېږي چې تاسو به د خپل رب کوم نعمتونه دروغ وګڼئ.',
  },
  56: {
    en: 'Surah Al-Waqiah (The Inevitable) is a Makki chapter of 96 verses describing the Day of Resurrection and the three groups of humanity. It closes by drawing attention to everyday signs of Allah’s creative power and the honor of the Quran.',
    ur: 'سورہ الواقعہ 96 آیات پر مشتمل مکی سورت ہے جس میں قیامت کے احوال اور انسانوں کے تین گروہوں (سابقون، اصحابِ یمین اور اصحابِ شمال) کا بیان ہے۔ آخر میں تخلیقِ کائنات کی نشانیوں اور قرآن کی عظمت پر توجہ دلائی گئی ہے۔',
    fa: 'سوره واقعه از سوره‌های مکی با ۹۶ آیه است که رویداد قیامت و سرنوشت سه گروه از انسان‌ها را توصیف می‌کند و در پایان به نشانه‌های آفرینش خداوند و عظمت قرآن کریم اشاره می‌نماید.',
    ps: 'سورت الواقعه یو مکی سورت دی چې ۹۶ آیتونه لري او د قیامت پېښه او د انسانانو درې ډلې بیانوي. په پای کې د الله د قدرت نښو او د قرآن کریم عظمت ته پام را اړول شوی دی.',
  },
  67: {
    en: 'Surah Al-Mulk (The Sovereignty) is a Makki chapter of 30 verses opening Juz 29 and widely recited before sleep. It invites reflection on the flawless design of the heavens, life and death as a test of deeds, and Allah’s complete dominion.',
    ur: 'سورہ الملک 30 آیات پر مشتمل مکی سورت ہے جو انتیسویں پارے کی پہلی سورت ہے اور رات سونے سے پہلے پڑھنے کی فضیلت رکھتی ہے۔ اس میں اللہ کی مطلق بادشاہت، آسمانوں کی بے عیب تخلیق اور زندگی و موت کے امتحان پر غور و فکر کی دعوت دی گئی ہے۔',
    fa: 'سوره ملک از سوره‌های مکی با ۳۰ آیه در آغاز جزء ۲۹ است که تلاوت آن پیش از خواب توصیه شده است. این سوره انسان را به اندیشه در مالکیت مطلق خداوند، نظم شگفت‌انگیز آسمان‌ها و آزمون زندگی و مرگ فرا می‌خواند.',
    ps: 'سورت الملک یو مکی سورت دی چې ۳۰ آیتونه لري، د ۲۹مې سپارې پیل دی او تر خوب مخکې یې تلاوت ډېر فضیلت لري. دا سورت د الله په مطلق واک، د اسمانونو په بې‌عیبه خلقت او د ژوند او مرګ په ازموینه کې د فکر کولو بلنه ورکوي.',
  },
};

export interface SurahIntroData {
  heading: string;
  summary: string;
  revelationLabel: string;
  ayahsLabel: string;
  juzNumbers: number[];
  juzLabelPrefix: string;
  meaningLabel?: string;
}

export function getSurahIntro(surahNumber: number, locale: ContentLocale): SurahIntroData {
  const ayahCount = getSurahAyahCount(surahNumber);
  const rev = getSurahRevelationType(surahNumber);
  const juzNumbers = getSurahJuzNumbers(surahNumber);
  const englishName = SURAH_SIMPLE_NAMES[surahNumber] || `Surah ${surahNumber}`;
  const localizedName = getSurahLocalizedName(surahNumber, locale);
  const meaning = SURAH_MEANINGS[surahNumber] || '';
  const juzSpanText =
    juzNumbers.length === 1
      ? `${juzNumbers[0]}`
      : `${juzNumbers[0]}–${juzNumbers[juzNumbers.length - 1]}`;

  const curated = CURATED_SUMMARIES[surahNumber]?.[locale];

  if (locale === 'ur') {
    const revLabel = rev === 'madani' ? 'مدنی سورت' : 'مکی سورت';
    return {
      heading: `سورہ ${localizedName} کا مختصر تعارف`,
      revelationLabel: revLabel,
      ayahsLabel: `${ayahCount} آیات`,
      juzNumbers,
      juzLabelPrefix: 'پارہ',
      summary:
        curated ||
        `سورہ ${localizedName} قرآن مجید کی ${surahNumber}ویں سورت ہے جو ایک ${revLabel} ہے اور اس میں ${ayahCount} آیات شامل ہیں (پارہ ${juzSpanText})۔ اس صفحے پر آپ سورہ ${localizedName} عربی عثمانی متن، مستند اردو ترجمہ اور آیت بہ آیت تلاوت کے ساتھ آن لائن پڑھ اور سن سکتے ہیں۔`,
    };
  }

  if (locale === 'fa') {
    const revLabel = rev === 'madani' ? 'سوره مدنی' : 'سوره مکی';
    return {
      heading: `معرفی کوتاه سوره ${localizedName}`,
      revelationLabel: revLabel,
      ayahsLabel: `${ayahCount} آیه`,
      juzNumbers,
      juzLabelPrefix: 'جزء',
      summary:
        curated ||
        `سوره ${localizedName} سوره شماره ${surahNumber} قرآن کریم و از سوره‌های ${rev === 'madani' ? 'مدنی' : 'مکی'} با ${ayahCount} آیه در جزء ${juzSpanText} است. در این صفحه می‌توانید متن عربی عثمانی سوره ${localizedName} را همراه با ترجمه فارسی و تلاوت صوتی آیه به آیه مطالعه کنید و بشنوید.`,
    };
  }

  if (locale === 'ps') {
    const revLabel = rev === 'madani' ? 'مدني سورت' : 'مکي سورت';
    return {
      heading: `د سورت ${localizedName} لنډه پېژندنه`,
      revelationLabel: revLabel,
      ayahsLabel: `${ayahCount} آیتونه`,
      juzNumbers,
      juzLabelPrefix: 'سپاره',
      summary:
        curated ||
        `سورت ${localizedName} د قرآن کریم ${surahNumber}م سورت دی چې یو ${revLabel} دی او ${ayahCount} آیتونه لري (سپاره ${juzSpanText}). په دې پاڼه کې تاسو کولای شئ سورت ${localizedName} له عربي عثماني متن، پښتو ژباړې او آیت په آیت تلاوت سره آنلاین ولولئ او واورئ.`,
    };
  }

  const revLabel = rev === 'madani' ? 'Madani Surah' : 'Makki Surah';
  return {
    heading: `About Surah ${englishName}`,
    revelationLabel: revLabel,
    ayahsLabel: `${ayahCount} verses`,
    juzNumbers,
    juzLabelPrefix: 'Juz',
    meaningLabel: meaning ? `Meaning: ${meaning}` : undefined,
    summary:
      curated ||
      `Surah ${englishName}${meaning ? ` (“${meaning}”)` : ''} is chapter ${surahNumber} of the Holy Quran, a ${rev === 'madani' ? 'Madani' : 'Makki'} surah containing ${ayahCount} verses in Juz ${juzSpanText}. Read the full Arabic Uthmani text below alongside clear English translation and verse-by-verse audio recitation.`,
  };
}

/** Commonly searched companion surahs for cross-linking. */
const COMPANION_SURAHS = [67, 18, 36, 55, 56, 1, 2, 112];

export function getRelatedSurahNumbers(surahNumber: number, limit = 6): number[] {
  const seen = new Set<number>([surahNumber]);
  const out: number[] = [];

  // 1. Same-Juz surahs first
  const primaryJuz = getSurahJuzNumbers(surahNumber)[0];
  const juzMeta = JUZ_META[primaryJuz];
  if (juzMeta) {
    for (let s = juzMeta.startSurah; s <= juzMeta.endSurah && out.length < 3; s += 1) {
      if (!seen.has(s)) {
        seen.add(s);
        out.push(s);
      }
    }
  }

  // 2. Popular companion surahs (Al-Mulk <-> Al-Kahf <-> Ya-Sin <-> Ar-Rahman <-> Al-Waqiah)
  for (const s of COMPANION_SURAHS) {
    if (out.length >= limit) break;
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }

  return out.slice(0, limit);
}
