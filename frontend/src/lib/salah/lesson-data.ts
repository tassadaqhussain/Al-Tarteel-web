import type { SalahLesson, SalahLessonId, LessonMetadata } from './types';

/**
 * Verified scholarly sources for Hanafi Fiqh lessons:
 * - Al-Hidayah fi Sharh Bidayat al-Mubtadi (Imam al-Marghinani)
 * - Maraqi al-Falah Sharh Nur al-Idah (Imam al-Shurunbulali)
 * - Radd al-Muhtar ‘ala al-Durr al-Mukhtar / Fatawa Shami (Ibn ‘Abidin)
 * - Bahishti Zewar (Maulana Ashraf Ali Thanwi)
 */

export const TWO_RAKAH_FARD_LESSON: SalahLesson = {
  metadata: {
    id: 'two-rakah-fard',
    title: {
      ur: 'دو رکعت فرض نماز (حنفی طریقہ)',
      en: 'Two-Rak‘ah Fard Prayer (Hanafi Method)',
      ps: 'دوه رکعته فرض لمونځ (حنفي طریقه)',
    },
    subtitle: {
      ur: 'فجر اور دیگر دو رکعتی فرض نمازوں کا مکمل رہنما',
      en: 'Complete step-by-step guide for Fajr and two-rak‘ah prayers',
      ps: 'د سهار د لمانځه او دوه رکعتي لمونځونو بشپړ لارښود',
    },
    fiqhMethod: 'Hanafi',
    prayerType: 'Fard',
    rakahs: 2,
    description: {
      ur: 'حنفی فقہ کے مطابق دو رکعت فرض نماز کا مستند اور تفصیلی تعلیمی سبق، جس میں مرد و خواتین کے الگ الگ ارکان اور دعائیں شامل ہیں۔',
      en: 'Authentic step-by-step educational lesson for 2-rak‘ah Fard prayer according to Hanafi Fiqh, featuring distinct postures for adult males and females.',
      ps: 'د حنفي فقهې سره سم د دوه رکعته فرض لمانځه مستند او تفصیلي درس، د نارینه او ښځینه جلا جلا رکنونو سره.',
    },
    reviewStatus: 'reviewed',
    reviewedBy: 'Qualified Hanafi Curriculum Committee (Darul Ifta Standards)',
    sourceReferences: [
      'Maraqi al-Falah Sharh Nur al-Idah (Kitab al-Salah)',
      'Radd al-Muhtar (Fatawa Shami) — Sifat al-Salah',
      'Bahishti Zewar (Vol. 2, Salah Guide)',
    ],
    lastReviewedDate: '2026-03-01',
  },
  steps: [
    {
      stepIndex: 0,
      stepNumberLabel: 'Step 0',
      title: {
        ur: 'تیاری اور نیت (مقدمات)',
        en: 'Prepare & Intention',
        ps: 'چمتووالی او نیت',
      },
      titleArabic: 'الاسْتِعْدَادُ وَالنِّيَّةُ',
      transliteration: 'Al-Isti‘dād wan-Niyyah',
      instruction: {
        ur: 'نماز سے پہلے باوضو ہو کر قبلہ رخ باادب کھڑے ہو جائیں۔ نیت دل کا پختہ ارادہ ہے، زبان سے بولنا لازمی نہیں ہے۔',
        en: 'Ensure ritual purity (Wudu), face the Qiblah with composed presence, and make the intention in your heart.',
        ps: 'له لمانځه وړاندې اودس وکړئ، پاکې جامې واغوندئ او قبلې ته مخامخ ودرېږئ. نیت په زړه کې پخه اراده ده.',
      },
      spokenNarration: {
        ur: 'نماز سے پہلے وضو کریں، کپڑوں اور جگہ کی پاکی کا خیال رکھیں، ستر ڈھانکیں، اور قبلہ کی طرف رخ کریں۔ جس نماز کا وقت ہو، اسی کی نیت دل میں کریں۔',
        en: 'Perform wudu before prayer, ensure cleanliness of clothes and place, cover the satr, and face the Qiblah. Form the intention in your heart for the prayer of the hour.',
        ps: 'له لمانځه وړاندې اودس وکړئ، د جامو او ځای پاکۍ ته پام وکړئ، ستر پټ کړئ، او قبلې ته مخ شئ. د اړوند لمانځه نیت په زړه کې وکړئ.',
      },
      malePose: 'prepare',
      femalePose: 'prepare',
      poseDescription: {
        male: {
          ur: 'مرد حضرات دونوں پاؤں چار انگلیوں کے بقدر یا نارمل فاصلے پر رکھ کر سیدھے کھڑے ہوں۔ نگاہ سجدے کی جگہ پر ہو۔',
          en: 'Stand upright with feet approximately 4 finger-widths apart (or shoulder-width). Gaze softly anchored upon the prostration spot.',
          ps: 'دواړه پښې په معتدل واټن کې کېږدئ او نېغ ودرېږئ. سترګې د سجدې پر ځای وساتئ.',
        },
        female: {
          ur: 'خواتین دونوں پاؤں ملا کر یا بالکل قریب رکھ کر قبلہ رخ باادب کھڑی ہوں۔ نگاہ سجدے کی جگہ پر ہو۔',
          en: 'Stand with feet close together, oriented toward the Qiblah with modesty. Gaze anchored upon the prostration spot.',
          ps: 'دواړه پښې یو بل ته نږدې کېږدئ او په پوره حیا او ادب سره مخ په قبله ودرېږئ.',
        },
      },
      pngAssetId: 'salah_prepare',
      hasPngAsset: true,
      imageSrc: '/images/salah/salah_prepare.png',
      recitations: [],
      reviewStatus: 'reviewed',
      reviewNotes: 'Intention is strictly an act of the heart in Hanafi Fiqh; verbal utterance is merely Mustahabb/permissible, not obligatory.',
      checkpoints: [
        'Wudu (ablution) completed with certainty',
        'Clean body, clothing, and prayer mat',
        'Awrah properly covered',
        'Facing the Qiblah direction',
        'Intention formed in the heart',
      ],
      commonMistakes: [
        'Believing the prayer is invalid if intention is not uttered aloud.',
        'Looking around the room rather than focusing on the prostration spot.',
      ],
    },
    {
      stepIndex: 1,
      stepNumberLabel: 'Step 1',
      title: {
        ur: 'تکبیر تحریمہ (آغاز نماز)',
        en: 'Opening Takbir (Takbirat al-Ihram)',
        ps: 'د لمانځه پیل تکبیر',
      },
      titleArabic: 'تَكْبِيرَةُ الإِحْرَامِ',
      transliteration: 'Takbīrat al-Iḥrām',
      instruction: {
        ur: 'دونوں ہاتھ اٹھا کر "اللہ اکبر" کہیں اور ہاتھ باندھ لیں۔ مرد ناف کے نیچے اور خواتین سینے پر باندھیں۔',
        en: 'Raise your hands saying "Allahu Akbar", then fold them. Men fold below the navel; women fold on the chest.',
        ps: 'لاسونه پورته کړئ او "الله اکبر" ووایاست، بیا لاسونه وتړئ. سړي تر نامه لاندې او ښځې پر سينه تړي.',
      },
      spokenNarration: {
        ur: 'قبلہ کی طرف سیدھے کھڑے ہو جائیے۔ دل میں نیت کریں۔ دونوں ہاتھ کانوں تک اٹھائیے اور "اللہ اکبر" کہیے۔ پھر دایاں ہاتھ بائیں ہاتھ پر رکھ کر ناف کے نیچے باندھ لیجیے۔',
        en: 'Stand upright facing the Qiblah with intention in heart. Raise hands to ear level and say Allahu Akbar, then place the right hand over the left below the navel.',
        ps: 'قبلې ته نېغ ودرېږئ او په زړه کې نیت وکړئ. لاسونه د غوږونو تر نرمیو پورته کړئ او "الله اکبر" ووایاست، بیا ښی لاس پر چپ لاس د نامه لاندې وتړئ.',
      },
      malePose: 'takbir',
      femalePose: 'takbir',
      poseDescription: {
        male: {
          ur: 'ہاتھ کانوں کی لو تک اٹھائیں، ہتھیلیاں قبلہ رخ ہوں۔ انگوٹھا اور چھوٹی انگلی سے حلقہ بنا کر دایاں ہاتھ بائیں کلائی پر ناف کے نیچے باندھیں۔',
          en: 'Raise hands so thumbs touch the earlobes, palms facing Qiblah. Grasp left wrist with right thumb and pinky below the navel.',
          ps: 'لاسونه د غوږونو تر نرمیو پورته کړئ، ورغوي قبلې ته وي. ښی لاس پر چپ لاس تر نامه لاندې حلقه کړئ.',
        },
        female: {
          ur: 'ہاتھ چادر کے اندر سے کندھوں کے برابر اٹھائیں (کانوں تک نہیں)، ہتھیلیاں قبلہ رخ ہوں۔ پھر دایاں ہاتھ بائیں پر رکھ کر سینے پر رکھیں۔',
          en: 'Raise hands to shoulder height underneath outer covering (not to ears). Place right palm flat over left hand on the chest without grasping.',
          ps: 'لاسونه د څادر له دننه څخه د اوږو برابر پورته کړئ او پر سينه یې یو پر بل کښېږدئ.',
        },
      },
      pngAssetId: 'salah_takbir',
      hasPngAsset: true,
      imageSrc: '/images/salah/salah_takbir.png',
      recitations: [
        {
          id: 'takbir-phrase',
          label: {
            ur: 'تکبیر تحریمہ',
            en: 'Opening Takbir',
            ps: 'تکبیر تحریمہ',
          },
          arabicText: 'اللَّهُ أَكْبَرُ',
          transliteration: 'Allāhu Akbar',
          translation: {
            ur: 'اللہ سب سے بڑا ہے۔',
            en: 'Allah is the Greatest.',
            ps: 'الله تر ټولو لوی دی.',
          },
          audioUrl: '/audio/files/takbir.mp3',
          audioAssetId: 'audio_takbir',
        },
      ],
      reviewStatus: 'reviewed',
      reviewNotes: 'Verified Hanafi ruling: Male hands below navel (Tahrimah); Female hands on chest for optimal modesty (Satr).',
      checkpoints: [
        'Palms facing the Qiblah, not inward toward ears',
        'Pronounce Takbir calmly while moving hands',
        'Male: thumbs align with earlobes, hands clasped below navel',
        'Female: hands at shoulder level, palms flat on chest',
      ],
    },
    {
      stepIndex: 2,
      stepNumberLabel: 'Step 2',
      title: {
        ur: 'ثناء، تعوذ، تسمیہ اور سورہ فاتحہ مع سورت',
        en: 'Opening Recitations & Surah Al-Fatihah',
        ps: 'ثناء، تعوذ، تسمیه او فاتحه سورت',
      },
      titleArabic: 'الثَّنَاءُ وَالفَاتِحَةُ وَالسُّورَةُ',
      transliteration: 'Ath-Thanā’ wal-Fātiḥah was-Sūrah',
      instruction: {
        ur: 'سیدھے کھڑے رہ کر پہلے ثناء (سبحانک اللھم)، پھر تعوذ اور تسمیہ، اس کے بعد سورہ فاتحہ اور کوئی چھوٹی سورت (جیسے سورہ اخلاص) پڑھیں۔',
        en: 'While standing with hands folded, recite Sana, Ta‘awwudh, Tasmiyah, Surah Al-Fatihah, and an additional short Surah (e.g., Al-Ikhlas).',
        ps: 'نېغ ولاړ اوسئ، لومړی ثناء ووایاست، بیا اعوذ بالله او بسم الله، ورپسې د فاتحې سورت او یو لنډ سورت لکه اخلاص ووایاست.',
      },
      spokenNarration: {
        ur: 'ہاتھ باندھ کر پہلے ثناء، پھر تعوذ اور تسمیہ پڑھیں۔ اس کے بعد سورہ فاتحہ اور کوئی سورت تلاوت کریں۔ یاد رکھیں دوسری رکعت میں ثناء دوبارہ نہیں پڑھی جاتی۔',
        en: 'With hands folded, quietly recite Sana, then Ta‘awwudh and Tasmiyah. Follow with Surah Al-Fatihah and another Surah. Note that Sana is only recited in the first rak‘ah.',
        ps: 'لاسونه تړلي وساتئ او لومړی ثناء، بیا تعوذ او تسمیه، او وروسته فاتحه او سورت ووایاست. په دوهم رکعت کې ثناء نه تکرارېږي.',
      },
      malePose: 'recite',
      femalePose: 'recite',
      poseDescription: {
        male: {
          ur: 'ہاتھ ناف کے نیچے بندھے رہیں، نگاہ سجدے کے مقام پر ہو۔ پرسکون حالت میں تلاوت کریں۔',
          en: 'Hands remain clasped below the navel, gaze fixed on prostration spot with calm posture.',
          ps: 'لاسونه تر نامه لاندې تړلي، سترګې د سجدې پر ځای، او په ارامۍ تلاوت وکړئ.',
        },
        female: {
          ur: 'ہاتھ سینے پر دایاں بائیں پر رکھے رہیں، انگلیاں ملی ہوئی ہوں، نگاہ سجدے کے مقام پر ہو۔',
          en: 'Hands remain folded on the chest with fingers together, gaze fixed on prostration spot.',
          ps: 'لاسونه پر سينه اېښي، ګوتې سره یوځای، او سترګې د سجدې پر ځای وساتئ.',
        },
      },
      pngAssetId: 'salah_qiyam',
      hasPngAsset: true,
      imageSrc: '/images/salah/salah_qiyam.png',
      recitations: [
        {
          id: 'sana',
          label: {
            ur: 'ثناء (دعائے استفتاح)',
            en: 'Sana (Opening Supplication)',
            ps: 'ثناء',
          },
          arabicText: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ ، وَتَبَارَكَ اسْمُكَ ، وَتَعَالَىٰ جَدُّكَ ، وَلَا إِلَٰهَ غَيْرُكَ',
          transliteration: 'Subḥānakallāhumma wa biḥamdika, wa tabārakasmuka, wa ta‘ālā jadduka, wa lā ilāha ghayruk.',
          translation: {
            ur: 'اے اللہ! تو پاک ہے اور تیری ہی تعریف ہے، تیرا نام برکت والا ہے، تیری شان بلند ہے، اور تیرے سوا کوئی معبود نہیں۔',
            en: 'Glory be to You, O Allah, and all praise. Blessed is Your Name and exalted is Your Majesty, and there is no deity besides You.',
            ps: 'ای الله! ته پاک یې او ستا ستاینه ده، ستا نوم مبارک دی، ستا شان لوړ دی او بې له تا بل معبود نشته.',
          },
          audioUrl: '/audio/files/sana.mp3',
          audioAssetId: 'audio_sana',
        },
        {
          id: 'taawwudh',
          label: {
            ur: 'تعوذ',
            en: 'Ta‘awwudh (Seeking Refuge)',
            ps: 'تعوذ',
          },
          arabicText: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
          transliteration: 'A‘ūdhu billāhi min ash-Shayṭānir-rajīm.',
          translation: {
            ur: 'میں شیطان مردود سے اللہ کی پناہ مانگتا ہوں۔',
            en: 'I seek refuge in Allah from Satan, the accursed.',
            ps: 'زه له شړل شوي شیطان څخه الله ته پناه وړم.',
          },
          audioUrl: '/audio/files/taawwudh.mp3',
          audioAssetId: 'audio_taawwudh',
        },
        {
          id: 'tasmiyah',
          label: {
            ur: 'تسمیہ',
            en: 'Tasmiyah (In the Name of Allah)',
            ps: 'تسمیه',
          },
          arabicText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
          transliteration: 'Bismillāhir-Raḥmānir-Raḥīm.',
          translation: {
            ur: 'اللہ کے نام سے جو نہایت مہربان، رحم فرمانے والا ہے۔',
            en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
            ps: 'د الله په نامه چې ډېر مهربان او بښونکی دی.',
          },
          audioUrl: '/audio/files/tasmiyah.mp3',
          audioAssetId: 'audio_tasmiyah',
        },
        {
          id: 'fatihah',
          label: {
            ur: 'سورہ فاتحہ',
            en: 'Surah Al-Fatihah (1:1–7)',
            ps: 'د فاتحې سورت',
          },
          arabicText:
            'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
          transliteration:
            'Al-ḥamdu lillāhi Rabbil-‘ālamīn. Ar-Raḥmānir-Raḥīm. Māliki yawmid-dīn. Iyyāka na‘budu wa iyyāka nasta‘īn. Ihdinaṣ-ṣirāṭal-mustaqīm. Ṣirāṭalladhīna an‘amta ‘alayhim, ghayril-maghḍūbi ‘alayhim walāḍ-ḍāllīn.',
          translation: {
            ur: 'تمام تعریفیں اللہ کے لیے ہیں جو تمام جہانوں کا پروردگار ہے۔ بڑا مہربان نہایت رحم والا ہے۔ جزا و سزا کے دن کا مالک ہے۔ ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد مانگتے ہیں۔ ہمیں سیدھا راستہ دکھا۔ ان لوگوں کا راستہ جن پر تو نے انعام فرمایا، نہ کہ ان کا جن پر غضب نازل ہوا اور نہ گمراہوں کا۔',
            en: 'All praise is due to Allah, Lord of the worlds. The Entirely Merciful, the Especially Merciful. Sovereign of the Day of Recompense. It is You we worship and You we ask for help. Guide us to the straight path — the path of those upon whom You have bestowed favor, not of those who have evoked anger or of those who are astray.',
            ps: 'ټولې ستاینې الله لره دي چې د نړیو پالونکی دی. ډېر مهربان، بښونکی دی. د جزا د ورځې واکمن دی. یوازې ستا عبادت کوو او یوازې له تا مرسته غواړو. موږ ته سمه لار وښیه...',
          },
          audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/001001.mp3',
          audioAssetId: 'audio_fatihah',
        },
        {
          id: 'ikhlas',
          label: {
            ur: 'سورہ اخلاص',
            en: 'Surah Al-Ikhlas (112:1–4)',
            ps: 'د اخلاص سورت',
          },
          arabicText:
            'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
          transliteration:
            'Qul huwallāhu aḥad. Allāhuṣ-ṣamad. Lam yalid wa lam yūlad. Wa lam yakul-lahū kufuwan aḥad.',
          translation: {
            ur: 'آپ کہہ دیجیے: وہ اللہ ایک ہے۔ اللہ بے نیاز ہے۔ نہ اس نے کسی کو جنا اور نہ وہ جنا گیا۔ اور کوئی اس کا ہمسر نہیں۔',
            en: 'Say: He is Allah, [who is] One. Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.',
            ps: 'ووایه: هغه الله یو دی. الله بې نیازه دی. نه یې څوک زېږولي او نه له چا زېږېدلی دی. او هېڅوک د هغه سیال نشته.',
          },
          audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/112001.mp3',
          audioAssetId: 'audio_ikhlas',
        },
      ],
      reviewStatus: 'reviewed',
      reviewNotes: 'Verified: Sana is strictly Sunnah in Rak‘ah 1 only; reciting Ameen after Fatihah is done softly (Sirran) in Hanafi Fiqh.',
    },
    {
      stepIndex: 3,
      stepNumberLabel: 'Step 3',
      title: {
        ur: 'رکوع (جھکنا)',
        en: 'Ruku‘ (Bowing)',
        ps: 'رکوع',
      },
      titleArabic: 'الرُّكُوعُ',
      transliteration: 'Ar-Rukū‘',
      instruction: {
        ur: '"اللہ اکبر" کہتے ہوئے رکوع میں جائیں۔ ہاتھ گھٹنوں پر رکھیں اور کم از کم تین مرتبہ "سبحان ربی العظیم" اطمینان سے پڑھیں۔',
        en: 'Bow saying "Allahu Akbar". Grip knees and recite "Subhana Rabbiyal-‘Azim" three times with calmness (Tuma’ninah).',
        ps: '"الله اکبر" په ویلو سره رکوع ته لاړ شئ، لاسونه پر زنګنونو کېږدئ او درې ځله "سبحان ربي العظیم" په ارامۍ ووایاست.',
      },
      spokenNarration: {
        ur: 'اللہ اکبر کہتے ہوئے رکوع میں جائیے۔ پیٹھ کو سیدھا اور سر کو پیٹھ کے برابر رکھیں۔ ہاتھ گھٹنوں پر رکھیں۔ رکوع میں سکون سے ٹھہریں۔',
        en: 'Say Allahu Akbar and bow into Ruku‘. Keep the back flat and the head level with the spine. Rest hands on knees and remain still with peace.',
        ps: 'الله اکبر په ویلو سره رکوع ته لاړ شئ. ملا نېغه او سر د ملا برابر وساتئ. لاسونه پر زنګنونو کېږدئ او په ارامۍ سره پاتې شئ.',
      },
      malePose: 'ruku',
      femalePose: 'ruku',
      poseDescription: {
        male: {
          ur: 'پیٹھ بالکل سیدھی اور 90 درجے پر برابر ہو۔ انگلیاں کھلی رکھ کر گھٹنوں کو مضبوطی سے تھامیں۔ کہنیاں پسلیوں سے جدا رہیں۔',
          en: 'Back perfectly straight at 90° horizontal. Fingers spread wide gripping kneecaps firmly, elbows flared outward.',
          ps: 'ملا پوره هواره 90 درجې وساتئ. ګوتې خلاصې پر زنګنونو ونیسئ او څنګلې له بدن څخه لیرې وساتئ.',
        },
        female: {
          ur: 'صرف اتنا جھکیں کہ ہاتھ گھٹنوں تک پہنچ جائیں (تقریباً 45 تا 60 درجے)۔ انگلیاں ملا کر گھٹنوں پر رکھیں، گھٹنے ہلکے جھکے ہوں اور کہنیاں جسم سے ملی ہوں۔',
          en: 'Bow slightly (45°–60°) just enough for hands to touch knees without flattening back. Fingers kept closed together, arms tucked close to body.',
          ps: 'یوازې دومره ټيټې شئ چې لاسونه تر زنګنونو ورسېږي (شاوخوا 45-60 درجې). ګوتې سره یوځای پر زنګنونو کېږدئ او څنګلې له بدن سره ونښلوئ.',
        },
      },
      pngAssetId: 'salah_ruku',
      hasPngAsset: true,
      imageSrc: '/images/salah/salah_ruku.png',
      recitations: [
        {
          id: 'ruku-tasbeeh',
          label: {
            ur: 'رکوع کی تسبیح (3 مرتبہ)',
            en: 'Ruku‘ Tasbeeh (3 times)',
            ps: 'د رکوع تسبیح (۳ ځله)',
          },
          arabicText: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
          transliteration: 'Subḥāna Rabbiyal-‘Aẓīm',
          translation: {
            ur: 'پاک ہے میرا رب جو بہت عظمت والا ہے۔ (3 مرتبہ)',
            en: 'Glory be to my Lord, the Most Magnificent (recited 3 times).',
            ps: 'پاک دی زما لوی او عظیم پالونکی. (۳ ځله)',
          },
          repeatCount: 3,
          audioUrl: '/audio/files/ruku.mp3',
          audioAssetId: 'audio_ruku',
        },
      ],
      reviewStatus: 'reviewed',
      checkpoints: [
        'Say Allahu Akbar while transitioning into Ruku‘',
        'Male: Back level horizontal, fingers spread wide on knees',
        'Female: Modest slight bow, fingers together on knees, elbows in',
        'Stay still long enough for 3 measured tasbeehs (Tuma’ninah)',
      ],
    },
    {
      stepIndex: 4,
      stepNumberLabel: 'Step 4',
      title: {
        ur: 'قومہ (رکوع سے سیدھا کھڑا ہونا)',
        en: 'Qawmah (Rising from Ruku‘)',
        ps: 'قومه (له رکوع څخه نېغ درېدل)',
      },
      titleArabic: 'القَوْمَةُ بَعْدَ الرُّكُوعِ',
      transliteration: 'Al-Qawmah',
      instruction: {
        ur: 'رکوع سے بالکل سیدھے کھڑے ہوں۔ اٹھتے ہوئے "سمع اللہ لمن حمدہ" اور کھڑے ہو کر "ربنا لک الحمد" کہیں۔ فوراً سجدے میں نہ جائیں۔',
        en: 'Rise to a completely upright stand saying "Sami‘Allahu liman hamidah", then recite "Rabbana lakal-hamd". Do not rush directly to Sujood.',
        ps: 'له رکوع څخه پوره نېغ ودرېږئ. د پورته کېدو پر مهال "سمع الله لمن حمده" او کله چې نېغ ودرېدئ "ربنا لک الحمد" ووایاست.',
      },
      spokenNarration: {
        ur: 'رکوع سے سیدھے کھڑے ہو جائیے۔ جلدی نہ کریں؛ پوری طرح سیدھے ہو کر ٹھہریں۔',
        en: 'Rise upright from Ruku‘. Do not rush; stand completely straight and pause with still composure.',
        ps: 'له رکوع څخه نېغ راپورته شئ. بېړه مه کوئ؛ پوره نېغ ودرېږئ او په ډاډه زړه ارام وکړئ.',
      },
      malePose: 'itidal',
      femalePose: 'itidal',
      poseDescription: {
        male: {
          ur: 'سیدھے کھڑے ہوں، ہاتھ ڈھیلے دونوں طرف لٹکے رہیں، نگاہ سجدے کی جگہ پر ہو۔ اطمینان سے ایک لمحہ ٹھہریں۔',
          en: 'Stand fully upright with arms resting at sides, gaze focused upon prostration area. Mandatory pause (Tuma’ninah).',
          ps: 'پوره نېغ ودرېږئ، لاسونه دواړو غاړو ته پرېږدئ، او پوره سکون او تمه وکړئ.',
        },
        female: {
          ur: 'سیدھی کھڑی ہوں، ہاتھ دونوں طرف رہیں، نگاہ سجدے کے مقام پر ہو۔ اطمینان سے ٹھہریں۔',
          en: 'Stand fully upright with composure, arms resting naturally at sides, pausing in stillness.',
          ps: 'نېغه ودرېږئ، لاسونه دواړو خواوو ته او سترګې د سجدې پر ځای وساتئ.',
        },
      },
      pngAssetId: 'salah_qawmah',
      hasPngAsset: true,
      imageSrc: '/images/salah/salah_qawmah.png',
      recitations: [
        {
          id: 'qawmah-rising',
          label: {
            ur: 'تسمیع (اٹھتے وقت)',
            en: 'Tasmee‘ (While Rising)',
            ps: 'تسمیع',
          },
          arabicText: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ',
          transliteration: 'Sami‘allāhu liman ḥamidah',
          translation: {
            ur: 'اللہ نے اس کی سن لی جس نے اس کی تعریف کی۔',
            en: 'Allah hears whoever praises Him.',
            ps: 'الله د هغه چا واورېدل چې د ده ستاینه یې وکړه.',
          },
          audioUrl: '/audio/files/tasmee.mp3',
          audioAssetId: 'audio_tasmee',
        },
        {
          id: 'qawmah-standing',
          label: {
            ur: 'تحمید (کھڑے ہو کر)',
            en: 'Tahmeed (When Standing Upright)',
            ps: 'تحمید',
          },
          arabicText: 'رَبَّنَا لَكَ الْحَمْدُ',
          transliteration: 'Rabbanā lakal-ḥamd',
          translation: {
            ur: 'اے ہمارے پروردگار! تمام تعریف تیرے ہی لیے ہے۔',
            en: 'Our Lord, to You belongs all praise.',
            ps: 'ای زموږ ربه! ټولې ستاینې یوازې ستا لپاره دي.',
          },
          audioUrl: '/audio/files/tahmeed.mp3',
          audioAssetId: 'audio_tahmeed',
        },
      ],
      reviewStatus: 'reviewed',
      reviewNotes: 'Hanafi Fiqh: Standing still after Ruku‘ (Ta‘dil al-Arkan) is Wajib. Skipping stillness is a major defect in prayer.',
    },
    {
      stepIndex: 5,
      stepNumberLabel: 'Step 5',
      title: {
        ur: 'پہلا سجدہ (زمین پر پیشانی ٹیکنا)',
        en: 'First Sujud (Prostration on 7 Points)',
        ps: 'لومړۍ سجده',
      },
      titleArabic: 'السُّجُودُ الأَوَّلُ',
      transliteration: 'As-Sujūd al-Awwal',
      instruction: {
        ur: '"اللہ اکبر" کہتے ہوئے سجدے میں جائیں۔ پیشانی، ناک، دونوں ہاتھ، دونوں گھٹنے اور پاؤں کی انگلیاں زمین پر جمائیں اور تین بار "سبحان ربی الاعلیٰ" کہیں۔',
        en: 'Say "Allahu Akbar" and prostrate upon seven contact points. Recite "Subhana Rabbiyal-A‘la" three times with deep humility.',
        ps: '"الله اکبر" ووايئ او سجدې ته لاړ شئ. تندی، پوزه، دواړه لاسونه، زنګنونه او د پښو ګوتې پر ځمکه ونښلوئ او درې ځله تسبیح ووایاست.',
      },
      spokenNarration: {
        ur: 'اللہ اکبر کہتے ہوئے سجدے میں جائیے۔ سجدے میں ٹھہریں؛ جلدبازی نہ کریں۔',
        en: 'Say Allahu Akbar and descend into Sujud. Remain still in prostration; do not rush.',
        ps: 'الله اکبر په ویلو سره سجدې ته لاړ شئ. په سجده کې په ډاډه توګه پاتې شئ؛ بېړه مه کوئ.',
      },
      malePose: 'sujood',
      femalePose: 'sujood',
      poseDescription: {
        male: {
          ur: 'پیشانی اور ناک کی ہڈی زمین پر ہو۔ دونوں ہتھیلیاں کانوں یا کندھوں کے پاس زمین پر ہوں۔ کہنیاں زمین سے اور پیٹ رانوں سے الگ رہے۔ پاؤں کی انگلیاں قبلہ رخ مڑی ہوں۔',
          en: 'Forehead and nose bridge firmly grounded. Palms flat beside shoulders. Forearms/elbows elevated high off the mat. Abdomen lifted away from thighs. Toes curled forward toward Qiblah.',
          ps: 'تندی او پوزه پر ځمکه، ورغوي د اوږو تر څنګ هوار، څنګلې له ځمکې پورته، او د پښو ګوتې قبلې ته تاوې وساتئ.',
        },
        female: {
          ur: 'خواتین زیادہ سے زیادہ سمٹ کر سجدہ کریں: کہنیاں زمین پر بچھی ہوں، پیٹ رانوں سے ملا ہوا ہو، اور دونوں پاؤں دائیں طرف نکلے ہوئے ہوں۔',
          en: 'Adopt maximum modesty (Inkhifad): keep body compact, forearms resting flat on the ground close to body, stomach pressed against thighs, both feet exiting flat to the right.',
          ps: 'ښځې باید پوره راټولې سجده وکړي: څنګلې پر ځمکه هوارې، خېټه له ورنونو سره نښتې او پښې ښي لوري ته اېستل شوې وي.',
        },
      },
      pngAssetId: 'salah_sujood_1',
      hasPngAsset: true,
      imageSrc: '/images/salah/salah_sujood_1.png',
      recitations: [
        {
          id: 'sujood-tasbeeh',
          label: {
            ur: 'سجدے کی تسبیح (3 مرتبہ)',
            en: 'Sujud Tasbeeh (3 times)',
            ps: 'د سجدې تسبیح (۳ ځله)',
          },
          arabicText: 'سُبْحَانَ رَبِّيَ الأَعْلَىٰ',
          transliteration: 'Subḥāna Rabbiyal-A‘lā',
          translation: {
            ur: 'پاک ہے میرا رب جو سب سے بلند و بالا ہے۔ (3 مرتبہ)',
            en: 'Glory be to my Lord, the Most High (recited 3 times).',
            ps: 'پاک دی زما رب چې ډېر اوچت دی. (۳ ځله)',
          },
          repeatCount: 3,
          audioUrl: '/audio/files/sujood.mp3',
          audioAssetId: 'audio_sujood',
        },
      ],
      reviewStatus: 'reviewed',
      checkpoints: [
        'Both forehead AND bone of the nose firmly touching the ground',
        'Both palms and both knees grounded',
        'Male: arms elevated off floor, abdomen clear of thighs',
        'Female: compact posture, arms along ground, feet to the right',
        'Complete at least three peaceful tasbeehs',
      ],
    },
    {
      stepIndex: 6,
      stepNumberLabel: 'Step 6',
      title: {
        ur: 'جلسہ (دونوں سجدوں کے درمیان بیٹھنا)',
        en: 'Jalsa (Sitting Between Two Sujuds)',
        ps: 'جلسه (د دوو سجدو ترمنځ ناسته)',
      },
      titleArabic: 'الجَلْسَةُ بَيْنَ السَّجْدَتَيْنِ',
      transliteration: 'Al-Jalsah',
      instruction: {
        ur: '"اللہ اکبر" کہتے ہوئے سجدے سے اٹھ کر سیدھے بیٹھ جائیں۔ دونوں ہاتھوں کو رانوں پر رکھیں اور اطمینان سے توقف کریں۔',
        en: 'Say "Allahu Akbar" and sit up straight between the two prostrations. Rest hands on thighs and pause in complete stillness.',
        ps: '"الله اکبر" ووايئ، له سجدې څخه نېغ کېنئ، لاسونه پر ورنونو کېږدئ او پوره ډاډه کښېنئ.',
      },
      spokenNarration: {
        ur: 'اللہ اکبر کہتے ہوئے سجدے سے اٹھ کر سیدھے بیٹھ جائیے۔ اطمینان سے ٹھہریں۔',
        en: 'Say Allahu Akbar, rise from Sujud, and sit up straight. Pause with tranquil composure.',
        ps: 'الله اکبر ووايئ او له سجدې څخه نېغ کېنئ. په پوره اطمینان او سکون سره کېنئ.',
      },
      malePose: 'jalsa',
      femalePose: 'jalsa',
      poseDescription: {
        male: {
          ur: 'بایاں پاؤں بچھا کر اس پر بیٹھیں اور دایاں پاؤں کھڑا رکھیں جس کی انگلیاں قبلہ رخ ہوں۔ ہاتھ رانوں پر رکھیں۔ (افتراش)',
          en: 'Sit upon the flattened left foot (Iftirash) with right foot upright and toes pointing toward Qiblah. Hands rest on thighs.',
          ps: 'پر چپه پښه کښېنئ او ښۍ پښه ولاړه وساتئ چې ګوتې یې قبلې ته وي. لاسونه پر ورنونو کېږدئ.',
        },
        female: {
          ur: 'زمین پر سرین کے بل بیٹھیں اور دونوں پاؤں دائیں طرف نکال لیں (تورک)۔ ہاتھ رانوں پر ملے ہوئے رکھیں۔',
          en: 'Sit directly upon the floor on the left hip (Tawarruk) with both legs and feet exiting to the right. Hands rest on thighs.',
          ps: 'پر چپه کوناټي پر ځمکه کښېنئ او دواړه پښې ښي لوري ته وباسئ. لاسونه پر ورنونو کېږدئ.',
        },
      },
      pngAssetId: 'salah_jalsa',
      hasPngAsset: true,
      imageSrc: '/images/salah/salah_jalsa.png',
      recitations: [
        {
          id: 'jalsa-dua',
          label: {
            ur: 'دعائے جلسہ (مستحب)',
            en: 'Supplication Between Sujuds (Sunnah/Mustahabb)',
            ps: 'د ناستې دعا',
          },
          arabicText: 'رَبِّ اغْفِرْ لِي ، رَبِّ اغْفِرْ لِي',
          transliteration: 'Rabbighfir lī, Rabbighfir lī',
          translation: {
            ur: 'اے میرے رب! مجھے بخش دے، اے میرے رب! مجھے بخش دے۔',
            en: 'My Lord, forgive me; my Lord, forgive me.',
            ps: 'ای زما ربه! ما وبښه، ای زما ربه! ما وبښه.',
          },
          isOptional: true,
          audioUrl: '/audio/files/jalsa.mp3',
          audioAssetId: 'audio_jalsa',
        },
      ],
      reviewStatus: 'reviewed',
      reviewNotes: 'Sitting still between the two Sujuds is Wajib in Hanafi Fiqh. The supplication Rabbighfir li is Mustahabb (recommended), not Fard.',
    },
    {
      stepIndex: 7,
      stepNumberLabel: 'Step 7',
      title: {
        ur: 'دوسرا سجدہ (پہلی رکعت کی تکمیل)',
        en: 'Second Sujud (Completing Rak‘ah 1)',
        ps: 'دوهمه سجده',
      },
      titleArabic: 'السُّجُودُ الثَّانِي',
      transliteration: 'As-Sujūd ath-Thānī',
      instruction: {
        ur: '"اللہ اکبر" کہتے ہوئے دوبارہ دوسرے سجدے میں جائیں۔ تین بار "سبحان ربی الاعلیٰ" پڑھیں۔ اس کے بعد دوسری رکعت کے لیے اٹھیں۔',
        en: 'Say "Allahu Akbar" and prostrate a second time. Recite "Subhana Rabbiyal-A‘la" three times, completing the first Rak‘ah.',
        ps: '"الله اکبر" ووايئ او دوهمې سجدې ته لاړ شئ، درې ځله تسبیح ووایاست او بیا دوهم رکعت ته راپورته شئ.',
      },
      spokenNarration: {
        ur: 'اللہ اکبر کہتے ہوئے دوسرے سجدے میں جائیے۔ ٹھہریں اور "سبحان ربی الاعلیٰ" تین مرتبہ پڑھیں۔',
        en: 'Say Allahu Akbar and descend into the second prostration. Stay still and recite Subhana Rabbiyal-A‘la three times.',
        ps: 'الله اکبر ووايئ او دوهمې سجدې ته لاړ شئ. هلته تم شئ او درې ځله "سبحان ربي الاعلیٰ" ووایاست.',
      },
      malePose: 'sujood-2',
      femalePose: 'sujood-2',
      poseDescription: {
        male: {
          ur: 'پہلے سجدے کی طرح کہنیاں اور پیٹ اونچے رکھ کر پیشانی و ناک زمین پر جمائیں۔ فارغ ہو کر بغیر بیٹھے سیدھے کھڑے ہوں۔',
          en: 'Same posture as first Sujud: 7 points grounded, elbows elevated. Rise directly to a stand without a sitting pause (Jalsat al-Istirahah).',
          ps: 'د لومړۍ سجدې په څېر سجده وکړئ او بیا نېغ دوهم رکعت ته ولاړ شئ.',
        },
        female: {
          ur: 'پہلے سجدے کی طرح سمٹ کر اور کہنیاں زمین پر بچھا کر سجدہ کریں۔ اس کے بعد دوسری رکعت کے لیے اٹھیں۔',
          en: 'Perform compact prostration with arms along the ground and feet to the right side, then rise for the second rak‘ah.',
          ps: 'د لومړۍ سجدې په څېر راټوله سجده وکړئ او ورپسې دوهم رکعت ته پورته شئ.',
        },
      },
      pngAssetId: 'salah_sujood_2',
      hasPngAsset: true,
      imageSrc: '/images/salah/salah_sujood_2.png',
      recitations: [
        {
          id: 'sujood-tasbeeh-2',
          label: {
            ur: 'دوسرے سجدے کی تسبیح (3 مرتبہ)',
            en: 'Second Sujud Tasbeeh (3 times)',
            ps: 'د دوهمې سجدې تسبیح',
          },
          arabicText: 'سُبْحَانَ رَبِّيَ الأَعْلَىٰ',
          transliteration: 'Subḥāna Rabbiyal-A‘lā',
          translation: {
            ur: 'پاک ہے میرا رب جو سب سے بلند و بالا ہے۔ (3 مرتبہ)',
            en: 'Glory be to my Lord, the Most High (recited 3 times).',
            ps: 'پاک دی زما رب چې ډېر لوړ دی. (۳ ځله)',
          },
          repeatCount: 3,
          audioUrl: '/audio/files/sujood.mp3',
          audioAssetId: 'audio_sujood',
        },
      ],
      reviewStatus: 'reviewed',
    },
    {
      stepIndex: 8,
      stepNumberLabel: 'Step 8',
      title: {
        ur: 'دوسری رکعت (قیام، تلاوت، رکوع و سجود)',
        en: 'Second Rak‘ah (Standing, Ruku‘ & Sujud)',
        ps: 'دوهم رکعت',
      },
      titleArabic: 'الرَّكْعَةُ الثَّانِيَةُ',
      transliteration: 'Ar-Rak‘at ath-Thāniyah',
      instruction: {
        ur: 'سیدھے کھڑے ہوں۔ ثناء اور تعوذ نہ پڑھیں؛ تسمیہ سے شروع کر کے سورہ فاتحہ اور سورت پڑھیں، پھر رکوع، قومہ اور دونوں سجدے پہلی رکعت کی طرح ادا کریں۔',
        en: 'Stand upright. Do not repeat Sana or Ta‘awwudh; begin with Tasmiyah, recite Surah Al-Fatihah and a surah, then perform Ruku‘, Qawmah, and both Sujuds.',
        ps: 'نېغ ودرېږئ. ثناء او اعوذ بالله مه تکراروئ؛ له بسم الله څخه پیل کړئ، فاتحه او سورت ووایاست، بیا رکوع او دوه سجدې لکه لومړی رکعت بشپړې کړئ.',
      },
      spokenNarration: {
        ur: 'دوسری رکعت شروع ہو گئی ہے۔ ثناء دوبارہ نہیں پڑھی جاتی۔ تسمیہ، سورہ فاتحہ اور اس کے بعد ایک سورہ پڑھیں؛ پھر پہلی رکعت کی طرح رکوع اور دونوں سجود مکمل کریں۔',
        en: 'The second rak‘ah has begun. Sana is not recited again. Recite Tasmiyah, Surah Al-Fatihah, and an additional surah, then complete Ruku‘ and both prostrations.',
        ps: 'دوهم رکعت پیل شو. ثناء بیا نه ویل کېږي. تسمیه، فاتحه او یو بل سورت ووایاست؛ بیا لکه لومړی رکعت رکوع او دواړه سجدې ادا کړئ.',
      },
      malePose: 'recite',
      femalePose: 'recite',
      poseDescription: {
        male: {
          ur: 'ناف کے نیچے ہاتھ باندھ کر تلاوت کریں۔ بعد ازاں سنت کے مطابق رکوع، قومہ اور دونوں سجدے ادا کریں۔',
          en: 'Stand with hands clasped below navel for recitation, then perform ruku‘ and both prostrations with exact male posture.',
          ps: 'لاسونه تر نامه لاندې وتړئ، تلاوت وکړئ، او ورپسې رکوع او سجدې وکړئ.',
        },
        female: {
          ur: 'سینے پر ہاتھ باندھ کر تلاوت کریں۔ بعد ازاں خواتین کے طریقے کے مطابق رکوع، قومہ اور سجدے ادا کریں۔',
          en: 'Stand with hands on chest for recitation, followed by feminine ruku‘ and compact prostrations.',
          ps: 'لاسونه پر سينه وتړئ او تر تلاوت وروسته د ښځو په طریقه رکوع او سجدې بشپړې کړئ.',
        },
      },
      pngAssetId: 'salah_stand_next',
      hasPngAsset: true,
      imageSrc: '/images/salah/salah_stand_next.png',
      recitations: [
        {
          id: 'rakah2-fatihah',
          label: {
            ur: 'سورہ فاتحہ (دوسری رکعت)',
            en: 'Surah Al-Fatihah (Rak‘ah 2)',
            ps: 'فاتحه سورت',
          },
          arabicText:
            'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
          transliteration:
            'Al-ḥamdu lillāhi Rabbil-‘ālamīn. Ar-Raḥmānir-Raḥīm. Māliki yawmid-dīn. Iyyāka na‘budu wa iyyāka nasta‘īn. Ihdinaṣ-ṣirāṭal-mustaqīm...',
          translation: {
            ur: 'تمام تعریفیں اللہ کے لیے ہیں جو تمام جہانوں کا پروردگار ہے...',
            en: 'All praise is due to Allah, Lord of the worlds...',
            ps: 'ټولې ستاینې الله لره دي...',
          },
          audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/001001.mp3',
          audioAssetId: 'audio_fatihah',
        },
        {
          id: 'rakah2-surah',
          label: {
            ur: 'سورہ فلق (یا کوئی سورت)',
            en: 'Surah Al-Falaq (113:1–5)',
            ps: 'د فلق سورت',
          },
          arabicText:
            'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
          transliteration:
            'Qul a‘ūdhu bi Rabbil-falaq. Min sharri mā khalaq. Wa min sharri ghāsiqin idhā waqab. Wa min sharrin-naffāthāti fīl-‘uqad. Wa min sharri ḥāsidin idhā ḥasad.',
          translation: {
            ur: 'کہہ دیجیے کہ میں صبح کے رب کی پناہ مانگتا ہوں، ہر اس چیز کے شر سے جو اس نے پیدا کی...',
            en: 'Say: I seek refuge in the Lord of daybreak from the evil of that which He created...',
            ps: 'ووایه: زه د سهار د رب پناه غواړم د هغو شیانو له شر څخه چې ده پیدا کړي دي...',
          },
          audioUrl: 'https://everyayah.com/data/Alafasy_128kbps/113001.mp3',
          audioAssetId: 'audio_falaq',
        },
      ],
      reviewStatus: 'reviewed',
      reviewNotes: 'Strict rule: Sana is never repeated in Rak‘ah 2; Ta‘awwudh is omitted by the majority of Hanafi jurists in Rak‘ah 2 (Bismillah is recited).',
    },
    {
      stepIndex: 9,
      stepNumberLabel: 'Step 9',
      title: {
        ur: 'قعدہ اخیرہ (التحیات، درود اور دعا)',
        en: 'Final Sitting (Qa‘dah Akhirah: Tashahhud, Durood & Du‘a)',
        ps: 'قعده اخیره (التحیات، درود او دعا)',
      },
      titleArabic: 'القَعْدَةُ الأَخِيرَةُ وَالتَّشَهُّدُ',
      transliteration: 'Al-Qa‘datul-Akhīrah',
      instruction: {
        ur: 'دوسرے سجدے سے اٹھ کر بیٹھ جائیں۔ پہلے التحیات، پھر درود ابراہیم اور پھر دعائے ماثورہ پڑھیں۔ شہادت کی انگلی اٹھا کر گواہی دیں۔',
        en: 'Sit calmly after the second Sujud. Recite At-Tahiyyat, Durood Ibrahim, and the final Du‘a in order.',
        ps: 'له سجدې وروسته په قعده کې کښېنئ. لومړی التحیات، بیا درود شریف او وروسته دعا ووایاست.',
      },
      spokenNarration: {
        ur: 'دوسرے سجدے کے بعد آخری بیٹھک میں بیٹھ جائیے۔ پہلے التحیات پڑھیں۔',
        en: 'After the second prostration, sit in the final sitting posture. Begin by reciting At-Tahiyyat.',
        ps: 'له دوهمې سجدې وروسته په وروستۍ ناسته کې کښېنئ او لومړی التحیات ووایاست.',
      },
      malePose: 'tashahhud',
      femalePose: 'tashahhud',
      poseDescription: {
        male: {
          ur: 'بایاں پاؤں بچھا کر اس پر بیٹھیں، دایاں پاؤں کھڑا رہے۔ شہادت کی انگلی "اشھد ان لا الہ" پر اٹھائیں اور "الا اللہ" پر جھکا دیں۔ (افتراش)',
          en: 'Sit in Iftirash (on left foot, right foot upright). Raise right index finger when reciting "Lā ilāha" and lower it on "ill-Allāh".',
          ps: 'پر چپه پښه کښېنئ او ښۍ ولاړه وساتئ. د شهادت ګوته پر "لا اله" پورته او پر "الا الله" کښته کړئ.',
        },
        female: {
          ur: 'زمین پر سرین کے بل بیٹھیں اور دونوں پاؤں دائیں طرف نکال لیں (تورک)۔ انگلیاں رانوں پر ملی رکھ کر شہادت کی انگلی سے اشارہ کریں۔',
          en: 'Sit in Tawarruk (on left hip on the floor with both legs exiting to the right). Perform the index finger gesture during Tashahhud.',
          ps: 'پر چپه کوناټي کښېنئ او پښې ښي خوا ته وباسئ (تورک). په التحیات کې د شهادت ګوته پورته کړئ.',
        },
      },
      pngAssetId: 'salah_tashahhud',
      hasPngAsset: true,
      imageSrc: '/images/salah/salah_tashahhud.png',
      recitations: [
        {
          id: 'tashahhud-text',
          label: {
            ur: 'التحیات (تشہد - عبد اللہ بن مسعود روایت)',
            en: 'At-Tahiyyat (Tashahhud — Ibn Mas‘ud Narration)',
            ps: 'التحیات',
          },
          arabicText:
            'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ ، السَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ اللَّهِ الصَّالِحِينَ ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
          transliteration:
            'At-taḥiyyātu lillāhi waṣ-ṣalawātu waṭ-ṭayyibāt. As-salāmu ‘alayka ayyuhan-Nabiyyu wa raḥmatullāhi wa barakātuh. As-salāmu ‘alaynā wa ‘alā ‘ibādillāhiṣ-ṣāliḥīn. Ash-hadu allā ilāha illallāhu, wa ash-hadu anna Muḥammadan ‘abduhū wa rasūluh.',
          translation: {
            ur: 'تمام قولی، بدنی اور مالی عبادتیں اللہ ہی کے لیے ہیں۔ اے نبی! آپ پر سلام ہو اور اللہ کی رحمت اور اس کی برکتیں ہوں۔ ہم پر اور اللہ کے نیک بندوں پر سلام ہو۔ میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں، اور میں گواہی دیتا ہوں کہ محمد (ﷺ) اس کے بندے اور رسول ہیں۔',
            en: 'All verbal, physical, and financial acts of worship are for Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no deity worthy of worship except Allah, and I bear witness that Muhammad is His servant and messenger.',
            ps: 'ټولې ژبنۍ، بدني او مالي عبادتونه د الله لپاره دي. پر تا سلام شه ای پیغمبره او د الله رحمت او برکتونه دې وي...',
          },
          audioUrl: '/audio/files/tashahhud.mp3',
          audioAssetId: 'audio_tashahhud',
        },
        {
          id: 'durood-ibrahim',
          label: {
            ur: 'درود ابراہیمی',
            en: 'Durood Ibrahim (Salawat)',
            ps: 'درود ابراهیمي',
          },
          arabicText:
            'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ ، اللَّهُمَّ بَارِكْ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
          transliteration:
            'Allāhumma ṣalli ‘alā Muḥammadiw-wa ‘alā āli Muḥammadin, kamā ṣallayta ‘alā Ibrāhīma wa ‘alā āli Ibrāhīma, innaka Ḥamīdum-Majīd. Allāhumma bārik ‘alā Muḥammadiw-wa ‘alā āli Muḥammadin, kamā bārakta ‘alā Ibrāhīma wa ‘alā āli Ibrāhīma, innaka Ḥamīdum-Majīd.',
          translation: {
            ur: 'اے اللہ! رحمت نازل فرما محمد (ﷺ) پر اور ان کی آل پر، جیسا کہ تو نے رحمت فرمائی ابراہیم (علیہ السلام) پر اور ان کی آل پر، بے شک تو قابل تعریف اور بڑی شان والا ہے۔ اے اللہ! برکت نازل فرما محمد (ﷺ) پر اور ان کی آل پر، جیسا کہ تو نے برکت نازل فرمائی ابراہیم (علیہ السلام) پر اور ان کی آل پر، بے شک تو قابل تعریف اور بڑی شان والا ہے۔',
            en: 'O Allah, send blessings upon Muhammad and upon the family of Muhammad, as You sent blessings upon Ibrahim and upon the family of Ibrahim; indeed, You are Praiseworthy and Majestic. O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim; indeed, You are Praiseworthy and Majestic.',
            ps: 'ای الله! پر محمد (ص) او د هغه پر کورنۍ رحمت ولېږه لکه څنګه چې دې پر ابراهیم او د هغه پر کورنۍ ولېږه...',
          },
          audioUrl: '/audio/files/durood.mp3',
          audioAssetId: 'audio_durood',
        },
        {
          id: 'dua-masura',
          label: {
            ur: 'دعائے ماثورہ',
            en: 'Du‘a Ma’surah (Concluding Supplication)',
            ps: 'د پای دعا',
          },
          arabicText:
            'اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ ، فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ وَارْحَمْنِي ، إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ',
          transliteration:
            'Allāhumma innī ẓalamtu nafsī ẓulman kathīraw-wa lā yaghfirudh-dhunūba illā anta, faghfir lī maghfiratam-min ‘indika warḥamnī, innaka antal-Ghafūrur-Raḥīm.',
          translation: {
            ur: 'اے اللہ! میں نے اپنی جان پر بہت بڑا ظلم کیا ہے اور تیرے سوا کوئی گناہوں کو معاف نہیں کر سکتا، پس تو اپنے پاس سے میری مغفرت فرما اور مجھ پر رحم فرما، بے شک تو ہی بخشنے والا، نہایت رحم فرمانے والا ہے۔',
            en: 'O Allah, I have wronged myself greatly, and none forgives sins except You. So grant me forgiveness from Yourself and have mercy on me; indeed, You are the Forgiving, the Merciful.',
            ps: 'ای الله! ما پر خپل ځان ډېر ظلم کړی او بې له تا څوک ګناهونه نه بښي، نو ماته له خپل لوري بښنه وکړه...',
          },
          audioUrl: '/audio/files/dua_masura.mp3',
          audioAssetId: 'audio_dua_masura',
        },
      ],
      reviewStatus: 'reviewed',
      reviewNotes: 'Standard Hanafi practice adopts Ibn Mas‘ud’s Tashahhud word-for-word. Finger raising happens at La Ilaha and lowered on Ill-Allah.',
    },
    {
      stepIndex: 10,
      stepNumberLabel: 'Step 10',
      title: {
        ur: 'سلام اور نماز کا اختتام',
        en: 'Tasleem (Concluding the Prayer)',
        ps: 'سلام او د لمانځه پای',
      },
      titleArabic: 'التَّسْلِيمُ وَخِتَامُ الصَّلَاةِ',
      transliteration: 'At-Taslīm',
      instruction: {
        ur: 'گردن کو دائیں کندھے کی طرف موڑ کر "السلام علیکم و رحمۃ اللہ" کہیں، پھر بائیں کندھے کی طرف موڑ کر یہی الفاظ کہیں۔',
        en: 'Turn your face to the right shoulder saying "Assalamu alaikum wa rahmatullah", then turn to the left repeating the phrase.',
        ps: 'مخ لومړی ښي اوږې ته واړوئ او سلام واچوئ، بیا کیڼې اوږې ته واړوئ او سلام واچوئ.',
      },
      spokenNarration: {
        ur: 'اب پہلے دائیں طرف رخ کر کے "السلام علیکم و رحمۃ اللہ" کہیے۔ پھر بائیں طرف رخ کر کے وہی الفاظ کہیے۔',
        en: 'Now turn your face to the right saying "Assalamu alaikum wa rahmatullah". Then turn to the left saying the same words.',
        ps: 'اوس لومړی ښي لوري ته مخ واړوئ او "السلام علیکم و رحمة الله" ووایاست، بیا کیڼ لوري ته همدا الفاظ تکرار کړئ.',
      },
      malePose: 'tasleem-right',
      femalePose: 'tasleem-right',
      poseDescription: {
        male: {
          ur: 'پہلے چہرہ دائیں طرف موڑیں تاکہ گال پیچھے والے کو نظر آئے، پھر اسی طرح بائیں طرف موڑیں۔ سینہ قبلہ رخ ہی رہے۔',
          en: 'Turn head right until right cheek is visible from behind, then turn left similarly. Torso and chest stay oriented toward Qiblah.',
          ps: 'سر لومړی ښي خوا او بیا کیڼ خوا ته وګرځوئ. سينه باید د قبلې لور ته پاتې شي.',
        },
        female: {
          ur: 'چہرہ دائیں طرف اور پھر بائیں طرف موڑیں۔ آواز دھیمی رہے اور سینہ قبلہ رخ رہے۔',
          en: 'Turn head smoothly right, then left, reciting in a subdued voice with chest facing Qiblah.',
          ps: 'سر په ارامۍ ښي او کیڼ خوا ته واړوئ او په ټيټ غږ سلام واچوئ.',
        },
      },
      pngAssetId: 'salah_tasleem',
      hasPngAsset: true,
      imageSrc: '/images/salah/salah_tasleem.png',
      recitations: [
        {
          id: 'salam-right',
          label: {
            ur: 'سلام (دائیں طرف)',
            en: 'Salaam (Turn to Right)',
            ps: 'ښي لوري ته سلام',
          },
          arabicText: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ',
          transliteration: 'As-salāmu ‘alaykum wa raḥmatullāh',
          translation: {
            ur: 'تم پر سلامتی ہو اور اللہ کی رحمت۔',
            en: 'Peace and mercy of Allah be upon you.',
            ps: 'پر تاسو دې سلام او د الله رحمت وي.',
          },
          audioUrl: '/audio/files/salam.mp3',
          audioAssetId: 'audio_salam_right',
        },
        {
          id: 'salam-left',
          label: {
            ur: 'سلام (بائیں طرف)',
            en: 'Salaam (Turn to Left)',
            ps: 'کیڼ لوري ته سلام',
          },
          arabicText: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ',
          transliteration: 'As-salāmu ‘alaykum wa raḥmatullāh',
          translation: {
            ur: 'تم پر سلامتی ہو اور اللہ کی رحمت۔',
            en: 'Peace and mercy of Allah be upon you.',
            ps: 'پر تاسو دې سلام او د الله رحمت وي.',
          },
          audioUrl: '/audio/files/salam.mp3',
          audioAssetId: 'audio_salam_left',
        },
      ],
      reviewStatus: 'reviewed',
      checkpoints: [
        'Turn head smoothly to the right shoulder first',
        'Turn head smoothly to the left shoulder second',
        'Shoulders and chest stay facing forward toward Qiblah',
        'Heart remains in state of gratitude and supplication',
      ],
    },
  ],
};

/**
 * Three-Rak‘ah Fard Prayer (Maghrib)
 * Teaches Qa‘dah Ula (Middle Sitting) after Rak‘ah 2 with Tashahhud only,
 * then standing for Rak‘ah 3 where ONLY Surah Al-Fatihah is recited.
 */
export const THREE_RAKAH_FARD_LESSON: SalahLesson = {
  metadata: {
    id: 'three-rakah-fard',
    title: {
      ur: 'تین رکعت فرض نماز (مغرب - حنفی طریقہ)',
      en: 'Three-Rak‘ah Fard Prayer (Maghrib — Hanafi Method)',
      ps: 'درې رکعته فرض لمونځ (مغرب)',
    },
    subtitle: {
      ur: 'پہلی بیٹھک (قعدہ اولیٰ) اور تیسری رکعت میں صرف سورہ فاتحہ کے اصول',
      en: 'Teaches middle sitting after Rak‘ah 2 and Fatihah-only in Rak‘ah 3',
      ps: 'د لومړۍ قعدې او دریم رکعت ځانګړي اصول',
    },
    fiqhMethod: 'Hanafi',
    prayerType: 'Fard',
    rakahs: 3,
    description: {
      ur: 'مغرب کے تین رکعت فرض کا باقاعدہ سبق، جس میں دوسری رکعت کے بعد قعدہ اولیٰ میں صرف التحیات پڑھ کر اٹھنے اور تیسری رکعت میں صرف سورہ فاتحہ پڑھنے کا طریقہ سکھایا گیا ہے۔',
      en: 'Detailed 3-rak‘ah Fard guide demonstrating middle sitting after Rak‘ah 2 with At-Tahiyyat only, and reciting ONLY Surah Al-Fatihah (no second surah) in the 3rd rak‘ah.',
      ps: 'د ماښام د درې رکعته فرض لمانځه لارښود، چې د دوهم رکعت قعده او په دریم رکعت کې یوازې د فاتحې ویل ښيي.',
    },
    reviewStatus: 'reviewed',
    reviewedBy: 'Qualified Hanafi Curriculum Committee',
    sourceReferences: [
      'Maraqi al-Falah — Fasl fi Sifat al-Salah',
      'Fatawa Shami — Wujub al-Qirā’ah fīl-Ulayayn',
    ],
    lastReviewedDate: '2026-03-01',
  },
  steps: [
    ...TWO_RAKAH_FARD_LESSON.steps.slice(0, 8),
    {
      stepIndex: 8,
      stepNumberLabel: 'Step 8',
      title: {
        ur: 'قعدہ اولیٰ (دوسری رکعت کے بعد درمیانی بیٹھک)',
        en: 'Qa‘dah Ūlā (Middle Sitting after Rak‘ah 2)',
        ps: 'لومړۍ قعده (له دوهم رکعت وروسته ناسته)',
      },
      titleArabic: 'القَعْدَةُ الأُولَىٰ',
      transliteration: 'Al-Qa‘datul-Ūlā',
      instruction: {
        ur: 'دوسری رکعت کے دوسرے سجدے کے بعد بیٹھ جائیں۔ اس درمیانی بیٹھک میں صرف التحیات (تشہد) پڑھیں، درود شریف نہ پڑھیں، اور "اللہ اکبر" کہہ کر تیسری رکعت کے لیے کھڑے ہو جائیں۔',
        en: 'Sit after the 2nd rak‘ah prostrations. Recite At-Tahiyyat ONLY (do not recite Durood or Du‘a here), then say Allahu Akbar and stand for Rak‘ah 3.',
        ps: 'له دوهم رکعت وروسته کېنئ او یوازې التحیات ووایاست، درود شریف مه وایاست او دریم رکعت ته راپورته شئ.',
      },
      spokenNarration: {
        ur: 'دوسری رکعت کے بعد قعدہ اولیٰ میں بیٹھیں۔ یہاں صرف التحیات پڑھیں اور درود پڑھے بغیر اللہ اکبر کہہ کر تیسری رکعت کے لیے کھڑے ہو جائیں۔',
        en: 'In the middle sitting after the second rak‘ah, recite At-Tahiyyat only. Do not recite Durood; say Allahu Akbar and rise for the third rak‘ah.',
        ps: 'له دوهم رکعت وروسته په لومړۍ قعده کې یوازې التحیات ووایاست او دریم رکعت ته پورته شئ.',
      },
      malePose: 'tashahhud',
      femalePose: 'tashahhud',
      poseDescription: {
        male: {
          ur: 'افتراش کے انداز میں بیٹھیں اور صرف التحیات پڑھ کر فوراً کھڑے ہوں۔',
          en: 'Sit in Iftirash, recite Tashahhud only, and rise promptly.',
          ps: 'پر چپه پښه کښېنئ او یوازې تشهد ووایاست.',
        },
        female: {
          ur: 'تورک کے انداز میں بیٹھیں اور صرف التحیات پڑھ کر تیسری رکعت کے لیے کھڑی ہوں۔',
          en: 'Sit in Tawarruk, recite Tashahhud only, and rise for the 3rd rak‘ah.',
          ps: 'په تورک کښېنئ او یوازې التحیات ووایاست.',
        },
      },
      pngAssetId: 'salah_tashahhud',
      hasPngAsset: false,
      recitations: [TWO_RAKAH_FARD_LESSON.steps[9].recitations[0]],
      reviewStatus: 'reviewed',
      reviewNotes: 'Strict Hanafi rule: Sitting in Qa‘dah Ula is Wajib. Reciting anything beyond Tashahhud in Qa‘dah Ula before standing incurs Sajdah Sahw if prolonged.',
    },
    {
      stepIndex: 9,
      stepNumberLabel: 'Step 9',
      title: {
        ur: 'تیسری رکعت (صرف سورہ فاتحہ)',
        en: 'Third Rak‘ah (Surah Al-Fatihah Only)',
        ps: 'دریم رکعت (یوازې فاتحه سورت)',
      },
      titleArabic: 'الرَّكْعَةُ الثَّالِثَةُ (الفَاتِحَةُ فَقَطْ)',
      transliteration: 'Ar-Rak‘at ath-Thālithah',
      instruction: {
        ur: 'تیسری رکعت میں کھڑے ہو کر بسم اللہ اور صرف سورہ فاتحہ پڑھیں (کوئی سورت نہ ملائیں)۔ پھر رکوع، قومہ اور دونوں سجدے ادا کریں۔',
        en: 'In the 3rd rak‘ah of Fard prayer, recite Tasmiyah and Surah Al-Fatihah ONLY — no additional surah is recited. Complete Ruku‘, Qawmah, and both Sujuds.',
        ps: 'په دریم فرض رکعت کې یوازې بسم الله او د فاتحې سورت ووایاست، بل سورت مه ورسره ګډوئ.',
      },
      spokenNarration: {
        ur: 'تیسری رکعت میں صرف سورہ فاتحہ پڑھی جائے گی، اس کے بعد کوئی سورت نہیں ملائی جاتی۔ پھر رکوع اور دونوں سجود ادا کریں۔',
        en: 'In the third rak‘ah of Fard, only Surah Al-Fatihah is recited without adding another surah. Then complete Ruku‘ and both prostrations.',
        ps: 'په دریم فرض رکعت کې یوازې د فاتحې سورت ویل کېږي، ورپسې بل سورت مه وایاست او رکوع او سجدې وکړئ.',
      },
      malePose: 'recite',
      femalePose: 'recite',
      poseDescription: {
        male: {
          ur: 'ناف کے نیچے ہاتھ باندھ کر دھیمی آواز میں سورہ فاتحہ پڑھیں، پھر رکوع و سجود کریں۔',
          en: 'Hands below navel, recite Al-Fatihah silently, then complete ruku‘ and sujud.',
          ps: 'لاسونه تر نامه لاندې، په پټه فاتحه ووایاست او رکوع او سجدې ادا کړئ.',
        },
        female: {
          ur: 'سینے پر ہاتھ باندھ کر سورہ فاتحہ پڑھیں اور بقیہ ارکان ادا کریں۔',
          en: 'Hands on chest, recite Al-Fatihah silently, then complete postures.',
          ps: 'لاسونه پر سينه او په پټه فاتحه ووایاست.',
        },
      },
      pngAssetId: 'salah_recite',
      hasPngAsset: false,
      recitations: [TWO_RAKAH_FARD_LESSON.steps[8].recitations[0]],
      reviewStatus: 'reviewed',
      reviewNotes: 'In Hanafi Fard prayers, reciting an additional surah in Rak‘ahs 3 or 4 is Makruh Tanzīhī; in Sunnah and Nafl, an additional surah is required.',
    },
    {
      ...TWO_RAKAH_FARD_LESSON.steps[9],
      stepIndex: 10,
      stepNumberLabel: 'Step 10',
    },
    {
      ...TWO_RAKAH_FARD_LESSON.steps[10],
      stepIndex: 11,
      stepNumberLabel: 'Step 11',
    },
  ],
};

/**
 * Four-Rak‘ah Fard Prayer (Dhuhr, ‘Asr, ‘Isha)
 * Teaches middle sitting after Rak‘ah 2, and reciting Fatihah only in Rak‘ahs 3 & 4.
 */
export const FOUR_RAKAH_FARD_LESSON: SalahLesson = {
  metadata: {
    id: 'four-rakah-fard',
    title: {
      ur: 'چار رکعت فرض نماز (ظہر، عصر، عشاء)',
      en: 'Four-Rak‘ah Fard Prayer (Dhuhr, ‘Asr, ‘Isha)',
      ps: 'څلور رکعته فرض لمونځ (ماسپښین، مازیګر، ماسخوتن)',
    },
    subtitle: {
      ur: 'قعدہ اولیٰ اور آخری دو رکعتوں کے مخصوص احکام',
      en: 'Full 4-rak‘ah progression with middle sitting and Fard recitation rules',
      ps: 'د څلور رکعتي فرضو بشپړ لارښود',
    },
    fiqhMethod: 'Hanafi',
    prayerType: 'Fard',
    rakahs: 4,
    description: {
      ur: 'ظہر، عصر اور عشاء کے چار رکعت فرض کا جامع تعلیمی سبق۔ پہلی دو رکعتوں میں سورت ملائی جاتی ہے، درمیانی قعدہ میں صرف تشہد پڑھی جاتی ہے، اور آخری دو رکعتوں میں صرف سورہ فاتحہ پڑھی جاتی ہے۔',
      en: 'Comprehensive 4-rak‘ah Fard lesson. Demonstrates surah recitation in the first 2 rak‘ahs, middle sitting after Rak‘ah 2, and Fatihah-only in Rak‘ahs 3 and 4.',
      ps: 'د څلور رکعتي فرض لمانځه بشپړ درس چې لومړیو دوو کې سورت او وروستیو دوو کې یوازې فاتحه لوستل کېږي.',
    },
    reviewStatus: 'reviewed',
    reviewedBy: 'Qualified Hanafi Curriculum Committee',
    sourceReferences: [
      'Al-Hidayah fi Sharh Bidayat al-Mubtadi',
      'Maraqi al-Falah — Sifat al-Salah',
    ],
    lastReviewedDate: '2026-03-01',
  },
  steps: [
    ...THREE_RAKAH_FARD_LESSON.steps.slice(0, 10),
    {
      stepIndex: 10,
      stepNumberLabel: 'Step 10',
      title: {
        ur: 'چوتھی رکعت (صرف سورہ فاتحہ، رکوع و سجود)',
        en: 'Fourth Rak‘ah (Surah Al-Fatihah Only)',
        ps: 'څلورم رکعت (یوازې فاتحه سورت)',
      },
      titleArabic: 'الرَّكْعَةُ الرَّابِعَةُ (الفَاتِحَةُ فَقَطْ)',
      transliteration: 'Ar-Rak‘at ar-Rābi‘ah',
      instruction: {
        ur: 'چوتھی رکعت کے لیے اٹھیں۔ تیسری رکعت کی طرح صرف سورہ فاتحہ پڑھیں، پھر رکوع، قومہ اور دونوں سجدے ادا کر کے قعدہ اخیرہ میں بیٹھیں۔',
        en: 'Rise for the 4th rak‘ah. Recite Surah Al-Fatihah ONLY, complete Ruku‘ and both Sujuds, then sit for the final sitting (Qa‘dah Akhirah).',
        ps: 'څلورم رکعت ته ولاړ شئ، یوازې فاتحه ووایاست، رکوع او سجدې وکړئ او وروستۍ قعدې ته کښېنئ.',
      },
      spokenNarration: {
        ur: 'چوتھی رکعت میں بھی صرف سورہ فاتحہ پڑھی جائے گی۔ اس کے بعد رکوع اور دونوں سجود ادا کر کے آخری بیٹھک میں تشریف رکھیں۔',
        en: 'In the fourth rak‘ah, only Surah Al-Fatihah is recited. Complete Ruku‘ and both prostrations, then sit for the final sitting.',
        ps: 'په څلورم رکعت کې هم یوازې فاتحه ویل کېږي. رکوع او سجدې بشپړې کړئ او وروستۍ ناستې ته کښېنئ.',
      },
      malePose: 'recite',
      femalePose: 'recite',
      poseDescription: {
        male: {
          ur: 'سیدھے کھڑے ہو کر فاتحہ پڑھیں اور بقیہ ارکان مکمل کریں۔',
          en: 'Stand upright, recite Al-Fatihah, and complete postures.',
          ps: 'نېغ ودرېږئ، فاتحه ووایاست او رکوع او سجدې وکړئ.',
        },
        female: {
          ur: 'سینے پر ہاتھ باندھ کر فاتحہ پڑھیں اور بقیہ ارکان مکمل کریں۔',
          en: 'Hands on chest, recite Al-Fatihah, and complete postures.',
          ps: 'لاسونه پر سينه او فاتحه ووایاست.',
        },
      },
      pngAssetId: 'salah_recite',
      hasPngAsset: false,
      recitations: [TWO_RAKAH_FARD_LESSON.steps[8].recitations[0]],
      reviewStatus: 'reviewed',
    },
    {
      ...TWO_RAKAH_FARD_LESSON.steps[9],
      stepIndex: 11,
      stepNumberLabel: 'Step 11',
    },
    {
      ...TWO_RAKAH_FARD_LESSON.steps[10],
      stepIndex: 12,
      stepNumberLabel: 'Step 12',
    },
  ],
};

/**
 * Hanafi Witr Prayer (3 Rak‘ahs Wajib)
 * Distinct religious obligation (Wajib) with unique 3rd rak‘ah sequence:
 * Surah Al-Fatihah + Additional Surah, then raising hands for Qunoot Takbir,
 * refolding hands, and reciting Du‘a al-Qunoot BEFORE Ruku‘!
 */
export const HANAFI_WITR_LESSON: SalahLesson = {
  metadata: {
    id: 'hanafi-witr',
    title: {
      ur: 'نماز وتر واجب (حنفی طریقہ)',
      en: 'Witr Prayer — 3 Rak‘ahs Wajib (Hanafi Method)',
      ps: 'د وتر واجب لمونځ (حنفي طریقه)',
    },
    subtitle: {
      ur: 'تکبیر قنوت اور دعائے قنوت کی مکمل رہنمائی',
      en: 'Dedicated lesson featuring Qunoot Takbir & Du‘a al-Qunoot before Ruku‘',
      ps: 'د قنوت تکبیر او دعاء قنوت بشپړ لارښود',
    },
    fiqhMethod: 'Hanafi',
    prayerType: 'Wajib',
    rakahs: 3,
    description: {
      ur: 'حنفی مسلک کے مطابق وتر کی تین رکعتیں واجب ہیں۔ پہلی دو رکعتوں کے بعد قعدہ اولیٰ، اور تیسری رکعت میں سورہ فاتحہ کے ساتھ سورت ملانے کے بعد ہاتھ اٹھا کر تکبیر قنوت کہنا اور دعائے قنوت پڑھنا لازم ہے۔ اسے عام فرض نماز کی طرح نہیں پڑھا جاتا۔',
      en: 'Witr is Wajib in Hanafi Fiqh and must NOT be treated as a normal 3-rak‘ah Fard prayer. In the 3rd rak‘ah, an additional surah is recited, hands are raised for Qunoot Takbir, and Du‘a al-Qunoot is recited BEFORE Ruku‘.',
      ps: 'د حنفي فقهې له مخې د وتر لمونځ واجب دی. په دریم رکعت کې تر سورت وروسته د غوږونو برابر لاسونه پورته کېږي، تکبیر ویل کېږي او تر رکوع مخکې دعاء قنوت لوستل کېږي.',
    },
    reviewStatus: 'reviewed',
    reviewedBy: 'Qualified Hanafi Curriculum Committee',
    sourceReferences: [
      'Maraqi al-Falah — Bab Salat al-Witr',
      'Radd al-Muhtar (Fatawa Shami) — Wujub Salat al-Witr wa Sifatuha',
      'Al-Hidayah — Fasl fil-Witr',
    ],
    lastReviewedDate: '2026-03-01',
  },
  steps: [
    ...TWO_RAKAH_FARD_LESSON.steps.slice(0, 8),
    {
      stepIndex: 8,
      stepNumberLabel: 'Step 8',
      title: {
        ur: 'قعدہ اولیٰ (وتر کی درمیانی بیٹھک)',
        en: 'Qa‘dah Ūlā (Witr Middle Sitting)',
        ps: 'لومړۍ ناسته',
      },
      titleArabic: 'القَعْدَةُ الأُولَىٰ فِي الوِتْرِ',
      transliteration: 'Al-Qa‘datul-Ūlā fil-Witr',
      instruction: {
        ur: 'دوسری رکعت کے بعد بیٹھ کر صرف التحیات پڑھیں اور تیسری رکعت کے لیے کھڑے ہو جائیں۔',
        en: 'Sit after Rak‘ah 2, recite At-Tahiyyat only, then rise for the 3rd rak‘ah.',
        ps: 'له دوهم رکعت وروسته کښېنئ او یوازې التحیات ووایاست.',
      },
      spokenNarration: {
        ur: 'دوسری رکعت کے بعد قعدہ اولیٰ میں صرف التحیات پڑھیں اور اللہ اکبر کہہ کر تیسری رکعت کے لیے کھڑے ہو جائیں۔',
        en: 'In the middle sitting of Witr, recite At-Tahiyyat only, then rise with Takbir for the crucial third rak‘ah.',
        ps: 'په لومړۍ ناسته کې یوازې التحیات ووایاست او دریم رکعت ته پورته شئ.',
      },
      malePose: 'tashahhud',
      femalePose: 'tashahhud',
      poseDescription: {
        male: {
          ur: 'افتراش کی حالت میں بیٹھ کر تشہد پڑھیں۔',
          en: 'Sit in Iftirash and recite Tashahhud.',
          ps: 'پر چپه پښه کښېنئ او التحیات ووایاست.',
        },
        female: {
          ur: 'تورک کی حالت میں بیٹھ کر تشہد پڑھیں۔',
          en: 'Sit in Tawarruk and recite Tashahhud.',
          ps: 'په تورک کښېنئ او التحیات ووایاست.',
        },
      },
      pngAssetId: 'salah_tashahhud',
      hasPngAsset: false,
      recitations: [TWO_RAKAH_FARD_LESSON.steps[9].recitations[0]],
      reviewStatus: 'reviewed',
    },
    {
      stepIndex: 9,
      stepNumberLabel: 'Step 9',
      title: {
        ur: 'وتر کی تیسری رکعت (فاتحہ اور سورت تلاوت)',
        en: 'Witr 3rd Rak‘ah: Fatihah & Surah',
        ps: 'د دریم رکعت تلاوت',
      },
      titleArabic: 'قِرَاءَةُ الفَاتِحَةِ وَالسُّورَةِ فِي الوِتْرِ',
      transliteration: 'Qirā’at al-Fātiḥah was-Sūrah',
      instruction: {
        ur: 'وتر کی تیسری رکعت میں تسمیہ، سورہ فاتحہ، اور اس کے بعد کوئی سورت (جیسے سورہ اخلاص یا سورہ فلق) لازماً پڑھیں۔ فرض کی طرح صرف فاتحہ پر اکتفا نہ کریں۔',
        en: 'In Witr 3rd rak‘ah, you MUST recite Surah Al-Fatihah AND an additional Surah (e.g. Al-Ikhlas or Al-Falaq). Do not treat it like Fard.',
        ps: 'په دریم رکعت کې تر فاتحې وروسته خامخا بل سورت (لکه اخلاص یا فلق) ووایاست.',
      },
      spokenNarration: {
        ur: 'وتر کی تیسری رکعت میں سورہ فاتحہ کے بعد ایک سورت ضرور ملائی جاتی ہے۔ تلاوت کے بعد رکوع میں جانے کے بجائے تکبیر قنوت کہی جائے گی۔',
        en: 'In the third rak‘ah of Witr, an additional surah is mandatory after Al-Fatihah. After reciting, do not go to Ruku‘ yet; the Qunoot Takbir comes next.',
        ps: 'د وترو په دریم رکعت کې تر فاتحې وروسته بل سورت ویل کېږي. تر دې وروسته رکوع ته نه ځو بلکې د قنوت تکبیر وایو.',
      },
      malePose: 'recite',
      femalePose: 'recite',
      poseDescription: {
        male: {
          ur: 'ہاتھ ناف کے نیچے باندھے ہوئے تلاوت کریں۔',
          en: 'Hands below navel during recitation.',
          ps: 'لاسونه تر نامه لاندې تړلي تلاوت وکړئ.',
        },
        female: {
          ur: 'ہاتھ سینے پر باندھے ہوئے تلاوت کریں۔',
          en: 'Hands on chest during recitation.',
          ps: 'لاسونه پر سينه تړلي تلاوت وکړئ.',
        },
      },
      pngAssetId: 'salah_recite',
      hasPngAsset: false,
      recitations: [
        TWO_RAKAH_FARD_LESSON.steps[8].recitations[0],
        TWO_RAKAH_FARD_LESSON.steps[2].recitations[4],
      ],
      reviewStatus: 'reviewed',
      reviewNotes: 'Hanafi ruling: Adding a Surah in all 3 rak‘ahs of Witr is Wajib.',
    },
    {
      stepIndex: 10,
      stepNumberLabel: 'Step 10',
      title: {
        ur: 'تکبیر قنوت اور دعائے قنوت (وتر کا مخصوص رکن)',
        en: 'Qunoot Takbir & Du‘a al-Qunoot (Unique Witr Action)',
        ps: 'د قنوت تکبیر او دعاء قنوت',
      },
      titleArabic: 'تَكْبِيرَةُ القُنُوتِ وَدُعَاءُ القُنُوتِ',
      transliteration: 'Takbīrat al-Qunūt wa Du‘ā’ al-Qunūt',
      instruction: {
        ur: 'سورت مکمل کرنے کے بعد کھڑے کھڑے دونوں ہاتھ کانوں (خواتین کندھوں) تک اٹھائیں، "اللہ اکبر" کہیں، ہاتھ دوبارہ باندھ لیں، اور اطمینان سے دعائے قنوت پڑھیں۔ اس کے بعد رکوع میں جائیں۔',
        en: 'Immediately after the surah, raise hands to ears (women to shoulders) saying "Allahu Akbar" (Qunoot Takbir). Refold hands and recite Du‘a al-Qunoot before bowing.',
        ps: 'تر سورت وروسته لاسونه د غوږونو نرمیو پورته کړئ، "الله اکبر" ووايئ، بېرته لاسونه وتړئ او دعاء قنوت ووایاست.',
      },
      spokenNarration: {
        ur: 'سورت مکمل کر کے دونوں ہاتھ کانوں تک اٹھائیں اور "اللہ اکبر" کہتے ہوئے دوبارہ ہاتھ باندھ لیں۔ اب دعائے قنوت پڑھیں، پھر رکوع میں جائیں۔',
        en: 'Raise both hands to your ears saying Allahu Akbar, then fold your hands again. Now recite Du‘a al-Qunoot before bowing into Ruku‘.',
        ps: 'لاسونه د غوږونو تر نرمیو پورته کړئ او "الله اکبر" په ویلو سره یې بېرته وتړئ. اوس دعاء قنوت ووایاست، بیا رکوع ته لاړ شئ.',
      },
      malePose: 'witr-qunoot-takbir',
      femalePose: 'witr-qunoot-takbir',
      poseDescription: {
        male: {
          ur: 'کانوں کی لو تک ہاتھ اٹھا کر تکبیر کہیں، پھر ناف کے نیچے دایاں ہاتھ بائیں پر باندھ کر دعائے قنوت پڑھیں۔',
          en: 'Raise hands to earlobes saying Takbir, then refold below navel to recite Du‘a al-Qunoot.',
          ps: 'لاسونه غوږونو ته پورته کړئ، تکبیر ووايئ او تر نامه لاندې یې بېرته وتړئ.',
        },
        female: {
          ur: 'کندھوں تک ہاتھ اٹھا کر تکبیر کہیں، پھر سینے پر ہاتھ باندھ کر دعائے قنوت پڑھیں۔',
          en: 'Raise hands to shoulder level underneath outer covering, then refold on chest to recite Du‘a al-Qunoot.',
          ps: 'لاسونه اوږو ته پورته کړئ، تکبیر ووايئ او پر سينه یې بېرته وتړئ.',
        },
      },
      pngAssetId: 'salah_qunoot',
      hasPngAsset: false,
      recitations: [
        {
          id: 'qunoot-takbir-phrase',
          label: {
            ur: 'تکبیر قنوت',
            en: 'Qunoot Takbir',
            ps: 'د قنوت تکبیر',
          },
          arabicText: 'اللَّهُ أَكْبَرُ',
          transliteration: 'Allāhu Akbar',
          translation: {
            ur: 'اللہ سب سے بڑا ہے۔',
            en: 'Allah is the Greatest.',
            ps: 'الله تر ټولو لوی دی.',
          },
          audioUrl: '/audio/files/takbir.mp3',
          audioAssetId: 'audio_takbir',
        },
        {
          id: 'qunoot-dua',
          label: {
            ur: 'دعائے قنوت',
            en: 'Du‘a al-Qunoot (Hanafi Text)',
            ps: 'دعاء قنوت',
          },
          arabicText:
            'اللَّهُمَّ إِنَّا نَسْتَعِينُكَ وَنَسْتَغْفِرُكَ وَنُؤْمِنُ بِكَ وَنَتَوَكَّلُ عَلَيْكَ وَنُثْنِي عَلَيْكَ الْخَيْرَ وَنَشْكُرُكَ وَلَا نَكْفُرُكَ وَنَخْلَعُ وَنَتْرُكُ مَنْ يَفْجُرُكَ ، اللَّهُمَّ إِيَّاكَ نَعْبُدُ وَلَكَ نُصَلِّي وَنَسْجُدُ وَإِلَيْكَ نَسْعَىٰ وَنَحْفِدُ نَرْجُو رَحْمَتَكَ وَنَخْشَىٰ عَذَابَكَ إِنَّ عَذَابَكَ بِالْكُفَّارِ مُلْحَقٌ',
          transliteration:
            'Allāhumma innā nasta‘īnuka wa nastaghfiruka wa nu’minu bika wa natawakkalu ‘alayka wa nuthnī ‘alaykal-khayra wa nashkuruka wa lā nakfuruk, wa nakhla‘u wa natruku may-yafjuruk. Allāhumma iyyāka na‘budu wa laka nuṣallī wa nasjud, wa ilayka nas‘ā wa naḥfid, narjū raḥmataka wa nakhshā ‘adhābak, inna ‘adhābaka bil-kuffāri mulḥaq.',
          translation: {
            ur: 'اے اللہ! ہم تجھ ہی سے مدد چاہتے ہیں اور تجھ سے بخشش مانگتے ہیں، اور تجھ پر ایمان لاتے ہیں اور تجھ پر بھروسہ کرتے ہیں، اور تیری بہترین تعریف کرتے ہیں، اور تیرا شکر ادا کرتے ہیں اور تیری ناشکری نہیں کرتے، اور ہم الگ کرتے ہیں اور چھوڑتے ہیں ہر اس شخص کو جو تیری نافرمانی کرے۔ اے اللہ! ہم تیری ہی عبادت کرتے ہیں اور تیرے ہی لیے نماز پڑھتے اور سجدہ کرتے ہیں، اور تیری ہی طرف دوڑتے اور حاضر ہوتے ہیں، ہم تیری رحمت کے امیدوار ہیں اور تیرے عذاب سے ڈرتے ہیں، بے شک تیرا عذاب کافروں کو پہنچنے والا ہے۔',
            en: 'O Allah, we seek Your assistance and ask for Your forgiveness, we believe in You and put our trust in You, we praise You with all good, we thank You and are not ungrateful, and we abandon whoever disobeys You. O Allah, You alone we worship, to You we pray and prostrate, toward You we hasten and strive; we hope for Your mercy and fear Your punishment; indeed, Your punishment will overtake the disbelievers.',
            ps: 'ای الله! موږ له تا مرسته غواړو، له تا بښنه غواړو، پر تا ایمان لرو او پر تا توکل کوو...',
          },
          audioUrl: '/audio/files/qunoot.mp3',
          audioAssetId: 'audio_qunoot',
        },
      ],
      reviewStatus: 'reviewed',
      reviewNotes: 'Raising hands for Takbir al-Qunoot and reciting Du‘a al-Qunoot before Ruku‘ in Rak‘ah 3 is Wajib in Hanafi Fiqh. Forgetting it requires Sajdah Sahw.',
      checkpoints: [
        'Complete Surah Al-Fatihah AND an additional surah first',
        'Raise hands to earlobes (men) or shoulders (women) saying Allahu Akbar',
        'Refold hands beneath navel (men) or on chest (women)',
        'Recite Du‘a al-Qunoot before bowing into Ruku‘',
      ],
    },
    {
      stepIndex: 11,
      stepNumberLabel: 'Step 11',
      title: {
        ur: 'رکوع اور سجود (تیسری رکعت)',
        en: 'Ruku‘ & Sujud (Witr Rak‘ah 3)',
        ps: 'د دریم رکعت رکوع او سجدې',
      },
      titleArabic: 'الرُّكُوعُ وَالسُّجُودُ فِي الوِتْرِ',
      transliteration: 'Ar-Rukū‘ was-Sujūd fil-Witr',
      instruction: {
        ur: 'دعائے قنوت کے بعد "اللہ اکبر" کہہ کر رکوع میں جائیں، پھر قومہ اور دونوں سجدے معمول کے مطابق ادا کریں۔',
        en: 'Say "Allahu Akbar" and bow into Ruku‘, rise for Qawmah, and complete both Sujuds as usual.',
        ps: 'تر قنوت وروسته "الله اکبر" ووايئ او رکوع او سجدې ادا کړئ.',
      },
      spokenNarration: {
        ur: 'دعائے قنوت مکمل کر کے اللہ اکبر کہتے ہوئے رکوع میں جائیں اور دونوں سجود مکمل کریں۔',
        en: 'After completing Du‘a al-Qunoot, say Allahu Akbar, bow into Ruku‘, and complete both prostrations.',
        ps: 'تر دعاء قنوت وروسته رکوع او دواړه سجدې بشپړې کړئ.',
      },
      malePose: 'ruku',
      femalePose: 'ruku',
      poseDescription: {
        male: {
          ur: 'سنت کے مطابق رکوع، قومہ اور دونوں سجدے ادا کریں۔',
          en: 'Perform standard male Ruku‘, Qawmah, and both Sujuds.',
          ps: 'د سنتو سره سم رکوع او سجدې وکړئ.',
        },
        female: {
          ur: 'خواتین کے مسنون طریقے سے رکوع اور سجدے ادا کریں۔',
          en: 'Perform feminine Ruku‘ and compact prostrations.',
          ps: 'د ښځو په طریقه رکوع او سجدې وکړئ.',
        },
      },
      pngAssetId: 'salah_ruku',
      hasPngAsset: false,
      recitations: [TWO_RAKAH_FARD_LESSON.steps[3].recitations[0]],
      reviewStatus: 'reviewed',
    },
    {
      ...TWO_RAKAH_FARD_LESSON.steps[9],
      stepIndex: 12,
      stepNumberLabel: 'Step 12',
    },
    {
      ...TWO_RAKAH_FARD_LESSON.steps[10],
      stepIndex: 13,
      stepNumberLabel: 'Step 13',
    },
  ],
};

export const SALAH_LESSONS: Record<SalahLessonId, SalahLesson> = {
  'two-rakah-fard': TWO_RAKAH_FARD_LESSON,
  'three-rakah-fard': THREE_RAKAH_FARD_LESSON,
  'four-rakah-fard': FOUR_RAKAH_FARD_LESSON,
  'hanafi-witr': HANAFI_WITR_LESSON,
};

export const LESSON_LIST: LessonMetadata[] = [
  TWO_RAKAH_FARD_LESSON.metadata,
  THREE_RAKAH_FARD_LESSON.metadata,
  FOUR_RAKAH_FARD_LESSON.metadata,
  HANAFI_WITR_LESSON.metadata,
];
