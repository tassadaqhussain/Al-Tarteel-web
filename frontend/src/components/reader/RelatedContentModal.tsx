'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertCircle, Bookmark, BookMarked, BookOpen, ChevronDown, ChevronLeft, ChevronRight, Copy, GraduationCap, Loader2, MessageCircle, MoreHorizontal, Pencil, Play, Share2, Type, X } from 'lucide-react';
import { quranApi, type AyahFull, type RelatedQuestion } from '@/lib/api';
import { useSettingsStore } from '@/stores/settingsStore';

interface Props { open: boolean; onOpenChange: (open: boolean) => void; surahNumber: number; surahName: string; ayahNumber: number; }

export function RelatedContentModal({ open, onOpenChange, surahNumber, surahName, ayahNumber }: Props) {
  const selectedTranslations = useSettingsStore((state) => state.translationSlugs);
  const requestedTranslations = selectedTranslations.length ? selectedTranslations.join(',') : 'en-clear-quran,ur-bayan-ul-quran';
  const [verse, setVerse] = useState<AyahFull | null>(null);
  const [questions, setQuestions] = useState<RelatedQuestion[]>([]);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [fontLarge, setFontLarge] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true; setLoading(true); setError(false); setIndex(0);
    Promise.all([
      quranApi.ayah(surahNumber, ayahNumber, { translations: requestedTranslations }),
      quranApi.relatedContent(surahNumber, ayahNumber, { language, limit: 10 }),
    ]).then(([verseData, relatedData]) => { if (active) { setVerse(verseData); setQuestions(relatedData.questions || []); } })
      .catch(() => { if (active) { setQuestions([]); setError(true); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, surahNumber, ayahNumber, language, requestedTranslations]);

  const question = questions[index];
  const share = async () => {
    const text = `${question?.body || ''}\n\n${question?.answers?.map((answer) => answer.body).join('\n\n') || ''}`;
    if (navigator.share) await navigator.share({ title: `Related content — ${surahName} ${surahNumber}:${ayahNumber}`, text }).catch(() => undefined);
    else await navigator.clipboard.writeText(text).catch(() => undefined);
  };

  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/60" />
    <Dialog.Content className="fixed left-1/2 top-1/2 z-[71] flex h-[92vh] w-[calc(100%-1.5rem)] max-w-[1400px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-white text-slate-800 shadow-2xl outline-none sm:h-[90vh]">
      <Dialog.Title className="sr-only">Related content</Dialog.Title><Dialog.Description className="sr-only">Published questions and answers for {surahName} {surahNumber}:{ayahNumber}</Dialog.Description>
      <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-5 py-5 sm:px-12 sm:py-7"><Selector>{surahName}<ChevronDown /></Selector><Selector>{ayahNumber}<ChevronDown /></Selector><button disabled className="control-button opacity-40"><ChevronLeft /></button><button disabled className="control-button opacity-40"><ChevronRight /></button><Dialog.Close className="ml-auto rounded-lg p-2 hover:bg-slate-100" aria-label="Close"><X className="h-6 w-6" /></Dialog.Close></div>
      <div className="flex-1 overflow-y-auto px-5 pb-10 sm:px-12">
        {loading ? <div className="flex min-h-80 items-center justify-center gap-3 text-slate-500"><Loader2 className="animate-spin text-[var(--accent)]" />Loading related content…</div> : error ? <State icon={<AlertCircle />} title="Unable to load related content" text="The related-content service is temporarily unavailable. Please try again." /> : <>
          <section className="py-7 sm:py-9"><div className="flex items-center gap-4 text-slate-400"><span className="text-xl sm:text-2xl">{surahNumber}:{ayahNumber}</span><Play /><Bookmark /><span className="ml-auto flex gap-5"><Copy /><Share2 /><Pencil /><MoreHorizontal /></span></div><p dir="rtl" lang="ar" translate="no" className="mt-8 text-right font-arabic text-4xl leading-[2] text-slate-900 sm:text-5xl">{verse?.textUthmani}</p><div className="mt-8 grid gap-7 lg:grid-cols-2">{verse?.translations?.map((item) => { const rtl = /^(ur|fa|ar|ps|sd)-/.test(item.translatorSlug) || item.translatorSlug.includes('bayan-ul-quran'); return <div key={item.translatorId} dir={rtl ? 'rtl' : 'ltr'} className={rtl ? 'text-right' : ''}><p className="text-xl leading-9 sm:text-2xl">{item.text}</p><p className="mt-2 text-sm text-slate-500">— {item.translatorName || item.translatorSlug.replaceAll('-', ' ')}</p></div>; })}</div></section>
          <nav className="flex gap-7 overflow-x-auto border-b border-slate-200 text-slate-400 sm:gap-9"><StudyTab icon={<BookOpen />} label="Tafsirs" /><StudyTab icon={<GraduationCap />} label="Lessons" /><StudyTab icon={<MessageCircle />} label="Reflections" /><StudyTab icon={<BookMarked />} label="Hadith" /><StudyTab icon={<Copy />} label="Related Content" active /></nav>
          <div className="flex flex-wrap items-center gap-3 py-5"><button onClick={share} disabled={!question} className="control-button" aria-label="Share related content"><Share2 /></button><button onClick={() => setFontLarge((value) => !value)} className={`control-button ${fontLarge ? 'text-[var(--accent)]' : ''}`} aria-label="Change font size"><Type /></button><select value={language} onChange={(event) => setLanguage(event.target.value as 'en' | 'ar')} className="h-10 rounded-lg bg-slate-100 px-4 text-sm outline-none"><option value="en">English</option><option value="ar">العربية</option></select>{questions.length > 0 && <div className="ml-auto flex items-center gap-3"><button disabled={index === 0} onClick={() => setIndex((value) => value - 1)} className="nav-button"><ChevronLeft />Previous</button><span className="text-sm text-slate-500">{index + 1} / {questions.length}</span><button disabled={index >= questions.length - 1} onClick={() => setIndex((value) => value + 1)} className="nav-button">Next<ChevronRight /></button></div>}</div>
          <div className="rounded-md border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-5 py-4 text-sm leading-6 sm:text-base">Related content contains published questions and scholarly answers connected directly to this ayah.</div>
          {!question ? <State icon={<Copy />} title="No related content available" text="No published question or answer is currently linked to this verse." /> : <article dir={language === 'ar' ? 'rtl' : 'ltr'} className={`py-8 ${language === 'ar' ? 'text-right' : ''}`}><div className="flex flex-wrap gap-2">{question.type && <span className="rounded-full bg-[var(--accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--accent)]">{question.type.replaceAll('_', ' ')}</span>}{question.ranges?.map((range) => <span key={range} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{range}</span>)}</div><h2 className={`mt-6 font-semibold leading-9 text-slate-900 ${fontLarge ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>{question.body}</h2><div className="mt-7 space-y-6">{question.answers.map((answer) => <section key={answer.id} className="rounded-2xl border border-slate-200 p-5 sm:p-7"><div className={`whitespace-pre-wrap leading-8 ${fontLarge ? 'text-xl sm:text-2xl' : 'text-base sm:text-xl'}`}>{answer.body}</div>{answer.answeredBy && <p className="mt-5 text-sm font-medium text-slate-500">Answered by {answer.answeredBy}</p>}</section>)}</div>{question.references?.length ? <div className="mt-7"><h3 className="font-semibold">References</h3><ul className="mt-2 list-inside list-disc text-sm text-slate-600">{question.references.map((reference) => <li key={reference}>{reference}</li>)}</ul></div> : null}</article>}
        </>}
      </div>
    </Dialog.Content>
  </Dialog.Portal></Dialog.Root>;
}

function Selector({ children }: { children: React.ReactNode }) { return <button className="flex h-10 items-center gap-3 rounded-lg bg-slate-100 px-4 text-sm [&_svg]:h-4 [&_svg]:w-4">{children}</button>; }
function StudyTab({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) { return <button className={`flex shrink-0 items-center gap-2 border-b-2 py-4 text-sm sm:text-base ${active ? 'border-[var(--accent)] font-semibold text-[var(--accent)]' : 'border-transparent'}`}><span className="[&_svg]:h-5 [&_svg]:w-5">{icon}</span>{label}</button>; }
function State({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="flex min-h-56 flex-col items-center justify-center text-center"><span className="text-slate-400 [&>svg]:h-9 [&>svg]:w-9">{icon}</span><h2 className="mt-4 font-bold">{title}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{text}</p></div>; }
