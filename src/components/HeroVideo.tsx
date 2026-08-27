import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  image: string;
  alt: string;
}

// Real photos of the physical Logica Infoway Samsung store, auto-rotating
// on the homepage hero.
const SLIDES: Slide[] = [
  { image: '/images/store/storefront-2.jpg', alt: 'Logica Infoway Samsung store front' },
  { image: '/images/store/storefront-1.jpg', alt: 'Logica Infoway Samsung store front' },
  { image: '/images/store/store-interior-1.jpg', alt: 'Logica Infoway Samsung store interior' },
];

export default function HeroVideo() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 4000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="relative aspect-[4/5] min-w-0 flex-1 overflow-hidden bg-black sm:aspect-[16/9] lg:aspect-[2.4/1]">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.image}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          <img src={slide.image} alt={slide.alt} className="absolute inset-0 h-full w-full object-cover" />
        </div>
      ))}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20" />

      <Link
        to="/shop"
        className="btn-liquid font-inter absolute bottom-8 left-4 z-10 inline-flex w-fit items-center gap-1 rounded-full border-2 border-white px-5 py-2.5 text-xs font-medium text-white transition-colors hover:text-black sm:bottom-12 sm:left-8 sm:px-6 sm:py-3 sm:text-sm lg:text-base"
        style={{ '--liquid': '#fff', '--liquid-ink': '#000000' } as CSSProperties}
      >
        Shop Now
      </Link>

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

      <div className="absolute bottom-3 right-4 z-10 flex gap-2 sm:bottom-5 sm:right-8">
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
