'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { donationsApi } from '@/lib/api';
import { clearDonateDraft } from '@/lib/donate-draft';

function formatAmount(amount: number | null, currency: string | null) {
  if (amount == null || !currency) return null;
  const major = amount / 100;
  return `${currency.toUpperCase()} ${major.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
}

function SuccessBody() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const paymentIntent = searchParams.get('payment_intent');
  const demo = searchParams.get('demo') === '1';
  const [email, setEmail] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(demo);
  const [amountLabel, setAmountLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(sessionId || paymentIntent));

  useEffect(() => {
    clearDonateDraft();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (sessionId) {
          const session = await donationsApi.session(sessionId);
          if (cancelled) return;
          setEmail(session.customerEmail);
          setIsDemo(Boolean(session.demo || demo));
          setAmountLabel(formatAmount(session.amountTotal, session.currency));
          return;
        }
        if (paymentIntent) {
          const intent = await donationsApi.paymentIntentStatus(paymentIntent);
          if (cancelled) return;
          setEmail(intent.customerEmail);
          setIsDemo(Boolean(intent.demo || demo));
          setAmountLabel(formatAmount(intent.amount, intent.currency));
        }
      } catch {
        /* still show thank-you */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [demo, paymentIntent, sessionId]);

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        {loading ? <Loader2 className="h-7 w-7 animate-spin" /> : <CheckCircle2 className="h-8 w-8" />}
      </div>
      <h1 className="mt-5 text-2xl font-bold text-slate-900">JazakAllahu Khairan</h1>
      {isDemo && (
        <p className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
          Demo payment completed — no real charge
        </p>
      )}
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Your donation helps keep QuranPilot free for readers around the world.
        {amountLabel ? ` Amount: ${amountLabel}.` : ''}
        {email ? ` A receipt will be sent to ${email}.` : ''}
        {!email && paymentIntent && !sessionId && !isDemo
          ? ' Your Stripe payment was received.'
          : ''}
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/"
          className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--accent)]/90"
        >
          Back to home
        </Link>
        <Link
          href="/surahs"
          className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300"
        >
          Continue reading
        </Link>
        <Link href="/donate" className="text-sm font-medium text-[var(--accent)] hover:underline">
          Give again
        </Link>
      </div>
    </div>
  );
}

export default function DonateSuccessPage() {
  return (
    <div className="min-h-screen bg-[#eef2f5] pb-20">
      <Header />
      <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-14">
        <Suspense fallback={<div className="h-64 w-full max-w-md animate-pulse rounded-2xl bg-white" />}>
          <SuccessBody />
        </Suspense>
      </main>
    </div>
  );
}
