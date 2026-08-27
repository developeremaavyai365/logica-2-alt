import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  image: string;
  alt: string;
  ctaHref: string;
  ctaLabel: string;
  dark?: boolean;
}

// Homepage banner set plus real store photos — full-screen, auto-rotating.
const SLIDES: Slide[] = [
  { image: '/banners/rakhi-banner.svg', alt: 'Rakhi offers — shop now', ctaHref: '/shop', ctaLabel: 'Shop Now' },
  { image: '/images/store/storefront-1.jpg', alt: 'Logica Infoway Samsung store front', ctaHref: '/shop', ctaLabel: 'Shop Now', dark: true },
  { image: '/banners/iphone-17-pro.svg', alt: 'iPhone 17 Pro — shop now', ctaHref: '/shop?brand=Apple', ctaLabel: 'Shop Now' },
  { image: '/banners/fold8.svg', alt: 'Samsung Galaxy Z Fold8 — shop now', ctaHref: '/shop?brand=Samsung', ctaLabel: 'Shop Now' },
  { image: '/images/store/store-interior-1.jpg', alt: 'Logica Infoway Samsung store interior', ctaHref: '/shop', ctaLabel: 'Shop Now', dark: true },
  { image: '/banners/pixel-11-pro.svg', alt: 'Google Pixel 11 Pro — shop now', ctaHref: '/shop/mobile-phones', ctaLabel: 'Shop Now', dark: true },
  { image: '/banners/vivo-s2-banner.svg', alt: 'vivo S2 — shop now', ctaHref: '/shop?brand=Vivo', ctaLabel: 'Shop Now' },
  { image: '/images/store/storefront-2.jpg', alt: 'Logica Infoway Samsung store front', ctaHref: '/shop', ctaLabel: 'Shop Now', dark: true },
];

export default function ShopHeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-black" style={{ height: '100svh' }}>
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
            className={`btn-liquid font-inter absolute bottom-8 left-4 z-10 inline-flex w-fit items-center gap-1 rounded-full border-2 px-5 py-2.5 text-xs font-medium transition-colors sm:bottom-12 sm:left-8 sm:px-6 sm:py-3 sm:text-sm lg:text-base ${
              slide.dark ? 'border-white text-white hover:text-black' : 'border-black text-black hover:text-white'
            }`}
            style={
              slide.dark
                ? ({ '--liquid': '#fff', '--liquid-ink': '#000000' } as CSSProperties)
                : ({ '--liquid': '#000', '--liquid-ink': '#ffffff' } as CSSProperties)
            }
          >
            {slide.ctaLabel}
          </Link>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50 sm:left-5 sm:flex"
        style={{ height: '44px', width: '44px' }}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => setIndex((i) => (i + 1) % SLIDES.length)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50 sm:right-5 sm:flex"
        style={{ height: '44px', width: '44px' }}
      >
        <ChevronRight className="h-5 w-5" />
      </button>

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
