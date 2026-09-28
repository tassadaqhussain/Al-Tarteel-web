/**
 * Interface strings for the Learn Namaz module (controls, labels, states).
 * Lesson content lives in `content.ts`; these are only the chrome around it.
 * Missing keys fall back to English.
 */
import type { UiLocale } from '@/stores/settingsStore';

const en = {
  title: 'Learn Namaz',
  subtitle: 'A calm, step-by-step guide to performing salah, from preparation to salam.',
  choosePrayer: 'Choose a prayer',
  rakahs: '{n} rak’ahs',
  rakahCount: 'Rak’ahs',
  startLesson: 'Start lesson',
  resume: 'Resume',
  restart: 'Start over',
  resumeAt: 'You were on step {n} of {total}.',
  prerequisites: 'Before you pray',
  learnMore: 'Learn more',
  school: 'School of thought',
  schoolGeneral: 'General (show all notes)',
  schoolHint: 'Some details differ between schools. Choose yours to see its notes, or keep “General” to see them all.',
  step: 'Step {n} of {total}',
  rakahOf: 'Rak’ah {n} of {total}',
  preparation: 'Preparation',
  finalSitting: 'Final sitting',
  next: 'Next',
  back: 'Back',
  repeatStep: 'Repeat step',
  finish: 'Finish',
  play: 'Play',
  pause: 'Pause',
  resumeAudio: 'Resume',
  replay: 'Replay',
  slower: 'Slower',
  normalSpeed: 'Normal speed',
  guidance: 'Spoken guidance',
  recitation: 'Recitation',
  transliteration: 'Transliteration',
  translation: 'Translation',
  action: 'What to do',
  variations: 'Differences between schools',
  sources: 'Sources',
  practiceMode: 'Practice mode',
  lessonMode: 'Lesson mode',
  practiceHint: 'Practice mode reads each step aloud, then plays the recitation. Use the buttons or, if you like, voice commands.',
  voiceCommands: 'Voice commands',
  voiceHint: 'Say “next”, “back”, “repeat”, “pause” or “play”. Your browser’s speech service processes the audio; QuranPilot does not record or store it. No camera is used.',
  voiceUnsupported: 'Voice commands are not supported in this browser. Use the buttons instead.',
  micDenied: 'Microphone access was blocked, so voice commands are off. The buttons still work.',
  listening: 'Listening for commands…',
  heard: 'Heard: {c}',
  autoAdvance: 'Move to the next step automatically',
  loading: 'Loading…',
  retry: 'Try again',
  offline: 'You appear to be offline. Reconnect and try again.',
  quranLoadError: 'The verified Quran text could not be loaded.',
  audioError: 'The audio could not be played. Check your connection and press Replay.',
  noRecording: 'No reviewed recording yet — read along with the transliteration.',
  noVoice: 'Spoken guidance is not available on this device. Please read the instructions shown.',
  reviewNotice: 'Awaiting scholarly review',
  reviewBanner: 'This lesson uses cited sources, but its text and notes are still awaiting review by a qualified scholar. Please confirm details with a trusted teacher.',
  englishOnly: 'Shown in English — a reviewed translation in your language is not available yet.',
  complete: 'Lesson complete',
  completeBody: 'You have gone through every step of this prayer. Repeat it as often as you like.',
  validity: 'This guide helps you learn the steps. It cannot tell whether a prayer is valid — for questions, please ask a qualified scholar.',
  optional: 'Optional',
  repeatTimes: 'Repeat ×{n}',
  progress: 'Lesson progress',
  keyboardHint: 'Keyboard: ← → to move between steps, P to play or pause, R to replay.',
  rakahGuide: 'How rak’ahs work',
  rakahGuideBody: 'Each rak’ah is one cycle of standing, recitation, bowing and two prostrations. Prayers differ in how many rak’ahs they have, and whether there is a middle sitting.',
  otherPrayers: 'Sunnah and Witr prayers follow the same movements, but their number of rak’ahs and some details (such as qunut in Witr) differ by school. Ask your teacher.',
  audiblePrayer: 'Recited aloud in rak’ahs {r} when leading; quiet otherwise.',
  quietPrayer: 'All rak’ahs are recited quietly.',
  savedOnDevice: 'Your place is saved on this device.',
  shortSurah: 'Short surah to practise',
  translationBy: 'Translation: {name}',
  quranSource: 'Quran text, word transliteration and audio from QuranPilot’s Quran library.',
  reciter: 'Reciter: {name}',
  allPrayers: 'All prayers',
  contentVersion: 'Content version {v}',
  noCamera: 'No camera or video is used. QuranPilot does not check your movements.',
};

export type NamazMessageKey = keyof typeof en;
type Dict = Partial<Record<NamazMessageKey, string>>;

const ar: Dict = {
  title: 'تعلّم الصلاة',
  subtitle: 'دليل هادئ خطوة بخطوة لأداء الصلاة، من التهيّؤ حتى التسليم.',
  choosePrayer: 'اختر صلاة',
  rakahs: '{n} ركعات',
  rakahCount: 'الركعات',
  startLesson: 'ابدأ الدرس',
  resume: 'تابع',
  restart: 'ابدأ من جديد',
  resumeAt: 'كنت عند الخطوة {n} من {total}.',
  prerequisites: 'قبل أن تصلّي',
  learnMore: 'اعرف المزيد',
  school: 'المذهب الفقهي',
  schoolGeneral: 'عام (عرض كل الملاحظات)',
  schoolHint: 'تختلف بعض التفاصيل بين المذاهب. اختر مذهبك لعرض ملاحظاته، أو اترك «عام» لعرضها كلها.',
  step: 'الخطوة {n} من {total}',
  rakahOf: 'الركعة {n} من {total}',
  preparation: 'التهيّؤ',
  finalSitting: 'الجلسة الأخيرة',
  next: 'التالي',
  back: 'السابق',
  repeatStep: 'أعد الخطوة',
  finish: 'إنهاء',
  play: 'تشغيل',
  pause: 'إيقاف مؤقت',
  resumeAudio: 'متابعة',
  replay: 'إعادة',
  slower: 'أبطأ',
  normalSpeed: 'سرعة عادية',
  guidance: 'الإرشاد الصوتي',
  recitation: 'التلاوة',
  transliteration: 'النطق بالحروف اللاتينية',
  translation: 'الترجمة',
  action: 'ماذا تفعل',
  variations: 'اختلاف المذاهب',
  sources: 'المصادر',
  practiceMode: 'وضع التدريب',
  lessonMode: 'وضع الدرس',
  voiceCommands: 'الأوامر الصوتية',
  loading: 'جارٍ التحميل…',
  retry: 'حاول مرة أخرى',
  offline: 'يبدو أنك غير متصل. أعد الاتصال وحاول مرة أخرى.',
  quranLoadError: 'تعذّر تحميل نص القرآن الموثّق.',
  audioError: 'تعذّر تشغيل الصوت. تحقّق من الاتصال واضغط «إعادة».',
  noRecording: 'لا يوجد تسجيل مراجَع بعد — اقرأ مع النطق المكتوب.',
  reviewNotice: 'بانتظار المراجعة العلمية',
  reviewBanner: 'يعتمد هذا الدرس على مصادر موثّقة، لكن نصوصه وملاحظاته ما زالت بانتظار مراجعة عالم مؤهّل. يُرجى التأكد من التفاصيل مع معلّم موثوق.',
  englishOnly: 'معروض بالإنجليزية — لا تتوفر بعد ترجمة مراجَعة بلغتك.',
  complete: 'اكتمل الدرس',
  validity: 'يساعدك هذا الدليل على تعلّم الخطوات، ولا يستطيع الحكم على صحة الصلاة — لأي سؤال يُرجى سؤال عالم مؤهّل.',
  optional: 'اختياري',
  repeatTimes: 'كرّر ×{n}',
  progress: 'تقدّم الدرس',
  rakahGuide: 'كيف تُحسب الركعات',
  savedOnDevice: 'يُحفظ موضعك على هذا الجهاز.',
  allPrayers: 'كل الصلوات',
  shortSurah: 'سورة قصيرة للتدريب',
  autoAdvance: 'الانتقال إلى الخطوة التالية تلقائيًا',
  listening: 'جارٍ الاستماع للأوامر…',
  noVoice: 'الإرشاد الصوتي غير متاح على هذا الجهاز. يُرجى قراءة التعليمات المعروضة.',
  voiceUnsupported: 'الأوامر الصوتية غير مدعومة في هذا المتصفح. استخدم الأزرار.',
  micDenied: 'تم حظر الميكروفون، لذا الأوامر الصوتية متوقفة. الأزرار ما زالت تعمل.',
  completeBody: 'لقد مررت بكل خطوات هذه الصلاة. كرّرها متى شئت.',
  quietPrayer: 'تُقرأ جميع الركعات سرًّا.',
  audiblePrayer: 'يُجهر بالقراءة في الركعات {r} عند الإمامة، وسرًّا في غيرها.',
  noCamera: 'لا تُستخدم الكاميرا أو الفيديو. لا يتحقّق QuranPilot من حركاتك.',
};

const ur: Dict = {
  title: 'نماز سیکھیں',
  subtitle: 'تیاری سے سلام تک، نماز ادا کرنے کی پُرسکون، مرحلہ وار رہنمائی۔',
  choosePrayer: 'نماز منتخب کریں',
  rakahs: '{n} رکعات',
  rakahCount: 'رکعات',
  startLesson: 'سبق شروع کریں',
  resume: 'جاری رکھیں',
  restart: 'نئے سرے سے شروع کریں',
  resumeAt: 'آپ {total} میں سے مرحلہ {n} پر تھے۔',
  prerequisites: 'نماز سے پہلے',
  learnMore: 'مزید جانیں',
  school: 'فقہی مسلک',
  schoolGeneral: 'عمومی (تمام نوٹس دکھائیں)',
  schoolHint: 'کچھ تفصیلات مسالک میں مختلف ہیں۔ اپنا مسلک منتخب کریں، یا سب نوٹس دیکھنے کے لیے «عمومی» رہنے دیں۔',
  step: 'مرحلہ {n} از {total}',
  rakahOf: 'رکعت {n} از {total}',
  preparation: 'تیاری',
  finalSitting: 'آخری قعدہ',
  next: 'اگلا',
  back: 'پچھلا',
  repeatStep: 'مرحلہ دہرائیں',
  finish: 'مکمل کریں',
  play: 'چلائیں',
  pause: 'روکیں',
  resumeAudio: 'جاری رکھیں',
  replay: 'دوبارہ سنیں',
  slower: 'آہستہ',
  normalSpeed: 'عام رفتار',
  guidance: 'صوتی رہنمائی',
  recitation: 'تلاوت',
  transliteration: 'رومن تلفظ',
  translation: 'ترجمہ',
  action: 'کیا کرنا ہے',
  variations: 'مسالک کا فرق',
  sources: 'حوالہ جات',
  practiceMode: 'مشق موڈ',
  lessonMode: 'سبق موڈ',
  voiceCommands: 'صوتی احکامات',
  loading: 'لوڈ ہو رہا ہے…',
  retry: 'دوبارہ کوشش کریں',
  offline: 'لگتا ہے آپ آف لائن ہیں۔ دوبارہ جڑیں اور کوشش کریں۔',
  quranLoadError: 'تصدیق شدہ قرآنی متن لوڈ نہیں ہو سکا۔',
  audioError: 'آڈیو نہیں چل سکا۔ کنکشن چیک کریں اور «دوبارہ سنیں» دبائیں۔',
  noRecording: 'ابھی کوئی جانچی ہوئی ریکارڈنگ نہیں — رومن تلفظ کے ساتھ پڑھیں۔',
  reviewNotice: 'علمی جائزے کا منتظر',
  reviewBanner: 'یہ سبق حوالہ شدہ مآخذ پر مبنی ہے، لیکن اس کا متن اور نوٹس ابھی کسی مستند عالم کے جائزے کے منتظر ہیں۔ براہِ کرم تفصیلات کسی قابلِ اعتماد استاد سے تصدیق کریں۔',
  englishOnly: 'انگریزی میں دکھایا گیا — آپ کی زبان میں جانچا ہوا ترجمہ ابھی دستیاب نہیں۔',
  complete: 'سبق مکمل',
  validity: 'یہ رہنما آپ کو مراحل سیکھنے میں مدد دیتا ہے۔ یہ نماز کے درست ہونے کا فیصلہ نہیں کر سکتا — سوالات کے لیے کسی مستند عالم سے رجوع کریں۔',
  optional: 'اختیاری',
  repeatTimes: '×{n} دہرائیں',
  progress: 'سبق کی پیش رفت',
  rakahGuide: 'رکعات کیسے ہوتی ہیں',
  savedOnDevice: 'آپ کی جگہ اس ڈیوائس پر محفوظ ہے۔',
  allPrayers: 'تمام نمازیں',
  shortSurah: 'مشق کے لیے مختصر سورت',
  autoAdvance: 'خودبخود اگلے مرحلے پر جائیں',
  listening: 'احکامات سن رہا ہے…',
  noVoice: 'اس ڈیوائس پر صوتی رہنمائی دستیاب نہیں۔ براہِ کرم دکھائی گئی ہدایات پڑھیں۔',
  voiceUnsupported: 'اس براؤزر میں صوتی احکامات دستیاب نہیں۔ بٹن استعمال کریں۔',
  micDenied: 'مائیکروفون کی اجازت نہیں ملی، اس لیے صوتی احکامات بند ہیں۔ بٹن کام کرتے رہیں گے۔',
  completeBody: 'آپ نے اس نماز کے تمام مراحل مکمل کر لیے۔ جتنی بار چاہیں دہرائیں۔',
  quietPrayer: 'تمام رکعات میں قراءت آہستہ ہوتی ہے۔',
  audiblePrayer: 'امامت کی صورت میں رکعات {r} میں قراءت بلند آواز سے، باقی میں آہستہ۔',
  noCamera: 'کیمرہ یا ویڈیو استعمال نہیں ہوتی۔ QuranPilot آپ کی حرکات کی جانچ نہیں کرتا۔',
};

const fa: Dict = {
  title: 'آموزش نماز', choosePrayer: 'یک نماز انتخاب کنید', rakahs: '{n} رکعت', startLesson: 'شروع درس',
  resume: 'ادامه', restart: 'شروع دوباره', prerequisites: 'پیش از نماز', learnMore: 'بیشتر بدانید',
  school: 'مذهب فقهی', step: 'گام {n} از {total}', rakahOf: 'رکعت {n} از {total}', preparation: 'آمادگی',
  finalSitting: 'نشست پایانی', next: 'بعدی', back: 'قبلی', repeatStep: 'تکرار گام', finish: 'پایان',
  play: 'پخش', pause: 'توقف', resumeAudio: 'ادامه', replay: 'پخش دوباره', slower: 'آهسته‌تر', normalSpeed: 'سرعت عادی',
  guidance: 'راهنمای صوتی', recitation: 'تلاوت', transliteration: 'آوانگاری', translation: 'ترجمه', action: 'چه باید کرد',
  variations: 'تفاوت مذاهب', sources: 'منابع', practiceMode: 'حالت تمرین', lessonMode: 'حالت درس', voiceCommands: 'فرمان‌های صوتی',
  loading: 'در حال بارگذاری…', retry: 'تلاش دوباره', optional: 'اختیاری', progress: 'پیشرفت درس', complete: 'درس کامل شد',
  reviewNotice: 'در انتظار بازبینی علمی', allPrayers: 'همه نمازها',
  englishOnly: 'به انگلیسی نمایش داده شده — ترجمه بازبینی‌شده به زبان شما هنوز موجود نیست.',
  validity: 'این راهنما برای یادگیری مراحل است و نمی‌تواند درستی نماز را تعیین کند — برای پرسش‌ها به عالمی واجد شرایط مراجعه کنید.',
};

const ps: Dict = {
  title: 'لمونځ زده کړئ', choosePrayer: 'لمونځ وټاکئ', rakahs: '{n} رکعته', startLesson: 'لوست پیل کړئ',
  resume: 'دوام ورکړئ', restart: 'له سره پیل', prerequisites: 'له لمانځه مخکې', learnMore: 'نور معلومات',
  step: 'ګام {n} له {total}', rakahOf: 'رکعت {n} له {total}', next: 'بل', back: 'مخکینی', repeatStep: 'ګام تکرار کړئ',
  play: 'غږول', pause: 'ودرول', replay: 'بیا غږول', slower: 'ورو', normalSpeed: 'عادي سرعت', recitation: 'تلاوت',
  translation: 'ژباړه', sources: 'سرچينې', practiceMode: 'د تمرین حالت', lessonMode: 'د لوست حالت',
  loading: 'بارېږي…', retry: 'بیا هڅه وکړئ', optional: 'اختیاري', complete: 'لوست بشپړ شو', allPrayers: 'ټول لمونځونه',
};

const bn: Dict = {
  title: 'নামাজ শিখুন', choosePrayer: 'একটি নামাজ বেছে নিন', rakahs: '{n} রাকাত', startLesson: 'পাঠ শুরু করুন',
  resume: 'চালিয়ে যান', restart: 'আবার শুরু', prerequisites: 'নামাজের আগে', learnMore: 'আরও জানুন',
  school: 'মাযহাব', step: 'ধাপ {n} / {total}', rakahOf: 'রাকাত {n} / {total}', preparation: 'প্রস্তুতি',
  finalSitting: 'শেষ বৈঠক', next: 'পরবর্তী', back: 'পূর্ববর্তী', repeatStep: 'ধাপটি আবার', finish: 'শেষ',
  play: 'চালান', pause: 'বিরতি', resumeAudio: 'চালিয়ে যান', replay: 'আবার শুনুন', slower: 'ধীরে', normalSpeed: 'স্বাভাবিক গতি',
  guidance: 'কণ্ঠ নির্দেশনা', recitation: 'তিলাওয়াত', transliteration: 'উচ্চারণ', translation: 'অনুবাদ', action: 'কী করবেন',
  sources: 'সূত্র', practiceMode: 'অনুশীলন মোড', lessonMode: 'পাঠ মোড', voiceCommands: 'ভয়েস কমান্ড',
  loading: 'লোড হচ্ছে…', retry: 'আবার চেষ্টা করুন', optional: 'ঐচ্ছিক', progress: 'পাঠের অগ্রগতি', complete: 'পাঠ সম্পন্ন',
  allPrayers: 'সব নামাজ',
};

const hi: Dict = {
  title: 'नमाज़ सीखें', choosePrayer: 'नमाज़ चुनें', rakahs: '{n} रकअत', startLesson: 'पाठ शुरू करें',
  resume: 'जारी रखें', restart: 'फिर से शुरू करें', prerequisites: 'नमाज़ से पहले', learnMore: 'और जानें',
  school: 'फ़िक़्ही मसलक', step: 'चरण {n} / {total}', rakahOf: 'रकअत {n} / {total}', preparation: 'तैयारी',
  finalSitting: 'आख़िरी क़ादा', next: 'अगला', back: 'पिछला', repeatStep: 'चरण दोहराएँ', finish: 'समाप्त',
  play: 'चलाएँ', pause: 'रोकें', resumeAudio: 'जारी रखें', replay: 'फिर सुनें', slower: 'धीमा', normalSpeed: 'सामान्य गति',
  guidance: 'आवाज़ में मार्गदर्शन', recitation: 'तिलावत', transliteration: 'उच्चारण', translation: 'अनुवाद', action: 'क्या करें',
  sources: 'स्रोत', practiceMode: 'अभ्यास मोड', lessonMode: 'पाठ मोड', voiceCommands: 'आवाज़ कमांड',
  loading: 'लोड हो रहा है…', retry: 'फिर कोशिश करें', optional: 'वैकल्पिक', progress: 'पाठ की प्रगति', complete: 'पाठ पूरा',
  allPrayers: 'सभी नमाज़ें',
};

const id: Dict = {
  title: 'Belajar Shalat', choosePrayer: 'Pilih shalat', rakahs: '{n} rakaat', startLesson: 'Mulai pelajaran',
  resume: 'Lanjutkan', restart: 'Mulai ulang', prerequisites: 'Sebelum shalat', learnMore: 'Pelajari lebih lanjut',
  school: 'Mazhab', step: 'Langkah {n} dari {total}', rakahOf: 'Rakaat {n} dari {total}', preparation: 'Persiapan',
  finalSitting: 'Duduk terakhir', next: 'Berikutnya', back: 'Kembali', repeatStep: 'Ulangi langkah', finish: 'Selesai',
  play: 'Putar', pause: 'Jeda', resumeAudio: 'Lanjutkan', replay: 'Putar ulang', slower: 'Lebih lambat', normalSpeed: 'Kecepatan normal',
  guidance: 'Panduan suara', recitation: 'Bacaan', transliteration: 'Transliterasi', translation: 'Terjemahan', action: 'Yang dilakukan',
  variations: 'Perbedaan mazhab', sources: 'Sumber', practiceMode: 'Mode latihan', lessonMode: 'Mode pelajaran', voiceCommands: 'Perintah suara',
  loading: 'Memuat…', retry: 'Coba lagi', optional: 'Opsional', progress: 'Kemajuan pelajaran', complete: 'Pelajaran selesai',
  allPrayers: 'Semua shalat',
};

const ms: Dict = {
  title: 'Belajar Solat', choosePrayer: 'Pilih solat', rakahs: '{n} rakaat', startLesson: 'Mula pelajaran',
  resume: 'Sambung', restart: 'Mula semula', prerequisites: 'Sebelum solat', learnMore: 'Ketahui lebih lanjut',
  school: 'Mazhab', step: 'Langkah {n} daripada {total}', rakahOf: 'Rakaat {n} daripada {total}', preparation: 'Persediaan',
  finalSitting: 'Duduk akhir', next: 'Seterusnya', back: 'Kembali', repeatStep: 'Ulang langkah', finish: 'Selesai',
  play: 'Main', pause: 'Jeda', resumeAudio: 'Sambung', replay: 'Main semula', slower: 'Lebih perlahan', normalSpeed: 'Kelajuan biasa',
  guidance: 'Panduan suara', recitation: 'Bacaan', transliteration: 'Transliterasi', translation: 'Terjemahan', action: 'Apa yang dilakukan',
  sources: 'Sumber', practiceMode: 'Mod latihan', lessonMode: 'Mod pelajaran', voiceCommands: 'Arahan suara',
  loading: 'Memuatkan…', retry: 'Cuba lagi', optional: 'Pilihan', complete: 'Pelajaran selesai', allPrayers: 'Semua solat',
};

const tr: Dict = {
  title: 'Namaz Öğren', choosePrayer: 'Bir namaz seçin', rakahs: '{n} rekât', startLesson: 'Derse başla',
  resume: 'Devam et', restart: 'Baştan başla', prerequisites: 'Namazdan önce', learnMore: 'Daha fazla bilgi',
  school: 'Mezhep', step: 'Adım {n} / {total}', rakahOf: 'Rekât {n} / {total}', preparation: 'Hazırlık',
  finalSitting: 'Son oturuş', next: 'Sonraki', back: 'Geri', repeatStep: 'Adımı tekrarla', finish: 'Bitir',
  play: 'Oynat', pause: 'Duraklat', resumeAudio: 'Devam et', replay: 'Tekrar oynat', slower: 'Daha yavaş', normalSpeed: 'Normal hız',
  guidance: 'Sesli rehber', recitation: 'Okuyuş', transliteration: 'Okunuş', translation: 'Meal', action: 'Ne yapılır',
  variations: 'Mezhep farklılıkları', sources: 'Kaynaklar', practiceMode: 'Pratik modu', lessonMode: 'Ders modu', voiceCommands: 'Sesli komutlar',
  loading: 'Yükleniyor…', retry: 'Tekrar dene', optional: 'İsteğe bağlı', progress: 'Ders ilerlemesi', complete: 'Ders tamamlandı',
  allPrayers: 'Tüm namazlar',
};

const fr: Dict = {
  title: 'Apprendre la prière', choosePrayer: 'Choisissez une prière', rakahs: '{n} rak‘as', startLesson: 'Commencer la leçon',
  resume: 'Reprendre', restart: 'Recommencer', prerequisites: 'Avant de prier', learnMore: 'En savoir plus',
  school: 'École juridique', step: 'Étape {n} sur {total}', rakahOf: 'Rak‘a {n} sur {total}', preparation: 'Préparation',
  finalSitting: 'Position assise finale', next: 'Suivant', back: 'Précédent', repeatStep: 'Répéter l’étape', finish: 'Terminer',
  play: 'Lire', pause: 'Pause', resumeAudio: 'Reprendre', replay: 'Réécouter', slower: 'Plus lent', normalSpeed: 'Vitesse normale',
  guidance: 'Guide vocal', recitation: 'Récitation', transliteration: 'Translittération', translation: 'Traduction', action: 'Que faire',
  variations: 'Différences entre écoles', sources: 'Sources', practiceMode: 'Mode pratique', lessonMode: 'Mode leçon', voiceCommands: 'Commandes vocales',
  loading: 'Chargement…', retry: 'Réessayer', optional: 'Facultatif', progress: 'Progression', complete: 'Leçon terminée',
  allPrayers: 'Toutes les prières',
};

const es: Dict = {
  title: 'Aprender el salat', choosePrayer: 'Elige una oración', rakahs: '{n} rak‘as', startLesson: 'Empezar lección',
  resume: 'Continuar', restart: 'Empezar de nuevo', prerequisites: 'Antes de rezar', learnMore: 'Más información',
  school: 'Escuela jurídica', step: 'Paso {n} de {total}', rakahOf: 'Rak‘a {n} de {total}', preparation: 'Preparación',
  finalSitting: 'Sentada final', next: 'Siguiente', back: 'Anterior', repeatStep: 'Repetir paso', finish: 'Terminar',
  play: 'Reproducir', pause: 'Pausa', resumeAudio: 'Continuar', replay: 'Repetir audio', slower: 'Más lento', normalSpeed: 'Velocidad normal',
  guidance: 'Guía hablada', recitation: 'Recitación', transliteration: 'Transliteración', translation: 'Traducción', action: 'Qué hacer',
  variations: 'Diferencias entre escuelas', sources: 'Fuentes', practiceMode: 'Modo práctica', lessonMode: 'Modo lección', voiceCommands: 'Comandos de voz',
  loading: 'Cargando…', retry: 'Reintentar', optional: 'Opcional', progress: 'Progreso', complete: 'Lección completada',
  allPrayers: 'Todas las oraciones',
};

const pt: Dict = {
  title: 'Aprender a oração', choosePrayer: 'Escolha uma oração', rakahs: '{n} rak‘as', startLesson: 'Iniciar lição',
  resume: 'Continuar', restart: 'Recomeçar', prerequisites: 'Antes de rezar', learnMore: 'Saiba mais',
  step: 'Passo {n} de {total}', rakahOf: 'Rak‘a {n} de {total}', next: 'Próximo', back: 'Anterior', repeatStep: 'Repetir passo',
  play: 'Reproduzir', pause: 'Pausar', replay: 'Ouvir de novo', slower: 'Mais devagar', normalSpeed: 'Velocidade normal',
  recitation: 'Recitação', transliteration: 'Transliteração', translation: 'Tradução', sources: 'Fontes',
  practiceMode: 'Modo prática', lessonMode: 'Modo lição', loading: 'Carregando…', retry: 'Tentar novamente',
  optional: 'Opcional', complete: 'Lição concluída', allPrayers: 'Todas as orações',
};

const it: Dict = {
  title: 'Impara la preghiera', choosePrayer: 'Scegli una preghiera', rakahs: '{n} rak‘a', startLesson: 'Inizia la lezione',
  resume: 'Riprendi', restart: 'Ricomincia', prerequisites: 'Prima di pregare', learnMore: 'Scopri di più',
  step: 'Passo {n} di {total}', rakahOf: 'Rak‘a {n} di {total}', next: 'Avanti', back: 'Indietro', repeatStep: 'Ripeti passo',
  play: 'Riproduci', pause: 'Pausa', replay: 'Riascolta', slower: 'Più lento', normalSpeed: 'Velocità normale',
  recitation: 'Recitazione', transliteration: 'Traslitterazione', translation: 'Traduzione', sources: 'Fonti',
  practiceMode: 'Modalità pratica', lessonMode: 'Modalità lezione', loading: 'Caricamento…', retry: 'Riprova',
  optional: 'Facoltativo', complete: 'Lezione completata', allPrayers: 'Tutte le preghiere',
};

const nl: Dict = {
  title: 'Leer het gebed', choosePrayer: 'Kies een gebed', rakahs: '{n} rak‘ahs', startLesson: 'Les starten',
  resume: 'Hervatten', restart: 'Opnieuw beginnen', prerequisites: 'Voor het gebed', learnMore: 'Meer informatie',
  step: 'Stap {n} van {total}', rakahOf: 'Rak‘ah {n} van {total}', next: 'Volgende', back: 'Vorige', repeatStep: 'Stap herhalen',
  play: 'Afspelen', pause: 'Pauzeren', replay: 'Opnieuw afspelen', slower: 'Langzamer', normalSpeed: 'Normale snelheid',
  recitation: 'Recitatie', transliteration: 'Transliteratie', translation: 'Vertaling', sources: 'Bronnen',
  practiceMode: 'Oefenmodus', lessonMode: 'Lesmodus', loading: 'Laden…', retry: 'Opnieuw proberen',
  optional: 'Optioneel', complete: 'Les voltooid', allPrayers: 'Alle gebeden',
};

const ru: Dict = {
  title: 'Учимся намазу', choosePrayer: 'Выберите намаз', rakahs: 'Ракаатов: {n}', startLesson: 'Начать урок',
  resume: 'Продолжить', restart: 'Начать заново', prerequisites: 'Перед намазом', learnMore: 'Подробнее',
  step: 'Шаг {n} из {total}', rakahOf: 'Ракаат {n} из {total}', next: 'Далее', back: 'Назад', repeatStep: 'Повторить шаг',
  play: 'Воспроизвести', pause: 'Пауза', replay: 'Повторить', slower: 'Медленнее', normalSpeed: 'Обычная скорость',
  recitation: 'Чтение', transliteration: 'Транслитерация', translation: 'Перевод', sources: 'Источники',
  practiceMode: 'Режим практики', lessonMode: 'Режим урока', loading: 'Загрузка…', retry: 'Повторить попытку',
  optional: 'Необязательно', complete: 'Урок завершён', allPrayers: 'Все намазы',
};

const sq: Dict = {
  title: 'Mëso namazin', choosePrayer: 'Zgjidh një namaz', rakahs: '{n} rekate', startLesson: 'Fillo mësimin',
  resume: 'Vazhdo', restart: 'Fillo nga e para', step: 'Hapi {n} nga {total}', rakahOf: 'Rekati {n} nga {total}',
  next: 'Tjetër', back: 'Mbrapa', repeatStep: 'Përsërit hapin', play: 'Luaj', pause: 'Pauzë', replay: 'Riluaj',
  slower: 'Më ngadalë', normalSpeed: 'Shpejtësi normale', translation: 'Përkthimi', sources: 'Burimet',
  loading: 'Duke u ngarkuar…', retry: 'Provo përsëri', complete: 'Mësimi përfundoi', allPrayers: 'Të gjitha namazet',
};

const sw: Dict = {
  title: 'Jifunze Swala', choosePrayer: 'Chagua swala', rakahs: 'Rakaa {n}', startLesson: 'Anza somo',
  resume: 'Endelea', restart: 'Anza upya', step: 'Hatua {n} kati ya {total}', rakahOf: 'Rakaa {n} kati ya {total}',
  next: 'Inayofuata', back: 'Rudi', repeatStep: 'Rudia hatua', play: 'Cheza', pause: 'Sitisha', replay: 'Cheza tena',
  slower: 'Polepole', normalSpeed: 'Kasi ya kawaida', translation: 'Tafsiri', sources: 'Vyanzo',
  loading: 'Inapakia…', retry: 'Jaribu tena', complete: 'Somo limekamilika', allPrayers: 'Swala zote',
};

const th: Dict = {
  title: 'เรียนละหมาด', choosePrayer: 'เลือกการละหมาด', rakahs: '{n} ร็อกอะฮ์', startLesson: 'เริ่มบทเรียน',
  resume: 'ทำต่อ', restart: 'เริ่มใหม่', step: 'ขั้นที่ {n} จาก {total}', rakahOf: 'ร็อกอะฮ์ที่ {n} จาก {total}',
  next: 'ถัดไป', back: 'ย้อนกลับ', repeatStep: 'ทำขั้นนี้ซ้ำ', play: 'เล่น', pause: 'หยุดชั่วคราว', replay: 'เล่นซ้ำ',
  slower: 'ช้าลง', normalSpeed: 'ความเร็วปกติ', translation: 'คำแปล', sources: 'แหล่งอ้างอิง',
  loading: 'กำลังโหลด…', retry: 'ลองอีกครั้ง', complete: 'จบบทเรียนแล้ว', allPrayers: 'การละหมาดทั้งหมด',
};

const vi: Dict = {
  title: 'Học Salah', choosePrayer: 'Chọn lễ nguyện', rakahs: '{n} rak‘ah', startLesson: 'Bắt đầu bài học',
  resume: 'Tiếp tục', restart: 'Bắt đầu lại', step: 'Bước {n}/{total}', rakahOf: 'Rak‘ah {n}/{total}',
  next: 'Tiếp', back: 'Quay lại', repeatStep: 'Lặp lại bước', play: 'Phát', pause: 'Tạm dừng', replay: 'Phát lại',
  slower: 'Chậm hơn', normalSpeed: 'Tốc độ thường', translation: 'Bản dịch', sources: 'Nguồn',
  loading: 'Đang tải…', retry: 'Thử lại', complete: 'Hoàn thành bài học', allPrayers: 'Tất cả lễ nguyện',
};

const zh: Dict = {
  title: '学习礼拜', choosePrayer: '选择礼拜', rakahs: '{n} 拜', startLesson: '开始课程',
  resume: '继续', restart: '重新开始', step: '第 {n} 步，共 {total} 步', rakahOf: '第 {n} 拜，共 {total} 拜',
  next: '下一步', back: '上一步', repeatStep: '重复此步', play: '播放', pause: '暂停', replay: '重播',
  slower: '放慢', normalSpeed: '正常速度', translation: '译文', sources: '出处',
  loading: '加载中…', retry: '重试', complete: '课程完成', allPrayers: '全部礼拜',
};

const DICTS: Partial<Record<UiLocale, Dict>> = {
  en, ar, ur, fa, ps, bn, hi, id, ms, tr, fr, es, pt, it, nl, ru, sq, sw, th, vi, zh,
};

export function namazT(
  locale: UiLocale,
  key: NamazMessageKey,
  vars?: Record<string, string | number>,
): string {
  let text = DICTS[locale]?.[key] ?? en[key];
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replace(`{${name}}`, String(value));
    }
  }
  return text;
}

export const NAMAZ_MESSAGES_EN = en;
