import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { Header } from '@/components/Header';
import { JsonLd } from '@/components/seo/JsonLd';
import { ArticleCard } from '@/components/articles/ArticleCard';
import {
  ARTICLES,
  formatArticleDate,
  formatArticleDuration,
  getArticleBySlug,
  getDailyFeaturedArticles,
} from '@/lib/articles';
import { absoluteUrl, buildPageMetadata, SITE_NAME } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'Article' };
  return buildPageMetadata({
    title: article.title,
    description: article.description,
    path: `/articles/${article.slug}`,
    keywords: [article.category, 'Islam', 'Quran', SITE_NAME],
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const related = getDailyFeaturedArticles(4)
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3);

  const index = ARTICLES.findIndex((item) => item.slug === article.slug);
  const prev = index > 0 ? ARTICLES[index - 1] : null;
  const next = index >= 0 && index < ARTICLES.length - 1 ? ARTICLES[index + 1] : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    image: absoluteUrl(article.image),
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME },
    mainEntityOfPage: absoluteUrl(`/articles/${article.slug}`),
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Articles', item: absoluteUrl('/articles') },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: absoluteUrl(`/articles/${article.slug}`),
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f7] text-slate-800">
      <Header />
      <JsonLd data={[jsonLd, breadcrumb]} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        <Link
          href="/articles"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:text-emerald-950"
        >
          <ArrowLeft className="h-4 w-4" />
          All articles
        </Link>

        <header className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <span>{article.category}</span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 font-semibold normal-case tracking-normal text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              {formatArticleDuration(article.durationMinutes)}
            </span>
            <span className="text-slate-300">·</span>
            <time dateTime={article.publishedAt} className="font-semibold normal-case tracking-normal text-slate-500">
              {formatArticleDate(article.publishedAt)}
            </time>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            {article.description}
          </p>
        </header>

        <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-3xl bg-slate-100">
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>

        <article className="space-y-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          {article.sections.map((section, i) => (
            <section key={i} className="space-y-3">
              {section.heading && (
                <h2 className="text-xl font-bold text-slate-900">{section.heading}</h2>
              )}
              {section.paragraphs.map((paragraph, j) => (
                <p key={j} className="text-[15px] leading-relaxed text-slate-600 sm:text-base">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </article>

        <nav className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-between">
          {prev ? (
            <Link
              href={`/articles/${prev.slug}`}
              className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-800/30"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span className="truncate">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/articles/${next.slug}`}
              className="inline-flex max-w-full items-center justify-end gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-800/30 sm:ml-auto"
            >
              <span className="truncate">{next.title}</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          )}
        </nav>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-6 text-xl font-bold text-slate-900">More to read today</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ArticleCard key={item.slug} article={item} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
