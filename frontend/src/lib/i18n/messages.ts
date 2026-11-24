import type { UiLocale } from '@/stores/settingsStore';

/** Common chrome / navigation strings. Every locale defines all keys. */
export type MessageKey =
  | 'signIn'
  | 'createAccount'
  | 'logOut'
  | 'language'
  | 'selectLanguage'
  | 'search'
  | 'openMenu'
  | 'close'
  | 'read'
  | 'learn'
  | 'myQuran'
  | 'bookmarks'
  | 'quranInYear'
  | 'settings'
  | 'feedback'
  | 'hifz'
  | 'tajweed'
  | 'profile'
  | 'profileAndSettings'
  | 'account'
  | 'accountMenu'
  | 'mainNavigation'
  | 'continueReading'
  | 'ayah'
  | 'chooseProfile'
  | 'startJourney'
  | 'startAdventure'
  | 'selectAgeStyle'
  | 'theme'
  | 'light'
  | 'dark'
  | 'system'
  | 'signInComingSoon'
  | 'signInComingSoonBody'
  | 'email'
  | 'notifyMe'
  | 'onTheList'
  | 'continueReadingCta'
  | 'differentEmail'
  | 'keepUsing'
  | 'heroTitle'
  | 'heroTitleAccent'
  | 'readQuranNow'
  | 'listenRadio'
  | 'pauseRadio'
  | 'heroBody'
  | 'searchPlaceholder'
  | 'searchButton'
  | 'popular'
  | 'livePlayer'
  | 'nowReciting'
  | 'readyToRecite'
  | 'applyingLanguage'
  | 'verse'
  | 'achieveQuranGoals'
  | 'achieveQuranGoalsBody'
  | 'buildQuranExperience'
  | 'buildQuranExperienceBody'
  | 'todaysMotivation'
  | 'motivationDisclaimer'
  | 'startReading'
  | 'exploreQuran'
  | 'todaysGoal'
  | 'todaysGoalDone'
  | 'suggestedToday'
  | 'continueJourneyMsg'
  | 'oneFocusedRuleMsg'
  | 'startWithAlBaqarah'
  | 'readNAyahs'
  | 'unitMin'
  | 'unitAyahs'
  | 'goalCompleteBody'
  | 'optionalDailyGoalHint'
  | 'chooseDailyGoal'
  | 'continueTajweed'
  | 'ayahOfTheDay'
  | 'readInQuran'
  | 'todaysTajweed'
  | 'listenTajweedHint'
  | 'learnNamed'
  | 'askAi'
  | 'askAiShort'
  | 'home'
  | 'chapters'
  | 'learningPlans'
  | 'navSurahs'
  | 'navArticles'
  | 'heroSearchPlaceholder'
  | 'resume'
  | 'lastReadAgo'
  | 'popularSurahs'
  | 'all114Surahs'
  | 'dailyRhythm'
  | 'todayHeading'
  | 'audioRecitation'
  | 'recitersHeading'
  | 'guidesAndReflections'
  | 'sitemap'
  | 'resources'
  | 'donate'
  | 'footerTagline'
  | 'footerRights'
  | 'reflectOnQuran'
  | 'exploreVerses'
  | 'reflectionBaqarah'
  | 'reflectionSharh'
  | 'reflectionFatihah'
  | 'communityRoadmap'
  | 'appsWhereverTitle'
  | 'appsWhereverBody'
  | 'mobileAppComingSoon'
  | 'appsFeatureSearch'
  | 'appsFeatureRecitation'
  | 'appsFeatureBookmarks'
  | 'homeBrowseChapters'
  | 'homeBrowseChaptersSub'
  | 'tabSurah'
  | 'tabJuz'
  | 'tabOrder'
  | 'searchSurahPlaceholder'
  | 'juzN'
  | 'nVerses'
  | 'hearQuranTitle'
  | 'hearQuranAccent'
  | 'viewMoreChapters'
  | 'openReader'
  | 'continueFullReader'
  | 'loadVersesError'
  | 'recitersTitle'
  | 'recitersAccent'
  | 'reciterDescAlafasy'
  | 'reciterDescSudais'
  | 'reciterDescBasit'
  | 'reciterDescHaramImam'
  | 'reciterDescOusi'
  | 'learnBasicsTitle'
  | 'learnBasicsAccent'
  | 'learnBasicsBody'
  | 'newToday'
  | 'readMoreArticles'
  | 'structuredStudy'
  | 'featuredPlans'
  | 'featuredPlansBody'
  | 'viewAllPlans'
  | 'nDays'
  | 'readSurahName'
  | 'exploreAllPlans'
  | 'calendar'
  | 'week'
  | 'quranInYearBody'
  | 'thisWeeksReadings'
  | 'verseN'
  | 'learnMore'
  | 'actStudy'
  | 'actBookmark'
  | 'actBookmarked'
  | 'actSave'
  | 'actNote'
  | 'actCopy'
  | 'actCopied'
  | 'actShare'
  | 'actDisplay'
  | 'actMore'

export type Messages = Record<MessageKey, string>;

const en: Messages = {
  actStudy: 'Study',
  actBookmark: 'Bookmark',
  actBookmarked: 'Bookmarked',
  actSave: 'Save',
  actNote: 'Note',
  actCopy: 'Copy',
  actCopied: 'Copied',
  actShare: 'Share',
  actDisplay: 'Display',
  actMore: 'More',
  signIn: 'Sign in',
  createAccount: 'Create account',
  logOut: 'Log out',
  language: 'Language',
  selectLanguage: 'Select Language',
  search: 'Search',
  openMenu: 'Open menu',
  close: 'Close',
  read: 'Read',
  learn: 'Learn',
  myQuran: 'My Quran',
  bookmarks: 'Bookmarks',
  quranInYear: 'Quran in a Year',
  settings: 'Settings',
  feedback: 'Feedback',
  hifz: 'Hifz',
  tajweed: 'Tajweed',
  navSurahs: 'Surahs',
  navArticles: 'Articles',
  heroSearchPlaceholder: 'Search a surah, verse (2:255) or topic',
  resume: 'Resume',
  lastReadAgo: 'Last read {time}',
  popularSurahs: 'Popular surahs',
  all114Surahs: 'All 114 surahs',
  dailyRhythm: 'Daily rhythm',
  todayHeading: 'Today',
  audioRecitation: 'Audio recitation',
  recitersHeading: 'Reciters',
  guidesAndReflections: 'Guides & reflections',
  profile: 'Profile',
  profileAndSettings: 'Profile & settings',
  account: 'Account',
  accountMenu: 'Account menu',
  mainNavigation: 'Main navigation',
  continueReading: 'Continue Reading',
  ayah: 'Ayah',
  chooseProfile: 'Choose Profile Style',
  startJourney: '✦ Start Your Quran Journey',
  startAdventure: '✦ Start Your Quran Adventure! 🚀',
  selectAgeStyle: 'Select Age/Look Style',
  theme: 'Theme',
  light: 'Light',
  dark: 'Dark',
  system: 'System',
  signInComingSoon: 'Sign in coming soon',
  signInComingSoonBody: 'Accounts are on the way. Leave your email and we\'ll notify you when you can sync bookmarks, goals, and reading history across devices.',
  email: 'Email',
  notifyMe: 'Notify me at launch',
  onTheList: 'You\'re on the list',
  continueReadingCta: 'Continue reading',
  differentEmail: 'Use a different email',
  keepUsing: 'You can keep using QuranPilot without an account. Preferences stay on this device for now.',
  heroTitle: 'Read the Quran online',
  heroTitleAccent: 'with translation & audio',
  readQuranNow: 'Read The Holy Quran Now',
  listenRadio: 'Listen Radio: Quran Radio',
  pauseRadio: 'Pause Quran Radio',
  heroBody: 'Read, listen, understand, memorize and improve your recitation—all in one peaceful experience.',
  searchPlaceholder: 'Search Surah, Ayah, topic or keyword...',
  searchButton: 'Search',
  popular: 'Popular:',
  livePlayer: 'Live Player',
  nowReciting: 'Now Reciting',
  readyToRecite: 'Ready to Recite',
  applyingLanguage: 'Applying…',
  verse: 'Verse',
  achieveQuranGoals: 'Achieve Your Quran Goals',
  achieveQuranGoalsBody: 'Track Streaks, Create Custom Goals, Stay Consistent.',
  buildQuranExperience: 'Build Your Quran Experience',
  buildQuranExperienceBody: 'Fonts, translations, reciters, and reading preferences.',
  todaysMotivation: 'Today\'s Motivation',
  motivationDisclaimer: 'Educational encouragement — not a Quran or Hadith quotation.',
  startReading: 'Start Reading',
  exploreQuran: 'Explore Quran',
  todaysGoal: 'Today\'s Goal',
  todaysGoalDone: 'Today\'s Goal ✓',
  suggestedToday: 'Suggested today',
  continueJourneyMsg: 'Continue your Quran journey from where you left off.',
  oneFocusedRuleMsg: 'One focused rule is enough for today.',
  startWithAlBaqarah: 'Start with Al-Baqarah',
  readNAyahs: 'Read {n} Ayahs',
  unitMin: ' min',
  unitAyahs: ' Ayahs',
  goalCompleteBody: 'Today\'s goal is complete. Continue reading if you\'d like.',
  optionalDailyGoalHint: 'Optional — pick a daily goal below to save it to your account.',
  chooseDailyGoal: 'Choose a daily goal (optional)',
  continueTajweed: 'Continue Tajweed',
  ayahOfTheDay: 'Ayah of the Day',
  readInQuran: 'Read in Quran',
  todaysTajweed: 'Today\'s Tajweed',
  listenTajweedHint: 'Listen to a few verified examples and focus on recognizing the sound.',
  learnNamed: 'Learn {name}',
  askAi: 'Ask AI',
  askAiShort: 'AI',
  home: 'Home',
  chapters: 'Chapters',
  learningPlans: 'Learning Plans',
  sitemap: 'Sitemap',
  resources: 'Resources',
  donate: 'Donate',
  footerTagline: 'QuranPilot is a modern, high-fidelity web application designed to help you read, listen, study, and reflect on the Holy Quran with translations and guidance.',
  footerRights: 'Built for guidance and wisdom. All rights reserved.',
  reflectOnQuran: 'Reflect on the Quran',
  exploreVerses: 'Explore verses',
  reflectionBaqarah: 'A reminder that Allah does not burden a soul beyond what it can bear — every trial comes with the capacity to endure it.',
  reflectionSharh: '"With hardship comes ease" is repeated twice — a call to hold onto hope even in the middle of difficulty.',
  reflectionFatihah: 'Every rakah begins with this verse: worship and reliance belong to Allah alone, a daily reset of intention.',
  communityRoadmap: 'Reflections and community sharing are on our roadmap — for now, explore the Quran and start your own notes from any verse.',
  appsWhereverTitle: 'QuranPilot, wherever you read',
  appsWhereverBody: 'QuranPilot runs entirely in your browser — no install required. A dedicated mobile app is on our roadmap.',
  mobileAppComingSoon: 'Mobile app coming soon',
  appsFeatureSearch: 'Instant search across Arabic and translations',
  appsFeatureRecitation: 'Verse-by-verse recitation with reciter switching',
  appsFeatureBookmarks: 'Bookmarks and reading progress synced to your browser',
  homeBrowseChapters: 'Browse chapters',
  homeBrowseChaptersSub: 'Choose a Surah, Juz, or revelation order.',
  tabSurah: 'Surah',
  tabJuz: 'Juz',
  tabOrder: 'Order',
  searchSurahPlaceholder: 'Search surah name or number...',
  juzN: 'Juz {n}',
  nVerses: '{n} verses',
  hearQuranTitle: 'Hear the Quran',
  hearQuranAccent: 'accompanied by translations.',
  viewMoreChapters: 'View More Chapters',
  openReader: 'Open reader',
  continueFullReader: 'Continue in full reader →',
  loadVersesError: 'Could not load verses for this chapter.',
  recitersTitle: 'Enjoy Holy Quran recited',
  recitersAccent: 'by your preferred reciters.',
  reciterDescAlafasy: 'Renowned Kuwaiti Reciter',
  reciterDescSudais: 'Chief Imam of Grand Mosque',
  reciterDescBasit: 'Golden Voice from Egypt',
  reciterDescHaramImam: 'Imam of Masjid al-Haram',
  reciterDescOusi: 'Imam and Reciter',
  learnBasicsTitle: 'Learn Quran and Islam',
  learnBasicsAccent: 'basics everyday.',
  learnBasicsBody: 'New featured reads rotate daily from our growing library of Islam & Quran guides.',
  newToday: 'New today',
  readMoreArticles: 'Read More Articles',
  structuredStudy: 'Structured study',
  featuredPlans: 'Featured Learning Plans',
  featuredPlansBody: 'Daily guided lessons for Al-Fatihah, Ya-Sin, Al-Kahf, Al-Mulk, Ar-Rahman, and more — each plan links back to the full surah reader.',
  viewAllPlans: 'View all plans',
  nDays: '{n} days',
  readSurahName: 'Read Surah {name}',
  exploreAllPlans: 'Explore all learning plans',
  calendar: 'Calendar',
  week: 'Week',
  quranInYearBody: 'A thoughtfully designed schedule that makes it easy for you to read and understand the entire Quran from one Ramadan to the next, at a steady and manageable pace.',
  thisWeeksReadings: 'This Week\'s Readings',
  verseN: 'Verse {n}',
  learnMore: 'Learn More',
};




const fa: Messages = {
  actStudy: 'مطالعه',
  actBookmark: 'نشان‌گذاری',
  actBookmarked: 'نشان‌شده',
  actSave: 'ذخیره',
  actNote: 'یادداشت',
  actCopy: 'کپی',
  actCopied: 'کپی شد',
  actShare: 'اشتراک‌گذاری',
  actDisplay: 'نمایش',
  actMore: 'بیشتر',
  signIn: 'ورود',
  createAccount: 'ایجاد حساب',
  logOut: 'خروج',
  language: 'زبان',
  selectLanguage: 'انتخاب زبان',
  search: 'جستجو',
  openMenu: 'باز کردن منو',
  close: 'بستن',
  read: 'بخوانید',
  learn: 'بیاموزید',
  myQuran: 'قرآن من',
  bookmarks: 'نشان‌ها',
  quranInYear: 'قرآن در یک سال',
  settings: 'تنظیمات',
  feedback: 'بازخورد',
  hifz: 'حفظ',
  tajweed: 'تجوید',
  navSurahs: 'سوره‌ها',
  navArticles: 'مقالات',
  heroSearchPlaceholder: 'جستجوی سوره، آیه (2:255) یا موضوع',
  resume: 'ادامه',
  lastReadAgo: 'آخرین مطالعه {time}',
  popularSurahs: 'سوره‌های برگزیده',
  all114Surahs: 'همه ۱۱۴ سوره',
  dailyRhythm: 'نظم روزانه',
  todayHeading: 'امروز',
  audioRecitation: 'تلاوت صوتی',
  recitersHeading: 'قاریان',
  guidesAndReflections: 'راهنماها و تأملات',
  profile: 'پروفایل',
  profileAndSettings: 'پروفایل و تنظیمات',
  account: 'حساب',
  accountMenu: 'منوی حساب',
  mainNavigation: 'ناوبری اصلی',
  continueReading: 'ادامه مطالعه',
  ayah: 'آیه',
  chooseProfile: 'انتخاب سبک پروفایل',
  startJourney: '✦ سفر قرآنی خود را آغاز کنید',
  startAdventure: '✦ ماجراجویی قرآنی! 🚀',
  selectAgeStyle: 'انتخاب سبک سن/ظاهر',
  theme: 'پوسته',
  light: 'روشن',
  dark: 'تیره',
  system: 'سیستم',
  signInComingSoon: 'ورود به‌زودی',
  signInComingSoonBody: 'حساب‌ها به‌زودی اضافه می‌شوند. ایمیل بگذارید تا هنگام همگام‌سازی نشان‌ها و پیشرفت مطلع شوید.',
  email: 'ایمیل',
  notifyMe: 'هنگام راه‌اندازی خبرم کنید',
  onTheList: 'شما در فهرست هستید',
  continueReadingCta: 'ادامه مطالعه',
  differentEmail: 'ایمیل دیگری استفاده کنید',
  keepUsing: 'بدون حساب هم می‌توانید از QuranPilot استفاده کنید. تنظیمات فعلاً روی همین دستگاه می‌ماند.',
  heroTitle: 'قرآن را کشف کنید، و',
  heroTitleAccent: 'اصول اسلام را بیاموزید.',
  readQuranNow: 'همین حالا قرآن بخوانید',
  listenRadio: 'رادیو قرآن',
  pauseRadio: 'توقف رادیو قرآن',
  heroBody: 'ترجمه‌ها، قاریان و تلاوت صوتی را کاوش کنید.',
  searchPlaceholder: 'نام سوره، صفحه یا آیه...',
  searchButton: 'جستجو',
  popular: 'محبوب:',
  livePlayer: 'پخش زنده',
  nowReciting: 'در حال تلاوت',
  readyToRecite: 'آماده تلاوت',
  applyingLanguage: 'در حال اعمال…',
  verse: 'آیه',
  achieveQuranGoals: 'اهداف قرآنی خود را محقق کنید',
  achieveQuranGoalsBody: 'روند را پیگیری کنید، اهداف بسازید، پایدار بمانید.',
  buildQuranExperience: 'تجربه قرآنی خود را بسازید',
  buildQuranExperienceBody: 'فونت‌ها، ترجمه‌ها، قاریان و تنظیمات مطالعه.',
  todaysMotivation: 'انگیزه امروز',
  motivationDisclaimer: 'تشویق آموزشی — نقل‌قول قرآن یا حدیث نیست.',
  startReading: 'شروع مطالعه',
  exploreQuran: 'کاوش قرآن',
  todaysGoal: 'هدف امروز',
  todaysGoalDone: 'هدف امروز ✓',
  suggestedToday: 'پیشنهاد امروز',
  continueJourneyMsg: 'سفر قرآنی را از جایی که رها کردید ادامه دهید.',
  oneFocusedRuleMsg: 'یک قاعدهٔ تجوید متمرکز برای امروز کافی است.',
  startWithAlBaqarah: 'با بقره شروع کنید',
  readNAyahs: '{n} آیه بخوانید',
  unitMin: ' د',
  unitAyahs: ' آیه',
  goalCompleteBody: 'هدف امروز کامل شد. اگر خواستید مطالعه را ادامه دهید.',
  optionalDailyGoalHint: 'اختیاری — هدف روزانه را پایین انتخاب کنید تا در حساب ذخیره شود.',
  chooseDailyGoal: 'هدف روزانه را انتخاب کنید (اختیاری)',
  continueTajweed: 'ادامه تجوید',
  ayahOfTheDay: 'آیه امروز',
  readInQuran: 'در قرآن بخوانید',
  todaysTajweed: 'تجوید امروز',
  listenTajweedHint: 'چند مثال معتبر بشنوید و روی تشخیص صدا تمرکز کنید.',
  learnNamed: 'یادگیری {name}',
  askAi: 'پرسش از هوش مصنوعی',
  askAiShort: 'AI',
  home: 'خانه',
  chapters: 'سوره‌ها',
  learningPlans: 'برنامه‌های یادگیری',
  sitemap: 'نقشه سایت',
  resources: 'منابع',
  donate: 'کمک مالی',
  footerTagline: 'QuranPilot برنامه‌ای مدرن برای خواندن، شنیدن، مطالعه و تأمل در قرآن با ترجمه و راهنمایی است.',
  footerRights: 'ساخته‌شده برای هدایت و حکمت. همه حقوق محفوظ است.',
  reflectOnQuran: 'در قرآن تأمل کنید',
  exploreVerses: 'آیات را کاوش کنید',
  reflectionBaqarah: 'یادآوری که خدا هیچ نفسی را جز به اندازه توانش تکلیف نمی‌کند — با هر آزمایش توان صبر هم هست.',
  reflectionSharh: '«با سختی آسانی است» دو بار آمده — دعوت به امید حتی در میان سختی.',
  reflectionFatihah: 'هر رکعت با این آیه آغاز می‌شود: عبادت و توکل فقط برای خدا — تازه کردن نیت هر روز.',
  communityRoadmap: 'تأملات و اشتراک اجتماعی در نقشه راه است — فعلاً قرآن را بکاویید و از هر آیه یادداشت بردارید.',
  appsWhereverTitle: 'QuranPilot، هرجا که می‌خوانید',
  appsWhereverBody: 'QuranPilot کاملاً در مرورگر اجرا می‌شود — بدون نصب. اپ موبایل در نقشه راه است.',
  mobileAppComingSoon: 'اپ موبایل به‌زودی',
  appsFeatureSearch: 'جستجوی فوری عربی و ترجمه‌ها',
  appsFeatureRecitation: 'تلاوت آیه به آیه با تغییر قاری',
  appsFeatureBookmarks: 'نشان‌ها و پیشرفت در مرورگر شما',
  homeBrowseChapters: 'مرور سوره‌ها',
  homeBrowseChaptersSub: 'یک سوره، جزء یا ترتیب نزول را انتخاب کنید.',
  tabSurah: 'سوره',
  tabJuz: 'جزء',
  tabOrder: 'ترتیب',
  searchSurahPlaceholder: 'جستجوی نام یا شماره سوره...',
  juzN: 'جزء {n}',
  nVerses: '{n} آیه',
  hearQuranTitle: 'قرآن را بشنوید',
  hearQuranAccent: 'همراه با ترجمه‌ها.',
  viewMoreChapters: 'مشاهده سوره‌های بیشتر',
  openReader: 'باز کردن قاری',
  continueFullReader: 'ادامه در قاری کامل ←',
  loadVersesError: 'بارگیری آیات این سوره ممکن نشد.',
  recitersTitle: 'از تلاوت قرآن کریم لذت ببرید',
  recitersAccent: 'با صدای قاریان دلخواهتان.',
  reciterDescAlafasy: 'قاری مشهور کویتی',
  reciterDescSudais: 'امام ارشد مسجدالحرام',
  reciterDescBasit: 'صدای طلایی از مصر',
  reciterDescHaramImam: 'امام مسجدالحرام',
  reciterDescOusi: 'امام و قاری',
  learnBasicsTitle: 'مبانی قرآن و اسلام را',
  learnBasicsAccent: 'هر روز بیاموزید.',
  learnBasicsBody: 'مطالب برگزیده تازه هر روز از کتابخانه رو به رشد راهنماهای اسلام و قرآن ما تغییر می‌کنند.',
  newToday: 'تازه امروز',
  readMoreArticles: 'مقالات بیشتر',
  structuredStudy: 'مطالعه ساختارمند',
  featuredPlans: 'برنامه‌های آموزشی برگزیده',
  featuredPlansBody: 'درس‌های روزانه هدایت‌شده برای الفاتحه، یس، الکهف، الملک، الرحمن و دیگر سوره‌ها — هر برنامه به قاری کامل سوره پیوند دارد.',
  viewAllPlans: 'مشاهده همه برنامه‌ها',
  nDays: '{n} روز',
  readSurahName: 'خواندن سوره {name}',
  exploreAllPlans: 'کاوش همه برنامه‌های آموزشی',
  calendar: 'تقویم',
  week: 'هفته',
  quranInYearBody: 'برنامه‌ای سنجیده که خواندن و فهم کل قرآن را از یک رمضان تا رمضان بعد با سرعتی پیوسته و قابل‌مدیریت برایتان آسان می‌کند.',
  thisWeeksReadings: 'خواندنی‌های این هفته',
  verseN: 'آیه {n}',
  learnMore: 'بیشتر بدانید',
};







const ps: Messages = {
  actStudy: 'مطالعه',
  actBookmark: 'نښه',
  actBookmarked: 'نښه شوی',
  actSave: 'خوندي کړئ',
  actNote: 'یادښت',
  actCopy: 'کاپي',
  actCopied: 'کاپي شو',
  actShare: 'ونډه کول',
  actDisplay: 'ښودنه',
  actMore: 'نور',
  signIn: 'ننوتل',
  createAccount: 'حساب جوړول',
  logOut: 'وتل',
  language: 'ژبه',
  selectLanguage: 'ژبه وټاکئ',
  search: 'لټون',
  openMenu: 'مینو پرانستل',
  close: 'بندول',
  read: 'ولولئ',
  learn: 'زده کړئ',
  myQuran: 'زما قرآن',
  bookmarks: 'نښې',
  quranInYear: 'په یوه کال کې قرآن',
  settings: 'تنظیمات',
  feedback: 'نظر',
  hifz: 'حفظ',
  tajweed: 'تجوید',
  navSurahs: 'سورتونه',
  navArticles: 'مقالې',
  heroSearchPlaceholder: 'سورت، آیت (2:255) یا موضوع ولټوئ',
  resume: 'دوام ورکړئ',
  lastReadAgo: 'وروستی لوستل {time}',
  popularSurahs: 'مشهور سورتونه',
  all114Surahs: 'ټول ۱۱۴ سورتونه',
  dailyRhythm: 'ورځنی عادت',
  todayHeading: 'نن',
  audioRecitation: 'غږیز تلاوت',
  recitersHeading: 'قاریان',
  guidesAndReflections: 'لارښوونې او تدبر',
  profile: 'پروفایل',
  profileAndSettings: 'پروفایل او تنظیمات',
  account: 'حساب',
  accountMenu: 'د حساب مینو',
  mainNavigation: 'اصلي نیویګیشن',
  continueReading: 'لوستل دوام ورکړئ',
  ayah: 'آیت',
  chooseProfile: 'د پروفایل سټایل وټاکئ',
  startJourney: '✦ د قرآن سفر پیل کړئ',
  startAdventure: '✦ د قرآن ماجرا پیل کړئ! 🚀',
  selectAgeStyle: 'عمر/بڼه وټاکئ',
  theme: 'تېم',
  light: 'رڼا',
  dark: 'تیاره',
  system: 'سیستم',
  signInComingSoon: 'ننوتل ډېر ژر',
  signInComingSoonBody: 'حسابونه ډېر ژر راځي. خپل برېښنالیک پرېږدئ ترڅو د نښو او پرمختګ همغږۍ پر مهال خبر شئ.',
  email: 'برېښنالیک',
  notifyMe: 'په پیل کې خبر کړئ',
  onTheList: 'تاسو په لیست کې یاست',
  continueReadingCta: 'لوستل دوام',
  differentEmail: 'بل برېښنالیک وکاروئ',
  keepUsing: 'پرته له حسابه هم QuranPilot کارولی شئ. غوره توبونه اوس په دې وسیله کې پاتې کېږي.',
  heroTitle: 'قرآن ومومئ، او',
  heroTitleAccent: 'د اسلام بنسټونه زده کړئ.',
  readQuranNow: 'اوس سپېڅلی قرآن ولولئ',
  listenRadio: 'د قرآن راډیو واورئ',
  pauseRadio: 'راډیو ودروئ',
  heroBody: 'ژباړې، قاري او غږیزه تلاوت وپلټئ.',
  searchPlaceholder: 'سورة، پاڼه یا آیت...',
  searchButton: 'لټون',
  popular: 'ډېر لوستل شوي:',
  livePlayer: 'ژوندی پلیئر',
  nowReciting: 'اوس تلاوت',
  readyToRecite: 'تلاوت ته چمتو',
  applyingLanguage: 'پلي کېږي…',
  verse: 'آیت',
  achieveQuranGoals: 'خپل قرآني اهداف ترلاسه کړئ',
  achieveQuranGoalsBody: 'دوام تعقیب کړئ، اهداف جوړ کړئ، ثابت پاتې شئ.',
  buildQuranExperience: 'خپل قرآني تجربه جوړه کړئ',
  buildQuranExperienceBody: 'فونټونه، ژباړې، قاري او د لوستلو غوره توبونه.',
  todaysMotivation: 'د نن ورځې انګېزه',
  motivationDisclaimer: 'زدکړیز هڅونه — د قرآن یا حدیث نقل نه دی.',
  startReading: 'لوستل پیل کړئ',
  exploreQuran: 'قرآن وپلټئ',
  todaysGoal: 'د نن هدف',
  todaysGoalDone: 'د نن هدف ✓',
  suggestedToday: 'نن وړاندیز شوی',
  continueJourneyMsg: 'خپل قرآني سفر له هماغه ځایه دوام ورکړئ چیرې چې پرېښود.',
  oneFocusedRuleMsg: 'نن یو متمرکز تجوید قاعده کافي ده.',
  startWithAlBaqarah: 'له البقرې پیل کړئ',
  readNAyahs: '{n} آیات ولولئ',
  unitMin: ' دقیقتي',
  unitAyahs: ' آیات',
  goalCompleteBody: 'د نن هدف بشپړ شو. که وغواړئ لوستل دوام ورکړئ.',
  optionalDailyGoalHint: 'اختیاري — لاندې ورځنی هدف وټاکئ ترڅو په حساب کې خوندي شي.',
  chooseDailyGoal: 'ورځنی هدف وټاکئ (اختیاري)',
  continueTajweed: 'تجوید دوام',
  ayahOfTheDay: 'د نن آیت',
  readInQuran: 'په قرآن کې ولولئ',
  todaysTajweed: 'د نن تجوید',
  listenTajweedHint: 'څو تایید شوي مثالونه واورئ او غږ وپیژنئ.',
  learnNamed: '{name} زده کړئ',
  askAi: 'له AI وپوښتئ',
  askAiShort: 'AI',
  home: 'کور',
  chapters: 'سورې',
  learningPlans: 'د زده کړې پلانونه',
  sitemap: 'د سایټ نقشه',
  resources: 'سرچینې',
  donate: 'مرسته',
  footerTagline: 'QuranPilot یو عصري ویب اپ دی چې د ژباړو او لارښوونې سره قرآن لوستلو، اورېدلو، مطالعې او تفکر کې مرسته کوي.',
  footerRights: 'د هدایت او حکمت لپاره جوړ شوی. ټول حقوق خوندي دي.',
  reflectOnQuran: 'په قرآن فکر وکړئ',
  exploreVerses: 'آیات وپلټئ',
  reflectionBaqarah: 'یادونه چې الله پر نفس هغه بار نه اچوي چې نه شي زغملی — هره ازموینه د صبر وړتیا هم لري.',
  reflectionSharh: '«له سختۍ سره اساني ده» دوه ځله راغلی — په سختۍ کې هم هیله ساتل.',
  reflectionFatihah: 'هر رکعت له دې آیت سره پیلېږي: عبادت او توکل یوازې د الله دي — د نیت ورځنی تازه کول.',
  communityRoadmap: 'تفکر او ټولنیز شریکول زموږ په نقشه کې دي — اوس قرآن وپلټئ او له هر آیت څخه یادښت پیل کړئ.',
  appsWhereverTitle: 'QuranPilot، چیرته چې ولولئ',
  appsWhereverBody: 'QuranPilot په بشپړ ډول په براوزر کې چلیږي — نصب ته اړتیا نشته. موبایل اپ په نقشه کې دی.',
  mobileAppComingSoon: 'موبایل اپ ډېر ژر',
  appsFeatureSearch: 'په عربي او ژباړو کې فوري لټون',
  appsFeatureRecitation: 'آیت په آیت تلاوت او د قاري بدلول',
  appsFeatureBookmarks: 'نښې او پرمختګ په براوزر کې ساتل کیږي',
  homeBrowseChapters: 'سورتونه وګورئ',
  homeBrowseChaptersSub: 'سورت، پاره یا د نزول ترتیب وټاکئ.',
  tabSurah: 'سورت',
  tabJuz: 'پاره',
  tabOrder: 'ترتیب',
  searchSurahPlaceholder: 'د سورت نوم یا شمېره ولټوئ...',
  juzN: 'پاره {n}',
  nVerses: '{n} آیتونه',
  hearQuranTitle: 'قرآن واورئ',
  hearQuranAccent: 'د ژباړو سره.',
  viewMoreChapters: 'نور سورتونه وګورئ',
  openReader: 'لوستونکی پرانیزئ',
  continueFullReader: 'په بشپړ لوستونکي کې دوام ورکړئ ←',
  loadVersesError: 'د دې سورت آیتونه پورته نه شول.',
  recitersTitle: 'د قرآن کریم تلاوت واورئ',
  recitersAccent: 'ستاسو د خوښې قاریانو په غږ.',
  reciterDescAlafasy: 'نامتو کویتي قاري',
  reciterDescSudais: 'د مسجد الحرام مشر امام',
  reciterDescBasit: 'له مصر څخه طلايي غږ',
  reciterDescHaramImam: 'د مسجد الحرام امام',
  reciterDescOusi: 'امام او قاري',
  learnBasicsTitle: 'د قرآن او اسلام بنسټونه',
  learnBasicsAccent: 'هره ورځ زده کړئ.',
  learnBasicsBody: 'زموږ د اسلام او قرآن لارښودونو له مخ پر ودې کتابتون څخه نوې ځانګړې لیکنې هره ورځ بدلېږي.',
  newToday: 'نن نوی',
  readMoreArticles: 'نورې مقالې ولولئ',
  structuredStudy: 'منظمه مطالعه',
  featuredPlans: 'ځانګړي زده کړې پلانونه',
  featuredPlansBody: 'د الفاتحه، یس، الکهف، الملک، الرحمن او نورو لپاره ورځني لارښود درسونه — هر پلان بشپړ سورت لوستونکي ته لینک لري.',
  viewAllPlans: 'ټول پلانونه وګورئ',
  nDays: '{n} ورځې',
  readSurahName: 'سورت {name} ولولئ',
  exploreAllPlans: 'ټول زده کړې پلانونه وګورئ',
  calendar: 'کلیز',
  week: 'اونۍ',
  quranInYearBody: 'یو په پام سره جوړ شوی مهالویش چې له یوې روژې تر بلې پورې ټول قرآن په منظم او اسانه رفتار لوستل او پوهېدل اسانه کوي.',
  thisWeeksReadings: 'د دې اونۍ لوستونه',
  verseN: 'آیت {n}',
  learnMore: 'نور زده کړئ',
};







const ur: Messages = {
  actStudy: 'مطالعہ',
  actBookmark: 'بک مارک',
  actBookmarked: 'بک مارک شدہ',
  actSave: 'محفوظ کریں',
  actNote: 'نوٹ',
  actCopy: 'کاپی',
  actCopied: 'کاپی ہو گیا',
  actShare: 'شیئر',
  actDisplay: 'ڈسپلے',
  actMore: 'مزید',
  signIn: 'سائن اِن',
  createAccount: 'اکاؤنٹ بنائیں',
  logOut: 'لاگ آؤٹ',
  language: 'زبان',
  selectLanguage: 'زبان منتخب کریں',
  search: 'تلاش',
  openMenu: 'مینو کھولیں',
  close: 'بند کریں',
  read: 'پڑھیں',
  learn: 'سیکھیں',
  myQuran: 'میرا قرآن',
  bookmarks: 'بک مارکس',
  quranInYear: 'ایک سال میں قرآن',
  settings: 'ترتیبات',
  feedback: 'رائے',
  hifz: 'حفظ',
  tajweed: 'تجوید',
  navSurahs: 'سورتیں',
  navArticles: 'مضامین',
  heroSearchPlaceholder: 'سورہ، آیت (2:255) یا موضوع تلاش کریں',
  resume: 'جاری رکھیں',
  lastReadAgo: 'آخری بار {time} پڑھا',
  popularSurahs: 'مقبول سورتیں',
  all114Surahs: 'تمام 114 سورتیں',
  dailyRhythm: 'روزانہ کا معمول',
  todayHeading: 'آج',
  audioRecitation: 'تلاوتِ قرآن',
  recitersHeading: 'قراء حضرات',
  guidesAndReflections: 'رہنمائی اور تدبر',
  profile: 'پروفائل',
  profileAndSettings: 'پروفائل اور ترتیبات',
  account: 'اکاؤنٹ',
  accountMenu: 'اکاؤنٹ مینو',
  mainNavigation: 'مرکزی نیویگیشن',
  continueReading: 'پڑھنا جاری رکھیں',
  ayah: 'آیت',
  chooseProfile: 'پروفائل سٹائل منتخب کریں',
  startJourney: '✦ قرآن کا سفر شروع کریں',
  startAdventure: '✦ قرآن کا مہم جوئی سفر! 🚀',
  selectAgeStyle: 'عمر/ظاہری سٹائل منتخب کریں',
  theme: 'تھیم',
  light: 'روشنی',
  dark: 'اندھیرا',
  system: 'سسٹم',
  signInComingSoon: 'سائن اِن جلد آرہا ہے',
  signInComingSoonBody: 'اکاؤنٹس جلد دستیاب ہوں گے۔ اپنا ای میل دیں تاکہ بُک مارکس، اہداف اور پڑھائی کی تاریخ ہم آہنگ ہونے پر ہم آپ کو مطلع کریں۔',
  email: 'ای میل',
  notifyMe: 'لانچ پر مطلع کریں',
  onTheList: 'آپ فہرست میں ہیں',
  continueReadingCta: 'پڑھنا جاری رکھیں',
  differentEmail: 'دوسرا ای میل استعمال کریں',
  keepUsing: 'آپ بغیر اکاؤنٹ QuranPilot استعمال کر سکتے ہیں۔ ترجیحات فی الحال اسی آلہ پر رہیں گی۔',
  heroTitle: 'آپ کا قرآن سفر،',
  heroTitleAccent: 'خوبصورتی سے رہنمائی۔',
  readQuranNow: 'ابھی قرآن پڑھیں',
  listenRadio: 'سنیں: قرآن ریڈیو',
  pauseRadio: 'قرآن ریڈیو روکیں',
  heroBody: 'پڑھیں، سنیں، سمجھیں، حفظ کریں اور تلاوت بہتر بنائیں — ایک پُرسکون تجربے میں.',
  searchPlaceholder: 'سورہ، آیت، موضوع یا لفظ تلاش کریں...',
  searchButton: 'تلاش',
  popular: 'مقبول:',
  livePlayer: 'لائیو پلیئر',
  nowReciting: 'ابھی تلاوت',
  readyToRecite: 'تلاوت کے لیے تیار',
  applyingLanguage: 'لاگو ہو رہا ہے…',
  verse: 'آیت',
  achieveQuranGoals: 'اپنے قرآنی اہداف حاصل کریں',
  achieveQuranGoalsBody: 'مسلسل ہونے کا ریکارڈ رکھیں، ذاتی اہداف بنائیں، مستقل رہیں۔',
  buildQuranExperience: 'اپنا قرآنی تجربہ بنائیں',
  buildQuranExperienceBody: 'فونٹس، ترجمے، قاری اور پڑھنے کی ترجیحات۔',
  todaysMotivation: 'آج کی تحریک',
  motivationDisclaimer: 'تعلیمی حوصلہ افزائی — قرآن یا حدیث کا اقتباس نہیں۔',
  startReading: 'پڑھنا شروع کریں',
  exploreQuran: 'قرآن دیکھیں',
  todaysGoal: 'آج کا ہدف',
  todaysGoalDone: 'آج کا ہدف ✓',
  suggestedToday: 'آج تجویز کردہ',
  continueJourneyMsg: 'اپنے قرآن کے سفر کو وہیں سے جاری رکھیں جہاں چھوڑا تھا۔',
  oneFocusedRuleMsg: 'آج ایک مرکوز تجوید قاعدہ کافی ہے۔',
  startWithAlBaqarah: 'سورۃ البقرہ سے شروع کریں',
  readNAyahs: '{n} آیات پڑھیں',
  unitMin: ' منٹ',
  unitAyahs: ' آیات',
  goalCompleteBody: 'آج کا ہدف مکمل ہے۔ چاہیں تو پڑھنا جاری رکھیں۔',
  optionalDailyGoalHint: 'اختیاری — اپنے اکاؤنٹ میں محفوظ کرنے کے لیے نیچے روزانہ ہدف چنیں۔',
  chooseDailyGoal: 'روزانہ ہدف چنیں (اختیاری)',
  continueTajweed: 'تجوید جاری رکھیں',
  ayahOfTheDay: 'آج کی آیت',
  readInQuran: 'قرآن میں پڑھیں',
  todaysTajweed: 'آج کی تجوید',
  listenTajweedHint: 'چند تصدیق شدہ مثالیں سنیں اور آواز پہچاننے پر توجہ دیں۔',
  learnNamed: '{name} سیکھیں',
  askAi: 'AI سے پوچھیں',
  askAiShort: 'AI',
  home: 'ہوم',
  chapters: 'سورۃیں',
  learningPlans: 'سیکھنے کے منصوبے',
  sitemap: 'سائٹ میپ',
  resources: 'وسائل',
  donate: 'عطیہ',
  footerTagline: 'QuranPilot ایک جدید ویب ایپ ہے جو ترجموں اور رہنمائی کے ساتھ قرآن پڑھنے، سننے، مطالعہ اور غوروفکر میں مدد کرتی ہے۔',
  footerRights: 'ہدایت اور حکمت کے لیے بنایا گیا۔ جملہ حقوق محفوظ ہیں۔',
  reflectOnQuran: 'قرآن پر غور کریں',
  exploreVerses: 'آیات تلاش کریں',
  reflectionBaqarah: 'یاد دہانی کہ اللہ کسی جان کو اس کی طاقت سے زیادہ بوجھ نہیں دیتا — ہر آزمائش کے ساتھ صبر کی گنجائش بھی ہے۔',
  reflectionSharh: '«الفعل کے ساتھ آسانی ہے» دو بار آیا ہے — مشکل میں بھی امید برقرار رکھنے کی دعوت۔',
  reflectionFatihah: 'ہر رکعت اس آیت سے شروع ہوتی ہے: عبادت اور بھروسہ صرف اللہ کا ہے — نیت کا روزانہ تجدید۔',
  communityRoadmap: 'غوروفکر اور کمیونٹی شیئرنگ ہمارے روڈمیپ میں ہے — ابھی قرآن دیکھیں اور کسی بھی آیت سے نوٹس شروع کریں۔',
  appsWhereverTitle: 'QuranPilot، جہاں بھی پڑھیں',
  appsWhereverBody: 'QuranPilot مکمل طور پر براؤزر میں چلتا ہے — انسٹال کی ضرورت نہیں۔ موبائل ایپ روڈمیپ پر ہے۔',
  mobileAppComingSoon: 'موبائل ایپ جلد آرہی ہے',
  appsFeatureSearch: 'عربی اور ترجمے میں فوری تلاش',
  appsFeatureRecitation: 'آیت بہ آیت تلاوت اور قاری تبدیلی',
  appsFeatureBookmarks: 'بک مارکس اور پیشرفت براؤزر میں محفوظ',
  homeBrowseChapters: 'سورتیں دیکھیں',
  homeBrowseChaptersSub: 'سورت، پارہ یا ترتیبِ نزول منتخب کریں۔',
  tabSurah: 'سورت',
  tabJuz: 'پارہ',
  tabOrder: 'ترتیب',
  searchSurahPlaceholder: 'سورت کا نام یا نمبر تلاش کریں...',
  juzN: 'پارہ {n}',
  nVerses: '{n} آیات',
  hearQuranTitle: 'قرآن سنیں',
  hearQuranAccent: 'ترجمے کے ساتھ۔',
  viewMoreChapters: 'مزید سورتیں دیکھیں',
  openReader: 'ریڈر کھولیں',
  continueFullReader: 'مکمل ریڈر میں جاری رکھیں ←',
  loadVersesError: 'اس سورت کی آیات لوڈ نہیں ہو سکیں۔',
  recitersTitle: 'قرآن مجید کی تلاوت سنیں',
  recitersAccent: 'اپنے پسندیدہ قراء کی آواز میں۔',
  reciterDescAlafasy: 'مشہور کویتی قاری',
  reciterDescSudais: 'مسجد الحرام کے امامِ اعلیٰ',
  reciterDescBasit: 'مصر کی سنہری آواز',
  reciterDescHaramImam: 'مسجد الحرام کے امام',
  reciterDescOusi: 'امام اور قاری',
  learnBasicsTitle: 'قرآن اور اسلام کی بنیادی باتیں',
  learnBasicsAccent: 'روزانہ سیکھیں۔',
  learnBasicsBody: 'اسلام اور قرآن کے رہنما مضامین کی ہماری بڑھتی ہوئی لائبریری سے نئے منتخب مضامین روزانہ بدلتے ہیں۔',
  newToday: 'آج نیا',
  readMoreArticles: 'مزید مضامین پڑھیں',
  structuredStudy: 'منظم مطالعہ',
  featuredPlans: 'نمایاں تعلیمی منصوبے',
  featuredPlansBody: 'الفاتحہ، یٰسین، الکہف، الملک، الرحمٰن اور دیگر کے لیے روزانہ رہنما اسباق — ہر منصوبہ مکمل سورت ریڈر سے جڑا ہے۔',
  viewAllPlans: 'تمام منصوبے دیکھیں',
  nDays: '{n} دن',
  readSurahName: 'سورہ {name} پڑھیں',
  exploreAllPlans: 'تمام تعلیمی منصوبے دیکھیں',
  calendar: 'کیلنڈر',
  week: 'ہفتہ',
  quranInYearBody: 'ایک سوچا سمجھا شیڈول جو ایک رمضان سے اگلے رمضان تک پورا قرآن مستقل اور آسان رفتار سے پڑھنا اور سمجھنا آسان بناتا ہے۔',
  thisWeeksReadings: 'اس ہفتے کی تلاوت',
  verseN: 'آیت {n}',
  learnMore: 'مزید جانیں',
};



const DICTS: Partial<Record<UiLocale, Messages>> = {
  en,
  fa,
  ps,
  ur,
};

export const RTL_LOCALES: UiLocale[] = ['ar', 'fa', 'ur', 'ps'];

export function isRtlLocale(locale: UiLocale): boolean {
  return RTL_LOCALES.includes(locale);
}

export function t(locale: UiLocale, key: MessageKey): string {
  return DICTS[locale]?.[key] ?? en[key] ?? key;
}

export function translate(locale: UiLocale) {
  return (key: MessageKey) => t(locale, key);
}
