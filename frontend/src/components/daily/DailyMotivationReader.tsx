'use client';

import { DailyMotivation } from '@/components/daily/DailyMotivation';

/** Subtle goal strip for the mushaf — no clutter, no interruptions. */
export function DailyMotivationReader() {
  return <DailyMotivation variant="reader" showAyahOfDay={false} showTajweedOfDay={false} />;
}
