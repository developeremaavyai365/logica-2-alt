import { useEffect, useState } from 'react';

/** Shared `prefers-reduced-motion` read, kept live across OS-setting changes.
 *  Any component that adds its own motion (typing effects, hover scale,
 *  staggered reveals) should gate it behind this instead of assuming CSS
 *  alone covers it. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
