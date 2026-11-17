'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  arrow as arrowMiddleware,
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useFloating,
  type Placement,
} from '@floating-ui/react-dom';

/** Space reserved under the sticky site header + reader sub-bar (px). */
const TOP_CLEARANCE = 128;
const EDGE_PADDING = 8;
const ARROW_SIZE = 10;

const OPPOSITE: Record<string, 'top' | 'bottom' | 'left' | 'right'> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

function audioBarClearance(): number {
  if (typeof window === 'undefined') return EDGE_PADDING;
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--audio-bar-height');
  const n = parseFloat(raw);
  return (Number.isFinite(n) ? n : 0) + EDGE_PADDING;
}

type WordPopoverProps = {
  id: string;
  /** Close request (Escape, outside click, scroll). `refocus` = return focus to the word. */
  onClose: (refocus: boolean) => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  children: React.ReactNode;
};

/**
 * Word-by-word popup rendered in a portal on document.body with fixed positioning,
 * so it is never clipped by overflow on the verse list. Flips below the word when
 * there is no room above (accounting for the sticky header) and shifts sideways to
 * stay on screen; the arrow always points at the word. Positioning is physical, so
 * it behaves identically in LTR and RTL.
 */
export function WordPopover({ id, onClose, onPointerEnter, onPointerLeave, children }: WordPopoverProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const arrowRef = useRef<HTMLSpanElement | null>(null);
  const openedScrollY = useRef(0);
  const openedAt = useRef(0);

  const { refs, floatingStyles, placement, middlewareData } = useFloating<HTMLElement>({
    strategy: 'fixed',
    placement: 'top' as Placement,
    elements: { reference: anchor },
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(ARROW_SIZE),
      flip({
        fallbackPlacements: ['bottom'],
        padding: { top: TOP_CLEARANCE, bottom: audioBarClearance(), left: EDGE_PADDING, right: EDGE_PADDING },
      }),
      shift({
        padding: EDGE_PADDING,
        crossAxis: false,
      }),
      size({
        padding: EDGE_PADDING,
        apply({ availableWidth, elements }) {
          elements.floating.style.maxWidth = `${Math.max(160, Math.min(256, availableWidth))}px`;
        },
      }),
      arrowMiddleware({ element: arrowRef, padding: 8 }),
    ],
  });

  useLayoutEffect(() => {
    openedScrollY.current = window.scrollY;
    openedAt.current = Date.now();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose(true);
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (refs.floating.current?.contains(target)) return;
      // Clicking the anchor word is handled by the word itself (toggle / re-open).
      if (anchor?.contains(target)) return;
      onClose(false);
    };
    const onScroll = () => {
      // Ignore the scroll caused by opening (scrollIntoView on the active verse).
      if (Date.now() - openedAt.current < 250) return;
      if (Math.abs(window.scrollY - openedScrollY.current) < 8) return;
      onClose(false);
    };
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('scroll', onScroll);
    };
  }, [anchor, onClose, refs.floating]);

  const side = placement.split('-')[0] as string;
  const arrowX = middlewareData.arrow?.x;
  const arrowY = middlewareData.arrow?.y;

  return (
    <>
      {/* Zero-size marker: its parent (the word) is the positioning reference. */}
      <span ref={(n) => setAnchor(n?.parentElement ?? null)} hidden aria-hidden />
      {anchor &&
        createPortal(
          <span
            ref={refs.setFloating}
            id={id}
            role="tooltip"
            data-word-popover
            data-side={side}
            style={{ ...floatingStyles, zIndex: 80 }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            className="flex w-max flex-col items-stretch gap-1.5 rounded-xl bg-tooltip px-2.5 py-2 text-start text-[11px] font-medium text-tooltip-ink shadow-lg"
          >
            {children}
            <span
              ref={arrowRef}
              aria-hidden
              className="absolute h-2.5 w-2.5 rotate-45 bg-tooltip"
              style={{
                left: arrowX != null ? `${arrowX}px` : undefined,
                top: arrowY != null ? `${arrowY}px` : undefined,
                [OPPOSITE[side] ?? 'bottom']: `${-ARROW_SIZE / 2}px`,
              }}
            />
          </span>,
          document.body,
        )}
    </>
  );
}
