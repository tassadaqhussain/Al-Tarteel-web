'use client';

import { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  AlertCircle, Bookmark, BookMarked, BookOpen, ChevronDown, ChevronLeft, ChevronRight,
  Copy, GraduationCap, Loader2, MessageCircle, MoreHorizontal, Pencil, Play, Share2, Type, X,
} from 'lucide-react';
import { quranApi, type AyahFull, type HadithItem } from '@/lib/api';
import { useSettingsStore } from '@/stores/settingsStore';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
}

const cleanHadithHtml = (html: string) => html
  .replace(/\[quran[^\]]*\]\{([^}]*)\}/gi, '$1')
  .replace(/<(?!\/?(?:p|br|strong|em)\b)[^>]*>/gi, '');

export function HadithModal({ open, onOpenChange, surahNumber, surahName, ayahNumber }: Props) {
  const selectedTranslations = useSettingsStore((state) => state.translationSlugs);
  const requestedTranslations = selectedTranslations.length ? selectedTranslations.join(',') : 'en-clear-quran,ur-bayan-ul-quran';
  const [hadiths, setHadiths] = useState<HadithItem[]>([]);
  const [verse, setVerse] = useState<AyahFull | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [index, setIndex] = useState(0);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [fontLarge, setFontLarge] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true); setError(false); setIndex(0);
    Promise.all([
      quranApi.hadiths(surahNumber, ayahNumber, { language: 'en', limit: 10 }),
      quranApi.ayah(surahNumber, ayahNumber, { translations: requestedTranslations }),
    ]).then(([hadithResponse, verseResponse]) => {
      if (!active) return;
      setHadiths(hadithResponse.hadiths || []);
      setVerse(verseResponse);
    }).catch(() => { if (active) { setHadiths([]); setError(true); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, surahNumber, ayahNumber, requestedTranslations]);

  const activeHadith = hadiths[index];
  const activeText = activeHadith?.hadith.find((text) => text.lang === language)
    || activeHadith?.hadith.find((text) => text.lang === 'en');
  const title = useMemo(() => activeHadith ? `${activeHadith.name} ${activeHadith.hadithNumber}` : 'Hadith', [activeHadith]);

  const share = async () => {
    const text = `${title}\n${activeText?.body.replace(/<[^>]+>/g, '').trim() || ''}`;
    if (navigator.share) await navigator.share({ title, text }).catch(() => undefined);
    else await navigator.clipboard.writeText(text).catch(() => undefined);
  };

  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/60" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-[71] flex h-[92vh] w-[calc(100%-1.5rem)] max-w-[1400px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-surface text-ink shadow-2xl outline-none sm:h-[90vh]">
        <Dialog.Title className="sr-only">Study verse Hadith</Dialog.Title>
        <Dialog.Description className="sr-only">Hadith references related to {surahName} {surahNumber}:{ayahNumber}</Dialog.Description>

        <div className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-5 sm:px-12 sm:py-7">
          <Selector>{surahName}<ChevronDown /></Selector>
          <Selector>{ayahNumber}<ChevronDown /></Selector>
          <button disabled className="control-button opacity-40"><ChevronLeft /></button>
          <button disabled className="control-button opacity-40"><ChevronRight /></button>
          <Dialog.Close className="ml-auto rounded-lg p-2 hover:bg-surface-3" aria-label="Close"><X className="h-6 w-6" /></Dialog.Close>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-10 sm:px-12">
          {loading && <div className="flex min-h-80 items-center justify-center gap-3 text-ink-muted"><Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />Loading study content…</div>}
          {!loading && error && <State icon={<AlertCircle />} title="Unable to load Hadith" text="The Hadith service is temporarily unavailable. Please try again." />}
          {!loading && !error && <>
            <section className="py-7 sm:py-9">
              <div className="flex items-center gap-4 text-ink-faint"><span className="text-xl sm:text-2xl">{surahNumber}:{ayahNumber}</span><Play className="h-6 w-6" /><Bookmark className="h-6 w-6" /><span className="ml-auto flex gap-5"><Copy /><Share2 /><Pencil /><MoreHorizontal /></span></div>
              <p dir="rtl" lang="ar" translate="no" className="mt-8 text-right font-arabic text-4xl leading-[2] text-ink sm:text-5xl">{verse?.textUthmani}</p>
              <div className="mt-8 grid gap-7 lg:grid-cols-2">{verse?.translations?.map((item) => { const rtl = /^(ur|fa|ar|ps|sd)-/.test(item.translatorSlug) || item.translatorSlug.includes('bayan-ul-quran'); return <div key={item.translatorId} dir={rtl ? 'rtl' : 'ltr'} className={rtl ? 'text-right' : ''}><p className="text-xl leading-9 sm:text-2xl">{item.text}</p><p className="mt-2 text-sm capitalize text-ink-muted">— {item.translatorSlug.replaceAll('-', ' ')}</p></div>; })}</div>
            </section>

            <nav className="flex gap-7 overflow-x-auto border-b border-line text-ink-faint sm:gap-9">
              <StudyTab icon={<BookOpen />} label="Tafsirs" /><StudyTab icon={<GraduationCap />} label="Lessons" /><StudyTab icon={<MessageCircle />} label="Reflections" />
              <StudyTab icon={<BookMarked />} label="Hadith" active /><StudyTab icon={<Copy />} label="Related Content" />
            </nav>

            <div className="flex flex-wrap items-center gap-3 py-5">
              <button onClick={share} className="control-button" aria-label="Share Hadith"><Share2 /></button>
              <button onClick={() => setFontLarge((value) => !value)} className={`control-button ${fontLarge ? 'text-[var(--accent)]' : ''}`} aria-label="Change font size"><Type /></button>
              <select value={language} onChange={(event) => setLanguage(event.target.value as 'en' | 'ar')} className="h-10 rounded-lg border-0 bg-surface-3 px-4 text-sm outline-none"><option value="en">English</option><option value="ar">العربية</option></select>
              <div className="ml-auto flex gap-3">
                <button disabled={index === 0} onClick={() => setIndex((value) => value - 1)} className="nav-button"><ChevronLeft />Previous Hadith</button>
                <button disabled={index >= hadiths.length - 1} onClick={() => setIndex((value) => value + 1)} className="nav-button">Next Hadith<ChevronRight /></button>
              </div>
            </div>

            <div className="rounded-md border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-5 py-4 text-sm leading-6 sm:text-base">Only hadith that explicitly reference Quranic verses are included, and this selection is not exhaustive. Narrations are curated to match the chosen verses from <span className="font-medium text-[var(--accent)]">Sahih al-Bukhari</span> and <span className="font-medium text-[var(--accent)]">Sahih Muslim</span>, cited via Sunnah.com.</div>

            {!hadiths.length ? <State icon={<BookMarked />} title="No Hadith available" text="No verified Hadith reference is linked to this verse." /> : activeHadith && activeText && <article dir={language === 'ar' ? 'rtl' : 'ltr'} className={`py-8 ${language === 'ar' ? 'text-right font-arabic' : ''}`}>
              <h2 className="text-lg font-medium sm:text-xl">{title}</h2>
              {activeText.chapterTitle && <p className="mt-6 text-base text-ink-3 sm:text-lg">{activeText.chapterTitle}</p>}
              <div className={`hadith-copy mt-5 leading-9 text-ink ${fontLarge ? 'text-xl sm:text-2xl' : 'text-base sm:text-xl'}`} dangerouslySetInnerHTML={{ __html: cleanHadithHtml(activeText.body) }} />
              {activeText.grades?.map((grade) => <span key={grade.grade} className="mt-5 inline-flex rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">{grade.grade}</span>)}
            </article>}
          </>}
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}

function Selector({ children }: { children: React.ReactNode }) { return <button className="flex h-10 items-center gap-3 rounded-lg bg-surface-3 px-4 text-sm [&_svg]:h-4 [&_svg]:w-4">{children}</button>; }
function StudyTab({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) { return <button className={`flex shrink-0 items-center gap-2 border-b-2 px-0 py-4 text-sm sm:text-base ${active ? 'border-[var(--accent)] font-semibold text-[var(--accent)]' : 'border-transparent'}`}><span className="[&_svg]:h-5 [&_svg]:w-5">{icon}</span>{label}</button>; }
function State({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="flex min-h-56 flex-col items-center justify-center text-center"><span className="text-ink-faint [&>svg]:h-9 [&>svg]:w-9">{icon}</span><h2 className="mt-4 font-bold">{title}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-ink-muted">{text}</p></div>; }
