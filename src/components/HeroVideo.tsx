import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

/* The hero: one film full-bleed, with the pitch over it on the left and a
   single line that changes in place beneath it.

   The rotating lines are the four the businesses section already runs under
   its photographs — one per vertical, in the same order — so the hero
   promises exactly what the page goes on to show, rather than inventing a
   second set of claims for the top of the site. */
const LINES = [
  'See it. Hold it. Take it home.',
  'The counter that never closes.',
  'Stocked closer to you.',
  'We do not stop at the border.',
];

const HOLD = 3200;
const FADE = 500;

export default function HeroVideo() {
  const [heroHeight, setHeroHeight] = useState('100dvh');
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(true);

  /* Fades out, swaps the words while invisible, fades back in — so the line
     changes in place rather than one line pushing the next along. */
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const id = window.setInterval(() => {
      setShown(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % LINES.length);
        setShown(true);
      }, FADE);
    }, HOLD);
    return () => window.clearInterval(id);
  }, []);

  // Fill exactly what's left below the header, so this is the first thing in
  // the viewport on load without a second header-height section beneath it.
  useEffect(() => {
    const measure = () => {
      const header = document.querySelector('nav');
      const headerH = header ? header.getBoundingClientRect().height : 0;
      setHeroHeight(`calc(100dvh - ${headerH}px)`);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <section
      className="relative min-w-0 flex-1 overflow-hidden bg-black"
      style={{ height: heroHeight }}
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/video/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Weighted to the left, where the type sits, so the right of the frame
          stays as clear as the film allows. */}
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />

      <div className="relative z-10 flex h-full items-center px-5 sm:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-6xl">
          <div className="max-w-2xl text-left">
            <h1
              className="font-dm-sans font-bold text-white"
              style={{ fontSize: 'clamp(30px, 4.4vw, 62px)', letterSpacing: '-0.035em', lineHeight: 1.06 }}
            >
              Four verticals.
              <br />
              One powerful ecosystem.
            </h1>

            {/* Reserves its own height so the block beneath never shifts as
                the lines swap — the tallest line at the narrowest column is
                two lines deep. */}
            <p
              className="font-inter mt-6 flex items-start text-white/85 sm:mt-8"
              style={{
                fontSize: 'clamp(16px, 1.6vw, 24px)',
                lineHeight: 1.4,
                minHeight: '2.8em',
                opacity: shown ? 1 : 0,
                transition: `opacity ${FADE}ms ease`,
              }}
            >
              {LINES[index]}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10">
              <Link
                to="/shop"
                className="font-inter rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#0A0A0A] transition-colors duration-300 hover:bg-white/85"
              >
                Shop Now
              </Link>
              <Link
                to="/about"
                className="font-inter rounded-full border-2 border-white/70 px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:border-white hover:bg-white hover:text-[#0A0A0A]"
              >
                About Logica
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
