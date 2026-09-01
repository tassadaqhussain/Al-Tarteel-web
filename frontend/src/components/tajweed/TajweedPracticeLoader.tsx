'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { quranApi } from '@/lib/api';
import { TajweedPracticePanel } from './TajweedPracticePanel';
import type { TajweedRuleId } from '@/lib/tajweed/rules';

interface ExampleRef {
  surah: number;
  ayah: number;
  note?: string;
}

interface LoadedExample {
  surah: number;
  ayah: number;
  textUthmani: string;
  textTajweed?: string | null;
  note?: string;
}

interface Props {
  exampleRefs: ExampleRef[];
  lessonSlug: string;
  relatedRuleIds: TajweedRuleId[];
  onPracticed?: () => void;
}

export function TajweedPracticeLoader({ exampleRefs, lessonSlug, relatedRuleIds, onPracticed }: Props) {
  const [examples, setExamples] = useState<LoadedExample[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all(
      exampleRefs.map((ref) =>
        quranApi
          .ayah(ref.surah, ref.ayah)
          .then((a) => ({
            surah: ref.surah,
            ayah: ref.ayah,
            textUthmani: a.textUthmani,
            textTajweed: a.textTajweed ?? null,
            note: ref.note,
          })),
      ),
    )
      .then((loaded) => { if (!cancelled) setExamples(loaded); })
      .catch(() => { if (!cancelled) setError('Could not load ayah text — is the API running?'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [exampleRefs]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-ink-3">
        <RefreshCw className="h-4 w-4 animate-spin" />
        Loading practice ayahs…
      </div>
    );
  }

  if (error || !examples) {
    return (
      <p className="rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-ink-3">
        {error ?? 'Could not load examples.'}
      </p>
    );
  }

  return (
    <TajweedPracticePanel
      exampleRefs={examples}
      lessonSlug={lessonSlug}
      relatedRuleIds={relatedRuleIds}
      onPracticed={onPracticed}
    />
  );
}
