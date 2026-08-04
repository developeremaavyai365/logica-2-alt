import { useMemo, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  Check, Heart, Cpu, MemoryStick, HardDrive, Monitor, Laptop2, Zap, BatteryFull,
  Camera, Smartphone, Layers, type LucideIcon,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import ProductGallery from '../components/ProductGallery';
import ProductReviews from '../components/ProductReviews';
import { categories, products, formatINR } from '../data';
import { PRODUCT_DETAILS } from '../product-details-data';
import { PRODUCT_GALLERY } from '../product-gallery-data';
import { extractSpecs, SPEC_LABELS, SPEC_ORDER } from '../product-specs';
import { useShopStore } from '../store';

/** Best-effort icon for a spec label, purely for visual scanning. */
function iconForSpec(label: string): LucideIcon {
  const l = label.toLowerCase();
  if (l.includes('processor') && !l.includes('generation')) return Cpu;
  if (l.includes('ram') || l.includes('memory')) return MemoryStick;
  if (l.includes('storage') || l.includes('ssd') || l.includes('hdd') || l.includes('capacity')) return HardDrive;
  if (l.includes('display') || l.includes('screen') || l.includes('resolution')) return Monitor;
  if (l.includes('operating system') || l.includes(' os')) return Laptop2;
  if (l.includes('graphics')) return Zap;
  if (l.includes('battery')) return BatteryFull;
  if (l.includes('camera')) return Camera;
  if (l.includes('sim') || l.includes('network') || l.includes('connectiv')) return Smartphone;
  return Layers;
}

/** Overview text is often a semicolon-separated spec dump (ports, box
 *  contents, etc.) — split it into a scannable bullet list when it clearly
 *  is one, otherwise leave it as a single paragraph. */
function overviewItems(text: string): string[] | null {
  const parts = text.split(';').map((s) => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts : null;
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => p.id === id);
  const { addToCart, inCart, toggleWishlist, inWishlist } = useShopStore();
  const [added, setAdded] = useState(false);

  const related = useMemo(
    () => (product ? products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4) : []),
    [product],
  );

  if (!product) {
    return <Navigate to="/shop" replace />;
  }

  const category = categories.find((c) => c.slug === product.category);
  const detail = PRODUCT_DETAILS[product.id];
  const extracted = extractSpecs(product.name);
  const specRows: [string, string][] = detail?.specs ?? SPEC_ORDER
    .filter((key) => extracted[key])
    .map((key) => [SPEC_LABELS[key], extracted[key] as string]);

  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;
  const galleryImages = PRODUCT_GALLERY[product.id]?.length ? PRODUCT_GALLERY[product.id] : [product.image];

  return (
    <div className="w-full bg-[#ECEDEC]">
      <div className="bg-[#f0f0f0]">
        <Header />
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10">
        <div className="flex items-center gap-1 text-xs text-[#6b6b6b] mb-8">
          <Link to="/shop" className="hover:text-[#000000] transition-colors">Shop</Link>
          <span>/</span>
          {category && (
            <>
              <Link to={`/shop/${category.slug}`} className="hover:text-[#000000] transition-colors">{category.name}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-[#000000]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image gallery — multi-angle views */}
          <ProductGallery images={galleryImages} alt={product.name} productId={product.id} />

          {/* Info */}
          <div>
            <span className="text-xs font-medium text-[#1f6fa8] uppercase tracking-wide">{product.brand}</span>
            <h1 className="mt-2 text-2xl sm:text-3xl font-normal text-[#000000] leading-snug" style={{ letterSpacing: '-0.02em' }}>
              {product.name}
            </h1>

            <div className="mt-5 flex items-center gap-3 flex-wrap">
              <span className="text-2xl font-semibold text-[#000000]">{formatINR(product.price)}</span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-sm text-[#6b6b6b]/60 line-through">{formatINR(product.mrp)}</span>
              )}
              {discount > 0 && (
                <span className="text-xs font-semibold text-white bg-[#1f6fa8] px-2 py-1 rounded-full">{discount}% off</span>
              )}
            </div>

            <p className={`mt-3 text-sm font-medium ${product.inStock ? 'text-[#1f6fa8]' : 'text-red-600'}`}>
              {product.inStock ? 'In stock — ships from our warehouse' : 'Currently out of stock'}
            </p>

            <div className="mt-6 flex items-center gap-3 flex-wrap">
              <button
                onClick={() => {
                  addToCart(product.id);
                  setAdded(true);
                  setTimeout(() => setAdded(false), 1500);
                }}
                className="btn-liquid border-2 border-[#000000] text-[#000000] text-sm font-semibold px-6 py-3 rounded-full transition-colors"
              >
                {added ? 'Added ✓' : inCart(product.id) ? 'Add Another' : 'Add to Cart'}
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                aria-label="Toggle wishlist"
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-colors ${
                  inWishlist(product.id) ? 'bg-[#000000] border-[#000000] text-white' : 'border-[#000000]/20 text-[#000000] hover:border-[#000000]/50'
                }`}
              >
                <Heart className="w-4 h-4" fill={inWishlist(product.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
            <Link to="/contact" className="mt-4 inline-block text-[#000000] text-sm font-semibold hover:opacity-80 transition-opacity">
              Enquire for bulk pricing →
            </Link>

            {detail?.highlights && detail.highlights.length > 0 && (
              <div className="mt-10">
                <h2 className="text-sm font-semibold text-[#000000] mb-3">Highlights</h2>
                <ul className="space-y-2">
                  {detail.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-[#6b6b6b] leading-relaxed">
                      <Check className="w-4 h-4 text-[#1f6fa8] shrink-0 mt-0.5" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {specRows.length > 0 && (
              <div className="mt-10">
                <h2 className="text-sm font-semibold text-[#000000] mb-3">Technical Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {specRows.map(([label, value]) => {
                    const Icon = iconForSpec(label);
                    return (
                      <div key={label} className="flex items-start gap-3 rounded-xl bg-[#f0f0f0] p-3.5">
                        <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-[#1f6fa8]" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6b6b6b]/70">{label}</p>
                          <p className="text-sm font-medium text-[#000000] leading-snug break-words">{value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {detail?.overview && (
              <div className="mt-10">
                <h2 className="text-sm font-semibold text-[#000000] mb-3">Overview</h2>
                {(() => {
                  const items = overviewItems(detail.overview);
                  return items ? (
                    <ul className="space-y-2">
                      {items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-[#6b6b6b] leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#85AB8B] shrink-0 mt-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-[#6b6b6b] leading-relaxed">{detail.overview}</p>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        <ProductReviews productId={product.id} />

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="text-xl font-semibold text-[#000000] mb-6">You may also like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
