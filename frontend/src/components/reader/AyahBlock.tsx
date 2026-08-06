'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  BookMarked,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Share2,
  GraduationCap,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  X,
} from 'lucide-react';
import { useAudioStore } from '@/stores/audioStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useBookmarksStore } from '@/stores/bookmarksStore';
import { useComparePinStore } from '@/stores/comparePinStore';
import { audioApi, type AyahWithRelations } from '@/lib/api';
import { loadWordTimings } from '@/lib/loadWordTimings';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { VerseResourcePanel, type VerseResource } from './VerseResourcePanel';
import { HadithModal } from './HadithModal';
import { TafsirStudyModal } from './TafsirStudyModal';
import { LessonsStudyModal } from './LessonsStudyModal';
import { RelatedContentModal } from './RelatedContentModal';
import { ShareVerseModal } from './ShareVerseModal';
import { VerseMoreMenu, type VerseMoreAction } from './VerseMoreMenu';
import { AdvancedCopyModal } from './AdvancedCopyModal';
import { TranslationSheet } from './TranslationSheet';
import { ReaderSettingsSheet } from './ReaderSettingsSheet';
import { cn } from '@/lib/utils';

interface Props {
  ayah: AyahWithRelations;
  surahNumber: number;
  surahName?: string;
  hasTranslations?: boolean;
}

export function AyahBlock({ ayah, surahNumber, surahName = '', hasTranslations = false }: Props) {
  const { getCurrentAyah, setPlaylist, setPlaying, setReciter, setContinuous, reciterSlug } = useAudioStore();
  const {
    fontSize,
    reciterSlug: settingsReciter,
    showWordByWord,
    setShowWordByWord,
    mushafType,
    showTajweedRules,
    translationFontSize,
    wordByWordFontSize,
    wordByWordDisplay,
    wordByWordShowTranslation,
    wordByWordShowTransliteration,
    wordByWordLocale,
    wordClickPlayAudio,
    setReciterSlug,
  } = useSettingsStore();
  const showTranslation = useSettingsStore((s) => s.showTranslation);
  const readerViewMode = useSettingsStore((s) => s.readerViewMode);
  const { add: addBookmark, remove: removeBookmark, isBookmarked, get: getBookmark, updateNote } = useBookmarksStore();
  const { pins, pin, unpin, isPinned } = useComparePinStore();
  const pinned = pins[0] ?? null;

  const current = getCurrentAyah();
  const isCurrent = current?.ayahId === ayah.id;
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const currentTime = useAudioStore((s) => s.currentTime);
  const duration = useAudioStore((s) => s.duration);
  const wordTimingsByAyah = useAudioStore((s) => s.wordTimingsByAyah);
  const bookmarked = isBookmarked(ayah.id);
  const versePinned = isPinned(ayah.id);

  const [resourceOpen, setResourceOpen] = useState<VerseResource | null>(null);
  const [hadithOpen, setHadithOpen] = useState(false);
  const [tafsirStudyOpen, setTafsirStudyOpen] = useState(false);
  const [lessonsStudyOpen, setLessonsStudyOpen] = useState(false);
  const [relatedContentOpen, setRelatedContentOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [advancedCopyOpen, setAdvancedCopyOpen] = useState(false);
  const [translationsOpen, setTranslationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedWordPosition, setSelectedWordPosition] = useState<number | null>(null);
  const wordAudioRef = useRef<HTMLAudioElement | null>(null);
  const wordTooltipTimerRef = useRef<number | null>(null);
  const wordsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => () => {
    if (wordTooltipTimerRef.current) window.clearTimeout(wordTooltipTimerRef.current);
    wordAudioRef.current?.pause();
  }, []);

  useEffect(() => {
    if (selectedWordPosition == null) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wordsContainerRef.current?.contains(event.target as Node)) {
        setSelectedWordPosition(null);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [selectedWordPosition]);

  // ── Playback ─────────────────────────────────────────────────────────────
  const handlePlay = useCallback(async () => {
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
      const idx = items.findIndex((a) => a.ayahNumber === ayah.number);
      if (idx >= 0) {
        setContinuous(false);
        setPlaylist(items);
        useAudioStore.setState({ currentIndex: idx });
        setPlaying(true);
        void loadWordTimings(surahNumber, activeReciter);
      }
    } catch {
      // Audio is optional; fail silently
    }
  }, [ayah.number, isCurrent, reciterSlug, settingsReciter, surahNumber, setContinuous, setPlaylist, setPlaying, setReciter, setReciterSlug]);

  // ── Bookmark ──────────────────────────────────────────────────────────────
  const handleBookmark = useCallback(() => {
    if (bookmarked) {
      removeBookmark(ayah.id);
    } else {
      addBookmark({
        ayahId: ayah.id,
        surahNumber,
        surahName: surahName || `Surah ${surahNumber}`,
        ayahNumber: ayah.number,
        textUthmani: ayah.textUthmani,
        translation: ayah.translations?.[0]?.text,
        note: '',
        color: 'gold',
      });
    }
  }, [ayah, bookmarked, surahNumber, surahName, addBookmark, removeBookmark]);

  // ── Copy ─────────────────────────────────────────────────────────────────
  const handleCopy = useCallback(async () => {
    const parts = [ayah.textUthmani];
    if (ayah.translations?.length) parts.push(...ayah.translations.map((t) => t.text));
    parts.push(`— ${surahName || `Surah ${surahNumber}`}:${ayah.number}`);
    await navigator.clipboard.writeText(parts.join('\n\n')).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [ayah, surahNumber, surahName]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const handleShare = useCallback(() => {
    setShareOpen(true);
  }, []);

  const handleOpenNote = useCallback(() => {
    const existing = getBookmark(ayah.id);
    setNoteDraft(existing?.note ?? '');
    setNoteOpen(true);
  }, [ayah.id, getBookmark]);

  const handleSaveNote = useCallback(() => {
    if (!isBookmarked(ayah.id)) {
      addBookmark({
        ayahId: ayah.id,
        surahNumber,
        surahName: surahName || `Surah ${surahNumber}`,
        ayahNumber: ayah.number,
        textUthmani: ayah.textUthmani,
        translation: ayah.translations?.[0]?.text,
        note: noteDraft,
        color: 'gold',
      });
    } else {
      updateNote(ayah.id, noteDraft);
    }
    setNoteOpen(false);
    showToast('Note saved');
  }, [addBookmark, ayah, isBookmarked, noteDraft, showToast, surahName, surahNumber, updateNote]);

  const playCurrentVerseOnly = useCallback(async (repeat: boolean) => {
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
      const item = list.find((a) => a.ayahNumber === ayah.number && a.url);
      if (!item?.url) return;
      setContinuous(repeat);
      setPlaylist([{
        ayahId: item.ayahId,
        surahNumber: item.surahNumber,
        ayahNumber: item.ayahNumber,
        url: item.url,
        duration: item.duration ?? undefined,
      }]);
      useAudioStore.setState({ currentIndex: 0 });
      setPlaying(true);
      void loadWordTimings(surahNumber, activeReciter);
      if (repeat) showToast('Repeating this verse');
    } catch {
      // Audio is optional
    }
  }, [ayah.number, reciterSlug, settingsReciter, setContinuous, setPlaylist, setPlaying, setReciter, setReciterSlug, showToast, surahNumber]);

  const handleMoreAction = useCallback(async (action: VerseMoreAction) => {
    switch (action) {
      case 'pin': {
        if (versePinned) {
          unpin(ayah.id);
          showToast('Unpinned');
        } else {
          pin({
            ayahId: ayah.id,
            surahNumber,
            surahName: surahName || `Surah ${surahNumber}`,
            ayahNumber: ayah.number,
            textUthmani: ayah.textUthmani,
            translation: ayah.translations?.[0]?.text,
          });
          showToast(pins.length ? 'Pinned for compare' : 'Pinned for compare');
        }
        break;
      }
      case 'advanced-copy':
        setAdvancedCopyOpen(true);
        break;
      case 'word-by-word':
        setShowWordByWord(!showWordByWord);
        showToast(showWordByWord ? 'Word by word hidden' : 'Word by word enabled');
        break;
      case 'repeat':
        await playCurrentVerseOnly(true);
        break;
      case 'translations':
        setTranslationsOpen(true);
        break;
      case 'feedback': {
        const subject = encodeURIComponent(`Translation feedback — ${surahName || surahNumber}:${ayah.number}`);
        const body = encodeURIComponent(
          `Verse: ${surahNumber}:${ayah.number}\n\nArabic:\n${ayah.textUthmani}\n\nTranslation:\n${ayah.translations?.[0]?.text || ''}\n\nMy feedback:\n`
        );
        window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
        break;
      }
      case 'embed': {
        const origin = window.location.origin;
        const embed = `<iframe src="${origin}/surah/${surahNumber}?embed=1#ayah-${surahNumber}-${ayah.number}" title="${surahName} ${surahNumber}:${ayah.number}" width="100%" height="360" frameborder="0" loading="lazy"></iframe>`;
        await navigator.clipboard.writeText(embed).catch(() => null);
        showToast('Embed code copied');
        break;
      }
      case 'settings':
        setSettingsOpen(true);
        break;
    }
  }, [ayah, pin, pins.length, playCurrentVerseOnly, setShowWordByWord, showToast, showWordByWord, surahName, surahNumber, unpin, versePinned]);

  const handleWordClick = useCallback(
    async (word: NonNullable<AyahWithRelations['words']>[number]) => {
      setSelectedWordPosition(word.position);
      if (wordTooltipTimerRef.current) window.clearTimeout(wordTooltipTimerRef.current);

      // Pause continuous ayah playback so word audio is clear (Quran.com behaviour).
      if (isPlaying) {
        useAudioStore.setState({ isPlaying: false });
      }

      const dismissMs = wordClickPlayAudio && word.audioUrl ? 4500 : 3200;
      wordTooltipTimerRef.current = window.setTimeout(() => {
        setSelectedWordPosition((current) => (current === word.position ? null : current));
      }, dismissMs);

      if (!wordClickPlayAudio) return;

      const audio = wordAudioRef.current;
      const url =
        word.audioUrl ||
        `https://audio.qurancdn.com/wbw/${String(surahNumber).padStart(3, '0')}_${String(ayah.number).padStart(3, '0')}_${String(word.position).padStart(3, '0')}.mp3`;

      if (!audio || !url) return;

      try {
        audio.pause();
        audio.currentTime = 0;
        if (audio.src !== url) {
          audio.src = url;
          audio.load();
        }
        await audio.play();
      } catch {
        // Autoplay / network failures should not break the tooltip UX.
      }
    },
    [ayah.number, isPlaying, surahNumber, wordClickPlayAudio]
  );

  const playingWordPosition = (() => {
    if (!isCurrent || !isPlaying || !ayah.words?.length) return null;

    const timed = wordTimingsByAyah?.[ayah.number];
    if (timed?.length) {
      const ms = currentTime * 1000;
      const hit = timed.find((w) => ms >= w.startMs && ms < w.endMs);
      if (hit) return hit.position;
      const previous = [...timed].reverse().find((w) => ms >= w.startMs);
      return previous?.position ?? timed[0].position;
    }

    if (duration > 0) {
      return Math.min(
        ayah.words.length,
        Math.max(1, Math.floor((currentTime / duration) * ayah.words.length) + 1),
      );
    }
    return null;
  })();

  // Keep the recited word in view horizontally without fighting ayah auto-scroll.
  useEffect(() => {
    if (playingWordPosition == null || !wordsContainerRef.current) return;
    const el = wordsContainerRef.current.querySelector<HTMLElement>(
      `[data-word-position="${playingWordPosition}"]`,
    );
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const viewTop = 130;
    const viewBottom = window.innerHeight - 96;
    // Only nudge if the active word is clipped out of the reading band.
    if (rect.top < viewTop || rect.bottom > viewBottom) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [playingWordPosition]);

  const fontSizeClass = { sm: 'text-xl', md: 'text-2xl', lg: 'text-3xl', xl: 'text-4xl' }[fontSize];
  const translationSizeClass = { sm: 'text-sm', md: 'text-[15px]', lg: 'text-lg', xl: 'text-xl' }[translationFontSize];
  const wordSizeClass = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm', xl: 'text-base' }[wordByWordFontSize];

  const arabicTextNode = ayah.words && ayah.words.length > 0 ? (
    <div
      ref={wordsContainerRef}
      className={cn(
        'min-w-0 max-w-full leading-[2.2]',
        readerViewMode === 'arabic' ? 'inline text-center' : 'w-full text-right'
      )}
      dir="rtl"
      lang="ar"
    >
      {ayah.words.map((word) => {
        const isSelected = selectedWordPosition === word.position;
        const isPlayingWord = playingWordPosition === word.position;
        const meaning = word.translations?.[wordByWordLocale] || word.translation || word.translations?.en;
        const rtlMeaning = ['ar', 'ur', 'fa', 'ps'].includes(wordByWordLocale);
        const showInlineTranslation = readerViewMode === 'verse' && showWordByWord && wordByWordDisplay === 'inline' && wordByWordShowTranslation && meaning;
        const showInlineTransliteration = readerViewMode === 'verse' && showWordByWord && wordByWordDisplay === 'inline' && wordByWordShowTransliteration && word.transliteration;
        const showClickPopover = readerViewMode === 'verse' && isSelected && (meaning || word.transliteration);

        return (
          <button
            key={word.id}
            type="button"
            data-word-position={word.position}
            data-playing-word={isPlayingWord ? 'true' : undefined}
            onClick={(event) => { event.stopPropagation(); void handleWordClick(word); }}
            onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); void handleWordClick(word); } }}
            className={cn(
              'relative mx-[1px] my-0.5 touch-manipulation select-none rounded-md border border-transparent bg-transparent transition-colors duration-150',
              readerViewMode === 'arabic'
                ? 'inline px-0.5 align-baseline'
                : 'inline-flex flex-col items-center justify-center align-middle',
              readerViewMode === 'verse' && showWordByWord ? 'min-w-[3.25rem] px-1.5 py-1' : readerViewMode !== 'arabic' && 'px-1 py-0.5',
              isSelected
                ? 'text-[var(--accent)]'
                : isPlayingWord
                  ? 'word-reciting text-[var(--accent)]'
                  : 'text-[var(--fg)] hover:bg-[var(--ayah-highlight)]'
            )}
            aria-label={`Word ${word.position}${meaning ? `: ${meaning}` : ''}`}
            aria-pressed={isSelected || isPlayingWord}
            aria-current={isPlayingWord ? 'true' : undefined}
          >
            <span className={cn('font-arabic leading-loose', fontSizeClass)}>
              {word.textUthmani || word.textArabic}
            </span>
            {showInlineTranslation && (
              <span dir={rtlMeaning ? 'rtl' : 'ltr'} className={cn('mt-0.5 max-w-[5.5rem] truncate text-center text-slate-500', wordSizeClass)}>
                {meaning}
              </span>
            )}
            {showInlineTransliteration && (
              <span dir="ltr" className={cn('mt-0.5 max-w-[5.5rem] truncate text-center text-slate-400', wordSizeClass)}>
                {word.transliteration}
              </span>
            )}
            {showClickPopover && (
              <span className="absolute bottom-full left-1/2 z-20 mb-2 flex w-max max-w-[12rem] -translate-x-1/2 flex-col items-center gap-0.5 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-white shadow-lg">
                {meaning && (
                  <span dir={rtlMeaning ? 'rtl' : 'ltr'} className="w-full text-center">
                    {meaning}
                  </span>
                )}
                {word.transliteration && (
                  <span dir="ltr" className="w-full text-center text-xs font-normal text-white/85">
                    {word.transliteration}
                  </span>
                )}
              </span>
            )}
          </button>
        );
      })}
      {readerViewMode === 'arabic' && (
        <span className="ayah-verse-marker" aria-label={`Verse ${ayah.number}`}>
          {ayah.number}
        </span>
      )}
    </div>
  ) : mushafType === 'simple' && ayah.textTajweed ? (
    <span
      className={cn(
        'tajweed-text font-arabic ayah-arabic leading-loose text-[var(--fg)]',
        fontSizeClass,
        !showTajweedRules && 'tajweed-disabled',
        readerViewMode === 'arabic' ? 'inline text-center' : 'block text-right'
      )}
      lang="ar"
      dir="rtl"
      dangerouslySetInnerHTML={{ __html: ayah.textTajweed }}
    />
  ) : (
    <span
      className={cn(
        'font-arabic ayah-arabic leading-loose text-[var(--fg)]',
        fontSizeClass,
        readerViewMode === 'arabic' ? 'inline text-center' : 'block text-right'
      )}
      lang="ar"
      dir="rtl"
    >
      {ayah.textUthmani}
      {readerViewMode === 'arabic' && (
        <span className="ayah-verse-marker" aria-label={`Verse ${ayah.number}`}>
          {ayah.number}
        </span>
      )}
    </span>
  );

  const translationBody = ayah.translations && ayah.translations.length > 0 ? (
    <div className="space-y-3">
      {ayah.translations.map((t) => {
        const rtl = /^(ur|fa|ar|ps|sd)-/.test(t.translatorSlug) || t.translatorSlug.includes('bayan-ul-quran');
        return (
          <div key={t.translatorId} className="min-w-0 max-w-full" dir={rtl ? 'rtl' : 'ltr'}>
            <p className={cn('max-w-full break-words leading-7 text-slate-700 [overflow-wrap:anywhere]', rtl && 'text-right', translationSizeClass)}>
              {readerViewMode === 'translation' && (
                <span className="me-1.5 font-semibold text-slate-900">{ayah.number}.</span>
              )}
              {t.text}
            </p>
            {readerViewMode === 'verse' && (
              <p className={cn('mt-1 max-w-full break-words text-[10px] text-slate-400', rtl && 'text-right')}>
                — {t.translatorName || t.translatorSlug.replaceAll('-', ' ')}
              </p>
            )}
          </div>
        );
      })}
    </div>
  ) : (
    <p className="text-sm text-slate-400">Select a translation to read the meaning.</p>
  );

  return (
    <>
      <audio ref={wordAudioRef} className="hidden" preload="none" aria-hidden="true" />
      <article
        id={`ayah-${ayah.id}`}
        data-ayah-id={ayah.id}
        data-surah={surahNumber}
        data-ayah-number={ayah.number}
        onClick={readerViewMode !== 'verse' ? () => void handlePlay() : undefined}
        className={cn(
          'group relative transition-colors duration-200',
          readerViewMode === 'verse' && 'py-9 lg:py-12',
          readerViewMode === 'arabic' && 'inline',
          readerViewMode === 'translation' && 'rounded-md px-2 py-2 sm:px-3',
          readerViewMode === 'verse' && isCurrent && 'ayah-current rounded-xl px-4 -mx-4',
          readerViewMode === 'translation' && isCurrent && 'ayah-current-teal',
          readerViewMode === 'arabic' && isCurrent && 'ayah-current-arabic',
          versePinned && readerViewMode !== 'arabic' && 'ring-1 ring-[var(--accent)]/30 bg-[var(--accent)]/[0.03] rounded-xl px-4 -mx-4',
          readerViewMode !== 'verse' && 'cursor-pointer'
        )}
      >
        {pinned && versePinned && readerViewMode !== 'arabic' && (
          <div className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-[var(--accent)]/10 px-3 py-2 text-xs text-[var(--accent)]">
            <span>Pinned for compare</span>
            <button type="button" onClick={() => unpin(ayah.id)} className="font-medium underline-offset-2 hover:underline">Unpin</button>
          </div>
        )}
        {pinned && !versePinned && readerViewMode !== 'arabic' && (
          <div className="mb-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
            Comparing with {pinned.surahName} {pinned.surahNumber}:{pinned.ayahNumber}
          </div>
        )}

        {readerViewMode === 'verse' ? (
          <>
            <div className="mb-5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-8 min-w-[3.25rem] items-center justify-center text-base font-medium tabular-nums text-slate-400">
                  {surahNumber}:{ayah.number}
                </span>
                <button
                  type="button"
                  onClick={handlePlay}
                  aria-label={isCurrent && isPlaying ? 'Pause verse' : `Play verse ${ayah.number}`}
                  aria-pressed={isCurrent}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                    isCurrent
                      ? 'bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)]/25'
                      : 'text-[var(--muted)] hover:bg-[var(--ayah-highlight)] hover:text-[var(--fg)]'
                  )}
                >
                  {isCurrent && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleBookmark}
                  aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark verse'}
                  aria-pressed={bookmarked}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                    bookmarked
                      ? 'text-[var(--accent)] hover:bg-[var(--accent)]/10'
                      : 'text-[var(--muted)] hover:bg-[var(--ayah-highlight)] hover:text-[var(--fg)]'
                  )}
                >
                  {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                </button>
                {isCurrent && isPlaying && (
                  <div className="flex items-center gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-3 w-0.5 animate-bounce rounded-full bg-[var(--accent)]"
                        style={{ animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div
                className="relative flex items-center gap-1 text-slate-400"
                role="toolbar"
                aria-label={`More actions for verse ${ayah.number}`}
              >
                {(ayah.juz || ayah.page) && (
                  <div className="mr-1 hidden items-center gap-1.5 sm:flex">
                    {ayah.juz && (
                      <span className="rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">
                        Juz {ayah.juz}
                      </span>
                    )}
                    {ayah.page && (
                      <span className="rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">
                        P.{ayah.page}
                      </span>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label={copied ? 'Copied!' : 'Copy verse'}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--ayah-highlight)] hover:text-[var(--fg)]"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share verse"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--ayah-highlight)] hover:text-[var(--fg)]"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setMoreOpen((v) => !v)}
                  aria-label="More verse options"
                  aria-expanded={moreOpen}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-[var(--ayah-highlight)] hover:text-[var(--fg)]',
                    moreOpen ? 'bg-[var(--ayah-highlight)] text-[var(--fg)]' : 'text-[var(--muted)]'
                  )}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
                <VerseMoreMenu
                  open={moreOpen}
                  onOpenChange={setMoreOpen}
                  onAction={(action) => void handleMoreAction(action)}
                  wordByWordEnabled={showWordByWord}
                  pinned={versePinned}
                />
              </div>
            </div>

            <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:gap-14">
              <div className="order-2 flex min-h-20 min-w-0 max-w-full flex-col justify-center overflow-hidden lg:order-1">
                {showTranslation && hasTranslations ? translationBody : (
                  <p className="hidden text-sm text-slate-400 lg:block">Select a translation to read the meaning.</p>
                )}
              </div>
              <div className="order-1 flex min-h-20 min-w-0 max-w-full items-center justify-end overflow-visible lg:order-2">
                {arabicTextNode}
              </div>
            </div>

            <div className="mt-9 flex items-center gap-3 overflow-x-auto pb-1 text-slate-400 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden">
              <button type="button" onClick={() => setTafsirStudyOpen(true)} className="flex shrink-0 items-center gap-2 text-sm transition-colors hover:text-[var(--accent)]">
                <BookOpen className="h-4 w-4" /> Tafsirs
              </button>
              <span className="h-5 w-px shrink-0 bg-slate-200" />
              <button type="button" onClick={() => setLessonsStudyOpen(true)} className="flex shrink-0 items-center gap-2 text-sm hover:text-[var(--accent)]"><GraduationCap className="h-4 w-4" />Lessons</button>
              <span className="h-5 w-px shrink-0 bg-slate-200" />
              <button type="button" onClick={() => setResourceOpen('reflections')} className="flex shrink-0 items-center gap-2 text-sm hover:text-[var(--accent)]"><MessageCircle className="h-4 w-4" />Reflections</button>
              <span className="h-5 w-px shrink-0 bg-slate-200" />
              <button type="button" onClick={() => setHadithOpen(true)} className="flex shrink-0 items-center gap-2 text-sm hover:text-[var(--accent)]"><BookMarked className="h-4 w-4" />Hadith</button>
              <span className="h-5 w-px shrink-0 bg-slate-200" />
              <button type="button" onClick={() => setRelatedContentOpen(true)} className="flex shrink-0 items-center gap-2 text-sm hover:text-[var(--accent)]"><Copy className="h-4 w-4" />Related Content</button>
              {(ayah.juz || ayah.page) && (
                <div className="ml-auto flex items-center gap-1.5 sm:hidden">
                  {ayah.juz && <span className="rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">Juz {ayah.juz}</span>}
                  {ayah.page && <span className="rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">P.{ayah.page}</span>}
                </div>
              )}
            </div>
          </>
        ) : readerViewMode === 'arabic' ? (
          arabicTextNode
        ) : (
          <div className="mx-auto max-w-3xl">{translationBody}</div>
        )}
      </article>

      {resourceOpen && <VerseResourcePanel open={Boolean(resourceOpen)} onOpenChange={(value) => { if (!value) setResourceOpen(null); }} resource={resourceOpen} ayahId={ayah.id} surahNumber={surahNumber} surahName={surahName || `Surah ${surahNumber}`} ayahNumber={ayah.number} />}
      <HadithModal open={hadithOpen} onOpenChange={setHadithOpen} surahNumber={surahNumber} surahName={surahName || `Surah ${surahNumber}`} ayahNumber={ayah.number} />
      <TafsirStudyModal open={tafsirStudyOpen} onOpenChange={setTafsirStudyOpen} surahNumber={surahNumber} surahName={surahName || `Surah ${surahNumber}`} ayahNumber={ayah.number} />
      <LessonsStudyModal open={lessonsStudyOpen} onOpenChange={setLessonsStudyOpen} surahNumber={surahNumber} surahName={surahName || `Surah ${surahNumber}`} ayahNumber={ayah.number} />
      <RelatedContentModal open={relatedContentOpen} onOpenChange={setRelatedContentOpen} surahNumber={surahNumber} surahName={surahName || `Surah ${surahNumber}`} ayahNumber={ayah.number} />
      {translationsOpen && <TranslationSheet open={translationsOpen} onOpenChange={setTranslationsOpen} />}
      {settingsOpen && <ReaderSettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />}
      {shareOpen && (
        <ShareVerseModal
          open={shareOpen}
          onOpenChange={setShareOpen}
          surahNumber={surahNumber}
          surahName={surahName || `Surah ${surahNumber}`}
          ayahNumber={ayah.number}
          textUthmani={ayah.textUthmani}
          translation={ayah.translations?.[0]?.text}
        />
      )}
      {advancedCopyOpen && (
        <AdvancedCopyModal
          open={advancedCopyOpen}
          onOpenChange={setAdvancedCopyOpen}
          surahNumber={surahNumber}
          surahName={surahName || `Surah ${surahNumber}`}
          ayahNumber={ayah.number}
          textUthmani={ayah.textUthmani}
          translations={(ayah.translations ?? []).map((t) => ({
            name: t.translatorName || t.translatorSlug,
            text: t.text,
          }))}
          transliteration={ayah.words?.map((w) => w.transliteration).filter(Boolean).join(' ')}
        />
      )}

      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="max-w-md p-0">
          <div className="relative px-6 py-6">
            <button type="button" onClick={() => setNoteOpen(false)} className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100" aria-label="Close note">
              <X className="h-4 w-4" />
            </button>
            <DialogTitle className="text-xl font-bold text-slate-900">Verse note</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-slate-500">
              {surahName || `Surah ${surahNumber}`} {surahNumber}:{ayah.number}
            </DialogDescription>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              rows={5}
              placeholder="Write a personal note for this verse…"
              className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[var(--accent)] focus:bg-white"
            />
            <button type="button" onClick={handleSaveNote} className="mt-4 w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white">
              Save note
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {toast && (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}
