import { useEffect, useRef, useState } from 'react';

/* Text that darkens word by word as it is scrolled through: the words start
   at a legible grey and each fills to full ink as the block travels up the
   viewport.

   Shared by the Who We Are statement and the Logica Infoway captions so the
   two behave identically rather than drifting into two implementations. */

export interface RevealSegment {
  text: string;
  /** Carries the brand accent instead of ink, and sets in bold. */
  emphasis?: boolean;
}

/** How much of the whole scroll one word takes to darken. Wider than a single
 *  word's share, so several are always mid-fill and the line washes in rather
 *  than ticking over a word at a time. */
const WORD_RAMP = 0.2;

/* Unfilled text sits at a legible grey rather than a whisper — every line can
   be read before the reveal reaches it, which matters on a page investors
   read. inkAt/accentAt below carry it up from there to solid. */
const FILL_INK = '#111111';
const FILL_ACCENT = '#15803D';

/** Reports how far the element has travelled through its reveal window, 0-1.
 *
 *  Scroll-driven rather than IntersectionObserver: the effect needs a
 *  continuous value, not an entered/left flag. Reads are batched into an
 *  animation frame so a fast scroll cannot queue a layout read per event. */
export function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Anyone who has asked for less motion gets the finished text outright.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setProgress(1);
      return;
    }

    let frame = 0;
    const measure = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // Starts as the block rises past four-fifths of the screen, finished by
      // the time its top reaches a quarter of the way up.
      const start = vh * 0.8;
      const end = vh * 0.25;
      setProgress(Math.min(1, Math.max(0, (start - r.top) / (start - end))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ref]);

  return progress;
}

export default function RevealText({
  segments,
  className,
  style,
  progress: externalProgress,
}: {
  segments: RevealSegment[];
  className?: string;
  style?: React.CSSProperties;
  /** Drives the fill from outside — used by the pinned Who We Are section,
   *  where the progress is how far the reader has scrolled through the pin
   *  rather than where this paragraph sits in the viewport. Left undefined,
   *  the paragraph measures itself as before. */
  progress?: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  // Called unconditionally so the hook order never changes, then ignored when
  // a caller is driving the fill itself.
  const selfProgress = useScrollProgress(ref);
  const progress = externalProgress ?? selfProgress;

  const words = segments.flatMap((seg) =>
    seg.text.split(/\s+/).filter(Boolean).map((word) => ({ word, emphasis: !!seg.emphasis })),
  );

  return (
    <p ref={ref} className={className} style={style}>
      {words.map(({ word, emphasis }, i) => {
        const startAt = (i / words.length) * (1 - WORD_RAMP);
        const t = Math.min(1, Math.max(0, (progress - startAt) / WORD_RAMP));
        return (
          <span
            key={`${word}-${i}`}
            style={{
              color: emphasis ? accentAt(t) : inkAt(t),
              fontWeight: emphasis ? 700 : undefined,
              transition: 'color 200ms linear',
            }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </p>
  );
}

/** Grey through to solid ink, and grey-green through to the brand accent. */
function inkAt(t: number) {
  return t >= 1 ? FILL_INK : `rgba(17, 17, 17, ${(0.45 + 0.55 * t).toFixed(3)})`;
}

function accentAt(t: number) {
  return t >= 1 ? FILL_ACCENT : `rgba(21, 128, 61, ${(0.5 + 0.5 * t).toFixed(3)})`;
}
