/**
 * Reviewed Daily Motivation messages.
 * Neutral educational encouragement — never presented as Quran or Hadith.
 */

export type MotivationCategory =
  | 'READING'
  | 'TAJWEED'
  | 'LISTENING'
  | 'REFLECTION'
  | 'CONSISTENCY'
  | 'LEARNING'
  | 'RETURNING_USER'
  | 'PROGRESS';

export type MotivationLocale = 'en' | 'ur' | 'ar';

export type DailyMotivationMessage = {
  id: string;
  category: MotivationCategory;
  text: Record<MotivationLocale, string>;
};

export const DAILY_MOTIVATION_POOL: DailyMotivationMessage[] = [
  {
    id: 'reading-1',
    category: 'READING',
    text: {
      en: 'Make a little time for the Quran today. Even a short reading session is meaningful progress.',
      ur: 'آج قرآن کے لیے تھوڑا سا وقت نکالیں۔ مختصر تلاوت بھی معنی خیز پیش رفت ہے۔',
      ar: 'اجعل وقتًا يسيرًا للقرآن اليوم. حتى الجلسة القصيرة تقدم ذو معنى.',
    },
  },
  {
    id: 'reading-2',
    category: 'READING',
    text: {
      en: 'Small, consistent steps can build a lasting connection with the Quran.',
      ur: 'چھوٹے مگر مسلسل قدم قرآن سے پائیدار تعلق بنا سکتے ہیں۔',
      ar: 'الخطوات الصغيرة المستمرة قد تبني صلة دائمة بالقرآن.',
    },
  },
  {
    id: 'tajweed-1',
    category: 'TAJWEED',
    text: {
      en: 'Choose one Tajweed rule today and practice it slowly with a few examples.',
      ur: 'آج ایک تجوید کا قاعدہ چنیں اور چند مثالوں کے ساتھ آہستگی سے مشق کریں۔',
      ar: 'اختر اليوم قاعدة تجويد واحدة وتمرّن عليها بهدوء مع بعض الأمثلة.',
    },
  },
  {
    id: 'tajweed-2',
    category: 'TAJWEED',
    text: {
      en: 'One focused rule is enough for today. Listen carefully and recognize the sound.',
      ur: 'آج ایک مرکوز قاعدہ کافی ہے۔ غور سے سنیں اور آواز پہچانیں۔',
      ar: 'قاعدة مركزة واحدة تكفي اليوم. استمع جيدًا وميّز الصوت.',
    },
  },
  {
    id: 'listening-1',
    category: 'LISTENING',
    text: {
      en: 'Listen carefully to a few Ayahs today and follow along with the Arabic text.',
      ur: 'آج چند آیات غور سے سنیں اور عربی متن کے ساتھ ساتھ چلیں۔',
      ar: 'استمع اليوم بعناية إلى بضع آيات وتابع النص العربي معها.',
    },
  },
  {
    id: 'reflection-1',
    category: 'REFLECTION',
    text: {
      en: 'Read slowly today. Give yourself time to think about what you are reading.',
      ur: 'آج آہستگی سے پڑھیں۔ جو پڑھ رہے ہیں اس پر غور کرنے کا وقت دیں۔',
      ar: 'اقرأ بتمهّل اليوم. امنح نفسك وقتًا للتفكر فيما تقرأ.',
    },
  },
  {
    id: 'consistency-1',
    category: 'CONSISTENCY',
    text: {
      en: 'Small, consistent steps can become a lasting habit.',
      ur: 'چھوٹے مسلسل قدم پائیدار عادت بن سکتے ہیں۔',
      ar: 'الخطوات الصغيرة المستمرة قد تصبح عادة دائمة.',
    },
  },
  {
    id: 'learning-1',
    category: 'LEARNING',
    text: {
      en: 'Learn one new thing about the Quran today and carry it into your next reading.',
      ur: 'آج قرآن کے بارے میں ایک نئی بات سیکھیں اور اگلی تلاوت میں یاد رکھیں۔',
      ar: 'تعلّم اليوم شيئًا جديدًا عن القرآن واحمله معك في قراءتك التالية.',
    },
  },
  {
    id: 'returning-1',
    category: 'RETURNING_USER',
    text: {
      en: 'Welcome back. Continue from where you left off whenever you are ready.',
      ur: 'خوش آمدید۔ جب تیار ہوں جہاں چھوڑا تھا وہیں سے جاری رکھیں۔',
      ar: 'مرحبًا بعودتك. تابع من حيث توقفت متى شئت.',
    },
  },
  {
    id: 'progress-1',
    category: 'PROGRESS',
    text: {
      en: "You're building a consistent learning journey. Keep moving at a pace that works for you.",
      ur: 'آپ ایک مستقل تعلیمی سفر بنارہے ہیں۔ اپنے مناسب انداز سے آگے بڑھتے رہیں۔',
      ar: 'أنت تبني مسار تعلم ثابت. واصل بوتيرة تناسبك.',
    },
  },
  {
    id: 'reading-3',
    category: 'READING',
    text: {
      en: 'Take a few quiet minutes today to read, listen, and reflect.',
      ur: 'آج چند پرسکون لمحے نکالیں — پڑھیں، سنیں، اور غور کریں۔',
      ar: 'خذ اليوم دقائق هادئة للقراءة والاستماع والتأمل.',
    },
  },
  {
    id: 'consistency-2',
    category: 'CONSISTENCY',
    text: {
      en: 'There is no rush. A calm session today still counts.',
      ur: 'جلدی کی کوئی بات نہیں۔ آج کا پرسکون سیشن بھی شمار ہوتا ہے۔',
      ar: 'لا عجلة. جلسة هادئة اليوم تُحتسب أيضًا.',
    },
  },
];

export type DailyGoalType =
  | 'read_ayahs'
  | 'read_page'
  | 'read_minutes'
  | 'tajweed_rule'
  | 'listen';

export const DAILY_GOAL_OPTIONS: {
  type: DailyGoalType;
  value: number;
  label: Record<MotivationLocale, string>;
}[] = [
  { type: 'read_ayahs', value: 5, label: { en: 'Read 5 Ayahs', ur: '۵ آیات پڑھیں', ar: 'اقرأ 5 آيات' } },
  { type: 'read_ayahs', value: 10, label: { en: 'Read 10 Ayahs', ur: '۱۰ آیات پڑھیں', ar: 'اقرأ 10 آيات' } },
  { type: 'read_ayahs', value: 20, label: { en: 'Read 20 Ayahs', ur: '۲۰ آیات پڑھیں', ar: 'اقرأ 20 آية' } },
  { type: 'read_page', value: 1, label: { en: 'Read 1 page', ur: 'ایک صفحہ پڑھیں', ar: 'اقرأ صفحة واحدة' } },
  { type: 'read_minutes', value: 5, label: { en: 'Read for 5 minutes', ur: '۵ منٹ پڑھیں', ar: 'اقرأ لمدة 5 دقائق' } },
  { type: 'read_minutes', value: 10, label: { en: 'Read for 10 minutes', ur: '۱۰ منٹ پڑھیں', ar: 'اقرأ لمدة 10 دقائق' } },
  { type: 'tajweed_rule', value: 1, label: { en: 'Practice 1 Tajweed rule', ur: 'ایک تجوید قاعدہ مشق کریں', ar: 'تمرّن على قاعدة تجويد' } },
  { type: 'listen', value: 1, label: { en: 'Listen to Quran', ur: 'قرآن سنیں', ar: 'استمع إلى القرآن' } },
];

/** Deterministic day-of-year index into the message pool (stable within a calendar day). */
export function selectDailyMotivationIndex(dateKey: string, poolSize: number): number {
  if (poolSize <= 0) return 0;
  let hash = 0;
  for (let i = 0; i < dateKey.length; i += 1) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return hash % poolSize;
}

export function getDailyMotivationMessage(
  dateKey: string,
  locale: MotivationLocale = 'en',
  preferredCategory?: MotivationCategory,
): DailyMotivationMessage & { displayText: string } {
  let pool = DAILY_MOTIVATION_POOL;
  if (preferredCategory) {
    const filtered = DAILY_MOTIVATION_POOL.filter((m) => m.category === preferredCategory);
    if (filtered.length) pool = filtered;
  }
  const index = selectDailyMotivationIndex(dateKey, pool.length);
  const msg = pool[index]!;
  const displayText = msg.text[locale] || msg.text.en;
  return { ...msg, displayText };
}

export function localDateKey(timeZone?: string): string {
  try {
    if (timeZone) {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
    }
  } catch {
    /* fall through */
  }
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Surah/ayah ref only — Arabic must be loaded from canonical API. */
export function ayahOfTheDayRef(dateKey: string): { surah: number; ayah: number } {
  const index = selectDailyMotivationIndex(`ayah:${dateKey}`, 114);
  const surah = (index % 114) + 1;
  // Prefer early ayahs (safer for partial DBs); reader clamps via API fetch failures
  const ayah = (selectDailyMotivationIndex(`ayahn:${dateKey}`, 7) % 7) + 1;
  return { surah, ayah };
}

export function tajweedOfTheDaySlug(dateKey: string): string {
  const slugs = ['ghunnah', 'ikhfa', 'idgham', 'iqlab', 'qalqalah', 'madd'];
  return slugs[selectDailyMotivationIndex(`tj:${dateKey}`, slugs.length)]!;
}
