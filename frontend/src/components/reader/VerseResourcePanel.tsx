'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookMarked, Check, GraduationCap, MessageCircle, ScrollText, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { quranApi, type TafsirItem } from '@/lib/api';
import { getSurahPath } from '@/lib/surah-meta';

export type VerseResource = 'tafsirs' | 'lessons' | 'reflections' | 'hadith' | 'related';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: VerseResource;
  ayahId: number;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
}

const TITLES: Record<VerseResource, string> = {
  tafsirs: 'Tafsirs', lessons: 'Lessons', reflections: 'Reflections', hadith: 'Hadith', related: 'Related Content',
};

export function VerseResourcePanel({ open, onOpenChange, resource, ayahId, surahNumber, surahName, ayahNumber }: Props) {
  const storageKey = `quranpilot-reflection-${ayahId}`;
  const [reflection, setReflection] = useState('');
  const [saved, setSaved] = useState(false);
  const [active, setActive] = useState<VerseResource>(resource);
  const [tafsirs, setTafsirs] = useState<TafsirItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => setActive(resource), [resource]);

  useEffect(() => {
    if (!open || active !== 'tafsirs') return;
    setLoading(true);
    quranApi.tafsir(ayahId).then((data) => setTafsirs(Array.isArray(data) ? data : [])).catch(() => setTafsirs([])).finally(() => setLoading(false));
  }, [active, ayahId, open]);

  useEffect(() => {
    if (!open || active !== 'reflections') return;
    setReflection(localStorage.getItem(storageKey) || '');
    setSaved(false);
  }, [active, open, storageKey]);

  const saveReflection = () => {
    localStorage.setItem(storageKey, reflection.trim());
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full max-w-none flex-col bg-white p-0 text-slate-800 [&>button]:hidden sm:w-[440px] sm:max-w-[440px]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div><SheetTitle className="text-xl font-bold">Study Verse</SheetTitle><p className="mt-1 text-sm text-slate-500">{surahName} {surahNumber}:{ayahNumber}</p></div>
          <button type="button" onClick={() => onOpenChange(false)} className="rounded-full p-2 hover:bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-3 py-2">
          {(Object.keys(TITLES) as VerseResource[]).map((item) => <button key={item} type="button" onClick={() => setActive(item)} className={`shrink-0 rounded-full px-3 py-2 text-sm ${active === item ? 'bg-[var(--accent)]/10 font-semibold text-[var(--accent)]' : 'text-slate-500 hover:bg-slate-50'}`}>{TITLES[item]}</button>)}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {active === 'tafsirs' && (loading ? <p className="text-sm text-slate-500">Loading Tafsir…</p> : tafsirs.length ? <div className="space-y-5">{tafsirs.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 p-5"><h2 className="font-bold">{item.source.name}</h2>{item.source.author && <p className="mt-1 text-xs text-slate-400">{item.source.author}</p>}<p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">{item.text}</p></article>)}</div> : <EmptyState icon={<BookMarked />} title="No Tafsir available" description="No selected verified Tafsir source is available for this verse." />)}

          {active === 'lessons' && <div className="space-y-3"><ResourceLink href="/learning-plans" icon={<GraduationCap />} title="Learning Plans" description="Study the Quran through structured daily lessons." /><ResourceLink href="/quran-in-year" icon={<ScrollText />} title="Quran in a Year" description="Follow a guided weekly study journey." /></div>}

          {active === 'reflections' && <div><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]"><MessageCircle /></div><h2 className="text-lg font-bold">Your reflection</h2><p className="mt-1 text-sm leading-6 text-slate-500">Write a private note about what this verse means to you.</p><textarea value={reflection} onChange={(e) => setReflection(e.target.value)} rows={9} placeholder="Write your reflection…" className="mt-5 w-full resize-none rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-[var(--accent)]" /><button type="button" onClick={saveReflection} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 font-semibold text-white">{saved && <Check className="h-4 w-4" />}{saved ? 'Saved' : 'Save Reflection'}</button></div>}

          {active === 'hadith' && <EmptyState icon={<ScrollText />} title="No Hadith available" description="No verified Hadith source is currently linked to this verse." />}

          {active === 'related' && <div className="space-y-3"><ResourceLink href={getSurahPath(surahNumber)} icon={<BookMarked />} title={`Read ${surahName}`} description="Continue reading the complete chapter." /><ResourceLink href={`/search?q=${encodeURIComponent(`${surahName} ${ayahNumber}`)}`} icon={<ScrollText />} title="Search related verses" description="Find related Quran text and translations." /><ResourceLink href="/bookmarks" icon={<BookMarked />} title="My Bookmarks" description="Review saved verses and notes." /></div>}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ResourceLink({ href, icon, title, description }: { href: string; icon: React.ReactNode; title: string; description: string }) {
  return <Link href={href} className="flex gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-[var(--accent)] hover:bg-slate-50"><span className="mt-0.5 text-[var(--accent)] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><span><span className="block font-semibold text-slate-900">{title}</span><span className="mt-1 block text-sm leading-5 text-slate-500">{description}</span></span></Link>;
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return <div className="rounded-2xl bg-slate-50 p-6 text-center"><span className="mx-auto flex h-10 w-10 items-center justify-center text-slate-400 [&>svg]:h-9 [&>svg]:w-9">{icon}</span><h2 className="mt-4 font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p></div>;
}
