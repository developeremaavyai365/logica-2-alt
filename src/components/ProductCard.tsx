import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import { formatINR, type Product } from '../data';
import { useShopStore } from '../store';

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const { toggleWishlist, inWishlist } = useShopStore();
  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;
  const wished = inWishlist(product.id);

  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative rounded-2xl border border-[#000000]/10 bg-white overflow-hidden transition-shadow duration-300 hover:shadow-lg block"
    >
      {/* Image block with soft green promo backdrop */}
      <div className="relative w-full aspect-square overflow-hidden" style={{ background: 'linear-gradient(160deg, #eef6ec 0%, #d9ead5 100%)' }}>
        {discount > 0 && (
          <span className="absolute top-3 left-3 z-10 bg-[#000000] text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
            {discount}% OFF
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          aria-label="Toggle wishlist"
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            wished ? 'bg-[#000000] text-white' : 'bg-white/90 text-[#000000] hover:bg-white'
          }`}
        >
          <Heart className="w-3.5 h-3.5" fill={wished ? 'currentColor' : 'none'} />
        </button>
        <motion.img
          layoutId={`product-photo-${product.id}`}
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain p-4 mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
        />
        {/* Hover-reveal Shop Now bar */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-[#000000] text-white text-xs font-semibold uppercase tracking-wide py-2.5 flex items-center justify-center gap-1.5">
          Shop Now
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Info block */}
      <div className="p-4 sm:p-5">
        <span className="text-[11px] font-medium text-[#1f6fa8] uppercase tracking-wide">{product.brand}</span>
        <h3 className="mt-1 text-sm font-semibold text-[#000000] leading-snug line-clamp-2">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-base font-bold text-[#000000]">{formatINR(product.price)}</span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-xs text-[#6b6b6b]/60 line-through">{formatINR(product.mrp)}</span>
          )}
          {discount > 0 && <span className="text-[11px] font-semibold text-[#1f6fa8]">Save {discount}%</span>}
        </div>
      </div>
    </Link>
  );
}
