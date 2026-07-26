import { useEffect, useRef, useState } from 'react';
import { trustStrip } from '../data';

const DURATION = 1300;
const STAGGER = 350;

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
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

  if (!match) {
    return <>{raw}</>;
  }
  return (
    <>
      {count}
      {match[2]}
    </>
  );
}

export default function StatsCounter() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState<boolean[]>(() => trustStrip.map(() => false));

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let timers: ReturnType<typeof setTimeout>[] = [];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          timers.forEach(clearTimeout);
          timers = [];

          if (entry.isIntersecting) {
            // Replay the stagger fresh every time the section comes into view.
            setRevealed(trustStrip.map(() => false));
            trustStrip.forEach((_, i) => {
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
            setRevealed(trustStrip.map(() => false));
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
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#1f2a1d] px-4 sm:px-6 md:px-10 py-24"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 20% 20%, rgba(133,171,139,0.15), transparent 65%), radial-gradient(55% 45% at 85% 80%, rgba(61,86,56,0.35), transparent 65%)',
        }}
      />

      <div className="relative w-full max-w-6xl mx-auto text-center">
        <span className="text-[#85AB8B] text-xs sm:text-sm font-semibold uppercase tracking-[0.28em]">By the numbers</span>
        <h2
          className="mt-4 text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight text-white max-w-3xl mx-auto"
          style={{ letterSpacing: '-0.02em' }}
        >
          Built on trust, not just transactions
        </h2>
        <p className="mt-5 text-white/60 text-sm sm:text-base max-w-xl mx-auto">
          Three decades of corporate and government procurement, backed by real scale across the
          country.
        </p>

        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {trustStrip.map((stat, i) => (
            <div
              key={stat.label}
              className="relative transition-all ease-out"
              style={{
                opacity: revealed[i] ? 1 : 0,
                transform: revealed[i] ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.92)',
                transitionDuration: '600ms',
              }}
            >
              {/* Divider that draws in alongside the card */}
              <div
                className="absolute -top-6 left-1/2 -translate-x-1/2 h-px bg-[#85AB8B] transition-all duration-500"
                style={{ width: revealed[i] ? '2.5rem' : '0rem' }}
              />
              <div className="text-4xl sm:text-6xl md:text-7xl font-bold text-white tabular-nums" style={{ letterSpacing: '-0.03em' }}>
                <StatValue raw={stat.value} active={revealed[i]} />
              </div>
              <p className="mt-3 text-xs sm:text-sm text-white/60 leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
