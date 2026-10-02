import { NAMAZ_CONTENT } from '@/lib/namaz/content';
import { buildLesson, getPrayer, getStepTemplate } from '@/lib/namaz/lesson';
import type { LessonStep, PrayerId } from '@/lib/namaz/types';

function phaseLabel(step: LessonStep, rakahs: number): string {
  if (step.phase === 'prepare') return 'Preparation';
  if (step.phase === 'final') return 'Final sitting';
  return `Rak’ah ${step.rakah} of ${rakahs}`;
}

/**
 * Server-rendered list of every step in the prayer. The interactive lesson
 * shows one step at a time after hydration; this keeps the whole sequence in
 * the initial HTML for readers without JavaScript and for crawlers.
 * English content only, taken verbatim from the lesson content file.
 */
export function NamazOutline({ prayerId }: { prayerId: PrayerId }) {
  const prayer = getPrayer(NAMAZ_CONTENT, prayerId);
  if (!prayer) return null;
  const steps = buildLesson(NAMAZ_CONTENT, prayerId);

  return (
    <details className="mt-6 rounded-2xl border border-line bg-surface p-4">
      <summary className="cursor-pointer text-sm font-bold text-ink">
        All {steps.length} steps of {prayer.name.en}
      </summary>
      <ol className="mt-3 list-decimal space-y-3 ps-5 text-sm">
        {steps.map((step) => {
          const template = getStepTemplate(NAMAZ_CONTENT, step.templateId);
          if (!template) return null;
          return (
            <li key={step.key} lang="en">
              <p className="font-semibold text-ink">
                {template.title.en}{' '}
                <span className="font-normal text-ink-muted">· {phaseLabel(step, prayer.rakahs)}</span>
              </p>
              <p className="text-ink-3">{template.action.en}</p>
              {step.contextNote && <p className="text-ink-3">{step.contextNote.en}</p>}
            </li>
          );
        })}
      </ol>
    </details>
  );
}
