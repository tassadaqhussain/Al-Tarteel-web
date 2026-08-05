'use client';

import { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Bookmark, BookMarked, BookOpen, ChevronDown, ChevronLeft, ChevronRight, Copy, GraduationCap, Loader2, MessageCircle, MoreHorizontal, Pencil, Play, Share2, Type, X } from 'lucide-react';
import { quranApi, type AyahFull, type OfficialTafsir, type OfficialTafsirResource } from '@/lib/api';
import { useSettingsStore } from '@/stores/settingsStore';

interface Props { open: boolean; onOpenChange: (open: boolean) => void; surahNumber: number; surahName: string; ayahNumber: number; }
const DEFAULT_TAFSIR = 169;
const cleanHtml = (html: string) => html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/\son\w+="[^"]*"/gi, '');
const LANGUAGE_NAMES: Record<string, string> = { english: 'English', arabic: 'العربية', urdu: 'اردو', persian: 'فارسی', bengali: 'বাংলা' };

export function TafsirStudyModal({ open, onOpenChange, surahNumber, surahName, ayahNumber }: Props) {
  const selectedTranslations = useSettingsStore((state) => state.translationSlugs);
  const requestedTranslations = selectedTranslations.length ? selectedTranslations.join(',') : 'en-clear-quran,ur-bayan-ul-quran';
  const [verse, setVerse] = useState<AyahFull | null>(null);
  const [resources, setResources] = useState<OfficialTafsirResource[]>([]);
  const [resourceId, setResourceId] = useState(DEFAULT_TAFSIR);
  const [tafsir, setTafsir] = useState<OfficialTafsir | null>(null);
  const [language, setLanguage] = useState('english');
  const [loading, setLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [fontLarge, setFontLarge] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true; setLoading(true);
    Promise.all([
      quranApi.ayah(surahNumber, ayahNumber, { translations: requestedTranslations }),
      quranApi.officialTafsirResources(),
    ]).then(([verseData, resourceData]) => { if (active) { setVerse(verseData); setResources(resourceData); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, surahNumber, ayahNumber, requestedTranslations]);

  useEffect(() => {
    if (!open || !resourceId) return;
    let active = true; setContentLoading(true); setTafsir(null);
    quranApi.officialTafsir(surahNumber, ayahNumber, resourceId).then((data) => { if (active) setTafsir(data); })
      .finally(() => { if (active) setContentLoading(false); });
    return () => { active = false; };
  }, [open, resourceId, surahNumber, ayahNumber]);

  const languages = useMemo(() => Array.from(new Set(resources.map((item) => item.language_name.toLowerCase()))).sort(), [resources]);
  const visibleResources = resources.filter((item) => item.language_name.toLowerCase() === language);
  useEffect(() => { if (!visibleResources.some((item) => item.id === resourceId) && visibleResources[0]) setResourceId(visibleResources[0].id); }, [language, resources]);
  const verseKeys = Object.keys(tafsir?.verses || {});
  const groupedRange = verseKeys.length > 1 ? `${verseKeys[0]} to ${verseKeys[verseKeys.length - 1]}` : null;

  const share = async () => {
    const text = `${tafsir?.resource_name || 'Tafsir'} — ${surahName} ${surahNumber}:${ayahNumber}\n${tafsir?.text.replace(/<[^>]+>/g, '').trim() || ''}`;
    if (navigator.share) await navigator.share({ title: tafsir?.resource_name || 'Tafsir', text }).catch(() => undefined);
    else await navigator.clipboard.writeText(text).catch(() => undefined);
  };

  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/60" />
    <Dialog.Content className="fixed left-1/2 top-1/2 z-[71] flex h-[92vh] w-[calc(100%-1.5rem)] max-w-[1400px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-white text-slate-800 shadow-2xl outline-none sm:h-[90vh]">
      <Dialog.Title className="sr-only">Study verse Tafsir</Dialog.Title><Dialog.Description className="sr-only">Tafsir for {surahName} {surahNumber}:{ayahNumber}</Dialog.Description>
      <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-5 py-5 sm:px-12 sm:py-7"><Selector>{surahName}<ChevronDown /></Selector><Selector>{ayahNumber}<ChevronDown /></Selector><button disabled className="control-button opacity-40"><ChevronLeft /></button><button disabled className="control-button opacity-40"><ChevronRight /></button><Dialog.Close className="ml-auto rounded-lg p-2 hover:bg-slate-100"><X className="h-6 w-6" /></Dialog.Close></div>
      <div className="flex-1 overflow-y-auto px-5 pb-10 sm:px-12">
        {loading ? <div className="flex min-h-80 items-center justify-center gap-3 text-slate-500"><Loader2 className="animate-spin" />Loading Tafsir…</div> : <>
          <section className="py-7 sm:py-9"><div className="flex items-center gap-4 text-slate-400"><span className="text-xl sm:text-2xl">{surahNumber}:{ayahNumber}</span><Play /><Bookmark /><span className="ml-auto flex gap-5"><Copy /><Share2 /><Pencil /><MoreHorizontal /></span></div><p dir="rtl" translate="no" className="mt-8 text-right font-arabic text-4xl leading-[2] text-slate-900 sm:text-5xl">{verse?.textUthmani}</p><div className="mt-8 grid gap-7 lg:grid-cols-2">{verse?.translations?.map((item) => { const rtl = /^(ur|fa|ar|ps|sd)-/.test(item.translatorSlug) || item.translatorSlug.includes('bayan-ul-quran'); return <div key={item.translatorId} dir={rtl ? 'rtl' : 'ltr'} className={rtl ? 'text-right' : ''}><p className="text-xl leading-9 sm:text-2xl">{item.text}</p><p className="mt-2 text-sm capitalize text-slate-500">— {item.translatorSlug.replaceAll('-', ' ')}</p></div>; })}</div></section>
          <nav className="flex gap-7 overflow-x-auto border-b border-slate-200 text-slate-400 sm:gap-9"><StudyTab icon={<BookOpen />} label="Tafsirs" active /><StudyTab icon={<GraduationCap />} label="Lessons" /><StudyTab icon={<MessageCircle />} label="Reflections" /><StudyTab icon={<BookMarked />} label="Hadith" /><StudyTab icon={<Copy />} label="Related Content" /></nav>
          <div className="flex flex-wrap items-center gap-3 py-5"><button onClick={share} className="control-button"><Share2 /></button><button onClick={() => setFontLarge((v) => !v)} className={`control-button ${fontLarge ? 'text-[var(--accent)]' : ''}`}><Type /></button><select value={language} onChange={(e) => setLanguage(e.target.value)} className="h-10 rounded-lg bg-slate-100 px-4 text-sm outline-none">{languages.map((item) => <option key={item} value={item}>{LANGUAGE_NAMES[item] || item.replace(/\b\w/g, (letter) => letter.toUpperCase())}</option>)}</select>{visibleResources.map((item) => <button key={item.id} onClick={() => setResourceId(item.id)} className={`rounded-full px-4 py-2 text-sm ${resourceId === item.id ? 'bg-[var(--accent)] font-semibold text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{item.name}</button>)}</div>
          {groupedRange && <div className="rounded-md bg-cyan-50 px-5 py-4 text-sm sm:text-base">You are reading a tafsir for the group of verses {groupedRange}.</div>}
          {contentLoading ? <div className="flex min-h-52 items-center justify-center gap-3 text-slate-500"><Loader2 className="animate-spin" />Loading {resources.find((item) => item.id === resourceId)?.name}…</div> : tafsir ? <article className={`tafsir-study-content py-7 leading-8 text-slate-700 ${fontLarge ? 'text-xl' : 'text-base sm:text-lg'}`} dangerouslySetInnerHTML={{ __html: cleanHtml(tafsir.text) }} /> : <div className="py-16 text-center text-slate-500">No Tafsir is available for this verse and source.</div>}
        </>}
      </div>
    </Dialog.Content>
  </Dialog.Portal></Dialog.Root>;
}

function Selector({ children }: { children: React.ReactNode }) { return <button className="flex h-10 items-center gap-3 rounded-lg bg-slate-100 px-4 text-sm [&_svg]:h-4 [&_svg]:w-4">{children}</button>; }
function StudyTab({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) { return <button className={`flex shrink-0 items-center gap-2 border-b-2 py-4 text-sm sm:text-base ${active ? 'border-[var(--accent)] font-semibold text-[var(--accent)]' : 'border-transparent'}`}><span className="[&_svg]:h-5 [&_svg]:w-5">{icon}</span>{label}</button>; }
