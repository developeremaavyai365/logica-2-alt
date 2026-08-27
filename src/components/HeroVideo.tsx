import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

export default function HeroVideo() {
  return (
    <section className="relative aspect-[4/5] min-w-0 flex-1 overflow-hidden bg-black sm:aspect-[16/9] lg:aspect-[2.4/1]">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/logica-store-hero.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20" />

      <Link
        to="/shop"
        className="btn-liquid font-inter absolute bottom-8 left-4 z-10 inline-flex w-fit items-center gap-1 rounded-full border-2 border-white px-5 py-2.5 text-xs font-medium text-white transition-colors hover:text-black sm:bottom-12 sm:left-8 sm:px-6 sm:py-3 sm:text-sm lg:text-base"
        style={{ '--liquid': '#fff', '--liquid-ink': '#000000' } as CSSProperties}
      >
        Shop Now
      </Link>
    </section>
  );
}
