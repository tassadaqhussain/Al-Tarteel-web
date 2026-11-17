'use client';

import { Search, X } from 'lucide-react';
import { MainContainer } from '@/components/layout/MainContainer';
import { cn } from '@/lib/utils';

export type FilterOption<T extends string = string> = { id: T; label: string };

type FilterBarProps<TTab extends string, TChip extends string> = {
  tabs?: { options: FilterOption<TTab>[]; value: TTab; onChange: (v: TTab) => void; label: string };
  chips?: {
    options: FilterOption<TChip>[];
    /** Selected chips; an empty array means "all". */
    value: TChip[];
    onChange: (v: TChip[]) => void;
    label: string;
  };
  search?: { value: string; onChange: (v: string) => void; placeholder: string };
  /** Offset from the top for sticky positioning (px or CSS length). */
  stickyTop?: string;
  className?: string;
};

/** Sticky bar combining segmented tabs, toggle chips and a search field. */
export function FilterBar<TTab extends string = string, TChip extends string = string>({
  tabs,
  chips,
  search,
  stickyTop = '0px',
  className,
}: FilterBarProps<TTab, TChip>) {
  return (
    <div
      className={cn('sticky z-20 border-b border-line-subtle bg-surface-app/95 backdrop-blur', className)}
      style={{ top: stickyTop }}
    >
      <MainContainer className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center">
        {tabs && (
          <div role="tablist" aria-label={tabs.label} className="inline-flex shrink-0 rounded-full bg-surface-3 p-1">
            {tabs.options.map((o) => (
              <button
                key={o.id}
                type="button"
                role="tab"
                aria-selected={tabs.value === o.id}
                onClick={() => tabs.onChange(o.id)}
                className={cn(
                  'min-h-11 flex-1 rounded-full px-4 text-sm font-semibold transition sm:flex-none',
                  tabs.value === o.id ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink',
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}

        {chips && (
          <div
            role="group"
            aria-label={chips.label}
            className="-mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 pb-1 lg:pb-0"
          >
            {chips.options.map((o) => {
              const on = chips.value.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    chips.onChange(on ? chips.value.filter((v) => v !== o.id) : [...chips.value, o.id])
                  }
                  className={cn(
                    'inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition',
                    on
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                      : 'border-line bg-surface text-ink-2 hover:border-[var(--accent)]',
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        )}

        {search && (
          <label className="relative block w-full lg:ms-auto lg:w-72">
            <span className="sr-only">{search.placeholder}</span>
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
              aria-hidden
            />
            <input
              type="search"
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder}
              className="h-11 w-full rounded-xl border border-line bg-surface ps-9 pe-10 text-sm text-ink placeholder:text-ink-muted focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
            />
            {search.value && (
              <button
                type="button"
                onClick={() => search.onChange('')}
                aria-label="Clear search"
                className="absolute end-0 top-0 flex h-11 w-11 items-center justify-center text-ink-muted hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </label>
        )}
      </MainContainer>
    </div>
  );
}
