'use client';

import { namazT } from '@/lib/namaz/i18n';
import type { LoadedPassage } from '@/lib/namaz/quran-passage';
import type { Dhikr, LocalizedText } from '@/lib/namaz/types';
import type { LessonSegment } from '@/lib/namaz/audio-controller';
import type { UiLocale } from '@/stores/settingsStore';
import { AudioControls, LText, ReviewBadge, SourceList } from './NamazParts';

export type PassageState =
  | { status: 'loading' }
  | { status: 'error'; offline: boolean }
  | { status: 'ready'; data: LoadedPassage };

export type ResolvedRecitation =
  | { key: string; kind: 'dhikr'; optional: boolean; dhikr: Dhikr }
  | {
      key: string;
      kind: 'quran';
      optional: boolean;
      label: LocalizedText;
      surah: number;
      fromAyah: number;
      toAyah: number;
    };

export function recitationSegments(item: ResolvedRecitation, passage?: PassageState): LessonSegment[] {
  if (item.kind === 'dhikr') {
    return item.dhikr.audio ? [{ kind: 'audio', url: item.dhikr.audio.url }] : [];
  }
  if (passage?.status !== 'ready') return [];
  return passage.data.ayahs
    .filter((a) => a.audioUrl)
    .map((a) => ({ kind: 'audio' as const, url: a.audioUrl! }));
}

type Props = {
  item: ResolvedRecitation;
  passage?: PassageState;
  onRetry: () => void;
  locale: UiLocale;
  slow: boolean;
  trackId: string;
};

export function RecitationCard({ item, passage, onRetry, locale, slow, trackId }: Props) {
  const label = item.kind === 'dhikr' ? item.dhikr.label : item.label;
  const segments = recitationSegments(item, passage);
  const labelText = label[locale] ?? label.en;

  return (
    <article className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <header className="flex flex-wrap items-center gap-2">
        <LText as="h3" text={label} locale={locale} className="text-base font-bold text-ink" />
        {item.optional && (
          <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[11px] font-semibold text-ink-3">
            {namazT(locale, 'optional')}
          </span>
        )}
        {item.kind === 'dhikr' && item.dhikr.repeat && (
          <span className="rounded-full bg-[var(--ayah-highlight)] px-2 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
            {namazT(locale, 'repeatTimes', { n: item.dhikr.repeat.count })}
          </span>
        )}
        {item.kind === 'dhikr' && <ReviewBadge status={item.dhikr.review} locale={locale} />}
      </header>

      {item.kind === 'dhikr' ? (
        <DhikrBody dhikr={item.dhikr} locale={locale} />
      ) : (
        <QuranBody passage={passage} onRetry={onRetry} locale={locale} />
      )}

      <div className="mt-4">
        {segments.length > 0 ? (
          <AudioControls
            trackId={trackId}
            segments={segments}
            slow={slow}
            locale={locale}
            label={`${namazT(locale, 'recitation')}: ${labelText}`}
            size="sm"
          />
        ) : item.kind === 'dhikr' || passage?.status === 'ready' ? (
          <p className="text-xs text-ink-muted">{namazT(locale, 'noRecording')}</p>
        ) : null}
      </div>

      {item.kind === 'dhikr' && <SourceList refs={item.dhikr.sources} locale={locale} className="mt-3" />}
      {item.kind === 'quran' && passage?.status === 'ready' && (
        <p className="mt-3 text-xs text-ink-muted">
          <span dir="ltr">
            {namazT(locale, 'sources')}: Quran {item.surah}:{item.fromAyah}
            {item.toAyah !== item.fromAyah ? `–${item.toAyah}` : ''}
          </span>
          {' · '}
          {namazT(locale, 'quranSource')}
          {passage.data.translatorName && <> · {namazT(locale, 'translationBy', { name: passage.data.translatorName })}</>}
          {passage.data.reciterName && <> · {namazT(locale, 'reciter', { name: passage.data.reciterName })}</>}
        </p>
      )}
    </article>
  );
}

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

function DhikrBody({ dhikr, locale }: { dhikr: Dhikr; locale: UiLocale }) {
  return (
    <>
      <p lang="ar" dir="rtl" className="font-arabic mt-3 text-right text-2xl leading-loose text-ink sm:text-3xl">
        {dhikr.arabic}
      </p>
      <Labelled label={namazT(locale, 'transliteration')}>
        <p lang="ar-Latn" dir="ltr" className="italic text-ink-2">{dhikr.transliteration}</p>
      </Labelled>
      <Labelled label={namazT(locale, 'translation')}>
        <LText text={dhikr.translation} locale={locale} className="text-ink-2" />
        {!dhikr.translation[locale] && locale !== 'en' && (
          <p className="mt-1 text-xs text-ink-muted">{namazT(locale, 'englishOnly')}</p>
        )}
      </Labelled>
      {dhikr.repeat && <LText text={dhikr.repeat.note} locale={locale} className="mt-2 text-xs text-ink-muted" />}
    </>
  );
}

function QuranBody({ passage, onRetry, locale }: { passage?: PassageState; onRetry: () => void; locale: UiLocale }) {
  if (!passage || passage.status === 'loading') {
    return (
      <div className="mt-3 space-y-2" aria-busy="true">
        <span className="sr-only">{namazT(locale, 'loading')}</span>
        <div className="ms-auto h-8 w-3/4 animate-pulse rounded bg-surface-3" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-surface-3" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-surface-3" />
      </div>
    );
  }
  if (passage.status === 'error') {
    return (
      <div role="alert" className="mt-3 rounded-xl bg-danger-surface px-4 py-3 text-sm text-danger">
        <p>
          {namazT(locale, 'quranLoadError')} {passage.offline && namazT(locale, 'offline')}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-full border border-danger/40 px-3 py-1 text-xs font-semibold hover:bg-surface"
        >
          {namazT(locale, 'retry')}
        </button>
      </div>
    );
  }
  const { ayahs, translationIsFallback } = passage.data;
  return (
    <ol className="mt-3 space-y-4">
      {ayahs.map((a) => (
        <li key={a.number} className="border-b border-line-subtle pb-3 last:border-0 last:pb-0">
          <p lang="ar" dir="rtl" className="font-arabic text-right text-2xl leading-loose text-ink sm:text-3xl">
            {a.arabic}
            <span className="ms-2 align-middle text-sm text-ink-faint">﴿{a.number.toLocaleString('ar-EG')}﴾</span>
          </p>
          {a.transliteration && (
            <p lang="ar-Latn" dir="ltr" className="mt-2 text-sm italic text-ink-2">{a.transliteration}</p>
          )}
          {a.translation && (
            <p dir="auto" className="mt-1 text-sm text-ink-2">
              {a.translation}
            </p>
          )}
        </li>
      ))}
      {translationIsFallback && <p className="text-xs text-ink-muted">{namazT(locale, 'englishOnly')}</p>}
    </ol>
  );
}
