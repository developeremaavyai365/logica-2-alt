import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import ProductCard from './ProductCard';
import type { Product } from '../data';

interface ProductCarouselProps {
  title: string;
  products: Product[];
  viewAllHref?: string;
  /** Kept for call-site compatibility — the section background is always
   *  white now, this no longer changes anything. */
  tone?: 'light' | 'cream';
}

export default function ProductCarousel({ title, products, viewAllHref = '/shop' }: ProductCarouselProps) {
  if (products.length === 0) return null;

  return (
    <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
      <div className="animate-fade-up flex items-end justify-between gap-4">
        <h2
          className="font-dm-sans font-medium text-black"
          style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.05em', lineHeight: 1.05 }}
        >
          {title}
        </h2>
        <Link
          to={viewAllHref}
          className="font-inter hidden shrink-0 items-center gap-1 text-sm text-black hover:opacity-60 transition-opacity sm:flex lg:text-base"
          style={{ letterSpacing: '-0.03em' }}
        >
          View All
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="scrollbar-none mt-8 flex gap-5 overflow-x-auto pb-2 sm:mt-10 sm:gap-6">
        {products.map((p, i) => (
          <div key={p.id} className="animate-fade-up w-72 shrink-0 snap-start" style={{ animationDelay: `${0.08 * i}s` }}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
