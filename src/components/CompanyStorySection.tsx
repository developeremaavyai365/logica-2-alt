import { useEffect, useRef, useState } from 'react';

/* Marks drawn for these four verticals rather than pulled from an icon set,
   so each one says what the business actually does: a shopfront with its
   shutter half-raised, a depot fanning stock out to four points, a globe with
   a shipping lane leaving it, and a storefront that lives on a screen. One
   line weight and one 48-unit grid across all four so they read as a set. */
type MarkProps = { className?: string; style?: React.CSSProperties };

const svg = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 48 48',
};

/** Retail — a shopfront: scalloped awning, open shutter, lit doorway. */
function RetailMark(p: MarkProps) {
  return (
    <svg {...svg} {...p}>
      <path d="M9 20v19h30V20" />
      <path d="M7 20l3.5-9h27L41 20" />
      <path d="M7 20c2 0 2 2.6 4.25 2.6S13.25 20 15.5 20s2 2.6 4.25 2.6S22 20 24 20s2 2.6 4.25 2.6S32.5 20 34.5 20s2 2.6 4.25 2.6S41 20 41 20" />
      <path d="M19.5 39V29.5h9V39" />
    </svg>
  );
}

/** Distribution — a depot at the centre, stock fanning out to four points. */
function DistributionMark(p: MarkProps) {
  return (
    <svg {...svg} {...p}>
      <rect x="17" y="17" width="14" height="14" rx="2.5" />
      <circle cx="9" cy="9" r="3.2" />
      <circle cx="39" cy="9" r="3.2" />
      <circle cx="9" cy="39" r="3.2" />
      <circle cx="39" cy="39" r="3.2" />
      <path d="M16.4 16.4l-5 -5M31.6 16.4l5 -5M16.4 31.6l-5 5M31.6 31.6l5 5" />
    </svg>
  );
}

/** Export — a globe with a shipping lane arcing away from it. */
function ExportMark(p: MarkProps) {
  return (
    <svg {...svg} {...p}>
      <circle cx="21" cy="25" r="13" />
      <path d="M8 25h26" />
      <path d="M21 12c4.2 4 4.2 22 0 26M21 12c-4.2 4-4.2 22 0 26" />
      <path d="M31 13c5 1.5 8.5 4 10.5 6.5" strokeDasharray="3.5 3.5" />
      <path d="M38 18.5l4 1.2-1.4 3.9" />
    </svg>
  );
}

/** E-commerce — a storefront that lives on a screen, open around the clock. */
function EcommerceMark(p: MarkProps) {
  return (
    <svg {...svg} {...p}>
      <rect x="6" y="9" width="36" height="27" rx="3.5" />
      <path d="M6 17h36" />
      <path d="M10.5 13h.02M14.5 13h.02" />
      <path d="M17 23h15l-1.6 7.5H19.4L17 21h-2.5" />
      <circle cx="20.5" cy="34" r="1.6" />
      <circle cx="29" cy="34" r="1.6" />
      <path d="M18 42h12" />
    </svg>
  );
}

// Logica's four core verticals — retail, warehousing, export, e-commerce.
const stats = [
  { vertical: 'Retail', value: '82+', label: 'Stores Pan India', icon: RetailMark, chip: '#FDE8D8', ink: '#D2781E' },
  { vertical: 'Distribution', value: '5', label: 'Distribution Centres', icon: DistributionMark, chip: '#DFF5E3', ink: '#15803D' },
  { vertical: 'Export', value: '7+', label: 'Countries Served', icon: ExportMark, chip: '#DCEBFF', ink: '#1D4ED8' },
  { vertical: 'E-commerce', value: '24/7', label: 'Nationwide Online Reach', icon: EcommerceMark, chip: '#EDE4FF', ink: '#6D28D9' },
];

const DURATION = 1200;
const STAGGER = 200;

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    let raf: number;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target]);

  return value;
}

function StatValue({ raw, active }: { raw: string; active: boolean }) {
  const match = raw.match(/^(\d+)(.*)$/);
  const count = useCountUp(match ? Number(match[1]) : 0, active && !!match);

  if (!match) return <>{raw}</>;
  // The digits carry the weight; the "+" or "/7" rides smaller and raised so
  // it never competes with the number for size.
  return (
    <>
      {count}
      {match[2] && (
        <span style={{ fontSize: '0.44em', verticalAlign: '0.55em', letterSpacing: '-0.01em' }}>
          {match[2]}
        </span>
      )}
    </>
  );
}

export default function CompanyStorySection() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState<boolean[]>(() => stats.map(() => false));

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    let timers: ReturnType<typeof setTimeout>[] = [];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          timers.forEach(clearTimeout);
          timers = [];

          if (entry.isIntersecting) {
            // Replay the stagger fresh every time the section comes into view.
            setRevealed(stats.map(() => false));
            stats.forEach((_, i) => {
              timers.push(
                setTimeout(() => {
                  setRevealed((prev) => {
                    const next = [...prev];
                    next[i] = true;
                    return next;
                  });
                }, i * STAGGER),
              );
            });
          } else {
            // Reset so it's ready to animate in again on the next entry.
            setRevealed(stats.map(() => false));
          }
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      timers.forEach(clearTimeout);
      observer.disconnect();
    };
  }, []);

  return (
    <section className="bg-white px-5 py-20 sm:px-8 sm:py-28 lg:px-10 lg:py-36">
      {/* Brand green rather than a grey tint: it carries the same accent as the
          emphasised phrase below, and clears AA on white at 5:1 where the old
          45% black did not. */}
      <p
        className="animate-fade-up font-inter text-center font-semibold text-[#15803D]"
        style={{ fontSize: 'clamp(11px, 1vw, 13px)', letterSpacing: '0.22em' }}
      >
        WHO WE ARE
      </p>

      <div className="animate-fade-up mx-auto mt-10 flex max-w-5xl flex-col items-center text-center sm:mt-14">
        {/* One statement, set large with room to breathe — the emphasis is
            carried by a single phrase rather than by size alone. Solid ink
            rather than a clipped gradient, so nothing can ghost behind it. */}
        <p
          className="font-dm-sans text-[#111111]"
          style={{ fontSize: 'clamp(24px, 3.4vw, 46px)', letterSpacing: '-0.025em', lineHeight: 1.32 }}
        >
          Four businesses, one discipline: put the right technology in the right hands. Through
          retail counters, distribution centres, export desks and a storefront that never closes,
          we move computing, mobility and network infrastructure to{' '}
          <span className="font-bold text-[#15803D]">the people and institutions that run on them</span>
          {' '}— from the warehouse floor to the last mile.
        </p>

        <div ref={statsRef} className="mt-14 grid w-full max-w-5xl grid-cols-2 gap-x-8 gap-y-14 border-t border-black/10 pt-14 sm:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="flex flex-col items-center transition-all ease-out"
                style={{
                  opacity: revealed[i] ? 1 : 0,
                  transform: revealed[i] ? 'translateY(0)' : 'translateY(20px)',
                  transitionDuration: '600ms',
                }}
              >
                {/* The number leads. The mark shrinks to a small coloured
                    marker above it and the vertical name drops beneath, so
                    nothing in the column competes with the figure. */}
                <span
                  className="flex items-center justify-center rounded-full"
                  style={{ backgroundColor: stat.chip, color: stat.ink, height: 'clamp(38px, 3.6vw, 50px)', width: 'clamp(38px, 3.6vw, 50px)' }}
                >
                  <stat.icon style={{ height: 'clamp(20px, 2vw, 27px)', width: 'clamp(20px, 2vw, 27px)' }} />
                </span>
                <p
                  className="font-dm-sans mt-5 font-extrabold text-[#0A0A0A] tabular-nums"
                  style={{ fontSize: 'clamp(58px, 8.4vw, 116px)', letterSpacing: '-0.055em', lineHeight: 0.86 }}
                >
                  <StatValue raw={stat.value} active={revealed[i]} />
                </p>
                <p
                  className="font-dm-sans mt-4 font-bold uppercase"
                  style={{ color: stat.ink, letterSpacing: '0.11em', fontSize: 'clamp(12px, 1.15vw, 15px)' }}
                >
                  {stat.vertical}
                </p>
                <p
                  className="font-inter mt-1.5 text-center text-black/45"
                  style={{ letterSpacing: '-0.01em', fontSize: 'clamp(13px, 1.2vw, 16px)' }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
