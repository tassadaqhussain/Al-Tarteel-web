import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo';
import { cn } from '@/lib/utils';

export type BreadcrumbItem = {
  name: string;
  /** Absolute-path on site, e.g. `/surahs` or `/ya-sin?page=2`. Omit on current page. */
  path?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
  /** When false, only render the visible trail (caller emits JSON-LD). Default true. */
  withJsonLd?: boolean;
};

/**
 * Crawlable breadcrumb trail + matching BreadcrumbList JSON-LD.
 * Pass a path on every item including the current page for schema completeness.
 */
export function Breadcrumbs({ items, className, withJsonLd = true }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  const schemaItems = items
    .filter((item): item is BreadcrumbItem & { path: string } => Boolean(item.path))
    .map((item) => ({ name: item.name, path: item.path }));

  return (
    <>
      {withJsonLd && schemaItems.length > 0 && <JsonLd data={breadcrumbJsonLd(schemaItems)} />}
      <nav aria-label="Breadcrumb" className={cn('mb-3 text-xs text-slate-500', className)}>
        <ol className="flex flex-wrap items-center gap-1">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.name}-${index}`} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronRight className="h-3 w-3 shrink-0 text-slate-300" aria-hidden />
                )}
                {isLast || !item.path ? (
                  <span className="font-medium text-slate-700" aria-current={isLast ? 'page' : undefined}>
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.path} className="hover:text-emerald-800">
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
