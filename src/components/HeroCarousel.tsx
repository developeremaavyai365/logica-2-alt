import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

interface Slide {
  image: string;
  alt: string;
  ctaHref: string;
  ctaLabel: string;
  /** Dark banner background → use a light/white liquid button. */
  dark?: boolean;
}

// Finished banner designs (copy/branding baked into the SVG) — swap the
// image or href here to change what's promoted, no extra text overlay
// needed since these are complete creatives. Rakhi banner is kept first
// so it's the default/opening slide.
const SLIDES: Slide[] = [
  { image: '/banners/rakhi-banner.svg', alt: 'Rakhi offers — shop now', ctaHref: '/shop', ctaLabel: 'Shop Now' },
  { image: '/banners/iphone-17-pro.svg', alt: 'iPhone 17 Pro — shop now', ctaHref: '/shop?brand=Apple', ctaLabel: 'Shop Now' },
  { image: '/banners/fold8.svg', alt: 'Samsung Galaxy Z Fold8 — shop now', ctaHref: '/shop?brand=Samsung', ctaLabel: 'Shop Now' },
  { image: '/banners/pixel-11-pro.svg', alt: 'Google Pixel 11 Pro — shop now', ctaHref: '/shop/mobile-phones', ctaLabel: 'Shop Now', dark: true },
  { image: '/banners/vivo-s2-banner.svg', alt: 'vivo S2 — shop now', ctaHref: '/shop?brand=Vivo', ctaLabel: 'Shop Now' },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 4500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="relative aspect-[4/5] min-w-0 flex-1 overflow-hidden bg-black sm:aspect-[16/9] lg:aspect-[2.4/1]">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.image}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? 'auto' : 'none' }}
        >
          <Link to={slide.ctaHref} className="absolute inset-0" aria-label={slide.alt}>
            <img src={slide.image} alt={slide.alt} className="absolute inset-0 h-full w-full object-cover" />
          </Link>
          <Link
            to={slide.ctaHref}
            className="btn-liquid font-inter absolute bottom-8 left-4 z-10 inline-flex w-fit items-center gap-1 rounded-full border-2 px-5 py-2.5 text-xs font-medium transition-colors sm:bottom-12 sm:left-8 sm:px-6 sm:py-3 sm:text-sm lg:text-base"
            style={
              slide.dark
                ? ({ '--liquid': '#fff', '--liquid-ink': '#000000', borderColor: '#fff', color: '#fff' } as CSSProperties)
                : ({ '--liquid': '#000', '--liquid-ink': '#ffffff', borderColor: '#000', color: '#000' } as CSSProperties)
            }
          >
            {slide.ctaLabel}
          </Link>
        </div>
      ))}

      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-5">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.image}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
          />
        ))}
      </div>
    </section>
  );
}
