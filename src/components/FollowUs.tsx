import { useEffect, useRef, useState } from 'react';

const SLICE_COUNT = 50;
const SLICES = Array.from({ length: SLICE_COUNT }, (_, i) => i);

const SOCIALS = [
  { name: 'Instagram', src: '/social-instagram.png', href: 'https://instagram.com/easternlogicaofficial', fill: '#d6249f' },
  { name: 'Facebook', src: '/social-facebook.png', href: 'https://facebook.com/easternlogicaofficial', fill: '#3b5999' },
  { name: 'LinkedIn', src: '/social-linkedin.png', href: 'https://linkedin.com/company/easternlogicainfowayltd', fill: '#0077b5' },
];

export default function FollowUs() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState<boolean[]>(() => SOCIALS.map(() => false));

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
            setRevealed(SOCIALS.map(() => false));
            SOCIALS.forEach((_, i) => {
              timers.push(
                setTimeout(() => {
                  setRevealed((prev) => {
                    const next = [...prev];
                    next[i] = true;
                    return next;
                  });
                }, i * 180),
              );
            });
          } else {
            setRevealed(SOCIALS.map(() => false));
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
      className="relative w-full min-h-screen flex items-center overflow-hidden bg-[#1f2a1d] px-4 sm:px-6 md:px-10 py-24"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 45% at 80% 15%, rgba(133,171,139,0.16), transparent 65%), radial-gradient(50% 40% at 15% 85%, rgba(61,86,56,0.35), transparent 65%)',
        }}
      />

      <div className="relative w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Copy + social icons */}
        <div className="text-center lg:text-left">
          <span className="text-[#85AB8B] text-xs sm:text-sm font-semibold uppercase tracking-[0.28em]">Stay in the loop</span>
          <h2
            className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight text-white"
            style={{ letterSpacing: '-0.02em' }}
          >
            Follow Us
          </h2>
          <p className="mt-5 text-white/60 text-sm sm:text-base max-w-md mx-auto lg:mx-0">
            New arrivals, offers and behind-the-scenes from Logica Infoway — follow along on your
            platform of choice.
          </p>

          <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 sm:gap-8">
            {SOCIALS.map((social, i) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.name}
                className="group relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-[3px] border-white overflow-hidden flex items-center justify-center"
                style={{
                  opacity: revealed[i] ? 1 : 0,
                  transform: revealed[i] ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.7)',
                  transitionProperty: 'opacity, transform',
                  transitionDuration: '550ms',
                  transitionTimingFunction: 'cubic-bezier(0.2,0.7,0.2,1)',
                }}
              >
                {/* Fill that rises from the bottom on hover */}
                <span
                  className="absolute inset-0 top-full transition-all duration-500 group-hover:top-0"
                  style={{ background: social.fill }}
                />
                <img
                  src={social.src}
                  alt={social.name}
                  className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 object-contain transition-transform duration-500 group-hover:[transform:rotateY(360deg)]"
                />
              </a>
            ))}
          </div>
        </div>

        {/* 3D sliced-image phone turntable */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative mx-auto" style={{ perspective: '800px', width: 320, height: 507 }}>
            <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
              {SLICES.map((i) => (
                <div
                  key={i}
                  className="phone-turner-slice absolute left-0 w-full"
                  style={{
                    top: `${(i * 100) / SLICE_COUNT}%`,
                    height: `${100 / SLICE_COUNT}%`,
                    backgroundPosition: `0 -${i * 100}%`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
