import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

export interface PromoSlide {
  image: string;
  headline: string;
  subtext: string;
  priceLine?: string;
  ctaLabel: string;
  ctaHref: string;
  tncNote?: string;
}

interface PromoCarouselBannerProps {
  slides: PromoSlide[];
  aspect?: string;
  autoRotateMs?: number;
}

export default function PromoCarouselBanner({ slides, aspect = '1300 / 340', autoRotateMs = 4500 }: PromoCarouselBannerProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), autoRotateMs);
    return () => window.clearInterval(id);
  }, [slides.length, autoRotateMs]);

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#ECEDEC] to-white" style={{ aspectRatio: aspect }}>
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 flex items-center justify-between px-6 transition-opacity duration-700 sm:px-10 lg:px-14"
          style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? 'auto' : 'none' }}
        >
          <div className="flex max-w-[55%] flex-col">
            <h3
              className="font-dm-sans font-normal text-black"
              style={{ fontSize: 'clamp(18px, 2.6vw, 36px)', letterSpacing: '-0.04em', lineHeight: 1.1 }}
            >
              {slide.headline}
            </h3>
            <p className="font-inter mt-2 text-black/70" style={{ fontSize: 'clamp(11px, 1.2vw, 16px)', letterSpacing: '-0.02em' }}>
              {slide.subtext}
            </p>
            {slide.priceLine && (
              <p
                className="font-dm-sans mt-2 text-black"
                style={{ fontSize: 'clamp(14px, 1.6vw, 22px)', letterSpacing: '-0.03em' }}
              >
                {slide.priceLine}
              </p>
            )}
            <Link
              to={slide.ctaHref}
              className="btn-liquid font-inter mt-4 flex h-9 w-fit items-center justify-center rounded-full border-2 border-black px-5 text-xs font-medium text-black transition-colors sm:h-11 sm:px-6 sm:text-sm"
              style={{ '--liquid': '#000000', '--liquid-ink': '#fff' } as CSSProperties}
            >
              {slide.ctaLabel}
            </Link>
          </div>

          <img src={slide.image} alt="" className="h-[70%] max-w-[42%] object-contain" />

          {slide.tncNote && (
            <span className="font-inter absolute bottom-3 right-4 text-[10px] text-black/40 sm:bottom-4 sm:text-xs">
              {slide.tncNote}
            </span>
          )}
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 sm:bottom-4">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-black/70' : 'w-1.5 bg-black/25'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
