'use client';

import { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertCircle, Bookmark, BookMarked, BookOpen, ChevronDown, ChevronLeft, ChevronRight, Copy, GraduationCap, Loader2, MessageCircle, MoreHorizontal, Pencil, Play, Share2, Type, X } from 'lucide-react';
import { quranApi, type AyahFull, type LessonPost } from '@/lib/api';
import { useSettingsStore } from '@/stores/settingsStore';

interface Props { open: boolean; onOpenChange: (open: boolean) => void; surahNumber: number; surahName: string; ayahNumber: number; }
const LANGUAGES = [
  { id: 2, name: 'English' }, { id: 1, name: 'العربية' }, { id: 5, name: 'اردو' },
  { id: 7, name: 'Français' }, { id: 6, name: 'Indonesia' }, { id: 4, name: 'Melayu' }, { id: 3, name: 'Español' },
];

export function LessonsStudyModal({ open, onOpenChange, surahNumber, surahName, ayahNumber }: Props) {
  const selectedTranslations = useSettingsStore((state) => state.translationSlugs);
  const requestedTranslations = selectedTranslations.length ? selectedTranslations.join(',') : 'en-clear-quran,ur-bayan-ul-quran';
  const [verse, setVerse] = useState<AyahFull | null>(null);
  const [lessons, setLessons] = useState<LessonPost[]>([]);
  const [languageId, setLanguageId] = useState(2);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [fontLarge, setFontLarge] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true); setError(false); setIndex(0);
    Promise.all([
      quranApi.ayah(surahNumber, ayahNumber, { translations: requestedTranslations }),
      quranApi.lessons(surahNumber, ayahNumber, { languageId, limit: 20 }),
    ]).then(([verseData, lessonData]) => {
      if (!active) return;
      setVerse(verseData); setLessons(Array.isArray(lessonData.data) ? lessonData.data : []);
    }).catch(() => { if (active) { setLessons([]); setError(true); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, surahNumber, ayahNumber, languageId, requestedTranslations]);

  const lesson = lessons[index];
  const authorName = useMemo(() => {
    if (!lesson?.author) return 'Quran Reflect';
    return [lesson.author.firstName, lesson.author.lastName].filter(Boolean).join(' ') || lesson.author.username || 'Quran Reflect';
  }, [lesson]);
  const share = async () => {
    const text = `${authorName} — ${surahName} ${surahNumber}:${ayahNumber}\n${lesson?.body || ''}`;
    if (navigator.share) await navigator.share({ title: `Lesson on ${surahName}`, text }).catch(() => undefined);
    else await navigator.clipboard.writeText(text).catch(() => undefined);
  };

  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/60" />
    <Dialog.Content className="fixed left-1/2 top-1/2 z-[71] flex h-[92vh] w-[calc(100%-1.5rem)] max-w-[1400px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-surface text-ink shadow-2xl outline-none sm:h-[90vh]">
      <Dialog.Title className="sr-only">Study verse lessons</Dialog.Title><Dialog.Description className="sr-only">Verified lessons for {surahName} {surahNumber}:{ayahNumber}</Dialog.Description>
      <div className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-5 sm:px-12 sm:py-7"><Selector>{surahName}<ChevronDown /></Selector><Selector>{ayahNumber}<ChevronDown /></Selector><button disabled className="control-button opacity-40"><ChevronLeft /></button><button disabled className="control-button opacity-40"><ChevronRight /></button><Dialog.Close className="ml-auto rounded-lg p-2 hover:bg-surface-3" aria-label="Close"><X className="h-6 w-6" /></Dialog.Close></div>
      <div className="flex-1 overflow-y-auto px-5 pb-10 sm:px-12">
        {loading ? <div className="flex min-h-80 items-center justify-center gap-3 text-ink-muted"><Loader2 className="animate-spin text-[var(--accent)]" />Loading lessons…</div> : error ? <State icon={<AlertCircle />} title="Unable to load lessons" text="The Quran Reflect lesson service is temporarily unavailable. Please try again." /> : <>
          <section className="py-7 sm:py-9"><div className="flex items-center gap-4 text-ink-faint"><span className="text-xl sm:text-2xl">{surahNumber}:{ayahNumber}</span><Play /><Bookmark /><span className="ml-auto flex gap-5"><Copy /><Share2 /><Pencil /><MoreHorizontal /></span></div><p dir="rtl" lang="ar" translate="no" className="mt-8 text-right font-arabic text-4xl leading-[2] text-ink sm:text-5xl">{verse?.textUthmani}</p><div className="mt-8 grid gap-7 lg:grid-cols-2">{verse?.translations?.map((item) => { const rtl = /^(ur|fa|ar|ps|sd)-/.test(item.translatorSlug) || item.translatorSlug.includes('bayan-ul-quran'); return <div key={item.translatorId} dir={rtl ? 'rtl' : 'ltr'} className={rtl ? 'text-right' : ''}><p className="text-xl leading-9 sm:text-2xl">{item.text}</p><p className="mt-2 text-sm text-ink-muted">— {item.translatorName || item.translatorSlug.replaceAll('-', ' ')}</p></div>; })}</div></section>
          <nav className="flex gap-7 overflow-x-auto border-b border-line text-ink-faint sm:gap-9"><StudyTab icon={<BookOpen />} label="Tafsirs" /><StudyTab icon={<GraduationCap />} label="Lessons" active /><StudyTab icon={<MessageCircle />} label="Reflections" /><StudyTab icon={<BookMarked />} label="Hadith" /><StudyTab icon={<Copy />} label="Related Content" /></nav>
          <div className="flex flex-wrap items-center gap-3 py-5"><button onClick={share} disabled={!lesson} className="control-button" aria-label="Share lesson"><Share2 /></button><button onClick={() => setFontLarge((value) => !value)} className={`control-button ${fontLarge ? 'text-[var(--accent)]' : ''}`} aria-label="Change font size"><Type /></button><select value={languageId} onChange={(event) => setLanguageId(Number(event.target.value))} className="h-10 rounded-lg bg-surface-3 px-4 text-sm outline-none">{LANGUAGES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{lessons.length > 0 && <div className="ml-auto flex items-center gap-3"><button disabled={index === 0} onClick={() => setIndex((value) => value - 1)} className="nav-button"><ChevronLeft />Previous</button><span className="text-sm text-ink-muted">{index + 1} / {lessons.length}</span><button disabled={index >= lessons.length - 1} onClick={() => setIndex((value) => value + 1)} className="nav-button">Next<ChevronRight /></button></div>}</div>
          <div className="rounded-md border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-5 py-4 text-sm leading-6 sm:text-base">Lessons are knowledge-based takeaways connected to this ayah and sourced from moderated Quran Reflect content.</div>
          {!lesson ? <State icon={<GraduationCap />} title="No lessons available" text={`No verified ${LANGUAGES.find((item) => item.id === languageId)?.name || ''} lesson is currently linked to this verse.`} /> : <article className={`py-8 ${languageId === 1 || languageId === 5 ? 'text-right' : ''}`} dir={languageId === 1 || languageId === 5 ? 'rtl' : 'ltr'}><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-surface-3 font-semibold text-[var(--accent)]">{lesson.author?.avatarUrls?.small ? <img src={lesson.author.avatarUrls.small} alt="" className="h-full w-full object-cover" /> : authorName.charAt(0)}</div><div><h2 className="font-semibold sm:text-lg">{authorName}</h2>{lesson.author?.username && <p className="text-sm text-ink-muted">@{lesson.author.username}</p>}</div></div><div className={`mt-7 whitespace-pre-wrap leading-8 text-ink ${fontLarge ? 'text-xl sm:text-2xl' : 'text-base sm:text-xl'}`}>{lesson.body}</div>{lesson.tags?.length ? <div className="mt-7 flex flex-wrap gap-2">{lesson.tags.map((tag) => <span key={tag.id} className="rounded-full bg-surface-3 px-3 py-1 text-sm text-ink-3">#{tag.name}</span>)}</div> : null}</article>}
        </>}
      </div>
    </Dialog.Content>
  </Dialog.Portal></Dialog.Root>;
}

function Selector({ children }: { children: React.ReactNode }) { return <button className="flex h-10 items-center gap-3 rounded-lg bg-surface-3 px-4 text-sm [&_svg]:h-4 [&_svg]:w-4">{children}</button>; }
function StudyTab({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) { return <button className={`flex shrink-0 items-center gap-2 border-b-2 py-4 text-sm sm:text-base ${active ? 'border-[var(--accent)] font-semibold text-[var(--accent)]' : 'border-transparent'}`}><span className="[&_svg]:h-5 [&_svg]:w-5">{icon}</span>{label}</button>; }
function State({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="flex min-h-56 flex-col items-center justify-center text-center"><span className="text-ink-faint [&>svg]:h-9 [&>svg]:w-9">{icon}</span><h2 className="mt-4 font-bold">{title}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-ink-muted">{text}</p></div>; }
