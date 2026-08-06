'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Loader2, ShieldCheck } from 'lucide-react';
import { donationsApi } from '@/lib/api';
import {
  countryFromCurrency,
  formatDonateAmount,
  loadDonateDraft,
  modeLabel,
  type DonateDraft,
  type DonorInfo,
} from '@/lib/donate-draft';
import { StripeDonatePayment } from '@/components/donate/StripeDonatePayment';
import { cn } from '@/lib/utils';

const COUNTRIES = [
  'Pakistan',
  'United States',
  'United Kingdom',
  'Germany',
  'France',
  'Canada',
  'Australia',
  'United Arab Emirates',
  'Saudi Arabia',
  'Other',
];

const fieldClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15';

export function DonateCheckoutForm() {
  const router = useRouter();
  const [draft, setDraft] = useState<DonateDraft | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<DonorInfo>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    zip: '',
    city: '',
    state: '',
    country: 'United States',
    hideName: false,
    asOrganization: false,
    organizationName: '',
  });

  useEffect(() => {
    const loaded = loadDonateDraft();
    if (!loaded) {
      router.replace('/donate');
      return;
    }
    setDraft(loaded);
    setInfo((prev) => ({ ...prev, country: countryFromCurrency(loaded.currency) }));
  }, [router]);

  useEffect(() => {
    donationsApi
      .config()
      .then((cfg) => {
        const demo = Boolean(cfg.demoMode || !cfg.configured || !cfg.publishableKey);
        setDemoMode(demo);
        setPublishableKey(cfg.publishableKey);
      })
      .catch(() => {
        setDemoMode(true);
        setPublishableKey(null);
      })
      .finally(() => setConfigLoaded(true));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('canceled') === '1') {
      setStep(2);
      setError('Checkout canceled — you can try payment again.');
      params.delete('canceled');
      const qs = params.toString();
      window.history.replaceState({}, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
    }
  }, []);

  const summary = useMemo(() => {
    if (!draft) return '';
    return `${formatDonateAmount(draft.amount, draft.currency)} / ${modeLabel(draft.mode, draft.interval)}`;
  }, [draft]);

  const setPaymentError = useCallback((message: string) => {
    setError(message || null);
  }, []);

  const onSubmitInfo = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!info.firstName.trim() || !info.lastName.trim() || !info.email.trim()) {
      setError('Please enter your first name, last name, and email.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    setStep(2);
  };

  /** Demo / fallback when Stripe keys are missing */
  const completeDemoPayment = async () => {
    if (!draft) return;
    setError(null);
    setLoading(true);
    try {
      const intent = await donationsApi.paymentIntent({
        amount: draft.amount,
        currency: draft.currency,
        mode: draft.mode,
        interval: draft.mode === 'recurring' ? draft.interval : undefined,
        dedicate: draft.dedicate,
        dedicationName: draft.dedicationName,
        customerEmail: info.email.trim(),
        customerName: `${info.firstName.trim()} ${info.lastName.trim()}`.trim(),
        country: info.country,
        hideName: info.hideName,
        asOrganization: info.asOrganization,
        organizationName: info.asOrganization ? info.organizationName?.trim() : undefined,
        address: info.address.trim() || undefined,
        city: info.city.trim() || undefined,
        state: info.state.trim() || undefined,
        zip: info.zip.trim() || undefined,
      });
      router.push(`/donate/success?payment_intent=${intent.paymentIntentId}&demo=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete demo payment.');
      setLoading(false);
    }
  };

  if (!draft || !configLoaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] pb-16">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="relative mx-auto flex h-14 max-w-3xl items-center px-4 sm:px-6">
          <Link
            href="/donate"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Link>
          <p className="pointer-events-none absolute inset-x-0 text-center text-sm font-extrabold tracking-[0.14em] text-slate-900">
            QURANPILOT
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Checkout</p>
              <h1 className="mt-1 text-lg font-bold text-slate-900">Complete your donation</h1>
              {demoMode && (
                <p className="mt-2 inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                  Demo payment — add Stripe keys for live checkout
                </p>
              )}
            </div>
            <p className="shrink-0 text-right text-sm font-semibold text-slate-800">{summary}</p>
          </div>

          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 sm:px-7">
            {[
              { n: 1, label: 'Your info' },
              { n: 2, label: 'Payment' },
            ].map((s, i) => {
              const active = step === s.n;
              const done = step > s.n;
              return (
                <div key={s.n} className="flex min-w-0 flex-1 items-center gap-2">
                  <div
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      active || done ? 'bg-[var(--accent)] text-white' : 'bg-slate-200 text-slate-500'
                    )}
                  >
                    {s.n}
                  </div>
                  <span
                    className={cn(
                      'truncate text-sm font-medium',
                      active ? 'text-slate-900' : 'text-slate-500'
                    )}
                  >
                    {s.label}
                  </span>
                  {i === 0 && <div className="mx-1 h-px flex-1 bg-slate-200" />}
                </div>
              );
            })}
          </div>

          {step === 1 ? (
            <form onSubmit={onSubmitInfo} className="px-5 py-6 sm:px-7">
              <h2 className="text-base font-bold text-slate-900">Your info</h2>
              <p className="mt-1 text-sm text-slate-500">
                Next you&apos;ll pay securely with Stripe (cards, Apple Pay, Google Pay).
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-slate-700">First Name</span>
                  <input
                    required
                    value={info.firstName}
                    onChange={(e) => setInfo((p) => ({ ...p, firstName: e.target.value }))}
                    className={fieldClass}
                    autoComplete="given-name"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-slate-700">Last Name</span>
                  <input
                    required
                    value={info.lastName}
                    onChange={(e) => setInfo((p) => ({ ...p, lastName: e.target.value }))}
                    className={fieldClass}
                    autoComplete="family-name"
                  />
                </label>
              </div>

              <label className="mt-3 block text-sm">
                <span className="mb-1.5 block font-medium text-slate-700">Email</span>
                <input
                  required
                  type="email"
                  value={info.email}
                  onChange={(e) => setInfo((p) => ({ ...p, email: e.target.value }))}
                  className={fieldClass}
                  autoComplete="email"
                />
              </label>

              <label className="mt-3 block text-sm">
                <span className="mb-1.5 block font-medium text-slate-700">Address</span>
                <input
                  value={info.address}
                  onChange={(e) => setInfo((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Enter a location"
                  className={fieldClass}
                  autoComplete="street-address"
                />
              </label>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-slate-700">Zip code</span>
                  <input
                    value={info.zip}
                    onChange={(e) => setInfo((p) => ({ ...p, zip: e.target.value }))}
                    className={fieldClass}
                    autoComplete="postal-code"
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1.5 block font-medium text-slate-700">City</span>
                  <input
                    value={info.city}
                    onChange={(e) => setInfo((p) => ({ ...p, city: e.target.value }))}
                    className={fieldClass}
                    autoComplete="address-level2"
                  />
                </label>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-slate-700">State</span>
                  <input
                    value={info.state}
                    onChange={(e) => setInfo((p) => ({ ...p, state: e.target.value }))}
                    className={fieldClass}
                    autoComplete="address-level1"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-slate-700">Country</span>
                  <select
                    value={info.country}
                    onChange={(e) => setInfo((p) => ({ ...p, country: e.target.value }))}
                    className={fieldClass}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={info.hideName}
                  onChange={(e) => setInfo((p) => ({ ...p, hideName: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                Hide my name from the public
              </label>

              <label className="mt-2.5 flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={info.asOrganization}
                  onChange={(e) => setInfo((p) => ({ ...p, asOrganization: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                Donate as an organization
              </label>

              {info.asOrganization && (
                <input
                  value={info.organizationName}
                  onChange={(e) => setInfo((p) => ({ ...p, organizationName: e.target.value }))}
                  placeholder="Organization name"
                  className={cn(fieldClass, 'mt-2')}
                />
              )}

              {error && (
                <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="mt-6 w-full rounded-full bg-[var(--accent)] px-5 py-3.5 text-base font-bold text-white transition hover:bg-[var(--accent)]/90"
              >
                Continue to payment
              </button>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" /> Payments are processed securely by Stripe.
              </p>
            </form>
          ) : (
            <div className="px-5 py-6 sm:px-7">
              <h2 className="text-base font-bold text-slate-900">Payment</h2>
              <p className="mt-2 text-sm text-slate-600">
                Pay with card, Apple Pay, or Google Pay — powered by Stripe.
              </p>

              <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <p>
                  <span className="font-semibold">Donor:</span> {info.firstName} {info.lastName}
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Email:</span> {info.email}
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Country:</span> {info.country}
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Amount:</span> {summary}
                </p>
              </div>

              {error && (
                <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}

              {!demoMode && publishableKey ? (
                <StripeDonatePayment
                  draft={draft}
                  info={info}
                  publishableKey={publishableKey}
                  onError={setPaymentError}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => void completeDemoPayment()}
                  disabled={loading}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3.5 text-base font-bold text-white transition hover:bg-[var(--accent)]/90 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Completing…
                    </>
                  ) : (
                    'Complete demo payment'
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep(1);
                }}
                disabled={loading}
                className="mt-3 w-full rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300"
              >
                Back to your info
              </button>
            </div>
          )}
        </div>

        <p className="mt-5 px-2 text-center text-xs leading-relaxed text-slate-500">
          QuranPilot uses Stripe as its payment gateway. Your card details never touch our servers.
        </p>
      </main>
    </div>
  );
}
