'use client';

import { DailyMotivation } from '@/components/daily/DailyMotivation';
import { SITE_SHELL } from '@/components/layout/MainContainer';

/** Client wrapper so the homepage can stay a server component. */
export function DailyMotivationHome() {
  return (
    <div className={`${SITE_SHELL} py-6`}>
      <DailyMotivation variant="full" showAyahOfDay showTajweedOfDay={false} />
    </div>
  );
}
