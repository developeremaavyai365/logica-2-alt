import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export interface Highlight {
  src: string;
  title: string;
  date: string;
}

const INTERVAL_MS = 6000;

/** A large sliding showcase: one photo at a time, slowly zooming, with its
 *  caption on a glass panel and the previous / next buttons beside it. Moves
 *  on by itself and pauses while the pointer is over it. Clicking the photo
 *  opens it full screen. */
export default function HighlightsSlider({ slides, onOpen }: { slides: Highlight[]; onOpen: (index: number) => void }) {
  const reducedMotion = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  // Which way the last move went: only the slide coming in and the one going
  // out animate, so a slide repositioning off-screen never sweeps across.
  const [dir, setDir] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const autoplay = !reducedMotion && !paused && slides.length > 1;

  useEffect(() => {
    if (!autoplay) return;
    const id = setTimeout(() => {
      setDir(1);
      setActive((a) => (a + 1) % slides.length);
    }, INTERVAL_MS);
    return () => clearTimeout(id);
  }, [active, autoplay, slides.length]);

  const go = (step: 1 | -1) => {
    setDir(step);
    setActive((a) => (a + step + slides.length) % slides.length);
  };
  const current = slides[active];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Awards"
    >
      <div className="group relative isolate aspect-[4/5] overflow-hidden rounded-[28px] bg-[#061A40] shadow-[0_40px_80px_-30px_rgba(6,26,64,0.6)] sm:aspect-[16/9]">
        {slides.map((s, i) => {
          const offset = (i - active + slides.length) % slides.length;
          const on = offset === 0;
          // The next slide waits to the right, the rest to the left, so the
          // track always slides the same way.
          const x = on ? '0%' : offset === 1 ? '100%' : '-100%';
          const leaving = dir === 1 ? offset === slides.length - 1 : offset === 1;
          const animate = on || leaving;
          return (
            <button
              key={s.src}
              type="button"
              onClick={() => onOpen(i)}
              tabIndex={on ? 0 : -1}
              aria-hidden={!on}
              aria-label={`View ${s.title} full screen`}
              className={`absolute inset-0 block overflow-hidden ${
                animate ? 'transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]' : ''
              }`}
              style={{ transform: `translateX(${x})`, opacity: on ? 1 : 0.4, zIndex: on ? 2 : 1 }}
            >
              {/* Blurred copy behind, so photos of any shape fill the frame */}
              <img src={s.src} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl" />
              <img
                src={s.src}
                alt={s.title}
                className="relative h-full w-full object-contain"
                style={on && !reducedMotion ? { animation: `media-kenburns ${INTERVAL_MS + 1500}ms ease-out forwards` } : undefined}
              />
            </button>
          );
        })}

        {/* Shade for the caption */}
        <div className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-[#030B1F]/85 via-[#030B1F]/10 to-transparent" />

        {/* Caption */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] flex flex-col gap-5 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div key={active} className="max-w-xl motion-safe:animate-fade-up">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">
              {current?.date}
            </span>
            <h3
              className="mt-3 font-dm-sans font-bold text-white"
              style={{ fontSize: 'clamp(22px, 3vw, 38px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
            >
              {current?.title}
            </h3>
          </div>

          {/* Controls */}
          <div className="pointer-events-auto flex items-center gap-3">
            <span className="font-mono text-xs tabular-nums text-white/70">
              {String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous award"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/25"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next award"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/25"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* "Open" hint */}
        <span className="pointer-events-none absolute right-5 top-5 z-[4] flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
          <Maximize2 className="h-3.5 w-3.5" /> View
        </span>
      </div>

    </div>
  );
}
