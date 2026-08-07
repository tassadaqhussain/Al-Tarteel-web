import type { UiLocale } from '@/stores/settingsStore';

/** Common chrome / navigation strings. Missing keys fall back to English. */
export type MessageKey =
  | 'signIn'
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
  | 'applyingLanguage';

type Dict = Partial<Record<MessageKey, string>>;

const en: Record<MessageKey, string> = {
  signIn: 'Sign in',
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
  signInComingSoonBody:
    "Accounts are on the way. Leave your email and we'll notify you when you can sync bookmarks, goals, and reading history across devices.",
  email: 'Email',
  notifyMe: 'Notify me at launch',
  onTheList: "You're on the list",
  continueReadingCta: 'Continue reading',
  differentEmail: 'Use a different email',
  keepUsing:
    'You can keep using QuranPilot without an account. Preferences stay on this device for now.',
  heroTitle: 'Discover the Quran, &',
  heroTitleAccent: 'Learn the Basics of Islam.',
  readQuranNow: 'Read The Holy Quran Now',
  listenRadio: 'Listen Radio: Quran Radio',
  pauseRadio: 'Pause Quran Radio',
  heroBody:
    'Explore the Quran, translations, reciters, and audio recitation. Offline ready with daily reflections and guidance.',
  searchPlaceholder: 'Type surah name, page or verse...',
  searchButton: 'Search',
  popular: 'Popular:',
  livePlayer: 'Live Player',
  nowReciting: 'Now Reciting',
  readyToRecite: 'Ready to Recite',
  applyingLanguage: 'Applying…',
};

const ar: Dict = {
  signIn: 'تسجيل الدخول',
  language: 'اللغة',
  selectLanguage: 'اختر اللغة',
  search: 'بحث',
  openMenu: 'فتح القائمة',
  close: 'إغلاق',
  read: 'اقرأ',
  learn: 'تعلّم',
  myQuran: 'قرآني',
  bookmarks: 'العلامات',
  quranInYear: 'القرآن في سنة',
  settings: 'الإعدادات',
  continueReading: 'متابعة القراءة',
  ayah: 'آية',
  chooseProfile: 'اختر نمط العرض',
  startJourney: '✦ ابدأ رحلتك مع القرآن',
  startAdventure: '✦ ابدأ مغامرتك مع القرآن! 🚀',
  selectAgeStyle: 'اختر نمط العمر/المظهر',
  theme: 'المظهر',
  light: 'فاتح',
  dark: 'داكن',
  system: 'النظام',
  signInComingSoon: 'تسجيل الدخول قريباً',
  signInComingSoonBody:
    'الحسابات قادمة قريباً. اترك بريدك وسنُعلمك عند توفر مزامنة العلامات والأهداف وسجل القراءة.',
  email: 'البريد الإلكتروني',
  notifyMe: 'أبلغني عند الإطلاق',
  onTheList: 'أنت على القائمة',
  continueReadingCta: 'متابعة القراءة',
  differentEmail: 'استخدم بريداً آخر',
  keepUsing: 'يمكنك استخدام QuranPilot بدون حساب. تفضيلاتك تبقى على هذا الجهاز حالياً.',
  heroTitle: 'اكتشف القرآن، و',
  heroTitleAccent: 'تعلّم أساسيات الإسلام.',
  readQuranNow: 'اقرأ القرآن الكريم الآن',
  listenRadio: 'استمع: إذاعة القرآن',
  pauseRadio: 'إيقاف إذاعة القرآن',
  heroBody: 'استكشف القرآن والترجمات والقرّاء والتلاوة الصوتية مع تأملات يومية.',
  searchPlaceholder: 'اسم السورة أو الصفحة أو الآية...',
  searchButton: 'بحث',
  popular: 'الأكثر قراءة:',
  livePlayer: 'المشغّل المباشر',
  nowReciting: 'يُتلى الآن',
  readyToRecite: 'جاهز للتلاوة',
  applyingLanguage: 'جاري التطبيق…',
};

const ur: Dict = {
  signIn: 'سائن اِن',
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
  signInComingSoonBody:
    'اکاؤنٹس جلد دستیاب ہوں گے۔ اپنا ای میل دیں تاکہ بُک مارکس، اہداف اور پڑھائی کی تاریخ ہم آہنگ ہونے پر ہم آپ کو مطلع کریں۔',
  email: 'ای میل',
  notifyMe: 'لانچ پر مطلع کریں',
  onTheList: 'آپ فہرست میں ہیں',
  continueReadingCta: 'پڑھنا جاری رکھیں',
  differentEmail: 'دوسرا ای میل استعمال کریں',
  keepUsing: 'آپ بغیر اکاؤنٹ QuranPilot استعمال کر سکتے ہیں۔ ترجیحات فی الحال اسی آلہ پر رہیں گی۔',
  heroTitle: 'قرآن دریافت کریں، اور',
  heroTitleAccent: 'اسلام کی بنیادی باتیں سیکھیں۔',
  readQuranNow: 'ابھی قرآن پڑھیں',
  listenRadio: 'سنیں: قرآن ریڈیو',
  pauseRadio: 'قرآن ریڈیو روکیں',
  heroBody: 'ترجمے، قاری اور آڈیو تلاوت کے ساتھ قرآن کا مطالعہ کریں۔',
  searchPlaceholder: 'سورہ، صفحہ یا آیت لکھیں...',
  searchButton: 'تلاش',
  popular: 'مقبول:',
  livePlayer: 'لائیو پلیئر',
  nowReciting: 'ابھی تلاوت',
  readyToRecite: 'تلاوت کے لیے تیار',
  applyingLanguage: 'لاگو ہو رہا ہے…',
};

const fa: Dict = {
  signIn: 'ورود',
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
  signInComingSoonBody:
    'حساب‌ها به‌زودی اضافه می‌شوند. ایمیل بگذارید تا هنگام همگام‌سازی نشان‌ها و پیشرفت مطلع شوید.',
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
};

const fr: Dict = {
  signIn: 'Connexion',
  language: 'Langue',
  selectLanguage: 'Choisir la langue',
  search: 'Rechercher',
  openMenu: 'Ouvrir le menu',
  close: 'Fermer',
  read: 'Lire',
  learn: 'Apprendre',
  myQuran: 'Mon Coran',
  bookmarks: 'Favoris',
  quranInYear: 'Coran en un an',
  settings: 'Paramètres',
  continueReading: 'Continuer la lecture',
  ayah: 'Verset',
  chooseProfile: 'Choisir le style de profil',
  startJourney: '✦ Commencez votre voyage coranique',
  startAdventure: '✦ Commencez votre aventure ! 🚀',
  selectAgeStyle: 'Choisir le style âge/apparence',
  theme: 'Thème',
  light: 'Clair',
  dark: 'Sombre',
  system: 'Système',
  signInComingSoon: 'Connexion bientôt disponible',
  signInComingSoonBody:
    'Les comptes arrivent. Laissez votre e-mail pour être prévenu quand favoris et progression pourront être synchronisés.',
  email: 'E-mail',
  notifyMe: 'Prévenez-moi au lancement',
  onTheList: 'Vous êtes sur la liste',
  continueReadingCta: 'Continuer la lecture',
  differentEmail: 'Utiliser un autre e-mail',
  keepUsing:
    'Vous pouvez utiliser QuranPilot sans compte. Vos préférences restent sur cet appareil pour l’instant.',
  heroTitle: 'Découvrez le Coran, &',
  heroTitleAccent: 'Apprenez les bases de l’Islam.',
  readQuranNow: 'Lire le Saint Coran maintenant',
  listenRadio: 'Écouter : Radio Coran',
  pauseRadio: 'Pause Radio Coran',
  heroBody: 'Explorez traductions, récitants et récitation audio.',
  searchPlaceholder: 'Sourate, page ou verset...',
  searchButton: 'Rechercher',
  popular: 'Populaire :',
  livePlayer: 'Lecteur en direct',
  nowReciting: 'En cours de récitation',
  readyToRecite: 'Prêt à réciter',
  applyingLanguage: 'Application…',
};

const id: Dict = {
  signIn: 'Masuk',
  language: 'Bahasa',
  selectLanguage: 'Pilih Bahasa',
  search: 'Cari',
  openMenu: 'Buka menu',
  close: 'Tutup',
  read: 'Baca',
  learn: 'Belajar',
  myQuran: 'Quran Saya',
  bookmarks: 'Markah',
  quranInYear: 'Quran dalam Setahun',
  settings: 'Pengaturan',
  continueReading: 'Lanjutkan Membaca',
  ayah: 'Ayat',
  chooseProfile: 'Pilih Gaya Profil',
  startJourney: '✦ Mulai Perjalanan Quran Anda',
  startAdventure: '✦ Mulai Petualangan Quran! 🚀',
  selectAgeStyle: 'Pilih gaya usia/tampilan',
  theme: 'Tema',
  light: 'Terang',
  dark: 'Gelap',
  system: 'Sistem',
  signInComingSoon: 'Masuk segera hadir',
  signInComingSoonBody:
    'Akun segera tersedia. Tinggalkan email agar kami memberi tahu saat sinkronisasi markah dan kemajuan siap.',
  email: 'Email',
  notifyMe: 'Beritahu saya saat diluncurkan',
  onTheList: 'Anda ada di daftar',
  continueReadingCta: 'Lanjutkan membaca',
  differentEmail: 'Gunakan email lain',
  keepUsing: 'Anda dapat memakai QuranPilot tanpa akun. Preferensi tetap di perangkat ini untuk saat ini.',
  heroTitle: 'Temukan Quran, &',
  heroTitleAccent: 'Pelajari Dasar-Dasar Islam.',
  readQuranNow: 'Baca Al-Quran Sekarang',
  listenRadio: 'Dengar Radio Quran',
  pauseRadio: 'Jeda Radio Quran',
  heroBody: 'Jelajahi terjemahan, qari, dan tilawah audio.',
  searchPlaceholder: 'Nama surah, halaman, atau ayat...',
  searchButton: 'Cari',
  popular: 'Populer:',
  livePlayer: 'Pemutar Langsung',
  nowReciting: 'Sedang Dibacakan',
  readyToRecite: 'Siap Membaca',
  applyingLanguage: 'Menerapkan…',
};

const tr: Dict = {
  signIn: 'Giriş yap',
  language: 'Dil',
  selectLanguage: 'Dil Seçin',
  search: 'Ara',
  openMenu: 'Menüyü aç',
  close: 'Kapat',
  read: 'Oku',
  learn: 'Öğren',
  myQuran: 'Kur’an’ım',
  bookmarks: 'Yer imleri',
  quranInYear: 'Bir Yılda Kur’an',
  settings: 'Ayarlar',
  continueReading: 'Okumaya devam et',
  ayah: 'Ayet',
  chooseProfile: 'Profil stilini seç',
  startJourney: '✦ Kur’an yolculuğuna başla',
  startAdventure: '✦ Kur’an maceranı başlat! 🚀',
  selectAgeStyle: 'Yaş/görünüm stilini seç',
  theme: 'Tema',
  light: 'Açık',
  dark: 'Koyu',
  system: 'Sistem',
  signInComingSoon: 'Giriş yakında',
  signInComingSoonBody:
    'Hesaplar yakında gelecek. Yer imleri ve ilerlemeniz senkronize olduğunda haber vermemiz için e-posta bırakın.',
  email: 'E-posta',
  notifyMe: 'Yayında haber ver',
  onTheList: 'Listedesiniz',
  continueReadingCta: 'Okumaya devam et',
  differentEmail: 'Farklı e-posta kullan',
  keepUsing: 'Hesap olmadan da QuranPilot kullanabilirsiniz. Tercihler şimdilik bu cihazda kalır.',
  heroTitle: 'Kur’an’ı keşfedin, &',
  heroTitleAccent: 'İslam’ın temellerini öğrenin.',
  readQuranNow: 'Kur’an-ı Kerim’i şimdi oku',
  listenRadio: 'Kur’an radyosu',
  pauseRadio: 'Radyoyu duraklat',
  heroBody: 'Çeviriler, hafızlar ve sesli tilavet keşfedin.',
  searchPlaceholder: 'Sure, sayfa veya ayet...',
  searchButton: 'Ara',
  popular: 'Popüler:',
  livePlayer: 'Canlı Oynatıcı',
  nowReciting: 'Şimdi okunuyor',
  readyToRecite: 'Okumaya hazır',
  applyingLanguage: 'Uygulanıyor…',
};

const es: Dict = {
  signIn: 'Iniciar sesión',
  language: 'Idioma',
  selectLanguage: 'Seleccionar idioma',
  search: 'Buscar',
  openMenu: 'Abrir menú',
  close: 'Cerrar',
  read: 'Leer',
  learn: 'Aprender',
  myQuran: 'Mi Corán',
  bookmarks: 'Marcadores',
  quranInYear: 'Corán en un año',
  settings: 'Ajustes',
  continueReading: 'Seguir leyendo',
  ayah: 'Aleya',
  chooseProfile: 'Elegir estilo de perfil',
  startJourney: '✦ Comienza tu viaje coránico',
  startAdventure: '✦ ¡Comienza tu aventura! 🚀',
  selectAgeStyle: 'Elegir estilo de edad/apariencia',
  theme: 'Tema',
  light: 'Claro',
  dark: 'Oscuro',
  system: 'Sistema',
  signInComingSoon: 'Inicio de sesión pronto',
  signInComingSoonBody:
    'Las cuentas llegarán pronto. Deja tu correo para avisarte cuando puedas sincronizar marcadores y progreso.',
  email: 'Correo',
  notifyMe: 'Avísame en el lanzamiento',
  onTheList: 'Estás en la lista',
  continueReadingCta: 'Seguir leyendo',
  differentEmail: 'Usar otro correo',
  keepUsing: 'Puedes usar QuranPilot sin cuenta. Las preferencias quedan en este dispositivo por ahora.',
  heroTitle: 'Descubre el Corán, y',
  heroTitleAccent: 'Aprende lo básico del Islam.',
  readQuranNow: 'Lee el Sagrado Corán ahora',
  listenRadio: 'Radio del Corán',
  pauseRadio: 'Pausar radio',
  heroBody: 'Explora traducciones, recitadores y audio.',
  searchPlaceholder: 'Sura, página o aleya...',
  searchButton: 'Buscar',
  popular: 'Popular:',
  livePlayer: 'Reproductor en vivo',
  nowReciting: 'Recitando ahora',
  readyToRecite: 'Listo para recitar',
  applyingLanguage: 'Aplicando…',
};

const bn: Dict = {
  signIn: 'সাইন ইন',
  language: 'ভাষা',
  selectLanguage: 'ভাষা নির্বাচন করুন',
  search: 'অনুসন্ধান',
  openMenu: 'মেনু খুলুন',
  close: 'বন্ধ',
  read: 'পড়ুন',
  learn: 'শিখুন',
  myQuran: 'আমার কুরআন',
  bookmarks: 'বুকমার্ক',
  quranInYear: 'এক বছরে কুরআন',
  settings: 'সেটিংস',
  continueReading: 'পড়া চালিয়ে যান',
  ayah: 'আয়াত',
  chooseProfile: 'প্রোফাইল স্টাইল বেছে নিন',
  startJourney: '✦ আপনার কুরআন যাত্রা শুরু করুন',
  startAdventure: '✦ কুরআনের অভিযান শুরু! 🚀',
  selectAgeStyle: 'বয়স/দেখার স্টাইল বেছে নিন',
  theme: 'থিম',
  light: 'লাইট',
  dark: 'ডার্ক',
  system: 'সিস্টেম',
  signInComingSoon: 'সাইন ইন শীঘ্রই আসছে',
  email: 'ইমেইল',
  notifyMe: 'চালু হলে জানাবেন',
  onTheList: 'আপনি তালিকায় আছেন',
  continueReadingCta: 'পড়া চালিয়ে যান',
  heroTitle: 'কুরআন আবিষ্কার করুন, এবং',
  heroTitleAccent: 'ইসলামের মৌলিক বিষয় শিখুন।',
  readQuranNow: 'এখনই পবিত্র কুরআন পড়ুন',
  listenRadio: 'কুরআন রেডিও শুনুন',
  pauseRadio: 'রেডিও বিরতি',
  searchPlaceholder: 'সূরা, পৃষ্ঠা বা আয়াত...',
  searchButton: 'অনুসন্ধান',
  popular: 'জনপ্রিয়:',
  livePlayer: 'লাইভ প্লেয়ার',
  nowReciting: 'এখন তিলাওয়াত',
  readyToRecite: 'তিলাওয়াতের জন্য প্রস্তুত',
  applyingLanguage: 'প্রয়োগ হচ্ছে…',
};

const ms: Dict = {
  signIn: 'Log masuk',
  language: 'Bahasa',
  selectLanguage: 'Pilih Bahasa',
  search: 'Cari',
  openMenu: 'Buka menu',
  close: 'Tutup',
  read: 'Baca',
  learn: 'Belajar',
  myQuran: 'Quran Saya',
  bookmarks: 'Tanda buku',
  quranInYear: 'Quran dalam Setahun',
  settings: 'Tetapan',
  continueReading: 'Teruskan Membaca',
  ayah: 'Ayat',
  theme: 'Tema',
  light: 'Cerah',
  dark: 'Gelap',
  system: 'Sistem',
  signInComingSoon: 'Log masuk akan datang',
  email: 'E-mel',
  notifyMe: 'Maklumkan saya',
  onTheList: 'Anda dalam senarai',
  continueReadingCta: 'Teruskan membaca',
  heroTitle: 'Temui Quran, &',
  heroTitleAccent: 'Pelajari Asas Islam.',
  readQuranNow: 'Baca Al-Quran Sekarang',
  listenRadio: 'Dengar Radio Quran',
  pauseRadio: 'Jeda Radio Quran',
  searchPlaceholder: 'Nama surah, halaman atau ayat...',
  searchButton: 'Cari',
  popular: 'Popular:',
  livePlayer: 'Pemain Langsung',
  nowReciting: 'Sedang Dibaca',
  readyToRecite: 'Sedia Membaca',
  applyingLanguage: 'Menggunakan…',
};

const DICTS: Partial<Record<UiLocale, Dict>> = {
  en,
  ar,
  ur,
  fa,
  fr,
  id,
  tr,
  es,
  bn,
  ms,
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
