import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { MainContainer } from '@/components/layout/MainContainer';
import { cn } from '@/lib/utils';

export type Crumb = { label: string; href?: string };

export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  if (!items.length) return null;
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-xs font-medium text-ink-muted">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="inline-flex items-center gap-1">
              {c.href && !last ? (
                <Link
                  href={c.href}
                  className="inline-flex min-h-11 items-center hover:text-[var(--accent)] hover:underline"
                >
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={last ? 'text-ink-2' : undefined}>
                  {c.label}
                </span>
              )}
              {!last && <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

type PageHeaderProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumb?: Crumb[];
  /** Right-side (inline-end) actions: buttons, search, etc. */
  actions?: React.ReactNode;
  /** Optional Arabic name / ornament shown opposite the title on wide screens. */
  aside?: React.ReactNode;
  className?: string;
};

/** Standard page hero: breadcrumb, serif H1, one-line description, optional actions. */
export function PageHeader({ title, description, breadcrumb, actions, aside, className }: PageHeaderProps) {
  return (
    <header className={cn('w-full border-b border-line-subtle bg-surface-app', className)}>
      <MainContainer className="py-6 sm:py-8">
        {breadcrumb && <Breadcrumb items={breadcrumb} className="mb-2 -mt-3" />}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 max-w-3xl">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
            {description && (
              <p className="mt-2 text-base leading-relaxed text-ink-2">{description}</p>
            )}
          </div>
          {(actions || aside) && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {actions}
              {aside}
            </div>
          )}
        </div>
      </MainContainer>
    </header>
  );
}
