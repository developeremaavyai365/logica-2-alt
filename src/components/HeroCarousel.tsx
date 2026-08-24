import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Slide {
  image: string;
  alt: string;
  ctaHref: string;
}

// Finished banner designs (copy/branding baked into the SVG) — swap the
// image or href here to change what's promoted, no extra text overlay
// needed since these are complete creatives.
const SLIDES: Slide[] = [
  { image: '/banners/iphone-17-pro.svg', alt: 'iPhone 17 Pro — shop now', ctaHref: '/shop?brand=Apple' },
  { image: '/banners/fold8.svg', alt: 'Samsung Galaxy Z Fold8 — shop now', ctaHref: '/shop?brand=Samsung' },
  { image: '/banners/pixel-11-pro.svg', alt: 'Google Pixel 11 Pro — shop now', ctaHref: '/shop/mobile-phones' },
  { image: '/banners/vivo-s2-banner.svg', alt: 'vivo S2 — shop now', ctaHref: '/shop?brand=Vivo' },
  { image: '/banners/rakhi-banner.svg', alt: 'Rakhi offers — shop now', ctaHref: '/shop' },
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
        <Link
          key={slide.image}
          to={slide.ctaHref}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? 'auto' : 'none' }}
          aria-label={slide.alt}
        >
          <img src={slide.image} alt={slide.alt} className="absolute inset-0 h-full w-full object-cover" />
        </Link>
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
