'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAudioStore } from '@/stores/audioStore';
import { getSurahNumberFromSlug } from '@/lib/surah-meta';

function buildUrl(pathname: string, page: number) {
  const params = new URLSearchParams(window.location.search);
  if (page <= 1) params.delete('page');
  else params.set('page', String(page));
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

function surahNumberFromPath(pathname: string): number | null {
  const numeric = pathname.match(/^\/surah\/(\d+)/);
  if (numeric) return Number(numeric[1]);
  const slug = pathname.replace(/^\//, '').split('/')[0];
  if (!slug || slug.includes('.')) return null;
  return getSurahNumberFromSlug(slug);
}

/** Sticky reader chrome + player clearance for scrollIntoView / scroll-margin. */
const HEADER_OFFSET = 130;
const PLAYER_OFFSET = 96;

function scrollAyahIntoView(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const viewTop = HEADER_OFFSET;
  const viewBottom = window.innerHeight - PLAYER_OFFSET;
  const viewMid = (viewTop + viewBottom) / 2;
  const elMid = rect.top + rect.height / 2;

  // Already comfortably in the reading band — skip to avoid scroll thrash.
  if (rect.top >= viewTop - 8 && rect.bottom <= viewBottom + 8) return;
  if (Math.abs(elMid - viewMid) < 48 && rect.top < viewBottom && rect.bottom > viewTop) return;

  const target =
    window.scrollY + rect.top - HEADER_OFFSET - Math.max(24, (viewBottom - viewTop - rect.height) / 2);

  window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
}

export function ScrollToCurrentAyah() {
  const router = useRouter();
  const pathname = usePathname();
  const currentIndex = useAudioStore((s) => s.currentIndex);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const current = useAudioStore((s) => s.playlist[s.currentIndex] ?? null);
  const navigatingTo = useRef<string | null>(null);
  const lastScrolledAyah = useRef<string | null>(null);

  useEffect(() => {
    if (!current || !isPlaying) return;

    const ayahKey = `${current.surahNumber}:${current.ayahNumber}`;

    const findTargetElement = (): HTMLElement | null => {
      return (
        document.getElementById(`ayah-${current.ayahId}`) ||
        document.querySelector<HTMLElement>(`[data-surah="${current.surahNumber}"][data-ayah-number="${current.ayahNumber}"]`) ||
        document.querySelector<HTMLElement>(`[data-ayah-number="${current.ayahNumber}"]`) ||
        document.getElementById(`ayah-number-${current.ayahNumber}`)
      );
    };

    const performScroll = () => {
      const el = findTargetElement();
      if (!el) return false;

      const rect = el.getBoundingClientRect();
      // Position active verse comfortably below the sticky subheader (~100px from top)
      const targetScrollY = window.scrollY + rect.top - 110;

      window.scrollTo({
        top: Math.max(0, targetScrollY),
        behavior: 'smooth',
      });
      return true;
    };

    if (lastScrolledAyah.current !== ayahKey) {
      lastScrolledAyah.current = ayahKey;
      requestAnimationFrame(() => {
        if (!performScroll()) {
          let attempts = 0;
          const timer = window.setInterval(() => {
            attempts += 1;
            if (performScroll() || attempts > 25) {
              window.clearInterval(timer);
            }
          }, 100);
        }
      });
    }
  }, [current, currentIndex, isPlaying, pathname, router]);

  useEffect(() => {
    if (!isPlaying) lastScrolledAyah.current = null;
  }, [isPlaying]);

  return null;
}
