import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Heart, Check } from 'lucide-react';
import { useShopStore } from '../store';
import { formatINR, products, type Product } from '../data';

function ProductTile({ product, i }: { product: Product; i: number }) {
  const { toggleWishlist, inWishlist, addToCart } = useShopStore();
  const [added, setAdded] = useState(false);
  const wished = inWishlist(product.id);
  const discount = product.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <div
      className="animate-fade-up group w-72 shrink-0 snap-start overflow-hidden rounded-lg border border-black/10 bg-white transition-shadow duration-300 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.25)]"
      style={{ animationDelay: `${0.08 * i}s` }}
    >
      <div className="relative overflow-hidden bg-[#ECEDEC]">
        <Link to={`/product/${product.id}`}>
          <motion.img
            layoutId={`product-photo-${product.id}`}
            src={product.image}
            alt={product.name}
            className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        {discount > 0 && (
          <span
            className="font-inter absolute left-3 top-3 rounded-full bg-black px-2.5 py-1 text-[11px] font-medium text-white"
            style={{ letterSpacing: '-0.02em' }}
          >
            {discount}% OFF
          </span>
        )}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label="Toggle wishlist"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-sm transition-opacity hover:opacity-70"
        >
          <Heart className="h-4 w-4" fill={wished ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="p-4">
        <p className="font-inter text-[11px] uppercase text-black/40" style={{ letterSpacing: '0.08em' }}>
          {product.brand}
        </p>
        <h3 className="font-dm-sans mt-1 line-clamp-1 text-lg text-black" style={{ letterSpacing: '-0.03em' }}>
          <Link to={`/product/${product.id}`} className="hover:opacity-60 transition-opacity">
            {product.name}
          </Link>
        </h3>

        <div className="mt-2 flex items-baseline gap-2">
          <p className="font-dm-sans text-2xl text-black" style={{ letterSpacing: '-0.04em' }}>
            {formatINR(product.price)}
          </p>
          {product.mrp && product.mrp > product.price && (
            <p className="font-inter text-sm text-black/35 line-through" style={{ letterSpacing: '-0.02em' }}>
              {formatINR(product.mrp)}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            addToCart(product.id);
            setAdded(true);
            setTimeout(() => setAdded(false), 1500);
          }}
          className="btn-liquid font-inter mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-md border-2 border-[#1f2a1d] font-medium text-[#1f2a1d] transition-colors"
          style={{ letterSpacing: '-0.03em', fontSize: '15px' }}
        >
          {added ? (
            <>
              Added <Check className="h-4 w-4" />
            </>
          ) : (
            <>
              Buy Now <ArrowUpRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function FeaturedProducts() {
  const featured = products.slice(0, 10);

  return (
    <section className="bg-[#FEFDF9] px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
      <div className="animate-fade-up flex items-end justify-between gap-4">
        <h2
          className="font-dm-sans font-normal text-black"
          style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.05em', lineHeight: 1.05 }}
        >
          Featured Products
        </h2>
        <Link
          to="/shop"
          className="font-inter hidden shrink-0 items-center gap-1 text-sm text-black hover:opacity-60 transition-opacity sm:flex lg:text-base"
          style={{ letterSpacing: '-0.03em' }}
        >
          View All
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="scrollbar-none mt-8 flex gap-5 overflow-x-auto pb-2 sm:mt-10 sm:gap-6">
        {featured.map((p, i) => (
          <ProductTile key={p.id} product={p} i={i} />
        ))}
      </div>
    </section>
  );
}
