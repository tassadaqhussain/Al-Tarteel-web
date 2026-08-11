'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useAudioStore, type AudioAyahRef } from '@/stores/audioStore';
import {
  AUDIO_KEEP_AHEAD,
  makeAudioCacheKey,
  temporaryAudioCache,
} from '@/lib/audio/TemporaryAudioCache';

const OFFLINE_NOTICE = 'Internet connection is required to continue.';

function resolveReciterSlug(): string {
  return useAudioStore.getState().reciterSlug || 'default';
}

function cachePartsFor(item: AudioAyahRef) {
  return {
    reciterSlug: resolveReciterSlug(),
    surahNumber: item.surahNumber,
    ayahNumber: item.ayahNumber,
  } as const;
}

function cacheKeyFor(item: AudioAyahRef): string {
  return makeAudioCacheKey(cachePartsFor(item));
}

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSurahRef = useRef<number | null>(null);
  const loadedAyahIdRef = useRef<number | null>(null);

  const {
    playlist,
    currentIndex,
    isPlaying,
    setPlaying,
    setCurrentTime,
    setDuration,
    playbackRate,
    next,
    setLastAyah,
    setPlaybackNotice,
  } = useAudioStore();

  const current = playlist[currentIndex] ?? null;

  const preloadAhead = useCallback((fromIndex: number) => {
    const list = useAudioStore.getState().playlist;
    const item = list[fromIndex];
    if (!item) return;

    temporaryAudioCache.releaseOutsideWindow(item.surahNumber, item.ayahNumber);

    for (let offset = 0; offset <= AUDIO_KEEP_AHEAD; offset += 1) {
      const target = list[fromIndex + offset];
      if (!target?.url) continue;
      void temporaryAudioCache.preload(cachePartsFor(target), target.url);
    }
  }, []);

  const load = useCallback(
    (item: AudioAyahRef | null) => {
      const el = audioRef.current;
      if (!el) return;
      if (!item?.url) {
        el.removeAttribute('src');
        loadedAyahIdRef.current = null;
        setCurrentTime(0);
        setDuration(0);
        return;
      }

      // Same ayah already loaded — do not reset src (avoids restart on rate-only updates).
      if (loadedAyahIdRef.current === item.ayahId && el.getAttribute('src')) {
        el.playbackRate = playbackRate;
        setLastAyah(item.surahNumber, item.ayahNumber);
        return;
      }

      const cached = temporaryAudioCache.getObjectUrl(cacheKeyFor(item));
      const src = cached || item.url;

      setCurrentTime(0);
      setDuration(item.duration ?? 0);
      el.src = src;
      loadedAyahIdRef.current = item.ayahId;
      el.playbackRate = playbackRate;
      setLastAyah(item.surahNumber, item.ayahNumber);
    },
    [playbackRate, setCurrentTime, setDuration, setLastAyah]
  );

  // Surah / playlist lifecycle
  useEffect(() => {
    const surah = playlist[0]?.surahNumber ?? null;
    const prev = lastSurahRef.current;
    if (prev != null && surah != null && prev !== surah) {
      temporaryAudioCache.cancelPending();
      temporaryAudioCache.clearSurah(prev);
      loadedAyahIdRef.current = null;
    }
    if (playlist.length === 0) {
      temporaryAudioCache.clearSession();
      lastSurahRef.current = null;
      loadedAyahIdRef.current = null;
      return;
    }
    lastSurahRef.current = surah;
  }, [playlist]);

  useEffect(() => {
    load(current);
    if (current) preloadAhead(currentIndex);
  }, [current?.ayahId, current?.url, currentIndex, load, preloadAhead, current]);

  // Warm current ayah into cache (does not swap mid-play; next advance benefits).
  useEffect(() => {
    if (!current?.url) return;
    void temporaryAudioCache.preload(cachePartsFor(current), current.url);
    preloadAhead(currentIndex);
  }, [current?.ayahId, current?.url, currentIndex, preloadAhead, current]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      void el.play().catch(() => setPlaying(false));
    } else {
      el.pause();
    }
  }, [isPlaying, current?.ayahId, setPlaying]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onTimeUpdate = () => setCurrentTime(el.currentTime);
    const onDurationChange = () => setDuration(Number.isFinite(el.duration) ? el.duration : 0);

    const onEnded = () => {
      const state = useAudioStore.getState();
      const { playlist: list, continuous, currentIndex: idx } = state;

      if (continuous && list.length === 1 && el.src) {
        el.currentTime = 0;
        void el.play().catch(() => setPlaying(false));
        return;
      }

      const atEnd = idx >= list.length - 1;
      if (atEnd) {
        if (continuous && list.length) {
          next();
          return;
        }
        const surah = list[0]?.surahNumber;
        setPlaying(false);
        if (surah != null) temporaryAudioCache.clearSurah(surah);
        else temporaryAudioCache.clearSession();
        return;
      }

      const upcoming = list[idx + 1];
      if (upcoming) {
        const key = cacheKeyFor(upcoming);
        const online = typeof navigator === 'undefined' ? true : navigator.onLine;
        if (!temporaryAudioCache.has(key) && !online) {
          setPlaying(false);
          setPlaybackNotice(OFFLINE_NOTICE);
          return;
        }
      }

      next();
    };

    const onError = () => {
      const online = typeof navigator === 'undefined' ? true : navigator.onLine;
      setCurrentTime(0);
      setDuration(0);
      setPlaying(false);
      if (!online) setPlaybackNotice(OFFLINE_NOTICE);
    };

    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('durationchange', onDurationChange);
    el.addEventListener('loadedmetadata', onDurationChange);
    el.addEventListener('ended', onEnded);
    el.addEventListener('error', onError);
    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('durationchange', onDurationChange);
      el.removeEventListener('loadedmetadata', onDurationChange);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('error', onError);
    };
  }, [next, setCurrentTime, setDuration, setPlaying, setPlaybackNotice]);

  useEffect(() => {
    const clear = () => temporaryAudioCache.clearSession();
    window.addEventListener('pagehide', clear);
    window.addEventListener('beforeunload', clear);
    return () => {
      window.removeEventListener('pagehide', clear);
      window.removeEventListener('beforeunload', clear);
      temporaryAudioCache.clearSession();
    };
  }, []);

  useEffect(() => {
    const onOnline = () => {
      const { playbackNotice, playlist: list, currentIndex: idx } = useAudioStore.getState();
      if (playbackNotice) setPlaybackNotice(null);
      if (list[idx]) preloadAhead(idx);
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [preloadAhead, setPlaybackNotice]);

  return (
    <>
      <audio ref={audioRef} preload="auto" className="hidden" />
      {children}
    </>
  );
}
