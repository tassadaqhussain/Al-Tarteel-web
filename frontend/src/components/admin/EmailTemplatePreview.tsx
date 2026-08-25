import type { ReactNode } from 'react';
import { EMAIL_LAYOUTS, type EmailLayoutId } from '@/lib/email-layouts';

const SITE = 'https://quranpilot.com';

function Body({ body, className = '' }: { body: string; className?: string }) {
  const paragraphs = body
    .trim()
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!paragraphs.length) {
    return <p className="text-slate-400">Your message will appear here.</p>;
  }
  return (
    <div className={`space-y-4 text-base leading-relaxed text-slate-800 ${className}`}>
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-wrap">
          {p}
        </p>
      ))}
    </div>
  );
}

function ButtonPreview({ label, href, className }: { label: string; href: string; className: string }) {
  return (
    <a href={href} className={className} onClick={(e) => e.preventDefault()}>
      {label}
    </a>
  );
}

function Logo({ size = 36 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/logo.png"
      alt=""
      width={size}
      height={size}
      className="rounded bg-white object-contain"
      style={{ width: size, height: size }}
    />
  );
}

export function EmailTemplatePreview({
  name,
  subject,
  body,
  ctaLabel,
  ctaUrl,
  layout,
}: {
  name: string;
  subject: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  layout: EmailLayoutId;
}) {
  const greeting = name.trim() || 'there';
  const headline = subject.trim() || 'Your message from QuranPilot';
  const button = ctaLabel.trim() || 'Open QuranPilot';
  const href = ctaUrl.trim() || SITE;
  const year = new Date().getFullYear();
  const layoutLabel = EMAIL_LAYOUTS.find((item) => item.id === layout)?.label ?? 'Classic';

  let preview: ReactNode;
  switch (layout) {
    case 'letter':
      preview = (
        <div className="bg-[#f1f5f4] p-4">
          <div className="mx-auto max-w-[600px] border-t-4 border-[#065f46] bg-white px-8 py-9 font-serif">
            <p className="text-xs uppercase tracking-[0.14em] text-emerald-800">QuranPilot</p>
            <p className="mt-7 text-base text-slate-700">Assalamu alaikum, {greeting},</p>
            <h3 className="mt-5 text-2xl font-normal leading-snug text-slate-900">{headline}</h3>
            <div className="mt-4">
              <Body body={body} />
            </div>
            <ButtonPreview
              label={button}
              href={href}
              className="mt-7 inline-block rounded bg-[#065f46] px-5 py-3 text-sm font-bold text-white no-underline"
            />
            <p className="mt-8 text-[15px] text-slate-700">
              With peace,
              <br />
              QuranPilot
            </p>
            <p className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500">
              quranpilot.com · © {year} QuranPilot
            </p>
          </div>
        </div>
      );
      break;
    case 'announcement':
      preview = (
        <div className="bg-[#063a32] p-4">
          <div className="mx-auto max-w-[600px] overflow-hidden bg-white shadow-sm">
            <div className="h-1.5 bg-[#c08829]" />
            <div className="bg-[#063a32] px-6 py-8 font-serif">
              <div className="mb-4">
                <Logo size={40} />
              </div>
              <p className="text-xs uppercase tracking-[0.16em] text-amber-300">From QuranPilot</p>
              <h3 className="mt-2 text-2xl font-bold leading-snug text-white">{headline}</h3>
            </div>
            <div className="px-6 py-7 font-serif">
              <p className="mb-4 text-[15px] text-emerald-800">Assalamu alaikum, {greeting}</p>
              <Body body={body} />
              <ButtonPreview
                label={button}
                href={href}
                className="mt-7 inline-block rounded bg-[#c08829] px-5 py-3 text-sm font-bold text-stone-900 no-underline"
              />
              <p className="mt-8 text-sm text-slate-500">
                Peace and blessings,
                <br />
                The QuranPilot team
              </p>
            </div>
          </div>
        </div>
      );
      break;
    case 'reminder':
      preview = (
        <div className="bg-[#e8eee9] p-4">
          <div className="mx-auto max-w-[600px] border-l-[6px] border-[#c08829] bg-white px-7 py-7 font-serif">
            <p className="text-xs uppercase tracking-[0.14em] text-amber-700">A reminder</p>
            <p className="mt-1 text-sm text-emerald-800">QuranPilot · Assalamu alaikum, {greeting}</p>
            <h3 className="mt-4 text-xl font-bold leading-snug text-slate-900">{headline}</h3>
            <div className="mt-4">
              <Body body={body} />
            </div>
            <ButtonPreview
              label={button}
              href={href}
              className="mt-6 inline-block rounded bg-[#065f46] px-5 py-3 text-sm font-bold text-white no-underline"
            />
            <p className="mt-5 text-xs text-slate-500">quranpilot.com · © {year} QuranPilot</p>
          </div>
        </div>
      );
      break;
    case 'digest':
      preview = (
        <div className="bg-[#e7ece9] p-4">
          <div className="mx-auto max-w-[600px] overflow-hidden bg-white shadow-sm">
            <div className="flex items-center justify-between bg-[#0b3d34] px-6 py-4 font-serif text-sm">
              <span className="text-emerald-200">QuranPilot digest</span>
              <span className="text-amber-300">For {greeting}</span>
            </div>
            <div className="px-6 py-7 font-serif">
              <h3 className="text-2xl font-bold leading-snug text-slate-900">{headline}</h3>
              <p className="mt-2 text-sm text-slate-500">Assalamu alaikum — here is something worth your time.</p>
              <div className="mt-5 border-t border-slate-200 pt-5">
                <Body body={body} />
              </div>
              <ButtonPreview
                label={button}
                href={href}
                className="mt-6 inline-block rounded bg-[#065f46] px-5 py-3 text-sm font-bold text-white no-underline"
              />
            </div>
          </div>
        </div>
      );
      break;
    case 'invite':
      preview = (
        <div className="bg-[#dff5ee] p-4">
          <div className="mx-auto max-w-[600px] bg-white px-8 py-10 text-center font-serif shadow-sm">
            <div className="mx-auto mb-4 flex justify-center">
              <Logo size={48} />
            </div>
            <p className="text-xs uppercase tracking-[0.16em] text-emerald-700">An invitation</p>
            <h3 className="mt-3 text-2xl font-bold leading-snug text-emerald-950">{headline}</h3>
            <p className="mt-3 text-[15px] text-emerald-800">Assalamu alaikum, {greeting}</p>
            <div className="mx-auto mt-5 max-w-md text-left">
              <Body body={body} />
            </div>
            <ButtonPreview
              label={button}
              href={href}
              className="mt-7 inline-block rounded bg-emerald-700 px-5 py-3 text-sm font-bold text-white no-underline"
            />
            <p className="mt-5 text-xs text-slate-500">
              © {year} QuranPilot · quranpilot.com
            </p>
          </div>
        </div>
      );
      break;
    case 'focus':
      preview = (
        <div className="bg-white p-4">
          <div className="mx-auto max-w-[600px] px-10 py-12 text-center font-serif">
            <p className="text-sm text-emerald-800">QuranPilot</p>
            <h3 className="mt-6 text-3xl font-bold leading-snug text-slate-900">{headline}</h3>
            <p className="mt-4 text-[15px] text-slate-600">Assalamu alaikum, {greeting}</p>
            <div className="mx-auto mt-6 max-w-sm text-left">
              <Body body={body} />
            </div>
            <ButtonPreview
              label={button}
              href={href}
              className="mt-8 inline-block rounded bg-slate-900 px-5 py-3 text-sm font-bold text-white no-underline"
            />
            <p className="mt-7 text-xs text-slate-400">
              © {year} · quranpilot.com
            </p>
          </div>
        </div>
      );
      break;
    case 'gratitude':
      preview = (
        <div className="bg-[#f3f0e8] p-4">
          <div className="mx-auto max-w-[600px] overflow-hidden bg-[#fffdf8] shadow-sm">
            <div className="h-1.5 bg-[#c08829]" />
            <div className="px-8 py-9 font-serif">
              <p className="text-xs uppercase tracking-[0.14em] text-amber-700">With gratitude</p>
              <p className="mt-3 text-[15px] text-emerald-800">Assalamu alaikum, {greeting}</p>
              <h3 className="mt-4 text-2xl font-bold leading-snug text-stone-900">{headline}</h3>
              <div className="mt-4">
                <Body body={body} />
              </div>
              <ButtonPreview
                label={button}
                href={href}
                className="mt-7 inline-block rounded bg-[#065f46] px-5 py-3 text-sm font-bold text-white no-underline"
              />
              <p className="mt-8 text-sm text-slate-500">
                Peace and blessings,
                <br />
                The QuranPilot team
              </p>
            </div>
            <div className="border-t border-stone-200 px-8 py-4 text-xs text-stone-500">
              © {year} QuranPilot · quranpilot.com
            </div>
          </div>
        </div>
      );
      break;
    default:
      preview = (
        <div className="bg-[#eef3f0] p-4">
          <div className="mx-auto max-w-[600px] bg-white shadow-sm">
            <div className="h-1.5 bg-[#c08829]" />
            <div className="flex items-center gap-3 bg-[#063a32] px-6 py-5">
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded bg-white">
                <Logo size={36} />
              </span>
              <div>
                <p className="font-serif text-lg font-bold text-white">QuranPilot</p>
                <p className="text-xs text-emerald-100">Read, listen, and understand the Quran</p>
              </div>
            </div>
            <div className="px-6 py-8 font-serif">
              <p className="text-[15px] text-emerald-800">Assalamu alaikum, {greeting}</p>
              <h3 className="mt-3 text-2xl font-bold leading-snug text-slate-900">{headline}</h3>
              <div className="mt-4">
                <Body body={body} />
              </div>
              <ButtonPreview
                label={button}
                href={href}
                className="mt-8 inline-block rounded bg-[#065f46] px-5 py-3 text-sm font-bold text-white no-underline"
              />
              <p className="mt-8 text-sm leading-relaxed text-slate-500">
                Peace and blessings,
                <br />
                The QuranPilot team
              </p>
            </div>
            <div className="bg-[#063a32] px-6 py-5 font-serif text-xs leading-relaxed">
              <p className="text-emerald-50">
                <span className="text-amber-300">quranpilot.com</span>
                {' · '}
                Chapters · Learning plans
              </p>
              <p className="mt-1 text-emerald-300">
                © {year} QuranPilot. You received this because you have a registered QuranPilot account.
              </p>
            </div>
          </div>
        </div>
      );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line dark:border-slate-800">
      <p className="border-b border-line bg-slate-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-ink-3 dark:border-slate-800 dark:bg-slate-900">
        {layoutLabel} template
      </p>
      {preview}
    </div>
  );
}
