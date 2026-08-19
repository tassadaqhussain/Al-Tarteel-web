import { audioApi } from '@/lib/api';
import { useAudioStore } from '@/stores/audioStore';

/** Load word-level timing segments for a surah/reciter into the audio store. */
export async function loadWordTimings(surahNumber: number, reciterSlug: string) {
  const state = useAudioStore.getState();
  if (
    state.timingsSurahNumber === surahNumber &&
    state.timingsReciterSlug === reciterSlug &&
    state.wordTimingsByAyah
  ) {
    return;
  }
  try {
    const data = await audioApi.wordTimings(surahNumber, reciterSlug);
    const ayahs: Record<number, Array<{ position: number; startMs: number; endMs: number }>> = {};
    for (const [key, value] of Object.entries(data.ayahs || {})) {
      ayahs[Number(key)] = (value as Array<{ position: number; startMs: number; endMs: number }>) || [];
    }
    useAudioStore.getState().setWordTimings(surahNumber, reciterSlug, data.available ? ayahs : null);
  } catch {
    useAudioStore.getState().setWordTimings(surahNumber, reciterSlug, null);
  }
}
