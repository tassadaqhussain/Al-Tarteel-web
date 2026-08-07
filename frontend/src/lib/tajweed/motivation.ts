/**
 * Centralized, reviewable Tajweed motivation copy.
 * Neutral educational encouragement only — never presented as Quran or Hadith.
 */

import type { TajweedLessonSlug } from './rules';
import { TAJWEED_LESSONS, getTajweedLesson } from './rules';

export type TajweedMastery = 'not_started' | 'learning' | 'practicing' | 'reviewed';

export type MotivationState =
  | 'lesson_intro'
  | 'lesson_started'
  | 'quarter_complete'
  | 'half_complete'
  | 'almost_complete'
  | 'lesson_completed'
  | 'rule_reviewed'
  | 'returning_user'
  | 'first_lesson'
  | 'welcome_back_inactive'
  | 'weekly_progress'
  | 'daily_continue';

export type LessonMotivation = {
  whyItMatters: string;
  objective: string;
  encourage: string;
  completion: string;
  checkpoints: {
    quarter: string;
    half: string;
    almost: string;
  };
};

/** Unique reviewed motivation per lesson rule. */
export const LESSON_MOTIVATION: Record<TajweedLessonSlug, LessonMotivation> = {
  ghunnah: {
    whyItMatters:
      'Recognizing ghunnah helps you hear where nasalization belongs, so your listening stays careful and unhurried.',
    objective:
      'Learn how nasalization is pronounced and recognize its verified colour marks in the mushaf.',
    encourage:
      'Listen closely to the sound and give yourself time to recognize it naturally.',
    completion:
      'Great progress. You have completed the Ghunnah lesson. Review its examples again whenever you want to strengthen your recognition.',
    checkpoints: {
      quarter: 'Good start — keep listening carefully.',
      half: 'Halfway through. Try noticing the nasal quality before moving on.',
      almost: 'Almost there. Revisit any example that still feels unclear.',
    },
  },
  ikhfa: {
    whyItMatters:
      'Ikhfāʾ is about a gentle transition. Understanding it prevents forcing a clear nūn where concealment is intended.',
    objective:
      'Understand the rule, listen through verified examples, and practice recognition in the reader.',
    encourage:
      'Focus on recognizing the transition first. Accuracy develops through careful repetition.',
    completion:
      'You finished the Ikhfāʾ lesson. Consistency matters more than speed — return to the examples when you wish.',
    checkpoints: {
      quarter: 'Good start — keep listening carefully.',
      half: 'Halfway through. Try identifying the transition before revealing the next section.',
      almost: 'Almost there. Review any example that still feels unclear.',
    },
  },
  idgham: {
    whyItMatters:
      'Idghām teaches how letters connect. Noticing the merge improves both listening awareness and calm practice.',
    objective:
      'Learn when assimilation occurs and recognize the related colour marks with and without ghunnah.',
    encourage:
      'Notice how the sounds connect. Listening before repeating can make the rule easier to understand.',
    completion:
      'Idghām lesson complete. Listening again later can reinforce how the sounds join.',
    checkpoints: {
      quarter: 'Good start — keep listening carefully.',
      half: 'Halfway through. Compare the forms that include ghunnah with those that do not.',
      almost: 'Almost there. Sit with one clear example before finishing.',
    },
  },
  iqlab: {
    whyItMatters:
      'Iqlāb has a clear pattern. Learning that pattern once makes future examples easier to spot.',
    objective:
      'Learn the iqlāb pattern, open verified mushaf examples, and practice recognizing the mark slowly.',
    encourage:
      'Learn the pattern, listen to verified examples, and practice them slowly.',
    completion:
      'Well done completing Iqlāb. Returning to a few examples later will keep the pattern familiar.',
    checkpoints: {
      quarter: 'Good start — take the explanation one step at a time.',
      half: 'Halfway through. Look for the pattern before moving ahead.',
      almost: 'Almost there. One more careful review of the examples will help.',
    },
  },
  qalqalah: {
    whyItMatters:
      'Qalqalah is a small sound quality that becomes clearer when you slow down and listen for the bounce.',
    objective:
      'Notice the quality of qalqalah letters and find their verified highlights while reading.',
    encourage:
      'Pay attention to the quality of the sound. Small pronunciation details become clearer with focused listening.',
    completion:
      'Qalqalah lesson complete. Brief, focused listening is often enough to refresh this rule.',
    checkpoints: {
      quarter: 'Good start — keep your attention on the sound quality.',
      half: 'Halfway through. Compare a stopped pronunciation with a continuing one when you can.',
      almost: 'Almost there. Rest on one example that shows the bounce clearly.',
    },
  },
  madd: {
    whyItMatters:
      'Madd is about measured elongation. Patient listening helps you feel timing without rushing.',
    objective:
      'Understand the main madd lengths marked in the tajweed colouring and practice noticing them while listening.',
    encourage:
      'Take your time with elongation. Listen to the recitation and learn the timing through repeated examples.',
    completion:
      'Madd lesson complete. Consistency matters more than speed — revisit examples whenever you need.',
    checkpoints: {
      quarter: 'Good start — listen without rushing the length.',
      half: 'Halfway through. Try sensing longer and shorter elongations in the marks.',
      almost: 'Almost there. One calm review of the colour tiers will help them settle.',
    },
  },
};

export const GENERIC_MOTIVATION = {
  returning_user: 'Welcome back. Continue your Tajweed practice from where you stopped.',
  first_lesson:
    'Your first Tajweed lesson is complete. Keep building gradually — one rule at a time.',
  welcome_back_inactive: 'Welcome back. Continue whenever you are ready.',
  daily_continue: 'Continue when you have a few quiet minutes. There is no rush.',
  weekly_progress: 'Steady review builds familiarity. Choose one rule and listen carefully.',
  several_reviewed: (count: number) =>
    `You've reviewed ${count} Tajweed rules. Revisiting examples can help reinforce what you've learned.`,
  default_encourage: 'One rule at a time. Listen carefully, practice slowly, and focus on consistency.',
} as const;

export const MASTERY_LABELS: Record<TajweedMastery, string> = {
  not_started: 'Not Started',
  learning: 'Learning',
  practicing: 'Practicing',
  reviewed: 'Reviewed',
};

export type MotivationContext = {
  state: MotivationState;
  rule?: TajweedLessonSlug;
  reviewedCount?: number;
};

export function getMotivation(ctx: MotivationContext): string {
  const lesson = ctx.rule ? LESSON_MOTIVATION[ctx.rule] : undefined;

  switch (ctx.state) {
    case 'lesson_intro':
    case 'lesson_started':
      return lesson?.encourage ?? GENERIC_MOTIVATION.default_encourage;
    case 'quarter_complete':
      return lesson?.checkpoints.quarter ?? 'Good start — keep listening carefully.';
    case 'half_complete':
      return lesson?.checkpoints.half ?? 'Halfway through. Continue at a steady pace.';
    case 'almost_complete':
      return lesson?.checkpoints.almost ?? 'Almost there. Review anything that still feels unclear.';
    case 'lesson_completed':
      return lesson?.completion ?? 'Lesson complete. Review again whenever you need.';
    case 'rule_reviewed':
      return lesson?.completion ?? 'This rule is marked Reviewed. Return to examples anytime.';
    case 'returning_user':
      return GENERIC_MOTIVATION.returning_user;
    case 'first_lesson':
      return GENERIC_MOTIVATION.first_lesson;
    case 'welcome_back_inactive':
      return GENERIC_MOTIVATION.welcome_back_inactive;
    case 'daily_continue':
      return GENERIC_MOTIVATION.daily_continue;
    case 'weekly_progress':
      if ((ctx.reviewedCount ?? 0) >= 4) {
        return GENERIC_MOTIVATION.several_reviewed(ctx.reviewedCount!);
      }
      return GENERIC_MOTIVATION.weekly_progress;
    default:
      return GENERIC_MOTIVATION.default_encourage;
  }
}

export function getNextLessonSlug(slug: TajweedLessonSlug): TajweedLessonSlug | null {
  const idx = TAJWEED_LESSONS.findIndex((l) => l.slug === slug);
  if (idx < 0) return null;
  return TAJWEED_LESSONS[idx + 1]?.slug ?? TAJWEED_LESSONS.find((l) => l.slug !== slug)?.slug ?? null;
}

export function getLessonMotivation(slug: TajweedLessonSlug): LessonMotivation {
  return LESSON_MOTIVATION[slug];
}

export function suggestContinueSlug(
  mastery: Partial<Record<TajweedLessonSlug, TajweedMastery>>,
): TajweedLessonSlug {
  const practicing = TAJWEED_LESSONS.find((l) => mastery[l.slug] === 'practicing');
  if (practicing) return practicing.slug;
  const learning = TAJWEED_LESSONS.find((l) => mastery[l.slug] === 'learning');
  if (learning) return learning.slug;
  const notStarted = TAJWEED_LESSONS.find((l) => !mastery[l.slug] || mastery[l.slug] === 'not_started');
  if (notStarted) return notStarted.slug;
  return TAJWEED_LESSONS[0].slug;
}

export function masteryFromProgress(percent: number, reviewed: boolean): TajweedMastery {
  if (reviewed || percent >= 100) return 'reviewed';
  if (percent >= 70) return 'practicing';
  if (percent > 0) return 'learning';
  return 'not_started';
}

export function dayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/** Count consecutive calendar days ending today or yesterday (no guilt messaging). */
export function computeConsistencyDays(activeDays: string[], today = dayKey()): number {
  if (!activeDays.length) return 0;
  const set = new Set(activeDays);
  let cursor = today;
  if (!set.has(cursor)) {
    const y = new Date(`${today}T12:00:00Z`);
    y.setUTCDate(y.getUTCDate() - 1);
    cursor = dayKey(y);
    if (!set.has(cursor)) return 0;
  }
  let count = 0;
  while (set.has(cursor)) {
    count += 1;
    const d = new Date(`${cursor}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    cursor = dayKey(d);
  }
  return count;
}

export function lessonEstimateLabel(slug: TajweedLessonSlug): string | null {
  const lesson = getTajweedLesson(slug);
  if (!lesson) return null;
  // Rough, transparent estimate based on content size — not a precise timer.
  const blocks = 3 + lesson.exampleRefs.length + Math.ceil(lesson.summary.length / 400);
  if (blocks <= 4) return 'About 5 minutes';
  if (blocks <= 6) return 'About 8 minutes';
  return 'About 10 minutes';
}
