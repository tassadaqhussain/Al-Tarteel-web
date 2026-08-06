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
  const lastScrolledAyah = useRef<number | null>(null);

  useEffect(() => {
    if (!current || !isPlaying) return;

    let cancelled = false;
    let attempts = 0;
    let timer: number | null = null;

    const ensureAndScroll = () => {
      if (cancelled) return true;
      const el = document.getElementById(`ayah-${current.ayahId}`);
      if (el) {
        navigatingTo.current = null;
        // Re-scroll when the recited ayah changes (or first attach).
        if (lastScrolledAyah.current !== current.ayahId) {
          lastScrolledAyah.current = current.ayahId;
          // Wait a frame so layout after highlight classes settles.
          requestAnimationFrame(() => {
            if (!cancelled) scrollAyahIntoView(el);
          });
        }
        return true;
      }

      const pageSurah = surahNumberFromPath(pathname);
      if (pageSurah && pageSurah === current.surahNumber) {
        window.dispatchEvent(
          new CustomEvent('quranpilot:ensure-ayah', {
            detail: {
              surahNumber: current.surahNumber,
              ayahNumber: current.ayahNumber,
              ayahId: current.ayahId,
            },
          }),
        );
        return false;
      }

      const juzMatch = pathname.match(/^\/juz\/(\d+)/);
      if (juzMatch) {
        const articles = document.querySelectorAll<HTMLElement>('[data-ayah-id]');
        if (!articles.length) return false;

        const firstId = Number(articles[0].getAttribute('data-ayah-id'));
        const lastId = Number(articles[articles.length - 1].getAttribute('data-ayah-id'));
        const currentPage = Math.max(
          1,
          parseInt(new URLSearchParams(window.location.search).get('page') || '1', 10),
        );

        let targetPage = currentPage;
        if (Number.isFinite(lastId) && current.ayahId > lastId) targetPage = currentPage + 1;
        else if (Number.isFinite(firstId) && current.ayahId < firstId && currentPage > 1) {
          targetPage = currentPage - 1;
        } else return false;

        const href = buildUrl(pathname, targetPage);
        if (navigatingTo.current !== href) {
          navigatingTo.current = href;
          router.replace(href, { scroll: false });
        }
      }
      return false;
    };

    if (ensureAndScroll()) return;

    timer = window.setInterval(() => {
      attempts += 1;
      if (ensureAndScroll() || attempts > 40) {
        if (timer != null) window.clearInterval(timer);
      }
    }, 120);

    const onMounted = (event: Event) => {
      const ayahId = (event as CustomEvent<{ ayahId?: number }>).detail?.ayahId;
      if (ayahId != null && ayahId !== current.ayahId) return;
      lastScrolledAyah.current = null; // force scroll once DOM caught up
      ensureAndScroll();
    };
    window.addEventListener('quranpilot:ayah-mounted', onMounted);

    return () => {
      cancelled = true;
      if (timer != null) window.clearInterval(timer);
      window.removeEventListener('quranpilot:ayah-mounted', onMounted);
    };
  }, [current, currentIndex, isPlaying, pathname, router]);

  useEffect(() => {
    if (!isPlaying) lastScrolledAyah.current = null;
  }, [isPlaying]);

  return null;
}
