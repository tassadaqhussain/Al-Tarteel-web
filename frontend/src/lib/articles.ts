export type ArticleCategory =
  | 'Islam Basics'
  | 'Quran'
  | 'Worship'
  | 'History'
  | 'Character';

export interface ArticleSubsection {
  heading: string;
  paragraphs: string[];
}

export interface ArticleSection {
  heading?: string;
  paragraphs: string[];
  subsections?: ArticleSubsection[];
  links?: { label: string; href: string }[];
}

export interface ArticleFaq {
  question: string;
  answer: string;
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
  /** Optional ISO date when content was last materially updated */
  updatedAt?: string;
  author?: string;
  sections: ArticleSection[];
  sources?: string[];
  faqs?: ArticleFaq[];
  relatedSurahs?: number[];
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
    title: 'When Was Islam Created? Origins and History Explained',
    description:
      'Learn when Islam began in Islamic belief and in 7th-century history, from the first revelation in Makkah (610 CE) to the global community today.',
    durationMinutes: 7,
    category: 'Islam Basics',
    image: img(0),
    publishedAt: '2026-03-01',
    updatedAt: '2026-11-24',
    sections: [
      {
        heading: 'Two ways to answer when Islam began',
        paragraphs: [
          'When people ask when Islam was created, historians and Muslims often answer on two complementary levels. Historically, the final scripture of Islam—the Holy Quran—began to be revealed to the Prophet Muhammad ﷺ in Makkah around 610 CE, over a period of roughly 23 years.',
          'Theologically, however, Muslims do not view Islam as a brand-new religion invented in the 7th century. The Arabic word Islam means willful submission and peace with the One God (Allah). In Quranic teaching, every prophet from Adam onward brought that same foundational message: worship Allah alone and live with justice, honesty, and mercy.',
        ],
        links: [
          { label: 'Read Surah Al-Baqarah 2:136', href: '/al-baqarah/136' },
          { label: 'Read Surah Ali \'Imran 3:19', href: '/ali-imran/19' },
        ],
      },
      {
        heading: 'A continuous prophetic lineage',
        paragraphs: [
          'The Quran explicitly connects the mission of Prophet Muhammad ﷺ to earlier messengers known across Abrahamic traditions—including Nuh (Noah), Ibrahim (Abraham), Musa (Moses), Dawud (David), and Isa (Jesus), peace be upon them all.',
          'Each messenger addressed their own community in their own language, reminding people of tawhid (the oneness of God) and moral accountability. Over time, earlier communities diverged from or lost parts of those original teachings. Muslims believe the Quran was revealed as the final, preserved confirmation and completion of that timeless guidance.',
        ],
        subsections: [
          {
            heading: 'The first revelation in the Cave of Hira (610 CE)',
            paragraphs: [
              'At the age of forty, Muhammad ﷺ spent periods of quiet contemplation in the Cave of Hira outside Makkah. There, the Angel Jibril (Gabriel) delivered the opening verses of Surah Al-Alaq (96:1–5): "Read in the name of your Lord who created."',
              'For the first thirteen years in Makkah, revelation focused on belief in the One God, the certainty of the Hereafter, care for orphans and the poor, and patience under persecution. Chapters revealed during this period are known as Makki surahs.',
            ],
          },
          {
            heading: 'The Hijrah to Madinah (622 CE) and the Islamic calendar',
            paragraphs: [
              'In 622 CE, after sustained persecution in Makkah, the Prophet ﷺ and his companions migrated north to Madinah—an event called the Hijrah. So decisive was this moment in establishing a free, self-governing Muslim community that the Islamic lunar calendar (AH, Anno Hegirae) begins with the year of the Hijrah.',
              'During the ten Madinan years, revelation addressed communal worship, charity (zakat), fasting in Ramadan, pilgrimage (Hajj), family ethics, and treaties with neighboring tribes. By the time of the Prophet\'s ﷺ passing in 632 CE, the entire Quran had been memorized, recorded, and taught publicly.',
            ],
          },
        ],
        links: [
          { label: 'Read Surah Al-Alaq (First Revelation)', href: '/al-alaq' },
          { label: 'Browse All 114 Surahs', href: '/surahs' },
        ],
      },
      {
        heading: 'How Islam spread beyond Arabia',
        paragraphs: [
          'Within a few generations after 632 CE, Islam reached across North Africa, the Levant, Persia, Central Asia, and South Asia, and later spread through maritime trade and scholarship to Southeast Asia and Sub-Saharan Africa. Today, Muslims live in every region of the world, united by the same Arabic Quran and the five daily prayers.',
          'For anyone exploring Islam today, the most direct starting point is reading the Quran itself—beginning with Surah Al-Fatihah and short Makki chapters—alongside a clear translation.',
        ],
      },
    ],
    sources: [
      'The Holy Quran: Surah Al-Alaq (96:1–5), Surah Al-Baqarah (2:136), Surah Ali \'Imran (3:19).',
      'Sahih al-Bukhari, Book of Revelation (Hadith 3) — account of the first revelation in the Cave of Hira.',
    ],
    faqs: [
      {
        question: 'What year did Islam start historically?',
        answer:
          'The first revelation of the Quran to Prophet Muhammad ﷺ took place in Makkah around 610 CE. The Islamic calendar (Hijri) starts twelve years later in 622 CE, marking the migration to Madinah.',
      },
      {
        question: 'Why do Muslims say Islam began before the 7th century?',
        answer:
          'In Islamic belief, Islam means submission to the One God—the same core message taught by earlier prophets including Adam, Noah, Abraham, Moses, and Jesus (peace be upon them).',
      },
      {
        question: 'How long did it take for the Quran to be revealed?',
        answer:
          'The Quran was revealed gradually over approximately 23 years: 13 years in Makkah and 10 years in Madinah.',
      },
    ],
    relatedSurahs: [96, 1, 112],
  },
  {
    slug: 'how-many-years-did-it-take-to-build',
    title: 'How Many Years Did It Take to Build the Kaaba?',
    description:
      'Does the Quran state how many years it took to build the Kaaba? Explore the scriptural account of Ibrahim and Ismail, plus every major rebuild in history.',
    durationMinutes: 9,
    category: 'History',
    image: img(1),
    publishedAt: '2026-03-02',
    updatedAt: '2026-11-24',
    sections: [
      {
        heading: 'The direct answer: does scripture give a construction timeline?',
        paragraphs: [
          'Neither the Holy Quran nor authentic prophetic narrations (hadith) specify an exact number of years or months it took Prophet Ibrahim (Abraham) and his son Ismail (peace be upon them) to build the Kaaba. Instead of a construction schedule, the Quran highlights who raised its foundations, why it was built, and the prayer they made as they worked.',
          'In Surah Al-Baqarah (2:127), Allah records: "And [mention] when Abraham was raising the foundations of the House and [with him] Ishmael, [saying], \'Our Lord, accept [this] from us. Indeed You are the Hearing, the Knowing.\'" Because the Kaaba was built as a modest, roofless stone enclosure in the valley of Makkah using locally gathered stones, classical historians note that its original construction did not require decades of imperial labor like ancient pyramids or cathedrals.',
        ],
        links: [
          { label: 'Read Surah Al-Baqarah 2:125–127', href: '/al-baqarah/127' },
          { label: 'Read Surah Ali \'Imran 3:96', href: '/ali-imran/96' },
        ],
      },
      {
        heading: 'The Kaaba in the Quran: the first House of worship',
        paragraphs: [
          'Surah Ali \'Imran (3:96) describes the Sanctuary in Makkah as "the first House [of worship] established for mankind"—blessed and a source of guidance for the worlds. In Surah Al-Hajj (22:26–27), Allah instructs Prophet Ibrahim to purify the House for those who circumambulate it (tawaf), stand in prayer, and bow and prostrate, and to proclaim the pilgrimage (Hajj) to humanity.',
          'Similarly, in Surah Ibrahim (14:37), Prophet Ibrahim prays for his family settled in the uncultivated valley near the Sacred House so that they may establish prayer and that hearts would incline toward it. The emphasis throughout revelation is spiritual purpose rather than architectural grandeur.',
        ],
        subsections: [
          {
            heading: 'Maqam Ibrahim (The Station of Abraham)',
            paragraphs: [
              'As the walls of the Kaaba grew taller than Ibrahim\'s reach, he stood upon a large stone to lay the upper courses. That stone—preserved today in a glass-and-brass enclosure beside the Kaaba—is known as Maqam Ibrahim (the Station of Abraham), referenced directly in Surah Al-Baqarah (2:125).',
            ],
          },
          {
            heading: 'How big was the original Kaaba?',
            paragraphs: [
              'Today the Kaaba stands roughly 13.1 meters (43 feet) tall, with sides measuring approximately 11 to 12.8 meters. Its interior is simple and uncluttered, housing three wooden support pillars and a marble floor. The semi-circular low wall on the northwest side—called the Hatim or Hijr Ismail—marks part of the original foundations laid by Ibrahim that were left outside the rectangular roofed structure during the Quraysh rebuild.',
            ],
          },
        ],
        links: [
          { label: 'Read Surah Al-Hajj 22:26', href: '/al-hajj/26' },
          { label: 'Read Surah Ibrahim 14:37', href: '/ibrahim/37' },
        ],
      },
      {
        heading: 'Major reconstructions of the Kaaba across history',
        paragraphs: [
          'Because Makkah sits in a desert valley prone to periodic flash floods, the Kaaba has been repaired and rebuilt several times over the centuries. Unlike the original Abrahamic construction, later historical reconstructions have documented timelines—typically taking a few months rather than years.',
        ],
        subsections: [
          {
            heading: '1. The Quraysh rebuild (~605 CE)',
            paragraphs: [
              'About five years before prophethood, flash floods weakened the Kaaba\'s walls. The tribes of Quraysh agreed to rebuild it using only ethically earned funds. Because their lawful funds fell short of covering the entire original footprint, they shortened the northern side and marked the remaining area with the low curved wall (al-Hatim). When tribes nearly came to blows over who would set the Black Stone (Hajar al-Aswad) in place, the thirty-five-year-old Muhammad ﷺ—known as al-Amin (the Trustworthy)—placed the stone on a cloak and invited every clan chief to lift a corner together, then set it in place with his own hands.',
            ],
          },
          {
            heading: '2. Abdullah ibn al-Zubayr (683 CE) and al-Hajjaj (693 CE)',
            paragraphs: [
              'After fire and siege damaged the structure in 683 CE, Abdullah ibn al-Zubayr rebuilt the Kaaba on the full foundations of Ibrahim, incorporating the Hatim and adding two ground-level doors based on what his aunt Aishah (may Allah be pleased with her) had heard from the Prophet ﷺ (Sahih al-Bukhari 1586; Sahih Muslim 1333). Ten years later, in 693 CE, Umayyad forces under al-Hajjaj ibn Yusuf restored the shorter Quraysh layout with a single elevated door, which remains the shape seen today.',
            ],
          },
          {
            heading: '3. The Ottoman rebuild under Sultan Murad IV (1630 CE)',
            paragraphs: [
              'In 1629–1630 CE, catastrophic flooding collapsed two of the Kaaba\'s walls. Ottoman engineers and craftsmen under Sultan Murad IV dismantled the damaged sections and rebuilt the structure using sturdy Makkan granite stones in roughly six months. That 1630 masonry still forms the core of the Kaaba\'s walls today.',
            ],
          },
          {
            heading: '4. The 1996 structural renovation',
            paragraphs: [
              'In 1996, a comprehensive conservation project replaced the decaying wooden roof and ceiling beams, reinforced the foundations, re-pointed the outer granite stones, and renewed the interior marble without altering the Kaaba\'s historic dimensions. The project took about five months.',
            ],
          },
        ],
      },
      {
        heading: 'Why the Kaaba matters to Muslims today',
        paragraphs: [
          'Muslims do not worship the Kaaba itself; it is made of stone and mortar and can neither harm nor benefit. Rather, it is the Qiblah—the single unified focal point toward which more than a billion Muslims turn five times each day in prayer, and around which pilgrims walk in humility during Hajj and Umrah.',
          'Whether you are studying Islamic history or preparing to deepen your focus in daily prayer, reading the Quranic passages about Prophet Ibrahim and the Sacred House brings the meaning of facing the Kaaba alive.',
        ],
      },
    ],
    sources: [
      'The Holy Quran: Surah Al-Baqarah (2:125–127), Surah Ali \'Imran (3:96–97), Surah Ibrahim (14:37), Surah Al-Hajj (22:26–29).',
      'Sahih al-Bukhari 1586 & Sahih Muslim 1333 — Aishah\'s narration regarding the foundations of Ibrahim and the Quraysh rebuild.',
    ],
    faqs: [
      {
        question: 'How many years did it take Prophet Ibrahim to build the Kaaba?',
        answer:
          'Neither the Quran nor authentic hadith state an exact number of years or months for Ibrahim and Ismail\'s construction of the Kaaba. Later documented reconstructions—such as the 1630 Ottoman rebuild and the 1996 renovation—each took roughly five to six months.',
      },
      {
        question: 'Who built the Kaaba first?',
        answer:
          'In Surah Al-Baqarah (2:127), the Quran states that Prophet Ibrahim (Abraham) and his son Ismail raised the foundations of the House in Makkah as a sanctuary dedicated to the worship of Allah alone.',
      },
      {
        question: 'How many times has the Kaaba been rebuilt?',
        answer:
          'Historians record several major rebuilds after floods or damage, including the Quraysh rebuild (~605 CE), Abdullah ibn al-Zubayr (683 CE), al-Hajjaj ibn Yusuf (693 CE), the Ottoman rebuild under Sultan Murad IV (1630 CE), and the 1996 structural restoration.',
      },
      {
        question: 'Do Muslims worship the Kaaba?',
        answer:
          'No. Muslims worship Allah alone. The Kaaba is the Qiblah—the shared physical direction Muslims face during the five daily prayers as a symbol of unity and monotheism.',
      },
    ],
    relatedSurahs: [2, 3, 22],
  },
  {
    slug: 'benefits-of-reading-the-holy-quran',
    title: 'Benefits of Reading the Holy Quran Daily',
    description:
      'Discover the spiritual, mental, and practical benefits of reading the Holy Quran every day, grounded in Quranic verses, authentic hadith, and simple habits.',
    durationMinutes: 8,
    category: 'Quran',
    image: img(2),
    publishedAt: '2026-03-03',
    updatedAt: '2026-11-24',
    sections: [
      {
        heading: 'How the Quran describes its own purpose',
        paragraphs: [
          'The Quran introduces itself not as an abstract textbook, but as guidance, mercy, light, and healing for what is within human hearts. In Surah Yunus (10:57), Allah addresses humanity directly: "There has come to you instruction from your Lord and healing for what is in the breasts and guidance and mercy for the believers."',
          'Regular engagement with the Quran—reading the Arabic text, listening attentively, and reflecting on its meaning—gradually reshapes how a believer thinks, speaks, handles hardship, and relates to others.',
        ],
        links: [
          { label: 'Read Surah Yunus 10:57', href: '/yunus/57' },
          { label: 'Read Surah Al-Isra 17:82', href: '/al-isra/82' },
        ],
      },
      {
        heading: 'Spiritual rewards established in authentic hadith',
        paragraphs: [
          'Authentic prophetic narrations emphasize that Allah rewards both the fluent reader and the earnest learner who struggles to pronounce the Arabic letters.',
        ],
        subsections: [
          {
            heading: 'Reward for both fluent readers and beginners',
            paragraphs: [
              'Aishah (may Allah be pleased with her) narrated that the Prophet ﷺ said: "The one who is proficient in the recitation of the Quran will be with the honorable and obedient scribes (angels), and the one who recites the Quran and finds it difficult to recite, doing his best to recite it in the best way possible, will have a double reward." (Sahih al-Bukhari 4937; Sahih Muslim 798).',
              'This narration removes a major barrier for beginners: stumbling over unfamiliar letters is not a sign of failure—it is an act of devotion rewarded twice over.',
            ],
          },
          {
            heading: 'The Quran as an intercessor',
            paragraphs: [
              'In Sahih Muslim (804), Abu Umamah narrated that the Prophet ﷺ said: "Recite the Quran, for on the Day of Resurrection it will come as an intercessor for its companions." Companionship with the Quran means returning to it consistently rather than reserving it only for Ramadan.',
            ],
          },
        ],
      },
      {
        heading: 'Emotional calm and clarity of focus',
        paragraphs: [
          'Modern days are fragmented by constant notifications and urgency. Setting aside even ten quiet minutes to recite or listen to the Quran anchors the mind in remembrance (dhikr). As Surah Ar-Ra\'d (13:28) states, "Unquestionably, by the remembrance of Allah hearts are assured."',
          'Pairing recitation with a translation transforms daily prayer as well. When you understand the meanings of Surah Al-Fatihah, Surah Al-Ikhlas, or Surah Al-Mulk, salah shifts from rushed habit to focused conversation with Allah.',
        ],
        links: [
          { label: 'Read Surah Ar-Ra\'d 13:28', href: '/ar-rad/28' },
          { label: 'Read Surah Al-Mulk', href: '/al-mulk' },
        ],
      },
      {
        heading: 'Practical daily habits that actually stick',
        paragraphs: [
          'The secret to a lifelong relationship with the Quran is protecting a realistic daily floor rather than chasing occasional marathons. Choose one fixed anchor—such as five minutes after Fajr, during a quiet break, or before sleep—and show up every day.',
          'On QuranPilot, you can start with short surahs from Juz 30, turn on word-by-word meanings, study foundational Tajweed rules, and follow verse-by-verse audio recitation at your own pace.',
        ],
        links: [
          { label: 'Explore Tajweed Lessons', href: '/tajweed' },
          { label: 'Start a Quran Learning Plan', href: '/learning-plans' },
        ],
      },
    ],
    sources: [
      'The Holy Quran: Surah Yunus (10:57), Surah Ar-Ra\'d (13:28), Surah Al-Isra (17:82).',
      'Sahih al-Bukhari 4937 & Sahih Muslim 798 — reward of the proficient reciter and the struggling learner.',
      'Sahih Muslim 804 — the Quran coming as an intercessor for its companions.',
    ],
    faqs: [
      {
        question: 'Do I still get reward if I read the Quran slowly or struggle with Arabic?',
        answer:
          'Yes. In Sahih al-Bukhari (4937) and Sahih Muslim (798), the Prophet ﷺ specifically affirmed that the one who recites the Quran with difficulty while striving to do their best receives a double reward.',
      },
      {
        question: 'How much Quran should a beginner read each day?',
        answer:
          'Even five to ten minutes a day—such as half a page or a short surah with its translation—is far more sustainable and transformative than sporadic long sessions.',
      },
      {
        question: 'Which surahs are best to start reading daily?',
        answer:
          'Many readers begin with Surah Al-Fatihah, the last three surahs (Al-Ikhlas, Al-Falaq, An-Nas), Surah Al-Mulk before sleep, and Surah Al-Kahf on Fridays.',
      },
    ],
    relatedSurahs: [1, 67, 18],
  },
  {
    slug: 'what-is-tawhid-oneness-of-god',
    title: 'What Is Tawhid? The Heart of Islamic Belief',
    description:
      'A clear introduction to tawhid (the oneness of God) in the Quran—its meaning, its expression in Surah Al-Ikhlas and Ayatul Kursi, and how it shapes daily life.',
    durationMinutes: 7,
    category: 'Islam Basics',
    image: img(0),
    publishedAt: '2026-03-08',
    updatedAt: '2026-11-24',
    sections: [
      {
        heading: 'What tawhid means in Islam',
        paragraphs: [
          'Tawhid is the foundational principle of Islam: affirming that Allah is One, Unique, and alone worthy of worship. He has no partner in creation, no rival in sovereignty, and nothing in existence resembles Him.',
          'Every pillar of Islamic practice—from the testimony of faith (shahadah) to the five daily prayers—flows from tawhid. The Quran summarizes this creed most concisely in Surah Al-Ikhlas (112:1–4) and most expansively in Ayatul Kursi (2:255).',
        ],
        links: [
          { label: 'Read Surah Al-Ikhlas', href: '/al-ikhlas' },
          { label: 'Read Ayatul Kursi (2:255)', href: '/al-baqarah/255' },
        ],
      },
      {
        heading: 'Three complementary dimensions of tawhid',
        paragraphs: [
          'To help students understand how the Quran speaks about God, classical scholars often explain tawhid through three interconnected dimensions:',
        ],
        subsections: [
          {
            heading: '1. Oneness of Lordship (Tawhid ar-Rububiyyah)',
            paragraphs: [
              'Affirming that Allah alone is the Creator, Sustainer, and Sovereign of the universe. Life, death, rain, provision, and the laws of nature all exist by His will and knowledge.',
            ],
          },
          {
            heading: '2. Oneness of Worship (Tawhid al-Uluhiyyah)',
            paragraphs: [
              'Directing all acts of worship—prayer, supplication (dua), trust (tawakkul), hope, and awe—exclusively to Allah. As believers recite in every prayer in Surah Al-Fatihah (1:5): "It is You we worship and You we ask for help."',
            ],
          },
          {
            heading: '3. Oneness of Names and Attributes (Tawhid al-Asma was-Sifat)',
            paragraphs: [
              'Knowing Allah through the Beautiful Names He revealed about Himself in the Quran—such as Ar-Rahman (the Most Merciful), Al-Alim (the All-Knowing), Al-Adl (the Utterly Just), and As-Samad (the Eternal Refuge)—without likening Him to created beings.',
            ],
          },
        ],
      },
      {
        heading: 'How tawhid liberates everyday life',
        paragraphs: [
          'Tawhid is not merely an abstract theological formula; it frees the human heart. When a person knows that ultimate benefit, harm, and provision rest solely with Allah, superstition, fear of people\'s opinions, and despair lose their power.',
          'At the same time, tawhid humbles arrogance: because every human being stands equally before one Creator, dignity is measured by sincerity and character rather than wealth or status.',
        ],
      },
    ],
    sources: [
      'The Holy Quran: Surah Al-Fatihah (1:5), Surah Al-Baqarah (2:255), Surah Al-Ikhlas (112:1–4).',
      'Sahih al-Bukhari 5013 & Sahih Muslim 811 — Surah Al-Ikhlas as one-third of the Quran.',
    ],
    faqs: [
      {
        question: 'Which surah best summarizes tawhid?',
        answer:
          'Surah Al-Ikhlas (Chapter 112) is the most concise summary of tawhid in the Quran, affirming Allah\'s absolute oneness, self-sufficiency, and uniqueness in four verses.',
      },
      {
        question: 'What is the opposite of tawhid?',
        answer:
          'The opposite of tawhid is shirk—associating partners with Allah in His divinity, lordship, or exclusive right to worship.',
      },
    ],
    relatedSurahs: [112, 1, 2],
  },
  {
    slug: 'five-pillars-of-islam-explained',
    title: 'The Five Pillars of Islam Explained Simply',
    description:
      'A clear guide to the Five Pillars of Islam—Shahadah, Salah, Zakat, Sawm, and Hajj—grounded in the Quran and authentic hadith.',
    durationMinutes: 7,
    category: 'Worship',
    image: img(1),
    publishedAt: '2026-03-10',
    updatedAt: '2026-11-24',
    sections: [
      {
        heading: 'The framework of Muslim worship',
        paragraphs: [
          'In a famous narration recorded in Sahih al-Bukhari (8) and Sahih Muslim (16), the Prophet Muhammad ﷺ explained that Islam is built upon five pillars: testifying that there is no deity worthy of worship except Allah and that Muhammad is the Messenger of Allah (Shahadah), establishing the five daily prayers (Salah), paying the purifying charity (Zakat), fasting the month of Ramadan (Sawm), and performing pilgrimage to the Sacred House in Makkah (Hajj) for those who are able.',
          'Together, these five acts connect private belief with daily rhythm, social responsibility, self-discipline, and global belonging.',
        ],
      },
      {
        heading: 'Each of the Five Pillars at a glance',
        paragraphs: [
          'Each pillar serves a distinct spiritual and practical role in a believer\'s life:',
        ],
        subsections: [
          {
            heading: '1. Shahadah (Testimony of Faith)',
            paragraphs: [
              'Declaring with conviction that none deserves worship except Allah and that Muhammad ﷺ is His final messenger. It is the doorway into Islam and the anchor of every other act of worship.',
            ],
          },
          {
            heading: '2. Salah (Five Daily Prayers)',
            paragraphs: [
              'Performed at dawn (Fajr), midday (Dhuhr), afternoon (Asr), sunset (Maghrib), and night (Isha), facing the Kaaba in Makkah. Salah interrupts worldly routine to renew gratitude, humility, and remembrance of Allah.',
            ],
          },
          {
            heading: '3. Zakat (Obligatory Charity)',
            paragraphs: [
              'An annual obligation—commonly 2.5% of qualifying savings held for a lunar year above the nisab threshold—distributed to eligible recipients mentioned in Surah At-Tawbah (9:60). Zakat purifies wealth and protects the vulnerable.',
            ],
          },
          {
            heading: '4. Sawm (Fasting in Ramadan)',
            paragraphs: [
              'Abstaining from food, drink, and marital relations from dawn to sunset during the ninth lunar month, Ramadan. As Surah Al-Baqarah (2:183) states, fasting is prescribed to cultivate taqwa (God-consciousness).',
            ],
          },
          {
            heading: '5. Hajj (Pilgrimage to Makkah)',
            paragraphs: [
              'A once-in-a-lifetime obligation for adult Muslims who have the physical and financial means. Pilgrims gather in Makkah wearing simple garments, erasing distinctions of race and wealth in shared devotion to Allah.',
            ],
          },
        ],
        links: [
          { label: 'Read Surah Al-Baqarah 2:183', href: '/al-baqarah/183' },
          { label: 'Read Surah Al-Hajj', href: '/al-hajj' },
        ],
      },
    ],
    sources: [
      'Sahih al-Bukhari 8 & Sahih Muslim 16 — the Hadith of the Five Pillars.',
      'The Holy Quran: Surah Al-Baqarah (2:183), Surah At-Tawbah (9:60), Surah Ali \'Imran (3:97).',
    ],
    faqs: [
      {
        question: 'Are all Five Pillars required for every Muslim immediately?',
        answer:
          'Shahadah and Salah apply to every adult Muslim, while Zakat applies only to those whose savings exceed the nisab threshold, fasting exempts the ill or traveling (to be made up later), and Hajj is required once in a lifetime only for those physically and financially able.',
      },
    ],
    relatedSurahs: [1, 2, 22],
  },
  {
    slug: 'how-to-start-reading-quran-as-a-beginner',
    title: 'How to Start Reading the Quran as a Beginner',
    description:
      'A practical step-by-step guide for beginners to read the Quran online—from short surahs and audio recitation to translations and Tajweed basics.',
    durationMinutes: 7,
    category: 'Quran',
    image: img(2),
    publishedAt: '2026-03-14',
    updatedAt: '2026-11-24',
    sections: [
      {
        heading: 'Begin with clarity, not perfection',
        paragraphs: [
          'Many beginners delay opening the Quran because they feel they must master Arabic grammar or memorize every Tajweed rule first. In reality, the best approach is a simple daily routine that pairs clear audio recitation with a reliable translation in your own language.',
          'Start with Surah Al-Fatihah and the short chapters of Juz 30 (Juz Amma), such as Surah Al-Ikhlas, Surah Al-Falaq, Surah An-Nas, and Surah Al-Asr. These chapters are concise, frequently recited in daily prayer, and rich with foundational themes.',
        ],
        links: [
          { label: 'Read Surah Al-Fatihah', href: '/al-fatihah' },
          { label: 'Browse Juz 30', href: '/juz/30' },
        ],
      },
      {
        heading: 'A sustainable 15-minute daily plan',
        paragraphs: [
          'Divide a short fifteen-minute window into three focused steps that build fluency and understanding together:',
        ],
        subsections: [
          {
            heading: 'Minutes 1–5: Listen and follow along',
            paragraphs: [
              'Choose one clear reciter and play 3 to 5 verses while following the Arabic text on screen. Hearing accurate pronunciation trains your ear naturally.',
            ],
          },
          {
            heading: 'Minutes 6–10: Read aloud with word-by-word support',
            paragraphs: [
              'Recite the same verses aloud slowly. Use transliteration and word-by-word meanings only as training wheels while you grow comfortable with the Arabic script and basic Tajweed rules.',
            ],
          },
          {
            heading: 'Minutes 11–15: Reflect on the meaning',
            paragraphs: [
              'Read the translation of those same verses and note one practical takeaway for your day—a habit to strengthen, a prayer to make, or an attribute of Allah to remember.',
            ],
          },
        ],
        links: [
          { label: 'Learn Tajweed Basics', href: '/tajweed' },
          { label: 'Browse Learning Plans', href: '/learning-plans' },
        ],
      },
    ],
    sources: [
      'Sahih al-Bukhari 4937 & Sahih Muslim 798 — double reward for the learner who strives through difficulty.',
      'The Holy Quran: Surah Al-Qamar (54:17) — "And We have certainly made the Quran easy for remembrance."',
    ],
    faqs: [
      {
        question: 'Can I read the Quran in English if I cannot read Arabic yet?',
        answer:
          'Yes. Reading a trusted translation helps you understand Allah\'s message immediately while you gradually learn the Arabic letters and listen to Arabic recitation.',
      },
      {
        question: 'Which surah should a beginner read first?',
        answer:
          'Begin with Surah Al-Fatihah (Chapter 1) and the closing chapters of Juz 30 (Surahs 112–114), then move to Surah Al-Mulk (67) or Surah Al-Kahf (18).',
      },
    ],
    relatedSurahs: [1, 112, 67],
  },
  {
    slug: 'why-muslims-pray-five-times-a-day',
    title: 'Why Muslims Pray Five Times a Day',
    description:
      'Discover the spiritual and practical wisdom behind the five daily prayers (Salah) in Islam, their appointed times, and how to build focus in prayer.',
    durationMinutes: 6,
    category: 'Worship',
    image: img(0),
    publishedAt: '2026-03-18',
    updatedAt: '2026-11-24',
    sections: [
      {
        heading: 'The rhythm of the five daily prayers',
        paragraphs: [
          'Salah is the second pillar of Islam and the most frequent act of worship in a Muslim\'s life. At five appointed windows—Fajr (before sunrise), Dhuhr (after midday), Asr (late afternoon), Maghrib (just after sunset), and Isha (night)—believers pause worldly responsibilities to stand, bow, and prostrate before Allah.',
          'The Quran describes prayer as a safeguard for the heart and character: "Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater" (Surah Al-Ankabut 29:45).',
        ],
        links: [
          { label: 'Read Surah Al-Ankabut 29:45', href: '/al-ankabut/45' },
          { label: 'Read Surah Al-Fatihah', href: '/al-fatihah' },
        ],
      },
      {
        heading: 'More than a routine: resetting the heart throughout the day',
        paragraphs: [
          'Spreading prayer across the entire day prevents faith from becoming a once-a-week compartment. Dawn prayer starts the morning with gratitude before distractions accumulate; midday and afternoon prayers interrupt stress and haste; sunset and night prayers close the day in reflection and forgiveness.',
          'To deepen focus (khushu), learn the meanings of Surah Al-Fatihah and the short surahs you recite most often, silence notifications before standing, and slow your recitation by a few seconds.',
        ],
      },
    ],
    sources: [
      'The Holy Quran: Surah Al-Ankabut (29:45), Surah An-Nisa (4:103), Surah Ta-Ha (20:14).',
      'Sahih al-Bukhari 528 & Sahih Muslim 667 — the parable of the five daily prayers as a flowing river cleansing one\'s sins.',
    ],
    faqs: [
      {
        question: 'What are the names of the five daily prayers?',
        answer:
          'The five obligatory daily prayers are Fajr (dawn), Dhuhr (noon), Asr (afternoon), Maghrib (sunset), and Isha (night).',
      },
    ],
    relatedSurahs: [1, 29, 107],
  },
  {
    slug: 'what-is-ramadan-and-why-muslims-fast',
    title: 'What Is Ramadan and Why Do Muslims Fast?',
    description:
      'Learn the meaning of Ramadan, the month in which the Quran was revealed, and how fasting from dawn to sunset cultivates taqwa, gratitude, and charity.',
    durationMinutes: 6,
    category: 'Worship',
    image: img(1),
    publishedAt: '2026-03-22',
    updatedAt: '2026-11-24',
    sections: [
      {
        heading: 'The month of the Quran and fasting',
        paragraphs: [
          'Ramadan is the ninth month of the Islamic lunar calendar and the month in which the revelation of the Holy Quran began (Surah Al-Baqarah 2:185). During Ramadan, adult Muslims who are able fast daily from dawn (Fajr) until sunset (Maghrib), abstaining from food, drink, and intimate relations while increasing Quran recitation, night prayers, and charity.',
          'In Surah Al-Baqarah (2:183), Allah states the core objective of fasting clearly: "O you who have believed, decreed upon you is fasting as it was decreed upon those before you that you may become righteous (taqwa)."',
        ],
        links: [
          { label: 'Read Surah Al-Baqarah 2:183–185', href: '/al-baqarah/185' },
          { label: 'Read Surah Al-Qadr', href: '/al-qadr' },
        ],
      },
      {
        heading: 'Spiritual discipline and empathy that outlast the month',
        paragraphs: [
          'Fasting trains self-restraint: if a believer can step back from lawful food and water for Allah\'s sake, they gain strength to step back from anger, gossip, and harmful habits throughout the year.',
          'Experiencing hunger also deepens genuine empathy for those who live with scarcity, prompting increased generosity, shared evening meals (iftar), and charitable giving culminating in Zakat al-Fitr before Eid.',
        ],
      },
    ],
    sources: [
      'The Holy Quran: Surah Al-Baqarah (2:183–185), Surah Al-Qadr (97:1–5).',
      'Sahih al-Bukhari 1901 & Sahih Muslim 760 — fasting Ramadan with faith and seeking reward.',
    ],
    faqs: [
      {
        question: 'Why does Ramadan move earlier each year?',
        answer:
          'Because the Islamic Hijri calendar is lunar (354 or 355 days), Ramadan shifts approximately 10 to 11 days earlier each Gregorian year.',
      },
    ],
    relatedSurahs: [2, 97, 1],
  },
  {
    slug: 'who-was-prophet-muhammad',
    title: 'Who Was Prophet Muhammad ﷺ? Life, Character, and Message',
    description:
      'A concise, accurate overview of the life of Prophet Muhammad ﷺ—his upbringing in Makkah, his revelation of the Quran, and his lasting moral example.',
    durationMinutes: 8,
    category: 'History',
    image: img(2),
    publishedAt: '2026-03-26',
    updatedAt: '2026-11-24',
    sections: [
      {
        heading: 'Early life in Makkah',
        paragraphs: [
          'Prophet Muhammad ﷺ was born in Makkah around 570 CE. Orphaned young and raised first by his grandfather Abd al-Muttalib and then by his uncle Abu Talib, he grew up known across Makkan society as as-Sadiq al-Amin—the Truthful and the Trustworthy.',
          'Even before prophethood, he stood against tribal injustice, honored agreements, and sought quiet reflection away from idol worship. At age forty (610 CE), he received the first revelation of the Quran in the Cave of Hira.',
        ],
        links: [
          { label: 'Read Surah Al-Ahzab 33:21', href: '/al-ahzab/21' },
          { label: 'Read Surah Al-Anbiya 21:107', href: '/al-anbiya/107' },
        ],
      },
      {
        heading: 'His mission and character in the Quran',
        paragraphs: [
          'Muslims believe Muhammad ﷺ is the final messenger of Allah, sent "as a mercy to the worlds" (Surah Al-Anbiya 21:107). Over 23 years in Makkah and Madinah, he conveyed the Quran, established a community rooted in worship and social justice, and modeled humility, forgiveness, and honesty in everyday life.',
          'Surah Al-Qalam (68:4) affirms his moral stature directly: "And indeed, you are of a great moral character." When Aishah (may Allah be pleased with her) was asked to describe his character, she replied: "His character was the Quran" (Sahih Muslim 746).',
        ],
      },
    ],
    sources: [
      'The Holy Quran: Surah Al-Anbiya (21:107), Surah Al-Ahzab (33:21), Surah Al-Qalam (68:4).',
      'Sahih Muslim 746 — Aishah describing the Prophet\'s ﷺ character as the Quran.',
    ],
    faqs: [
      {
        question: 'Where and when was Prophet Muhammad ﷺ born?',
        answer:
          'Prophet Muhammad ﷺ was born in Makkah in the Arabian Peninsula around 570 CE and passed away in Madinah in 632 CE.',
      },
    ],
    relatedSurahs: [33, 68, 47],
  },
  {
    slug: 'importance-of-good-character-in-islam',
    title: 'Why Good Character (Akhlaq) Is Central in Islam',
    description:
      'How honesty, kindness, patience, and humility complete Islamic worship—backed by Quranic verses and authentic prophetic teachings.',
    durationMinutes: 6,
    category: 'Character',
    image: img(0),
    publishedAt: '2026-04-01',
    updatedAt: '2026-11-24',
    sections: [
      {
        heading: 'Faith and ethics are inseparable',
        paragraphs: [
          'In Islam, worship is never isolated from how a person treats others. Surah Al-Ma\'un (107:1–7) warns explicitly against empty ritual divorced from compassion for orphans, the poor, and neighbors.',
          'The Prophet ﷺ linked faith directly with moral excellence, saying: "The best among you are those who have the best manners and character" (Sahih al-Bukhari 3559).',
        ],
        links: [
          { label: 'Read Surah Al-Ma\'un', href: '/al-maun' },
          { label: 'Read Surah Al-Hujurat', href: '/al-hujurat' },
        ],
      },
      {
        heading: 'Building Quranic character one habit at a time',
        paragraphs: [
          'Surah Al-Hujurat (Chapter 49) offers a timeless manual for healthy communities: verify news before sharing it, reconcile disputes fairly, avoid mocking or backbiting others, and judge people by righteousness rather than lineage.',
          'Choose one concrete habit each week—speaking gently under frustration, honoring a promise promptly, or checking on an elderly relative—and measure spiritual growth through both prayer and conduct.',
        ],
      },
    ],
    sources: [
      'The Holy Quran: Surah Al-Hujurat (49:11–13), Surah Al-Ma\'un (107:1–7).',
      'Sahih al-Bukhari 3559 — "The best among you are those who have the best manners and character."',
    ],
    relatedSurahs: [49, 107, 31],
  },
  {
    slug: 'how-to-make-dua-that-feels-real',
    title: 'How to Make Dua That Feels Real and Sincere',
    description:
      'A clear guide to personal supplication (dua) in Islam—Quranic verses on Allah\'s nearness, prophetic etiquette, and trusting Allah\'s answer.',
    durationMinutes: 6,
    category: 'Worship',
    image: img(1),
    publishedAt: '2026-04-05',
    updatedAt: '2026-11-24',
    sections: [
      {
        heading: 'Allah is near when you call upon Him',
        paragraphs: [
          'Dua is direct, unfiltered conversation with Allah—praising Him, thanking Him, seeking forgiveness, and asking for needs of this life and the Hereafter. In Surah Al-Baqarah (2:186), Allah reassures believers directly: "And when My servants ask you concerning Me—indeed I am near. I respond to the invocation of the supplicant when he calls upon Me."',
          'You may make dua in any language you speak from the heart, while also learning the concise prophetic and Quranic supplications such as "Rabbana atina fid-dunya hasanah..." (Surah Al-Baqarah 2:201).',
        ],
        links: [
          { label: 'Read Surah Al-Baqarah 2:186', href: '/al-baqarah/186' },
          { label: 'Read Surah Al-Baqarah 2:201', href: '/al-baqarah/201' },
        ],
      },
      {
        heading: 'Etiquette and persistence without despair',
        paragraphs: [
          'Begin by praising Allah and sending blessings upon the Prophet ﷺ, ask with humility and certainty, and pair supplication with practical effort. Recommended moments include the last third of the night, during prostration (sujud) in prayer, and between the adhan and iqamah.',
          'Keep asking with patience: trust that Allah responds in the wisest form and timing—granting what you requested, averting unseen harm, or storing reward for the Hereafter.',
        ],
      },
    ],
    sources: [
      'The Holy Quran: Surah Al-Baqarah (2:186, 2:201), Surah Ghafir (40:60).',
    ],
    relatedSurahs: [2, 1, 14],
  },
  {
    slug: 'understanding-surah-al-fatihah',
    title: 'Understanding Surah Al-Fatihah: Meaning and Structure',
    description:
      'A verse-by-verse reflection on Surah Al-Fatihah (The Opening), why it is recited in every prayer, and how its dialogue transforms daily salah.',
    durationMinutes: 7,
    category: 'Quran',
    image: img(2),
    publishedAt: '2026-04-09',
    updatedAt: '2026-11-24',
    sections: [
      {
        heading: 'The Opening of the Quran and of every prayer',
        paragraphs: [
          'Surah Al-Fatihah is the first chapter of the Holy Quran and a required pillar of every unit (rak\'ah) of daily prayer (Sahih al-Bukhari 756; Sahih Muslim 394). Its seven verses move gracefully from praising Allah, affirming His mercy and justice, and declaring exclusive worship, to asking for guidance along the straight path.',
          'In a celebrated Hadith Qudsi (Sahih Muslim 395), Allah explains that He has divided Surah Al-Fatihah into two halves between Himself and His servant—responding directly to each verse as the believer recites it.',
        ],
        links: [
          { label: 'Read Surah Al-Fatihah with Audio', href: '/al-fatihah' },
          { label: 'Read Al-Fatihah 1:1', href: '/al-fatihah/1' },
        ],
      },
      {
        heading: 'Bringing Al-Fatihah alive in daily salah',
        paragraphs: [
          'Because we recite Al-Fatihah at least seventeen times a day in obligatory prayers, familiarity can easily turn into speed. Pausing briefly at the end of each verse—especially at "It is You we worship and You we ask for help" (1:5) and "Guide us to the straight path" (1:6)—restores presence and transforms every prayer.',
        ],
      },
    ],
    sources: [
      'The Holy Quran: Surah Al-Fatihah (1:1–7).',
      'Sahih al-Bukhari 756, 4474; Sahih Muslim 394, 395.',
    ],
    relatedSurahs: [1, 2, 112],
  },
  {
    slug: 'what-is-halal-and-haram',
    title: 'What Do Halal and Haram Mean in Islam?',
    description:
      'A clear overview of halal (lawful) and haram (prohibited) in Islamic ethics—covering food, honest finance, conduct, and balanced learning.',
    durationMinutes: 6,
    category: 'Islam Basics',
    image: img(0),
    publishedAt: '2026-04-12',
    updatedAt: '2026-11-24',
    sections: [
      {
        heading: 'Understanding lawful and unlawful boundaries',
        paragraphs: [
          'In Islamic ethics, halal means permitted and haram means prohibited. Far from being restricted to food alone, these principles guide honesty in business, integrity in speech, lawful earnings, and protecting human dignity.',
          'The general rule in everyday worldly matters is permissibility unless clear evidence from the Quran or Sunnah prohibits something harmful—such as intoxicants, usury (riba), fraud, or oppression.',
        ],
        links: [
          { label: 'Read Surah Al-Baqarah 2:168', href: '/al-baqarah/168' },
          { label: 'Read Surah Al-Ma\'idah', href: '/al-maidah' },
        ],
      },
      {
        heading: 'Navigating choices with balance and knowledge',
        paragraphs: [
          'Beginners benefit most by focusing on clear obligations and clear prohibitions first, while consulting qualified teachers on nuanced contemporary questions. Islam emphasizes ease, sincerity, and avoiding harm without inventing unnecessary hardship.',
        ],
      },
    ],
    sources: [
      'The Holy Quran: Surah Al-Baqarah (2:168, 2:172–173), Surah Al-A\'raf (7:157).',
      'Sahih al-Bukhari 52 & Sahih Muslim 1599 — "The lawful is clear and the unlawful is clear."',
    ],
    relatedSurahs: [2, 5, 7],
  },
  {
    slug: 'benefits-of-charity-and-zakat',
    title: 'Charity and Zakat: Purifying Wealth and Uplifting Community',
    description:
      'Understand the difference between Zakat and Sadaqah in the Quran, how charity purifies the heart, and practical ways to give consistently.',
    durationMinutes: 6,
    category: 'Character',
    image: img(1),
    publishedAt: '2026-04-16',
    updatedAt: '2026-11-24',
    sections: [
      {
        heading: 'Zakat and Sadaqah in the Quran',
        paragraphs: [
          'Zakat is an obligatory annual charity—one of the Five Pillars of Islam—paid by eligible Muslims whose qualifying wealth remains above the nisab threshold for a lunar year. Sadaqah is voluntary charity of any kind, from financial support to a kind word, removing harm from a path, or smiling at a neighbor.',
          'In Surah Al-Baqarah (2:261), the Quran compares spending sincerely in Allah\'s path to a single grain that grows seven ears, each bearing a hundred grains—reminding believers that generosity never diminishes true blessing.',
        ],
        links: [
          { label: 'Read Surah Al-Baqarah 2:261', href: '/al-baqarah/261' },
          { label: 'Read Surah At-Tawbah 9:60', href: '/at-tawbah/60' },
        ],
      },
      {
        heading: 'Making generosity a steady habit',
        paragraphs: [
          'Consistent small giving trains the heart away from greed and keeps communities resilient. Support local food banks, educational initiatives, or neighbors in need, and keep charity dignified and free from reminding others of your favor (Surah Al-Baqarah 2:264).',
        ],
      },
    ],
    sources: [
      'The Holy Quran: Surah Al-Baqarah (2:261–264), Surah At-Tawbah (9:60).',
    ],
    relatedSurahs: [2, 9, 107],
  },
  {
    slug: 'how-to-stay-consistent-with-quran-daily',
    title: 'How to Stay Consistent with the Quran Every Day',
    description:
      'Practical habit design for busy readers—how to build a daily Quran routine, recover after missed days, and keep recitation meaningful year-round.',
    durationMinutes: 6,
    category: 'Quran',
    image: img(2),
    publishedAt: '2026-04-20',
    updatedAt: '2026-11-24',
    sections: [
      {
        heading: 'Why small, consistent portions win',
        paragraphs: [
          'In Sahih al-Bukhari (6464) and Sahih Muslim (782), the Prophet ﷺ taught that the most beloved deeds to Allah are those done consistently, even if they are small. Most Quran routines break down not from lack of love, but from setting an unsustainable initial goal.',
          'Instead of vague intentions to "read more," set a tiny non-negotiable floor—such as five verses with translation, half a page, or listening to Surah Al-Mulk before sleep—and tie it to an existing daily anchor like Fajr prayer.',
        ],
        links: [
          { label: 'Read Surah Al-Mulk', href: '/al-mulk' },
          { label: 'Try Quran in a Year', href: '/quran-in-year' },
        ],
      },
      {
        heading: 'Recovering smoothly after a missed day',
        paragraphs: [
          'When life interrupts your streak, resume the very next day without guilt or trying to binge-read to catch up. Rotating between reciting, listening to verse-by-verse audio, studying a Tajweed rule, and reflecting on one ayah keeps your connection fresh across seasons.',
        ],
        links: [
          { label: 'Browse Learning Plans', href: '/learning-plans' },
          { label: 'Explore Tajweed Rules', href: '/tajweed' },
        ],
      },
    ],
    sources: [
      'Sahih al-Bukhari 6464 & Sahih Muslim 782 — most beloved deeds are the most consistent, even if small.',
    ],
    relatedSurahs: [67, 18, 36],
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
