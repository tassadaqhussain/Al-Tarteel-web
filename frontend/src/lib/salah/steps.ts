/** Educational salah posture steps with visual alignment checklists and prayers. */

export type SalahPose =
  | 'stand'
  | 'takbir'
  | 'recite'
  | 'ruku'
  | 'itidal'
  | 'sujood'
  | 'jalsa'
  | 'tashahhud'
  | 'tasleem';

export type VisualCheckItem = {
  id: string;
  label: string;
  detail: string;
  focusArea?: 'head' | 'hands' | 'back' | 'feet' | 'eyes' | 'knees' | 'chest' | 'elbows';
};

export type SalahStep = {
  id: string;
  pose: SalahPose;
  title: string;
  titleArabic: string;
  transliteration?: string;
  durationMs: number;
  instruction: string;
  recite?: string;
  reciteArabic?: string;
  reciteMeaning?: string;
  visualChecks: VisualCheckItem[];
  commonMistakes: string[];
  schoolNotes?: string;
};

export const CORE_SALAH_STEPS: SalahStep[] = [
  {
    id: 'takbir',
    pose: 'takbir',
    title: 'Takbiratul Ihram — Opening Takbir',
    titleArabic: 'تَكْبِيرَةُ الإِحْرَامِ',
    transliteration: 'Takbīrat al-Iḥrām',
    durationMs: 3000,
    instruction:
      'Stand facing the Qiblah with your intention (Niyyah) in your heart. Raise both hands to the level of your earlobes or shoulders with palms facing forward toward the Qiblah, and say "Allahu Akbar".',
    recite: 'Allāhu Akbar',
    reciteArabic: 'اللَّهُ أَكْبَرُ',
    reciteMeaning: 'Allah is the Greatest.',
    visualChecks: [
      {
        id: 'takbir-hands',
        label: 'Hands at Ear/Shoulder Level',
        detail: 'Raise hands so fingertips align with top of ears or shoulders without stiffening.',
        focusArea: 'hands',
      },
      {
        id: 'takbir-palms',
        label: 'Palms Facing Qiblah',
        detail: 'Palms should face towards the Qiblah, fingers naturally upright (not clenched or overly spread).',
        focusArea: 'hands',
      },
      {
        id: 'takbir-feet',
        label: 'Feet Parallel & Balanced',
        detail: 'Stand with feet about shoulder-width apart, parallel to each other facing Qiblah.',
        focusArea: 'feet',
      },
      {
        id: 'takbir-gaze',
        label: 'Gaze on Prostration Spot',
        detail: 'Keep your eyes softly fixed upon the exact spot where your forehead will touch during Sujood.',
        focusArea: 'eyes',
      },
    ],
    commonMistakes: [
      'Rushing hands up and down without completing the Takbir.',
      'Turning palms inwards toward the ears or backward away from Qiblah.',
      'Looking up towards the ceiling or looking around the room.',
    ],
    schoolNotes:
      'Shafi‘i & Hanbali: hands to shoulder level; Hanafi: men raise to earlobes, women raise to shoulder level under garment.',
  },
  {
    id: 'qiyam',
    pose: 'recite',
    title: 'Qiyam — Standing & Recitation',
    titleArabic: 'القِيَامُ وَالقِرَاءَةُ',
    transliteration: 'Qiyām wa Qirā’ah',
    durationMs: 6000,
    instruction:
      'Fold your right hand over your left hand on your chest or above your navel. Quietly recite the opening supplication (Thana/Du‘a al-Istiftah), seek refuge from Shaytan, recite Surah Al-Fatihah, and follow with another short Surah.',
    recite: 'Al-Fatihah + Short Surah',
    reciteArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ',
    reciteMeaning:
      'In the name of Allah, the Entirely Merciful, the Especially Merciful. All praise is due to Allah, Lord of the worlds...',
    visualChecks: [
      {
        id: 'qiyam-hands',
        label: 'Right Hand Over Left Wrist',
        detail: 'Grasp or rest the right hand over the back of the left hand, wrist, and forearm.',
        focusArea: 'hands',
      },
      {
        id: 'qiyam-posture',
        label: 'Spine Straight & Poised',
        detail: 'Stand straight without slouching forward or leaning heavily onto one foot.',
        focusArea: 'back',
      },
      {
        id: 'qiyam-gaze',
        label: 'Eyes Focused on Sujood Spot',
        detail: 'Do not look around; keep gaze anchored on the prayer mat at the prostration place.',
        focusArea: 'eyes',
      },
      {
        id: 'qiyam-weight',
        label: 'Even Weight Distribution',
        detail: 'Body weight evenly shared between both feet for stability and calm presence (Tuma’ninah).',
        focusArea: 'feet',
      },
    ],
    commonMistakes: [
      'Shifting body weight constantly from foot to foot.',
      'Reciting Al-Fatihah at breakneck speed without pausing between verses.',
      'Letting eyes wander to surroundings.',
    ],
    schoolNotes:
      'Shafi‘i: hands placed below chest and above navel, slightly to the left. Hanafi: men place hands below navel, women on chest. Maliki: widespread practice allows arms resting comfortably at sides (Sadl) or folded (Qabd).',
  },
  {
    id: 'ruku',
    pose: 'ruku',
    title: 'Ruku‘ — Bowing with Level Back',
    titleArabic: 'الرُّكُوعُ',
    transliteration: 'Rukū‘',
    durationMs: 4000,
    instruction:
      'Say "Allahu Akbar" and bow smoothly until your back is flat and horizontal. Clasp your knees firmly with fingers spread wide like claws. Head remains aligned with the spine. Say "Subhana Rabbiyal-‘Azim" three times.',
    recite: 'Subḥāna Rabbiyal-‘Aẓīm (3x)',
    reciteArabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
    reciteMeaning: 'Glory be to my Lord, the Most Magnificent (recited 3 times).',
    visualChecks: [
      {
        id: 'ruku-back',
        label: 'Back Flat at 90° Plane',
        detail: 'Back should be perfectly horizontal — as described in hadith, level enough that water poured on it would settle.',
        focusArea: 'back',
      },
      {
        id: 'ruku-head',
        label: 'Head Aligned with Spine',
        detail: 'Do not drop the head down toward chest or crane it upward; neck stays straight in line with back.',
        focusArea: 'head',
      },
      {
        id: 'ruku-knees',
        label: 'Hands Clasp Knees with Fingers Spread',
        detail: 'Fingers firmly grip the kneecaps with fingers separated, arms straight acting like pillars.',
        focusArea: 'knees',
      },
      {
        id: 'ruku-legs',
        label: 'Legs Straight (Not Overlocked)',
        detail: 'Legs upright and vertical, knees firm without pushing backward into hyperextension.',
        focusArea: 'feet',
      },
    ],
    commonMistakes: [
      'Bending partially with an arched or hunched back.',
      'Letting hands slip down to the shins instead of gripping the knees.',
      'Popping straight back up before achieving still serenity (Tuma’ninah).',
    ],
    schoolNotes:
      'All major schools agree the back should be level. Women in the Hanafi school bow slightly less (around 45° to 60°) with fingers close together.',
  },
  {
    id: 'itidal',
    pose: 'itidal',
    title: 'I‘tidal — Standing Upright After Ruku‘',
    titleArabic: 'الإِعْتِدَالُ وَالقَوْمَةُ',
    transliteration: 'I‘tidāl / Qawmah',
    durationMs: 3000,
    instruction:
      'Rise smoothly from Ruku‘ to full vertical standing while saying "Sami‘allahu liman hamidah" (Allah hears whoever praises Him). Once completely upright and still, say "Rabbana wa lakal-hamd". Pause with tranquil stillness (Tuma’ninah).',
    recite: 'Sami‘allāhu liman ḥamidah — Rabbanā wa lakal-ḥamd',
    reciteArabic: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ — رَبَّنَا وَلَكَ الْحَمْدُ',
    reciteMeaning: 'Allah hears whoever praises Him — Our Lord, and to You belongs all praise.',
    visualChecks: [
      {
        id: 'itidal-spine',
        label: 'Full Vertical Extension',
        detail: 'Stand fully tall with every vertebra returning to its natural upright position.',
        focusArea: 'back',
      },
      {
        id: 'itidal-stillness',
        label: 'Mandatory Stillness (Tuma’ninah)',
        detail: 'Pause completely still for at least the time it takes to say "SubhanAllah" before descending.',
        focusArea: 'chest',
      },
      {
        id: 'itidal-arms',
        label: 'Arms Relaxed at Sides (or Folded)',
        detail: 'Arms hang naturally at the sides in most traditions (or folded on chest in some contemporary views).',
        focusArea: 'hands',
      },
      {
        id: 'itidal-gaze',
        label: 'Gaze Maintained on Floor',
        detail: 'Do not raise eyes to the sky — Prophet ﷺ warned against looking upward during prayer.',
        focusArea: 'eyes',
      },
    ],
    commonMistakes: [
      'Rushing into prostration before the spine has fully straightened.',
      'Swaying or stepping backwards when rising from Ruku‘.',
    ],
    schoolNotes:
      'Shafi‘i, Hanafi, and Maliki return hands to sides. Some Hanbali scholars fold hands on the chest again.',
  },
  {
    id: 'sujood-1',
    pose: 'sujood',
    title: 'Sujood 1 — First Prostration on 7 Points',
    titleArabic: 'السُّجُودُ الأَوَّلُ',
    transliteration: 'As-Sujūd al-Awwal',
    durationMs: 4000,
    instruction:
      'Say "Allahu Akbar" and prostrate on the ground upon seven body bones: forehead with nose, both palms, both knees, and the toes of both feet. Elevate your elbows off the ground. Say "Subhana Rabbiyal-A‘la" three times with deep humility.',
    recite: 'Subḥāna Rabbiyal-A‘lā (3x)',
    reciteArabic: 'سُبْحَانَ رَبِّيَ الأَعْلَىٰ',
    reciteMeaning: 'Glory be to my Lord, the Most High (recited 3 times).',
    visualChecks: [
      {
        id: 'sujood-7points',
        label: '7 Points Firmly on Ground',
        detail: '1: Forehead & Nose, 2-3: Both Palms, 4-5: Both Knees, 6-7: Toes of Both Feet.',
        focusArea: 'head',
      },
      {
        id: 'sujood-elbows',
        label: 'Elbows Raised Off the Floor',
        detail: 'Keep forearms elevated and away from the sides — never lay arms flat like a resting dog.',
        focusArea: 'elbows',
      },
      {
        id: 'sujood-palms',
        label: 'Palms Flat Beside Shoulders/Ears',
        detail: 'Palms flat on the prayer mat, fingers joined together pointing toward Qiblah.',
        focusArea: 'hands',
      },
      {
        id: 'sujood-toes',
        label: 'Toes Bent Forward Toward Qiblah',
        detail: 'Feet held upright on tips of toes, toes curled forward pointing toward the Qiblah.',
        focusArea: 'feet',
      },
    ],
    commonMistakes: [
      'Lifting feet or toes off the ground while in prostration (invalidates the posture if prolonged).',
      'Resting forearms on the floor (explicitly prohibited by the Prophet ﷺ).',
      'Only resting the forehead while leaving the nose in the air.',
    ],
    schoolNotes:
      'For men, abdomen kept away from thighs and arms away from sides. In classical Hanafi & Shafi‘i guidance for women, limbs are drawn modestly closer together.',
  },
  {
    id: 'jalsa',
    pose: 'jalsa',
    title: 'Jalsa — Sitting Between Two Prostrations',
    titleArabic: 'الجَلْسَةُ بَيْنَ السَّجْدَتَيْنِ',
    transliteration: 'Jalsah bayna as-Sajdatayn',
    durationMs: 3000,
    instruction:
      'Say "Allahu Akbar" and rise to an upright sitting posture. Sit calmly upon your left foot while your right foot remains upright with toes tucked toward Qiblah (Iftirash). Rest hands on thighs/knees. Supplicate: "Rabbighfir li, Rabbighfir li" (My Lord, forgive me).',
    recite: 'Rabbighfir lī, Rabbighfir lī',
    reciteArabic: 'رَبِّ اغْفِرْ لِي ، رَبِّ اغْفِرْ لِي',
    reciteMeaning: 'My Lord, forgive me; my Lord, forgive me.',
    visualChecks: [
      {
        id: 'jalsa-feet',
        label: 'Iftirash Foot Positioning',
        detail: 'Sit on the flattened left foot while keeping the right foot upright with toes facing Qiblah.',
        focusArea: 'feet',
      },
      {
        id: 'jalsa-spine',
        label: 'Back Straight & Upright',
        detail: 'Sit upright without hunching or leaning sideways on one hip.',
        focusArea: 'back',
      },
      {
        id: 'jalsa-hands',
        label: 'Hands on Thighs / Above Knees',
        detail: 'Rest palms flat upon the lower thighs or over the kneecaps with fingers pointing forward.',
        focusArea: 'hands',
      },
      {
        id: 'jalsa-pause',
        label: 'Tranquil Pause (Tuma’ninah)',
        detail: 'Ensure complete stillness and serenity before beginning the second prostration.',
        focusArea: 'chest',
      },
    ],
    commonMistakes: [
      'Bouncing straight back down like a bird pecking without pausing in upright stillness.',
      'Sitting carelessly cross-legged.',
    ],
    schoolNotes:
      'Iftirash is the standard sitting in all schools between sujood. Maliki practice sits comfortably with feet shifted slightly to the right side (Tawarruk).',
  },
  {
    id: 'sujood-2',
    pose: 'sujood',
    title: 'Sujood 2 — Second Prostration',
    titleArabic: 'السُّجُودُ الثَّانِي',
    transliteration: 'As-Sujūd ath-Thānī',
    durationMs: 4000,
    instruction:
      'Say "Allahu Akbar" and prostrate a second time in exactly the same manner — 7 points of contact, elbows elevated, toes forward. Recite "Subhana Rabbiyal-A‘la" three times. This completes one full Rak‘ah.',
    recite: 'Subḥāna Rabbiyal-A‘lā (3x)',
    reciteArabic: 'سُبْحَانَ رَبِّيَ الأَعْلَىٰ',
    reciteMeaning: 'Glory be to my Lord, the Most High (recited 3 times).',
    visualChecks: [
      {
        id: 'sujood2-7points',
        label: 'Verify 7 Ground Points',
        detail: 'Forehead + nose, both palms, both knees, and toes of both feet firmly grounded.',
        focusArea: 'head',
      },
      {
        id: 'sujood2-elbows',
        label: 'Elbows Lifted from Ground',
        detail: 'Arms angled up from the floor with chest and stomach clear of the floor.',
        focusArea: 'elbows',
      },
      {
        id: 'sujood2-feet',
        label: 'Toes Flexed Forward',
        detail: 'Both feet upright with toes pointing in the direction of the Qiblah.',
        focusArea: 'feet',
      },
    ],
    commonMistakes: [
      'Rushing the second Sujood faster than the first.',
      'Lifting heels or feet in the air.',
    ],
    schoolNotes: 'Same posture rules apply as in the first prostration.',
  },
  {
    id: 'tashahhud',
    pose: 'tashahhud',
    title: 'Tashahhud & Salawat — Sitting of Testimony',
    titleArabic: 'التَّشَهُّدُ وَالصَّلَوَاتُ الإِبْرَاهِيمِيَّةُ',
    transliteration: 'At-Tashahhud wa aṣ-Ṣalawāt',
    durationMs: 6000,
    instruction:
      'In the second rak‘ah (middle sitting) and final rak‘ah (final sitting), sit serenely and recite At-Tahiyyat. Raise your right index finger with focused reverence during the testimony of faith. In the final sitting, also recite Durood Ibrahim (Salawat upon the Prophet ﷺ) and a concluding du‘a.',
    recite: 'At-Tahiyyatu lillahi... Allahumma salli ‘ala Muhammad...',
    reciteArabic:
      'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ ، السَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ اللَّهِ الصَّالِحِينَ ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    reciteMeaning:
      'All greetings, prayers, and pure things are for Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no deity worthy of worship except Allah, and I bear witness that Muhammad is His servant and messenger.',
    visualChecks: [
      {
        id: 'tashahhud-sitting',
        label: 'Seated Composure (Iftirash or Tawarruk)',
        detail: 'Sit on the left foot (Iftirash) in middle sitting, or with left foot under right shin (Tawarruk) in final sitting.',
        focusArea: 'feet',
      },
      {
        id: 'tashahhud-finger',
        label: 'Right Index Finger Raised',
        detail: 'Clench the right little and ring fingers, form a circle with thumb & middle, and extend index finger pointing toward Qiblah.',
        focusArea: 'hands',
      },
      {
        id: 'tashahhud-gaze',
        label: 'Gaze Focused on Pointing Finger',
        detail: 'The Sunnah is to look gently toward your pointing index finger during Tashahhud.',
        focusArea: 'eyes',
      },
      {
        id: 'tashahhud-left-hand',
        label: 'Left Hand Flat on Left Knee',
        detail: 'Keep the left hand flat and relaxed on the left thigh/knee without moving.',
        focusArea: 'hands',
      },
    ],
    commonMistakes: [
      'Waving the index finger around wildly without intention.',
      'Leaning heavily on the left arm or hip.',
    ],
    schoolNotes:
      'Hanafi: raise finger on "La ilaha" and lower on "ill-Allah". Shafi‘i: raise on "ill-Allah" and keep it still. Hanbali: point whenever the name of Allah is mentioned. Maliki: gently move finger side to side throughout.',
  },
  {
    id: 'tasleem',
    pose: 'tasleem',
    title: 'Tasleem — Concluding the Prayer',
    titleArabic: 'التَّسْلِيمُ (خِتَامُ الصَّلَاةِ)',
    transliteration: 'At-Taslīm',
    durationMs: 3000,
    instruction:
      'Conclude your prayer by turning your face smoothly to the right until your cheek can be seen from behind, saying "As-salamu ‘alaykum wa rahmatullah". Then turn your face smoothly to the left, repeating "As-salamu ‘alaykum wa rahmatullah".',
    recite: 'As-salāmu ‘alaykum wa raḥmatullāh (Right, then Left)',
    reciteArabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ',
    reciteMeaning: 'Peace and mercy of Allah be upon you (to the right, then to the left).',
    visualChecks: [
      {
        id: 'tasleem-right',
        label: 'Full Turn to the Right',
        detail: 'Turn the head until your right cheek is visible to someone behind you; eyes glance over right shoulder.',
        focusArea: 'head',
      },
      {
        id: 'tasleem-left',
        label: 'Full Turn to the Left',
        detail: 'Turn the head until your left cheek is visible to someone behind you; eyes glance over left shoulder.',
        focusArea: 'head',
      },
      {
        id: 'tasleem-torso',
        label: 'Torso Stays Facing Qiblah',
        detail: 'Only turn your neck and head — your shoulders and chest should remain oriented forward toward Qiblah.',
        focusArea: 'chest',
      },
    ],
    commonMistakes: [
      'Turning the entire upper body or shoulders instead of just the neck.',
      'Nodding the head up and down like a bow instead of turning horizontally.',
    ],
    schoolNotes:
      'Turning to the right is the mandatory pillar in Shafi‘i and Hanbali; the second turn to the left is an emphasized Sunnah. Maliki performs one main salam to the right for an individual.',
  },
];

/** Backwards-compatible aliases */
export const RAKAH_STEPS: SalahStep[] = CORE_SALAH_STEPS.slice(0, 7);
export const TASHAHHUD_STEP: SalahStep = CORE_SALAH_STEPS[7];
export const FULL_SALAH_STEPS: SalahStep[] = CORE_SALAH_STEPS;

export const SALAH_DISCLAIMER =
  'This is an educational visual guide for learning the proper posture and visual alignment of Salah. Minor variations exist among the four Sunni schools of thought (Hanafi, Shafi‘i, Maliki, Hanbali) — consult a qualified teacher or your local imam for jurisprudence rulings.';

/** Pre-Prayer Wudu Steps for Visual Check */
export type WuduStep = {
  id: string;
  stepNumber: number;
  title: string;
  titleArabic: string;
  instruction: string;
  visualCheck: string;
  mistakeAvoid: string;
};

export const WUDU_STEPS: WuduStep[] = [
  {
    id: 'wudu-intention',
    stepNumber: 1,
    title: 'Intention (Niyyah) & Bismillah',
    titleArabic: 'النِّيَّةُ وَالتَّسْمِيَةُ',
    instruction: 'Form the intention in your heart to purify yourself for worship, then say "Bismillah".',
    visualCheck: 'Calm mental focus before turning on the tap, avoiding unnecessary water wastage.',
    mistakeAvoid: 'Pronouncing the intention loudly or obsessing repeatedly over it.',
  },
  {
    id: 'wudu-hands',
    stepNumber: 2,
    title: 'Washing Hands to Wrists (3x)',
    titleArabic: 'غَسْلُ الكَفَّيْنِ',
    instruction: 'Wash both hands thoroughly up to the wrists three times, interweaving fingers (Takhlil).',
    visualCheck: 'Water covers palms, backs of hands, and webbing between every finger.',
    mistakeAvoid: 'Skipping the wrists or between the fingers.',
  },
  {
    id: 'wudu-mouth',
    stepNumber: 3,
    title: 'Rinsing Mouth (Madmadah 3x)',
    titleArabic: 'المَضْمَضَةُ',
    instruction: 'Take water with your right hand into your mouth, swirl it around thoroughly, and spit it out three times.',
    visualCheck: 'Water reaches all parts of mouth and teeth.',
    mistakeAvoid: 'Swallowing the water or barely wetting the lips.',
  },
  {
    id: 'wudu-nose',
    stepNumber: 4,
    title: 'Sniffing Water into Nostrils (Istinshaq 3x)',
    titleArabic: 'الاِسْتِنْشَاقُ وَالاِسْتِنْثَارُ',
    instruction: 'Inhale a little water gently into the nostrils with right hand, then blow it out with the left hand three times.',
    visualCheck: 'Clean nostrils with water drawn in gently without inhaling too deeply.',
    mistakeAvoid: 'Sniffing too forcefully or using right hand to blow the nose.',
  },
  {
    id: 'wudu-face',
    stepNumber: 5,
    title: 'Washing Entire Face (3x)',
    titleArabic: 'غَسْلُ الوَجْهِ',
    instruction: 'Wash the entire face three times, from the hairline down to the chin, and from earlobe to earlobe.',
    visualCheck: 'Every part of the face receives water, including corners of eyes and through the beard.',
    mistakeAvoid: 'Splashing water so only the center cheeks get wet while forehead and jaw stay dry.',
  },
  {
    id: 'wudu-arms',
    stepNumber: 6,
    title: 'Washing Arms to Elbows (3x)',
    titleArabic: 'غَسْلُ اليَدَيْنِ إِلَى المِرْفَقَيْنِ',
    instruction: 'Wash the right arm including the elbow three times, then wash the left arm including the elbow three times.',
    visualCheck: 'Water flows completely past the elbow joint with the whole forearm covered.',
    mistakeAvoid: 'Stopping before the elbow or only wetting the forearm.',
  },
  {
    id: 'wudu-head-ears',
    stepNumber: 7,
    title: 'Wiping Head & Cleaning Ears (Masah 1x)',
    titleArabic: 'مَسْحُ الرَّأْسِ وَالأُذُنَيْنِ',
    instruction: 'Moisten hands and wipe from the front of the hair to the nape of the neck and back, then use index fingers to wipe inside ears and thumbs behind ears.',
    visualCheck: 'One smooth wiping motion covering the crown and ears with fresh moisture.',
    mistakeAvoid: 'Pouring buckets of water over the head (it is a gentle wipe, not a wash).',
  },
  {
    id: 'wudu-feet',
    stepNumber: 8,
    title: 'Washing Feet to Ankles (3x)',
    titleArabic: 'غَسْلُ الرِّجْلَيْنِ إِلَى الكَعْبَيْنِ',
    instruction: 'Wash the right foot including the ankle bone three times (cleaning between toes with little finger), then wash the left foot three times.',
    visualCheck: 'Entire foot, heels, ankles, and Achilles tendon fully submerged/washed.',
    mistakeAvoid: 'Leaving dry cracks on heels or skipping the ankle bones.',
  },
];

/** Daily 5 Prayers Overview */
export type PrayerInfo = {
  id: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  name: string;
  nameArabic: string;
  rakahs: number;
  sunnahBefore: number;
  sunnahAfter: number;
  recitationType: 'Loud (Jahr)' | 'Silent (Sirr)' | 'Mixed (First 2 Loud)';
  description: string;
  timeWindow: string;
};

export const DAILY_PRAYERS: PrayerInfo[] = [
  {
    id: 'fajr',
    name: 'Fajr (Dawn Prayer)',
    nameArabic: 'صَلَاةُ الفَجْرِ',
    rakahs: 2,
    sunnahBefore: 2,
    sunnahAfter: 0,
    recitationType: 'Loud (Jahr)',
    description: 'Two obligatory rak‘ahs prayed between true dawn and sunrise. Recitation in both rak‘ahs is vocal.',
    timeWindow: 'From dawn until sunrise',
  },
  {
    id: 'dhuhr',
    name: 'Dhuhr (Noon Prayer)',
    nameArabic: 'صَلَاةُ الظُّهْرِ',
    rakahs: 4,
    sunnahBefore: 4,
    sunnahAfter: 2,
    recitationType: 'Silent (Sirr)',
    description: 'Four obligatory rak‘ahs prayed after the sun passes its zenith. Recitation is silent. Middle Tashahhud after Rak‘ah 2.',
    timeWindow: 'After midday until shadow equals object length',
  },
  {
    id: 'asr',
    name: '‘Asr (Afternoon Prayer)',
    nameArabic: 'صَلَاةُ العَصْرِ',
    rakahs: 4,
    sunnahBefore: 0,
    sunnahAfter: 0,
    recitationType: 'Silent (Sirr)',
    description: 'Four obligatory rak‘ahs prayed in late afternoon. Recitation is silent throughout.',
    timeWindow: 'Mid-afternoon until the sun begins to set / yellow',
  },
  {
    id: 'maghrib',
    name: 'Maghrib (Sunset Prayer)',
    nameArabic: 'صَلَاةُ المَغْرِبِ',
    rakahs: 3,
    sunnahBefore: 0,
    sunnahAfter: 2,
    recitationType: 'Mixed (First 2 Loud)',
    description: 'Three obligatory rak‘ahs prayed immediately following sunset. Rak‘ahs 1 & 2 are recited aloud; Rak‘ah 3 is silent.',
    timeWindow: 'From sunset until twilight disappears',
  },
  {
    id: 'isha',
    name: '‘Isha (Night Prayer)',
    nameArabic: 'صَلَاةُ العِشَاءِ',
    rakahs: 4,
    sunnahBefore: 0,
    sunnahAfter: 2,
    recitationType: 'Mixed (First 2 Loud)',
    description: 'Four obligatory rak‘ahs prayed after nightfall. Rak‘ahs 1 & 2 are recited aloud; Rak‘ahs 3 & 4 are silent. Followed by Witr.',
    timeWindow: 'From disappearance of evening twilight until Islamic midnight',
  },
];
