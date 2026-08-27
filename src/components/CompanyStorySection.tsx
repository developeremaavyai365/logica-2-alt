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

// Same four verticals as the stats grid below, colored to match — cycles
// in place inside the heading in place of a static "retail".
const VERTICAL_WORDS = [
  { word: 'retail', color: '#D2781E' },
  { word: 'distribution', color: '#15803D' },
  { word: 'export', color: '#1D4ED8' },
  { word: 'e-commerce', color: '#6D28D9' },
];
const ROTATE_INTERVAL = 2200;
const ROTATE_TRANSITION = 300;

function RotatingVertical() {
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setI((prev) => (prev + 1) % VERTICAL_WORDS.length);
        setVisible(true);
      }, ROTATE_TRANSITION);
    }, ROTATE_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const current = VERTICAL_WORDS[i];
  return (
    <span
      className="inline-block transition-all ease-out"
      style={{
        color: current.color,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-10px)',
        transitionDuration: `${ROTATE_TRANSITION}ms`,
      }}
    >
      {current.word}
    </span>
  );
}

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
    <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-28">
      <h2
        className="animate-fade-up font-dm-sans mx-auto max-w-6xl text-center font-extrabold uppercase"
        style={{ fontSize: 'clamp(44px, 7vw, 84px)', letterSpacing: '-0.03em', lineHeight: 1, color: '#D2781E' }}
      >
        Who We Are
      </h2>

      <div className="animate-fade-up mx-auto mt-12 grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative mx-auto aspect-square w-full max-w-lg">
          <div className="absolute inset-0 rounded-full border-[6px] border-[#D2781E] p-2">
            <img
              src="/images/company-collage.png"
              alt="Logica Infoway — retail stores, warehousing, logistics and e-commerce"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col text-left">
          <p
            className="font-dm-sans mt-4 font-extrabold"
            style={{ fontSize: 'clamp(22px, 3.2vw, 36px)', letterSpacing: '-0.04em', lineHeight: 1.1, color: '#D2781E' }}
          >
            From <RotatingVertical />
            <br />
            shelves to global markets, we deliver technology where it matters most.
          </p>

          <div ref={statsRef} className="mt-10 grid w-full grid-cols-2 gap-6 border-t border-black/10 pt-10 sm:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="transition-all ease-out"
                style={{
                  opacity: revealed[i] ? 1 : 0,
                  transform: revealed[i] ? 'translateY(0)' : 'translateY(20px)',
                  transitionDuration: '600ms',
                }}
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full"
                  style={{ backgroundColor: stat.chip, color: stat.ink }}
                >
                  <stat.icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
                </span>
                <p className="font-dm-sans mt-2 text-sm font-extrabold" style={{ color: stat.ink, letterSpacing: '-0.02em' }}>
                  {stat.vertical}
                </p>
                <p
                  className="font-dm-sans mt-1 font-extrabold text-black tabular-nums"
                  style={{ fontSize: 'clamp(20px, 2.6vw, 28px)', letterSpacing: '-0.05em' }}
                >
                  <StatValue raw={stat.value} active={revealed[i]} />
                </p>
                <p className="font-inter mt-1 text-xs text-black/50 sm:text-sm" style={{ letterSpacing: '-0.01em' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
