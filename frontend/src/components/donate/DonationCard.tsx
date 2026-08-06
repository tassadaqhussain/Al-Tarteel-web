'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Heart, Info } from 'lucide-react';
import { donationsApi, type DonationConfig, type DonationCurrency } from '@/lib/api';
import { detectDonationCurrency } from '@/lib/detect-donation-currency';
import { saveDonateDraft } from '@/lib/donate-draft';
import { cn } from '@/lib/utils';

type Mode = 'once' | 'recurring';
type Interval = 'month' | 'week' | 'year';

const FALLBACK: DonationConfig = {
  configured: false,
  demoMode: true,
  publishableKey: null,
  currencies: ['usd', 'pkr', 'eur', 'gbp'],
  presets: {
    usd: [10, 25, 50, 100],
    pkr: [2776, 6941, 13882, 27764],
    eur: [10, 25, 50, 100],
    gbp: [10, 20, 40, 80],
  },
  intervals: [
    { id: 'month', label: 'Monthly' },
    { id: 'week', label: 'Weekly' },
    { id: 'year', label: 'Yearly' },
  ],
};

function formatPreset(amount: number, currency: string) {
  const code = currency.toUpperCase();
  return `${code} ${amount.toLocaleString()}`;
}

function intervalAdverb(interval: Interval) {
  if (interval === 'week') return 'weekly';
  if (interval === 'year') return 'yearly';
  return 'monthly';
}

export function DonationCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canceled = searchParams.get('canceled') === '1';

  const [config, setConfig] = useState<DonationConfig>(FALLBACK);
  const [mode, setMode] = useState<Mode>('once');
  const [interval, setInterval] = useState<Interval>('month');
  const [currency, setCurrency] = useState<DonationCurrency>('usd');
  const [amount, setAmount] = useState(50);
  const [customDraft, setCustomDraft] = useState('50');
  const [dedicate, setDedicate] = useState(false);
  const [dedicationName, setDedicationName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const detected = detectDonationCurrency();

    donationsApi
      .config()
      .then((cfg) => {
        if (cancelled) return;
        setConfig(cfg);
        const nextCurrency = cfg.currencies.includes(detected) ? detected : 'usd';
        const presets = cfg.presets[nextCurrency] ?? FALLBACK.presets.usd;
        const initial = presets[2] ?? presets[0] ?? 25;
        setCurrency(nextCurrency);
        setAmount(initial);
        setCustomDraft(initial.toLocaleString());
      })
      .catch(() => {
        if (cancelled) return;
        const presets = FALLBACK.presets[detected] ?? FALLBACK.presets.usd;
        const initial = presets[2] ?? presets[0] ?? 25;
        setCurrency(detected);
        setAmount(initial);
        setCustomDraft(initial.toLocaleString());
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const presets = config.presets[currency] ?? FALLBACK.presets.usd;

  const choosePreset = (value: number) => {
    setAmount(value);
    setCustomDraft(value.toLocaleString());
    setError(null);
  };

  const onCurrencyChange = (next: DonationCurrency) => {
    setCurrency(next);
    const nextPresets = config.presets[next] ?? FALLBACK.presets.usd;
    const value = nextPresets[2] ?? nextPresets[0] ?? 25;
    setAmount(value);
    setCustomDraft(value.toLocaleString());
  };

  const onCustomChange = (raw: string) => {
    setCustomDraft(raw);
    const digits = raw.replace(/[^\d]/g, '');
    const parsed = digits ? parseInt(digits, 10) : 0;
    if (parsed > 0) setAmount(parsed);
  };

  const amountHint = useMemo(() => {
    if (mode === 'once') return 'one-time';
    return intervalAdverb(interval);
  }, [interval, mode]);

  const ctaLabel = useMemo(() => {
    if (mode === 'once') return 'Donate';
    return `Donate ${intervalAdverb(interval)}`;
  }, [interval, mode]);

  const handleDonate = () => {
    setError(null);
    if (!amount || amount < 1) {
      setError('Enter a valid donation amount.');
      return;
    }
    saveDonateDraft({
      amount,
      currency,
      mode,
      interval: mode === 'recurring' ? interval : undefined,
      dedicate,
      dedicationName: dedicate ? dedicationName.trim() || undefined : undefined,
    });
    router.push('/donate/checkout');
  };

  return (
    <div className="w-full max-w-[26rem]">
      <div className="overflow-hidden rounded-[1.35rem] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.1)]">
        <div className="px-6 pb-2 pt-7 sm:px-8 sm:pt-8">
          <h1 className="text-center text-[1.35rem] font-bold leading-snug tracking-tight text-slate-900 sm:text-[1.5rem]">
            Help Millions Connect with the Quran
          </h1>

          {(config.demoMode || !config.configured) && (
            <p className="mt-3 rounded-full bg-amber-50 px-3 py-1.5 text-center text-xs font-semibold text-amber-800">
              Demo mode — add Stripe keys to enable live payments
            </p>
          )}

          {canceled && (
            <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-center text-sm text-amber-800">
              Checkout canceled — you can try again anytime.
            </p>
          )}

          {/* Give once / Recurring — QF segmented control */}
          <div
            className="mt-6 grid grid-cols-2 gap-1 rounded-full bg-[#f3f4f6] p-1"
            role="tablist"
            aria-label="Donation type"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'once'}
              onClick={() => setMode('once')}
              className={cn(
                'rounded-full py-2.5 text-sm font-semibold transition',
                mode === 'once'
                  ? 'bg-[var(--accent)] text-white outline outline-2 outline-dashed outline-[var(--accent)] outline-offset-1'
                  : 'bg-transparent text-slate-800 hover:bg-white/60'
              )}
            >
              Give once
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'recurring'}
              onClick={() => setMode('recurring')}
              className={cn(
                'inline-flex items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-semibold transition',
                mode === 'recurring'
                  ? 'bg-[var(--accent)] text-white outline outline-2 outline-dashed outline-[var(--accent)] outline-offset-1'
                  : 'bg-transparent text-slate-800 hover:bg-white/60'
              )}
            >
              Recurring
              <Heart
                className={cn(
                  'h-3.5 w-3.5',
                  mode === 'recurring' ? 'fill-white text-white' : 'fill-[var(--accent)] text-[var(--accent)]'
                )}
              />
            </button>
          </div>

          <p className="mt-5 text-center text-sm text-slate-600">
            Choose an amount to donate{' '}
            <span className="font-bold text-slate-900">{amountHint}</span>
          </p>

          {mode === 'recurring' && (
            <div className="mt-4">
              <label htmlFor="donate-frequency" className="mb-1.5 block text-sm font-medium text-slate-700">
                Frequency
              </label>
              <div className="relative">
                <select
                  id="donate-frequency"
                  value={interval}
                  onChange={(e) => setInterval(e.target.value as Interval)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                >
                  {config.intervals.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            {presets.map((value) => {
              const selected = amount === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => choosePreset(value)}
                  className={cn(
                    'rounded-xl border px-2 py-3.5 text-sm font-semibold transition sm:px-3',
                    selected
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                      : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
                  )}
                >
                  {formatPreset(value, currency)}
                </button>
              );
            })}
          </div>

          {/* Custom amount — currency left, amount right */}
          <div className="mt-3 flex min-h-[4.25rem] items-stretch overflow-hidden rounded-xl border border-slate-200 focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/15">
            <div className="flex w-[5.5rem] flex-col justify-center border-r border-slate-100 bg-white px-3 py-2">
              <span className="text-sm font-semibold text-slate-800">{currency.toUpperCase()}</span>
              <div className="relative mt-0.5">
                <select
                  aria-label="Currency"
                  value={currency}
                  onChange={(e) => onCurrencyChange(e.target.value as DonationCurrency)}
                  className="w-full appearance-none bg-transparent pr-4 text-[11px] font-medium text-slate-500 outline-none"
                >
                  {config.currencies.map((code) => (
                    <option key={code} value={code}>
                      {code.toUpperCase()}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={customDraft}
              onChange={(e) => onCustomChange(e.target.value)}
              onBlur={() => setCustomDraft(amount > 0 ? amount.toLocaleString() : '')}
              className="min-w-0 flex-1 bg-white px-4 py-3 text-right text-[1.75rem] font-bold tabular-nums leading-none text-slate-900 outline-none"
              aria-label="Custom amount"
            />
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-sm text-slate-800">
            <input
              type="checkbox"
              checked={dedicate}
              onChange={(e) => setDedicate(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            <span className="inline-flex items-center gap-1.5 font-medium">
              Dedicate my donation
              <span className="group relative">
                <Info className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-48 -translate-x-1/2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-center text-[11px] font-normal text-white shadow-lg group-hover:block">
                  Optionally name someone this gift honors. Shown only on our records.
                </span>
              </span>
            </span>
          </label>

          {dedicate && (
            <input
              type="text"
              value={dedicationName}
              onChange={(e) => setDedicationName(e.target.value)}
              placeholder="In honor / memory of…"
              maxLength={120}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            />
          )}

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* Soft teal CTA footer strip */}
        <div className="mt-5 bg-gradient-to-b from-amber-50/90 to-orange-50/50 px-6 pb-6 pt-5 sm:px-8">
          <button
            type="button"
            onClick={handleDonate}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3.5 text-base font-bold text-white transition hover:bg-[var(--accent)]/90"
          >
            {ctaLabel}
          </button>
        </div>
      </div>

      <p className="mt-5 px-4 text-center text-xs leading-relaxed text-slate-500">
        QuranPilot is building free access to the Quran for everyone. Secure payments by Stripe —
        card details never touch our servers.
      </p>
    </div>
  );
}
