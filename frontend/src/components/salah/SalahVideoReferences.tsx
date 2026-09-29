'use client';

import { ExternalLink } from 'lucide-react';

/** Curated beginner references for standard salah postures (not hosted by QuranPilot). */
const REFERENCES = [
  {
    title: 'How to pray Fajr (animated, beginners)',
    source: 'Adam — Islamic Animation · YouTube',
    href: 'https://www.youtube.com/watch?v=YhgSe6DFK-0',
    embedId: 'YhgSe6DFK-0',
    note: 'Clear 3D motion of a full 2-rak‘ah prayer — widely used by beginners.',
  },
  {
    title: 'How Do I Pray (classic animation)',
    source: 'howdoipray.com',
    href: 'http://www.howdoipray.com/howdoipray/Home/default.asp',
    embedId: null,
    note: 'Long-running beginner animation accepted as a basic method overview.',
  },
  {
    title: 'Muslim prayer movements (photo guide)',
    source: 'BBC Religion',
    href: 'https://www.bbc.co.uk/religion/galleries/salah/',
    embedId: null,
    note: 'Photo sequence of qiyam, ruku, sujud, and sitting.',
  },
  {
    title: 'Interactive salah simulator',
    source: 'Quran In Depth',
    href: 'https://www.quranindepth.com/tools/salah-simulator',
    embedId: null,
    note: 'Step walkthrough with posture labels for all five daily prayers.',
  },
] as const;

type Props = {
  primaryEmbedId?: string;
};

export function SalahVideoReferences({ primaryEmbedId = 'YhgSe6DFK-0' }: Props) {
  return (
    <section className="space-y-4 rounded-3xl border border-line bg-surface p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-ink">Standard motion videos</h2>
        <p className="mt-1 text-sm leading-6 text-ink-muted">
          Our silhouette is a simplified teaching aid. Watch a full animated prayer below for
          standard body positions (ruku back level, sujood on seven points, calm sitting).
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-black shadow-sm">
        <div className="relative aspect-video w-full">
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${primaryEmbedId}?rel=0`}
            title="How to pray Fajr for beginners — animated salah guide"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>

      <ul className="space-y-2">
        {REFERENCES.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start justify-between gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3 transition hover:border-[var(--accent)]/40"
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">{item.title}</span>
                <span className="mt-0.5 block text-xs text-ink-faint">{item.source}</span>
                <span className="mt-1 block text-xs leading-5 text-ink-muted">{item.note}</span>
              </span>
              <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-ink-faint" />
            </a>
          </li>
        ))}
      </ul>

      <p className="text-xs leading-5 text-ink-faint">
        Videos are third-party educational content. Small differences exist between schools of
        thought — follow your local teacher for rulings.
      </p>
    </section>
  );
}
