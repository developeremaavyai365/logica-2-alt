import { useEffect, useRef, useState } from 'react';

/* The heading borrows the one thing that is unmistakably Logica's: the three
   diagonal bands that rise behind the wordmark in the registered logo. They
   sweep up from behind the name and lead the eye rightward into the mark
   itself, so the type and the logo read as one lockup rather than a heading
   with a picture beside it.

   Order of reveal: the name lands, the bands sweep up through it, then the
   logo resolves. An IntersectionObserver drives it, with a safety timer so a
   callback that never fires cannot leave the section blank. */
const REVEAL_FALLBACK = 2500;
const BANDS_DELAY = 420;
const LOGO_DELAY = 980;

const BANDS = [
  { color: '#5BC5F2', left: '4%', delay: '0ms' },
  { color: '#F5E31F', left: '26%', delay: '90ms' },
  { color: '#7DC242', left: '48%', delay: '180ms' },
];

export default function BrandMarkSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [nameIn, setNameIn] = useState(false);
  const [bandsIn, setBandsIn] = useState(false);
  const [logoIn, setLogoIn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const reveal = () => {
      setNameIn(true);
      timers.push(setTimeout(() => setBandsIn(true), BANDS_DELAY));
      timers.push(setTimeout(() => setLogoIn(true), LOGO_DELAY));
    };

    const fallback = setTimeout(reveal, REVEAL_FALLBACK);

    let observer: IntersectionObserver | undefined;
    if (el && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              clearTimeout(fallback);
              reveal();
            }
          });
        },
        { threshold: 0.3 },
      );
      observer.observe(el);
    }

    return () => {
      clearTimeout(fallback);
      timers.forEach(clearTimeout);
      observer?.disconnect();
    };
  }, []);

  return (
    <section className="overflow-hidden bg-white px-5 py-24 sm:px-8 sm:py-32 lg:px-10 lg:py-36">
      <div
        ref={ref}
        className="relative mx-auto flex max-w-6xl flex-col items-center justify-center gap-8 sm:flex-row sm:gap-[clamp(24px,4vw,64px)]"
      >
        {/* The bands rise behind the name at the angle they take in the logo */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {BANDS.map((b) => (
            <span
              key={b.color}
              className="absolute block transition-all ease-out"
              style={{
                left: b.left,
                bottom: '-40%',
                width: 'clamp(26px, 4.4vw, 62px)',
                height: '210%',
                backgroundColor: b.color,
                transform: bandsIn
                  ? 'rotate(38deg) translateY(0)'
                  : 'rotate(38deg) translateY(62%)',
                opacity: bandsIn ? 0.24 : 0,
                transformOrigin: 'bottom center',
                transitionDuration: '900ms',
                transitionDelay: b.delay,
              }}
            />
          ))}
        </div>

        {/* The whole name, one size and one weight */}
        <h2
          className="relative font-dm-sans text-center font-extrabold uppercase leading-[0.92] text-[#0A0A0A] transition-all ease-out sm:text-left"
          style={{
            fontSize: 'clamp(32px, 6.6vw, 96px)',
            letterSpacing: '-0.038em',
            opacity: nameIn ? 1 : 0,
            transform: nameIn ? 'translateY(0)' : 'translateY(22px)',
            transitionDuration: '820ms',
          }}
        >
          Logica Infoway
        </h2>

        {/* The registered mark, smaller, sitting to the right of the name */}
        <img
          src="/logica-trademark.png"
          alt="Logica registered trademark"
          className="relative h-auto w-full shrink-0 transition-all ease-out"
          style={{
            maxWidth: 'clamp(132px, 17vw, 224px)',
            opacity: logoIn ? 1 : 0,
            transform: logoIn ? 'translateX(0) scale(1)' : 'translateX(-14px) scale(0.92)',
            transitionDuration: '760ms',
          }}
        />
      </div>
    </section>
  );
}
