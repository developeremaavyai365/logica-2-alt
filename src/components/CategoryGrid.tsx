import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { categories, products } from '../data';

// Lifestyle photography per category, falling back to a real product photo
// for any category without a dedicated shot.
const LIFESTYLE_IMAGE: Record<string, string> = {
  laptops: '/lifestyle/laptops.jpg',
  'mobile-phones': '/lifestyle/mobile-phones.jpg',
  accessories: '/lifestyle/accessories.jpg',
  desktops: '/lifestyle/desktops.jpg',
  monitors: '/lifestyle/monitors.jpg',
  printers: '/lifestyle/printers.jpg',
};

function imageFor(slug: string) {
  if (LIFESTYLE_IMAGE[slug]) return LIFESTYLE_IMAGE[slug];
  const p = products.find((p) => p.category === slug && p.image);
  return p?.image ?? '/products/hp-laptop14-ep0341tu-silver.jpg';
}

const FEATURED = categories.slice(0, 6);

export default function CategoryGrid() {
  return (
    <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
      <div className="animate-fade-up flex items-end justify-between gap-4">
        <h2
          className="font-dm-sans font-normal text-black"
          style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.05em', lineHeight: 1.05 }}
        >
          Shop by Category
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

      <div className="mt-8 grid grid-cols-2 gap-4 sm:mt-10 sm:gap-5 md:grid-cols-3 lg:gap-6">
        {FEATURED.map((cat, i) => (
          <Link
            key={cat.slug}
            to={`/shop/${cat.slug}`}
            className="animate-fade-up group relative block overflow-hidden rounded-md bg-[#ECEDEC]"
            style={{ animationDelay: `${0.1 * i}s` }}
          >
            <img
              src={imageFor(cat.slug)}
              alt={cat.name}
              className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <p className="font-dm-sans text-lg text-white sm:text-xl" style={{ letterSpacing: '-0.03em' }}>
                {cat.name}
              </p>
              <p className="font-inter mt-0.5 text-xs text-white/70 sm:text-sm" style={{ letterSpacing: '-0.02em' }}>
                {cat.tagline}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
