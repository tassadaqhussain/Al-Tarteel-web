'use client';

import Link from 'next/link';
import { BookOpen, MapPin, History, Clock, ChevronRight } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';
import { getSurahPath } from '@/lib/surah-meta';

// Static quick-access tiles shown when there's no user history
const DEFAULT_ITEMS = [
  {
    title: 'Al-Fatihah',
    subtitle: 'The Opening · 7 Ayahs',
    icon: BookOpen,
    href: getSurahPath(1),
    accentClass: 'text-gold-500',
  },
  {
    title: 'Juz 30',
    subtitle: 'Amma · Last part',
    icon: MapPin,
    href: '/juz/30',
    accentClass: 'text-emerald-400',
  },
  {
    title: 'Al-Kahf',
    subtitle: 'Friday Surah · 110 Ayahs',
    icon: Clock,
    href: getSurahPath(18),
    accentClass: 'text-blue-400',
  },
];

export function QuickAccess() {
  const lastRead = useSettingsStore((s) => s.lastRead);
  const recentSurahs = useSettingsStore((s) => s.recentSurahs);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Continue reading — only shown when user has a history */}
      {lastRead && (
        <div className="mb-8">
          <Link
            href={getSurahPath(lastRead.surahNumber)}
            className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-gold-500/20 bg-gradient-to-r from-emerald-900/40 to-emerald-900/10 px-6 py-5 backdrop-blur-sm transition-all duration-300 hover:border-gold-500/40 hover:from-emerald-900/60"
          >
            {/* Background glow */}
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-4 rounded-full bg-gold-500/5 blur-2xl" />

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/15 text-gold-500 ring-1 ring-gold-500/30">
                <History className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-500">
                  Continue Reading
                </p>
                <h3 className="mt-0.5 text-lg font-bold text-white">{lastRead.surahName}</h3>
                <p className="text-sm text-slate-400">Ayah {lastRead.ayahNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <span className="hidden text-sm sm:block">Resume</span>
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      )}

      {/* Quick access grid */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          {recentSurahs.length > 0 ? 'Recently Read' : 'Quick Access'}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {DEFAULT_ITEMS.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group relative overflow-hidden rounded-2xl border border-emerald-900/30 bg-emerald-900/10 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-500/50 hover:bg-emerald-900/20"
          >
            <div className="absolute -right-4 -top-4 opacity-5 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-10">
              <item.icon className="h-24 w-24 text-gold-500" />
            </div>

            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-900/50 ring-1 ring-white/5 transition-all duration-300 group-hover:ring-gold-500/30',
                  item.accentClass
                )}
              >
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 group-hover:text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500">{item.subtitle}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
