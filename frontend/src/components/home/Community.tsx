import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

const REFLECTIONS = [
  {
    ref: 'Al-Baqarah 2:286',
    text: 'A reminder that Allah does not burden a soul beyond what it can bear — every trial comes with the capacity to endure it.',
  },
  {
    ref: 'Ash-Sharh 94:5-6',
    text: '"With hardship comes ease" is repeated twice — a call to hold onto hope even in the middle of difficulty.',
  },
  {
    ref: 'Al-Fatihah 1:5',
    text: 'Every rakah begins with this verse: worship and reliance belong to Allah alone, a daily reset of intention.',
  },
];

export function Community() {
  return (
    <section className="w-full px-3 py-3 sm:px-4 sm:py-4 md:px-6">
      <div className="mb-3 flex flex-col gap-1 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h2 className="text-lg font-bold text-slate-800 sm:text-xl md:text-2xl">
          Reflect on the Quran
        </h2>
        <Link
          href="/search"
          className="shrink-0 text-sm font-medium text-slate-600 transition hover:text-[var(--accent)]"
        >
          Explore verses
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {REFLECTIONS.map((r) => (
          <div
            key={r.ref}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <p className="text-sm leading-relaxed text-slate-600">{r.text}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
              {r.ref}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 sm:mt-6">
        <MessageCircle className="h-4 w-4 shrink-0 text-[var(--accent)]" />
        Reflections and community sharing are on our roadmap — for now, explore the Quran and start your own notes from any verse.
      </div>
    </section>
  );
}
