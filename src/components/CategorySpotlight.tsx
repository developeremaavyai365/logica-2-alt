import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Star, Zap } from 'lucide-react';
import { formatINR, type Product } from '../data';

interface CategorySpotlightProps {
  title: string;
  description: string;
  emiNote?: string;
  viewAllHref: string;
  products: Product[];
}

function SpotlightCard({ product }: { product: Product }) {
  const discount = product.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex w-[300px] shrink-0 flex-col sm:w-[380px] lg:w-[440px]"
    >
      <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg bg-[#ECEDEC]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain p-8 transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <p className="font-inter mt-4 line-clamp-2 text-sm text-black sm:text-base" style={{ letterSpacing: '-0.01em' }}>
        {product.name}
      </p>

      <div className="mt-2 flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="font-dm-sans text-xl text-black sm:text-2xl" style={{ letterSpacing: '-0.03em' }}>
          {formatINR(product.price)}
        </span>
        {product.mrp && product.mrp > product.price && (
          <span className="font-inter text-sm text-black/40 line-through">MRP {formatINR(product.mrp)}</span>
        )}
        {discount > 0 && (
          <span className="font-inter rounded bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
            {discount}% Off
          </span>
        )}
      </div>
    </Link>
  );
}

export default function CategorySpotlight({ title, description, emiNote, viewAllHref, products }: CategorySpotlightProps) {
  if (products.length === 0) return null;

  return (
    <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
      <div className="mx-auto flex max-w-6xl gap-8 lg:gap-12">
        <div className="hidden w-[260px] shrink-0 flex-col lg:flex">
          <h2
            className="font-dm-sans bg-gradient-to-r from-black to-[#15803D] bg-clip-text font-extrabold text-transparent"
            style={{ fontSize: 'clamp(26px, 3vw, 34px)', letterSpacing: '-0.04em', lineHeight: 1.15 }}
          >
            {title}
          </h2>
          <p className="font-inter mt-4 text-sm text-black/70" style={{ letterSpacing: '-0.01em', lineHeight: 1.6 }}>
            {description}
          </p>

          {emiNote && (
            <>
              <div className="mt-6 border-t border-black/15" />
              <div className="mt-4 flex items-center gap-2">
                <Zap className="h-5 w-5 shrink-0 fill-red-600 text-red-600" />
                <span className="font-inter text-sm font-semibold text-black">{emiNote}</span>
              </div>
            </>
          )}

          <Link
            to={viewAllHref}
            className="btn-liquid font-inter mt-8 flex h-11 w-fit items-center justify-center rounded-full border-2 border-black px-6 text-sm font-medium text-black transition-colors"
            style={{ '--liquid': '#000000', '--liquid-ink': '#fff' } as CSSProperties}
          >
            View All
          </Link>
        </div>

        <div className="flex w-full flex-col lg:hidden">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-dm-sans bg-gradient-to-r from-black to-[#15803D] bg-clip-text font-extrabold text-transparent" style={{ fontSize: 'clamp(24px, 4vw, 32px)', letterSpacing: '-0.04em' }}>
              {title}
            </h2>
            <Link to={viewAllHref} className="font-inter shrink-0 text-sm text-black hover:opacity-60" style={{ letterSpacing: '-0.02em' }}>
              View All
            </Link>
          </div>
          <div className="scrollbar-none mt-6 flex gap-5 overflow-x-auto pb-2">
            {products.map((p) => (
              <SpotlightCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        <div className="scrollbar-none hidden flex-1 gap-6 overflow-x-auto pb-2 lg:flex">
          {products.map((p) => (
            <SpotlightCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
