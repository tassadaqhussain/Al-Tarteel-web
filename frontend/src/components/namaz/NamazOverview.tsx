'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { CameraOff, CheckCircle2, ChevronRight } from 'lucide-react';
import { NAMAZ_CONTENT } from '@/lib/namaz/content';
import { buildLesson, clampStepIndex, localize } from '@/lib/namaz/lesson';
import { namazT } from '@/lib/namaz/i18n';
import type { SchoolPreference } from '@/lib/namaz/types';
import { useNamazProgressStore } from '@/stores/namazProgressStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { LText, ReviewBadge, SourceList } from './NamazParts';

const content = NAMAZ_CONTENT;
const noopSubscribe = () => () => {};

export function NamazOverview() {
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const locale = useSettingsStore((s) => s.uiLocale);
  const byPrayer = useNamazProgressStore((s) => s.byPrayer);
  const lastPrayer = useNamazProgressStore((s) => s.lastPrayer);
  const school = useNamazProgressStore((s) => s.school);
  const setSchool = useNamazProgressStore((s) => s.setSchool);

  const resume = mounted && lastPrayer ? content.prayers.find((p) => p.id === lastPrayer) : undefined;
  const resumeProgress = resume ? byPrayer[resume.id] : undefined;
  const resumeTotal = resume ? buildLesson(content, resume.id).length : 0;
  const showResume = resume && resumeProgress && !resumeProgress.completedAt && resumeProgress.stepIndex > 0;

  return (
    <div className="mt-8 space-y-8">
      <p className="rounded-xl border border-warning/30 bg-warning-surface px-4 py-3 text-sm text-ink-2">
        {namazT(locale, 'reviewBanner')}
      </p>

      {showResume && (
        <section className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--ayah-highlight)] p-5">
          <p className="text-sm font-semibold text-[var(--accent)]">{localize(resume.name, locale).text}</p>
          <p className="mt-1 text-ink-2">
            {namazT(locale, 'resumeAt', {
              n: clampStepIndex(resumeProgress.stepIndex, resumeTotal) + 1,
              total: resumeTotal,
            })}
          </p>
          <Link
            href={`/learn-namaz/${resume.id}`}
            className="mt-3 inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-brand-contrast hover:opacity-90"
          >
            {namazT(locale, 'resume')}
          </Link>
        </section>
      )}

      <section aria-labelledby="namaz-prereq">
        <h2 id="namaz-prereq" className="text-xl font-bold text-ink">{namazT(locale, 'prerequisites')}</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {content.prerequisites.map((p) => (
            <li key={p.id} className="rounded-2xl border border-line bg-surface p-4">
              <div className="flex flex-wrap items-center gap-2">
                <LText as="h3" text={p.title} locale={locale} className="font-bold text-ink" />
                <ReviewBadge status={p.review} locale={locale} />
              </div>
              <LText text={p.body} locale={locale} className="mt-1 text-sm leading-relaxed text-ink-2" />
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                {p.learnMore && (
                  <Link href={p.learnMore.href} className="text-sm font-semibold text-[var(--accent)] hover:underline">
                    {namazT(locale, 'learnMore')}: {localize(p.learnMore.label, locale).text}
                  </Link>
                )}
              </div>
              <SourceList refs={p.sources} locale={locale} className="mt-2" />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="namaz-prayers">
        <h2 id="namaz-prayers" className="text-xl font-bold text-ink">{namazT(locale, 'choosePrayer')}</h2>
        <ul className="mt-3 space-y-3">
          {content.prayers.map((prayer) => {
            const progress = mounted ? byPrayer[prayer.id] : undefined;
            const total = buildLesson(content, prayer.id).length;
            const started = progress && progress.stepIndex > 0 && !progress.completedAt;
            return (
              <li key={prayer.id}>
                <Link
                  href={`/learn-namaz/${prayer.id}`}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-5 py-4 transition hover:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <h3 className="text-lg font-bold text-ink">{localize(prayer.name, locale).text}</h3>
                      <span lang="ar" dir="rtl" className="font-arabic text-lg text-ink-3">{prayer.arabicName}</span>
                      <span className="text-sm font-semibold text-[var(--accent)]">
                        {namazT(locale, 'rakahs', { n: prayer.rakahs })}
                      </span>
                    </div>
                    <LText text={prayer.note} locale={locale} className="mt-1 text-sm text-ink-3" />
                    <p className="mt-1 text-xs text-ink-muted">
                      {prayer.audibleRakahs.length
                        ? namazT(locale, 'audiblePrayer', { r: prayer.audibleRakahs.join(' & ') })
                        : namazT(locale, 'quietPrayer')}
                    </p>
                    {progress?.completedAt && (
                      <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                        {namazT(locale, 'complete')}
                      </p>
                    )}
                    {started && (
                      <p className="mt-1 text-xs font-semibold text-[var(--accent)]">
                        {namazT(locale, 'step', { n: clampStepIndex(progress.stepIndex, total) + 1, total })}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-ink-faint transition group-hover:text-[var(--accent)] rtl:rotate-180" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="namaz-rakah" className="rounded-2xl border border-line bg-surface p-5">
        <h2 id="namaz-rakah" className="text-xl font-bold text-ink">{namazT(locale, 'rakahGuide')}</h2>
        <p className="mt-2 text-ink-2">{namazT(locale, 'rakahGuideBody')}</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-line text-start text-xs uppercase tracking-wide text-ink-faint">
                <th scope="col" className="py-2 text-start font-semibold">{namazT(locale, 'choosePrayer')}</th>
                <th scope="col" className="py-2 text-start font-semibold">{namazT(locale, 'rakahCount')}</th>
                <th scope="col" className="py-2 text-start font-semibold">{namazT(locale, 'recitation')}</th>
              </tr>
            </thead>
            <tbody>
              {content.prayers.map((p) => (
                <tr key={p.id} className="border-b border-line-subtle last:border-0">
                  <th scope="row" className="py-2 text-start font-semibold text-ink">{localize(p.name, locale).text}</th>
                  <td className="py-2 text-ink-2">{p.rakahs}</td>
                  <td className="py-2 text-ink-3">
                    {p.audibleRakahs.length
                      ? namazT(locale, 'audiblePrayer', { r: p.audibleRakahs.join(' & ') })
                      : namazT(locale, 'quietPrayer')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-ink-3">{namazT(locale, 'otherPrayers')}</p>
      </section>

      <section aria-labelledby="namaz-school" className="rounded-2xl border border-line bg-surface p-5">
        <h2 id="namaz-school" className="text-xl font-bold text-ink">{namazT(locale, 'school')}</h2>
        <p className="mt-2 text-sm text-ink-3">{namazT(locale, 'schoolHint')}</p>
        <label className="mt-3 block max-w-sm text-sm">
          <span className="sr-only">{namazT(locale, 'school')}</span>
          <select
            value={mounted ? school : 'general'}
            onChange={(e) => setSchool(e.target.value as SchoolPreference)}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <option value="general">{namazT(locale, 'schoolGeneral')}</option>
            {content.schools.map((s) => (
              <option key={s.id} value={s.id}>
                {localize(s.name, locale).text}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="space-y-2 text-sm text-ink-3">
        <p>{namazT(locale, 'validity')}</p>
        <p className="inline-flex items-center gap-2">
          <CameraOff className="h-4 w-4 shrink-0" aria-hidden />
          {namazT(locale, 'noCamera')}
        </p>
        <p>{namazT(locale, 'savedOnDevice')}</p>
        <p className="text-xs text-ink-muted">{namazT(locale, 'contentVersion', { v: content.version })}</p>
      </section>
    </div>
  );
}
