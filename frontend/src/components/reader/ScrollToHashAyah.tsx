'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Matches ScrollToCurrentAyah's sticky-chrome clearance. */
const HEADER_OFFSET = 130;
/** Verses hydrate/fetch client-side, so the anchor may not exist yet. */
const MAX_ATTEMPTS = 40;
const RETRY_MS = 150;

/**
 * Jump to the verse named in the URL hash (#ayah-number-255).
 *
 * Search results and shared links land on a paginated reader page whose verses
 * render on the client, so the anchor does not exist during the browser's own
 * hash-scroll pass and the page just stays at the top. This retries until the
 * element appears, then scrolls and briefly highlights it.
 */
export function ScrollToHashAyah() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    let highlightTimer = 0;
    let settleTimer = 0;

    const run = () => {
      const hash = window.location.hash;
      const match = /^#ayah-(?:number-)?(\d{1,3})$/.exec(hash);
      if (!match) return;
      const id = hash.slice(1);
      let attempts = 0;

      const attempt = () => {
        if (cancelled) return;
        const el = document.getElementById(id);
        if (!el) {
          if (attempts++ < MAX_ATTEMPTS) timer = window.setTimeout(attempt, RETRY_MS);
          return;
        }
        const jump = () => {
          const target = window.scrollY + el.getBoundingClientRect().top - HEADER_OFFSET;
          window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
        };
        // The App Router resets scroll on navigation, which can land after this
        // effect; assert once on the next frame and re-check shortly after.
        requestAnimationFrame(jump);
        settleTimer = window.setTimeout(() => {
          if (cancelled) return;
          const off = Math.abs(el.getBoundingClientRect().top - HEADER_OFFSET);
          if (off > 120) jump();
        }, 450);

        const block = el.closest('[data-ayah-id]');
        if (block instanceof HTMLElement) {
          block.classList.add('ayah-hash-target');
          highlightTimer = window.setTimeout(
            () => block.classList.remove('ayah-hash-target'),
            2600,
          );
        }
      };
      attempt();
    };

    run();
    window.addEventListener('hashchange', run);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.clearTimeout(highlightTimer);
      window.clearTimeout(settleTimer);
      window.removeEventListener('hashchange', run);
    };
  }, [pathname]);

  return null;
}
