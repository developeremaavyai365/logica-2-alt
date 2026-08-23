import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { categories, formatINR, products, type Product } from '../data';

const TABS = categories.slice(0, 9);
const BADGES = ['Trending', 'No Cost EMI', '50+ Bought'];

function DealCard({ product, index }: { product: Product; index: number }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative flex w-64 shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-black/10 bg-white sm:w-72"
    >
      <span className="absolute left-3 top-3 z-10 rounded-full border border-black/15 bg-white px-3 py-1 text-[11px] font-medium text-black">
        {BADGES[index % BADGES.length]}
      </span>
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[#ECEDEC]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <p className="font-inter line-clamp-2 text-sm text-black" style={{ letterSpacing: '-0.01em' }}>
          {product.name}
        </p>
        <div className="mt-1.5 flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="font-dm-sans mt-1.5 text-lg text-black" style={{ letterSpacing: '-0.03em' }}>
          {formatINR(product.price)}
        </p>
      </div>
    </Link>
  );
}

export default function BestsellerDeals() {
  const [active, setActive] = useState(TABS[0]?.slug ?? '');

  const deals = products.filter((p) => p.category === active).slice(0, 8);

  return (
    <section className="relative overflow-hidden bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
      <h2
        className="font-dm-sans bg-gradient-to-r from-black to-[#15803D] bg-clip-text font-extrabold text-transparent"
        style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.05em', lineHeight: 1.05 }}
      >
        Bestseller Deals
      </h2>

      <div className="scrollbar-none mt-6 flex gap-2 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.slug}
            type="button"
            onClick={() => setActive(tab.slug)}
            className={`font-inter shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              active === tab.slug ? 'border-red-600 bg-red-600 text-white' : 'border-black/15 text-black hover:border-black/40'
            }`}
            style={{ letterSpacing: '-0.01em' }}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="scrollbar-none mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:gap-6">
        {deals.map((p, i) => (
          <DealCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}
