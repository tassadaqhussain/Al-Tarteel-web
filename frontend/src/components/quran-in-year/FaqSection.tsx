'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { getFaqItems } from '@/lib/quranic-calendar';
import { cn } from '@/lib/utils';

export function FaqSection() {
  const items = getFaqItems();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h2 className="mb-5 text-2xl font-bold text-slate-900 sm:text-3xl">
        Frequently Asked Questions
      </h2>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.question} className="border-b border-slate-200 last:border-b-0">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className={cn(
                  'flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition',
                  isOpen ? 'bg-slate-50' : 'hover:bg-slate-50'
                )}
              >
                <span className="text-sm font-semibold text-slate-800 sm:text-base">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 shrink-0 text-slate-400 transition-transform',
                    isOpen && 'rotate-180'
                  )}
                />
              </button>
              {isOpen && (
                <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">{item.answer}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
