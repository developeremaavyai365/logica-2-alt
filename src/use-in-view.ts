import { useEffect, useRef, useState } from 'react';

/* Reports whether an element is on screen, re-firing on every entry and exit
   so a reveal can replay rather than run once for the life of the page.

   The safety timer matters: if the observer callback never fires — an old
   browser, a disabled API, an embedded webview — anything gated behind this
   would stay invisible forever. After it elapses the content is shown
   regardless, so the worst case is a section that appears without animating
   rather than a section that is never seen. */
export const REVEAL_FALLBACK = 2500;

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
          setInView(entry.isIntersecting);
        });
      },
      { threshold },
    );
    observer.observe(el);

    return () => {
      clearTimeout(fallback);
      observer.disconnect();
    };
  }, [threshold]);

  return [ref, inView] as const;
}
