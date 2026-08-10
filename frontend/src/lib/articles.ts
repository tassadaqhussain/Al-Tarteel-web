export type ArticleCategory =
  | 'Islam Basics'
  | 'Quran'
  | 'Worship'
  | 'History'
  | 'Character';

export interface ArticleSection {
  heading?: string;
  paragraphs: string[];
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  durationMinutes: number;
  category: ArticleCategory;
  image: string;
  /** ISO date used for sorting and display */
  publishedAt: string;
  sections: ArticleSection[];
}

const IMAGES = [
  '/images/article_1.png',
  '/images/article_2.png',
  '/images/article_3.png',
] as const;

function img(i: number) {
  return IMAGES[i % IMAGES.length];
}

/**
 * Editorial pool for the Learn Islam basics section.
 * Expand this list to publish more articles; homepage rotates 3 fresh ones daily.
 */
export const ARTICLES: Article[] = [
  {
    slug: 'when-was-islam-created-at-first',
    title: 'When was Islam created at first?',
    description:
      'Discover the historical origin and evolution of the Islamic message across the globe.',
    durationMinutes: 5,
    category: 'Islam Basics',
    image: img(0),
    publishedAt: '2026-03-01',
    sections: [
      {
        paragraphs: [
          'Muslims believe Islam is not a “new religion” invented in the 7th century. It is the same core message taught by earlier prophets: worship the One God (Allah) and live with justice, mercy, and accountability.',
          'What began publicly with the Prophet Muhammad ﷺ in Makkah around 610 CE was the final revelation of that message—the Quran—completed over about 23 years.',
        ],
      },
      {
        heading: 'A message with deep roots',
        paragraphs: [
          'In Islamic belief, Adam was the first human and the first prophet. Later prophets—including Noah, Abraham, Moses, and Jesus (peace be upon them)—called their people to the same foundational truth of tawhid (oneness of God).',
          'So “when Islam began” can mean two things: the timeless faith of submission to God, or the historical period when the final scripture and prophetic example were given to humanity.',
        ],
      },
      {
        heading: 'From Makkah to the world',
        paragraphs: [
          'After facing intense persecution in Makkah, the early Muslim community migrated to Madinah. From there, Islam spread through teaching, trade, and community life—reaching continents far beyond Arabia within generations.',
          'Today, reading the Quran, learning its meaning, and following prophetic character remain the practical way to connect with that original message.',
        ],
      },
    ],
  },
  {
    slug: 'how-many-years-did-it-take-to-build',
    title: 'How many years did it take to build the Kaaba?',
    description: 'Exploring the history and divine architecture of the Kaaba in Mecca.',
    durationMinutes: 8,
    category: 'History',
    image: img(1),
    publishedAt: '2026-03-02',
    sections: [
      {
        paragraphs: [
          'The Kaaba is the cuboid house in Makkah toward which Muslims face in prayer. In Islamic tradition, it was built by Prophet Ibrahim (Abraham) and his son Ismail (peace be upon them) as a house dedicated to the worship of the One God.',
          'Scripture does not give a modern construction timeline like “X years of labor.” What it emphasizes is purpose: a center of monotheistic worship, pilgrimage, and unity.',
        ],
      },
      {
        heading: 'Rebuilt across history',
        paragraphs: [
          'Over many centuries the Kaaba was repaired and reconstructed after floods and other damage. One well-known pre-Islamic rebuild occurred in the Quraysh era, when the Prophet Muhammad ﷺ famously settled a dispute about placing the Black Stone.',
          'Later Muslim generations continued careful renovations while protecting the structure as a sacred site—not as an object of worship itself, but as a symbol of direction and unity for the ummah.',
        ],
      },
      {
        heading: 'What matters most',
        paragraphs: [
          'For believers, the Kaaba’s value is spiritual orientation: five daily prayers facing one point, and millions gathering there each year for Hajj and Umrah.',
          'Learning why the Kaaba exists helps deepen prayer focus—remembering you face the House of God in the company of a worldwide community.',
        ],
      },
    ],
  },
  {
    slug: 'benefits-of-reading-the-holy-quran',
    title: 'Benefits of Reading the Holy Quran.',
    description:
      'Unveiling the physical, mental, and spiritual blessings of regular Quranic recitation.',
    durationMinutes: 6,
    category: 'Quran',
    image: img(2),
    publishedAt: '2026-03-03',
    sections: [
      {
        paragraphs: [
          'The Quran describes itself as guidance, healing for hearts, and a reminder. Regular reading—slowly, attentively, and with meaning—reshapes how a person thinks, speaks, and chooses.',
          'Even a small daily portion builds a lifelong relationship with revelation.',
        ],
      },
      {
        heading: 'Spiritual and emotional benefits',
        paragraphs: [
          'Recitation brings calm through remembrance (dhikr). Many readers notice less anxiety when they start or end the day with Quran, especially when reflecting on mercy, patience, and trust in God.',
          'Understanding even a few verses helps prayer feel less routine and more conversational—speaking and listening to Allah’s words.',
        ],
      },
      {
        heading: 'Practical habits that stick',
        paragraphs: [
          'Choose a time you can protect: after Fajr, during a commute pause, or before sleep. Pair Arabic recitation with a translation in your language.',
          'On QuranPilot, start with short surahs, enable word-by-word meanings, and listen to a clear reciter while following the text. Consistency beats intensity.',
        ],
      },
    ],
  },
  {
    slug: 'what-is-tawhid-oneness-of-god',
    title: 'What is Tawhid? The heart of Islamic belief',
    description:
      'A clear introduction to the oneness of God—the foundation every Muslim practice rests on.',
    durationMinutes: 6,
    category: 'Islam Basics',
    image: img(0),
    publishedAt: '2026-03-08',
    sections: [
      {
        paragraphs: [
          'Tawhid means affirming that Allah alone is worthy of worship. He has no partner, no equal, and nothing in creation shares His divinity.',
          'This belief appears throughout the Quran, most famously in Surah Al-Ikhlas, which summarizes divine uniqueness in a few short lines.',
        ],
      },
      {
        heading: 'Why it changes everyday life',
        paragraphs: [
          'If only God deserves worship, prayer, reliance, and ultimate hope are directed to Him. Superstition, arrogance, and despair lose their grip when the heart knows Who is in control.',
          'Learning Quranic names and attributes of Allah (mercy, justice, knowledge) helps tawhid become lived trust—not only a sentence on the tongue.',
        ],
      },
    ],
  },
  {
    slug: 'five-pillars-of-islam-explained',
    title: 'The Five Pillars of Islam explained simply',
    description:
      'Shahadah, prayer, zakat, fasting, and Hajj—what they mean and how they shape a Muslim life.',
    durationMinutes: 7,
    category: 'Worship',
    image: img(1),
    publishedAt: '2026-03-10',
    sections: [
      {
        paragraphs: [
          'The Five Pillars are the practical framework of Islam: testimony of faith (shahadah), five daily prayers (salah), purifying charity (zakat), fasting in Ramadan (sawm), and pilgrimage to Makkah (Hajj) for those who are able.',
          'Together they train belief, discipline, generosity, empathy, and global belonging.',
        ],
      },
      {
        heading: 'Start where you are',
        paragraphs: [
          'New learners often begin by understanding the shahadah and establishing prayer step by step. Fasting and zakat deepen gratitude; Hajj crowns a lifetime of intention for those who can undertake it.',
          'If you are rebuilding habits, protect one prayer on time this week—then grow from there with knowledge and sincerity.',
        ],
      },
    ],
  },
  {
    slug: 'how-to-start-reading-quran-as-a-beginner',
    title: 'How to start reading the Quran as a beginner',
    description:
      'A practical path from letters and short surahs to daily understanding—without overwhelm.',
    durationMinutes: 7,
    category: 'Quran',
    image: img(2),
    publishedAt: '2026-03-14',
    sections: [
      {
        paragraphs: [
          'Beginners succeed with a simple system: short sessions, clear audio, and meaning beside the Arabic. You do not need to master everything before you begin.',
          'Start with Surah Al-Fatihah and the last juz (Amma)—they are shorter, commonly used in prayer, and rich with foundational themes.',
        ],
      },
      {
        heading: 'A 15-minute daily plan',
        paragraphs: [
          '5 minutes listening and repeating, 5 minutes reading with transliteration or word meanings if needed, and 5 minutes reading a translation of what you recited.',
          'Track progress gently. On days you feel tired, listen only—keeping the habit alive matters more than perfect output.',
        ],
      },
    ],
  },
  {
    slug: 'why-muslims-pray-five-times-a-day',
    title: 'Why Muslims pray five times a day',
    description:
      'How the daily prayers structure time, renew intention, and connect believers to God throughout the day.',
    durationMinutes: 5,
    category: 'Worship',
    image: img(0),
    publishedAt: '2026-03-18',
    sections: [
      {
        paragraphs: [
          'Salah is the most frequent pillar of Islam. At five appointed times, Muslims pause worldly tasks to stand, bow, and prostrate before Allah.',
          'The Quran and prophetic teachings present prayer as remembrance, purification of the heart, and a barrier against wrongdoing when performed with presence.',
        ],
      },
      {
        heading: 'More than a ritual',
        paragraphs: [
          'Each prayer resets the day: gratitude in the morning, steadiness at midday, reflection as night falls. Facing the Kaaba unites Muslims worldwide in one direction.',
          'If prayer feels hurried, shorten distractions rather than skipping. Read the meanings of Al-Fatihah and slow a few units—quality grows with understanding.',
        ],
      },
    ],
  },
  {
    slug: 'what-is-ramadan-and-why-muslims-fast',
    title: 'What is Ramadan and why Muslims fast',
    description:
      'The purpose of fasting—from restraining desire to growing empathy, gratitude, and God-consciousness.',
    durationMinutes: 6,
    category: 'Worship',
    image: img(1),
    publishedAt: '2026-03-22',
    sections: [
      {
        paragraphs: [
          'Ramadan is the ninth month of the Islamic lunar calendar, when Muslims fast from dawn to sunset—abstaining from food, drink, and intimate relations—while increasing Quran, charity, and prayer.',
          'The Quran says fasting was prescribed so that believers may attain taqwa: mindful awareness of God.',
        ],
      },
      {
        heading: 'Lessons that last beyond the month',
        paragraphs: [
          'Hunger teaches empathy for those who live with less. Evening iftars build family and community bonds. Night prayers and Quran complete the day’s restraint with worship.',
          'Even outside Ramadan, voluntary fasting and mindful eating keep the spirit of the month alive year-round.',
        ],
      },
    ],
  },
  {
    slug: 'who-was-prophet-muhammad',
    title: 'Who was Prophet Muhammad ﷺ?',
    description:
      'A concise introduction to the final messenger—his character, mission, and lasting example.',
    durationMinutes: 8,
    category: 'History',
    image: img(2),
    publishedAt: '2026-03-26',
    sections: [
      {
        paragraphs: [
          'Prophet Muhammad ﷺ was born in Makkah around 570 CE. Muslims believe he is the final messenger of God, sent as a mercy to the worlds with the Quran as revelation.',
          'Before prophethood he was known among his people as trustworthy (al-Amin). After revelation began at age forty, he called to monotheism, justice, and moral excellence.',
        ],
      },
      {
        heading: 'Character as the message',
        paragraphs: [
          'His teachings cover belief and law, but his daily example—mercy to orphans, honesty in trade, patience under hardship—shows how revelation looks in human life.',
          'The most accessible way to know him today is to read Quran alongside authentic seerah summaries and apply one prophetic habit at a time: truthfulness, gentleness, or generosity.',
        ],
      },
    ],
  },
  {
    slug: 'importance-of-good-character-in-islam',
    title: 'Why good character is central in Islam',
    description:
      'How manners, honesty, and kindness complete worship—and why the Prophet ﷺ emphasized them.',
    durationMinutes: 5,
    category: 'Character',
    image: img(0),
    publishedAt: '2026-04-01',
    sections: [
      {
        paragraphs: [
          'Islam measures piety not only by rituals but by how we treat people. The Prophet ﷺ said he was sent to perfect good character—linking faith with ethics.',
          'Honesty in speech, keeping promises, controlling anger, and caring for neighbors are acts of worship when done seeking Allah’s pleasure.',
        ],
      },
      {
        heading: 'A practical checklist',
        paragraphs: [
          'Choose one relationship to improve this week—family, coworker, or stranger online. Replace one harsh habit with a quieter response.',
          'Reading Quran regularly feeds character: verses on patience, forgiveness, and justice become mirrors for self-correction.',
        ],
      },
    ],
  },
  {
    slug: 'how-to-make-dua-that-feels-real',
    title: 'How to make dua that feels real',
    description:
      'A beginner-friendly guide to personal prayer—asking Allah with hope, etiquette, and consistency.',
    durationMinutes: 5,
    category: 'Worship',
    image: img(1),
    publishedAt: '2026-04-05',
    sections: [
      {
        paragraphs: [
          'Dua is conversation with Allah: praise, gratitude, seeking forgiveness, and asking for needs of this life and the next. It can be in any language; Arabic formulas are beautiful but not a barrier.',
          'Raising hands, facing the qiblah, and choosing times like the last third of the night or between the adhan and iqamah are recommended etiquettes—not rigid conditions that block sincerity.',
        ],
      },
      {
        heading: 'Keep asking',
        paragraphs: [
          'Answers may come as what you asked for, something better later, or protection from harm you cannot see. Persist without despair.',
          'Pair dua with action: study, apologize, give charity, or start the habit you are praying for. Trust works hand in hand with effort.',
        ],
      },
    ],
  },
  {
    slug: 'understanding-surah-al-fatihah',
    title: 'Understanding Surah Al-Fatihah',
    description:
      'Why the Opening chapter is prayed daily—and what its verses teach about guidance and dependence on God.',
    durationMinutes: 6,
    category: 'Quran',
    image: img(2),
    publishedAt: '2026-04-09',
    sections: [
      {
        paragraphs: [
          'Al-Fatihah is the opening of the Quran and a required part of each unit of prayer. It praises Allah, affirms His mercy and mastery of the Day of Judgment, and asks for the straight path.',
          'Its structure is a dialogue: servitude and request from the believer; guidance and mercy from the Lord.',
        ],
      },
      {
        heading: 'Bring it alive in salah',
        paragraphs: [
          'Pause mentally at “Guide us to the straight path,” imagining you are asking for clarity in today’s decisions.',
          'Study a short tafsir of Al-Fatihah once, then recite more slowly for a week. Many people report their prayer transforms with just this one surah understood.',
        ],
      },
    ],
  },
  {
    slug: 'what-is-halal-and-haram',
    title: 'What do halal and haram mean?',
    description:
      'A clear overview of lawful and unlawful in Islam—and how Muslims navigate everyday choices with knowledge.',
    durationMinutes: 6,
    category: 'Islam Basics',
    image: img(0),
    publishedAt: '2026-04-12',
    sections: [
      {
        paragraphs: [
          'Halal means permitted; haram means prohibited. Between them are recommended, disliked, and neutral actions. These categories help Muslims align lifestyle with revelation.',
          'Major examples include honesty in finance, modest conduct, lawful food and drink, and avoiding oppression—though details often need reliable scholarship for complex cases.',
        ],
      },
      {
        heading: 'Learning with balance',
        paragraphs: [
          'Beginners should prioritize clear obligations and clear prohibitions before diving into disputed issues. Intention and seeking knowledge protect against both negligence and extremism.',
          'When unsure, ask a trusted teacher and choose the safer path without burdening others. The Quran encourages ease within the limits God set.',
        ],
      },
    ],
  },
  {
    slug: 'benefits-of-charity-and-zakat',
    title: 'Charity and zakat: purifying wealth and community',
    description:
      'How giving cleanses the heart, supports the vulnerable, and fulfills a pillar of Islam.',
    durationMinutes: 5,
    category: 'Character',
    image: img(1),
    publishedAt: '2026-04-16',
    sections: [
      {
        paragraphs: [
          'Zakat is an obligatory share of certain wealth given yearly to eligible recipients. Sadaqah is voluntary charity of any amount, anytime—including a smile or helping hand.',
          'Both train the heart against greed and weave a safety net in the community.',
        ],
      },
      {
        heading: 'Give regularly, even if small',
        paragraphs: [
          'Automate a small weekly gift if you can. Support local needs you personally know: food, debt relief, or education.',
          'The Quran links spending in God’s way with growth—like a seed that multiplies—reminding us that generosity is investment in lasting reward.',
        ],
      },
    ],
  },
  {
    slug: 'how-to-stay-consistent-with-quran-daily',
    title: 'How to stay consistent with Quran every day',
    description:
      'Habit design for busy people—small portions, smart reminders, and gentle recovery after missed days.',
    durationMinutes: 5,
    category: 'Quran',
    image: img(2),
    publishedAt: '2026-04-20',
    sections: [
      {
        paragraphs: [
          'Consistency fails when goals are vague (“read more”) or unrealistically large. Replace them with a tiny floor: one page, one ayah with meaning, or five minutes of listening—every day.',
          'Attach Quran to an existing habit: after brushing teeth, after a prayer, or when locking your phone at night.',
        ],
      },
      {
        heading: 'Recover without guilt',
        paragraphs: [
          'Missed a day? Resume the next day without “making up” stress that kills motivation. Track streaks for encouragement, not shame.',
          'Rotate formats so boredom does not win: memorization one day, translation another, tajweed another. Variety keeps the relationship alive.',
        ],
      },
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}

export function getAllArticleSlugs(): string[] {
  return ARTICLES.map((article) => article.slug);
}

/** Newest first. */
export function getArticlesSorted(): Article[] {
  return [...ARTICLES].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

/**
 * Deterministic daily selection so the homepage shows a fresh trio each UTC day
 * without needing a CMS cron job.
 */
export function getDailyFeaturedArticles(count = 3, date = new Date()): Article[] {
  if (ARTICLES.length === 0) return [];
  const utcDay = Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000,
  );
  const start = ((utcDay % ARTICLES.length) + ARTICLES.length) % ARTICLES.length;
  const picks: Article[] = [];
  for (let i = 0; i < Math.min(count, ARTICLES.length); i += 1) {
    picks.push(ARTICLES[(start + i) % ARTICLES.length]);
  }
  return picks;
}

export function formatArticleDuration(minutes: number): string {
  return `${minutes} min read`;
}

export function formatArticleDate(iso: string): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00.000Z`));
}
