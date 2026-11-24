'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEFAULT_CONTENT_LOCALE, type ContentLocale } from '@/lib/i18n/content-locales';

type ContactType = 'mistake' | 'feature' | 'general';

const FORM_COPY: Record<
  ContentLocale,
  {
    legend: string;
    topics: { id: ContactType; label: string; hint: string }[];
    refLabel: string;
    nameLabel: string;
    emailLabel: string;
    optional: string;
    messageLabel: string;
    submit: string;
    sendAnother: string;
    doneNote: string;
  }
> = {
  en: {
    legend: 'What is this about?',
    topics: [
      {
        id: 'mistake',
        label: 'Report a mistake in text / translation / audio',
        hint: 'Typo, missing diacritic, misaligned audio, or source attribution issue',
      },
      {
        id: 'feature',
        label: 'Feature request',
        hint: 'Suggest a new reading, audio, or learning capability',
      },
      {
        id: 'general',
        label: 'General inquiry',
        hint: 'Questions, partnerships, or other notes',
      },
    ],
    refLabel: 'Surah / Ayah reference',
    nameLabel: 'Your name',
    emailLabel: 'Email',
    optional: '(optional)',
    messageLabel: 'Message',
    submit: 'Send message',
    sendAnother: 'Send another message',
    doneNote:
      'We review every report carefully—especially reports about Quranic text, translations, or audio alignment.',
  },
  ur: {
    legend: 'آپ کا پیغام کس بارے میں ہے؟',
    topics: [
      {
        id: 'mistake',
        label: 'متن / ترجمہ / آڈیو میں غلطی کی نشاندہی',
        hint: 'املا، اعراب، ترجمہ یا آڈیو کی ترتیب کا مسئلہ',
      },
      {
        id: 'feature',
        label: 'نئی سہولت کی تجویز',
        hint: 'پڑھنے، آڈیو یا سیکھنے سے متعلق کوئی تجویز',
      },
      {
        id: 'general',
        label: 'عمومی سوال یا پیغام',
        hint: 'سوالات یا دیگر پیغامات',
      },
    ],
    refLabel: 'سورہ / آیت کا حوالہ',
    nameLabel: 'آپ کا نام',
    emailLabel: 'ای میل',
    optional: '(اختیاری)',
    messageLabel: 'پیغام',
    submit: 'پیغام بھیجیں',
    sendAnother: 'ایک اور پیغام بھیجیں',
    doneNote: 'ہم ہر پیغام کا بغور جائزہ لیتے ہیں، بالخصوص قرآنی متن اور ترجمے سے متعلق رپورٹس کا۔',
  },
  ps: {
    legend: 'ستاسو پیغام د څه په اړه دی؟',
    topics: [
      {
        id: 'mistake',
        label: 'په متن / ژباړه / غږ کې د تېروتنې راپور',
        hint: 'لیکدود، اعراب، ژباړه یا غږیزه ستونزه',
      },
      {
        id: 'feature',
        label: 'د نوې اسانتیا وړاندیز',
        hint: 'د لوستلو، غږ یا زده‌کړې په اړه وړاندیز',
      },
      {
        id: 'general',
        label: 'عمومي پوښتنه یا پیغام',
        hint: 'پوښتنې یا نور پیغامونه',
      },
    ],
    refLabel: 'د سورت / آیت حواله',
    nameLabel: 'ستاسو نوم',
    emailLabel: 'برېښنالیک',
    optional: '(اختیاري)',
    messageLabel: 'پیغام',
    submit: 'پیغام ولېږئ',
    sendAnother: 'بل پیغام ولېږئ',
    doneNote: 'موږ هر راپور په دقت سره ګورو، په ځانګړي ډول د قرآني متن او ژباړې اړوند راپورونه.',
  },
  fa: {
    legend: 'موضوع پیام شما چیست؟',
    topics: [
      {
        id: 'mistake',
        label: 'گزارش خطا در متن / ترجمه / صوت',
        hint: 'اشکال املایی، اعراب، ترجمه یا هماهنگی صوت',
      },
      {
        id: 'feature',
        label: 'پیشنهاد ویژگی جدید',
        hint: 'پیشنهاد برای مطالعه، صوت یا یادگیری',
      },
      {
        id: 'general',
        label: 'پرسش عمومی',
        hint: 'سوالات یا یادداشت‌های دیگر',
      },
    ],
    refLabel: 'مرجع سوره / آیه',
    nameLabel: 'نام شما',
    emailLabel: 'ایمیل',
    optional: '(اختیاری)',
    messageLabel: 'پیام',
    submit: 'ارسال پیام',
    sendAnother: 'ارسال پیام دیگر',
    doneNote: 'ما همه گزارش‌ها به‌ویژه گزارش‌های مربوط به متن قرآن، ترجمه و صوت را با دقت بررسی می‌کنیم.',
  },
};

export function ContactForm({ locale = DEFAULT_CONTENT_LOCALE }: { locale?: ContentLocale }) {
  const copy = FORM_COPY[locale];
  const searchParams = useSearchParams();
  const [type, setType] = useState<ContactType>('general');
  const [reference, setReference] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  /** Honeypot field — hidden from humans, traps automated spam bots. */
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const rawType = searchParams.get('type')?.toLowerCase();
    if (rawType === 'mistake' || rawType === 'feature' || rawType === 'general') {
      setType(rawType);
    }
    const rawRef = searchParams.get('ref');
    if (rawRef) {
      setReference(rawRef.slice(0, 80));
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(null);

    if (message.trim().length < 10) {
      setError('Please write at least 10 characters so we can review your message properly.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          reference: reference.trim() || undefined,
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          message: message.trim(),
          website,
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!res.ok) {
        setError(data.error || 'Could not send your message. Please try again.');
        return;
      }
      setDone(data.message || 'Thank you! Your message has been received.');
      setMessage('');
      setReference('');
    } catch {
      setError('Network error while sending your message. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-brand/25 bg-brand/10 p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-brand" aria-hidden />
          <div>
            <p className="font-semibold text-ink">{done}</p>
            <p className="mt-1.5 text-sm text-ink-3">{copy.doneNote}</p>
            <button
              type="button"
              onClick={() => setDone(null)}
              className="mt-4 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-brand-contrast transition hover:opacity-90"
            >
              {copy.sendAnother}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-line bg-surface p-5 sm:p-7"
    >
      {/* Honeypot field hidden off-screen */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-ink">{copy.legend}</legend>
        <div className="mt-2.5 grid gap-2.5">
          {copy.topics.map((topic) => (
            <label
              key={topic.id}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition',
                type === topic.id
                  ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                  : 'border-line bg-surface-2/40 hover:border-line-strong',
              )}
            >
              <input
                type="radio"
                name="contact-type"
                value={topic.id}
                checked={type === topic.id}
                onChange={() => setType(topic.id)}
                className="mt-1 accent-[var(--accent)]"
              />
              <span>
                <span className="block text-sm font-semibold text-ink">{topic.label}</span>
                <span className="block text-xs text-ink-muted">{topic.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {type === 'mistake' && (
        <div>
          <label htmlFor="contact-ref" className="block text-sm font-semibold text-ink">
            {copy.refLabel} <span className="font-normal text-ink-muted">{copy.optional}</span>
          </label>
          <input
            id="contact-ref"
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. 67:1 or Al-Mulk 1"
            className="mt-1.5 w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-semibold text-ink">
            {copy.nameLabel} <span className="font-normal text-ink-muted">{copy.optional}</span>
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={copy.nameLabel}
            className="mt-1.5 w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-sm font-semibold text-ink">
            {copy.emailLabel} <span className="font-normal text-ink-muted">{copy.optional}</span>
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1.5 w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-semibold text-ink">
          {copy.messageLabel}
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-[var(--accent)] focus:outline-none"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-danger-surface px-3.5 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold text-brand-contrast transition hover:opacity-90',
          submitting && 'opacity-70',
        )}
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {copy.submit}
      </button>
    </form>
  );
}
