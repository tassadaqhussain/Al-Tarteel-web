'use client';

import Link from 'next/link';
import { BookOpen, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import type { TajweedRule } from '@/lib/tajweed/rules';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: TajweedRule | null;
  sample?: string;
};

export function TajweedRulePopover({ open, onOpenChange, rule, sample }: Props) {
  if (!rule) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden p-0 sm:rounded-2xl">
        <div className="relative border-b border-slate-100 bg-slate-50 px-5 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 rounded-full p-2 text-slate-500 hover:bg-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 pr-8">
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ backgroundColor: rule.color }}
              aria-hidden
            >
              ●
            </span>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">{rule.name}</DialogTitle>
              <p className="font-arabic text-base text-slate-600" lang="ar" dir="rtl">
                {rule.nameArabic}
              </p>
            </div>
          </div>
          {sample && (
            <p
              className="mt-3 rounded-xl bg-white px-3 py-2 text-center font-arabic text-2xl leading-loose text-slate-900"
              lang="ar"
              dir="rtl"
              translate="no"
              style={{ color: rule.color }}
            >
              {sample}
            </p>
          )}
        </div>
        <div className="space-y-3 px-5 py-4 text-sm text-slate-700">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Rule</p>
            <DialogDescription className="mt-1 text-sm text-slate-700">
              {rule.description}
            </DialogDescription>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pronunciation</p>
            <p className="mt-1">{rule.pronunciation}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">When it occurs</p>
            <p className="mt-1">{rule.when}</p>
          </div>
          {rule.lessonSlug && (
            <Link
              href={`/tajweed/${rule.lessonSlug}`}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              onClick={() => onOpenChange(false)}
            >
              <BookOpen className="h-4 w-4" />
              Learn more
            </Link>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
