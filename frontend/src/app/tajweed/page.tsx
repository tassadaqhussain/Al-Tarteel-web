import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';
import { SITE_SHELL } from '@/components/layout/MainContainer';
import {
  TAJWEED_LESSONS,
  TAJWEED_RULE_LIST,
  getTajweedRule,
} from '@/lib/tajweed/rules';
import { getSurahPath } from '@/lib/surah-meta';
import { buildPageMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { TajweedJourneyPanel } from '@/components/tajweed/TajweedJourneyPanel';

export const metadata: Metadata = buildPageMetadata({
  title: 'Learn Tajweed – Quran Rules Guide | QuranPilot',
  description:
    'Learn core Tajweed rules with calm progress tracking on QuranPilot. Reader colours use verified Quran.com annotations — never AI-generated Arabic.',
  path: '/tajweed',
  keywords: ['Tajweed', 'learn Tajweed', 'Quran Tajweed', 'Tajweed rules'],
});

export default function TajweedIndexPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-app text-ink">
      <Header />

      <main lang="en" dir="ltr" className={`${SITE_SHELL} flex-1 py-8 sm:py-10`}>
        <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Tajweed', path: '/tajweed' }]} />

        {/* Clean Editorial Page Header */}
        <header className="mt-4 flex flex-col justify-between gap-4 border-b border-line pb-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Tajweed Rules &amp; Recitation Guide
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-3 sm:text-base">
              Study the six foundational Tajweed rule families with pronunciation notes and verified Mushaf examples.
            </p>
          </div>
          <Link
            href="/surah/1-al-fatihah"
            className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <span>Open Mushaf Reader</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </header>

        {/* Main Content Grid */}
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-12">
          {/* Primary Column: Lessons & Mushaf Color Key */}
          <div className="space-y-10 lg:col-span-8 xl:col-span-9">
            <section aria-labelledby="lessons-heading">
              <div className="mb-4 flex items-baseline justify-between">
                <h2 id="lessons-heading" className="text-lg font-bold text-ink">
                  Lessons
                </h2>
                <span className="text-xs text-ink-muted">6 chapters</span>
              </div>

              <ol className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {TAJWEED_LESSONS.map((lesson, i) => {
                  const primaryRule = getTajweedRule(lesson.relatedRuleIds[0]);
                  const accentColor = primaryRule?.color ?? '#059669';
                  const firstExample = lesson.exampleRefs[0];

                  return (
                    <li key={lesson.slug} className="flex">
                      <Link
                        href={`/tajweed/${lesson.slug}`}
                        className="group flex w-full flex-col justify-between rounded-xl border border-line bg-surface p-5 transition hover:border-[var(--accent)]/60 hover:shadow-sm"
                      >
                        <div>
                          <div className="flex items-baseline justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: accentColor }}
                                aria-hidden
                              />
                              <span className="text-xs font-medium text-ink-muted">
                                Lesson {i + 1}
                              </span>
                            </div>
                            <span
                              className="font-arabic text-2xl leading-none text-ink"
                              lang="ar"
                              dir="rtl"
                            >
                              {lesson.nameArabic}
                            </span>
                          </div>

                          <h3 className="mt-2 text-lg font-bold text-ink group-hover:text-[var(--accent)]">
                            {lesson.name}
                          </h3>

                          <p className="mt-2 text-sm leading-relaxed text-ink-3">
                            {lesson.summary}
                          </p>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-line-subtle pt-3 text-xs">
                          <span className="text-ink-muted">
                            {firstExample
                              ? `Example: Surah ${firstExample.surah}:${firstExample.ayah}`
                              : 'Recitation examples'}
                          </span>
                          <span className="inline-flex items-center gap-1 font-semibold text-[var(--accent)]">
                            <span>Read lesson</span>
                            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>

            {/* Printed Mushaf Style Color Key */}
            <section aria-labelledby="color-key-heading" className="rounded-xl border border-line bg-surface p-6">
              <div className="border-b border-line-subtle pb-4">
                <h2 id="color-key-heading" className="text-base font-bold text-ink">
                  Mushaf Tajweed Color Key
                </h2>
                <p className="mt-1 text-xs text-ink-muted">
                  Reference table for the 16 color annotations used in the QuranPilot reader when Tajweed mode is enabled.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
                {TAJWEED_RULE_LIST.map((rule) => {
                  const row = (
                    <div className="flex items-start gap-3 rounded-lg py-2 transition hover:bg-surface-2/70 px-2 -mx-2">
                      <span
                        className="mt-1.5 h-3 w-3 shrink-0 rounded-sm"
                        style={{ backgroundColor: rule.color }}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-ink">{rule.name}</p>
                          <span className="shrink-0 font-arabic text-sm text-ink-muted" dir="rtl" lang="ar">
                            {rule.nameArabic}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-ink-muted line-clamp-2">
                          {rule.description}
                        </p>
                      </div>
                    </div>
                  );

                  return rule.lessonSlug ? (
                    <Link key={rule.id} href={`/tajweed/${rule.lessonSlug}`} className="block">
                      {row}
                    </Link>
                  ) : (
                    <div key={rule.id}>{row}</div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Sidebar: Calm Progress Summary */}
          <aside className="space-y-4 lg:sticky lg:top-20 lg:col-span-4 xl:col-span-3">
            <TajweedJourneyPanel showPersonal />

            <div className="rounded-xl border border-line bg-surface p-5">
              <h3 className="text-sm font-semibold text-ink">Practice in the Reader</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                Open a chapter and enable Tajweed highlighting in the top toolbar to practice along with audio.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  { label: 'Al-Fatihah', num: 1 },
                  { label: 'Ya-Sin', num: 36 },
                  { label: 'Al-Mulk', num: 67 },
                  { label: 'Al-Ikhlas', num: 112 },
                ].map((s) => (
                  <Link
                    key={s.num}
                    href={getSurahPath(s.num)}
                    className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-2 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {s.num}. {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
