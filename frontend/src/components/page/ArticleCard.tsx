import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CARD_BASE, CARD_INTERACTIVE, EYEBROW, GOLD_TEXT } from './tokens';

type ArticleCardProps = {
  href: string;
  title: string;
  excerpt?: string;
  category?: string;
  meta?: string;
  /** Large featured layout. */
  featured?: boolean;
  className?: string;
};

export function ArticleCard({ href, title, excerpt, category, meta, featured, className }: ArticleCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        CARD_BASE,
        CARD_INTERACTIVE,
        'group flex flex-col justify-between',
        featured ? 'p-6 sm:p-10' : 'p-5',
        className,
      )}
    >
      <div>
        {category && <p className={cn(EYEBROW, GOLD_TEXT)}>{category}</p>}
        <h3
          className={cn(
            'mt-2 font-serif font-bold leading-snug text-ink group-hover:text-[var(--accent)]',
            featured ? 'text-2xl sm:text-4xl' : 'text-lg',
          )}
        >
          {title}
        </h3>
        {excerpt && (
          <p className={cn('mt-3 leading-relaxed text-ink-2', featured ? 'max-w-2xl text-base' : 'line-clamp-3 text-sm')}>
            {excerpt}
          </p>
        )}
      </div>
      {meta && <p className="mt-4 text-xs font-medium text-ink-muted">{meta}</p>}
    </Link>
  );
}
