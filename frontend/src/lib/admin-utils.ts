export const FEEDBACK_CATEGORIES = ['bug', 'idea', 'hifz', 'translation', 'other'] as const;

export const MOTIVATION_CATEGORIES = [
  'READING',
  'TAJWEED',
  'LISTENING',
  'REFLECTION',
  'CONSISTENCY',
  'LEARNING',
  'RETURNING_USER',
  'PROGRESS',
] as const;

export function formatAdminDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatAdminNumber(value: number) {
  return new Intl.NumberFormat(undefined).format(value);
}

export const EMPTY_MOTIVATION_FORM = {
  message: '',
  category: 'READING' as string,
  language: 'en',
  status: 'approved' as 'draft' | 'approved',
  isActive: true,
};
