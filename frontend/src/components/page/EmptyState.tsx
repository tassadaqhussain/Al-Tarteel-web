import Link from 'next/link';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: { href: string; label: React.ReactNode };
  className?: string;
};

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-dashed border-line px-6 py-12 text-center',
        className,
      )}
    >
      {icon && <div className="mx-auto mb-3 flex justify-center text-ink-muted">{icon}</div>}
      <p className="font-serif text-lg font-bold text-ink">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-md text-sm text-ink-2">{description}</p>}
      {action && (
        <Link
          href={action.href}
          className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)] transition hover:opacity-90"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
