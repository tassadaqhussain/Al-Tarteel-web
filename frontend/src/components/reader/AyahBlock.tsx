'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Share2,
  MoreHorizontal,
  Volume2,
  X,
  SquarePen,
  GraduationCap,
  MessageCircle,
  BookMarked,
  PanelsTopLeft,
} from 'lucide-react';
import { useAudioStore } from '@/stores/audioStore';
import { useSettingsStore, WORD_BY_WORD_LOCALES } from '@/stores/settingsStore';
import { useBookmarksStore } from '@/stores/bookmarksStore';
import { useComparePinStore } from '@/stores/comparePinStore';
import { usersApi, type AyahWithRelations } from '@/lib/api';
import { startSurahPlayback } from '@/lib/audio/playback';
import { useRequireAuth } from '@/components/auth/AuthProvider';
import { TajweedText } from '@/components/tajweed/TajweedText';
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
import { getSurahPath } from '@/lib/surah-meta';
import {
  cancelWordMeaningSpeech,
  speakWordMeaning,
  warmSpeechVoices,
} from '@/lib/speakWordMeaning';

interface Props {
  ayah: AyahWithRelations;
  surahNumber: number;
  surahName?: string;
  hasTranslations?: boolean;
}

export function AyahBlock({ ayah, surahNumber, surahName = '' }: Props) {
  const { getCurrentAyah } = useAudioStore();
  const {
    fontSize,
    showWordByWord,
    setShowWordByWord,
    showTajweedRules,
    translationFontSize,
    wordByWordFontSize,
    wordByWordDisplay,
    wordByWordShowTranslation,
    wordByWordShowTransliteration,
    wordByWordLocale,
    setWordByWordLocale,
    wordClickPlayAudio,
    wordClickSpeakMeaning,
  } = useSettingsStore();
  const showTranslation = useSettingsStore((s) => s.showTranslation);
  const readerViewMode = useSettingsStore((s) => s.readerViewMode);
  const { add: addBookmark, remove: removeBookmark, isBookmarked, get: getBookmark, updateNote } = useBookmarksStore();
  const { pins, pin, unpin, isPinned } = useComparePinStore();
  const requireAuth = useRequireAuth();
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
    cancelWordMeaningSpeech();
  }, []);

  useEffect(() => {
    warmSpeechVoices();
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
      await startSurahPlayback({ surahNumber, startAyah: ayah.number });
    } catch {
      // Audio is optional; fail silently
    }
  }, [ayah.number, isCurrent, surahNumber]);

  // ── Feedback ─────────────────────────────────────────────────────────────
  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  // ── Bookmark ──────────────────────────────────────────────────────────────
  const handleBookmark = useCallback(() => {
    requireAuth(async () => {
      if (bookmarked) {
        removeBookmark(ayah.id);
        try {
          await usersApi.removeBookmark(ayah.id);
        } catch {
          /* optimistic local remove kept; refresh on next login sync */
        }
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
        try {
          await usersApi.addBookmark(ayah.id);
        } catch {
          removeBookmark(ayah.id);
          showToast('Could not save bookmark');
        }
      }
    }, { key: `bookmark:${ayah.id}` });
  }, [ayah, bookmarked, surahNumber, surahName, addBookmark, removeBookmark, requireAuth, showToast]);

  // ── Copy ─────────────────────────────────────────────────────────────────
  const handleCopy = useCallback(async () => {
    const parts = [ayah.textUthmani];
    if (ayah.translations?.length) parts.push(...ayah.translations.map((t) => t.text));
    parts.push(`— ${surahName || `Surah ${surahNumber}`}:${ayah.number}`);
    await navigator.clipboard.writeText(parts.join('\n\n')).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [ayah, surahNumber, surahName]);

  const handleShare = useCallback(() => {
    setShareOpen(true);
  }, []);

  const handleOpenNote = useCallback(() => {
    requireAuth(() => {
      const existing = getBookmark(ayah.id);
      setNoteDraft(existing?.note ?? '');
      setNoteOpen(true);
    }, { key: `note-open:${ayah.id}` });
  }, [ayah.id, getBookmark, requireAuth]);

  const handleSaveNote = useCallback(() => {
    requireAuth(async () => {
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
      try {
        await usersApi.addBookmark(ayah.id, noteDraft);
        setNoteOpen(false);
        showToast('Note saved');
      } catch {
        showToast('Could not save note');
      }
    }, { key: `note-save:${ayah.id}` });
  }, [addBookmark, ayah, isBookmarked, noteDraft, requireAuth, showToast, surahName, surahNumber, updateNote]);

  const playCurrentVerseOnly = useCallback(async (repeat: boolean) => {
    try {
      const ok = await startSurahPlayback({
        surahNumber,
        startAyah: ayah.number,
        continuous: repeat,
        verseOnly: true,
      });
      if (ok && repeat) showToast('Repeating this verse');
    } catch {
      // Audio is optional
    }
  }, [ayah.number, showToast, surahNumber]);

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
      case 'tafsir':
        setTafsirStudyOpen(true);
        break;
      case 'lessons':
        setLessonsStudyOpen(true);
        break;
      case 'reflections':
        setResourceOpen('reflections');
        break;
      case 'hadith':
        setHadithOpen(true);
        break;
      case 'related':
        setRelatedContentOpen(true);
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
        const embed = `<iframe src="${origin}${getSurahPath(surahNumber)}?embed=1#ayah-${surahNumber}-${ayah.number}" title="${surahName} ${surahNumber}:${ayah.number}" width="100%" height="360" frameborder="0" loading="lazy"></iframe>`;
        await navigator.clipboard.writeText(embed).catch(() => null);
        showToast('Embed code copied');
        break;
      }
      case 'settings':
        setSettingsOpen(true);
        break;
    }
  }, [ayah, pin, pins.length, playCurrentVerseOnly, setShowWordByWord, showToast, showWordByWord, surahName, surahNumber, unpin, versePinned]);

  const resolveWordMeaning = useCallback(
    (word: NonNullable<AyahWithRelations['words']>[number], locale = wordByWordLocale) =>
      word.translations?.[locale] ||
      word.translation ||
      word.translations?.en ||
      '',
    [wordByWordLocale],
  );

  const speakMeaningForWord = useCallback(
    (word: NonNullable<AyahWithRelations['words']>[number], locale = wordByWordLocale) => {
      if (!wordClickSpeakMeaning) return;
      const meaning = resolveWordMeaning(word, locale);
      if (!meaning) return;
      speakWordMeaning(meaning, locale);
    },
    [resolveWordMeaning, wordByWordLocale, wordClickSpeakMeaning],
  );

  const handleWordClick = useCallback(
    async (word: NonNullable<AyahWithRelations['words']>[number]) => {
      setSelectedWordPosition(word.position);
      if (wordTooltipTimerRef.current) window.clearTimeout(wordTooltipTimerRef.current);
      cancelWordMeaningSpeech();

      // Pause continuous ayah playback so word audio is clear (Quran.com behaviour).
      if (isPlaying) {
        useAudioStore.setState({ isPlaying: false });
      }

      const meaning = resolveWordMeaning(word);
      const willSpeak = wordClickSpeakMeaning && Boolean(meaning);
      const dismissMs = wordClickPlayAudio || willSpeak ? 6500 : meaning ? 3600 : 2200;
      wordTooltipTimerRef.current = window.setTimeout(() => {
        setSelectedWordPosition((current) => (current === word.position ? null : current));
      }, dismissMs);

      if (!wordClickPlayAudio && !willSpeak) return;

      const audio = wordAudioRef.current;
      // Verified Arabic word pronunciation CDN (language-independent).
      const url =
        word.audioUrl ||
        `https://audio.qurancdn.com/wbw/${String(surahNumber).padStart(3, '0')}_${String(ayah.number).padStart(3, '0')}_${String(word.position).padStart(3, '0')}.mp3`;

      if (wordClickPlayAudio && audio && url) {
        try {
          audio.onended = null;
          audio.pause();
          audio.currentTime = 0;
          if (audio.src !== url) {
            audio.src = url;
            audio.load();
          }
          if (willSpeak) {
            audio.onended = () => {
              speakMeaningForWord(word);
              audio.onended = null;
            };
          }
          await audio.play();
        } catch {
          // If Arabic audio fails, still speak the meaning when enabled.
          if (willSpeak) speakMeaningForWord(word);
        }
        return;
      }

      if (willSpeak) speakMeaningForWord(word);
    },
    [
      ayah.number,
      isPlaying,
      resolveWordMeaning,
      speakMeaningForWord,
      surahNumber,
      wordClickPlayAudio,
      wordClickSpeakMeaning,
    ],
  );

  const selectWordLocale = useCallback(
    (code: (typeof WORD_BY_WORD_LOCALES)[number]['code'], word: NonNullable<AyahWithRelations['words']>[number]) => {
      setWordByWordLocale(code);
      setSelectedWordPosition(word.position);
      // Avoid speaking again when Arabic clip finishes after a manual language switch.
      if (wordAudioRef.current) wordAudioRef.current.onended = null;
      if (wordTooltipTimerRef.current) window.clearTimeout(wordTooltipTimerRef.current);
      wordTooltipTimerRef.current = window.setTimeout(() => {
        setSelectedWordPosition((current) => (current === word.position ? null : current));
      }, 6500);
      // Re-speak meaning in the newly selected language (Arabic clip already played on open).
      const meaning = word.translations?.[code] || word.translation || word.translations?.en;
      if (wordClickSpeakMeaning && meaning) {
        speakWordMeaning(meaning, code);
      }
    },
    [setWordByWordLocale, wordClickSpeakMeaning],
  );

  const playingWordPosition = (() => {
    if (!isCurrent || !isPlaying || current?.trackKind === 'translation' || !ayah.words?.length) return null;

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

  const fontSizeClass = (
    readerViewMode === 'verse'
      ? { sm: 'text-3xl', md: 'text-4xl', lg: 'text-5xl', xl: 'text-6xl' }
      : { sm: 'text-2xl', md: 'text-3xl', lg: 'text-4xl', xl: 'text-5xl' }
  )[fontSize];
  const translationSizeClass = { sm: 'text-base', md: 'text-lg', lg: 'text-xl', xl: 'text-2xl' }[translationFontSize];
  const wordSizeClass = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm', xl: 'text-base' }[wordByWordFontSize];
  const verseProgress =
    current?.surahNumber === surahNumber
      ? current.ayahNumber > ayah.number
        ? 100
        : isCurrent && duration > 0
          ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
          : 0
      : 0;

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
        const availableLocales = WORD_BY_WORD_LOCALES.filter(
          (locale) => Boolean(word.translations?.[locale.code]),
        );
        const meaning =
          word.translations?.[wordByWordLocale] ||
          (availableLocales[0] ? word.translations?.[availableLocales[0].code] : undefined) ||
          word.translation ||
          word.translations?.en;
        const rtlMeaning = ['ar', 'ur', 'fa', 'ps'].includes(wordByWordLocale);
        const showInlineTranslation =
          readerViewMode === 'verse' &&
          showWordByWord &&
          wordByWordDisplay === 'inline' &&
          wordByWordShowTranslation &&
          meaning;
        const showInlineTransliteration =
          readerViewMode === 'verse' &&
          showWordByWord &&
          wordByWordDisplay === 'inline' &&
          wordByWordShowTransliteration &&
          word.transliteration;
        const showClickPopover =
          readerViewMode === 'verse' &&
          isSelected &&
          (meaning || word.transliteration || availableLocales.length > 0 || wordClickPlayAudio || wordClickSpeakMeaning);

        return (
          <div
            key={word.id}
            tabIndex={0}
            data-word-position={word.position}
            data-playing-word={isPlayingWord ? 'true' : undefined}
            onClick={(event) => {
              event.stopPropagation();
              void handleWordClick(word);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                void handleWordClick(word);
              }
            }}
            className={cn(
              'relative mx-[1px] my-0.5 cursor-pointer touch-manipulation select-none rounded-md border border-transparent bg-transparent transition-colors duration-150',
              readerViewMode === 'arabic'
                ? 'inline px-0.5 align-baseline'
                : 'inline-flex flex-col items-center justify-center align-middle',
              readerViewMode === 'verse' && showWordByWord && wordByWordDisplay === 'inline'
                ? 'min-w-[3.25rem] px-1.5 py-1'
                : readerViewMode !== 'arabic' && 'px-0.5 py-0.5',
              isSelected
                ? 'text-[var(--accent)]'
                : isPlayingWord
                  ? 'word-reciting text-[var(--accent)]'
                  : 'text-slate-900 hover:bg-emerald-50',
            )}
            aria-label={`Word ${word.position}${meaning ? `: ${meaning}` : ''}`}
            aria-pressed={isSelected || isPlayingWord}
            aria-current={isPlayingWord ? 'true' : undefined}
          >
            <span className={cn('font-arabic leading-loose', fontSizeClass)}>
              {word.textUthmani || word.textArabic}
            </span>
            {showInlineTranslation && (
              <span
                dir={rtlMeaning ? 'rtl' : 'ltr'}
                className={cn('mt-0.5 max-w-[5.5rem] truncate text-center text-slate-500', wordSizeClass)}
              >
                {meaning}
              </span>
            )}
            {showInlineTransliteration && (
              <span
                dir="ltr"
                className={cn('mt-0.5 max-w-[5.5rem] truncate text-center text-slate-400', wordSizeClass)}
              >
                {word.transliteration}
              </span>
            )}
            {showClickPopover && (
              <span
                role="tooltip"
                className="absolute bottom-full left-1/2 z-30 mb-2 flex w-max max-w-[16rem] -translate-x-1/2 flex-col items-stretch gap-1.5 rounded-xl bg-slate-900 px-2.5 py-2 text-left text-[11px] font-medium text-white shadow-lg"
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                {(wordClickPlayAudio || wordClickSpeakMeaning) && (
                  <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px] font-normal text-white/70">
                    {wordClickPlayAudio && (
                      <span className="inline-flex items-center gap-1">
                        <Volume2 className="h-3 w-3" aria-hidden />
                        Arabic
                      </span>
                    )}
                    {wordClickSpeakMeaning && meaning && (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-white/90 hover:bg-white/20"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          speakMeaningForWord(word);
                        }}
                        title="Speak meaning in selected language"
                      >
                        <Volume2 className="h-3 w-3" aria-hidden />
                        Speak {wordByWordLocale.toUpperCase()}
                      </button>
                    )}
                  </span>
                )}
                {meaning && (
                  <span dir={rtlMeaning ? 'rtl' : 'ltr'} className="w-full text-center text-[12px] leading-snug">
                    {meaning}
                  </span>
                )}
                {word.transliteration && (
                  <span dir="ltr" className="w-full text-center text-[10px] font-normal text-white/80">
                    {word.transliteration}
                  </span>
                )}
                {availableLocales.length > 1 && (
                  <span className="flex max-w-[15rem] flex-wrap justify-center gap-1 border-t border-white/10 pt-1.5">
                    {availableLocales.map((locale) => {
                      const active = wordByWordLocale === locale.code;
                      return (
                        <button
                          key={locale.code}
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            selectWordLocale(locale.code, word);
                          }}
                          className={cn(
                            'cursor-pointer rounded-full px-2 py-0.5 text-[10px] font-semibold transition',
                            active
                              ? 'bg-white text-slate-900'
                              : 'bg-white/10 text-white/90 hover:bg-white/20',
                          )}
                          aria-pressed={active}
                          title={`${locale.label}${wordClickSpeakMeaning ? ' — tap to hear meaning' : ''}`}
                        >
                          {locale.code.toUpperCase()}
                        </button>
                      );
                    })}
                  </span>
                )}
              </span>
            )}
          </div>
        );
      })}
      {readerViewMode === 'arabic' && (
        <span className="ayah-verse-marker" aria-label={`Verse ${ayah.number}`}>
          {ayah.number}
        </span>
      )}
    </div>
  ) : showTajweedRules && ayah.textTajweed ? (
    <>
      <TajweedText
        textTajweed={ayah.textTajweed}
        textUthmani={ayah.textUthmani}
        showColors={showTajweedRules}
        interactive={showTajweedRules}
        className={cn(
          'font-arabic ayah-arabic leading-loose text-slate-900',
          fontSizeClass,
          readerViewMode === 'arabic' ? 'inline text-center' : 'block text-right',
        )}
      />
      {readerViewMode === 'arabic' && (
        <span className="ayah-verse-marker" aria-label={`Verse ${ayah.number}`}>
          {ayah.number}
        </span>
      )}
    </>
  ) : (
    <span
      className={cn(
        'font-arabic ayah-arabic leading-loose text-slate-900',
        fontSizeClass,
        readerViewMode === 'arabic' ? 'inline text-center' : 'block text-right'
      )}
      lang="ar"
      dir="rtl"
      translate="no"
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
    <div className={cn('space-y-3', readerViewMode === 'verse' && 'space-y-8')}>
      {ayah.translations.map((t) => {
        const rtl = /^(ur|fa|ar|ps|sd)-/.test(t.translatorSlug) || t.translatorSlug.includes('bayan-ul-quran');
        return (
          <div
            key={t.translatorId}
            className={cn(
              'min-w-0 max-w-full',
              readerViewMode === 'verse' && 'max-w-3xl',
              readerViewMode === 'verse' && (rtl ? 'ml-auto' : 'mr-auto'),
            )}
            dir={rtl ? 'rtl' : 'ltr'}
          >
            <p className={cn('max-w-full break-words leading-8 text-slate-800 [overflow-wrap:anywhere]', rtl && 'text-right', translationSizeClass)}>
              {readerViewMode === 'translation' && (
                <span className="me-1.5 font-semibold text-slate-900">{ayah.number}.</span>
              )}
              {t.text}
            </p>
            {readerViewMode === 'verse' && (
              <p className={cn('mt-1 max-w-full break-words text-xs text-slate-500', rtl && 'text-right')}>
                — {t.translatorName || t.translatorSlug.replaceAll('-', ' ')}
              </p>
            )}
          </div>
        );
      })}
    </div>
  ) : (
    <button
      type="button"
      onClick={() => setTranslationsOpen(true)}
      className="text-sm font-medium text-emerald-800 underline-offset-2 hover:underline"
    >
      Choose a translation
    </button>
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
          readerViewMode === 'verse' && 'py-8 sm:py-12',
          readerViewMode === 'arabic' && 'inline',
          readerViewMode === 'translation' && 'rounded-md px-2 py-2 sm:px-3',
          readerViewMode === 'verse' && isCurrent && 'ayah-current -mx-4 border-l-[3px] border-emerald-800 bg-emerald-50/55 px-[13px] sm:-mx-6 sm:px-[21px]',
          readerViewMode === 'translation' && isCurrent && 'ayah-current-teal',
          readerViewMode === 'arabic' && isCurrent && 'ayah-current-arabic',
          versePinned && readerViewMode !== 'arabic' && 'ring-1 ring-[var(--accent)]/30 bg-[var(--accent)]/[0.03] rounded-[4px] px-4 -mx-4',
          readerViewMode !== 'verse' && 'cursor-pointer'
        )}
      >
        <span
          id={`ayah-number-${ayah.number}`}
          className="scroll-mt-36"
          aria-hidden
        />
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
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1 text-slate-400">
                <span className="min-w-[3.75rem] text-sm font-medium tabular-nums">
                  {surahNumber}:{ayah.number}
                </span>
                <button
                  type="button"
                  onClick={handlePlay}
                  aria-label={isCurrent && isPlaying ? 'Pause verse' : `Play verse ${ayah.number}`}
                  aria-pressed={isCurrent}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-[4px] transition-colors',
                    isCurrent
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      : 'hover:bg-slate-100 hover:text-slate-800',
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
                    'flex h-9 w-9 items-center justify-center rounded-[4px] transition-colors hover:bg-slate-100 hover:text-slate-800',
                    bookmarked && 'bg-emerald-50 text-emerald-800',
                  )}
                >
                  {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                </button>
                {isCurrent && isPlaying && (
                  <div className="ml-1 flex items-center gap-0.5" aria-label="Playing">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-3 w-0.5 animate-bounce rounded-full bg-emerald-800"
                        style={{ animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div
                className="relative flex shrink-0 items-center gap-1 text-slate-500 sm:opacity-50 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                role="toolbar"
                aria-label={`Actions for verse ${ayah.number}`}
              >
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label={copied ? 'Copied!' : 'Copy verse'}
                  className="flex h-9 w-9 items-center justify-center rounded-[4px] hover:bg-slate-100 hover:text-slate-900"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share verse"
                  className="flex h-9 w-9 items-center justify-center rounded-[4px] hover:bg-slate-100 hover:text-slate-900"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setNoteOpen(true)}
                  aria-label="Add verse note"
                  className="flex h-9 w-9 items-center justify-center rounded-[4px] hover:bg-slate-100 hover:text-slate-900"
                >
                  <SquarePen className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setMoreOpen((value) => !value)}
                  aria-label="More verse options"
                  aria-expanded={moreOpen}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-[4px] hover:bg-slate-100 hover:text-slate-900',
                    moreOpen && 'bg-slate-100 text-slate-900',
                  )}
                >
                  <MoreHorizontal className="h-4 w-4" />
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

            <div
              className="mt-4 h-0.5 overflow-hidden bg-slate-100"
              role="progressbar"
              aria-label={`Playback progress for ayah ${ayah.number}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(verseProgress)}
            >
              <div
                className="h-full bg-emerald-700 transition-[width] duration-200 ease-linear"
                style={{ width: `${verseProgress}%` }}
              />
            </div>

            <div className="ml-auto mt-7 flex min-h-24 max-w-4xl items-center justify-end px-1 text-right sm:mt-10 sm:min-h-32 sm:px-5">
              {arabicTextNode}
            </div>

            {showTranslation && (
              <div className="mt-8 w-full sm:mt-11">
                {translationBody}
              </div>
            )}

            <div className="mt-9 flex items-center gap-3 overflow-x-auto pb-1 text-sm text-slate-400 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden">
              <button type="button" onClick={() => setTafsirStudyOpen(true)} className="inline-flex shrink-0 items-center gap-1.5 font-medium hover:text-emerald-800">
                <BookOpen className="h-4 w-4" /> Tafsirs
              </button>
              <span className="h-4 w-px shrink-0 bg-slate-200" />
              <button type="button" onClick={() => setLessonsStudyOpen(true)} className="inline-flex shrink-0 items-center gap-1.5 font-medium hover:text-emerald-800">
                <GraduationCap className="h-4 w-4" /> Lessons
              </button>
              <span className="h-4 w-px shrink-0 bg-slate-200" />
              <button type="button" onClick={() => setResourceOpen('reflections')} className="inline-flex shrink-0 items-center gap-1.5 font-medium hover:text-emerald-800">
                <MessageCircle className="h-4 w-4" /> Reflections
              </button>
              <span className="h-4 w-px shrink-0 bg-slate-200" />
              <button type="button" onClick={() => setHadithOpen(true)} className="inline-flex shrink-0 items-center gap-1.5 font-medium hover:text-emerald-800">
                <BookMarked className="h-4 w-4" /> Hadith
              </button>
              <span className="h-4 w-px shrink-0 bg-slate-200" />
              <button type="button" onClick={() => setRelatedContentOpen(true)} className="inline-flex shrink-0 items-center gap-1.5 font-medium hover:text-emerald-800">
                <PanelsTopLeft className="h-4 w-4" /> Related content
              </button>
              {(ayah.juz || ayah.page) && (
                <span className="ml-auto hidden shrink-0 text-xs lg:inline">
                  {ayah.juz ? `Juz ${ayah.juz}` : ''}
                  {ayah.juz && ayah.page ? ' · ' : ''}
                  {ayah.page ? `Page ${ayah.page}` : ''}
                </span>
              )}
            </div>
          </div>
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
