import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const TOPICS = [
  { label: 'Verses About the Sunnah', q: 'sunnah' },
  { label: 'About the Quran', q: 'quran' },
  { label: 'What Is Ramadan?', q: 'ramadan' },
  { label: 'Patience & Trust', q: 'patience' },
  { label: 'Mercy of Allah', q: 'mercy' },
  { label: 'Prayer', q: 'prayer' },
];

export function ExploreTopics() {
  return (
    <section className="w-full px-3 py-3 sm:px-4 sm:py-4 md:px-6">
      <h2 className="mb-3 text-lg font-bold text-ink sm:mb-4 sm:text-xl md:text-2xl">
        Explore Topics
      </h2>
      <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:-mx-4 sm:gap-3 sm:px-4 md:-mx-6 md:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TOPICS.map((topic) => (
          <Link
            key={topic.q}
            href={`/search?q=${encodeURIComponent(topic.q)}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surface-3 px-3.5 py-2 text-sm font-medium text-ink-2 transition hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] sm:px-4 sm:py-2.5"
          >
            {topic.label}
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          </Link>
        ))}
      </div>
    </section>
  );
}
