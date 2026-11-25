import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { quranApi } from '@/lib/api';
import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';
import { ReadingTracker } from '@/components/reader/ReadingTracker';
import { DailyMotivationReader } from '@/components/daily/DailyMotivationReader';
import { ArrowRight, Bookmark, ChevronLeft, ChevronRight, RotateCcw, BookMarked, Target } from 'lucide-react';
import { ChapterControls } from '@/components/reader/ChapterControls';
import { ReaderBismillah } from '@/components/reader/ReaderBismillah';
import { SurahAyahFeed } from '@/components/reader/SurahAyahFeed';
import { SurahNavTrigger } from '@/components/reader/SurahNavTrigger';
import { ReaderToolbar } from '@/components/reader/ReaderToolbar';
import { SurahPaginationNav } from '@/components/reader/SurahPaginationNav';
import { SurahLearningPlans } from '@/components/learning/SurahLearningPlans';
import { SurahAboutSection } from '@/components/surah/SurahAboutSection';
import { ReportMistakeButton } from '@/components/ReportMistakeButton';
import { DailyAyahSubscribeCard } from '@/components/lead/DailyAyahSubscribe';
import { PinnedVersesBar } from '@/components/reader/PinnedVersesBar';
import { CompareVerseModal } from '@/components/reader/CompareVerseModal';
import { CleanTranslationUrl } from '@/components/reader/CleanTranslationUrl';
import { StudyPanel } from '@/components/reader/StudyPanel';
import { getAyahPath, getSurahArabicName, getSurahMeta, getSurahPath, SURAH_MEANINGS } from '@/lib/surah-meta';
import { resolveTranslations } from '@/lib/translation-preference';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  CONTENT_LOCALES,
  DEFAULT_CONTENT_LOCALE,
  localeConfig,
  localePath,
  type ContentLocale,
} from '@/lib/i18n/content-locales';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { surahJsonLd, surahSeo } from '@/lib/seo';
import { getSurahLocalizedName } from '@/lib/i18n/surah-localized-names';
import { isTopicLocale, topicPath, topicsForSurah } from '@/lib/topics';
import { getRelatedSurahNumbers, getSurahIntro } from '@/lib/i18n/surah-intros';
import {
  endOfSurahLabel,
  navSurahLabel,
  surahNavAriaLabel,
  startFromBeginningLabel,
  surahBreadcrumbsLabels,
  surahChapterMetaLabel,
  surahHabitCardCopy,
  surahPageHeading,
  surahPageSubtitle,
  surahReaderToolbarMeta,
  surahVerseDirectoryCopy,
} from '@/lib/i18n/surah-ui-strings';
import { READER_BAR_SHELL, READER_SHELL } from '@/components/layout/MainContainer';
import { ReadingProgressBar } from '@/components/reader/ReadingProgressBar';
import { cn } from '@/lib/utils';
import {
  readerPage,
  needsPageRedirect,
  parsePositiveInteger,
  surahPageHref,
  getSurahAyahCount,
  surahSsrLimit,
  surahTotalPages,
  surahVerseRange,
} from '@/lib/surah-pagination';
import type { Surah } from '@/lib/api';

/** Used when the API is briefly unavailable — never treat a valid surah number as 404. */
function localSurahFallback(surahNumber: number): Surah {
  const meta = getSurahMeta(surahNumber);
  return {
    id: surahNumber,
    number: surahNumber,
    nameArabic: meta.nameArabic,
    nameSimple: meta.nameSimple,
    nameComplex: meta.nameSimple,
    revelationPlace: '',
    revelationOrder: null,
    numberOfAyahs: getSurahAyahCount(surahNumber),
  };
}

interface Props {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ page?: string; trans?: string }>;
  /** Set by the locale-prefixed routes (/ur, /ps, /fa); root English omits it. */
  locale?: ContentLocale;
}

export const revalidate = 3600;

/** Prefer static/ISR HTML for crawlers; translation cookie is applied client-side. */
export const dynamic = 'force-static';

export async function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({ number: String(i + 1) }));
}

export async function generateMetadata({ params, searchParams, locale }: Props) {
  const { number } = await params;
  const { page: pageStr } = await searchParams;
  const n = parsePositiveInteger(number);
  if (!n || n > 114) return {};
  const surah = await quranApi.surah(n).catch(() => null);
  const ayahCount = surah?.numberOfAyahs || getSurahAyahCount(n);
  const page = readerPage(pageStr, surahTotalPages(ayahCount));
  const arabicName = getSurahArabicName(n, surah?.nameArabic);
  return surahSeo(n, {
    arabicName,
    ayahCount,
    page,
    locale: locale ?? DEFAULT_CONTENT_LOCALE,
  }).metadata;
}

export default async function SurahPage({ params, searchParams, locale }: Props) {
  const activeLocale = locale ?? DEFAULT_CONTENT_LOCALE;
  const { number } = await params;
  const { page: pageStr, trans } = await searchParams;
  const surahNumber = parsePositiveInteger(number);
  if (!surahNumber || surahNumber > 114) notFound();

  // Do not read cookies() here — it forces fully dynamic/private responses and
  // slows Google crawling. Default + ?trans= SSR; cookie preference via CleanTranslationUrl.
  const effectiveTranslations = resolveTranslations({
    cookieValue: undefined,
    queryTrans: trans,
    defaultSlug: localeConfig(activeLocale).translationSlug,
  });

  const surah = (await quranApi.surah(surahNumber).catch(() => null)) ?? localSurahFallback(surahNumber);

  const ayahCount = surah.numberOfAyahs || getSurahAyahCount(surahNumber);
  const page = readerPage(pageStr, surahTotalPages(ayahCount));
  const limit = Math.max(1, surahSsrLimit(ayahCount, page));
  const totalPages = surahTotalPages(ayahCount);
  const range = surahVerseRange(page, ayahCount);
  const surahPath = localePath(activeLocale, getSurahPath(surahNumber));

  if (needsPageRedirect(pageStr, page)) {
    const target = surahPageHref(surahPath, page);
    permanentRedirect(trans ? `${target}${page > 1 ? '&' : '?'}trans=${encodeURIComponent(trans)}` : target);
  }

  const ayahs = await quranApi
    .ayahsBySurah(surahNumber, {
      page,
      limit,
      translations: effectiveTranslations,
      words: false,
    })
    .catch(() => []);

  // Prev/next come from static metadata (not the API) so the links are always in the server HTML.
  const prevSurah = surahNumber > 1 ? getSurahMeta(surahNumber - 1) : null;
  const nextSurah = surahNumber < 114 ? getSurahMeta(surahNumber + 1) : null;
  const prevSurahNumber = surahNumber > 1 ? surahNumber - 1 : null;
  const nextSurahNumber = surahNumber < 114 ? surahNumber + 1 : null;

  const arabicName = getSurahArabicName(surahNumber, surah.nameArabic);
  const initialAyahs = (Array.isArray(ayahs) ? ayahs : []).map(
    ({ words: _omitWords, ...rest }) => rest,
  );
  const firstAyah = initialAyahs.length > 0 ? initialAyahs[0].number : range.start;
  const translationCount = effectiveTranslations.split(',').filter(Boolean).length;
  const primaryTranslationSlug = effectiveTranslations.split(',')[0]?.trim() || '';
  const primaryTranslatorName =
    initialAyahs
      .flatMap((ayah) => ayah.translations ?? [])
      .find((t) => t.translatorSlug === primaryTranslationSlug && t.translatorName?.trim())
      ?.translatorName?.trim() ||
    initialAyahs[0]?.translations?.[0]?.translatorName?.trim() ||
    null;

  const habitCopy = surahHabitCardCopy(activeLocale);
  const crumbsCopy = surahBreadcrumbsLabels(activeLocale, surahNumber, surah.nameSimple);
  const verseDirCopy = surahVerseDirectoryCopy(activeLocale, surahNumber, surah.nameSimple, ayahCount);
  const toolbarMeta = surahReaderToolbarMeta(
    activeLocale,
    initialAyahs[0]?.page || '610',
    initialAyahs[0]?.juz || '30',
    initialAyahs[0]?.hizb || '60',
  );

  const endOfChapter = (
    <div className="mt-14 border-t border-line pt-10">
      <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
        {prevSurah && prevSurahNumber ? (
          <Link
            href={localePath(activeLocale, getSurahPath(prevSurahNumber))}
            className="flex items-center gap-3 rounded-[4px] border border-line bg-surface px-5 py-4 text-left shadow-xs transition hover:border-[var(--accent)] hover:shadow-md"
          >
            <ChevronLeft className="h-5 w-5 text-ink-faint rtl:rotate-180" />
            <div>
              <p className="text-xs text-ink-muted">{navSurahLabel(activeLocale, 'previous')}</p>
              <p className="font-semibold text-ink">
                {prevSurahNumber}.{' '}
                {activeLocale === 'en'
                  ? prevSurah.nameSimple
                  : getSurahLocalizedName(prevSurahNumber, activeLocale)}
              </p>
            </div>
          </Link>
        ) : <div />}

        <div className="text-center">
          <p className="font-arabic text-2xl font-bold text-ink">{arabicName}</p>
          <p className="mt-1 text-xs text-ink-muted">{endOfSurahLabel(activeLocale, surah.nameSimple, ayahCount, surahNumber)}</p>
        </div>

        {nextSurah && nextSurahNumber ? (
          <Link
            href={localePath(activeLocale, getSurahPath(nextSurahNumber))}
            className="flex items-center gap-3 rounded-[4px] border border-line bg-surface px-5 py-4 text-right shadow-xs transition hover:border-[var(--accent)] hover:shadow-md"
          >
            <div>
              <p className="text-xs text-ink-muted">{navSurahLabel(activeLocale, 'next')}</p>
              <p className="font-semibold text-ink">
                {nextSurahNumber}.{' '}
                {activeLocale === 'en'
                  ? nextSurah.nameSimple
                  : getSurahLocalizedName(nextSurahNumber, activeLocale)}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-ink-faint rtl:rotate-180" />
          </Link>
        ) : <div />}
      </div>

      <section
        aria-label={habitCopy.heading}
        className="mt-10 flex flex-col items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-emerald-900 to-emerald-800 p-6 text-white sm:flex-row"
      >
        <div className="flex items-start gap-4">
          <Target className="mt-0.5 h-6 w-6 shrink-0 text-amber-300" />
          <div>
            <h2 className="text-lg font-bold">{habitCopy.heading}</h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-emerald-50/75">{habitCopy.body}</p>
          </div>
        </div>
        <Link
          href="/reading-goal"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[4px] bg-amber-400 px-4 py-2.5 text-sm font-bold text-emerald-950 hover:bg-amber-300"
        >
          {habitCopy.cta} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </section>
    </div>
  );

  // The root layout is English because it also serves the unprefixed site.
  // Scope the rendered reader to its actual content language for locale URLs;
  // this is present in the server HTML for crawlers and assistive technology.
  const surahIntro = getSurahIntro(surahNumber, activeLocale);
  const relatedSurahs = getRelatedSurahNumbers(surahNumber, 6);
  const relatedTopics = isTopicLocale(activeLocale) ? topicsForSurah(surahNumber) : [];
  const contentLocale = localeConfig(activeLocale);

  return (
    <div
      lang={activeLocale === 'en' ? undefined : contentLocale.hreflang}
      dir={activeLocale === 'en' ? undefined : contentLocale.dir}
      className="min-h-screen flex flex-col bg-surface text-ink"
    >
      <JsonLd
        data={surahJsonLd({
          number: surahNumber,
          name: surah.nameSimple,
          arabic: arabicName,
          meaning: SURAH_MEANINGS[surahNumber],
          ayahCount,
          path: surahPath,
          locale: activeLocale,
          description: surahIntro.summary,
        })}
      />
      <Header />

      {/* Sticky Reader Sub-Header (Quran.com style) — stays pinned while Header scrolls away */}
      <div className="sticky top-0 z-40 shrink-0 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/90">
        <div className={cn(READER_BAR_SHELL, 'flex items-center gap-4 py-0')}>
          <div className="flex min-w-0 flex-1 items-center">
            <SurahNavTrigger surahNumber={surahNumber} surahName={surah.nameSimple} />
          </div>

          <p className="hidden flex-1 items-center justify-center gap-1.5 text-sm text-ink-3 md:flex">
            <Bookmark className="h-4 w-4 text-ink-3" aria-hidden />
            <span className="font-semibold text-ink-3">{toolbarMeta.page}</span>
            <span className="text-ink-faint">{toolbarMeta.juzHizb}</span>
          </p>

          <div className="flex shrink-0 items-center justify-end gap-2 md:flex-1">
            <ReaderToolbar
              activeTranslationCount={translationCount}
              surahNumber={surahNumber}
            />
          </div>
        </div>
        <ReadingProgressBar variant="full" className="h-[3px] bg-transparent" />
      </div>

      <PinnedVersesBar />
      <CompareVerseModal />
      <CleanTranslationUrl />

      <main className={cn(READER_SHELL, 'flex-1 py-4 sm:py-6 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] sm:pb-24')}>
        <Breadcrumbs
          items={[
            { name: crumbsCopy.home, path: localePath(activeLocale, '/') },
            { name: crumbsCopy.surahs, path: activeLocale === 'en' ? '/surahs' : localePath(activeLocale, '/') },
            { name: crumbsCopy.surah, path: surahPath },
            ...(page > 1
              ? [{ name: `${range.start}–${range.end}`, path: `${surahPath}?page=${page}` }]
              : []),
          ]}
        />

        <ReadingTracker
          surahNumber={surahNumber}
          surahName={surah.nameSimple}
          surahNameArabic={arabicName}
          firstAyahNumber={firstAyah}
        />

        {/* Chapter identity and primary reading controls */}
        <article>
        <header className="mt-5 mb-5 rounded-2xl border border-line bg-surface px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                {surahChapterMetaLabel(activeLocale, surahNumber, ayahCount, surah.revelationPlace)}
              </p>
              <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                <h1 className="font-serif text-2xl font-bold text-ink sm:text-3xl">
                  {surahPageHeading(activeLocale, {
                    surahNumber,
                    englishName: surah.nameSimple,
                    page,
                    range,
                  })}
                </h1>
                {activeLocale === 'en' && SURAH_MEANINGS[surahNumber] && (
                  <span className="text-lg font-medium text-ink-muted sm:text-xl">
                    · {SURAH_MEANINGS[surahNumber]}
                  </span>
                )}
              </div>
            </div>

            <span
              className="font-arabic chapter-arabic-name shrink-0 text-4xl font-bold text-ink sm:text-5xl"
              dir="rtl"
              lang="ar"
            >
              {arabicName}
            </span>
          </div>

          <div className="mt-4 border-t border-line-subtle pt-4">
            <ChapterControls
              translationCount={translationCount}
              surahNumber={surahNumber}
              surahName={surah.nameSimple}
              effectiveTranslations={effectiveTranslations}
              primaryTranslatorName={primaryTranslatorName}
            />
          </div>

          <nav
            aria-label={
              activeLocale === 'fa'
                ? 'زبان‌های دیگر این سوره'
                : activeLocale === 'ps'
                  ? 'د دې سورت نورې ژبې'
                  : activeLocale === 'ur'
                    ? 'اس سورت کی دیگر زبانیں'
                    : 'Read this surah in other languages'
            }
            className="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-line-subtle pt-3 text-xs"
          >
            {CONTENT_LOCALES.map((code) => {
              const cfg = localeConfig(code);
              const isCurrent = code === activeLocale;
              return (
                <Link
                  key={code}
                  href={localePath(code, getSurahPath(surahNumber))}
                  hrefLang={cfg.hreflang}
                  lang={cfg.hreflang}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={cn(
                    'rounded-full border px-2.5 py-1 font-medium transition',
                    isCurrent
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                      : 'border-line text-ink-3 hover:border-[var(--accent)] hover:text-[var(--accent)]',
                  )}
                >
                  {cfg.nativeName}
                </Link>
              );
            })}
          </nav>
        </header>

        {/* Server-rendered localized intro block above the ayahs */}
        {page === 1 && (
          <section
            data-surah-intro
            aria-label={surahIntro.heading}
            className="mb-5 rounded-xl border border-line-subtle bg-surface-2/60 px-5 py-4"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
              <span className="font-semibold text-ink">{surahIntro.heading}</span>
              <span aria-hidden>·</span>
              <span>{surahIntro.revelationLabel}</span>
              <span aria-hidden>·</span>
              <span>{surahIntro.ayahsLabel}</span>
              {surahIntro.meaningLabel && (
                <>
                  <span aria-hidden>·</span>
                  <span>{surahIntro.meaningLabel}</span>
                </>
              )}
              {surahIntro.juzNumbers.map((juz) => (
                <Link
                  key={juz}
                  href={`/juz/${juz}`}
                  className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-[11px] font-medium text-[var(--accent)] hover:border-[var(--accent)]"
                >
                  {surahIntro.juzLabelPrefix} {juz}
                </Link>
              ))}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{surahIntro.summary}</p>
          </section>
        )}

        {/* ── Bismillah ────────────────────────────────────────────────── */}
        {surahNumber !== 9 && surahNumber !== 1 && page === 1 && <ReaderBismillah locale={activeLocale} />}

        {page > 1 && (
          <div className="mb-6 flex justify-center">
            <Link
              href={surahPath}
              className="rounded-[4px] border border-line bg-surface px-4 py-2 text-sm text-ink-3 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {startFromBeginningLabel(activeLocale)}
            </Link>
          </div>
        )}

        <section aria-label={`Verses ${range.start}–${range.end} of Surah ${surah.nameSimple}`}>
        <div className="lg:flex lg:items-start lg:gap-6">
          <div className="min-w-0 flex-1">
            <SurahAyahFeed
              surahNumber={surahNumber}
              surahName={surah.nameSimple}
              initialAyahs={initialAyahs}
              initialPage={page}
              totalPages={totalPages}
              translations={effectiveTranslations}
              hasTranslations={translationCount > 0}
              locale={activeLocale}
              endOfChapter={endOfChapter}
            />
          </div>
          <StudyPanel />
        </div>
        </section>

        <nav
          aria-label={verseDirCopy.label}
          className="mt-8 rounded-lg border border-line bg-surface-2/50 px-4 py-3"
        >
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold text-ink-3 hover:text-ink [&::-webkit-details-marker]:hidden">
              <span>{verseDirCopy.label}</span>
              <span className="text-[11px] font-medium text-ink-muted group-open:hidden">
                {verseDirCopy.showAll}
              </span>
              <span className="hidden text-[11px] font-medium text-ink-muted group-open:inline">
                {verseDirCopy.hide}
              </span>
            </summary>
            <div className="mt-2.5 flex flex-wrap gap-1.5 [&_a]:inline-flex [&_a]:min-w-[2rem] [&_a]:items-center [&_a]:justify-center [&_a]:rounded [&_a]:border [&_a]:border-line [&_a]:bg-surface [&_a]:px-1.5 [&_a]:py-0.5 [&_a]:text-xs [&_a]:tabular-nums [&_a]:text-ink-2 [&_a:hover]:border-[var(--accent)] [&_a:hover]:text-[var(--accent)]">
              {Array.from({ length: ayahCount }, (_, i) => {
                const n = i + 1;
                return (
                  <Link
                    key={n}
                    href={localePath(activeLocale, getAyahPath(surahNumber, n))}
                    prefetch={false}
                  >
                    {n}
                  </Link>
                );
              })}
            </div>
          </details>
        </nav>

        <div className="sr-only">
          <SurahPaginationNav
            path={surahPath}
            page={page}
            totalPages={totalPages}
            ayahCount={ayahCount}
            surahName={surah.nameSimple}
            locale={activeLocale}
          />
        </div>

        <SurahAboutSection
          surahNumber={surahNumber}
          surahName={surah.nameSimple}
          locale={activeLocale}
        />

        <nav
          aria-label={
            activeLocale === 'fa'
              ? 'سوره‌های مرتبط'
              : activeLocale === 'ps'
                ? 'اړوند سورتونه'
                : activeLocale === 'ur'
                  ? 'متعلقہ سورتیں'
                  : 'Related Surahs'
          }
          className="mt-8 rounded-2xl border border-line bg-surface p-5"
        >
          <h2 className="text-base font-bold text-ink">
            {activeLocale === 'fa'
              ? 'سوره‌های مرتبط و پربازدید'
              : activeLocale === 'ps'
                ? 'اړوند او مشهور سورتونه'
                : activeLocale === 'ur'
                  ? 'متعلقہ اور معروف سورتیں'
                  : 'Related & Frequently Read Surahs'}
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {relatedSurahs.map((relNum) => {
              const relMeta = getSurahMeta(relNum);
              const relLabel =
                activeLocale === 'en'
                  ? relMeta.nameSimple
                  : getSurahLocalizedName(relNum, activeLocale);
              return (
                <li key={relNum}>
                  <Link
                    href={localePath(activeLocale, getSurahPath(relNum))}
                    className="flex items-center justify-between gap-2 rounded-xl border border-line px-3 py-2 text-sm font-medium text-ink transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    <span className="truncate">
                      {relNum}. {relLabel}
                    </span>
                    <span className="font-arabic text-base text-ink-3" dir="rtl" lang="ar">
                      {getSurahArabicName(relNum, relMeta.nameArabic)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <nav
          aria-label={surahNavAriaLabel(activeLocale)}
          className="mt-8 flex items-stretch justify-between gap-3"
        >
          {prevSurahNumber ? (
            <Link
              href={localePath(activeLocale, getSurahPath(prevSurahNumber))}
              className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm transition hover:border-[var(--accent)]"
            >
              <ChevronLeft className="h-4 w-4 shrink-0 text-ink-faint rtl:rotate-180" aria-hidden />
              <span>
                <span className="block text-xs text-ink-muted">{navSurahLabel(activeLocale, 'previous')}</span>
                <span className="font-semibold text-ink">
                  {prevSurahNumber}.{' '}
                  {activeLocale === 'en' ? getSurahMeta(prevSurahNumber).nameSimple : getSurahLocalizedName(prevSurahNumber, activeLocale)}
                </span>
              </span>
            </Link>
          ) : <span className="flex-1" />}
          {nextSurahNumber ? (
            <Link
              href={localePath(activeLocale, getSurahPath(nextSurahNumber))}
              className="flex flex-1 items-center justify-end gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-end text-sm transition hover:border-[var(--accent)]"
            >
              <span>
                <span className="block text-xs text-ink-muted">{navSurahLabel(activeLocale, 'next')}</span>
                <span className="font-semibold text-ink">
                  {nextSurahNumber}.{' '}
                  {activeLocale === 'en' ? getSurahMeta(nextSurahNumber).nameSimple : getSurahLocalizedName(nextSurahNumber, activeLocale)}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint rtl:rotate-180" aria-hidden />
            </Link>
          ) : <span className="flex-1" />}
        </nav>

        {relatedTopics.length > 0 && isTopicLocale(activeLocale) ? (
          <nav
            aria-label={activeLocale === 'ur' ? 'متعلقہ موضوعات' : 'Related topics'}
            className="mt-6 rounded-2xl border border-line bg-surface p-5"
          >
            <h2 className="text-base font-bold text-ink">
              {activeLocale === 'ur' ? 'متعلقہ موضوعات' : 'Related topics'}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2 text-sm font-medium">
              {relatedTopics.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={topicPath(activeLocale, t.slug)}
                    className="rounded-lg border border-line px-3 py-1.5 text-ink transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {t.copy[activeLocale].label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <SurahLearningPlans
          surahNumber={surahNumber}
          surahName={surah.nameSimple}
          locale={activeLocale}
        />
        <div className="mt-6 flex justify-end">
          <ReportMistakeButton surahNumber={surahNumber} locale={activeLocale} />
        </div>
        <DailyAyahSubscribeCard
          source="surah_page"
          locale={activeLocale}
          className="mt-6"
        />
        </article>

      </main>

      <SiteFooter />
    </div>
  );
}
