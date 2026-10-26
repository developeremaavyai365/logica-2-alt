import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { CAREERS_BLUE, CAREERS_NAVY } from '../careers/WavePanel';

export interface TimelineEntry {
  name: string;
  event: string;
  /** e.g. "July 28, 1995" — the year is read off the end. */
  date: string;
}

const yearOf = (date: string) => date.match(/\d{4}\s*$/)?.[0].trim() ?? date;

/** The incorporation history as a timeline that tells itself as you scroll:
 *  a line draws down the middle, and each name slides in from alternating
 *  sides as it is reached, its dot lighting up as it lands. The latest name
 *  closes the line as a navy "today" card.
 *
 *  Visitors who ask for reduced motion get the finished timeline, still. */
export default function IncorporationTimeline({ entries }: { entries: TimelineEntry[] }) {
  const reducedMotion = usePrefersReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<boolean[]>(() => entries.map(() => false));

  // Each milestone appears once, the first time it scrolls into view.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (reducedMotion) {
      setShown(entries.map(() => true));
      return;
    }
    const items = Array.from(list.querySelectorAll<HTMLElement>('[data-index]'));
    const observer = new IntersectionObserver(
      (records) => {
        for (const r of records) {
          if (!r.isIntersecting) continue;
          const i = Number((r.target as HTMLElement).dataset.index);
          setShown((prev) => (prev[i] ? prev : prev.map((v, k) => (k === i ? true : v))));
          observer.unobserve(r.target);
        }
      },
      { rootMargin: '0px 0px -18% 0px', threshold: 0.25 },
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [entries, reducedMotion]);

  // The line draws down with the scroll: it reaches as far as the point
  // 60% of the way down the window has got through the list.
  useEffect(() => {
    const list = listRef.current;
    const line = lineRef.current;
    if (!list || !line) return;
    if (reducedMotion) {
      line.style.transform = 'scaleY(1)';
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const box = list.getBoundingClientRect();
      const reached = window.innerHeight * 0.6 - box.top;
      const progress = Math.min(1, Math.max(0, reached / box.height));
      line.style.transform = `scaleY(${progress})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reducedMotion]);

  return (
    <ol ref={listRef} className="relative mt-12">
      {/* The track, and the line drawing down it. Left on a phone, centred
          from md up. */}
      <div aria-hidden="true" className="absolute bottom-0 left-[15px] top-0 w-[2px] rounded-full bg-[#E5E7EB] md:left-1/2 md:-translate-x-1/2" />
      <div
        ref={lineRef}
        aria-hidden="true"
        className="absolute bottom-0 left-[15px] top-0 w-[2px] origin-top rounded-full md:left-1/2 md:-translate-x-1/2"
        style={{
          transform: 'scaleY(0)',
          background: `linear-gradient(180deg, #8FAEFF 0%, ${CAREERS_BLUE} 60%, ${CAREERS_NAVY} 100%)`,
          boxShadow: '0 0 12px rgba(61,79,224,0.45)',
        }}
      />

      {entries.map((entry, i) => {
        const on = shown[i];
        const right = i % 2 === 1; // which side of the line, from md up
        const latest = i === entries.length - 1;
        const year = yearOf(entry.date);

        return (
          <li
            key={entry.name}
            data-index={i}
            // From md up the cards alternate sides, so each row tucks up
            // under the one before instead of leaving half a row empty.
            className={`relative grid grid-cols-[32px_1fr] gap-5 pb-10 last:pb-0 md:grid-cols-[1fr_56px_1fr] md:gap-0 md:pb-6 ${
              i > 0 ? 'md:-mt-20' : ''
            }`}
          >
            {/* The dot on the line */}
            <div className="relative col-start-1 row-start-1 flex justify-center pt-7 md:col-start-2">
              <span
                aria-hidden="true"
                className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full border-[3px] bg-white transition-all duration-500"
                style={{
                  borderColor: on ? CAREERS_BLUE : '#D1D5DB',
                  transform: on ? 'scale(1)' : 'scale(0.6)',
                  boxShadow: on ? `0 0 0 6px rgba(61,79,224,0.14), 0 0 18px rgba(61,79,224,0.5)` : 'none',
                }}
              >
                {on && !reducedMotion && (
                  // One ripple as the dot lights up, then gone.
                  <span
                    className="absolute inset-[-7px] rounded-full border-2 motion-safe:animate-ping"
                    style={{ borderColor: CAREERS_BLUE, animationIterationCount: 1, animationFillMode: 'forwards' }}
                  />
                )}
              </span>
            </div>

            {/* The milestone */}
            <div
              className={`col-start-2 row-start-1 w-full transition-all duration-700 ease-out md:max-w-[420px] ${
                right ? 'md:col-start-3 md:pl-8' : 'md:col-start-1 md:justify-self-end md:pr-8 md:text-right'
              }`}
              style={{
                opacity: on ? 1 : 0,
                filter: on ? 'blur(0)' : 'blur(6px)',
                transform: on ? 'translate3d(0,0,0)' : `translate3d(${right ? 48 : -48}px, 16px, 0)`,
              }}
            >
              {latest ? (
                <div
                  className="relative overflow-hidden rounded-2xl p-6 text-left shadow-[0_24px_48px_-20px_rgba(6,26,64,0.55)] sm:p-7"
                  style={{ background: 'linear-gradient(150deg, #0E2A5C 0%, #061A40 60%, #04122E 100%)' }}
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full opacity-50 blur-2xl"
                    style={{ background: `radial-gradient(circle, ${CAREERS_BLUE} 0%, transparent 70%)` }}
                  />
                  <div className="relative flex items-center justify-between gap-3">
                    <span
                      className="font-dm-sans font-bold text-white"
                      style={{ fontSize: 'clamp(36px, 4vw, 52px)', letterSpacing: '-0.04em', lineHeight: 1 }}
                    >
                      {year}
                    </span>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white" style={{ backgroundColor: CAREERS_BLUE }}>
                      Today
                    </span>
                  </div>
                  <p className="relative mt-4 text-xl font-semibold text-white">{entry.name}</p>
                  <p className="relative mt-1.5 text-sm text-white/65">
                    {entry.event} · {entry.date}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_30px_-12px_rgba(6,26,64,0.15)] transition-shadow duration-300 hover:shadow-[0_20px_40px_-16px_rgba(6,26,64,0.25)] sm:p-7">
                  <span
                    className="block bg-clip-text font-dm-sans font-bold text-transparent"
                    style={{
                      fontSize: 'clamp(36px, 4vw, 52px)',
                      letterSpacing: '-0.04em',
                      lineHeight: 1,
                      backgroundImage: `linear-gradient(120deg, ${CAREERS_NAVY} 0%, ${CAREERS_BLUE} 100%)`,
                    }}
                  >
                    {year}
                  </span>
                  <p className="mt-4 text-lg font-semibold" style={{ color: CAREERS_NAVY }}>
                    {entry.name}
                  </p>
                  <p className="mt-1.5 text-sm text-[#6B7280]">
                    <span className="font-medium" style={{ color: CAREERS_BLUE }}>
                      {entry.event}
                    </span>{' '}
                    · {entry.date}
                  </p>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
