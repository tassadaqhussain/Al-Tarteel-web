'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { Loader2, ShieldCheck } from 'lucide-react';
import { donationsApi, type DonationCurrency, type DonationInterval } from '@/lib/api';
import type { DonateDraft, DonorInfo } from '@/lib/donate-draft';

interface StripeDonatePaymentProps {
  draft: DonateDraft;
  info: DonorInfo;
  publishableKey: string;
  onError: (message: string) => void;
}

function checkoutBody(draft: DonateDraft, info: DonorInfo) {
  return {
    amount: draft.amount,
    currency: draft.currency as DonationCurrency,
    mode: draft.mode,
    interval: (draft.mode === 'recurring' ? draft.interval : undefined) as
      | DonationInterval
      | undefined,
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
  };
}

function PaymentForm({
  onError,
  returnUrl,
}: {
  onError: (message: string) => void;
  returnUrl: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    onError('');

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    // If redirected, this won't run. Errors stay on-page (validation, card declined).
    if (error) {
      onError(error.message || 'Payment could not be completed.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="mt-5">
      <PaymentElement
        options={{
          layout: 'tabs',
          wallets: {
            applePay: 'auto',
            googlePay: 'auto',
          },
        }}
      />
      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3.5 text-base font-bold text-brand-contrast transition hover:bg-[var(--accent)]/90 disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Processing…
          </>
        ) : (
          'Donate securely with Stripe'
        )}
      </button>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-brand">
        <ShieldCheck className="h-3.5 w-3.5" /> Card details are handled by Stripe — we never store them.
      </p>
    </form>
  );
}

export function StripeDonatePayment({
  draft,
  info,
  publishableKey,
  onError,
}: StripeDonatePaymentProps) {
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey]);

  const returnUrl = useMemo(() => {
    if (typeof window === 'undefined') return '/donate/success';
    return `${window.location.origin}/donate/success`;
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setClientSecret(null);

    donationsApi
      .paymentIntent(checkoutBody(draft, info))
      .then((intent) => {
        if (cancelled) return;
        if (intent.demo) {
          router.push(`/donate/success?payment_intent=${intent.paymentIntentId}&demo=1`);
          return;
        }
        setClientSecret(intent.clientSecret);
      })
      .catch((err) => {
        if (cancelled) return;
        onError(err instanceof Error ? err.message : 'Could not start Stripe payment.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // Create once when entering payment step (draft/info snapshot)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid recreating PaymentIntent on parent re-renders
  }, [draft.amount, draft.currency, draft.mode, draft.interval, info.email]);

  if (loading) {
    return (
      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-ink-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Preparing secure Stripe payment…
      </div>
    );
  }

  if (!clientSecret) return null;

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#b45309',
        borderRadius: '10px',
        fontFamily: 'system-ui, sans-serif',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm onError={onError} returnUrl={returnUrl} />
    </Elements>
  );
}
