import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { getTajweedLesson, TAJWEED_LESSONS } from '@/lib/tajweed/rules';
import { buildPageMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
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
  return buildPageMetadata({
    title: `${lesson.name} – Tajweed Lesson | QuranPilot`,
    description: lesson.summary.slice(0, 155),
    path: `/tajweed/${lesson.slug}`,
    keywords: [lesson.name, 'Tajweed', 'Quran Tajweed'],
    type: 'article',
  });
}

export default async function TajweedLessonPage({ params }: Props) {
  const { slug } = await params;
  const lesson = getTajweedLesson(slug);
  if (!lesson) notFound();

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Tajweed', path: '/tajweed' },
            { name: lesson.name, path: `/tajweed/${lesson.slug}` },
          ]}
        />
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
