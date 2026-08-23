import { useEffect, useRef, useState } from 'react';
import { trustStrip } from '../data';

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
  return (
    <>
      {count}
      {match[2]}
    </>
  );
}

export default function TrustBand() {
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
    <section ref={sectionRef} className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
      <div className="grid grid-cols-2 gap-8 sm:gap-10 md:grid-cols-4">
        {trustStrip.map((stat, i) => (
          <div
            key={stat.label}
            className="transition-all ease-out"
            style={{
              opacity: revealed[i] ? 1 : 0,
              transform: revealed[i] ? 'translateY(0)' : 'translateY(20px)',
              transitionDuration: '600ms',
            }}
          >
            <p
              className="font-dm-sans font-extrabold text-[#15803D] tabular-nums"
              style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.05em' }}
            >
              <StatValue raw={stat.value} active={revealed[i]} />
            </p>
            <p className="font-inter mt-2 text-sm text-black/60 sm:text-base" style={{ letterSpacing: '-0.02em' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
