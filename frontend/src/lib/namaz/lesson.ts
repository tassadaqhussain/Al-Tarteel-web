/**
 * Pure helpers that turn Learn Namaz content into a concrete lesson.
 * No runtime imports: content is passed in, so these run in Node tests and
 * reviewed content can be swapped without changing the builder.
 */
import type { UiLocale } from '@/stores/settingsStore';
import type {
  LessonStep,
  LocalizedText,
  NamazContent,
  Prayer,
  PrayerId,
  SchoolPreference,
  StepTemplate,
  Variation,
} from './types';

export const PRAYER_IDS: PrayerId[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function isPrayerId(value: string): value is PrayerId {
  return (PRAYER_IDS as string[]).includes(value);
}

export function getPrayer(content: NamazContent, id: string): Prayer | undefined {
  return content.prayers.find((p) => p.id === id);
}

export function getStepTemplate(content: NamazContent, id: string): StepTemplate | undefined {
  return content.steps.find((s) => s.id === id);
}

function ordinal(n: number): string {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

const FATIHA_ONLY_NOTE = (rakah: number): LocalizedText => ({
  en: `In the ${ordinal(rakah)} rak’ah of an obligatory prayer, recite Al-Fatihah only; no extra surah is added.`,
});

/**
 * Build the ordered step list for an obligatory prayer:
 * preparation → each rak'ah → middle sitting (after the 2nd, when the prayer
 * has more than two) → final sitting → salam.
 */
export function buildLesson(content: NamazContent, prayerId: PrayerId): LessonStep[] {
  const prayer = getPrayer(content, prayerId);
  if (!prayer) return [];
  const steps: LessonStep[] = [];
  const push = (templateId: string, phase: LessonStep['phase'], rakah: number | null, contextNote?: LocalizedText) => {
    steps.push({ key: `${rakah ?? 'p'}-${templateId}-${steps.length}`, templateId, phase, rakah, contextNote });
  };

  push('intention', 'prepare', null);
  push('face-qibla', 'prepare', null);

  for (let rakah = 1; rakah <= prayer.rakahs; rakah++) {
    const isLast = rakah === prayer.rakahs;
    if (rakah === 1) {
      push('opening-takbir', 'rakah', 1);
      push('place-hands', 'rakah', 1);
      push('taawwudh', 'rakah', 1);
    }
    push(
      'fatiha',
      'rakah',
      rakah,
      rakah > 2 ? FATIHA_ONLY_NOTE(rakah) : undefined,
    );
    if (rakah <= 2) push('short-surah', 'rakah', rakah);
    push('ruku', 'rakah', rakah);
    push('rise-from-ruku', 'rakah', rakah);
    push('sujud-1', 'rakah', rakah);
    push('sit-between', 'rakah', rakah);
    push('sujud-2', 'rakah', rakah);

    if (isLast) break;
    if (rakah === 2) {
      push('first-tashahhud', 'rakah', rakah, {
        en: `This ${prayer.rakahs}-rak’ah prayer has a middle sitting after the 2nd rak’ah. After the tashahhud, stand for the 3rd rak’ah.`,
      });
    } else {
      push('stand-up', 'rakah', rakah);
    }
  }

  push('final-tashahhud', 'final', prayer.rakahs);
  push('salawat', 'final', prayer.rakahs);
  push('dua-before-salam', 'final', prayer.rakahs);
  push('salam-right', 'final', prayer.rakahs);
  push('salam-left', 'final', prayer.rakahs);
  return steps;
}

/** Plain-language outline of how the prayer's rak'ahs are structured. */
export function rakahOutline(prayer: Prayer): LocalizedText[] {
  const lines: LocalizedText[] = [];
  for (let r = 1; r <= prayer.rakahs; r++) {
    const parts = [r <= 2 ? 'Al-Fatihah + a short surah' : 'Al-Fatihah only', 'ruku’', 'two prostrations'];
    if (r === 2 && prayer.rakahs > 2) parts.push('middle sitting (tashahhud)');
    if (r === prayer.rakahs) parts.push('final sitting and salam');
    lines.push({ en: `Rak’ah ${r}: ${parts.join(' → ')}` });
  }
  return lines;
}

/** Clamp a saved step index to a lesson (e.g. after content changes). */
export function clampStepIndex(index: number | undefined, length: number): number {
  if (!length) return 0;
  if (typeof index !== 'number' || !Number.isFinite(index)) return 0;
  return Math.min(Math.max(0, Math.floor(index)), length - 1);
}

export type Localized = { text: string; lang: UiLocale; isFallback: boolean };

/** Pick the learner's language, falling back to English (and saying so). */
export function localize(text: LocalizedText, locale: UiLocale): Localized {
  const value = text[locale];
  if (value) return { text: value, lang: locale, isFallback: false };
  return { text: text.en, lang: 'en', isFallback: locale !== 'en' };
}

/**
 * Variation notes for the learner's chosen school. `general` shows every
 * note so no single school's practice is presented as universal.
 */
export function variationsFor(template: StepTemplate, school: SchoolPreference): Variation[] {
  if (school === 'general') return template.variations;
  return template.variations.filter((v) => v.schools.length === 0 || v.schools.includes(school));
}

export function sourceUrl(content: NamazContent, sourceId: string, locator: string): string | null {
  const source = content.sources.find((s) => s.id === sourceId);
  if (!source?.url) return null;
  return source.url.replace('{ref}', encodeURIComponent(locator));
}

/** Everything in the lesson that is not yet marked reviewed. */
export function pendingReviewCount(content: NamazContent): number {
  return (
    content.dhikr.filter((d) => d.review !== 'reviewed').length +
    content.steps.filter((s) => s.review !== 'reviewed').length +
    content.steps.flatMap((s) => s.variations).filter((v) => v.review !== 'reviewed').length +
    content.prerequisites.filter((p) => p.review !== 'reviewed').length
  );
}
