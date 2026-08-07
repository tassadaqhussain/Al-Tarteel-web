'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Pause, SkipForward, SkipBack, Volume2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const PREVIEW_SURAHS = [
  { number: 1, nameSimple: 'Al-Fatihah', nameArabic: 'الفاتحة', verses: 7 },
  { number: 2, nameSimple: 'Al-Baqarah', nameArabic: 'البقرة', verses: 286 },
  { number: 3, nameSimple: 'Al-Imran', nameArabic: 'آل عمران', verses: 200 },
  { number: 4, nameSimple: 'An-Nisa', nameArabic: 'النساء', verses: 176 },
  { number: 5, nameSimple: 'Al-Ma\'idah', nameArabic: 'المائدة', verses: 120 },
  { number: 6, nameSimple: 'Al-An\'am', nameArabic: 'الأنعام', verses: 165 },
];

export function TranslationsPreview() {
  const [activeSurah, setActiveSurah] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="w-full bg-[#f4fbf9] py-16 px-4 md:px-6">
      <div className="mx-auto max-w-[1200px]">
        {/* Section Title */}
        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Hear the Quran <br className="sm:hidden" />
            <span className="text-emerald-800">accompanied by translations.</span>
          </h2>
        </div>

        {/* Reorganized Mockup Columns */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left panel: Quick Surahs List */}
          <div className="flex flex-col gap-2 lg:col-span-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
              {PREVIEW_SURAHS.map((s) => (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => setActiveSurah(s.number)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all duration-200',
                    activeSurah === s.number
                      ? 'bg-emerald-800/10 text-emerald-850 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-400">0{s.number}</p>
                    <p className={cn(
                      'text-sm font-bold',
                      activeSurah === s.number ? 'text-emerald-900' : 'text-slate-800'
                    )}>{s.nameSimple}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-arabic text-sm text-slate-800" dir="rtl">{s.nameArabic}</p>
                    <p className="text-[10px] text-slate-400">{s.verses} Verses</p>
                  </div>
                </button>
              ))}
              <div className="mt-2 border-t border-slate-100 pt-2 text-center">
                <Link
                  href="/surahs"
                  className="inline-flex items-center gap-1.5 py-2 text-xs font-bold text-emerald-800 hover:underline"
                >
                  View More Chapters
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right panel: Quran Reader Preview Frame */}
          <div className="lg:col-span-8">
            <div className="flex h-full flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-lg md:p-8">
              {/* Header inside the frame */}
              <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-850">
                    {PREVIEW_SURAHS.find((s) => s.number === activeSurah)?.nameSimple}
                  </h3>
                  <p className="text-xs text-slate-400">English - Sahih International</p>
                </div>
                <Link 
                  href={`/surah/${activeSurah}`} 
                  className="rounded-full bg-emerald-800/10 px-4 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-800/20"
                >
                  Open Reader
                </Link>
              </div>

              {/* Quran Text Content */}
              <div className="my-auto flex flex-col items-center justify-center py-6 text-center">
                <p className="mb-6 font-arabic text-2xl text-slate-800" dir="rtl" lang="ar">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </p>

                <div className="space-y-6 max-w-xl">
                  <div>
                    <p className="font-arabic text-2xl text-slate-800 leading-loose" dir="rtl" lang="ar">
                      الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-emerald-800/30 text-[10px] align-middle font-sans font-bold text-emerald-800 ml-2">١</span>
                    </p>
                    <p className="mt-2 text-sm text-slate-500 italic">
                      "All praise is due to Allah, Lord of all the worlds."
                    </p>
                  </div>

                  <div>
                    <p className="font-arabic text-2xl text-slate-800 leading-loose" dir="rtl" lang="ar">
                      الرَّحْمَٰنِ الرَّحِيمِ <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-emerald-800/30 text-[10px] align-middle font-sans font-bold text-emerald-800 ml-2">٢</span>
                    </p>
                    <p className="mt-2 text-sm text-slate-500 italic">
                      "The Most Compassionate, Most Merciful."
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Embedded Audio Player bar */}
              <div className="mt-8 rounded-2xl bg-slate-50 p-4 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-white shadow-sm transition hover:bg-emerald-900"
                  >
                    {isPlaying ? <Pause className="h-4.5 w-4.5 fill-white" /> : <Play className="h-4.5 w-4.5 fill-white ml-0.5" />}
                  </button>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Recitation - Verse 1</p>
                    <p className="text-[10px] text-slate-400">Mishary Rashid Alafasy</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-[10px] font-medium text-slate-400">00:14</span>
                  <div className="h-1.5 flex-1 rounded-full bg-slate-200 relative overflow-hidden">
                    <div 
                      className="h-full bg-emerald-800 transition-all duration-300"
                      style={{ width: isPlaying ? '35%' : '0%' }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">00:38</span>
                </div>

                {/* Volume icon */}
                <div className="hidden items-center gap-2 md:flex">
                  <Volume2 className="h-4 w-4 text-slate-400" />
                  <div className="w-16 h-1 rounded-full bg-slate-200">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
