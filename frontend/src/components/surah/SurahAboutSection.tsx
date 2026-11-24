import Link from 'next/link';
import { BookOpen, ChevronLeft, ChevronRight, HelpCircle, Sparkles } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqJsonLd } from '@/lib/seo';
import { getSurahInfo } from '@/content/surah-info';
import { getSurahMeta, getSurahPath } from '@/lib/surah-meta';
import { localeConfig, localePath, type ContentLocale } from '@/lib/i18n/content-locales';

interface Props {
  surahNumber: number;
  surahName: string;
  locale: ContentLocale;
}

const SECTION_LABELS: Record<
  ContentLocale,
  { aboutBadge: string; aboutPrefix: string; themes: string; virtues: string; faq: string }
> = {
  en: {
    aboutBadge: 'About this Surah',
    aboutPrefix: 'About Surah',
    themes: 'Main Themes',
    virtues: 'Authentic Virtues & Narrations',
    faq: 'Frequently Asked Questions',
  },
  ur: {
    aboutBadge: 'اس سورت کے بارے میں',
    aboutPrefix: 'تعارفِ سورہ',
    themes: 'بنیادی مضامین',
    virtues: 'مستند فضائل و روایات',
    faq: 'اکثر پوچھے جانے والے سوالات',
  },
  ps: {
    aboutBadge: 'د دې سورت په اړه',
    aboutPrefix: 'د سورت پېژندنه',
    themes: 'اصلي موضوعات',
    virtues: 'مستند فضائل',
    faq: 'مکرر پوښتنې',
  },
  fa: {
    aboutBadge: 'درباره این سوره',
    aboutPrefix: 'معرفی سوره',
    themes: 'مضامین اصلی',
    virtues: 'فضائل معتبر',
    faq: 'پرسش‌های متداول',
  },
};

export function SurahAboutSection({ surahNumber, surahName, locale }: Props) {
  const info = getSurahInfo(surahNumber, locale);
  if (!info) return null;

  const labels = SECTION_LABELS[locale];
  const cfg = localeConfig(locale);
  const prevNumber = surahNumber > 1 ? surahNumber - 1 : null;
  const nextNumber = surahNumber < 114 ? surahNumber + 1 : null;
  const prevMeta = prevNumber ? getSurahMeta(prevNumber) : null;
  const nextMeta = nextNumber ? getSurahMeta(nextNumber) : null;

  return (
    <section
      lang={cfg.hreflang}
      dir={cfg.dir}
      aria-labelledby="about-surah-heading"
      className="mt-10 space-y-6 rounded-2xl border border-line bg-surface p-5 sm:p-7"
    >
      {info.faqs.length > 0 && <JsonLd data={faqJsonLd(info.faqs, cfg.hreflang)} />}

      <header className="border-b border-line-subtle pb-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
          <BookOpen className="h-3.5 w-3.5" aria-hidden />
          <span>{labels.aboutBadge}</span>
        </div>
        <h2 id="about-surah-heading" className="mt-1.5 font-serif text-xl font-bold text-ink sm:text-2xl">
          {labels.aboutPrefix} {surahName}
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-3">
          <span className="rounded-full border border-line bg-surface-2 px-3 py-1 font-medium">
            {info.revelationPeriod} Surah
          </span>
          <span className="rounded-full border border-line bg-surface-2 px-3 py-1 font-medium">
            {info.verseCount} Verses
          </span>
          <span className="rounded-full border border-line bg-surface-2 px-3 py-1 font-medium">
            Chapter {info.surahNumber} of 114
          </span>
          {info.juzNumbers.map((juz) => (
            <Link
              key={juz}
              href={`/juz/${juz}`}
              className="rounded-full border border-line bg-surface-2 px-3 py-1 font-medium text-[var(--accent)] transition hover:border-[var(--accent)]"
            >
              Juz {juz}
            </Link>
          ))}
        </div>
      </header>

      <div className="space-y-3 text-sm leading-7 text-ink-2 sm:text-[15px]">
        {info.overview.map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </div>

      {info.mainThemes.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-ink">{labels.themes}</h3>
          <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-sm leading-6 text-ink-2">
            {info.mainThemes.map((theme, idx) => (
              <li key={idx}>{theme}</li>
            ))}
          </ul>
        </div>
      )}

      {info.virtues.length > 0 && (
        <div className="rounded-xl border border-line-subtle bg-surface-2/60 p-4 sm:p-5">
          <h3 className="flex items-center gap-2 text-base font-bold text-ink">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" aria-hidden />
            {labels.virtues}
          </h3>
          <ul className="mt-3 space-y-2.5 text-sm leading-6 text-ink-2">
            {info.virtues.map((virtue, idx) => (
              <li key={idx}>
                {virtue.text}{' '}
                <span className="font-medium text-ink-muted">({virtue.source})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {info.faqs.length > 0 && (
        <div className="border-t border-line-subtle pt-5">
          <h3 className="flex items-center gap-2 text-base font-bold text-ink">
            <HelpCircle className="h-4 w-4 text-[var(--accent)]" aria-hidden />
            {labels.faq}
          </h3>
          <dl className="mt-3 space-y-3">
            {info.faqs.map((faq, idx) => (
              <div key={idx} className="rounded-xl border border-line-subtle bg-surface-2/40 p-4">
                <dt className="text-sm font-semibold text-ink">{faq.question}</dt>
                <dd className="mt-1.5 text-sm leading-6 text-ink-2">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Visible internal links: previous/next surah, related surahs, and guides */}
      <div className="space-y-4 border-t border-line-subtle pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {prevNumber && prevMeta ? (
            <Link
              href={localePath(locale, getSurahPath(prevNumber))}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface-2/50 px-3.5 py-2 text-xs font-semibold text-ink transition hover:border-[var(--accent)] hover:text-[var(--accent)] sm:text-sm"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Previous: Surah {prevMeta.nameSimple} ({prevNumber})
            </Link>
          ) : (
            <span />
          )}
          {nextNumber && nextMeta && (
            <Link
              href={localePath(locale, getSurahPath(nextNumber))}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface-2/50 px-3.5 py-2 text-xs font-semibold text-ink transition hover:border-[var(--accent)] hover:text-[var(--accent)] sm:ml-auto sm:text-sm"
            >
              Next: Surah {nextMeta.nameSimple} ({nextNumber})
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>

        {info.relatedSurahs.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-ink">Related Surahs</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {info.relatedSurahs.map((rel) => {
                const relMeta = getSurahMeta(rel.surahNumber);
                return (
                  <Link
                    key={rel.surahNumber}
                    href={localePath(locale, getSurahPath(rel.surahNumber))}
                    className="rounded-xl border border-line bg-surface-2/40 p-3 transition hover:border-[var(--accent)]"
                  >
                    <p className="text-sm font-semibold text-ink">
                      {rel.surahNumber}. Surah {relMeta.nameSimple}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-ink-muted">{rel.reason}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {info.relatedResources.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-ink">Continue Learning</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {info.relatedResources.map((res) => (
                <Link
                  key={res.href}
                  href={res.href}
                  className="rounded-full border border-line bg-surface-2/60 px-3.5 py-1.5 text-xs font-medium text-[var(--accent)] transition hover:border-[var(--accent)]"
                >
                  {res.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
