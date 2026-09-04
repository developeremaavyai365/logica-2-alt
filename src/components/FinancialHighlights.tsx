import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from '../use-in-view';

/* Figures shown to investors, so each one has to trace to something filed.

   The revenue figure is the company's own reported revenue from operations
   for the year ended 31 March 2026 — 1,31,572.09 lakh, which is 1,315.72
   crore — and the results it comes from are on the investor pages. The store
   count is the same 90+ the homepage stats already publish, so the two cannot
   drift apart. Nothing here is estimated or rounded up: if a number is not
   filed or already published elsewhere on the site, it does not belong in
   this block. */
const HIGHLIGHTS = [
  {
    prefix: '₹',
    value: 1315.72,
    decimals: 2,
    suffix: ' Cr',
    label: 'FY2026 Revenue from operations',
    note: 'Year ended 31 March 2026',
    icon: CoinsMark,
  },
  {
    prefix: '',
    value: 90,
    decimals: 0,
    suffix: '+',
    label: 'Stores Pan India',
    note: 'Retail counters across the country',
    icon: MapMark,
  },
];

const COUNT_DURATION = 1400;

const svg = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 48 48',
};

type MarkProps = { className?: string; style?: React.CSSProperties };

/** Stacked coins, for the money figure. */
function CoinsMark(p: MarkProps) {
  return (
    <svg {...svg} {...p}>
      <ellipse cx="18" cy="14" rx="12" ry="4.6" />
      <path d="M6 14v6c0 2.5 5.4 4.6 12 4.6s12-2.1 12-4.6v-6" />
      <path d="M6 20v6c0 2.5 5.4 4.6 12 4.6s12-2.1 12-4.6v-6" />
      <ellipse cx="30" cy="32" rx="12" ry="4.6" />
      <path d="M18 32v6c0 2.5 5.4 4.6 12 4.6s12-2.1 12-4.6v-6" />
    </svg>
  );
}

/** A map with a pin on it, for the reach figure. */
function MapMark(p: MarkProps) {
  return (
    <svg {...svg} {...p}>
      <path d="M6 12l11-4 14 5 11-4v27l-11 4-14-5-11 4z" />
      <path d="M17 8v27M31 13v27" />
      <circle cx="24" cy="20" r="3.4" />
      <path d="M24 27c3.2-3.4 5-5.7 5-8.2a5 5 0 0 0-10 0c0 2.5 1.8 4.8 5 8.2z" />
    </svg>
  );
}

/* Counts up to the figure once the block is reached, and — unlike the
   decorative stats above — guarantees it lands on the real number.

   The animation is driven by requestAnimationFrame, so a timer snaps the
   value to its target once the run should have finished. If rAF never fires
   at all (a background tab, a browser that throttles it, an embedded webview)
   the worst case has to be a figure that appears without counting, never a
   revenue figure left frozen part-way to its value. Reduced motion skips
   straight to the number for the same reason. */
function useCountUp(target: number, decimals: number, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / COUNT_DURATION);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const settle = setTimeout(() => setValue(target), COUNT_DURATION + 400);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
    };
  }, [target, decimals, active]);

  return value;
}

function Figure({
  item,
  active,
}: {
  item: (typeof HIGHLIGHTS)[number];
  active: boolean;
}) {
  const value = useCountUp(item.value, item.decimals, active);

  return (
    <p
      className="font-dm-sans font-extrabold text-[#0A0A0A] tabular-nums"
      style={{ fontSize: 'clamp(26px, 2.6vw, 36px)', letterSpacing: '-0.035em', lineHeight: 1 }}
    >
      {item.prefix}
      {/* Indian grouping, so the crore figure reads 1,315.72 rather than
          1315.72 — and a fixed number of decimals, so the width does not
          jitter as it counts. */}
      {value.toLocaleString('en-IN', {
        minimumFractionDigits: item.decimals,
        maximumFractionDigits: item.decimals,
      })}
      {item.suffix}
    </p>
  );
}

export default function FinancialHighlights() {
  const [ref, inView] = useInView<HTMLDivElement>(0.25);

  return (
    <section className="bg-white px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-5xl">
        <h2
          className="font-dm-sans text-center font-bold text-[#111111]"
          style={{ fontSize: 'clamp(24px, 2.8vw, 38px)', letterSpacing: '-0.03em', lineHeight: 1.1 }}
        >
          Financial Highlights
        </h2>

        <div
          ref={ref}
          className="mt-12 grid grid-cols-1 gap-10 sm:mt-16 sm:grid-cols-2 sm:gap-12"
        >
          {HIGHLIGHTS.map((item, i) => (
            <div
              key={item.label}
              className="flex items-center gap-5 transition-all ease-out sm:gap-6"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(18px)',
                transitionDuration: '700ms',
                transitionDelay: inView ? `${i * 140}ms` : '0ms',
              }}
            >
              <item.icon
                className="shrink-0 text-[#15803D]"
                style={{ height: 'clamp(40px, 3.4vw, 50px)', width: 'clamp(40px, 3.4vw, 50px)' }}
              />
              <div className="min-w-0">
                <Figure item={item} active={inView} />
                <p
                  className="font-inter mt-2 font-medium text-[#0A0A0A]"
                  style={{ fontSize: 'clamp(13px, 1vw, 15px)' }}
                >
                  {item.label}
                </p>
                <p className="font-inter mt-1 text-xs italic text-black/45">{item.note}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Straight to the filings the figures come from, rather than a
            claim the reader has to take on trust. */}
        <div className="mt-14 flex justify-center sm:mt-16">
          <Link
            to="/investor"
            className="group inline-flex items-center gap-3 text-[#0A0A0A] outline-none"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/25 transition-colors duration-300 group-hover:border-[#15803D] group-hover:bg-[#15803D] group-hover:text-white group-focus-visible:border-[#15803D] group-focus-visible:bg-[#15803D] group-focus-visible:text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </span>
            <span
              className="font-inter font-medium transition-colors duration-300 group-hover:text-[#15803D] group-focus-visible:text-[#15803D]"
              style={{ fontSize: 'clamp(14px, 1.05vw, 16px)' }}
            >
              Investors Information
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
