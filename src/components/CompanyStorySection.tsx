import { useEffect, useRef, useState } from 'react';
import { nameHistory, offices, scaleStats } from '../data';

const founded = nameHistory[0];
const foundingYear = 1995;
const yearsInBusiness = new Date().getFullYear() - foundingYear;
const retailStores = scaleStats.find((s) => s.label === 'Retail stores')?.value ?? '52';

const stats = [
  { value: `${yearsInBusiness}`, label: 'Years in business' },
  { value: `${offices.length}`, label: 'Registered offices' },
  { value: retailStores, label: 'Retail stores' },
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
    <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-28">
      <div className="animate-fade-up mx-auto flex max-w-3xl flex-col items-center text-center">
        <p
          className="font-inter bg-gradient-to-r from-black to-[#15803D] bg-clip-text text-xs font-extrabold uppercase text-transparent"
          style={{ letterSpacing: '0.12em' }}
        >
          Since {foundingYear}
        </p>
        <h2
          className="font-dm-sans mt-4 bg-gradient-to-r from-black to-[#15803D] bg-clip-text font-extrabold text-transparent"
          style={{ fontSize: 'clamp(32px, 5vw, 56px)', letterSpacing: '-0.05em', lineHeight: 1.05 }}
        >
          Three decades of building India's technology supply chain
        </h2>
        <p
          className="font-inter mt-5 max-w-xl text-sm text-black/60 sm:text-base lg:text-lg"
          style={{ lineHeight: 1.5, letterSpacing: '-0.03em' }}
        >
          {founded.event} as {founded.name} on {founded.date} — {yearsInBusiness} years later, still delivering
          genuine hardware to enterprises and government offices across India.
        </p>

        <div
          ref={statsRef}
          className="mt-12 grid w-full max-w-lg grid-cols-3 gap-6 border-t border-black/10 pt-10"
        >
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
              <p
                className="font-dm-sans font-extrabold text-[#15803D] tabular-nums"
                style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.05em' }}
              >
                <StatValue raw={stat.value} active={revealed[i]} />
              </p>
              <p
                className="font-inter mt-2 text-xs text-black/50 sm:text-sm"
                style={{ letterSpacing: '-0.01em' }}
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
