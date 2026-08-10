import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  formatArticleDate,
  formatArticleDuration,
  type Article,
} from '@/lib/articles';
import { cn } from '@/lib/utils';

interface Props {
  article: Article;
  /** Show a small badge (e.g. New today) */
  badge?: string;
  className?: string;
}

export function ArticleCard({ article, badge, className }: Props) {
  return (
    <article
      className={cn(
        'group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md',
        className,
      )}
    >
      <Link href={`/articles/${article.slug}`} className="relative block aspect-video w-full overflow-hidden bg-slate-100">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {badge && (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
            {badge}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              {formatArticleDuration(article.durationMinutes)}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {article.category}
            </span>
          </div>
          <h3 className="mt-2 text-lg font-bold leading-snug text-slate-800 transition group-hover:text-emerald-900">
            <Link href={`/articles/${article.slug}`}>{article.title}</Link>
          </h3>
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-500">
            {article.description}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-50 pt-4">
          <Link
            href={`/articles/${article.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950"
          >
            Read More
            <ArrowRight className="h-3 w-3" />
          </Link>
          <time
            dateTime={article.publishedAt}
            className="text-[10px] font-medium text-slate-400"
          >
            {formatArticleDate(article.publishedAt)}
          </time>
        </div>
      </div>
    </article>
  );
}
