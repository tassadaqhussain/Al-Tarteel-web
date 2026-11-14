import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';
import { SITE_SHELL } from '@/components/layout/MainContainer';
import { getTajweedLesson, getTajweedRule, TAJWEED_LESSONS } from '@/lib/tajweed/rules';
import { buildPageMetadata, tajweedLessonJsonLd } from '@/lib/seo';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { TajweedLessonExperience } from '@/components/tajweed/TajweedLessonExperience';
import type { TajweedLessonSlug } from '@/lib/tajweed/rules';

/** Whole sentences of the summary up to ~160 chars, never cut mid-word. */
function summaryDescription(summary: string, max = 160): string {
  if (summary.length <= max) return summary;
  const sentences = summary.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [];
  let out = '';
  for (const s of sentences) {
    if ((out + s).trim().length > max) break;
    out += s;
  }
  if (out.trim()) return out.trim();
  return `${summary.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return TAJWEED_LESSONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getTajweedLesson(slug);
  if (!lesson) return { title: 'Tajweed lesson' };
  return buildPageMetadata({
    title: `${lesson.name} – Tajweed Lesson | QuranPilot`,
    description: summaryDescription(lesson.summary),
    path: `/tajweed/${lesson.slug}`,
    keywords: [lesson.name, 'Tajweed', 'Quran Tajweed'],
    type: 'article',
  });
}

export default async function TajweedLessonPage({ params }: Props) {
  const { slug } = await params;
  const lesson = getTajweedLesson(slug);
  if (!lesson) notFound();

  const lessonIndex = TAJWEED_LESSONS.findIndex((l) => l.slug === lesson.slug) + 1;

  return (
    <div className="flex min-h-screen flex-col bg-surface-app text-ink">
      <JsonLd
        data={tajweedLessonJsonLd({
          name: lesson.name,
          nameArabic: lesson.nameArabic,
          summary: lesson.summary,
          slug: lesson.slug,
        })}
      />
      <Header />

      <main className={`${SITE_SHELL} flex-1 py-8 sm:py-10`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumbs
            items={[
              { name: 'Home', path: '/' },
              { name: 'Tajweed', path: '/tajweed' },
              { name: lesson.name, path: `/tajweed/${lesson.slug}` },
            ]}
          />
          <Link
            href="/tajweed"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-3 transition hover:text-[var(--accent)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            All lessons
          </Link>
        </div>

        {/* Clean Editorial Header */}
        <header className="mt-4 flex flex-col justify-between gap-4 border-b border-line pb-6 sm:flex-row sm:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-medium text-ink-muted">
              Lesson {lessonIndex} of {TAJWEED_LESSONS.length}
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-3">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {lesson.name}
              </h1>
              <span className="font-arabic text-2xl text-ink-3 sm:text-3xl" lang="ar" dir="rtl">
                {lesson.nameArabic}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-3 sm:text-base">
              {lesson.summary}
            </p>
          </div>
        </header>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 xl:col-span-9">
            <TajweedLessonExperience slug={lesson.slug as TajweedLessonSlug} />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:col-span-4 xl:col-span-3">
            <div className="rounded-xl border border-line bg-surface p-5">
              <h2 className="text-sm font-semibold text-ink">Lessons</h2>
              <ul className="mt-3 divide-y divide-line-subtle border-t border-line-subtle">
                {TAJWEED_LESSONS.map((item, idx) => {
                  const isCurrent = item.slug === lesson.slug;
                  const r = getTajweedRule(item.relatedRuleIds[0]);
                  return (
                    <li key={item.slug}>
                      <Link
                        href={`/tajweed/${item.slug}`}
                        className={`flex items-center justify-between gap-3 py-2.5 text-sm transition ${
                          isCurrent
                            ? 'font-bold text-[var(--accent)]'
                            : 'font-medium text-ink-2 hover:text-ink'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 truncate">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: r?.color ?? '#059669' }}
                            aria-hidden
                          />
                          <span className="truncate">
                            {idx + 1}. {item.name}
                          </span>
                        </span>
                        <span className="font-arabic text-base text-ink-muted" dir="rtl" lang="ar">
                          {item.nameArabic}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
