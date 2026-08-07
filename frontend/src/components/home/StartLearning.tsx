'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const ARTICLES = [
  {
    image: '/images/article_1.png',
    title: 'When was Islam created at first?',
    desc: 'Discover the historical origin and evolution of the Islamic message across the globe.',
    duration: '5 min read',
    slug: 'when-was-islam-created-at-first',
  },
  {
    image: '/images/article_2.png',
    title: 'How many years did it take to build?',
    desc: 'Exploring the history and divine architecture of the Kaaba in Mecca.',
    duration: '8 min read',
    slug: 'how-many-years-did-it-take-to-build',
  },
  {
    image: '/images/article_3.png',
    title: 'Benefits of Reading the Holy Quran.',
    desc: 'Unveiling the physical, mental, and spiritual blessings of regular Quranic recitation.',
    duration: '6 min read',
    slug: 'benefits-of-reading-the-holy-quran',
  },
];

export function StartLearning() {
  return (
    <section className="w-full bg-[#f4fbf9]/30 py-16 px-4 md:px-6">
      <div className="mx-auto max-w-[1200px]">
        {/* Section Header */}
        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Learn Quran and Islam <br className="sm:hidden" />
            <span className="text-emerald-800">basics everyday.</span>
          </h2>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((a) => (
            <div
              key={a.slug}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              {/* Image Cover */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                <img
                  src={a.image}
                  alt={a.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Text Body */}
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    {a.duration}
                  </span>
                  <h3 className="mt-2 text-lg font-bold leading-snug text-slate-800 transition group-hover:text-emerald-850">
                    {a.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-3">
                    {a.desc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-50">
                  <Link
                    href="/learning-plans"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950"
                  >
                    Read More
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Centered Action Button */}
        <div className="mt-12 text-center">
          <Link
            href="/learning-plans"
            className="inline-flex items-center justify-center rounded-full bg-emerald-800 px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-950"
          >
            Read More Articles
          </Link>
        </div>
      </div>
    </section>
  );
}
