'use client';

import { useCallback, useRef, useState } from 'react';
import {
  Play,
  Pause,
  BookMarked,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Share2,
} from 'lucide-react';
import { useAudioStore } from '@/stores/audioStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useBookmarksStore } from '@/stores/bookmarksStore';
import { audioApi, type AyahWithRelations } from '@/lib/api';
import { TafsirPanel } from './TafsirPanel';
import { cn } from '@/lib/utils';

interface Props {
  ayah: AyahWithRelations;
  surahNumber: number;
  surahName?: string;
  showTranslation?: boolean;
}

export function AyahBlock({ ayah, surahNumber, surahName = '', showTranslation }: Props) {
  const { getCurrentAyah, setPlaylist, setPlaying, setReciter, reciterSlug } = useAudioStore();
  const {
    fontSize,
    reciterSlug: settingsReciter,
    showWordByWord,
    setReciterSlug,
  } = useSettingsStore();
  const { add: addBookmark, remove: removeBookmark, isBookmarked } = useBookmarksStore();

  const current = getCurrentAyah();
  const isCurrent = current?.ayahId === ayah.id;
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const currentTime = useAudioStore((s) => s.currentTime);
  const duration = useAudioStore((s) => s.duration);
  const bookmarked = isBookmarked(ayah.id);

  const [tafsirOpen, setTafsirOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeWordAudio, setActiveWordAudio] = useState<number | null>(null);
  const wordAudioRef = useRef<HTMLAudioElement | null>(null);

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
        setPlaylist(items);
        useAudioStore.setState({ currentIndex: idx });
        setPlaying(true);
      }
    } catch {
      // Audio is optional; fail silently
    }
  }, [ayah.number, isCurrent, reciterSlug, settingsReciter, surahNumber, setPlaylist, setPlaying, setReciter, setReciterSlug]);

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

  // ── Share ─────────────────────────────────────────────────────────────────
  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/surah/${surahNumber}#ayah-${ayah.id}`;
    if (navigator.share) {
      await navigator.share({ title: `${surahName} ${ayah.number}`, text: ayah.textUthmani, url }).catch(() => null);
    } else {
      await navigator.clipboard.writeText(url).catch(() => null);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [ayah, surahNumber, surahName]);

  const handleWordClick = useCallback(
    async (word: NonNullable<AyahWithRelations['words']>[number]) => {
      if (word.audioUrl) {
        wordAudioRef.current?.pause();
        const audio = new Audio(word.audioUrl);
        wordAudioRef.current = audio;
        setActiveWordAudio(word.position);
        audio.addEventListener('ended', () => setActiveWordAudio(null), { once: true });
        audio.addEventListener('error', () => setActiveWordAudio(null), { once: true });
        await audio.play().catch(() => setActiveWordAudio(null));
        return;
      }

      const wordCount = ayah.words?.length ?? 0;
      await handlePlay();
      window.setTimeout(() => {
        const el = document.querySelector('audio');
        if (el && el.duration > 0 && wordCount > 0) {
          el.currentTime = ((word.position - 1) / wordCount) * el.duration;
        }
      }, 250);
    },
    [ayah.words?.length, handlePlay]
  );

  const activeWordPosition =
    isCurrent && isPlaying && duration > 0 && ayah.words?.length
      ? Math.min(
          ayah.words.length,
          Math.max(1, Math.floor((currentTime / duration) * ayah.words.length) + 1)
        )
      : null;

  const fontSizeClass = { sm: 'text-xl', md: 'text-2xl', lg: 'text-3xl', xl: 'text-4xl' }[fontSize];

  return (
    <>
      <article
        id={`ayah-${ayah.id}`}
        data-ayah-id={ayah.id}
        data-surah={surahNumber}
        data-ayah-number={ayah.number}
        className={cn(
          'group relative py-7 transition-colors duration-200',
          isCurrent && 'ayah-current rounded-xl px-4 -mx-4'
        )}
      >
        {/* ── Top action row ─────────────────────────────────────────────── */}
        <div className="mb-5 flex items-center justify-between gap-2">
          {/* Left: verse ref + primary actions */}
          <div className="flex items-center gap-2">
            {/* Verse reference badge */}
            <span className="flex h-7 min-w-[2.5rem] items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs font-semibold tabular-nums text-[var(--muted)]">
              {surahNumber}:{ayah.number}
            </span>

            {/* Play button — always visible */}
            <button
              type="button"
              onClick={handlePlay}
              aria-label={isCurrent && isPlaying ? 'Pause verse' : `Play verse ${ayah.number}`}
              aria-pressed={isCurrent}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                isCurrent
                  ? 'bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)]/25'
                  : 'text-[var(--muted)] hover:bg-[var(--ayah-highlight)] hover:text-[var(--fg)]'
              )}
            >
              {isCurrent && isPlaying
                ? <Pause className="h-3.5 w-3.5" />
                : <Play className="h-3.5 w-3.5" />}
            </button>

            {/* Bookmark button — always visible */}
            <button
              type="button"
              onClick={handleBookmark}
              aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark verse'}
              aria-pressed={bookmarked}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                bookmarked
                  ? 'text-gold-500 hover:bg-gold-500/10'
                  : 'text-[var(--muted)] hover:bg-[var(--ayah-highlight)] hover:text-[var(--fg)]'
              )}
            >
              {bookmarked ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
            </button>

            {/* Playing animation */}
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

          {/* Right: secondary actions — hover reveal on desktop */}
          <div
            className="flex items-center gap-1 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100"
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
          </div>
        </div>

        {/* ── Arabic text ────────────────────────────────────────────────── */}
        {showWordByWord && ayah.words && ayah.words.length > 0 ? (
          <div className="flex flex-row-reverse flex-wrap justify-start gap-x-2 gap-y-3" dir="rtl">
            {ayah.words.map((word) => {
              const isActiveWord = activeWordAudio === word.position || activeWordPosition === word.position;
              return (
                <button
                  key={word.id}
                  type="button"
                  onClick={() => handleWordClick(word)}
                  className={cn(
                    'group/word flex min-h-[5rem] min-w-[4.25rem] flex-col items-center justify-center rounded-lg border border-transparent px-2 py-2 text-center transition-colors',
                    isActiveWord
                      ? 'border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]'
                      : 'hover:border-[var(--border)] hover:bg-[var(--ayah-highlight)]'
                  )}
                  aria-label={`Play from word ${word.position}`}
                >
                  <span className={cn('font-arabic leading-loose text-[var(--fg)]', fontSizeClass)}>
                    {word.textUthmani || word.textArabic}
                  </span>
                  {word.translation && (
                    <span className="mt-1 max-w-28 text-[11px] leading-snug text-[var(--muted)]" dir="ltr">
                      {word.translation}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <p
            className={cn('font-arabic ayah-arabic leading-loose text-[var(--fg)]', fontSizeClass)}
            lang="ar"
            dir="rtl"
          >
            {ayah.textUthmani}
          </p>
        )}

        {/* ── Translations ───────────────────────────────────────────────── */}
        {showTranslation && ayah.translations && ayah.translations.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4">
            {ayah.translations.map((t) => (
              <p key={t.translatorId} className="text-sm leading-relaxed text-[var(--muted)]">
                {t.text}
              </p>
            ))}
          </div>
        )}

        {/* ── Bottom row: always-visible secondary info ───────────────────── */}
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setTafsirOpen(true)}
            className="flex items-center gap-1.5 text-xs text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
          >
            <BookMarked className="h-3 w-3" />
            Tafsir
          </button>

          {/* Mobile: metadata shown inline here */}
          {(ayah.juz || ayah.page) && (
            <div className="ml-auto flex items-center gap-1.5 sm:hidden">
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
        </div>
      </article>

      <TafsirPanel
        open={tafsirOpen}
        onOpenChange={setTafsirOpen}
        ayahId={ayah.id}
        surahName={surahName || `Surah ${surahNumber}`}
        ayahNumber={ayah.number}
        ayahText={ayah.textUthmani}
        translations={ayah.translations}
      />
    </>
  );
}
