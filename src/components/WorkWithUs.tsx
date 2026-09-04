import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from '../use-in-view';

/* The photograph arrives in pieces and pulls itself together.

   Each tile carries the whole image as its background, sized to the full grid
   and offset to its own cell, so the tiles form one seamless photograph once
   they land — no slicing into separate files, and no seams to line up.

   Scattered, every tile is pushed out from the centre, turned and pulled
   back, which is what reads as broken rather than merely offset. The push is
   derived from the tile's own index rather than Math.random, so it is the
   same on every render and does not jump when React re-renders mid-flight. */
const PHOTO = '/images/work-with-us.jpg';
const COLS = 7;
const ROWS = 5;

type Tile = {
  key: string;
  left: string;
  top: string;
  backgroundPosition: string;
  scattered: string;
  delay: number;
};

function buildTiles(): Tile[] {
  const tiles: Tile[] = [];
  const cx = (COLS - 1) / 2;
  const cy = (ROWS - 1) / 2;
  const maxDist = Math.hypot(cx, cy);

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const i = row * COLS + col;
      // Deterministic stand-in for randomness: two incommensurable
      // frequencies, so neighbouring tiles get unrelated values and the
      // scatter never falls into a visible pattern.
      const n1 = Math.sin(i * 12.9898) * 43758.5453;
      const n2 = Math.sin(i * 78.233) * 12345.6789;
      const r1 = n1 - Math.floor(n1);
      const r2 = n2 - Math.floor(n2);

      // Thrown outward from the middle, further the further out it starts.
      const dx = col - cx;
      const dy = row - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const push = 34 + r1 * 46;
      const x = (dx / dist) * push + (r1 - 0.5) * 24;
      const y = (dy / dist) * push + (r2 - 0.5) * 24;

      tiles.push({
        key: `${row}-${col}`,
        left: `${(col * 100) / COLS}%`,
        top: `${(row * 100) / ROWS}%`,
        // Cells at the last row/column sit at 100%, which is what makes the
        // grid tile the image exactly rather than repeating a sliver.
        backgroundPosition: `${(col / (COLS - 1)) * 100}% ${(row / (ROWS - 1)) * 100}%`,
        scattered: `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${((r1 - 0.5) * 14).toFixed(2)}deg) scale(0.82)`,
        // Outer pieces land last, so the picture closes up from the middle.
        delay: Math.round((Math.hypot(dx, dy) / maxDist) * 260),
      });
    }
  }
  return tiles;
}

export default function WorkWithUs() {
  const [ref, inView] = useInView<HTMLElement>(0.25);
  const [hovered, setHovered] = useState(false);
  const tiles = useMemo(buildTiles, []);

  /* Hover is the trigger, but a touch screen never hovers — there the
     pieces come together as the section is reached instead, so the
     photograph is never left permanently in bits. Reduced motion skips the
     scatter altogether. */
  const assembled = useMemo(() => {
    if (typeof window === 'undefined') return true;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return true;
    if (!window.matchMedia?.('(hover: hover)').matches) return inView;
    return hovered;
  }, [hovered, inView]);

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-[#0A0A0A]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="absolute inset-0" aria-hidden="true">
        {tiles.map((tile) => (
          <span
            key={tile.key}
            className="absolute block will-change-transform"
            style={{
              width: `${100 / COLS}%`,
              height: `${100 / ROWS}%`,
              left: tile.left,
              top: tile.top,
              backgroundImage: `url(${PHOTO})`,
              backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
              backgroundPosition: tile.backgroundPosition,
              transform: assembled ? 'none' : tile.scattered,
              opacity: assembled ? 1 : 0.55,
              transition: `transform 900ms cubic-bezier(0.22, 1, 0.36, 1) ${tile.delay}ms, opacity 700ms ease ${tile.delay}ms`,
            }}
          />
        ))}
      </div>

      {/* One image element carrying the real alt text: the tiles above are
          decoration built from background images, which assistive tech
          cannot read. */}
      <img src={PHOTO} alt="The Logica Infoway team at work in the office" className="sr-only" />

      {/* Enough wash for the type to hold over the photograph. */}
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/75" />

      {/* svh rather than vh: on a phone, vh is the height with the browser
          chrome hidden, so a 100vh block sits taller than the screen and the
          button lands under the address bar until you scroll. */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-5 py-24 text-center sm:px-8 [min-height:100svh]">
        <h2
          className="font-dm-sans font-bold text-white"
          style={{ fontSize: 'clamp(28px, 3.6vw, 50px)', letterSpacing: '-0.03em', lineHeight: 1.04 }}
        >
          Grow with Logica Infoway
        </h2>

        <Link
          to="/careers"
          className="font-inter mt-10 rounded-full bg-white px-8 py-4 text-sm font-semibold text-[#0A0A0A] transition-colors duration-300 hover:bg-white/85 sm:mt-12"
        >
          Explore careers
        </Link>
      </div>
    </section>
  );
}
