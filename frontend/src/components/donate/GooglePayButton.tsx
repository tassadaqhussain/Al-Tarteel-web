'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe, type Stripe, type PaymentRequest } from '@stripe/stripe-js';
import { Loader2 } from 'lucide-react';
import { donationsApi, type DonationCurrency, type DonationInterval } from '@/lib/api';
import { cn } from '@/lib/utils';

type WalletKind = 'googlePay' | 'applePay' | 'demo' | null;

interface Props {
  amount: number;
  currency: DonationCurrency;
  mode: 'once' | 'recurring';
  interval?: DonationInterval;
  dedicate?: boolean;
  dedicationName?: string;
  customerEmail?: string;
  customerName?: string;
  country?: string;
  hideName?: boolean;
  className?: string;
}

function merchantCountry(currency: DonationCurrency, countryLabel?: string): string {
  const fromLabel: Record<string, string> = {
    Pakistan: 'PK',
    'United States': 'US',
    'United Kingdom': 'GB',
    Germany: 'DE',
    France: 'FR',
    Canada: 'CA',
    Australia: 'AU',
    'United Arab Emirates': 'AE',
    'Saudi Arabia': 'SA',
  };
  if (countryLabel && fromLabel[countryLabel]) return fromLabel[countryLabel];
  switch (currency) {
    case 'pkr':
      return 'PK';
    case 'gbp':
      return 'GB';
    case 'eur':
      return 'DE';
    default:
      return 'US';
  }
}

function toUnitAmount(amount: number, currency: string) {
  const zero = new Set(['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf']);
  if (zero.has(currency.toLowerCase())) return Math.round(amount);
  return Math.round(amount * 100);
}

export function GooglePayButton({
  amount,
  currency,
  mode,
  interval,
  dedicate,
  dedicationName,
  customerEmail,
  customerName,
  country,
  hideName,
  className,
}: Props) {
  const router = useRouter();
  const stripeRef = useRef<Stripe | null>(null);
  const paymentRequestRef = useRef<PaymentRequest | null>(null);
  const [wallet, setWallet] = useState<WalletKind>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setReady(false);
      setWallet(null);
      setError(null);

      try {
        const cfg = await donationsApi.config();
        if (cancelled) return;

        // Demo mode when Stripe keys are missing — always show G Pay simulator
        if (cfg.demoMode || !cfg.configured || !cfg.publishableKey) {
          setWallet('demo');
          setReady(true);
          return;
        }

        const stripe = await loadStripe(cfg.publishableKey);
        if (!stripe || cancelled) return;
        stripeRef.current = stripe;

        const unitAmount = toUnitAmount(amount, currency);
        const pr = stripe.paymentRequest({
          country: merchantCountry(currency, country),
          currency: currency.toLowerCase(),
          total: {
            label: 'QuranPilot Donation',
            amount: unitAmount,
          },
          requestPayerName: true,
          requestPayerEmail: true,
        });
        paymentRequestRef.current = pr;

        const canPay = await pr.canMakePayment();
        if (cancelled) return;

        if (canPay?.googlePay) setWallet('googlePay');
        else if (canPay?.applePay) setWallet('applePay');
        else setWallet('demo'); // fallback CTA still visible

        pr.on('paymentmethod', async (event) => {
          setLoading(true);
          setError(null);
          try {
            if (mode === 'recurring') {
              event.complete('success');
              const { url } = await donationsApi.checkout({
                amount,
                currency,
                mode: 'recurring',
                interval,
                dedicate,
                dedicationName,
                customerEmail: event.payerEmail || customerEmail,
                customerName: event.payerName || customerName,
                country,
                hideName,
              });
              window.location.assign(url);
              return;
            }

            const intent = await donationsApi.paymentIntent({
              amount,
              currency,
              mode: 'once',
              dedicate,
              dedicationName,
              customerEmail: event.payerEmail || customerEmail,
              customerName: event.payerName || customerName,
              country,
              hideName,
            });

            if (intent.demo) {
              event.complete('success');
              router.push(`/donate/success?payment_intent=${intent.paymentIntentId}&demo=1`);
              return;
            }

            const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
              intent.clientSecret,
              { payment_method: event.paymentMethod.id },
              { handleActions: false }
            );

            if (confirmError) {
              event.complete('fail');
              setError(confirmError.message || 'Google Pay payment failed.');
              setLoading(false);
              return;
            }

            if (paymentIntent?.status === 'requires_action') {
              const { error: actionError } = await stripe.confirmCardPayment(intent.clientSecret);
              if (actionError) {
                event.complete('fail');
                setError(actionError.message || 'Authentication failed.');
                setLoading(false);
                return;
              }
            }

            event.complete('success');
            router.push(`/donate/success?payment_intent=${intent.paymentIntentId}`);
          } catch (err) {
            event.complete('fail');
            setError(err instanceof Error ? err.message : 'Google Pay failed.');
            setLoading(false);
          }
        });

        setReady(true);
      } catch {
        if (!cancelled) {
          setWallet('demo');
          setReady(true);
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [
    amount,
    country,
    currency,
    customerEmail,
    customerName,
    dedicate,
    dedicationName,
    hideName,
    interval,
    mode,
    router,
  ]);

  const payDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'once') {
        const intent = await donationsApi.paymentIntent({
          amount,
          currency,
          mode: 'once',
          dedicate,
          dedicationName,
          customerEmail,
          customerName,
          country,
          hideName,
        });
        router.push(`/donate/success?payment_intent=${intent.paymentIntentId}&demo=1`);
        return;
      }
      const { url } = await donationsApi.checkout({
        amount,
        currency,
        mode: 'recurring',
        interval,
        dedicate,
        dedicationName,
        customerEmail,
        customerName,
        country,
        hideName,
      });
      window.location.assign(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo payment failed.');
      setLoading(false);
    }
  };

  const onClick = () => {
    if (wallet === 'demo' || !paymentRequestRef.current) {
      void payDemo();
      return;
    }
    paymentRequestRef.current.show();
  };

  if (!ready) {
    return (
      <div className={cn('flex h-12 items-center justify-center rounded-full bg-[var(--accent)]/10 text-sm text-[var(--accent)]', className)}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking Google Pay…
      </div>
    );
  }

  const label =
    wallet === 'applePay' ? 'Pay' : wallet === 'googlePay' ? 'Pay' : 'G Pay (Demo)';

  return (
    <div className={cn('space-y-2', className)}>
      <button
        type="button"
        disabled={loading}
        onClick={onClick}
        className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-[var(--accent)] text-sm font-semibold text-brand-contrast transition hover:bg-[var(--accent)]/90 disabled:opacity-60"
        aria-label="Donate with Google Pay"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" opacity=".9" />
              <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity=".85" />
              <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" opacity=".8" />
              <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" opacity=".75" />
            </svg>
            {label}
          </>
        )}
      </button>
      {error && (
        <p className="text-center text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
