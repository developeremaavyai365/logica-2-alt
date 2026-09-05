import { useEffect, useState } from 'react';
import { useInView } from '../use-in-view';

/* Four figures, set the way the Trent reference sets them: the number in
   black, one line of copy beneath it, no icon and no colour anywhere.

   The vertical each figure belongs to is carried inside its own line rather
   than sitting above it as a coloured label, so nothing is lost by dropping
   the second line — and the figures stay the same ones the Logica Infoway
   captions further down publish, so the two blocks cannot end up quoting
   different numbers for the same vertical. */
const stats = [
  { value: '90+', label: 'Retail stores pan India' },
  { value: '11+', label: 'Distribution centres, reaching further every year' },
  { value: '15+', label: 'Countries served through export' },
  { value: '24/7', label: 'E-commerce open around the clock' },
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

  /* A "+" is a modifier on the number, so it rides smaller and raised and
     never competes with the digits for size. Anything else is part of the
     figure itself — "24/7" is read as one thing, and shrinking the 7 made it
     look like a footnote rather than half the number — so it sets at full
     size inline. */
  const suffix = match[2];
  return (
    <>
      {count}
      {suffix === '+' ? (
        <span style={{ fontSize: '0.44em', verticalAlign: '0.55em', letterSpacing: '-0.01em' }}>
          {suffix}
        </span>
      ) : (
        suffix
      )}
    </>
  );
}

/* The four counting stats, previously the foot of the Who We Are statement.
   Moved to its own section below the Logica Infoway verticals.

   Runs on the shared useInView rather than an observer of its own: that hook
   only drops out of view once the block is completely gone, where a bare
   `isIntersecting` against a ratio would reset the figures back to zero while
   they were still on screen. */
export default function StatsSection() {
  const [statsRef, inView] = useInView<HTMLDivElement>(0.4);
  const [revealed, setRevealed] = useState<boolean[]>(() => stats.map(() => false));

  useEffect(() => {
    if (!inView) {
      // Reset so it's ready to animate in again on the next entry.
      setRevealed(stats.map(() => false));
      return;
    }

    // Replay the stagger fresh every time the section comes into view.
    setRevealed(stats.map(() => false));
    const timers = stats.map((_, i) =>
      setTimeout(() => {
        setRevealed((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * STAGGER),
    );
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <section className="bg-white px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
      <div
        ref={statsRef}
        className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-x-8 gap-y-14 sm:grid-cols-4"
      >
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
            <p
              className="font-dm-sans font-extrabold text-[#0A0A0A] tabular-nums"
              style={{ fontSize: 'clamp(38px, 4.4vw, 62px)', letterSpacing: '-0.055em', lineHeight: 0.9 }}
            >
              <StatValue raw={stat.value} active={revealed[i]} />
            </p>
            <p
              className="font-inter mt-4 max-w-[22ch] text-center text-[#0A0A0A]"
              style={{ letterSpacing: '-0.01em', fontSize: 'clamp(13px, 1vw, 15px)', lineHeight: 1.5, textWrap: 'pretty' }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
