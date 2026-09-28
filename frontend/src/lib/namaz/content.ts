/**
 * Learn Namaz lesson content (v1).
 *
 * Rules for editing this file:
 * - Quran text is never stored here. Passages reference surah/ayah numbers and
 *   are loaded from QuranPilot's verified Quran API (Uthmani text, word
 *   transliteration, translation and recitation audio).
 * - Every supplication carries its source. Do not paraphrase Arabic; copy it
 *   from the cited collection and have it reviewed.
 * - Practice that differs between schools goes in `variations`, never in the
 *   shared `action` text.
 * - Mark content `reviewed` only after a qualified reviewer signs it off. Until
 *   then the UI shows a visible "awaiting review" notice.
 * - Guidance text is read aloud; avoid the words "pause" and "stop" so the
 *   app's own voice cannot trigger voice commands.
 * - Add a locale key (e.g. `ur`) only for reviewed translations; the UI falls
 *   back to English and says so.
 *
 * Hadith numbers follow the numbering used on sunnah.com (Muhammad Fu'ad
 * 'Abd al-Baqi numbering for Sahih Muslim).
 */
import type { NamazContent } from './types';

export const NAMAZ_CONTENT: NamazContent = {
  version: '2026-09-28',

  sources: [
    { id: 'quran', title: 'The Holy Quran', kind: 'quran' },
    { id: 'bukhari', title: 'Sahih al-Bukhari', kind: 'hadith', url: 'https://sunnah.com/bukhari:{ref}' },
    { id: 'muslim', title: 'Sahih Muslim', kind: 'hadith' },
    { id: 'abudawud', title: 'Sunan Abi Dawud', kind: 'hadith', url: 'https://sunnah.com/abudawud:{ref}' },
    { id: 'tirmidhi', title: "Jami' at-Tirmidhi", kind: 'hadith', url: 'https://sunnah.com/tirmidhi:{ref}' },
    { id: 'ibnmajah', title: 'Sunan Ibn Majah', kind: 'hadith', url: 'https://sunnah.com/ibnmajah:{ref}' },
    {
      id: 'quranpilot-quran-data',
      title: 'QuranPilot Quran database (Uthmani text; word transliteration from Quran.com)',
      kind: 'reference',
    },
  ],

  schools: [
    { id: 'hanafi', name: { en: 'Hanafi' } },
    { id: 'maliki', name: { en: 'Maliki' } },
    { id: 'shafii', name: { en: "Shafi'i" } },
    { id: 'hanbali', name: { en: 'Hanbali' } },
  ],

  dhikr: [
    {
      id: 'takbir',
      label: { en: 'Takbir' },
      arabic: 'اللَّهُ أَكْبَرُ',
      transliteration: 'Allāhu akbar',
      translation: { en: 'Allah is the Greatest.' },
      sources: [
        { sourceId: 'bukhari', locator: '757' },
        { sourceId: 'bukhari', locator: '789' },
      ],
      review: 'needs-review',
    },
    {
      id: 'opening-supplication',
      label: { en: 'Opening supplication (Thana)' },
      arabic:
        'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ',
      transliteration:
        'Subḥānaka-llāhumma wa bi-ḥamdika, wa tabāraka-smuka, wa taʿālā jadduka, wa lā ilāha ghayruk.',
      translation: {
        en: 'Glory be to You, O Allah, and praise. Blessed is Your Name, exalted is Your majesty, and there is no god other than You.',
      },
      sources: [
        { sourceId: 'abudawud', locator: '775' },
        { sourceId: 'tirmidhi', locator: '243' },
      ],
      review: 'needs-review',
    },
    {
      id: 'taawwudh',
      label: { en: "Seeking refuge (Ta'awwudh)" },
      arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
      transliteration: 'Aʿūdhu billāhi mina-sh-shayṭāni-r-rajīm.',
      translation: { en: 'I seek refuge in Allah from Satan, the rejected.' },
      sources: [{ sourceId: 'quran', locator: '16:98' }],
      review: 'needs-review',
    },
    {
      id: 'amin',
      label: { en: 'Amin' },
      arabic: 'آمِين',
      transliteration: 'Āmīn',
      translation: { en: 'O Allah, answer (our prayer).' },
      sources: [
        { sourceId: 'bukhari', locator: '780' },
        { sourceId: 'muslim', locator: '410' },
      ],
      review: 'needs-review',
    },
    {
      id: 'ruku-tasbih',
      label: { en: 'Glorification in bowing' },
      arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
      transliteration: 'Subḥāna rabbiya-l-ʿaẓīm',
      translation: { en: 'Glory be to my Lord, the Most Great.' },
      sources: [{ sourceId: 'muslim', locator: '772' }],
      repeat: {
        count: 3,
        note: {
          en: 'Commonly said three times. The minimum and the recommended number are described differently by the schools.',
        },
      },
      review: 'needs-review',
    },
    {
      id: 'tasmi',
      label: { en: 'Rising from bowing' },
      arabic: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ',
      transliteration: 'Samiʿa-llāhu li-man ḥamidah',
      translation: { en: 'Allah hears the one who praises Him.' },
      sources: [{ sourceId: 'bukhari', locator: '789' }],
      review: 'needs-review',
    },
    {
      id: 'tahmid',
      label: { en: 'Praise when standing up' },
      arabic: 'رَبَّنَا لَكَ الْحَمْدُ',
      transliteration: 'Rabbanā laka-l-ḥamd',
      translation: { en: 'Our Lord, to You belongs all praise.' },
      sources: [{ sourceId: 'bukhari', locator: '789' }],
      review: 'needs-review',
    },
    {
      id: 'sujud-tasbih',
      label: { en: 'Glorification in prostration' },
      arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
      transliteration: 'Subḥāna rabbiya-l-aʿlā',
      translation: { en: 'Glory be to my Lord, the Most High.' },
      sources: [{ sourceId: 'muslim', locator: '772' }],
      repeat: {
        count: 3,
        note: {
          en: 'Commonly said three times. The minimum and the recommended number are described differently by the schools.',
        },
      },
      review: 'needs-review',
    },
    {
      id: 'between-sujud',
      label: { en: 'Between the two prostrations' },
      arabic: 'رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي',
      transliteration: 'Rabbi-ghfir lī, rabbi-ghfir lī',
      translation: { en: 'My Lord, forgive me. My Lord, forgive me.' },
      sources: [
        { sourceId: 'abudawud', locator: '874' },
        { sourceId: 'ibnmajah', locator: '897' },
      ],
      review: 'needs-review',
    },
    {
      id: 'tashahhud',
      label: { en: 'Tashahhud' },
      arabic:
        'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
      transliteration:
        'At-taḥiyyātu lillāhi wa-ṣ-ṣalawātu wa-ṭ-ṭayyibāt. As-salāmu ʿalayka ayyuha-n-nabiyyu wa raḥmatu-llāhi wa barakātuh. As-salāmu ʿalaynā wa ʿalā ʿibādi-llāhi-ṣ-ṣāliḥīn. Ashhadu an lā ilāha illa-llāh, wa ashhadu anna Muḥammadan ʿabduhū wa rasūluh.',
      translation: {
        en: 'All greetings, prayers and good things are for Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and Messenger.',
      },
      sources: [
        { sourceId: 'bukhari', locator: '831' },
        { sourceId: 'muslim', locator: '402' },
      ],
      review: 'needs-review',
    },
    {
      id: 'salawat',
      label: { en: 'Blessings on the Prophet (Salawat)' },
      arabic:
        'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ',
      transliteration:
        'Allāhumma ṣalli ʿalā Muḥammadin wa ʿalā āli Muḥammad, kamā ṣallayta ʿalā Ibrāhīma wa ʿalā āli Ibrāhīm, innaka ḥamīdun majīd. Allāhumma bārik ʿalā Muḥammadin wa ʿalā āli Muḥammad, kamā bārakta ʿalā Ibrāhīma wa ʿalā āli Ibrāhīm, innaka ḥamīdun majīd.',
      translation: {
        en: 'O Allah, send prayers upon Muhammad and upon the family of Muhammad, as You sent prayers upon Ibrahim and the family of Ibrahim; You are Praiseworthy, Glorious. O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim; You are Praiseworthy, Glorious.',
      },
      sources: [{ sourceId: 'bukhari', locator: '3370' }],
      review: 'needs-review',
    },
    {
      id: 'salam',
      label: { en: 'Closing salam' },
      arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ',
      transliteration: 'As-salāmu ʿalaykum wa raḥmatu-llāh',
      translation: { en: 'Peace be upon you and the mercy of Allah.' },
      sources: [
        { sourceId: 'abudawud', locator: '996' },
        { sourceId: 'muslim', locator: '582' },
      ],
      review: 'needs-review',
    },
  ],

  quran: [
    { id: 'fatiha', label: { en: 'Surah Al-Fatihah' }, surah: 1, fromAyah: 1, toAyah: 7 },
    {
      id: 'dua-before-salam',
      label: { en: 'Supplication from the Quran (Al-Baqarah 2:201)' },
      surah: 2,
      fromAyah: 201,
      toAyah: 201,
    },
  ],

  /** Short surahs a beginner can choose to recite after Al-Fatihah. */
  shortSurahOptions: [
    { surah: 112, ayahCount: 4, name: { en: 'Al-Ikhlas (112)' } },
    { surah: 108, ayahCount: 3, name: { en: 'Al-Kawthar (108)' } },
    { surah: 103, ayahCount: 3, name: { en: "Al-'Asr (103)" } },
    { surah: 113, ayahCount: 5, name: { en: 'Al-Falaq (113)' } },
    { surah: 114, ayahCount: 6, name: { en: 'An-Nas (114)' } },
  ],

  steps: [
    {
      id: 'intention',
      position: 'standing',
      title: { en: 'Intention (niyyah)' },
      action: {
        en: 'Stand calmly and make the intention in your heart for the prayer you are about to perform, for example the two obligatory rak’ahs of Fajr.',
      },
      guidance: {
        en: 'Stand calmly. In your heart, intend the prayer you are about to perform.',
      },
      recitations: [],
      variations: [
        {
          schools: [],
          text: {
            en: 'The intention is in the heart. Schools differ on whether it is recommended to also say it quietly with the tongue; no fixed Arabic wording is required by this lesson.',
          },
          review: 'needs-review',
        },
      ],
      sources: [{ sourceId: 'bukhari', locator: '1' }],
      review: 'needs-review',
    },
    {
      id: 'face-qibla',
      position: 'standing',
      title: { en: 'Face the qibla' },
      action: {
        en: 'Stand upright facing the qibla (the direction of the Ka’bah in Makkah). Keep your gaze lowered, toward the place where your forehead will rest.',
      },
      guidance: {
        en: 'Face the qibla and stand upright. Lower your gaze toward the place of prostration.',
      },
      recitations: [],
      variations: [],
      sources: [{ sourceId: 'quran', locator: '2:144' }],
      review: 'needs-review',
    },
    {
      id: 'opening-takbir',
      position: 'takbir',
      title: { en: 'Opening takbir (Takbirat al-Ihram)' },
      action: {
        en: 'Raise both hands with palms facing the qibla and say “Allāhu akbar”. This begins the prayer.',
      },
      guidance: {
        en: 'Raise both hands and say: Allahu akbar. Your prayer has now begun.',
      },
      recitations: [{ kind: 'dhikr', id: 'takbir' }],
      variations: [
        {
          schools: ['hanafi'],
          text: { en: 'Hanafi: hands are commonly raised so the thumbs are near the earlobes.' },
          review: 'needs-review',
        },
        {
          schools: ['shafii', 'hanbali', 'maliki'],
          text: {
            en: "Shafi'i, Hanbali and Maliki: hands are commonly raised to shoulder level; raising to the ears is also reported.",
          },
          review: 'needs-review',
        },
      ],
      sources: [
        { sourceId: 'bukhari', locator: '735' },
        { sourceId: 'bukhari', locator: '757' },
      ],
      review: 'needs-review',
    },
    {
      id: 'place-hands',
      position: 'folded',
      title: { en: 'Standing (qiyam) and the opening supplication' },
      action: {
        en: 'Lower your hands and stand still. Recite the opening supplication quietly.',
      },
      guidance: {
        en: 'Stand still with humility. Quietly recite the opening supplication.',
      },
      recitations: [{ kind: 'dhikr', id: 'opening-supplication', optional: true }],
      variations: [
        {
          schools: ['hanafi'],
          text: { en: 'Hanafi: the right hand is placed over the left, below the navel.' },
          review: 'needs-review',
        },
        {
          schools: ['shafii'],
          text: { en: "Shafi'i: the right hand is placed over the left, below the chest and above the navel." },
          review: 'needs-review',
        },
        {
          schools: ['hanbali'],
          text: { en: 'Hanbali: the right hand is placed over the left, commonly below the navel.' },
          review: 'needs-review',
        },
        {
          schools: ['maliki'],
          text: { en: 'Maliki: the arms are commonly left at the sides in obligatory prayers.' },
          review: 'needs-review',
        },
        {
          schools: ['shafii'],
          text: {
            en: "Shafi'i: a different authentic opening supplication (beginning “Wajjahtu wajhiya…”, Sahih Muslim 771) is commonly used.",
          },
          review: 'needs-review',
        },
        {
          schools: ['maliki'],
          text: { en: 'Maliki: an opening supplication is not recited in obligatory prayers.' },
          review: 'needs-review',
        },
      ],
      sources: [],
      review: 'needs-review',
    },
    {
      id: 'taawwudh',
      position: 'folded',
      title: { en: 'Seek refuge in Allah' },
      action: {
        en: 'Before reciting the Quran in the first rak’ah, quietly seek refuge in Allah from Satan.',
      },
      guidance: { en: 'Quietly seek refuge in Allah before you recite.' },
      recitations: [{ kind: 'dhikr', id: 'taawwudh' }],
      variations: [],
      sources: [{ sourceId: 'quran', locator: '16:98' }],
      review: 'needs-review',
    },
    {
      id: 'fatiha',
      position: 'folded',
      title: { en: 'Recite Surah Al-Fatihah' },
      action: {
        en: 'Recite Surah Al-Fatihah calmly, ayah by ayah, then say “Āmīn”. Al-Fatihah is recited in every rak’ah.',
      },
      guidance: {
        en: 'Recite Surah Al-Fatihah slowly, ayah by ayah. At the end, say: Ameen.',
      },
      recitations: [
        { kind: 'quran', id: 'fatiha' },
        { kind: 'dhikr', id: 'amin' },
      ],
      variations: [
        {
          schools: [],
          text: {
            en: 'Schools differ on the Basmalah before Al-Fatihah: recited silently (Hanafi, Hanbali), aloud in audible prayers (Shafi’i), or not recited in obligatory prayers (Maliki).',
          },
          review: 'needs-review',
        },
        {
          schools: [],
          text: {
            en: 'Schools also differ on whether “Āmīn” is said quietly or aloud, and on reciting behind an imam. Follow your teacher or imam.',
          },
          review: 'needs-review',
        },
      ],
      sources: [
        { sourceId: 'bukhari', locator: '756' },
        { sourceId: 'bukhari', locator: '780' },
      ],
      review: 'needs-review',
    },
    {
      id: 'short-surah',
      position: 'folded',
      title: { en: 'Recite a short surah' },
      action: {
        en: 'In the first two rak’ahs, recite some Quran after Al-Fatihah. A short surah is a good start for beginners.',
      },
      guidance: {
        en: 'Now recite a short surah or a few ayahs of the Quran.',
      },
      recitations: [{ kind: 'short-surah' }],
      variations: [],
      sources: [{ sourceId: 'bukhari', locator: '776' }],
      review: 'needs-review',
    },
    {
      id: 'ruku',
      position: 'bowing',
      title: { en: 'Bowing (ruku’)' },
      action: {
        en: 'Say “Allāhu akbar” and bow. Place your hands on your knees, keep your back straight, and rest there calmly while glorifying Allah.',
      },
      guidance: {
        en: 'Say Allahu akbar and bow. Hands on your knees, spine level. Say: Subhana rabbiyal azeem.',
      },
      recitations: [
        { kind: 'dhikr', id: 'takbir' },
        { kind: 'dhikr', id: 'ruku-tasbih' },
      ],
      variations: [
        {
          schools: ['shafii', 'hanbali'],
          text: {
            en: "Shafi'i and Hanbali: the hands are also raised when going into ruku’ and when rising from it.",
          },
          review: 'needs-review',
        },
        {
          schools: ['hanafi', 'maliki'],
          text: {
            en: 'Hanafi, and the well-known Maliki position: the hands are raised only for the opening takbir.',
          },
          review: 'needs-review',
        },
      ],
      sources: [
        { sourceId: 'bukhari', locator: '828' },
        { sourceId: 'muslim', locator: '772' },
      ],
      review: 'needs-review',
    },
    {
      id: 'rise-from-ruku',
      position: 'rising',
      title: { en: 'Rising from bowing' },
      action: {
        en: 'Rise to standing while saying “Sami‘a-llāhu li-man ḥamidah”. When fully upright, say “Rabbanā laka-l-ḥamd” and stand still for a moment.',
      },
      guidance: {
        en: 'Rise up, saying: Sami Allahu liman hamidah. Once upright, say: Rabbana lakal hamd.',
      },
      recitations: [
        { kind: 'dhikr', id: 'tasmi' },
        { kind: 'dhikr', id: 'tahmid' },
      ],
      variations: [
        {
          schools: [],
          text: {
            en: 'The wordings “Rabbanā wa laka-l-ḥamd” and “Allāhumma rabbanā laka-l-ḥamd” are also reported. When praying behind an imam, schools differ on which phrase the follower says.',
          },
          review: 'needs-review',
        },
      ],
      sources: [{ sourceId: 'bukhari', locator: '789' }],
      review: 'needs-review',
    },
    {
      id: 'sujud-1',
      position: 'prostrating',
      title: { en: 'First prostration (sujud)' },
      action: {
        en: 'Say “Allāhu akbar” and go down into prostration: forehead and nose, both palms, both knees and the toes of both feet touch the ground. Rest there calmly while glorifying Allah.',
      },
      guidance: {
        en: 'Say Allahu akbar and prostrate. Forehead, nose, palms, knees and toes on the ground. Say: Subhana rabbiyal a-la.',
      },
      recitations: [
        { kind: 'dhikr', id: 'takbir' },
        { kind: 'dhikr', id: 'sujud-tasbih' },
      ],
      variations: [],
      sources: [
        { sourceId: 'bukhari', locator: '812' },
        { sourceId: 'muslim', locator: '772' },
      ],
      review: 'needs-review',
    },
    {
      id: 'sit-between',
      position: 'sitting',
      title: { en: 'Sitting between the prostrations' },
      action: {
        en: 'Say “Allāhu akbar” and sit up. Sit still for a moment before the second prostration.',
      },
      guidance: {
        en: 'Say Allahu akbar and sit up calmly. Ask Allah for forgiveness.',
      },
      recitations: [
        { kind: 'dhikr', id: 'takbir' },
        { kind: 'dhikr', id: 'between-sujud', optional: true },
      ],
      variations: [
        {
          schools: [],
          text: {
            en: 'Schools differ on whether the supplication between the prostrations is recommended in obligatory prayers; sitting calmly is taught by all.',
          },
          review: 'needs-review',
        },
      ],
      sources: [{ sourceId: 'abudawud', locator: '874' }],
      review: 'needs-review',
    },
    {
      id: 'sujud-2',
      position: 'prostrating',
      title: { en: 'Second prostration' },
      action: {
        en: 'Say “Allāhu akbar” and prostrate a second time, exactly as before.',
      },
      guidance: {
        en: 'Say Allahu akbar and prostrate a second time. Say: Subhana rabbiyal a-la.',
      },
      recitations: [
        { kind: 'dhikr', id: 'takbir' },
        { kind: 'dhikr', id: 'sujud-tasbih' },
      ],
      variations: [],
      sources: [{ sourceId: 'bukhari', locator: '789' }],
      review: 'needs-review',
    },
    {
      id: 'stand-up',
      position: 'standing',
      title: { en: 'Stand up for the next rak’ah' },
      action: {
        en: 'Say “Allāhu akbar” and rise to standing for the next rak’ah.',
      },
      guidance: {
        en: 'Say Allahu akbar and rise to standing for the following rak-ah.',
      },
      recitations: [{ kind: 'dhikr', id: 'takbir' }],
      variations: [
        {
          schools: ['shafii'],
          text: {
            en: "Shafi'i: a brief sitting (jalsat al-istirahah) before standing up from the first and third rak’ahs is recommended.",
          },
          review: 'needs-review',
        },
      ],
      sources: [{ sourceId: 'bukhari', locator: '789' }],
      review: 'needs-review',
    },
    {
      id: 'first-tashahhud',
      position: 'sitting',
      title: { en: 'Middle sitting (first tashahhud)' },
      action: {
        en: 'After the second rak’ah of a three- or four-rak’ah prayer, sit and recite the tashahhud, then stand for the next rak’ah.',
      },
      guidance: {
        en: 'Sit and recite the tashahhud. Then say Allahu akbar and stand for the following rak-ah.',
      },
      recitations: [{ kind: 'dhikr', id: 'tashahhud' }],
      variations: [
        {
          schools: ['shafii'],
          text: {
            en: "Shafi'i: a different authentic wording of the tashahhud (from Ibn 'Abbas, Sahih Muslim 403) is commonly used, and sending blessings on the Prophet ﷺ here is also recommended.",
          },
          review: 'needs-review',
        },
        {
          schools: ['maliki'],
          text: {
            en: "Maliki: the tashahhud wording taught by 'Umar ibn al-Khattab (Muwatta Malik) is commonly used.",
          },
          review: 'needs-review',
        },
        {
          schools: [],
          text: {
            en: 'Sitting posture and how the index finger is raised during the tashahhud are described differently by the schools.',
          },
          review: 'needs-review',
        },
      ],
      sources: [
        { sourceId: 'bukhari', locator: '831' },
        { sourceId: 'bukhari', locator: '828' },
      ],
      review: 'needs-review',
    },
    {
      id: 'final-tashahhud',
      position: 'sitting',
      title: { en: 'Final sitting: tashahhud' },
      action: {
        en: 'After the last rak’ah, sit and recite the tashahhud calmly.',
      },
      guidance: {
        en: 'This is the final sitting. Recite the tashahhud calmly.',
      },
      recitations: [{ kind: 'dhikr', id: 'tashahhud' }],
      variations: [
        {
          schools: ['shafii', 'hanbali', 'maliki'],
          text: {
            en: "Shafi'i, Hanbali and Maliki: in the final sitting the left foot is commonly brought forward under the right shin (tawarruk); details differ.",
          },
          review: 'needs-review',
        },
        {
          schools: ['hanafi'],
          text: { en: 'Hanafi: sitting on the left foot with the right foot upright is used in both sittings.' },
          review: 'needs-review',
        },
      ],
      sources: [
        { sourceId: 'bukhari', locator: '831' },
        { sourceId: 'bukhari', locator: '828' },
      ],
      review: 'needs-review',
    },
    {
      id: 'salawat',
      position: 'sitting',
      title: { en: 'Send blessings on the Prophet ﷺ' },
      action: { en: 'Still sitting, recite the salawat upon the Prophet ﷺ.' },
      guidance: { en: 'Still sitting, send blessings upon the Prophet.' },
      recitations: [{ kind: 'dhikr', id: 'salawat' }],
      variations: [],
      sources: [{ sourceId: 'bukhari', locator: '3370' }],
      review: 'needs-review',
    },
    {
      id: 'dua-before-salam',
      position: 'sitting',
      title: { en: 'Supplication before salam' },
      action: {
        en: 'You may make a short supplication before ending the prayer. Beginners often use this supplication from the Quran.',
      },
      guidance: {
        en: 'If you wish, make a short supplication before ending the prayer.',
      },
      recitations: [{ kind: 'quran', id: 'dua-before-salam', optional: true }],
      variations: [
        {
          schools: [],
          text: {
            en: 'Several supplications are reported for this point, for example the one taught to Abu Bakr (Sahih al-Bukhari 834). Ask your teacher which ones to learn.',
          },
          review: 'needs-review',
        },
      ],
      sources: [{ sourceId: 'bukhari', locator: '835' }],
      review: 'needs-review',
    },
    {
      id: 'salam-right',
      position: 'salamRight',
      title: { en: 'Salam to the right' },
      action: {
        en: 'Turn your head to the right and say “As-salāmu ‘alaykum wa raḥmatu-llāh”.',
      },
      guidance: {
        en: 'Turn your head to the right and say: Assalamu alaikum wa rahmatullah.',
      },
      recitations: [{ kind: 'dhikr', id: 'salam' }],
      variations: [],
      sources: [
        { sourceId: 'abudawud', locator: '996' },
        { sourceId: 'muslim', locator: '582' },
      ],
      review: 'needs-review',
    },
    {
      id: 'salam-left',
      position: 'salamLeft',
      title: { en: 'Salam to the left' },
      action: {
        en: 'Turn your head to the left and say the salam again. The prayer is complete.',
      },
      guidance: {
        en: 'Turn your head to the left and say: Assalamu alaikum wa rahmatullah. Your prayer is complete.',
      },
      recitations: [{ kind: 'dhikr', id: 'salam' }],
      variations: [
        {
          schools: ['maliki'],
          text: { en: 'Maliki: a single salam, turning slightly to the right, is commonly taught.' },
          review: 'needs-review',
        },
      ],
      sources: [{ sourceId: 'abudawud', locator: '996' }],
      review: 'needs-review',
    },
  ],

  prayers: [
    {
      id: 'fajr',
      name: { en: 'Fajr' },
      arabicName: 'الفجر',
      rakahs: 2,
      audibleRakahs: [1, 2],
      note: { en: 'Two obligatory rak’ahs, with a final sitting after the second.' },
    },
    {
      id: 'dhuhr',
      name: { en: 'Dhuhr' },
      arabicName: 'الظهر',
      rakahs: 4,
      audibleRakahs: [],
      note: { en: 'Four obligatory rak’ahs, recited quietly, with a middle sitting after the second.' },
    },
    {
      id: 'asr',
      name: { en: 'Asr' },
      arabicName: 'العصر',
      rakahs: 4,
      audibleRakahs: [],
      note: { en: 'Four obligatory rak’ahs, recited quietly, with a middle sitting after the second.' },
    },
    {
      id: 'maghrib',
      name: { en: 'Maghrib' },
      arabicName: 'المغرب',
      rakahs: 3,
      audibleRakahs: [1, 2],
      note: { en: 'Three obligatory rak’ahs, with a middle sitting after the second.' },
    },
    {
      id: 'isha',
      name: { en: 'Isha' },
      arabicName: 'العشاء',
      rakahs: 4,
      audibleRakahs: [1, 2],
      note: { en: 'Four obligatory rak’ahs, with a middle sitting after the second.' },
    },
  ],

  prerequisites: [
    {
      id: 'purification',
      title: { en: 'Purification (wudu’)' },
      body: {
        en: 'Perform wudu’ before praying. Your body, clothes and the place of prayer should be clean. If a full bath (ghusl) is required, it comes first.',
      },
      sources: [{ sourceId: 'quran', locator: '5:6' }],
      learnMore: { href: '/al-maidah/6', label: { en: 'Read Al-Ma’idah 5:6' } },
      review: 'needs-review',
    },
    {
      id: 'time',
      title: { en: 'Prayer time' },
      body: {
        en: 'Each obligatory prayer is performed within its own time. Use a trusted local timetable or your mosque’s schedule.',
      },
      sources: [{ sourceId: 'quran', locator: '4:103' }],
      learnMore: { href: '/an-nisa/103', label: { en: 'Read An-Nisa 4:103' } },
      review: 'needs-review',
    },
    {
      id: 'covering',
      title: { en: 'Appropriate covering' },
      body: {
        en: 'Wear clean clothing that covers what must be covered in prayer. Requirements differ for men and women; ask a qualified teacher if unsure.',
      },
      sources: [{ sourceId: 'quran', locator: '7:31' }],
      learnMore: { href: '/al-araf/31', label: { en: 'Read Al-A’raf 7:31' } },
      review: 'needs-review',
    },
    {
      id: 'qibla',
      title: { en: 'Facing the qibla' },
      body: {
        en: 'Face the direction of the Ka’bah in Makkah. Use a trusted qibla compass or ask at your local mosque; this app does not detect direction.',
      },
      sources: [{ sourceId: 'quran', locator: '2:144' }],
      learnMore: { href: '/al-baqarah/144', label: { en: 'Read Al-Baqarah 2:144' } },
      review: 'needs-review',
    },
    {
      id: 'intention',
      title: { en: 'Intention' },
      body: {
        en: 'Know which prayer you are performing and intend it sincerely for Allah.',
      },
      sources: [{ sourceId: 'bukhari', locator: '1' }],
      review: 'needs-review',
    },
  ],
};
