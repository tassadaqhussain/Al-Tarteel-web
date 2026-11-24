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

  const [surah, ayah] = await Promise.all([
    quranApi.surah(surahNumber).catch(() => null),
    quranApi
      .ayah(surahNumber, ayahNumber, { translations: effectiveTranslations, words: true })
      .catch(() => null),
  ]);

  if (!ayah) notFound();

  const tafsirs = await quranApi.tafsir(ayah.id).catch(() => []);

  const meta = getSurahMeta(surahNumber, surah?.nameSimple);
  const arabicName = getSurahArabicName(surahNumber, surah?.nameArabic);
  const displayName =
    activeLocale === 'en' ? meta.nameSimple : getSurahLocalizedName(surahNumber, activeLocale);
  const ayahPath = localePath(activeLocale, getAyahPath(surahNumber, ayahNumber));
  const surahPath = localePath(activeLocale, getSurahPath(surahNumber));
  const isAyatulKursi = surahNumber === 2 && ayahNumber === 255;

  const prevHref =
    ayahNumber > 1
      ? localePath(activeLocale, getAyahPath(surahNumber, ayahNumber - 1))
      : surahNumber > 1
        ? localePath(activeLocale, getAyahPath(surahNumber - 1, getSurahAyahCount(surahNumber - 1)))
        : null;
  const nextHref =
    ayahNumber < ayahCount
      ? localePath(activeLocale, getAyahPath(surahNumber, ayahNumber + 1))
      : surahNumber < 114
        ? localePath(activeLocale, getAyahPath(surahNumber + 1, 1))
        : null;

  const relatedAyahs = getRelatedAyahs(surahNumber, ayahNumber, ayahCount);
  const wordsWithMeanings = (ayah.words ?? []).filter(
    (w) => w.textArabic && (w.translation || w.transliteration),
  );
  const fullTransliteration = (ayah.words ?? [])
    .map((w) => w.transliteration?.trim())
    .filter(Boolean)
    .join(' ');

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

        <header className="mt-6 border-b border-line pb-6">
          <p className="font-arabic text-2xl font-bold text-ink sm:text-3xl" dir="rtl" lang="ar">
            {arabicName}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
            {ayahSeo(surahNumber, ayahNumber, { locale: activeLocale }).heading}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Surah {meta.nameSimple} ({meta.meaning}) · Chapter {surahNumber} of 114 · Verse{' '}
            {ayahNumber} of {ayahCount}
            {surah?.revelationPlace
              ? ` · ${surah.revelationPlace.charAt(0).toUpperCase()}${surah.revelationPlace.slice(1)}`
              : ''}
            {ayah.juz ? ` · Juz ${ayah.juz}` : ''}
            {ayah.page ? ` · Page ${ayah.page}` : ''}
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            <Link href={surahPath} className="font-semibold text-brand hover:underline">
              {activeLocale === 'en' ? `Read full Surah ${meta.nameSimple}` : `Read full ${displayName}`}
            </Link>
          </p>
        </header>

        <div className="mt-8">
          <AyahBlock
            ayah={ayah}
            surahNumber={surahNumber}
            surahName={meta.nameSimple}
            hasTranslations={Boolean(ayah.translations?.length)}
            locale={activeLocale}
          />
        </div>

        {fullTransliteration && (
          <section
            aria-label="Transliteration"
            className="mt-6 rounded-xl border border-line bg-surface p-5"
          >
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink-muted">
              Transliteration
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
              Word-by-Word Breakdown ({meta.nameSimple} {surahNumber}:{ayahNumber})
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

        {isAyatulKursi && activeLocale === 'en' && (
          <section
            aria-label="About Ayatul Kursi"
            className="mt-8 space-y-4 rounded-xl border border-line bg-surface p-6"
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
            className="mt-8 space-y-4 rounded-xl border border-line bg-surface p-6"
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

        <section
          aria-label="Related ayahs"
          className="mt-8 rounded-xl border border-line bg-surface p-5"
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
          aria-label="Ayah navigation"
          className="mt-10 flex flex-col items-stretch justify-between gap-4 border-t border-line pt-8 sm:flex-row"
        >
          {prevHref ? (
            <Link
              href={prevHref}
              className="inline-flex items-center gap-2 rounded-[4px] border border-line bg-surface px-4 py-3 text-sm font-semibold text-ink shadow-xs transition hover:border-[var(--accent)]"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous ayah
            </Link>
          ) : (
            <span />
          )}
          {nextHref ? (
            <Link
              href={nextHref}
              className="inline-flex items-center justify-end gap-2 rounded-[4px] border border-line bg-surface px-4 py-3 text-sm font-semibold text-ink shadow-xs transition hover:border-[var(--accent)] sm:ml-auto"
            >
              Next ayah
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : null}
        </nav>

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
