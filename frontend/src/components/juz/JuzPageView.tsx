import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { quranApi, type AyahWithRelations } from '@/lib/api';
import { Header } from '@/components/Header';
import { AyahBlock } from '@/components/reader/AyahBlock';
import { ReaderToolbar } from '@/components/reader/ReaderToolbar';
import { ReadingProgressBar } from '@/components/reader/ReadingProgressBar';
import { PinnedVersesBar } from '@/components/reader/PinnedVersesBar';
import { CompareVerseModal } from '@/components/reader/CompareVerseModal';
import { CleanTranslationUrl } from '@/components/reader/CleanTranslationUrl';
import { ReaderBismillah } from '@/components/reader/ReaderBismillah';
import { StudyPanel } from '@/components/reader/StudyPanel';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import { getSurahArabicName, getSurahMeta, getSurahPath } from '@/lib/surah-meta';
import { getJuzMeta } from '@/lib/juz-meta';
import { resolveTranslations } from '@/lib/translation-preference';
import { parsePositiveInteger, readerPage, needsPageRedirect, surahPageHref } from '@/lib/surah-pagination';
import { absoluteUrl, juzSeo, SITE_NAME } from '@/lib/seo';
import {
  DEFAULT_CONTENT_LOCALE,
  localeConfig,
  localePath,
  type ContentLocale,
} from '@/lib/i18n/content-locales';
import { JUZ_LOCALES, juzPath, juzUiStrings, juzUrCopy } from '@/lib/i18n/juz-copy';
import { getSurahLocalizedName } from '@/lib/i18n/surah-localized-names';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { SiteFooter } from '@/components/SiteFooter';

export interface JuzPageProps {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ page?: string; trans?: string }>;
  /** Set by /ur/juz/[number]; root English omits it. */
  locale?: ContentLocale;
}

export async function juzMetadata({ params, searchParams, locale }: JuzPageProps) {
  const { number } = await params;
  const { page: pageStr } = await searchParams;
  const n = parsePositiveInteger(number);
  if (!n || n > 30) return {};
  const page = readerPage(pageStr);
  return juzSeo(n, page, locale ?? DEFAULT_CONTENT_LOCALE);
}

interface SurahGroup {
  surahId: number;
  surahName: string;
  surahNumber: number;
  ayahs: AyahWithRelations[];
}

export async function renderJuzPage({ params, searchParams, locale }: JuzPageProps) {
  const activeLocale = locale ?? DEFAULT_CONTENT_LOCALE;
  const isUr = activeLocale === 'ur';
  const ui = juzUiStrings(activeLocale);
  const cfg = localeConfig(activeLocale);
  const { number } = await params;
  const { page: pageStr, trans } = await searchParams;
  const juzNumber = parsePositiveInteger(number);
  if (!juzNumber || juzNumber > 30) notFound();

  const page = readerPage(pageStr);
  if (number !== String(juzNumber) || needsPageRedirect(pageStr, page)) {
    const target = surahPageHref(juzPath(activeLocale, juzNumber), page);
    permanentRedirect(trans ? `${target}${page > 1 ? '&' : '?'}trans=${encodeURIComponent(trans)}` : target);
  }
  const limit = 50;
  const effectiveTranslations = resolveTranslations({
    cookieValue: undefined,
    queryTrans: trans,
    ...(isUr ? { defaultSlug: cfg.translationSlug } : {}),
  });

  const rawAyahs = await quranApi
    .ayahsByJuz(juzNumber, { page, limit, translations: effectiveTranslations, words: true })
    .catch(() => [] as AyahWithRelations[]);

  const ayahs: AyahWithRelations[] = Array.isArray(rawAyahs) ? rawAyahs : [];

  if (ayahs.length === 0) {
    notFound();
  }

  const hasMore = ayahs.length === limit;
  const translationCount = effectiveTranslations.split(',').filter(Boolean).length;

  // Group by surah for section headers
  const groupedBySurah: SurahGroup[] = [];
  for (const ayah of ayahs) {
    const last = groupedBySurah[groupedBySurah.length - 1];
    const surahNum = ayah.surah?.number ?? ayah.surahId;
    const surahName = ayah.surah?.nameSimple ?? `Surah ${surahNum}`;
    if (!last || last.surahId !== ayah.surahId) {
      groupedBySurah.push({ surahId: ayah.surahId, surahName, surahNumber: surahNum, ayahs: [ayah] });
    } else {
      last.ayahs.push(ayah);
    }
  }

  const juzMeta = getJuzMeta(juzNumber);
  const urCopy = isUr ? juzUrCopy(juzNumber, page) : null;
  const currentPath = juzPath(activeLocale, juzNumber);
  const surahName = (n: number) =>
    isUr ? getSurahLocalizedName(n, 'ur') : getSurahMeta(n).nameSimple;

  return (
    <div
      lang={isUr ? cfg.hreflang : undefined}
      dir={isUr ? cfg.dir : undefined}
      className="min-h-screen flex flex-col bg-surface text-ink"
    >
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: urCopy ? urCopy.label : `Juz ${juzNumber} (${juzMeta.name})`,
          description: urCopy
            ? urCopy.description
            : `Read Juz ${juzNumber} (${juzMeta.name}) of the Holy Quran from ${juzMeta.startRef} to ${juzMeta.endRef} with Uthmani Arabic text, English translation, and audio.`,
          url: absoluteUrl(currentPath),
          inLanguage: cfg.hreflang,
          isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: absoluteUrl('/') },
        }}
      />
      <Header />

      {/* Sticky sub-header — stays pinned while site Header scrolls away */}
      <div className="sticky top-0 z-40 shrink-0 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/90">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href={localePath(activeLocale, '/')} className="flex items-center gap-1 text-sm text-[var(--accent)] transition-colors hover:text-[var(--accent)]">
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            {ui.home}
          </Link>
          <div className="flex items-center gap-2 text-sm">
            {juzNumber > 1 && (
              <Link href={juzPath(activeLocale, juzNumber - 1)} aria-label={ui.prevJuz} className="rounded px-2 py-1 text-ink-muted transition-colors hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"><span className="rtl:hidden">←</span><span className="hidden rtl:inline">→</span></Link>
            )}
            <span className="font-semibold text-ink">{ui.juzWord} {juzNumber}</span>
            {juzNumber < 30 && (
              <Link href={juzPath(activeLocale, juzNumber + 1)} aria-label={ui.nextJuz} className="rounded px-2 py-1 text-ink-muted transition-colors hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"><span className="rtl:hidden">→</span><span className="hidden rtl:inline">←</span></Link>
            )}
          </div>
          <span className="text-xs text-ink-muted">{ui.of30}</span>
        </div>

        <div className="px-4 pb-3 sm:px-6">
          <ReaderToolbar
            activeTranslationCount={translationCount}
            surahNumber={groupedBySurah[0]?.surahNumber ?? 1}
          />
        </div>
        <ReadingProgressBar />
      </div>

      <PinnedVersesBar />
      <CompareVerseModal />
      <CleanTranslationUrl />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <Breadcrumbs
          items={[
            { name: ui.home, path: localePath(activeLocale, '/') },
            // /ur has no juz index page; the Urdu hub (/ur) carries the 30-para index.
            { name: ui.juz, path: isUr ? localePath(activeLocale, '/') : '/juz' },
            {
              name: page > 1 ? `${ui.juzWord} ${juzNumber} · ${ui.pageLabel(page)}` : `${ui.juzWord} ${juzNumber}`,
              path: page > 1 ? `${currentPath}?page=${page}` : currentPath,
            },
          ]}
        />

        {/* Juz heading */}
        <div className="mb-8 rounded-2xl border border-line bg-surface px-6 py-5 text-center shadow-sm">
          <h1>
            <span lang="ar" dir="rtl" className="block font-arabic text-4xl font-bold text-ink">
              {urCopy ? urCopy.h1Arabic : `الجزء ${juzNumber} · ${juzMeta.nameArabic}`}
            </span>
            <span className="mt-2 block text-base font-semibold text-ink">
              {urCopy
                ? urCopy.h1
                : `Juz ${juzNumber} (${juzMeta.name}) · Part ${juzNumber} of 30${page > 1 ? ` · Page ${page}` : ''}`}
            </span>
          </h1>
          {juzMeta.startRef && juzMeta.endRef && (
            <>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-ink-3">
                {urCopy ? (
                  urCopy.intro
                ) : (
                  <>
                    Juz {juzNumber} (Para {juzNumber}, known as {juzMeta.name}) covers{' '}
                    <strong className="font-medium text-ink-2">{juzMeta.startRef}</strong> through{' '}
                    <strong className="font-medium text-ink-2">{juzMeta.endRef}</strong>. Read online with
                    clear Uthmani Arabic script, English translation, and synchronized verse-by-verse audio.
                  </>
                )}
              </p>
              <nav aria-label={ui.surahsIn(juzNumber)} className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                {Array.from(
                  { length: Math.max(1, juzMeta.endSurah - juzMeta.startSurah + 1) },
                  (_, idx) => juzMeta.startSurah + idx,
                ).map((sNum) => (
                  <Link
                    key={sNum}
                    href={localePath(activeLocale, getSurahPath(sNum))}
                    className="rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-ink-2 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {sNum}. {surahName(sNum)}
                  </Link>
                ))}
              </nav>
            </>
          )}
        </div>

        <div className="lg:flex lg:items-start lg:gap-6">
          <div className="min-w-0 flex-1">
            {/* Ayahs grouped by surah */}
            {groupedBySurah.map((group) => (
              <section key={group.surahId} className="mb-10">
                {/* Surah section divider */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-[var(--border)]" />
                  <Link
                    href={localePath(activeLocale, getSurahPath(group.surahNumber))}
                    className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-sm font-medium text-[var(--fg)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    <span className="font-arabic" dir="rtl" lang="ar">{getSurahArabicName(group.ayahs[0]?.surah?.number ?? 0, group.ayahs[0]?.surah?.nameArabic ?? '')}</span>
                    <span>{isUr ? getSurahLocalizedName(group.surahNumber, 'ur') : group.surahName}</span>
                    <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                  </Link>
                  <div className="h-px flex-1 bg-[var(--border)]" />
                </div>

                {group.ayahs[0]?.number === 1 && group.surahNumber !== 1 && group.surahNumber !== 9 && (
                  <ReaderBismillah locale={activeLocale} />
                )}

                <div className="space-y-3 sm:space-y-0 sm:[&>*:first-child]:rounded-t-2xl sm:[&>*:last-child]:rounded-b-2xl sm:rounded-2xl sm:border sm:border-line sm:bg-surface sm:divide-y sm:divide-line">
                  {group.ayahs.map((ayah) => (
                    <AyahBlock
                      key={ayah.id}
                      ayah={ayah}
                      surahNumber={group.surahNumber}
                      surahName={group.surahName}
                      hasTranslations={translationCount > 0}
                      locale={activeLocale}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
          <StudyPanel />
        </div>

        {/* Pagination */}
        <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
          {page > 1 && (
            <Link href={surahPageHref(currentPath, page - 1)} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--fg)] hover:bg-[var(--ayah-highlight)] transition-colors">
              {ui.previous}
            </Link>
          )}
          {hasMore && (
            <Link href={`${currentPath}?page=${page + 1}`} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--fg)] hover:bg-[var(--ayah-highlight)] transition-colors">
              {ui.next}
            </Link>
          )}
        </nav>

        {/* Next juz */}
        {!hasMore && juzNumber < 30 && (
          <div className="mt-8 text-center">
            <Link href={juzPath(activeLocale, juzNumber + 1)} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-medium text-[var(--fg)] hover:border-[var(--accent)] hover:bg-[var(--ayah-highlight)] transition-all">
              {ui.continueTo(juzNumber + 1)}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        )}

        {/* Language alternates — only languages that actually have a juz page. */}
        <nav aria-label={ui.otherLanguages} className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-ink-muted">
          <span className="font-medium text-ink-3">{ui.otherLanguages}</span>
          {JUZ_LOCALES.filter((loc) => loc !== activeLocale).map((loc) => (
            <Link
              key={loc}
              href={juzPath(loc, juzNumber)}
              prefetch={false}
              hrefLang={localeConfig(loc).hreflang}
              className="rounded border border-line bg-surface px-2.5 py-1 font-medium text-ink-2 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {localeConfig(loc).nativeName}
            </Link>
          ))}
        </nav>
      </main>
      <SiteFooter />
    </div>
  );
}
