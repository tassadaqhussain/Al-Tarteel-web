'use client';

import { DailyMotivation } from '@/components/daily/DailyMotivation';

/** Client wrapper so the homepage can stay a server component. */
export function DailyMotivationHome() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6">
      <DailyMotivation variant="full" showAyahOfDay showTajweedOfDay={false} />
    </div>
  );
}
