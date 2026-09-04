import { useEffect, useState } from 'react';

/* The hero: the film full-bleed, the pitch set left over it, with the last
   word of the heading changing in place.

   Left is where the type goes because that is where the frame is empty — the
   laptop sits centre-right through the whole clip and the left third stays
   dark, so the words never fight the subject.

   The rotating words are the places this company actually sells into, each
   one already named elsewhere on the site: hands is its own phrase for what
   it does, homes and counters are the retail business, offices and
   classrooms are the corporate and educational order desks. */
const LEAD = 'in the right';
const WORDS = ['hands', 'homes', 'offices', 'classrooms', 'counters'];

// Reserved from the longest word, so the line never reflows as they swap.
const WORD_WIDTH = `${Math.max(...WORDS.map((w) => w.length))}ch`;

const HOLD = 2200;
const FADE = 420;

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
        setIndex((i) => (i + 1) % WORDS.length);
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
              style={{ fontSize: 'clamp(32px, 4.8vw, 68px)', letterSpacing: '-0.035em', lineHeight: 1.04 }}
            >
              The right technology,
              <br />
              {LEAD}{' '}
              <span
                className="inline-block align-baseline"
                style={{
                  color: '#F0872B',
                  minWidth: WORD_WIDTH,
                  opacity: shown ? 1 : 0,
                  transform: shown ? 'translateY(0)' : 'translateY(8px)',
                  transition: `opacity ${FADE}ms ease, transform ${FADE}ms ease`,
                }}
              >
                {WORDS[index]}
              </span>
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}
