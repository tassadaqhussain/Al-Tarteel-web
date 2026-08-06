'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  BookMarked,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Copy,
  GraduationCap,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Pin,
  Play,
  Pause,
  Share2,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { audioApi, quranApi, type AyahFull } from '@/lib/api';
import { SURAH_SIMPLE_NAMES } from '@/lib/surah-meta';
import { loadWordTimings } from '@/lib/loadWordTimings';
import { useAudioStore } from '@/stores/audioStore';
import { useBookmarksStore } from '@/stores/bookmarksStore';
import { useComparePinStore } from '@/stores/comparePinStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';

export function CompareVerseModal() {
  const pins = useComparePinStore((s) => s.pins);
  const activeAyahId = useComparePinStore((s) => s.activeAyahId);
  const modalOpen = useComparePinStore((s) => s.modalOpen);
  const closeModal = useComparePinStore((s) => s.closeModal);
  const setActive = useComparePinStore((s) => s.setActive);
  const pin = useComparePinStore((s) => s.pin);
  const unpin = useComparePinStore((s) => s.unpin);
  const isPinned = useComparePinStore((s) => s.isPinned);

  const translationSlugs = useSettingsStore((s) => s.translationSlugs);
  const settingsReciter = useSettingsStore((s) => s.reciterSlug);
  const setReciterSlug = useSettingsStore((s) => s.setReciterSlug);
  const { setPlaylist, setPlaying, setReciter, setContinuous, reciterSlug, getCurrentAyah, isPlaying } =
    useAudioStore();
  const { add: addBookmark, remove: removeBookmark, isBookmarked } = useBookmarksStore();

  const activePin = pins.find((p) => p.ayahId === activeAyahId) ?? pins[0] ?? null;

  const [surahNumber, setSurahNumber] = useState(1);
  const [ayahNumber, setAyahNumber] = useState(1);
  const [ayahCount, setAyahCount] = useState(7);
  const [verse, setVerse] = useState<AyahFull | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync selectors when active pin changes.
  useEffect(() => {
    if (!activePin) return;
    setSurahNumber(activePin.surahNumber);
    setAyahNumber(activePin.ayahNumber);
  }, [activePin?.ayahId, activePin?.surahNumber, activePin?.ayahNumber]);

  // Load surah metadata for verse count.
  useEffect(() => {
    if (!modalOpen) return;
    let alive = true;
    quranApi.surah(surahNumber).then((s) => {
      if (!alive) return;
      setAyahCount(s.numberOfAyahs || 1);
      setAyahNumber((n) => Math.min(n, s.numberOfAyahs || 1));
    }).catch(() => null);
    return () => { alive = false; };
  }, [modalOpen, surahNumber]);

  // Load verse content.
  useEffect(() => {
    if (!modalOpen) return;
    let alive = true;
    setLoading(true);
    const translations =
      translationSlugs.length > 0
        ? translationSlugs.join(',')
        : 'en-sahih-international,ur-bayan-ul-quran';
    quranApi
      .ayah(surahNumber, ayahNumber, { translations, words: false })
      .then((data) => {
        if (!alive) return;
        setVerse(data);
      })
      .catch(() => {
        if (alive) setVerse(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [modalOpen, surahNumber, ayahNumber, translationSlugs]);

  const surahName = SURAH_SIMPLE_NAMES[surahNumber] || `Surah ${surahNumber}`;
  const current = getCurrentAyah();
  const isCurrent = verse != null && current?.ayahId === verse.id;
  const bookmarked = verse ? isBookmarked(verse.id) : false;
  const pinnedHere = verse ? isPinned(verse.id) : false;

  const ayahOptions = useMemo(
    () => Array.from({ length: ayahCount }, (_, i) => i + 1),
    [ayahCount],
  );

  const goPrev = () => {
    if (ayahNumber > 1) setAyahNumber((n) => n - 1);
    else if (surahNumber > 1) setSurahNumber((s) => s - 1);
  };

  const goNext = () => {
    if (ayahNumber < ayahCount) setAyahNumber((n) => n + 1);
    else if (surahNumber < 114) {
      setSurahNumber((s) => s + 1);
      setAyahNumber(1);
    }
  };

  const handlePlay = useCallback(async () => {
    if (!verse) return;
    if (isCurrent) {
      useAudioStore.setState((s) => ({ isPlaying: !s.isPlaying }));
      return;
    }
    try {
      const reciters = await audioApi.reciters();
      const requestedReciter = reciterSlug ?? settingsReciter;
      const activeReciter =
        reciters.find((r) => r.slug === requestedReciter)?.slug ??
        reciters.find((r) => r.isDefault)?.slug ??
        reciters[0]?.slug;
      if (!activeReciter) return;
      setReciter(activeReciter);
      setReciterSlug(activeReciter);
      const list = await audioApi.surah(surahNumber, activeReciter);
      const items = list
        .filter((a) => a.url)
        .map((a) => ({
          ayahId: a.ayahId,
          surahNumber: a.surahNumber,
          ayahNumber: a.ayahNumber,
          url: a.url!,
          duration: a.duration ?? undefined,
        }));
      const idx = items.findIndex((a) => a.ayahNumber === ayahNumber);
      if (idx < 0) return;
      setContinuous(false);
      setPlaylist(items);
      useAudioStore.setState({ currentIndex: idx });
      setPlaying(true);
      void loadWordTimings(surahNumber, activeReciter);
    } catch {
      // optional
    }
  }, [
    ayahNumber,
    isCurrent,
    reciterSlug,
    settingsReciter,
    setContinuous,
    setPlaylist,
    setPlaying,
    setReciter,
    setReciterSlug,
    surahNumber,
    verse,
  ]);

  const handleBookmark = () => {
    if (!verse) return;
    if (bookmarked) removeBookmark(verse.id);
    else {
      addBookmark({
        ayahId: verse.id,
        surahNumber,
        surahName,
        ayahNumber,
        textUthmani: verse.textUthmani,
        translation: verse.translations?.[0]?.text,
        note: '',
        color: 'gold',
      });
    }
  };

  const handlePinToggle = () => {
    if (!verse) return;
    if (pinnedHere) unpin(verse.id);
    else {
      pin({
        ayahId: verse.id,
        surahNumber,
        surahName,
        ayahNumber,
        textUthmani: verse.textUthmani,
        translation: verse.translations?.[0]?.text,
      });
    }
  };

  const handleCopy = async () => {
    if (!verse) return;
    const parts = [verse.textUthmani];
    if (verse.translations?.length) parts.push(...verse.translations.map((t) => t.text));
    parts.push(`— ${surahName} ${surahNumber}:${ayahNumber}`);
    await navigator.clipboard.writeText(parts.join('\n\n')).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = async () => {
    if (!verse) return;
    const url = `${window.location.origin}/surah/${surahNumber}#ayah-${verse.id}`;
    if (navigator.share) {
      await navigator.share({ title: `${surahName} ${surahNumber}:${ayahNumber}`, url }).catch(() => null);
    } else {
      await navigator.clipboard.writeText(url).catch(() => null);
    }
  };

  return (
    <Dialog open={modalOpen && pins.length > 0} onOpenChange={(open) => { if (!open) closeModal(); }}>
      <DialogContent className="flex max-h-[min(92vh,900px)] w-[calc(100%-1rem)] max-w-5xl flex-col overflow-hidden p-0 sm:w-[calc(100%-2rem)]">
        <DialogTitle className="sr-only">Compare pinned verses</DialogTitle>
        <DialogDescription className="sr-only">
          Browse and compare pinned Quran verses.
        </DialogDescription>

        {/* Header */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3 sm:gap-3 sm:px-5">
          <select
            value={surahNumber}
            onChange={(e) => {
              setSurahNumber(Number(e.target.value));
              setAyahNumber(1);
            }}
            className="max-w-[10rem] truncate rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold text-slate-800 sm:max-w-[14rem]"
            aria-label="Surah"
          >
            {Array.from({ length: 114 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}. {SURAH_SIMPLE_NAMES[n] || `Surah ${n}`}
              </option>
            ))}
          </select>
          <select
            value={ayahNumber}
            onChange={(e) => setAyahNumber(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold tabular-nums text-slate-800"
            aria-label="Verse"
          >
            {ayahOptions.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <div className="ml-auto flex items-center gap-1 sm:ml-0">
            <button type="button" onClick={goPrev} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Previous verse">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={goNext} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Next verse">
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handlePinToggle}
              className={cn(
                'rounded-full p-2 hover:bg-slate-100',
                pinnedHere ? 'text-[var(--accent)]' : 'text-slate-500'
              )}
              aria-label={pinnedHere ? 'Unpin verse' : 'Pin verse'}
            >
              <Pin className={cn('h-5 w-5', pinnedHere && 'fill-current')} />
            </button>
            <button type="button" onClick={closeModal} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Pinned chips */}
        <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-slate-100 px-4 py-2.5 sm:px-5">
          <span className="shrink-0 text-xs font-medium text-slate-500">Pinned verses</span>
          {pins.map((p) => {
            const active = p.ayahId === (verse?.id ?? activeAyahId);
            return (
              <button
                key={p.ayahId}
                type="button"
                onClick={() => setActive(p.ayahId)}
                className={cn(
                  'inline-flex h-7 shrink-0 items-center rounded-full border px-2.5 text-xs font-semibold tabular-nums',
                  active
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                    : 'border-[var(--accent)]/40 text-[var(--accent)] hover:bg-[var(--accent)]/10'
                )}
              >
                {p.surahNumber}:{p.ayahNumber}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {loading && <p className="text-sm text-slate-400">Loading verse…</p>}
          {!loading && verse && (
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
              <div className="order-2 space-y-4 lg:order-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-medium tabular-nums text-slate-400">
                    {surahNumber}:{ayahNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handlePlay()}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full',
                      isCurrent ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'text-slate-400 hover:bg-slate-100'
                    )}
                    aria-label={isCurrent && isPlaying ? 'Pause' : 'Play'}
                  >
                    {isCurrent && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleBookmark}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full',
                      bookmarked ? 'text-[var(--accent)]' : 'text-slate-400 hover:bg-slate-100'
                    )}
                    aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                  >
                    {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  </button>
                </div>
                {verse.translations?.length ? (
                  verse.translations.map((t) => {
                    const rtl = /^(ur|fa|ar|ps|sd)-/.test(t.translatorSlug);
                    return (
                      <div key={t.translatorId} dir={rtl ? 'rtl' : 'ltr'} className={rtl ? 'text-right' : ''}>
                        <p className="text-[15px] leading-7 text-slate-700">{t.text}</p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          — {t.translatorName || t.translatorSlug.replaceAll('-', ' ')}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-400">No translation selected.</p>
                )}
              </div>

              <div className="order-1 lg:order-2">
                <div className="mb-3 flex justify-end gap-1 text-slate-400">
                  <button type="button" onClick={() => void handleCopy()} className="rounded-full p-2 hover:bg-slate-100" aria-label="Copy">
                    <Copy className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => void handleShare()} className="rounded-full p-2 hover:bg-slate-100" aria-label="Share">
                    <Share2 className="h-4 w-4" />
                  </button>
                  <span className="rounded-full p-2 opacity-40" aria-hidden>
                    <Pencil className="h-4 w-4" />
                  </span>
                  <span className="rounded-full p-2 opacity-40" aria-hidden>
                    <MoreHorizontal className="h-4 w-4" />
                  </span>
                </div>
                <p
                  className="font-arabic text-center text-3xl leading-[2.2] text-slate-900 sm:text-right sm:text-4xl"
                  dir="rtl"
                  lang="ar"
                >
                  {verse.textUthmani}
                  <span className="mx-1 inline-flex font-arabic text-lg text-slate-400">﴿{ayahNumber}﴾</span>
                </p>
                {copied && <p className="mt-2 text-right text-xs text-emerald-600">Copied</p>}
              </div>
            </div>
          )}
        </div>

        {/* Footer resources */}
        <div className="flex shrink-0 items-center gap-4 overflow-x-auto border-t border-slate-100 px-4 py-3 text-sm text-slate-400 sm:gap-5 sm:px-6">
          <span className="inline-flex shrink-0 items-center gap-1.5"><BookOpen className="h-4 w-4" /> Tafsirs</span>
          <span className="inline-flex shrink-0 items-center gap-1.5"><GraduationCap className="h-4 w-4" /> Lessons</span>
          <span className="inline-flex shrink-0 items-center gap-1.5"><MessageCircle className="h-4 w-4" /> Reflections</span>
          <span className="inline-flex shrink-0 items-center gap-1.5"><BookMarked className="h-4 w-4" /> Hadith</span>
          <span className="inline-flex shrink-0 items-center gap-1.5"><Copy className="h-4 w-4" /> Related Content</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
