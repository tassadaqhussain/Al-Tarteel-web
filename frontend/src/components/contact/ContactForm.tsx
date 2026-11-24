'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

type ContactType = 'mistake' | 'feature' | 'general';

const TOPICS: { id: ContactType; label: string; hint: string }[] = [
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
];

export function ContactForm() {
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
            <p className="mt-1.5 text-sm text-ink-3">
              We review every report carefully—especially reports about Quranic text, translations,
              or audio alignment.
            </p>
            <button
              type="button"
              onClick={() => setDone(null)}
              className="mt-4 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-brand-contrast transition hover:opacity-90"
            >
              Send another message
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
        <legend className="text-sm font-semibold text-ink">What is this about?</legend>
        <div className="mt-2.5 grid gap-2.5">
          {TOPICS.map((topic) => (
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
            Surah / Ayah reference <span className="font-normal text-ink-muted">(optional)</span>
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
            Your name <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="mt-1.5 w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-sm font-semibold text-ink">
            Email <span className="font-normal text-ink-muted">(optional, for replies)</span>
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
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            type === 'mistake'
              ? 'Describe the exact verse, translation, or audio reciter and what looks wrong...'
              : 'How can we help?'
          }
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
        Send message
      </button>
    </form>
  );
}
