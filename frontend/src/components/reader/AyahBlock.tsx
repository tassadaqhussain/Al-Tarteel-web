'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
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
import { cleanTranslationText } from '@/lib/clean-translation';
import { useSettingsStore, WORD_BY_WORD_LOCALES } from '@/stores/settingsStore';
import { useBookmarksStore } from '@/stores/bookmarksStore';
import { useComparePinStore } from '@/stores/comparePinStore';
import { useStudyStore } from '@/stores/studyStore';
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
import { loadReaderWords, type ReaderWord } from '@/lib/word-data';
import { cn } from '@/lib/utils';
import { getAyahPath, getSurahPath } from '@/lib/surah-meta';
import { localePath, type ContentLocale } from '@/lib/i18n/content-locales';
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
  locale?: ContentLocale;
}

export function AyahBlock({ ayah: initialAyah, surahNumber, surahName = '', locale = 'en' }: Props) {
  const ayahHref = localePath(locale, getAyahPath(surahNumber, initialAyah.number));
  const { getCurrentAyah } = useAudioStore();
  const {
    fontSize,
    showWordByWord,
    setShowWordByWord,
    showTajweedRules,
    mushafType,
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
  const [fallbackWords, setFallbackWords] = useState<{ key: string; words: ReaderWord[] } | null>(null);
  const wordDataKey = `${surahNumber}:${initialAyah.number}:${wordByWordLocale}`;
  const ayah = initialAyah.words?.length ? initialAyah : {
    ...initialAyah, words: fallbackWords?.key === wordDataKey ? fallbackWords.words : [],
  };
  useEffect(() => {
    if (initialAyah.words?.length) return;
    let cancelled = false;
    void loadReaderWords(surahNumber, initialAyah.number, wordByWordLocale).then(words => {
      if (!cancelled) setFallbackWords({ key: wordDataKey, words });
    }).catch(() => { /* Keep the original Quran text if the source is unavailable. */ });
    return () => { cancelled = true; };
  }, [initialAyah.words, initialAyah.number, surahNumber, wordByWordLocale, wordDataKey]);
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
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Audio could not load. Please try again.');
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
          translation: ayah.translations?.[0]?.text
            ? cleanTranslationText(ayah.translations[0].text)
            : undefined,
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
    if (ayah.translations?.length) parts.push(...ayah.translations.map((t) => cleanTranslationText(t.text)));
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
          translation: ayah.translations?.[0]?.text
            ? cleanTranslationText(ayah.translations[0].text)
            : undefined,
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
            translation: ayah.translations?.[0]?.text
            ? cleanTranslationText(ayah.translations[0].text)
            : undefined,
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
      // Prefer the URL from the API (local file or imported CDN path). Fall back
      // to the public WBW CDN so a missing field still pronounces the word.
      const url =
        word.audioUrl ||
        `https://audio.qurancdn.com/wbw/${String(surahNumber).padStart(3, '0')}_${String(ayah.number).padStart(3, '0')}_${String(word.position).padStart(3, '0')}.mp3`;

      if (wordClickPlayAudio && audio && url) {
        try {
          audio.onended = null;
          audio.pause();
          // Never set currentTime before a source exists — Safari throws
          // InvalidStateError and the click then plays nothing.
          if (audio.getAttribute('src') !== url) {
            audio.src = url;
          } else if (audio.readyState > 0) {
            audio.currentTime = 0;
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

  const activeVerse = useStudyStore((s) => s.activeVerse);
  const setActiveVerse = useStudyStore((s) => s.setActiveVerse);
  const openStudy = useStudyStore((s) => s.openStudy);
  const isActiveVerse = activeVerse ? activeVerse.ayahId === ayah.id : isCurrent;
  const versePayload = {
    ayahId: ayah.id,
    surahNumber,
    ayahNumber: ayah.number,
    surahName: surahName || `Surah ${surahNumber}`,
    textUthmani: ayah.textUthmani,
  };

  useEffect(() => {
    if (isCurrent) {
      setActiveVerse(versePayload);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCurrent, ayah.id]);

  const fontSizeClass = (
    readerViewMode === 'verse'
      ? { sm: 'text-[24px] sm:text-[28px]', md: 'text-[28px] sm:text-[34px]', lg: 'text-[32px] sm:text-[40px]', xl: 'text-[36px] sm:text-[46px]' }
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
    <Link
      href={ayahHref}
      prefetch={false}
      className="ayah-verse-marker select-none inline-flex items-center justify-center align-middle mx-1.5 hover:text-brand"
      aria-label={`Verse ${ayah.number}`}
      title={`Ayah ${ayah.number}`}
    >
      <span className="font-arabic text-[12px] font-bold leading-none text-ink-2">
        {toArabicNumber(ayah.number)}
      </span>
    </Link>
  );

  const useIndopakMushaf = mushafType === 'indopak';
  const primaryArabicText =
    useIndopakMushaf && ayah.textIndopak?.trim() ? ayah.textIndopak : ayah.textUthmani;
  const canShowTajweed = !useIndopakMushaf && showTajweedRules;

  /**
   * Tajweed colours for the word-by-word view. The tajweed markup and
   * `ayah.words` use different Uthmani orthographies, so they align by word
   * index, not by character. If the counts disagree for a verse we render the
   * words uncoloured rather than risk mis-colouring the text.
   */
  const tajweedByWord = useMemo(() => {
    if (!canShowTajweed || !ayah.textTajweed || !ayah.words?.length) return null;
    const split = splitTajweedIntoWords(ayah.textTajweed);
    return alignsWithWords(split, ayah.words.length) ? split : null;
  }, [canShowTajweed, ayah.textTajweed, ayah.words]);

  const arabicTextNode = ayah.words && ayah.words.length > 0 ? (
    <div
      ref={wordsContainerRef}
      className={cn(
        'ayah-arabic-block min-w-0 max-w-full overflow-visible leading-[2]',
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
          readerViewMode !== 'translation' &&
          isSelected &&
          (meaning || word.transliteration || availableLocales.length > 0 || wordClickPlayAudio || wordClickSpeakMeaning);

        return (
          <div
            key={word.id}
            role="button"
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
  ) : canShowTajweed && ayah.textTajweed ? (
    <div className={cn('ayah-arabic-block', readerViewMode === 'arabic' ? 'inline text-center' : 'w-full text-right')} dir="rtl" lang="ar">
      <TajweedText
        textTajweed={ayah.textTajweed}
        textUthmani={ayah.textUthmani}
        showColors={canShowTajweed}
        interactive={canShowTajweed}
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
      <span>{primaryArabicText}</span>
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
                'max-w-[68ch] break-words not-italic leading-relaxed text-[#334155] dark:text-ink-2 [overflow-wrap:anywhere]',
                rtl ? 'font-arabic text-lg sm:text-xl leading-loose' : 'font-sans',
                translationSizeClass,
              )}
            >
              {readerViewMode === 'translation' && (
                <Link
                  href={ayahHref}
                  prefetch={false}
                  className="me-1.5 font-semibold text-ink hover:text-brand hover:underline"
                >
                  {ayah.number}.
                </Link>
              )}
              {cleanTranslationText(t.text)}
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
      <audio ref={wordAudioRef} className="pointer-events-none fixed left-0 top-0 h-px w-px opacity-0" preload="none" playsInline aria-hidden="true" />
      <article
        id={`ayah-${ayah.id}`}
        data-ayah-id={ayah.id}
        data-surah={surahNumber}
        data-ayah-number={ayah.number}
        tabIndex={readerViewMode === 'verse' ? 0 : undefined}
        onClick={
          readerViewMode === 'verse'
            ? () => setActiveVerse(versePayload)
            : () => void handlePlay()
        }
        onKeyDown={
          readerViewMode === 'verse'
            ? (e) => {
                if (e.key === 'Enter' && e.target === e.currentTarget) {
                  e.preventDefault();
                  setActiveVerse(versePayload);
                }
              }
            : undefined
        }
        className={cn(
          'group relative transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
          readerViewMode === 'verse' &&
            'rounded-2xl border border-line bg-surface p-4 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-6 sm:py-6',
          readerViewMode === 'arabic' && 'inline',
          readerViewMode === 'translation' && 'rounded-md px-2 py-2 sm:px-3',
          readerViewMode === 'verse' &&
            isActiveVerse &&
            'ayah-current border-[var(--accent)] bg-[rgba(6,95,70,0.07)] sm:bg-[rgba(6,95,70,0.07)]',
          readerViewMode === 'translation' && isCurrent && 'ayah-current-teal',
          readerViewMode === 'arabic' && isCurrent && 'ayah-current-arabic',
          versePinned && readerViewMode !== 'arabic' && 'ring-1 ring-[var(--accent)]/30',
          'cursor-pointer',
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
          <div className="sm:flex sm:items-start sm:gap-5">
            {/* Gutter: verse-ref pill + round play button */}
            <div className="mb-3 flex shrink-0 items-center gap-2 sm:mb-0 sm:w-20 sm:flex-col sm:items-start sm:gap-2.5 sm:pt-1">
              <Link
                href={ayahHref}
                prefetch={false}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  'inline-flex min-h-7 items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums transition-colors',
                  isActiveVerse
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-surface-2 text-ink-2 hover:bg-[var(--accent)]/15 hover:text-[var(--accent)]',
                )}
              >
                {surahNumber}:{ayah.number}
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveVerse(versePayload);
                  void handlePlay();
                }}
                aria-label={isCurrent && isPlaying ? 'Pause verse' : `Play verse ${ayah.number}`}
                aria-pressed={isCurrent}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border transition-colors sm:h-9 sm:w-9',
                  isCurrent && isPlaying
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                    : 'border-line bg-surface text-ink-2 hover:border-[var(--accent)] hover:text-[var(--accent)]',
                )}
                title={isCurrent && isPlaying ? 'Pause verse' : 'Play verse'}
              >
                {isCurrent && isPlaying ? (
                  <Pause className="h-3.5 w-3.5 fill-current" />
                ) : (
                  <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
                )}
              </button>
            </div>

            <div className="min-w-0 flex-1">
              {isCurrent && (
                <div
                  className="mb-3 h-0.5 overflow-hidden rounded-full bg-surface-3"
                  role="progressbar"
                  aria-label={`Playback progress for ayah ${ayah.number}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(verseProgress)}
                >
                  <div
                    className="h-full bg-[var(--accent)] transition-[width] duration-200 ease-linear"
                    style={{ width: `${verseProgress}%` }}
                  />
                </div>
              )}

              <div className="flex w-full items-center justify-end overflow-visible text-right">
                {arabicTextNode}
              </div>

              {showTranslation && (
                <div className="mt-4 w-full">
                  {translationBody}
                </div>
              )}

              {isActiveVerse && (
                <div
                  className="mt-4 border-t border-line-subtle pt-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Desktop active action bar */}
                  <div className="hidden flex-wrap items-center gap-2 sm:flex">
                    <button
                      type="button"
                      onClick={() => openStudy(versePayload, 'tafsir')}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[var(--accent)] px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Study</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleBookmark}
                      aria-pressed={bookmarked}
                      className={cn(
                        'inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition',
                        bookmarked
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                          : 'border-line bg-surface text-ink-2 hover:border-[var(--accent)]',
                      )}
                    >
                      {bookmarked ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                      <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteOpen(true)}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-2 transition hover:border-[var(--accent)]"
                    >
                      <SquarePen className="h-3.5 w-3.5" />
                      <span>Note</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-2 transition hover:border-[var(--accent)]"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-[var(--accent)]" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShare}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-2 transition hover:border-[var(--accent)]"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Mobile active 4-button grid: Study, Save, Note, More */}
                  <div className="relative grid grid-cols-4 gap-2 sm:hidden">
                    <button
                      type="button"
                      onClick={() => openStudy(versePayload, 'tafsir')}
                      className="flex min-h-11 items-center justify-center gap-1 rounded-xl bg-[var(--accent)] px-2 text-xs font-semibold text-white"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Study</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleBookmark}
                      aria-pressed={bookmarked}
                      className={cn(
                        'flex min-h-11 items-center justify-center gap-1 rounded-xl border px-2 text-xs font-semibold',
                        bookmarked
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                          : 'border-line bg-surface text-ink-2',
                      )}
                    >
                      {bookmarked ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                      <span>Save</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteOpen(true)}
                      className="flex min-h-11 items-center justify-center gap-1 rounded-xl border border-line bg-surface px-2 text-xs font-semibold text-ink-2"
                    >
                      <SquarePen className="h-3.5 w-3.5" />
                      <span>Note</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMoreOpen((v) => !v)}
                      aria-expanded={moreOpen}
                      className="flex min-h-11 items-center justify-center gap-1 rounded-xl border border-line bg-surface px-2 text-xs font-semibold text-ink-2"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                      <span>More</span>
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
          translation={
            ayah.translations?.[0]?.text
              ? cleanTranslationText(ayah.translations[0].text)
              : undefined
          }
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
            text: cleanTranslationText(t.text),
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
