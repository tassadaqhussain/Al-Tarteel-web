'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useAudioStore, type AudioAyahRef } from '@/stores/audioStore';

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
    getCurrentAyah,
  } = useAudioStore();

  const current = playlist[currentIndex] ?? null;

  const load = useCallback(
    (item: AudioAyahRef | null) => {
      const el = audioRef.current;
      if (!el) return;
      if (!item?.url) {
        el.removeAttribute('src');
        setCurrentTime(0);
        setDuration(0);
        return;
      }
      setCurrentTime(0);
      setDuration(item.duration ?? 0);
      el.src = item.url;
      el.playbackRate = playbackRate;
      setLastAyah(item.surahNumber, item.ayahNumber);
    },
    [playbackRate, setCurrentTime, setDuration, setLastAyah]
  );

  useEffect(() => {
    load(current);
  }, [current?.url, current?.ayahId, load]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) el.play().catch(() => setPlaying(false));
    else el.pause();
  }, [isPlaying, current?.url, setPlaying]);

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
    const onEnded = () => next();
    const onError = () => setPlaying(false);
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
  }, [next, setCurrentTime, setDuration, setPlaying]);

  return (
    <>
      <audio ref={audioRef} preload="metadata" className="hidden" />
      {children}
    </>
  );
}
