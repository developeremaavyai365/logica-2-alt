import { useEffect, useRef, useState } from 'react';

/* Reports whether an element is on screen, re-firing on entry and exit so a
   reveal can replay rather than run once for the life of the page.

   The safety timer matters: if the observer callback never fires — an old
   browser, a disabled API, an embedded webview — anything gated behind this
   would stay invisible forever. After it elapses the content is shown
   regardless, so the worst case is a section that appears without animating
   rather than a section that is never seen. */
export const REVEAL_FALLBACK = 2500;

/* Enough crossings that the callback runs regularly as a block travels up the
   screen, rather than only at the one ratio a caller asked for. Needed for the
   viewport-share rule below, which has to be re-evaluated during the scroll
   and not just at a single boundary. */
const STEPS = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 0.9, 1];

/* A block taller than the window can never reach a ratio like 0.4 — at best it
   covers window height / its own height. Treat "filling this much of the
   screen" as on screen too, or tall sections would never reveal at all. */
const VIEWPORT_SHARE = 0.5;

export function useInView<T extends HTMLElement>(threshold: number) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fallback = setTimeout(() => setInView(true), REVEAL_FALLBACK);
    if (typeof IntersectionObserver === 'undefined') return () => clearTimeout(fallback);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          clearTimeout(fallback);

          const viewport = window.innerHeight || 1;
          const enough =
            entry.intersectionRatio >= threshold ||
            entry.intersectionRect.height >= viewport * VIEWPORT_SHARE;

          if (entry.isIntersecting && enough) {
            setInView(true);
          } else if (!entry.isIntersecting) {
            /* Reset only once the element is completely gone. Resetting the
               moment it drops under the ratio instead — which is what
               `setInView(entry.isIntersecting)` does on any non-zero
               threshold — blanks content that is still on screen, so
               sections vanished as they were scrolled past. */
            setInView(false);
          }
        });
      },
      { threshold: Array.from(new Set([...STEPS, threshold])).sort((a, b) => a - b) },
    );
    observer.observe(el);

    return () => {
      clearTimeout(fallback);
      observer.disconnect();
    };
  }, [threshold]);

  return [ref, inView] as const;
}
