import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

interface Slide {
  image: string;
  eyebrow: string;
  headline: string;
  ctaLabel: string;
  ctaHref: string;
}

const SLIDES: Slide[] = [
  { image: '/lifestyle/laptops.jpg', eyebrow: 'New Arrival', headline: 'The Power of Next-Gen Tech for Everyone', ctaLabel: 'Shop Now', ctaHref: '/shop' },
  { image: '/lifestyle/mobile-phones.jpg', eyebrow: 'Flagship Deals', headline: 'Enterprise Pricing Across India', ctaLabel: 'Shop Mobile Phones', ctaHref: '/shop/mobile-phones' },
  { image: '/lifestyle/desktops.jpg', eyebrow: 'Trusted Since 1995', headline: 'Three Decades of Proven Delivery', ctaLabel: 'Shop Desktops', ctaHref: '/shop/desktops' },
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
          <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
          <div className="relative flex h-full flex-col justify-center px-6 sm:px-10 lg:px-20">
            <p className="font-inter text-sm uppercase text-white/70 sm:text-base" style={{ letterSpacing: '0.12em' }}>
              {slide.eyebrow}
            </p>
            <h1
              className="font-dm-sans mt-3 max-w-xl font-normal text-white"
              style={{ fontSize: 'clamp(28px, 5vw, 64px)', letterSpacing: '-0.04em', lineHeight: 1.05 }}
            >
              {slide.headline}
            </h1>
            <Link
              to={slide.ctaHref}
              className="btn-liquid font-inter mt-6 inline-flex w-fit items-center gap-1 rounded-full border-2 border-white px-6 py-3 text-sm font-medium text-white transition-colors sm:text-base"
              style={{ '--liquid': '#fff', '--liquid-ink': '#000000' } as CSSProperties}
            >
              {slide.ctaLabel}
            </Link>
          </div>
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
