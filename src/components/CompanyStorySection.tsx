import { useEffect, useRef, useState } from 'react';
import { Store, Warehouse, Ship, ShoppingCart } from 'lucide-react';

// Logica's four core verticals — mirrors the four quadrants of the collage
// image (retail store, warehousing, export/shipping, e-commerce).
const stats = [
  { vertical: 'Retail', value: '82+', label: 'Stores Pan India', icon: Store, chip: '#FDE8D8', ink: '#D2781E' },
  { vertical: 'Distribution', value: '5', label: 'Distribution Centres', icon: Warehouse, chip: '#DFF5E3', ink: '#15803D' },
  { vertical: 'Export', value: '7+', label: 'Countries Served', icon: Ship, chip: '#DCEBFF', ink: '#1D4ED8' },
  { vertical: 'E-commerce', value: '24/7', label: 'Nationwide Online Reach', icon: ShoppingCart, chip: '#EDE4FF', ink: '#6D28D9' },
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
  return (
    <>
      {count}
      {match[2]}
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
      <p
        className="animate-fade-up font-inter text-center text-black/45"
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
          {' '}— dependably, and at a price that makes sense.
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
                <span
                  className="flex items-center justify-center rounded-full"
                  style={{ backgroundColor: stat.chip, color: stat.ink, height: 'clamp(56px, 6vw, 84px)', width: 'clamp(56px, 6vw, 84px)' }}
                >
                  <stat.icon style={{ height: 'clamp(26px, 3vw, 40px)', width: 'clamp(26px, 3vw, 40px)' }} strokeWidth={2} />
                </span>
                <p
                  className="font-dm-sans mt-4 font-extrabold"
                  style={{ color: stat.ink, letterSpacing: '-0.02em', fontSize: 'clamp(18px, 2vw, 26px)' }}
                >
                  {stat.vertical}
                </p>
                <p
                  className="font-dm-sans mt-2 font-extrabold text-black tabular-nums"
                  style={{ fontSize: 'clamp(40px, 6vw, 64px)', letterSpacing: '-0.05em', lineHeight: 1 }}
                >
                  <StatValue raw={stat.value} active={revealed[i]} />
                </p>
                <p
                  className="font-inter mt-2 text-center text-black/50"
                  style={{ letterSpacing: '-0.01em', fontSize: 'clamp(14px, 1.4vw, 18px)' }}
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
