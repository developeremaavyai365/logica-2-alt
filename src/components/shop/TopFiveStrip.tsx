import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { formatINR, type Product } from '../../data';
import { CARD_TONES, type CardTone } from './card-tones';
import { baseName } from '../../product-colours';

/** One ground per rank, drawn from the same palette as the deal strip above
 *  but in a different order, so the two rows read as related rather than as
 *  a repeat. */
const RANK_TONES: CardTone[] = [
  CARD_TONES.crimson,
  CARD_TONES.navy,
  CARD_TONES.orange,
  CARD_TONES.green,
  CARD_TONES.blue,
];

/** Five ranked colour cards: a big rank numeral and the discount on the
 *  coloured ground, the product in a white panel, then name, price
 *  and the saving. Every figure comes from the catalogue's own MRP and
 *  price. */
export default function TopFiveStrip({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <div className="w-full">
      <h2
        className="mb-5 font-dm-sans font-bold text-shop-ink"
        style={{ fontSize: 'clamp(28px, 3vw, 40px)', letterSpacing: '-0.035em', lineHeight: 1.05 }}
      >
        Top <span className="text-shop-accent">5</span> this week
      </h2>
      {/* A sideways-scrolling strip on phones, a grid from tablet up. The
          top padding leaves room for the hover lift inside the scroller. */}
      <div className="scrollbar-none -mx-4 grid snap-x grid-flow-col auto-cols-[minmax(176px,1fr)] gap-3 overflow-x-auto px-4 pb-1 pt-1 sm:mx-0 sm:grid-flow-row sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
        {products.slice(0, 5).map((product, i) => {
          const tone = RANK_TONES[i % RANK_TONES.length];
          const hasDiscount = Boolean(product.mrp && product.mrp > product.price);
          const discount = hasDiscount ? Math.round(((product.mrp! - product.price) / product.mrp!) * 100) : 0;
          const saving = hasDiscount ? product.mrp! - product.price : 0;

          return (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group relative flex snap-start flex-col overflow-hidden rounded-2xl p-3 text-white transition-all duration-300 ease-out hover:shadow-[0_26px_44px_-24px_rgba(0,0,0,0.55)] motion-safe:hover:-translate-y-1"
              style={{ background: tone.ground }}
            >
              {/* Rank + discount */}
              <div className="flex items-start justify-between gap-2">
                <span className="flex items-baseline gap-1">
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-white/70">No.</span>
                  <span className="font-dm-sans text-[42px] font-bold leading-[0.85]" style={{ letterSpacing: '-0.05em' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </span>
                {discount > 0 && (
                  <span
                    className="rounded-full bg-white px-2 py-1 font-mono text-[11px] font-bold tabular-nums leading-none"
                    style={{ color: tone.pill }}
                  >
                    −{discount}%
                  </span>
                )}
              </div>

              {/* Product panel */}
              <div className="relative mt-3 aspect-square overflow-hidden rounded-xl bg-white">
                <img
                  src={product.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-contain p-3 transition-transform duration-300 motion-safe:group-hover:scale-[1.06]"
                />
              </div>

              {/* Details */}
              <p className="mt-3 line-clamp-2 text-xs font-semibold leading-snug" style={{ letterSpacing: '-0.01em' }}>
                {baseName(product)}
              </p>
              <div className="mt-auto flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 pt-2.5">
                <span className="font-dm-sans text-lg font-bold tabular-nums leading-none" style={{ letterSpacing: '-0.03em' }}>
                  {formatINR(product.price)}
                </span>
                {hasDiscount && (
                  <span className="font-inter text-[11px] tabular-nums text-white/60 line-through">{formatINR(product.mrp!)}</span>
                )}
              </div>

              {/* Footer */}
              <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-white/20 pt-2.5">
                <span className="truncate text-[11px] font-semibold text-white/85">
                  {saving > 0 ? `Save ${formatINR(saving)}` : 'View product'}
                </span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 transition-colors duration-300 group-hover:bg-white group-hover:text-shop-ink">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
