'use client';

import Link from 'next/link';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { getAyahPath } from '@/lib/surah-meta';
import { NAMAZ_CONTENT } from '@/lib/namaz/content';
import { localize, sourceUrl } from '@/lib/namaz/lesson';
import { namazT } from '@/lib/namaz/i18n';
import type { LocalizedText, ReviewStatus, SourceRef } from '@/lib/namaz/types';
import { lessonAudio, useLessonAudioState, type LessonSegment } from '@/lib/namaz/audio-controller';
import { useSettingsStore, type UiLocale } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';

/** Localised text with correct lang/dir, even when it falls back to English. */
export function LText({
  text,
  locale,
  as: Tag = 'p',
  className,
}: {
  text: LocalizedText;
  locale: UiLocale;
  as?: 'p' | 'span' | 'h2' | 'h3' | 'li';
  className?: string;
}) {
  const value = localize(text, locale);
  const rtl = value.lang === 'ar' || value.lang === 'ur' || value.lang === 'fa' || value.lang === 'ps';
  return (
    <Tag lang={value.lang} dir={rtl ? 'rtl' : 'ltr'} className={className}>
      {value.text}
    </Tag>
  );
}

export function ReviewBadge({ status, locale }: { status: ReviewStatus; locale: UiLocale }) {
  if (status === 'reviewed') return null;
  return (
    <span className="inline-flex items-center rounded-full bg-warning-surface px-2 py-0.5 text-[11px] font-semibold text-warning">
      {namazT(locale, 'reviewNotice')}
    </span>
  );
}

export function SourceList({ refs, locale, className }: { refs: SourceRef[]; locale: UiLocale; className?: string }) {
  if (!refs.length) return null;
  return (
    <p className={cn('text-xs text-ink-muted', className)}>
      <span className="font-semibold text-ink-3">{namazT(locale, 'sources')}: </span>
      {refs.map((ref, i) => {
        const source = NAMAZ_CONTENT.sources.find((s) => s.id === ref.sourceId);
        const label = `${source?.title ?? ref.sourceId} ${ref.locator}`;
        let href: string | null = null;
        let external = false;
        if (source?.kind === 'quran') {
          const [s, a] = ref.locator.split(':').map(Number);
          if (s && a) href = getAyahPath(s, a);
        } else {
          href = sourceUrl(NAMAZ_CONTENT, ref.sourceId, ref.locator);
          external = Boolean(href);
        }
        return (
          <span key={`${ref.sourceId}-${ref.locator}-${i}`} dir="ltr">
            {i > 0 && ' · '}
            {href ? (
              external ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-[var(--accent)]">
                  {label}
                </a>
              ) : (
                <Link href={href} className="underline decoration-dotted underline-offset-2 hover:text-[var(--accent)]">
                  {label}
                </Link>
              )
            ) : (
              label
            )}
          </span>
        );
      })}
    </p>
  );
}

type AudioControlsProps = {
  trackId: string;
  segments: LessonSegment[];
  slow: boolean;
  locale: UiLocale;
  /** Accessible name for what is being played, e.g. "Spoken guidance". */
  label: string;
  onEnded?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
};

/** Play / pause / replay for one track; only one track plays at a time. */
export function AudioControls({ trackId, segments, slow, locale, label, onEnded, disabled, size = 'md' }: AudioControlsProps) {
  const state = useLessonAudioState();
  const active = state.trackId === trackId;
  const playing = active && state.status === 'playing';
  const paused = active && state.status === 'paused';

  // Read the live controller state: a render can lag behind a fast second tap.
  const toggle = () => {
    const audio = lessonAudio();
    const live = audio.getState();
    if (live.trackId === trackId && live.status === 'playing') audio.pause();
    else if (live.trackId === trackId && live.status === 'paused') audio.resume();
    else audio.play(trackId, segments, { slow, onEnded });
  };
  const replay = () => lessonAudio().play(trackId, segments, { slow, onEnded });

  const btn =
    size === 'sm'
      ? 'h-9 px-3 text-xs'
      : 'h-10 px-4 text-sm';

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-pressed={playing}
        data-track={trackId}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] font-semibold text-brand-contrast transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50',
          btn,
        )}
      >
        {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
        <span>
          {playing ? namazT(locale, 'pause') : paused ? namazT(locale, 'resumeAudio') : namazT(locale, 'play')}
          <span className="sr-only"> — {label}</span>
        </span>
      </button>
      <button
        type="button"
        onClick={replay}
        disabled={disabled}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border border-line bg-surface font-semibold text-ink-2 transition hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50',
          btn,
        )}
      >
        <RotateCcw className="h-4 w-4" aria-hidden />
        <span>
          {namazT(locale, 'replay')}
          <span className="sr-only"> — {label}</span>
        </span>
      </button>
      {active && state.status === 'error' && (
        <p role="alert" className="w-full text-sm text-danger">
          {state.error === 'offline' ? namazT(locale, 'offline') : namazT(locale, 'audioError')}
        </p>
      )}
      {active && state.noVoice && (
        <p role="status" className="w-full text-sm text-warning">
          {namazT(locale, 'noVoice')}
        </p>
      )}
    </div>
  );
}

/** Localised page heading shared by the overview and lesson pages. */
export function NamazHeading({ prayerId }: { prayerId?: string }) {
  const locale = useSettingsStore((s) => s.uiLocale);
  const prayer = prayerId ? NAMAZ_CONTENT.prayers.find((p) => p.id === prayerId) : undefined;
  return (
    <header>
      {prayer ? (
        <Link href="/learn-namaz" className="text-sm font-semibold text-[var(--accent)] hover:underline">
          <span aria-hidden className="inline-block rtl:rotate-180">←</span> {namazT(locale, 'allPrayers')}
        </Link>
      ) : (
        <p className="text-sm font-semibold text-[var(--accent)]">{namazT(locale, 'title')}</p>
      )}
      <h1 className="mt-2 font-serif text-3xl font-bold text-ink sm:text-4xl">
        {prayer ? (
          <>
            {localize(prayer.name, locale).text}{' '}
            <span lang="ar" dir="rtl" className="font-arabic text-2xl font-normal text-ink-3 sm:text-3xl">
              {prayer.arabicName}
            </span>
          </>
        ) : (
          namazT(locale, 'title')
        )}
      </h1>
      <p className="mt-2 text-ink-3 leading-relaxed">
        {prayer ? `${namazT(locale, 'rakahs', { n: prayer.rakahs })} · ${localize(prayer.note, locale).text}` : namazT(locale, 'subtitle')}
      </p>
    </header>
  );
}
