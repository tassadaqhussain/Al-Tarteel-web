import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, BookOpen, Clock, HelpCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';
import { JsonLd } from '@/components/seo/JsonLd';
import { ArticleCard } from '@/components/articles/ArticleCard';
import {
  ARTICLES,
  formatArticleDate,
  formatArticleDuration,
  getArticleBySlug,
  getDailyFeaturedArticles,
} from '@/lib/articles';
import { absoluteUrl, buildPageMetadata, faqJsonLd, SITE_NAME } from '@/lib/seo';
import { getSurahMeta, getSurahPath } from '@/lib/surah-meta';

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
    type: 'article',
    image: { path: article.image, alt: article.title },
    publishedTime: article.publishedAt,
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
    ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
    image: absoluteUrl(article.image),
    author: { '@type': 'Organization', name: article.author || `${SITE_NAME} Editorial`, url: absoluteUrl('/') },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: absoluteUrl('/'),
      logo: absoluteUrl('/images/logo.png'),
    },
    inLanguage: 'en',
    articleSection: article.category,
    isAccessibleForFree: true,
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

  const structuredData = article.faqs?.length
    ? [jsonLd, breadcrumb, faqJsonLd(article.faqs)]
    : [jsonLd, breadcrumb];

  return (
    <div className="flex min-h-screen flex-col bg-surface-app text-ink">
      <Header />
      <JsonLd data={structuredData} />

      <main lang="en" dir="ltr" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        <Link
          href="/articles"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          All articles
        </Link>

        <header className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand">
            <span>{article.category}</span>
            <span className="text-ink-faint">·</span>
            <span className="inline-flex items-center gap-1 font-semibold normal-case tracking-normal text-ink-muted">
              <Clock className="h-3.5 w-3.5" />
              {formatArticleDuration(article.durationMinutes)}
            </span>
            <span className="text-ink-faint">·</span>
            <time dateTime={article.publishedAt} className="font-semibold normal-case tracking-normal text-ink-muted">
              Published {formatArticleDate(article.publishedAt)}
            </time>
            {article.updatedAt && article.updatedAt !== article.publishedAt && (
              <>
                <span className="text-ink-faint">·</span>
                <time dateTime={article.updatedAt} className="font-semibold normal-case tracking-normal text-ink-muted">
                  Updated {formatArticleDate(article.updatedAt)}
                </time>
              </>
            )}
          </div>
          <p className="mb-3 text-sm text-ink-muted">
            By{' '}
            <Link href="/" rel="author" className="font-semibold text-brand hover:underline">
              {article.author || `${SITE_NAME} Editorial`}
            </Link>
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-3 sm:text-lg">
            {article.description}
          </p>
        </header>

        <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-3xl bg-surface-3">
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>

        <article className="space-y-8 rounded-3xl border border-line-subtle bg-surface p-6 shadow-sm sm:p-8">
          {article.sections.map((section, i) => (
            <section key={i} className="space-y-3">
              {section.heading && (
                <h2 className="text-xl font-bold text-ink">{section.heading}</h2>
              )}
              {section.paragraphs.map((paragraph, j) => (
                <p key={j} className="text-[15px] leading-relaxed text-ink-3 sm:text-base">
                  {paragraph}
                </p>
              ))}
              {section.subsections?.map((sub, k) => (
                <div key={k} className="space-y-2.5 pt-2">
                  <h3 className="text-base font-bold text-ink sm:text-lg">{sub.heading}</h3>
                  {sub.paragraphs.map((p, m) => (
                    <p key={m} className="text-[15px] leading-relaxed text-ink-3 sm:text-base">
                      {p}
                    </p>
                  ))}
                </div>
              ))}
              {section.links && section.links.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {section.links.map((lnk) => (
                    <Link
                      key={lnk.href}
                      href={lnk.href}
                      className="rounded-full border border-line bg-surface-2/60 px-3 py-1 text-xs font-medium text-[var(--accent)] transition hover:border-[var(--accent)]"
                    >
                      {lnk.label}
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ))}

          {article.sources && article.sources.length > 0 && (
            <section className="border-t border-line-subtle pt-6">
              <h2 className="text-base font-bold text-ink">Sources &amp; References</h2>
              <ul className="mt-2.5 list-disc space-y-1 pl-5 text-sm text-ink-muted">
                {article.sources.map((src, idx) => (
                  <li key={idx}>{src}</li>
                ))}
              </ul>
            </section>
          )}
        </article>

        {article.faqs && article.faqs.length > 0 && (
          <section
            aria-label="Frequently Asked Questions"
            className="mt-8 rounded-3xl border border-line-subtle bg-surface p-6 shadow-sm sm:p-8"
          >
            <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
              <HelpCircle className="h-5 w-5 text-[var(--accent)]" aria-hidden />
              Frequently Asked Questions
            </h2>
            <dl className="mt-4 space-y-3">
              {article.faqs.map((faq, idx) => (
                <div key={idx} className="rounded-2xl border border-line-subtle bg-surface-2/50 p-4">
                  <dt className="text-sm font-semibold text-ink sm:text-base">{faq.question}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-ink-3">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {article.relatedSurahs && article.relatedSurahs.length > 0 && (
          <section
            aria-label="Related Surahs"
            className="mt-8 rounded-3xl border border-line-subtle bg-surface p-6 shadow-sm sm:p-8"
          >
            <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
              <BookOpen className="h-5 w-5 text-[var(--accent)]" aria-hidden />
              Related Surahs to Read
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {article.relatedSurahs.map((surahNumber) => {
                const meta = getSurahMeta(surahNumber);
                return (
                  <Link
                    key={surahNumber}
                    href={getSurahPath(surahNumber)}
                    className="rounded-2xl border border-line bg-surface-2/50 p-4 transition hover:border-[var(--accent)]"
                  >
                    <p className="text-xs font-semibold text-[var(--accent)]">Surah {surahNumber}</p>
                    <p className="mt-1 font-bold text-ink">{meta.nameSimple}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">{meta.meaning}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <nav className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-between">
          {prev ? (
            <Link
              href={`/articles/${prev.slug}`}
              className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-semibold text-ink-2 transition hover:border-emerald-800/30"
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
              className="inline-flex max-w-full items-center justify-end gap-2 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-semibold text-ink-2 transition hover:border-emerald-800/30 sm:ml-auto"
            >
              <span className="truncate">{next.title}</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          )}
        </nav>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-6 text-xl font-bold text-ink">More to read today</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ArticleCard key={item.slug} article={item} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
