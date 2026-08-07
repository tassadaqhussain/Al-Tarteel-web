'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Bell, CheckCircle2, Lock, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';

const INTEREST_KEY = 'qp_signin_interest_email';

interface SignInSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignInSheet({ open, onOpenChange }: SignInSheetProps) {
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    try {
      const existing = localStorage.getItem(INTEREST_KEY);
      if (existing) {
        setEmail(existing);
        setSaved(true);
      } else {
        setSaved(false);
      }
    } catch {
      setSaved(false);
    }
  }, [open]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Enter a valid email address.');
      return;
    }
    try {
      localStorage.setItem(INTEREST_KEY, value);
    } catch {
      /* private browsing — still show success */
    }
    setSaved(true);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-md">
        <div className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 px-6 pb-2 pt-6">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 rounded-full p-2 text-slate-500 transition hover:bg-white/80 hover:text-slate-800"
            aria-label={t('close')}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
            <Lock className="h-5 w-5" />
          </div>
          <DialogTitle className="mt-4 text-center text-xl font-bold tracking-tight text-slate-900">
            {t('signInComingSoon')}
          </DialogTitle>
          <DialogDescription className="mt-2 text-center text-sm leading-relaxed text-slate-600">
            {t('signInComingSoonBody')}
          </DialogDescription>
        </div>

        <div className="px-6 py-5">
          {saved ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-5 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
              <p className="mt-3 text-sm font-semibold text-emerald-900">{t('onTheList')}</p>
              <p className="mt-1 text-sm text-emerald-800/80">
                <span className="font-medium">{email}</span>
              </p>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="mt-5 w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--accent)]/90"
              >
                {t('continueReadingCta')}
              </button>
              <button
                type="button"
                onClick={() => setSaved(false)}
                className="mt-2 text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                {t('differentEmail')}
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-slate-700">{t('email')}</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  className={cn(
                    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition',
                    'placeholder:text-slate-400 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15'
                  )}
                />
              </label>
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--accent)]/90"
              >
                <Bell className="h-4 w-4" />
                {t('notifyMe')}
              </button>
            </form>
          )}

          <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">{t('keepUsing')}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
