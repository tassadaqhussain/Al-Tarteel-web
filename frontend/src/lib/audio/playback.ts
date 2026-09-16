import { unavailableReciterReason } from '@/lib/audio/availability';
import { audioApi } from '@/lib/api';
import { loadWordTimings } from '@/lib/loadWordTimings';
import { useAudioStore, type AudioAyahRef } from '@/stores/audioStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { translationVerseUrl, translationGranularity } from '@/lib/audio/translation-reciters';
import { isRukuEnd } from '@/lib/audio/ruku-map';

let playbackRequest = 0;

function toTracks(
  list: Awaited<ReturnType<typeof audioApi.surah>>,
  reciterSlug: string,
  trackKind: AudioAyahRef['trackKind'],
): AudioAyahRef[] {
  return list
    .filter((item) => item.url)
    .map((item) => ({
      ayahId: item.ayahId,
      surahNumber: item.surahNumber,
      ayahNumber: item.ayahNumber,
      url: item.url!,
      duration: item.duration ?? undefined,
      reciterSlug,
      trackKind,
    }));
}

function interleaveArabicAndTranslation(
  arabic: AudioAyahRef[],
  translation: AudioAyahRef[],
): AudioAyahRef[] {
  const byAyah = new Map(translation.map((item) => [item.ayahNumber, item]));
  const out: AudioAyahRef[] = [];
  for (const verse of arabic) {
    out.push(verse);
    const spoken = byAyah.get(verse.ayahNumber);
    if (spoken) out.push(spoken);
  }
  return out;
}

async function buildVersePlaylist(
  surahNumber: number,
  arabicSlug: string,
  translationSlug?: string | null,
): Promise<AudioAyahRef[]> {
  const arabicList = await audioApi.surah(surahNumber, arabicSlug);
  const arabic = toTracks(arabicList, arabicSlug, 'arabic');
  if (!translationSlug || translationSlug === arabicSlug) return arabic;

  // Ruku-granular translations publish one file per section, so emitting it for
  // every verse would replay the same audio after each ayah. Attach it to the
  // last verse of each ruku instead: recite the section, then hear its meaning.
  const perRuku = translationGranularity(translationSlug) === 'ruku';

  const fromCdn: AudioAyahRef[] = [];
  for (const verse of arabic) {
    if (perRuku && !isRukuEnd(verse.surahNumber, verse.ayahNumber)) continue;
    const url = translationVerseUrl(translationSlug, verse.surahNumber, verse.ayahNumber);
    if (!url) continue;
    fromCdn.push({
      ayahId: verse.ayahId,
      surahNumber: verse.surahNumber,
      ayahNumber: verse.ayahNumber,
      url,
      reciterSlug: translationSlug,
      trackKind: 'translation',
    });
  }

  if (fromCdn.length > 0) return interleaveArabicAndTranslation(arabic, fromCdn);

  try {
    const spokenList = await audioApi.surah(surahNumber, translationSlug);
    const spoken = toTracks(spokenList, translationSlug, 'translation');
    if (spoken.length === 0) return arabic;
    return interleaveArabicAndTranslation(arabic, spoken);
  } catch {
    return arabic;
  }
}

/** Bismillah is a separate opening, never an extra numbered ayah. */
export async function buildSurahPlaylist(
  surahNumber: number,
  arabicSlug: string,
  translationSlug?: string | null,
): Promise<AudioAyahRef[]> {
  const unavailable = unavailableReciterReason(arabicSlug) || (translationSlug ? unavailableReciterReason(translationSlug) : null);
  if (unavailable) {
    useAudioStore.getState().setPlaybackNotice(unavailable + ' Please choose another reciter.');
    throw new Error(unavailable + ' Please choose another reciter.');
  }
  const verses = await buildVersePlaylist(surahNumber, arabicSlug, translationSlug);
  if (surahNumber === 1 || surahNumber === 9 || !verses.length) return verses;
  const opening = (await audioApi.surah(1, arabicSlug)).find((verse) => verse.ayahNumber === 1);
  if (!opening?.url) return verses;
  return [{
    ayahId: -surahNumber,
    surahNumber,
    ayahNumber: 0,
    url: opening.url,
    duration: opening.duration ?? undefined,
    reciterSlug: arabicSlug,
    trackKind: 'bismillah',
  }, ...verses];
}

function startIndexFor(playlist: AudioAyahRef[], ayahNumber?: number, preferKind: AudioAyahRef['trackKind'] = 'arabic') {
  if (!ayahNumber) return 0;
  const preferred = playlist.findIndex(
    (item) => item.ayahNumber === ayahNumber && (item.trackKind ?? 'arabic') === preferKind,
  );
  if (preferred >= 0) return preferred;
  const any = playlist.findIndex((item) => item.ayahNumber === ayahNumber);
  return any >= 0 ? any : 0;
}

export async function startSurahPlayback(opts: {
  surahNumber: number;
  startAyah?: number;
  continuous?: boolean;
  playing?: boolean;
  verseOnly?: boolean;
}): Promise<boolean> {
  const request = ++playbackRequest;
  const audio = useAudioStore.getState();
  const reciters = await audioApi.reciters();
  const settings = useSettingsStore.getState();
  const requested = audio.reciterSlug ?? settings.reciterSlug;
  const arabicSlug =
    reciters.find((item) => item.slug === requested && item.kind !== 'translation')?.slug ??
    (requested && !reciters.some((item) => item.slug === requested) ? requested : null) ??
    reciters.find((item) => item.isDefault)?.slug ??
    reciters.find((item) => item.kind !== 'translation')?.slug;
  if (!arabicSlug) return false;

  const translationSlug = settings.translationReciterSlug;
  const playlist = await buildSurahPlaylist(opts.surahNumber, arabicSlug, translationSlug);
  if (playlist.length === 0 || request !== playbackRequest || useAudioStore.getState().playlist !== audio.playlist) return false;

  const idx = startIndexFor(playlist, (opts.startAyah ?? 1) === 1 && !opts.verseOnly ? undefined : opts.startAyah, 'arabic');
  const tracks =
    opts.verseOnly && opts.startAyah
      ? playlist.filter((item) => item.ayahNumber === opts.startAyah)
      : playlist;
  if (tracks.length === 0) return false;

  audio.setReciter(arabicSlug);
  settings.setReciterSlug(arabicSlug);
  audio.setContinuous(Boolean(opts.continuous));
  audio.setPlaylist(tracks, opts.verseOnly ? 0 : idx);
  audio.setPlaying(opts.playing ?? true);
  void loadWordTimings(opts.surahNumber, arabicSlug);
  return true;
}

export async function rebuildActivePlayback(opts?: {
  arabicSlug?: string;
  translationSlug?: string | null;
  keepPlaying?: boolean;
}): Promise<boolean> {
  const request = ++playbackRequest;
  const audio = useAudioStore.getState();
  const current = audio.getCurrentAyah();
  if (!current) return false;

  const reciters = await audioApi.reciters();
  const settings = useSettingsStore.getState();
  const requested = opts?.arabicSlug ?? audio.reciterSlug ?? settings.reciterSlug;
  const arabicSlug =
    reciters.find((item) => item.slug === requested && item.kind !== 'translation')?.slug ??
    (requested && !reciters.some((item) => item.slug === requested) ? requested : null) ??
    reciters.find((item) => item.isDefault)?.slug ??
    reciters.find((item) => item.kind !== 'translation')?.slug;
  if (!arabicSlug) return false;

  const translationSlug =
    opts && 'translationSlug' in opts ? opts.translationSlug : settings.translationReciterSlug;
  let playlist = await buildSurahPlaylist(current.surahNumber, arabicSlug, translationSlug);
  if (request !== playbackRequest || useAudioStore.getState().playlist !== audio.playlist) return false;
  // Changing a voice must preserve a single-verse repeat selection.
  if (audio.playlist.every((item) => item.ayahNumber === current.ayahNumber)) {
    playlist = playlist.filter((item) => item.ayahNumber === current.ayahNumber);
  }
  if (playlist.length === 0) return false;

  const idx = startIndexFor(playlist, current.ayahNumber, current.trackKind ?? 'arabic');
  audio.setReciter(arabicSlug);
  settings.setReciterSlug(arabicSlug);
  audio.setPlaylist(playlist, idx);
  audio.setPlaying(opts?.keepPlaying ?? useAudioStore.getState().isPlaying);
  void loadWordTimings(current.surahNumber, arabicSlug);
  return true;
}
