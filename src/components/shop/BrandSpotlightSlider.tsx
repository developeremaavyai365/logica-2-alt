import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../../data';
import { brandLogoFor } from '../../shop-brand-logos';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface Slide {
  key: string;
  headline: string;
  brand: string;
  href: string;
  products: Product[];
  bg: string;
  /** Optional background video (muted/looped) instead of the flat `bg`
   *  color — used where a real product video file is available. */
  video?: string;
  /** For a `video` that is a whole film rather than a short loop: the slide
   *  holds until the film ends and then moves on, instead of advancing on
   *  the usual timer and cutting it off. */
  playThrough?: boolean;
  /** Optional Vimeo "background mode" embed URL (borderless, autoplay,
   *  muted, looped, no controls) — for slides whose video lives on Vimeo
   *  rather than as a local file. */
  vimeoEmbedUrl?: string;
}

const SLIDE_MS = 5000;

export default function BrandSpotlightSlider({
  slides,
  className = 'aspect-square',
}: {
  slides: Slide[];
  /** Sets the slider's shape (an aspect-ratio or height class) — the slider
   *  itself has no opinion about where on the page it sits. */
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const startRef = useRef<number>(0);
  const touchStartX = useRef<number | null>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    function onVisibility() {
      setPaused((p) => (document.hidden ? true : p));
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const active = paused || !inView || document.hidden || reducedMotion || slides.length <= 1;

  // A play-through film moves the slider on itself when it ends (see the
  // <video> below), so the timer stands down while one is showing.
  const filmPlaying = Boolean(slides[index]?.video && slides[index]?.playThrough && !reducedMotion);

  useEffect(() => {
    if (active || filmPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    startRef.current = performance.now();
    function tick(now: number) {
      const elapsed = now - startRef.current;
      const pct = Math.min(1, elapsed / SLIDE_MS);
      setProgress(pct);
      if (pct >= 1) {
        setIndex((i) => (i + 1) % slides.length);
        startRef.current = now;
        setProgress(0);
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, filmPlaying, index, slides.length]);

  function goTo(i: number) {
    setIndex(((i % slides.length) + slides.length) % slides.length);
    setProgress(0);
  }

  if (slides.length === 0) return null;
  const slide = slides[index];
  // The Vimeo embed is skipped entirely under reduced motion (nothing to
  // autoplay), so the text/CTA fallback still needs to show in that case —
  // only the local <video> (which still renders, just static) hides it.
  const isVideoSlide = Boolean(slide.video) || Boolean(slide.vimeoEmbedUrl && !reducedMotion);

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Brand spotlight"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current !== null) {
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
        }
        touchStartX.current = null;
        setPaused(false);
      }}
      className={`group relative overflow-hidden rounded-xl border border-shop-line transition-colors duration-500 ${className}`}
      style={{ background: slide.bg }}
    >
      {slide.video && (
        <>
          <video
            key={slide.video}
            src={slide.video}
            autoPlay={!reducedMotion}
            muted
            loop={!reducedMotion && !slide.playThrough}
            onEnded={() => {
              if (slide.playThrough && slides.length > 1) goTo(index + 1);
            }}
            playsInline
            preload={slide.playThrough ? 'metadata' : 'auto'}
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </>
      )}

      {slide.vimeoEmbedUrl && !reducedMotion && (
        <>
          {/* Vimeo's iframe doesn't crop-to-fill on its own the way a real
              <video> with object-cover does — sizing it oversized (200% in
              both axes) and centering it is the standard trick to make an
              embedded, unknown-aspect-ratio video truly fill the box with
              no letterbox gap, same end result as the local Z Fold video. */}
          <iframe
            key={slide.vimeoEmbedUrl}
            src={slide.vimeoEmbedUrl}
            title={`${slide.brand} video`}
            aria-hidden="true"
            tabIndex={-1}
            allow="autoplay; fullscreen; picture-in-picture"
            className="pointer-events-none absolute left-1/2 top-1/2 w-[200%] max-w-none -translate-x-1/2 -translate-y-1/2 border-0"
            style={{ height: '200%', objectFit: 'cover' }}
          />
        </>
      )}

      {/* Story-style progress segments — hidden on video slides so nothing
          overlays the video itself. */}
      {!isVideoSlide && (
        <div className="absolute inset-x-4 top-4 z-10 flex gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1} of ${slides.length}`}
              className="h-1 flex-1 overflow-hidden rounded-full bg-white/25"
            >
              <span
                className="block h-full bg-white"
                style={{
                  width: i < index ? '100%' : i === index ? `${progress * 100}%` : '0%',
                  transition: i === index && !active ? 'none' : 'width 0.2s',
                }}
              />
            </button>
          ))}
        </div>
      )}

      {!isVideoSlide && (
        <div
          key={slide.key}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${slides.length}`}
          className={`flex h-full flex-col justify-between p-5 pt-9 ${reducedMotion ? '' : 'animate-fade-in'}`}
        >
          <div>
            {brandLogoFor(slide.brand) ? (
              <img src={brandLogoFor(slide.brand)} alt={slide.brand} className="h-6 object-contain brightness-0 invert" />
            ) : (
              <span className="font-dm-sans text-sm font-bold uppercase tracking-wide text-white">{slide.brand}</span>
            )}
            <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl" style={{ letterSpacing: '-0.02em' }}>
              {slide.headline}
            </h3>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="flex -space-x-4">
              {slide.products.slice(0, 3).map((p, i) => (
                <img
                  key={p.id}
                  src={p.image}
                  alt=""
                  loading="lazy"
                  className="h-16 w-16 shrink-0 rounded-lg bg-white/90 object-contain p-1.5 shadow-lg sm:h-20 sm:w-20"
                  style={{ zIndex: 3 - i }}
                />
              ))}
            </div>
            <Link
              to={slide.href}
              className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold text-shop-ink transition-transform group-hover:translate-x-0.5"
            >
              Shop {slide.brand} →
            </Link>
          </div>
        </div>
      )}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-0 max-sm:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-0 max-sm:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}

export type { Slide as BrandSlide };
