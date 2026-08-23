import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

interface Brand {
  name: string;
  logo: string;
}

const BRANDS: Brand[] = [
  { name: 'Apple', logo: '/logos/brands/apple.png' },
  { name: 'Samsung', logo: '/logos/brands/samsung.png' },
  { name: 'Xiaomi', logo: '/logos/brands/xiaomi.jpg' },
  { name: 'Vivo', logo: '/logos/brands/vivo.png' },
  { name: 'realme', logo: '/logos/brands/realme.png' },
  { name: 'OPPO', logo: '/logos/brands/oppo.png' },
  { name: 'POCO', logo: '/logos/brands/poco.png' },
  { name: 'Nothing', logo: '/logos/brands/nothing.png' },
  { name: 'Motorola', logo: '/logos/brands/motorola.png' },
  { name: 'ASUS', logo: '/logos/brands/asus.png' },
  { name: 'Dell', logo: '/logos/brands/dell.png' },
];

export default function BrandStrip() {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
      <div className="mx-auto max-w-4xl text-center">
        <h2
          className="font-dm-sans bg-gradient-to-r from-black to-[#15803D] bg-clip-text font-extrabold text-transparent"
          style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.04em' }}
        >
          Discover Leading Brands
        </h2>
        <p
          className="font-inter mt-3 bg-gradient-to-r from-black to-[#15803D] bg-clip-text text-sm font-extrabold text-transparent sm:text-base"
          style={{ letterSpacing: '-0.01em' }}
        >
          Explore a curated selection of leading brands, where innovation meets quality, only at Logica Infoway.
        </p>
      </div>

      <div className="mx-auto mt-10 flex max-w-5xl flex-wrap items-center justify-center gap-6 sm:gap-8">
        {BRANDS.map((brand) => (
          <Link
            key={brand.name}
            to={`/shop?brand=${encodeURIComponent(brand.name)}`}
            aria-label={brand.name}
            className="flex h-16 w-24 shrink-0 items-center justify-center opacity-80 transition-opacity hover:opacity-100 sm:h-20 sm:w-32"
          >
            <img src={brand.logo} alt={brand.name} className="h-full w-full object-contain" loading="lazy" />
          </Link>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          to="/shop"
          className="btn-liquid font-inter flex h-11 items-center justify-center rounded-full border-2 border-black px-6 text-sm font-medium text-black transition-colors"
          style={{ '--liquid': '#000000', '--liquid-ink': '#fff' } as CSSProperties}
        >
          Shop Top Brands
        </Link>
      </div>
    </section>
  );
}
