import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Truck, BadgePercent, Check } from 'lucide-react';
import { formatINR, type Product } from '../data';
import { useShopStore } from '../store';

type Props = {
  product: Product;
};

function mockRating(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const options = [3.5, 4, 4.5, 5];
  return options[hash % options.length];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <span key={i} className="relative inline-block h-3.5 w-3.5">
            <Star className="absolute inset-0 h-3.5 w-3.5 text-black/15" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            </span>
          </span>
        );
      })}
    </div>
  );
}

export default function ProductCard({ product }: Props) {
  const { toggleWishlist, inWishlist, addToCart } = useShopStore();
  const [added, setAdded] = useState(false);
  const wished = inWishlist(product.id);
  const discount = product.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const rating = product.rating ?? mockRating(product.id);

  return (
    <div className="group overflow-hidden rounded-lg border border-black/10 bg-white transition-shadow duration-300 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.25)]">
      <Link to={`/product/${product.id}`} className="relative block aspect-square overflow-hidden bg-white p-6">
        <motion.img
          layoutId={`product-photo-${product.id}`}
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="px-4 pb-4">
        <Link to={`/product/${product.id}`} className="hover:opacity-70 transition-opacity">
          <p className="font-inter line-clamp-2 text-sm text-black" style={{ letterSpacing: '-0.01em' }}>
            {product.name}
          </p>
        </Link>

        <div className="mt-1.5">
          <StarRating rating={rating} />
        </div>

        <div className="mt-1.5 flex flex-wrap items-baseline gap-1.5">
          <span className="font-dm-sans text-lg text-black" style={{ letterSpacing: '-0.03em' }}>
            {formatINR(product.price)}
          </span>
          {product.mrp && product.mrp > product.price && (
            <span className="font-inter text-xs text-black/40 line-through">MRP {formatINR(product.mrp)}</span>
          )}
          {discount > 0 && (
            <span className="font-inter rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white">
              {discount}% Off
            </span>
          )}
        </div>

        {discount > 0 && (
          <div className="font-inter mt-2 flex w-fit items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
            <BadgePercent className="h-3.5 w-3.5" />
            Extra Deals Available
          </div>
        )}

        {/* Shipping is worked out at checkout, so the card says that rather
            than promising free delivery. */}
        <div className="font-inter mt-2 flex items-center gap-1.5 text-xs text-black/50">
          <Truck className="h-3.5 w-3.5" />
          Delivery calculated at checkout
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-3">
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            aria-label="Toggle wishlist"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-black transition-colors hover:bg-[#ECEDEC]"
          >
            <Heart className="h-4 w-4" fill={wished ? 'currentColor' : 'none'} />
          </button>
          <button
            type="button"
            onClick={() => {
              addToCart(product.id);
              setAdded(true);
              setTimeout(() => setAdded(false), 1500);
            }}
            aria-label="Add to cart"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white transition-opacity hover:opacity-85"
          >
            {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
