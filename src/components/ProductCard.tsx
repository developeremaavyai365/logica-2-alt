import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Check } from 'lucide-react';
import { formatINR, type Product } from '../data';
import { useShopStore } from '../store';
import { baseName } from '../product-colours';

type Props = {
  product: Product;
};

/** Built from four modules divided by hairlines — a header strip (brand +
 *  wishlist), the image tile, the details, and an action row — the same
 *  card language as the deal, banner and Top 5 cards on the shop page. The
 *  action row is always visible rather than appearing on hover, so it works
 *  the same on touch and needs no separate mobile button. */
export default function ProductCard({ product }: Props) {
  const { toggleWishlist, inWishlist, addToCart } = useShopStore();
  const [added, setAdded] = useState(false);
  const wished = inWishlist(product.id);
  const hasDiscount = Boolean(product.mrp && product.mrp > product.price);
  const discount = hasDiscount ? Math.round(((product.mrp! - product.price) / product.mrp!) * 100) : 0;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-shop-line bg-white transition-all duration-300 ease-out hover:border-shop-ink/30 hover:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.35)] motion-safe:hover:-translate-y-1">
      {/* Module — image tile, with the wishlist heart on its corner. The
          heart is a sibling of the link, not inside it, so it never opens the
          product. */}
      <div className="relative">
      <Link to={`/product/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-shop-canvas p-6">
        <motion.img
          layoutId={`product-photo-${product.id}`}
          src={product.image}
          alt={baseName(product)}
          loading="lazy"
          className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />

        {discount > 0 && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-shop-accent px-2 py-1 font-mono text-[11px] font-bold tabular-nums leading-none text-white">
            −{discount}%
          </span>
        )}
      </Link>
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label="Toggle wishlist"
          aria-pressed={wished}
          className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-colors ${
            wished
              ? 'border-shop-accent bg-shop-accent text-white'
              : 'border-shop-line bg-white/90 text-shop-ink hover:border-shop-ink/40'
          }`}
        >
          <Heart className="h-3.5 w-3.5" fill={wished ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Module — details */}
      <div className="flex-1 border-t border-shop-line px-3.5 py-3">
        <Link to={`/product/${product.id}`} className="transition-opacity hover:opacity-70">
          <p className="line-clamp-2 text-sm font-medium text-shop-ink" style={{ letterSpacing: '-0.01em' }}>
            {baseName(product)}
          </p>
        </Link>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-dm-sans text-lg font-semibold tabular-nums text-shop-ink" style={{ letterSpacing: '-0.03em' }}>
            {formatINR(product.price)}
          </span>
          {hasDiscount && (
            <span className="font-inter text-xs tabular-nums text-shop-ink/40 line-through">{formatINR(product.mrp!)}</span>
          )}
        </div>
      </div>

      {/* Module — action row */}
      <button
        type="button"
        onClick={() => {
          addToCart(product.id);
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
        disabled={!product.inStock}
        className="flex items-center justify-center gap-1.5 border-t border-shop-line px-3.5 py-2.5 text-xs font-semibold text-shop-ink transition-colors duration-300 hover:bg-shop-ink hover:text-white disabled:cursor-not-allowed disabled:bg-shop-canvas disabled:text-shop-ink/40"
      >
        {product.inStock ? (
          <>
            {added ? <Check className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
            {added ? 'Added' : 'Add to cart'}
          </>
        ) : (
          'Out of stock'
        )}
      </button>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-shop-line bg-white">
      <div className="border-b border-shop-line px-3.5 py-3">
        <div className="h-3 w-1/3 animate-pulse rounded bg-shop-canvas" />
      </div>
      <div className="aspect-[4/3] animate-pulse bg-shop-canvas" />
      <div className="space-y-2 border-t border-shop-line px-3.5 py-3">
        <div className="h-4 w-full animate-pulse rounded bg-shop-canvas" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-shop-canvas" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-shop-canvas" />
      </div>
      <div className="border-t border-shop-line px-3.5 py-3">
        <div className="mx-auto h-3 w-1/2 animate-pulse rounded bg-shop-canvas" />
      </div>
    </div>
  );
}
