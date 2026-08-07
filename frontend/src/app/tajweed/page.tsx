import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { TAJWEED_LESSONS } from '@/lib/tajweed/rules';
import { absoluteUrl, SITE_NAME } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { TajweedJourneyPanel } from '@/components/tajweed/TajweedJourneyPanel';
import { DailyMotivation } from '@/components/daily/DailyMotivation';

export const metadata: Metadata = {
  title: 'Learn Tajweed',
  description:
    'Learn core Tajweed rules with calm progress tracking on QuranPilot. Reader colours use verified Quran.com annotations — never AI-generated Arabic.',
  alternates: { canonical: absoluteUrl('/tajweed') },
  openGraph: {
    title: `Learn Tajweed | ${SITE_NAME}`,
    description: 'Guided Tajweed lessons with respectful motivation and dataset-backed mushaf colouring.',
    url: absoluteUrl('/tajweed'),
  },
  robots: { index: true, follow: true },
};

export default function TajweedIndexPage() {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Tajweed', item: absoluteUrl('/tajweed') },
    ],
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <JsonLd data={breadcrumb} />
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm font-semibold text-[var(--accent)]">Learn Tajweed</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
          Tajweed Journey
        </h1>
        <p className="mt-3 text-slate-600 leading-relaxed">
          Read → Listen → Understand → Practice → Review → Progress. Encouragement is calm and original —
          never fabricated scripture. The Quran reader stays free of achievement interruptions.
        </p>

        <div className="mt-8 space-y-4">
          <DailyMotivation variant="full" showAyahOfDay={false} showTajweedOfDay />
          <TajweedJourneyPanel showPersonal />
        </div>

        <ol className="mt-10 space-y-3">
          {TAJWEED_LESSONS.map((lesson, i) => (
            <li key={lesson.slug}>
              <Link
                href={`/tajweed/${lesson.slug}`}
                className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 transition hover:border-[var(--accent)]"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-400">Lesson {i + 1}</p>
                  <h2 className="text-lg font-bold text-slate-900">{lesson.name}</h2>
                  <p className="font-arabic text-base text-slate-500" lang="ar" dir="rtl">
                    {lesson.nameArabic}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">{lesson.summary}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-[var(--accent)]">Open →</span>
              </Link>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
