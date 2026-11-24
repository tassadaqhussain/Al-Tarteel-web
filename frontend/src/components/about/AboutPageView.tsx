import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Headphones, Languages, ShieldCheck, AlertCircle, Lock } from 'lucide-react';
import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  buildPageMetadata,
  organizationJsonLd,
} from '@/lib/seo';
import { MAINTAINER_INFO } from '@/lib/site-contact';
import {
  DEFAULT_CONTENT_LOCALE,
  localeConfig,
  localePath,
  type ContentLocale,
} from '@/lib/i18n/content-locales';

type AboutCopy = {
  metaTitle: string;
  metaDescription: string;
  homeLabel: string;
  aboutLabel: string;
  badge: string;
  h1: string;
  intro: string;
  whoBuildsTitle: string;
  whoBuildsBody2: string;
  sourcesTitle: string;
  sourcesIntro: string;
  arabicTitle: string;
  translationsTitle: string;
  audioTitle: string;
  tafsirTitle: string;
  accuracyTitle: string;
  accuracyBody: string;
  contactLinkLabel: string;
  privacyTitle: string;
  privacyBody: string;
  browseCta: string;
  contactCta: string;
};

const ABOUT_COPY: Record<ContentLocale, AboutCopy> = {
  en: {
    metaTitle: 'About QuranPilot – Mission, Sources & Accuracy',
    metaDescription:
      'Learn who builds QuranPilot, our verified Quran text, translation, and audio sources, and how to report any mistake in text, translation, or recitation.',
    homeLabel: 'Home',
    aboutLabel: 'About',
    badge: `About ${SITE_NAME}`,
    h1: 'Read, Listen, Memorize, and Understand the Holy Quran',
    intro:
      'QuranPilot is a free, distraction-free web application built to help readers around the world engage with the Holy Quran—whether you are reading a daily surah, listening to verse-by-verse recitation, practicing memorization (Hifz), studying Tajweed rules, or exploring translations in English, Urdu, Pashto, and Persian.',
    whoBuildsTitle: 'Who Builds QuranPilot',
    whoBuildsBody2:
      'Our goal is to keep the Quran accessible on every device without paywalls, intrusive advertising, or unnecessary sign-in barriers, while treating every letter of revelation and its attributions with care and transparency.',
    sourcesTitle: 'Content Sources & Attribution',
    sourcesIntro:
      'We never rewrite, paraphrase, or alter Quranic Arabic text, translations, or reciter attributions. Every text and audio track is sourced from established Quranic datasets and APIs:',
    arabicTitle: 'Arabic Script & Verse Data',
    translationsTitle: 'Quran Translations',
    audioTitle: 'Audio Recitations & Spoken Translations',
    tafsirTitle: 'Tafsir & Hadith References',
    accuracyTitle: 'Accuracy Commitment & Reporting Errors',
    accuracyBody:
      'Accuracy in Quranic script, diacritics, translation text, and audio synchronization is our highest priority. If you ever notice a typographical error, misaligned audio verse, missing diacritic, or questionable attribution anywhere on QuranPilot, please report it via our',
    contactLinkLabel: 'Contact page',
    privacyTitle: 'Privacy Summary',
    privacyBody:
      'You can read the entire Quran, listen to recitations, and study Tajweed on QuranPilot without creating an account. Reading preferences (such as font size, theme, and last read verse) are stored locally in your browser. If you choose to create a free account to sync bookmarks, reading goals, or Hifz progress across devices, we store only the information required to provide that sync and never sell your personal data.',
    browseCta: 'Browse All 114 Surahs',
    contactCta: 'Contact Us',
  },
  ur: {
    metaTitle: 'قرآن پائلٹ کے بارے میں – مقصد، مستند ذرائع اور درستگی',
    metaDescription:
      'جانیں کہ QuranPilot کون بناتا ہے، ہمارے مستند قرآنی متن، تراجم اور آڈیو ذرائع کیا ہیں، اور متن یا ترجمے کی کسی غلطی کی اطلاع کیسے دیں۔',
    homeLabel: 'ہوم',
    aboutLabel: 'تعارف',
    badge: `تعارف ${SITE_NAME}`,
    h1: 'قرآنِ مجید پڑھیں، سنیں، حفظ کریں اور سمجھیں',
    intro:
      'QuranPilot ایک مفت اور سادہ ویب ایپ ہے جو دنیا بھر کے قارئین کو قرآنِ مجید پڑھنے، آیت بہ آیت تلاوت سننے، حفظ (Hifz) کی مشق کرنے، تجوید سیکھنے اور انگریزی، اردو، پشتو اور فارسی تراجم سے استفادہ کرنے میں مدد دیتی ہے۔',
    whoBuildsTitle: 'QuranPilot کون بناتا ہے',
    whoBuildsBody2:
      'ہمارا مقصد قرآنِ مجید کو ہر ڈیوائس پر بغیر کسی فیس، اشتہار یا لازمی لاگ اِن کے دستیاب رکھنا اور وحی کے ہر حرف و نسبت کو پوری احتیاط و امانت کے ساتھ پیش کرنا ہے۔',
    sourcesTitle: 'مستند مواد اور حوالہ جات',
    sourcesIntro:
      'ہم قرآنی عربی متن، تراجم یا قاریوں کے ناموں میں کبھی ردوبدل نہیں کرتے۔ تمام متن اور آڈیو مستند قرآنی ذرائع سے حاصل کیے گئے ہیں:',
    arabicTitle: 'عربی رسم الخط اور آیات کا ڈیٹا',
    translationsTitle: 'قرآنی تراجم',
    audioTitle: 'تلاوت اور ترجمہ آڈیو',
    tafsirTitle: 'تفسیر اور حدیث کے حوالے',
    accuracyTitle: 'درستگی کا عزم اور غلطی کی نشاندہی',
    accuracyBody:
      'قرآنی رسم الخط، اعراب، ترجمے اور آڈیو کی درستگی ہماری اولین ترجیح ہے۔ اگر آپ کو کسی آیت، ترجمے یا تلاوت میں کوئی غلطی نظر آئے تو براہِ کرم ہمارے',
    contactLinkLabel: 'رابطہ صفحہ',
    privacyTitle: 'رازداری (پرائیویسی) کا خلاصہ',
    privacyBody:
      'آپ اکاؤنٹ بنائے بغیر پورا قرآن پڑھ سکتے ہیں، تلاوت سن سکتے ہیں اور تجوید سیکھ سکتے ہیں۔ پڑھنے کی ترجیحات آپ کے براؤزر میں محفوظ رہتی ہیں۔ اگر آپ بُک مارکس یا حفظ کی پیشرفت محفوظ کرنے کے لیے مفت اکاؤنٹ بناتے ہیں تو ہم صرف ضروری معلومات محفوظ کرتے ہیں اور آپ کا ڈیٹا کبھی فروخت نہیں کرتے۔',
    browseCta: 'تمام 114 سورتیں دیکھیں',
    contactCta: 'رابطہ کریں',
  },
  ps: {
    metaTitle: 'د QuranPilot په اړه – موخه، سرچینې او دقت',
    metaDescription:
      'ومومئ چې QuranPilot څوک جوړوي، زموږ د قرآني متن، ژباړو او غږیزو تلاوتونو سرچینې کومې دي، او د تېروتنې راپور څنګه ورکړئ.',
    homeLabel: 'کور',
    aboutLabel: 'زموږ په اړه',
    badge: `د ${SITE_NAME} په اړه`,
    h1: 'قرآن کریم ولولئ، واورئ، حفظ یې کړئ او پرې پوه شئ',
    intro:
      'QuranPilot یوه وړیا ویب اپلیکیشن ده چې د نړۍ لوستونکو ته د قرآن کریم د لوستلو، آیت په آیت تلاوت اورېدو، حفظ تمرین، تجوید زده‌کړې او په انګلیسي، اردو، پښتو او فارسي ژبو د ژباړو اسانتیا برابروي.',
    whoBuildsTitle: 'QuranPilot څوک جوړوي',
    whoBuildsBody2:
      'زموږ موخه دا ده چې قرآن کریم په هر وسیله پرته له فیس، اعلانونو یا جبري ننوتلو څخه د لاسرسي وړ وي او د قرآني متن او نسبتونو بشپړ امانت وساتل شي.',
    sourcesTitle: 'د موادو سرچینې او حوالې',
    sourcesIntro:
      'موږ هېڅکله د قرآن عربي متن، ژباړې یا د قاریانو نسبتونه نه بدلوو. ټول متن او غږونه له معتبرو قرآني سرچینو اخیستل شوي دي:',
    arabicTitle: 'عربي لیکدود او د آیتونو معلومات',
    translationsTitle: 'د قرآن ژباړې',
    audioTitle: 'تلاوت او د ژباړې غږونه',
    tafsirTitle: 'تفسیر او د حدیثو سرچینې',
    accuracyTitle: 'د دقت ژمنه او د تېروتنې راپور',
    accuracyBody:
      'د قرآني متن، اعرابو، ژباړې او غږیز همغږۍ دقت زموږ لومړیتوب دی. که چیرې کومه تېروتنه ووینئ، مهرباني وکړئ زموږ له لارې یې راپور ورکړئ:',
    contactLinkLabel: 'د اړیکې پاڼه',
    privacyTitle: 'د محرمیت لنډیز',
    privacyBody:
      'تاسو کولای شئ پرته له حساب جوړولو پوره قرآن ولولئ، تلاوت واورئ او تجوید زده کړئ. د لوستلو ترتیبات ستاسو په براوزر کې خوندي کېږي، او موږ ستاسو شخصي معلومات هېڅکله نه پلورو.',
    browseCta: 'ټولې ۱۱۴ سورتونه وګورئ',
    contactCta: 'اړیکه ونیسئ',
  },
  fa: {
    metaTitle: 'درباره QuranPilot – هدف، منابع معتبر و دقت محتوا',
    metaDescription:
      'درباره سازندگان QuranPilot، منابع معتبر متن قرآن، ترجمه‌ها و تلاوت‌های صوتی و نحوه گزارش خطاهای احتمالی بخوانید.',
    homeLabel: 'خانه',
    aboutLabel: 'درباره ما',
    badge: `درباره ${SITE_NAME}`,
    h1: 'قرآن کریم را بخوانید، بشنوید، حفظ کنید و درک کنید',
    intro:
      'QuranPilot یک وب‌اپلیکیشن رایگان است که برای کمک به خوانندگان سراسر جهان جهت تلاوت قرآن کریم، شنیدن صوت آیه به آیه، تمرین حفظ، یادگیری تجوید و مطالعه ترجمه‌های انگلیسی، اردو، پشتو و فارسی ساخته شده است.',
    whoBuildsTitle: 'سازنده و نگهدارنده QuranPilot',
    whoBuildsBody2:
      'هدف ما دسترس‌پذیر نگه داشتن قرآن کریم در همه دستگاه‌ها بدون تبلیغات آزاردهنده یا اجبار به ثبت‌نام و حفظ کامل امانت در متن و انتساب‌ها است.',
    sourcesTitle: 'منابع محتوا و انتساب‌ها',
    sourcesIntro:
      'ما هرگز متن عربی قرآن، ترجمه‌ها یا نام قاریان را تغییر نمی‌دهیم. همه متون و فایل‌های صوتی از منابع و پایگاه‌های معتبر قرآنی دریافت می‌شوند:',
    arabicTitle: 'خط عربی و داده‌های آیات',
    translationsTitle: 'ترجمه‌های قرآن',
    audioTitle: 'تلاوت‌ها و ترجمه صوتی',
    tafsirTitle: 'منابع تفسیر و حدیث',
    accuracyTitle: 'تعهد به دقت و گزارش خطا',
    accuracyBody:
      'دقت در خط قرآن، اعراب، ترجمه و هماهنگی صوت اولویت اصلی ماست. اگر در هر بخشی خطایی مشاهده کردید، لطفاً از طریق صفحه تماس گزارش دهید:',
    contactLinkLabel: 'صفحه تماس با ما',
    privacyTitle: 'خلاصه حریم خصوصی',
    privacyBody:
      'شما می‌توانید بدون ساخت حساب کاربری کل قرآن را بخوانید، تلاوت بشنوید و تجوید بیاموزید. تنظیمات مطالعه در مرورگر شما ذخیره می‌شود و اطلاعات شخصی کاربران هرگز فروخته نمی‌شود.',
    browseCta: 'مشاهده همه ۱۱۴ سوره',
    contactCta: 'تماس با ما',
  },
};

export function aboutPageMetadata(locale: ContentLocale = DEFAULT_CONTENT_LOCALE): Metadata {
  const copy = ABOUT_COPY[locale];
  return buildPageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: localePath(locale, '/about'),
    locale,
    alternatePath: '/about',
    keywords: ['About QuranPilot', 'Quran sources', 'Saheeh International', 'Quran audio reciters'],
  });
}

export function AboutPageView({ locale = DEFAULT_CONTENT_LOCALE }: { locale?: ContentLocale }) {
  const copy = ABOUT_COPY[locale];
  const cfg = localeConfig(locale);
  const pageUrl = absoluteUrl(localePath(locale, '/about'));

  const aboutPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: copy.metaTitle,
    url: pageUrl,
    inLanguage: cfg.hreflang,
    description: copy.metaDescription,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntity: organizationJsonLd(),
  };

  const homeHref = localePath(locale, '/');
  const surahsHref = locale === 'en' ? '/surahs' : homeHref;
  const contactHref = localePath(locale, '/contact');

  return (
    <div className="flex min-h-screen flex-col bg-surface-app text-ink">
      <Header />
      <JsonLd data={[aboutPageJsonLd, organizationJsonLd()]} />

      <main
        lang={cfg.hreflang}
        dir={cfg.dir}
        className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:py-12"
      >
        <Breadcrumbs
          items={[
            { name: copy.homeLabel, path: homeHref },
            { name: copy.aboutLabel, path: localePath(locale, '/about') },
          ]}
        />

        <header className="mt-6 border-b border-line pb-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
            {copy.badge}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {copy.h1}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-2">{copy.intro}</p>
        </header>

        {/* Maintainer / E-E-A-T block (editable in frontend/src/lib/site-contact.ts) */}
        <section
          aria-labelledby="who-builds-heading"
          className="mt-8 rounded-2xl border border-line bg-surface p-6 sm:p-7"
        >
          <h2 id="who-builds-heading" className="flex items-center gap-2 text-xl font-bold text-ink">
            <ShieldCheck className="h-5 w-5 text-[var(--accent)]" aria-hidden />
            {copy.whoBuildsTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-ink-2 sm:text-[15px]" dir="ltr" lang="en">
            {MAINTAINER_INFO.summary}
          </p>
          <p className="mt-2 text-sm leading-7 text-ink-3">{copy.whoBuildsBody2}</p>
        </section>

        {/* Content Sources & Attribution */}
        <section
          aria-labelledby="sources-heading"
          className="mt-8 space-y-6 rounded-2xl border border-line bg-surface p-6 sm:p-7"
        >
          <div>
            <h2 id="sources-heading" className="text-xl font-bold text-ink">
              {copy.sourcesTitle}
            </h2>
            <p className="mt-2 text-sm leading-7 text-ink-3">{copy.sourcesIntro}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-line-subtle bg-surface-2/50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                <BookOpen className="h-4 w-4 text-[var(--accent)]" aria-hidden />
                {copy.arabicTitle}
              </h3>
              <ul dir="ltr" lang="en" className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-6 text-ink-2 sm:text-sm">
                <li>
                  Uthmani and IndoPak Arabic Quranic scripts, verse numbering, and Juz/Hizb/Page
                  metadata sourced via the Quran Foundation Content API (
                  <code>apis.quran.foundation</code>).
                </li>
                <li>
                  Word-by-word morphology, transliteration, and meanings loaded from verified
                  word-level Quranic datasets.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-line-subtle bg-surface-2/50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                <Languages className="h-4 w-4 text-[var(--accent)]" aria-hidden />
                {copy.translationsTitle}
              </h3>
              <ul dir="ltr" lang="en" className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-6 text-ink-2 sm:text-sm">
                <li>
                  <strong>English:</strong> Saheeh International (<code>en-sahih-international</code>)
                </li>
                <li>
                  <strong>Urdu (اردو):</strong> Bayan-ul-Quran (<code>bayan-ul-quran</code>)
                </li>
                <li>
                  <strong>Pashto (پښتو):</strong> Zakaria Abulsalam (
                  <code>ps-zakaria-abulsalam-118</code>)
                </li>
                <li>
                  <strong>Persian (فارسی):</strong> Quran Foundation Persian translation (
                  <code>qf-translation-135</code>){/* TODO: verify exact Persian translator name from DB */}
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-line-subtle bg-surface-2/50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                <Headphones className="h-4 w-4 text-[var(--accent)]" aria-hidden />
                {copy.audioTitle}
              </h3>
              <ul dir="ltr" lang="en" className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-6 text-ink-2 sm:text-sm">
                <li>
                  <strong>Arabic Reciters (via EveryAyah.com):</strong> Mahmoud Khalil Al-Husary
                  (Murattal, Mujawwad, Muallim), Abu Bakr Ash-Shaatree, Saad Al-Ghamdi, Ahmed ibn
                  Ali al-Ajamy, Maher Al-Muaiqly, Ali Al-Hudhaify, Muhammad Ayyoub, Abdullah Basfar,
                  Yasser Ad-Dussary, Nasser Al-Qatami, Abdullah Awwad Al-Juhaynee, and Ali Jaber.
                </li>
                <li>
                  <strong>Spoken Translation Audio (via EveryAyah.com):</strong> Ibrahim Walk
                  (English, Saheeh International), Shamshad Ali Khan &amp; Dr. Farhat Hashmi (Urdu),
                  and Makarem Shirazi / Fooladvand (Persian).
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-line-subtle bg-surface-2/50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                <BookOpen className="h-4 w-4 text-[var(--accent)]" aria-hidden />
                {copy.tafsirTitle}
              </h3>
              <ul dir="ltr" lang="en" className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-6 text-ink-2 sm:text-sm">
                <li>
                  <strong>Tafsir:</strong> Official tafsir resources served via the Quran Foundation
                  Content API (<code>/content/api/v4/tafsirs</code>), displayed with source name and
                  author attribution.
                </li>
                <li>
                  <strong>Hadith:</strong> Editorial guides cite specific authentic narrations by
                  collection and hadith number (e.g., Sahih al-Bukhari, Sahih Muslim, Sunan Abi
                  Dawud, Jami at-Tirmidhi). Unverified claims are omitted rather than guessed.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Accuracy & Error Reporting */}
        <section
          aria-labelledby="accuracy-heading"
          className="mt-8 rounded-2xl border border-line bg-surface p-6 sm:p-7"
        >
          <h2 id="accuracy-heading" className="flex items-center gap-2 text-xl font-bold text-ink">
            <AlertCircle className="h-5 w-5 text-[var(--accent)]" aria-hidden />
            {copy.accuracyTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-ink-2 sm:text-[15px]">
            {copy.accuracyBody}{' '}
            <Link href={contactHref} className="font-semibold text-[var(--accent)] hover:underline">
              {copy.contactLinkLabel}
            </Link>
            .
          </p>
        </section>

        {/* Privacy Summary */}
        <section
          aria-labelledby="privacy-heading"
          className="mt-8 rounded-2xl border border-line bg-surface p-6 sm:p-7"
        >
          <h2 id="privacy-heading" className="flex items-center gap-2 text-xl font-bold text-ink">
            <Lock className="h-5 w-5 text-[var(--accent)]" aria-hidden />
            {copy.privacyTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-ink-2 sm:text-[15px]">
            {copy.privacyBody}
            {/* TODO: Link to dedicated /privacy page once published. */}
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={surahsHref}
            className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-brand-contrast transition hover:opacity-90"
          >
            {copy.browseCta}
          </Link>
          <Link
            href={contactHref}
            className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-[var(--accent)]"
          >
            {copy.contactCta}
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
