'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
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
import { splitTajweedIntoWords, alignsWithWords } from '@/lib/tajweed/word-split';
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
import { toArabicNumber } from '@/lib/arabic-number';
import {
  cancelWordMeaningSpeech,
  cancelServerSpeech,
  speakWordMeaning,
  speakWordMeaningRemote,
  serverCanSpeak,
  warmSpeechVoices,
} from '@/lib/speakWordMeaning';
import { useHasSpeechVoice } from '@/hooks/useHasSpeechVoice';

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
      cancelServerSpeech();
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

  // Several desktop OSes ship no Urdu/Persian voice; don't offer a control
  // that SpeechSynthesis would silently ignore.
  const hasLocalVoice = useHasSpeechVoice(wordByWordLocale);
  // Our Piper service covers the languages desktops ship no voice for.
  const canSpeakLocale = hasLocalVoice || serverCanSpeak(wordByWordLocale);

  const speakMeaningForWord = useCallback(
    (word: NonNullable<AyahWithRelations['words']>[number], locale = wordByWordLocale) => {
      if (!wordClickSpeakMeaning) return;
      const meaning = resolveWordMeaning(word, locale);
      if (!meaning) return;
      // Prefer the device voice (instant, offline); fall back to our own Piper
      // service for languages the OS ships no voice for.
      if (speakWordMeaning(meaning, locale)) return;
      void speakWordMeaningRemote(meaning, locale).then((spoken) => {
        if (!spoken) {
          showToast(`No ${locale.toUpperCase()} speech voice available`);
        }
      });
    },
    [resolveWordMeaning, showToast, wordByWordLocale, wordClickSpeakMeaning],
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
      //
      // Only the stored URL is trusted. The CDN counts waqf/sajdah marks as
      // their own words, so its index diverges from `position` for ~36% of the
      // Quran (by up to 16). Deriving the file name from `position` would play
      // a DIFFERENT word — worse than silence for Quranic text — so a missing
      // URL simply means no pronunciation.
      const url = word.audioUrl;

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

  const endMarkerNode = (
    <span
      className="ayah-verse-marker select-none inline-flex items-center justify-center align-middle mx-1.5"
      aria-label={`Verse ${ayah.number}`}
      title={`Ayah ${ayah.number}`}
    >
      <span className="font-arabic text-[12px] font-bold leading-none text-ink-2">
        {toArabicNumber(ayah.number)}
      </span>
    </span>
  );

  /**
   * Tajweed colours for the word-by-word view. The tajweed markup and
   * `ayah.words` use different Uthmani orthographies, so they align by word
   * index, not by character. If the counts disagree for a verse we render the
   * words uncoloured rather than risk mis-colouring the text.
   */
  const tajweedByWord = useMemo(() => {
    if (!showTajweedRules || !ayah.textTajweed || !ayah.words?.length) return null;
    const split = splitTajweedIntoWords(ayah.textTajweed);
    return alignsWithWords(split, ayah.words.length) ? split : null;
  }, [showTajweedRules, ayah.textTajweed, ayah.words]);

  const arabicTextNode = ayah.words && ayah.words.length > 0 ? (
    <div
      ref={wordsContainerRef}
      className={cn(
        'ayah-arabic-block min-w-0 max-w-full leading-[2]',
        tajweedByWord && 'tajweed-text',
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
                  : 'text-ink hover:bg-brand/10',
            )}
            aria-label={`Word ${word.position}${meaning ? `: ${meaning}` : ''}`}
            aria-pressed={isSelected || isPlayingWord}
            aria-current={isPlayingWord ? 'true' : undefined}
          >
            <span className={cn('font-arabic leading-loose', fontSizeClass)}>
              {tajweedByWord?.[word.position - 1]
                ? tajweedByWord[word.position - 1].spans.map((span, spanIndex) =>
                    span.ruleId ? (
                      <span key={spanIndex} className={cn('tajweed-mark', span.ruleId)}>
                        {span.text}
                      </span>
                    ) : (
                      <span key={spanIndex}>{span.text}</span>
                    ),
                  )
                : word.textUthmani || word.textArabic}
            </span>
            {showInlineTranslation && (
              <span
                dir={rtlMeaning ? 'rtl' : 'ltr'}
                className={cn('mt-0.5 max-w-[5.5rem] truncate text-center text-ink-muted', wordSizeClass)}
              >
                {meaning}
              </span>
            )}
            {showInlineTransliteration && (
              <span
                dir="ltr"
                className={cn('mt-0.5 max-w-[5.5rem] truncate text-center text-ink-faint', wordSizeClass)}
              >
                {word.transliteration}
              </span>
            )}
            {showClickPopover && (
              <span
                role="tooltip"
                className="absolute bottom-full left-1/2 z-30 mb-2 flex w-max max-w-[16rem] -translate-x-1/2 flex-col items-stretch gap-1.5 rounded-xl bg-tooltip px-2.5 py-2 text-left text-[11px] font-medium text-tooltip-ink shadow-lg"
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                {(wordClickPlayAudio || wordClickSpeakMeaning) && (
                  <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px] font-normal text-tooltip-ink/70">
                    {wordClickPlayAudio && (
                      <span className="inline-flex items-center gap-1">
                        <Volume2 className="h-3 w-3" aria-hidden />
                        Arabic
                      </span>
                    )}
                    {wordClickSpeakMeaning && canSpeakLocale && meaning && (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-full bg-tooltip-ink/10 px-2 py-0.5 text-tooltip-ink/90 hover:bg-tooltip-ink/20"
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
                  <span dir="ltr" className="w-full text-center text-[10px] font-normal text-tooltip-ink/80">
                    {word.transliteration}
                  </span>
                )}
                {availableLocales.length > 1 && (
                  <span className="flex max-w-[15rem] flex-wrap justify-center gap-1 border-t border-tooltip-ink/10 pt-1.5">
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
                              ? 'bg-surface text-ink'
                              : 'bg-surface/10 text-surface/90 hover:bg-surface/20',
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
      {endMarkerNode}
    </div>
  ) : showTajweedRules && ayah.textTajweed ? (
    <div className={cn('ayah-arabic-block', readerViewMode === 'arabic' ? 'inline text-center' : 'w-full text-right')} dir="rtl" lang="ar">
      <TajweedText
        textTajweed={ayah.textTajweed}
        textUthmani={ayah.textUthmani}
        showColors={showTajweedRules}
        interactive={showTajweedRules}
        className={cn(
          'font-arabic ayah-arabic leading-loose text-ink',
          fontSizeClass,
          'inline',
        )}
      />
      {endMarkerNode}
    </div>
  ) : (
    <div
      className={cn(
        'ayah-arabic-block font-arabic ayah-arabic text-ink',
        fontSizeClass,
        readerViewMode === 'arabic' ? 'inline text-center' : 'w-full text-right'
      )}
      lang="ar"
      dir="rtl"
      translate="no"
    >
      <span>{ayah.textUthmani}</span>
      {endMarkerNode}
    </div>
  );

  const translationBody = ayah.translations && ayah.translations.length > 0 ? (
    <div className={cn('space-y-4', readerViewMode === 'verse' && 'space-y-6')}>
      {ayah.translations.map((t) => {
        const rtl = /^(ur|fa|ar|ps|sd)-/.test(t.translatorSlug) || t.translatorSlug.includes('bayan-ul-quran') || t.translatorSlug.includes('urdu');
        return (
          <div
            key={t.translatorId}
            className={cn(
              'min-w-0 max-w-full',
              readerViewMode === 'verse' && (rtl ? 'text-right' : 'text-left'),
            )}
            dir={rtl ? 'rtl' : 'ltr'}
          >
            <p
              className={cn(
                'max-w-full break-words leading-relaxed text-ink [overflow-wrap:anywhere]',
                rtl ? 'font-arabic text-lg sm:text-xl leading-loose' : 'font-sans',
                translationSizeClass,
              )}
            >
              {readerViewMode === 'translation' && (
                <span className="me-1.5 font-semibold text-ink">{ayah.number}.</span>
              )}
              {t.text}
            </p>
            {readerViewMode === 'verse' && (
              <p
                className={cn(
                  'mt-1.5 max-w-full break-words text-xs text-ink-faint tracking-wide font-normal',
                  rtl && 'text-right',
                )}
              >
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
      className="text-sm font-medium text-brand underline-offset-2 hover:underline"
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
          'group relative transition-all duration-200',
          readerViewMode === 'verse' && 'py-[30px]',
          readerViewMode === 'arabic' && 'inline',
          readerViewMode === 'translation' && 'rounded-md px-2 py-2 sm:px-3',
          readerViewMode === 'verse' && isCurrent && 'ayah-current -mx-4 border-l-[3px] border-emerald-700 bg-brand/[0.045] px-[13px] sm:-mx-6 sm:px-[21px]',
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
          <div className="mb-3 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink-muted">
            Comparing with {pinned.surahName} {pinned.surahNumber}:{pinned.ayahNumber}
          </div>
        )}

        {readerViewMode === 'verse' ? (
          <div className="mx-auto max-w-[1064px]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-ink-faint">
                <span className="me-1 text-xl font-medium text-ink-faint tabular-nums">
                  {surahNumber}:{ayah.number}
                </span>
                <button
                  type="button"
                  onClick={handlePlay}
                  aria-label={isCurrent && isPlaying ? 'Pause verse' : `Play verse ${ayah.number}`}
                  aria-pressed={isCurrent}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                    isCurrent && isPlaying
                      ? 'bg-brand/15 text-brand'
                      : 'text-ink-faint hover:bg-surface-3 hover:text-ink-2',
                  )}
                  title={isCurrent && isPlaying ? 'Pause verse' : 'Play verse'}
                >
                  {isCurrent && isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleBookmark}
                  aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark verse'}
                  aria-pressed={bookmarked}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                    bookmarked
                      ? 'text-brand bg-brand/10'
                      : 'text-ink-faint hover:bg-surface-3 hover:text-ink-2',
                  )}
                  title="Bookmark verse"
                >
                  {bookmarked ? <BookmarkCheck className="h-3.5 w-3.5 fill-current text-brand" /> : <Bookmark className="h-3.5 w-3.5" />}
                </button>
                {isCurrent && isPlaying && (
                  <div className="ml-1 flex items-center gap-0.5" aria-label="Playing">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-3 w-0.5 animate-bounce rounded-full bg-emerald-700"
                        style={{ animationDelay: `${i * 120}ms` }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div
                className="relative flex shrink-0 items-center gap-1 text-ink-faint sm:opacity-60 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                role="toolbar"
                aria-label={`Actions for verse ${ayah.number}`}
              >
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label={copied ? 'Copied!' : 'Copy verse'}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink-faint hover:bg-surface-3 hover:text-ink-2 transition-colors"
                  title="Copy verse"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-brand" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share verse"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink-faint hover:bg-surface-3 hover:text-ink-2 transition-colors"
                  title="Share verse"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setNoteOpen(true)}
                  aria-label="Add verse note"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink-faint hover:bg-surface-3 hover:text-ink-2 transition-colors"
                  title="Add note"
                >
                  <SquarePen className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setMoreOpen((value) => !value)}
                  aria-label="More verse options"
                  aria-expanded={moreOpen}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-ink-faint hover:bg-surface-3 hover:text-ink-2 transition-colors',
                    moreOpen && 'bg-surface-3 text-ink-2',
                  )}
                  title="More options"
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

            {isCurrent && (
              <div
                className="mt-3.5 h-0.5 overflow-hidden bg-surface-3"
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
            )}

            <div className="mt-[50px] flex w-full items-center justify-end text-right">
              {arabicTextNode}
            </div>

            {showTranslation && (
              <div className="mt-4 w-full">
                {translationBody}
              </div>
            )}

            <div className="mt-[50px] flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm text-ink-faint [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-3 [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => setTafsirStudyOpen(true)}
                className="inline-flex shrink-0 items-center gap-1.5 font-medium text-ink-faint hover:text-brand hover:bg-brand/[0.06] rounded px-2 py-1 transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5" /> Tafsirs
              </button>
              <span className="h-3.5 w-px shrink-0 bg-line" />
              <button
                type="button"
                onClick={() => setLessonsStudyOpen(true)}
                className="inline-flex shrink-0 items-center gap-1.5 font-medium text-ink-faint hover:text-brand hover:bg-brand/[0.06] rounded px-2 py-1 transition-colors"
              >
                <GraduationCap className="h-3.5 w-3.5" /> Lessons
              </button>
              <span className="h-3.5 w-px shrink-0 bg-line" />
              <button
                type="button"
                onClick={() => setResourceOpen('reflections')}
                className="inline-flex shrink-0 items-center gap-1.5 font-medium text-ink-faint hover:text-brand hover:bg-brand/[0.06] rounded px-2 py-1 transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" /> Reflections
              </button>
              <span className="h-3.5 w-px shrink-0 bg-line" />
              <button
                type="button"
                onClick={() => setHadithOpen(true)}
                className="inline-flex shrink-0 items-center gap-1.5 font-medium text-ink-faint hover:text-brand hover:bg-brand/[0.06] rounded px-2 py-1 transition-colors"
              >
                <BookMarked className="h-3.5 w-3.5" /> Hadith
              </button>
              <span className="h-3.5 w-px shrink-0 bg-line" />
              <button
                type="button"
                onClick={() => setRelatedContentOpen(true)}
                className="inline-flex shrink-0 items-center gap-1.5 font-medium text-ink-faint hover:text-brand hover:bg-brand/[0.06] rounded px-2 py-1 transition-colors"
              >
                <PanelsTopLeft className="h-3.5 w-3.5" /> Related content
              </button>
              {(ayah.juz || ayah.page) && (
                <span className="ml-auto hidden shrink-0 text-xs text-ink-faint lg:inline">
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
            <button type="button" onClick={() => setNoteOpen(false)} className="absolute right-4 top-4 rounded-full p-2 text-ink-faint hover:bg-surface-3" aria-label="Close note">
              <X className="h-4 w-4" />
            </button>
            <DialogTitle className="text-xl font-bold text-ink">Verse note</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-ink-muted">
              {surahName || `Surah ${surahNumber}`} {surahNumber}:{ayah.number}
            </DialogDescription>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              rows={5}
              placeholder="Write a personal note for this verse…"
              className="mt-4 w-full resize-none rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-ink outline-none focus:border-[var(--accent)] focus:bg-surface"
            />
            <button type="button" onClick={handleSaveNote} className="mt-4 w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-brand-contrast">
              Save note
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {toast && (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-tooltip px-4 py-2 text-sm text-tooltip-ink shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}
