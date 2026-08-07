import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { getTajweedLesson, TAJWEED_LESSONS } from '@/lib/tajweed/rules';
import { absoluteUrl, SITE_NAME } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { TajweedLessonExperience } from '@/components/tajweed/TajweedLessonExperience';
import type { TajweedLessonSlug } from '@/lib/tajweed/rules';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return TAJWEED_LESSONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getTajweedLesson(slug);
  if (!lesson) return { title: 'Tajweed lesson' };
  return {
    title: `${lesson.name} — Tajweed`,
    description: lesson.summary.slice(0, 155),
    alternates: { canonical: absoluteUrl(`/tajweed/${lesson.slug}`) },
    openGraph: {
      title: `${lesson.name} | ${SITE_NAME}`,
      description: lesson.summary.slice(0, 155),
      url: absoluteUrl(`/tajweed/${lesson.slug}`),
    },
    robots: { index: true, follow: true },
  };
}

export default async function TajweedLessonPage({ params }: Props) {
  const { slug } = await params;
  const lesson = getTajweedLesson(slug);
  if (!lesson) notFound();

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Tajweed', item: absoluteUrl('/tajweed') },
      {
        '@type': 'ListItem',
        position: 3,
        name: lesson.name,
        item: absoluteUrl(`/tajweed/${lesson.slug}`),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <JsonLd data={breadcrumb} />
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/tajweed" className="text-sm font-semibold text-[var(--accent)] hover:underline">
          ← All lessons
        </Link>
        <h1 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">{lesson.name}</h1>
        <p className="mt-1 font-arabic text-2xl text-slate-600" lang="ar" dir="rtl">
          {lesson.nameArabic}
        </p>
        <p className="mt-3 max-w-2xl text-sm text-slate-600 leading-relaxed">
          Motivation here is educational encouragement only — never presented as Quran or Hadith.
          Annotation colours in the reader remain dataset-backed and separate from this lesson flow.
        </p>

        <TajweedLessonExperience slug={lesson.slug as TajweedLessonSlug} />

        {lesson.relatedSlugs.length > 0 && (
          <section className="mt-10">
            <h2 className="text-sm font-semibold text-slate-500">Related lessons</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {lesson.relatedSlugs.map((rel) => {
                const related = getTajweedLesson(rel);
                if (!related) return null;
                return (
                  <Link
                    key={rel}
                    href={`/tajweed/${rel}`}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium hover:border-[var(--accent)]"
                  >
                    {related.name}
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
