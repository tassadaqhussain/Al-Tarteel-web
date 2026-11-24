import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { quranApi } from '@/lib/api';
import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';
import { AyahBlock } from '@/components/reader/AyahBlock';
import { CleanTranslationUrl } from '@/components/reader/CleanTranslationUrl';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { SurahLearningPlans } from '@/components/learning/SurahLearningPlans';
import { ReportMistakeButton } from '@/components/ReportMistakeButton';
import { getSurahInfo } from '@/content/surah-info';
import { cleanTranslationText } from '@/lib/clean-translation';
import {
  CONTENT_LOCALES,
  DEFAULT_CONTENT_LOCALE,
  localeConfig,
  localePath,
  type ContentLocale,
} from '@/lib/i18n/content-locales';
import { LOCALE_TEXT_TRANSLATION_SLUG } from '@/lib/i18n/locale-translation-slugs';
import { getSurahLocalizedName } from '@/lib/i18n/surah-localized-names';
import { FAMOUS_AYAHS, ayahJsonLd, ayahSeo, faqJsonLd } from '@/lib/seo';
import {
  getAyahPath,
  getSurahArabicName,
  getSurahMeta,
  getSurahPath,
  getSurahSlug,
} from '@/lib/surah-meta';
import { getSurahAyahCount } from '@/lib/surah-pagination';
import { resolveTranslations } from '@/lib/translation-preference';
import { READER_SHELL } from '@/components/layout/MainContainer';

export type AyahPageProps = {
  surahNumber: number;
  ayahNumber: number;
  searchParams: Promise<{ trans?: string }>;
  locale?: ContentLocale;
};

export const revalidate = 3600;
export const dynamic = 'force-static';

export function ayahStaticParams() {
  return FAMOUS_AYAHS.map(({ surah, ayah }) => ({
    slug: getSurahSlug(surah),
    ayah: String(ayah),
  }));
}

const AYATUL_KURSI_FAQS = [
  {
    question: 'Which surah and verse number is Ayatul Kursi?',
    answer:
      'Ayatul Kursi (The Verse of the Throne) is verse 255 of Surah Al-Baqarah (2:255), located near the beginning of Juz 3.',
  },
  {
    question: 'What is the virtue of Ayatul Kursi in authentic hadith?',
    answer:
      'In Sahih Muslim (810), the Prophet Muhammad ﷺ asked Ubayy ibn Ka\'b which verse in the Book of Allah is the greatest; Ubayy replied Ayatul Kursi, and the Prophet ﷺ affirmed his answer.',
  },
  {
    question: 'When is Ayatul Kursi commonly recited?',
    answer:
      'Authentic narrations mention reciting Ayatul Kursi before sleeping for protection through the night (Sahih al-Bukhari 2311), and it is widely recited after obligatory prayers and in morning and evening remembrances.',
  },
  {
    question: 'What is the main theme of Ayatul Kursi?',
    answer:
      'Ayatul Kursi affirms Allah\'s absolute oneness, eternal life (Al-Hayy), self-subsistence (Al-Qayyum), all-encompassing knowledge, and effortless sovereignty over the heavens and the earth.',
  },
];

function getRelatedAyahs(
  surahNumber: number,
  ayahNumber: number,
  ayahCount: number,
): Array<{ surah: number; ayah: number; label: string }> {
  const curated: Record<string, Array<{ surah: number; ayah: number; label: string }>> = {
    '2:255': [
      { surah: 2, ayah: 285, label: 'Al-Baqarah 2:285 (Amanar-Rasul)' },
      { surah: 2, ayah: 286, label: 'Al-Baqarah 2:286 (Closing Supplication)' },
      { surah: 3, ayah: 18, label: 'Ali \'Imran 3:18 (Shahada Verse)' },
      { surah: 24, ayah: 35, label: 'An-Nur 24:35 (Light Verse)' },
      { surah: 112, ayah: 1, label: 'Al-Ikhlas 112:1 (Pure Monotheism)' },
    ],
    '67:1': [
      { surah: 67, ayah: 2, label: 'Al-Mulk 67:2' },
      { surah: 67, ayah: 3, label: 'Al-Mulk 67:3' },
      { surah: 2, ayah: 255, label: 'Al-Baqarah 2:255 (Ayatul Kursi)' },
      { surah: 18, ayah: 1, label: 'Al-Kahf 18:1' },
    ],
  };

  const key = `${surahNumber}:${ayahNumber}`;
  if (curated[key]) return curated[key];

  const picks: Array<{ surah: number; ayah: number; label: string }> = [];
  const seen = new Set<string>([key]);
  const add = (s: number, a: number, customLabel?: string) => {
    const k = `${s}:${a}`;
    if (seen.has(k) || a < 1 || a > getSurahAyahCount(s)) return;
    seen.add(k);
    const m = getSurahMeta(s);
    picks.push({ surah: s, ayah: a, label: customLabel ?? `${m.nameSimple} ${s}:${a}` });
  };

  if (ayahNumber > 1) add(surahNumber, 1);
  if (ayahNumber + 1 <= ayahCount) add(surahNumber, ayahNumber + 1);
  if (ayahNumber + 2 <= ayahCount) add(surahNumber, ayahNumber + 2);
  add(2, 255, 'Ayatul Kursi (2:255)');
  add(1, 1, 'Al-Fatihah 1:1');
  add(112, 1, 'Al-Ikhlas 112:1');

  return picks.slice(0, 5);
}

function positionLabel(ayahNumber: number, ayahCount: number): string {
  if (ayahNumber === 1) return 'opening verse';
  if (ayahNumber === ayahCount) return 'closing verse';
  const ratio = ayahNumber / ayahCount;
  if (ratio <= 0.25) return 'early passage';
  if (ratio >= 0.75) return 'closing passage';
  return 'central passage';
}

function truncateText(text: string, maxLen = 220): string {
  const cleaned = cleanTranslationText(text).trim();
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen).replace(/\s+\S*$/, '')}…`;
}

export async function renderAyahPage({
  surahNumber,
  ayahNumber,
  searchParams,
  locale,
}: AyahPageProps) {
  const activeLocale = locale ?? DEFAULT_CONTENT_LOCALE;
  const { trans } = await searchParams;

  const ayahCount = getSurahAyahCount(surahNumber);
  if (ayahNumber < 1 || ayahNumber > ayahCount) notFound();

  const defaultTranslations =
    activeLocale === 'en' && !trans
      ? `${LOCALE_TEXT_TRANSLATION_SLUG.en},${LOCALE_TEXT_TRANSLATION_SLUG.ur}`
      : localeConfig(activeLocale).translationSlug;

  const effectiveTranslations = resolveTranslations({
    cookieValue: undefined,
    queryTrans: trans,
    defaultSlug: defaultTranslations,
  });

  const prevRef =
    ayahNumber > 1
      ? { surah: surahNumber, ayah: ayahNumber - 1 }
      : surahNumber > 1
        ? { surah: surahNumber - 1, ayah: getSurahAyahCount(surahNumber - 1) }
        : null;
  const nextRef =
    ayahNumber < ayahCount
      ? { surah: surahNumber, ayah: ayahNumber + 1 }
      : surahNumber < 114
        ? { surah: surahNumber + 1, ayah: 1 }
        : null;

  const snippetTranslation = localeConfig(activeLocale).translationSlug;

  const [surah, fetchedAyah, prevAyahData, nextAyahData] = await Promise.all([
    quranApi.surah(surahNumber).catch(() => null),
    quranApi
      .ayah(surahNumber, ayahNumber, { translations: effectiveTranslations, words: true })
      .catch(() => null),
    prevRef
      ? quranApi
          .ayah(prevRef.surah, prevRef.ayah, { translations: snippetTranslation, words: false })
          .catch(() => null)
      : Promise.resolve(null),
    nextRef
      ? quranApi
          .ayah(nextRef.surah, nextRef.ayah, { translations: snippetTranslation, words: false })
          .catch(() => null)
      : Promise.resolve(null),
  ]);

  // Never treat a valid surah:ayah pair as 404 if the API is temporarily unreachable.
  const ayah = fetchedAyah ?? {
    id: surahNumber * 1000 + ayahNumber,
    surahId: surahNumber,
    number: ayahNumber,
    numberInQuran: 0,
    ruku: 0,
    textArabic: '',
    textUthmani: '',
    textSimple: '',
    juz: 0,
    hizb: 0,
    page: 0,
    translations: [],
    words: [],
  };

  const tafsirs = fetchedAyah ? await quranApi.tafsir(ayah.id).catch(() => []) : [];

  const meta = getSurahMeta(surahNumber, surah?.nameSimple);
  const arabicName = getSurahArabicName(surahNumber, surah?.nameArabic);
  const displayName =
    activeLocale === 'en' ? meta.nameSimple : getSurahLocalizedName(surahNumber, activeLocale);
  const ayahPath = localePath(activeLocale, getAyahPath(surahNumber, ayahNumber));
  const surahPath = localePath(activeLocale, getSurahPath(surahNumber));
  const isAyatulKursi = surahNumber === 2 && ayahNumber === 255;
  const surahInfo = getSurahInfo(surahNumber, 'en');

  const revelationLabel =
    surahInfo?.revelationPeriod ||
    (surah?.revelationPlace
      ? `${surah.revelationPlace.charAt(0).toUpperCase()}${surah.revelationPlace.slice(1)}`
      : null);

  const prevHref = prevRef ? localePath(activeLocale, getAyahPath(prevRef.surah, prevRef.ayah)) : null;
  const nextHref = nextRef ? localePath(activeLocale, getAyahPath(nextRef.surah, nextRef.ayah)) : null;
  const prevSurahMeta = prevRef ? getSurahMeta(prevRef.surah) : null;
  const nextSurahMeta = nextRef ? getSurahMeta(nextRef.surah) : null;

  const relatedAyahs = getRelatedAyahs(surahNumber, ayahNumber, ayahCount);
  const wordsWithMeanings = (ayah.words ?? []).filter(
    (w) => w.textArabic && (w.translation || w.transliteration),
  );
  const fullTransliteration = (ayah.words ?? [])
    .map((w) => w.transliteration?.trim())
    .filter(Boolean)
    .join(' ');

  const englishTranslation = (ayah.translations ?? []).find(
    (tr) => tr.translatorSlug === LOCALE_TEXT_TRANSLATION_SLUG.en || tr.language === 'en',
  );
  const urduTranslation = (ayah.translations ?? []).find(
    (tr) => tr.translatorSlug === LOCALE_TEXT_TRANSLATION_SLUG.ur || tr.language === 'ur',
  );

  const jsonLd = ayahJsonLd({
    surahNumber,
    ayahNumber,
    surahName: meta.nameSimple,
    path: getAyahPath(surahNumber, ayahNumber),
    locale: activeLocale,
  });

  const structuredData =
    isAyatulKursi && activeLocale === 'en'
      ? [jsonLd, faqJsonLd(AYATUL_KURSI_FAQS)]
      : jsonLd;

  return (
    <div className="flex min-h-screen flex-col bg-surface-app">
      <Header />
      <CleanTranslationUrl />
      <JsonLd data={structuredData} />
      <main
        lang={localeConfig(activeLocale).hreflang}
        dir={localeConfig(activeLocale).dir}
        className={`${READER_SHELL} flex-1 py-6 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] sm:py-8`}
      >
        <Breadcrumbs
          items={[
            { name: 'Home', path: localePath(activeLocale, '/') },
            { name: 'Quran', path: activeLocale === 'en' ? '/surahs' : localePath(activeLocale, '/') },
            { name: displayName, path: surahPath },
            { name: `Ayah ${ayahNumber}`, path: ayahPath },
          ]}
        />

        <div className="mt-6 border-b border-line pb-6">
          <p className="font-arabic text-2xl font-bold text-ink sm:text-3xl" dir="rtl" lang="ar">
            {arabicName}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
            {ayahSeo(surahNumber, ayahNumber, { locale: activeLocale }).heading}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Surah {meta.nameSimple} ({meta.meaning}) · Chapter {surahNumber} of 114 · Verse{' '}
            {ayahNumber} of {ayahCount}
            {revelationLabel ? ` · ${revelationLabel}` : ''}
            {ayah.juz ? ` · Juz ${ayah.juz}` : ''}
            {ayah.page ? ` · Mushaf Page ${ayah.page}` : ''}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ink-muted">
            <Link href={surahPath} className="font-semibold text-brand hover:underline">
              {activeLocale === 'en' ? `Read full Surah ${meta.nameSimple}` : `Read full ${displayName}`}
            </Link>
            <ReportMistakeButton surahNumber={surahNumber} ayahNumber={ayahNumber} />
          </div>
        </div>

        <div className="mt-8">
          <AyahBlock
            ayah={ayah}
            surahNumber={surahNumber}
            surahName={meta.nameSimple}
            hasTranslations={Boolean(ayah.translations?.length)}
            locale={activeLocale}
          />
        </div>

        {/* Server-rendered parallel translations (English & Urdu) */}
        {(englishTranslation?.text || urduTranslation?.text) && (
          <section
            aria-label={`Translations of Surah ${meta.nameSimple} ${surahNumber}:${ayahNumber}`}
            className="mt-6 space-y-4 rounded-xl border border-line bg-surface p-5 sm:p-6"
          >
            <h2 className="text-base font-bold text-ink">
              Translations of Surah {meta.nameSimple} Ayah {ayahNumber} ({surahNumber}:{ayahNumber})
            </h2>
            {englishTranslation?.text && (
              <div className="rounded-lg border border-line-subtle bg-surface-2/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  English Translation — {englishTranslation.translatorName || 'Saheeh International'}
                </p>
                <p className="mt-2 text-sm leading-7 text-ink-2 sm:text-base">
                  {cleanTranslationText(englishTranslation.text)}
                </p>
              </div>
            )}
            {urduTranslation?.text && (
              <div className="rounded-lg border border-line-subtle bg-surface-2/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Urdu Translation (اردو ترجمہ) — {urduTranslation.translatorName || 'Bayan-ul-Quran'}
                </p>
                <p
                  dir="rtl"
                  lang="ur"
                  className="mt-2 text-right text-base leading-9 text-ink-2 sm:text-lg"
                >
                  {cleanTranslationText(urduTranslation.text)}
                </p>
              </div>
            )}
          </section>
        )}

        {fullTransliteration && (
          <section
            aria-label="Transliteration"
            className="mt-6 rounded-xl border border-line bg-surface p-5"
          >
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink-muted">
              Arabic Transliteration ({meta.nameSimple} {surahNumber}:{ayahNumber})
            </h2>
            <p className="mt-2 text-sm leading-7 text-ink-2 sm:text-base">{fullTransliteration}</p>
          </section>
        )}

        {wordsWithMeanings.length > 0 && (
          <section
            aria-label={`Word by word meaning for ${meta.nameSimple} ${surahNumber}:${ayahNumber}`}
            className="mt-6 rounded-xl border border-line bg-surface p-5"
          >
            <h2 className="text-base font-bold text-ink">
              Word-by-Word Meaning ({meta.nameSimple} {surahNumber}:{ayahNumber})
            </h2>
            <div className="mt-3 flex flex-wrap gap-2" dir="rtl">
              {wordsWithMeanings.map((word) => (
                <div
                  key={word.id}
                  className="flex flex-col items-center rounded-lg border border-line-subtle bg-surface-2/50 px-3 py-2 text-center"
                >
                  <span className="font-arabic text-xl text-ink" lang="ar">
                    {word.textArabic}
                  </span>
                  {word.transliteration && (
                    <span className="mt-1 text-[11px] font-medium text-ink-muted" dir="ltr">
                      {word.transliteration}
                    </span>
                  )}
                  {word.translation && (
                    <span className="mt-0.5 text-xs text-ink-2" dir="ltr">
                      {word.translation}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Server-rendered Verse & Surah Context */}
        <section
          aria-label={`Context for Surah ${meta.nameSimple} Ayah ${ayahNumber}`}
          className="mt-6 space-y-3 rounded-xl border border-line bg-surface p-5 sm:p-6"
        >
          <h2 className="text-base font-bold text-ink">
            Context: Surah {meta.nameSimple} ({meta.meaning}) — Ayah {ayahNumber}
          </h2>
          <p className="text-sm leading-7 text-ink-2">
            Surah {meta.nameSimple} ({arabicName}, meaning &ldquo;{meta.meaning}&rdquo;) is chapter{' '}
            {surahNumber} of the 114 chapters of the Holy Quran
            {revelationLabel ? `, a ${revelationLabel} surah` : ''} containing {ayahCount}{' '}
            {ayahCount === 1 ? 'verse' : 'verses'}. Ayah {ayahNumber} ({surahNumber}:{ayahNumber})
            appears in the {positionLabel(ayahNumber, ayahCount)} of the chapter
            {ayah.juz ? ` within Juz ${ayah.juz}` : ''}
            {ayah.page ? ` on Mushaf page ${ayah.page}` : ''}.
          </p>
          {surahInfo?.overview?.[0] ? (
            <p className="text-sm leading-7 text-ink-2">{surahInfo.overview[0]}</p>
          ) : (
            <p className="text-sm leading-7 text-ink-2">
              On QuranPilot you can read Surah {meta.nameSimple} Ayah {ayahNumber} in clear Uthmani
              Arabic script alongside English and Urdu translations, listen to verse-by-verse audio
              from trusted reciters, inspect word-by-word meanings, and continue reading the
              surrounding verses in full context.
            </p>
          )}
          {surahInfo?.mainThemes?.length ? (
            <div className="pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Main Themes of Surah {meta.nameSimple}
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-2">
                {surahInfo.mainThemes.map((theme, idx) => (
                  <li key={idx}>{theme}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm leading-7 text-ink-3">
              To understand Ayah {ayahNumber} in its broader flow, read the preceding and following
              verses below or open the complete{' '}
              <Link href={surahPath} className="font-semibold text-[var(--accent)] hover:underline">
                Surah {meta.nameSimple}
              </Link>{' '}
              chapter page. You can also explore{' '}
              <Link href="/tajweed" className="font-semibold text-[var(--accent)] hover:underline">
                Tajweed pronunciation rules
              </Link>{' '}
              and{' '}
              <Link href="/learning-plans" className="font-semibold text-[var(--accent)] hover:underline">
                guided Quran learning plans
              </Link>{' '}
              to build a consistent daily study habit.
            </p>
          )}
        </section>

        {isAyatulKursi && activeLocale === 'en' && (
          <section
            aria-label="About Ayatul Kursi"
            className="mt-6 space-y-4 rounded-xl border border-line bg-surface p-6"
          >
            <h2 className="text-lg font-bold text-ink">
              About Ayatul Kursi (Surah Al-Baqarah 2:255)
            </h2>
            <p className="text-sm leading-7 text-ink-2">
              Ayatul Kursi—the Verse of the Throne—is the 255th verse of Surah Al-Baqarah and is
              recognized in authentic prophetic tradition as the greatest verse in the Holy Quran
              (Sahih Muslim 810). It expresses the majesty of Allah through His eternal life
              (Al-Hayy), self-subsistence (Al-Qayyum), freedom from fatigue or sleep, all-encompassing
              knowledge, and complete sovereignty over the heavens and the earth.
            </p>
            <dl className="space-y-3 pt-2">
              {AYATUL_KURSI_FAQS.map((faq, idx) => (
                <div key={idx} className="rounded-lg border border-line-subtle bg-surface-2/40 p-4">
                  <dt className="text-sm font-semibold text-ink">{faq.question}</dt>
                  <dd className="mt-1 text-sm leading-6 text-ink-2">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {tafsirs.length > 0 && (
          <section
            aria-label={`Tafsir for ${meta.nameSimple} ${surahNumber}:${ayahNumber}`}
            className="mt-6 space-y-4 rounded-xl border border-line bg-surface p-6"
          >
            <h2 className="text-lg font-bold text-ink">
              Tafsir &amp; Commentary ({meta.nameSimple} {surahNumber}:{ayahNumber})
            </h2>
            <div className="space-y-4">
              {tafsirs.slice(0, 2).map((item) => (
                <article key={item.id} className="rounded-lg border border-line/70 bg-surface-2/40 p-4">
                  <h3 className="text-sm font-semibold text-ink">{item.source.name}</h3>
                  {item.source.author && (
                    <p className="mt-0.5 text-xs text-ink-faint">{item.source.author}</p>
                  )}
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-ink-2">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Surrounding Verses (Previous & Next Ayah with Arabic + Translation snippets) */}
        {(prevRef || nextRef) && (
          <section
            aria-label="Surrounding verses"
            className="mt-6 space-y-3 rounded-xl border border-line bg-surface p-5 sm:p-6"
          >
            <h2 className="text-base font-bold text-ink">Ayah Before &amp; After</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {prevRef && prevHref && prevSurahMeta ? (
                <div className="flex flex-col justify-between rounded-xl border border-line-subtle bg-surface-2/40 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Previous Ayah · {prevSurahMeta.nameSimple} {prevRef.surah}:{prevRef.ayah}
                    </p>
                    {prevAyahData?.textUthmani || prevAyahData?.textArabic ? (
                      <p
                        dir="rtl"
                        lang="ar"
                        className="mt-2 font-arabic text-lg leading-loose text-ink"
                      >
                        {prevAyahData.textUthmani || prevAyahData.textArabic}
                      </p>
                    ) : null}
                    {prevAyahData?.translations?.[0]?.text ? (
                      <p className="mt-1.5 text-xs leading-6 text-ink-2 sm:text-sm">
                        {truncateText(prevAyahData.translations[0].text)}
                      </p>
                    ) : (
                      <p className="mt-1.5 text-xs leading-6 text-ink-muted">
                        Read Surah {prevSurahMeta.nameSimple} verse {prevRef.ayah} ({prevRef.surah}:
                        {prevRef.ayah}) with Arabic text, translation, and audio.
                      </p>
                    )}
                  </div>
                  <Link
                    href={prevHref}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
                    Read {prevSurahMeta.nameSimple} {prevRef.surah}:{prevRef.ayah}
                  </Link>
                </div>
              ) : (
                <div />
              )}

              {nextRef && nextHref && nextSurahMeta ? (
                <div className="flex flex-col justify-between rounded-xl border border-line-subtle bg-surface-2/40 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Next Ayah · {nextSurahMeta.nameSimple} {nextRef.surah}:{nextRef.ayah}
                    </p>
                    {nextAyahData?.textUthmani || nextAyahData?.textArabic ? (
                      <p
                        dir="rtl"
                        lang="ar"
                        className="mt-2 font-arabic text-lg leading-loose text-ink"
                      >
                        {nextAyahData.textUthmani || nextAyahData.textArabic}
                      </p>
                    ) : null}
                    {nextAyahData?.translations?.[0]?.text ? (
                      <p className="mt-1.5 text-xs leading-6 text-ink-2 sm:text-sm">
                        {truncateText(nextAyahData.translations[0].text)}
                      </p>
                    ) : (
                      <p className="mt-1.5 text-xs leading-6 text-ink-muted">
                        Continue to Surah {nextSurahMeta.nameSimple} verse {nextRef.ayah} (
                        {nextRef.surah}:{nextRef.ayah}) with Arabic text, translation, and audio.
                      </p>
                    )}
                  </div>
                  <Link
                    href={nextHref}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
                  >
                    Read {nextSurahMeta.nameSimple} {nextRef.surah}:{nextRef.ayah}
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              ) : null}
            </div>
          </section>
        )}

        <section
          aria-label="Related ayahs"
          className="mt-6 rounded-xl border border-line bg-surface p-5"
        >
          <h2 className="text-base font-bold text-ink">Related Ayahs to Explore</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {relatedAyahs.map((rel) => (
              <Link
                key={`${rel.surah}:${rel.ayah}`}
                href={localePath(activeLocale, getAyahPath(rel.surah, rel.ayah))}
                className="rounded-lg border border-line bg-surface-2/50 px-3 py-1.5 text-xs font-medium text-ink-2 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {rel.label}
              </Link>
            ))}
          </div>
        </section>

        <SurahLearningPlans surahNumber={surahNumber} surahName={meta.nameSimple} />

        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
          <Link href={surahPath} className="font-medium text-[var(--accent)] hover:underline">
            Back to Surah {meta.nameSimple}
          </Link>
          {ayah.juz ? (
            <>
              <span aria-hidden>·</span>
              <Link href={`/juz/${ayah.juz}`} className="font-medium text-[var(--accent)] hover:underline">
                Juz {ayah.juz}
              </Link>
            </>
          ) : null}
          <span aria-hidden>·</span>
          <Link href="/learning-plans" className="font-medium text-[var(--accent)] hover:underline">
            Explore Learning Plans
          </Link>
        </div>

        <nav
          aria-label="Other languages for this ayah"
          className="mt-6 flex flex-wrap items-center gap-2 text-xs text-ink-muted"
        >
          <span className="font-medium text-ink-3">Read in other languages:</span>
          {CONTENT_LOCALES.filter((loc) => loc !== activeLocale).map((loc) => {
            const cfg = localeConfig(loc);
            return (
              <Link
                key={loc}
                href={localePath(loc, getAyahPath(surahNumber, ayahNumber))}
                prefetch={false}
                hrefLang={cfg.hreflang}
                className="rounded border border-line bg-surface px-2.5 py-1 font-medium text-ink-2 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {cfg.nativeName}
              </Link>
            );
          })}
        </nav>
      </main>
      <SiteFooter />
    </div>
  );
}
