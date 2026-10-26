import { useMemo, useState, type ReactNode } from 'react';
import { useParams, useSearchParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowRight, Check, ChevronRight, Heart, ShoppingCart, Cpu, MemoryStick, HardDrive, Monitor, Laptop2, Zap,
  BatteryFull, Camera, Smartphone, Layers, type LucideIcon,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import ProductGallery from '../components/ProductGallery';
import ProductReviews from '../components/ProductReviews';
import SectionHeading from '../components/shop/SectionHeading';
import { categories, products, formatINR } from '../data';
import { PRODUCT_DETAILS } from '../product-details-data';
import { PRODUCT_GALLERY } from '../product-gallery-data';
import { colourImages, coloursOf, findColour, productTitle } from '../product-colours';
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

const MICRO_LABEL = 'font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-shop-ink/45';

/** A titled card in the shop's modular language: a header strip with the
 *  title over the content. */
function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-shop-line bg-white">
      <div className="border-b border-shop-line px-5 py-2.5">
        <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-shop-ink">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => p.id === id);
  const { addToCart, inCart, toggleWishlist, inWishlist } = useShopStore();
  const [added, setAdded] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

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
  // Where the page has colour dots, the catalogue's own colour list
  // ("Color : Black Blue Green Yellow Pink") only repeats them — and can
  // disagree with them — so it is left out of the highlights and specs.
  const hasColours = coloursOf(product.id).length > 0;
  const isColourList = (text: string) => /^\s*colou?r\b/i.test(text);
  const isColourSpec = (label: string) => /^\s*(model\s+)?colou?rs?\s*$/i.test(label);
  const highlights = (detail?.highlights ?? []).filter((h) => !(hasColours && isColourList(h)));
  const specRows: [string, string][] = (
    detail?.specs ??
    SPEC_ORDER.filter((key) => extracted[key]).map((key): [string, string] => [SPEC_LABELS[key], extracted[key] as string])
  ).filter(([label]) => !(hasColours && isColourSpec(label)));

  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;
  // Colours: the one named in the URL, else the first. The URL is the
  // source of truth so a shared link or a search for "blue iphone" opens
  // on that colour.
  const colours = coloursOf(product.id);
  const colour = findColour(product.id, searchParams.get('colour')) ?? colours[0];
  const inStock = colour?.inStock ?? product.inStock;
  // "Apple iPhone 15 Plus – Green": the name follows the chosen colour.
  const title = productTitle(product, colour);
  const galleryImages = colour && colourImages(product.id, colour).length
    ? colourImages(product.id, colour)
    : PRODUCT_GALLERY[product.id]?.length
      ? PRODUCT_GALLERY[product.id]
      : [product.image];
  const chooseColour = (key: string) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('colour', key);
        return next;
      },
      { replace: true },
    );
  const hasDiscount = discount > 0;
  const saving = hasDiscount ? product.mrp! - product.price : 0;
  const wished = inWishlist(product.id);
  const overviewList = detail?.overview ? overviewItems(detail.overview) : null;

  return (
    <div className="w-full bg-shop-canvas">
      <div className="bg-[#ECEDEC]">
        <Header />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex items-center gap-2 overflow-hidden rounded-xl border border-shop-line bg-white px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-shop-ink/45"
        >
          <Link to="/shop" className="shrink-0 transition-colors hover:text-shop-ink">
            Shop
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          {category && (
            <>
              <Link to={`/shop/${category.slug}`} className="shrink-0 transition-colors hover:text-shop-ink">
                {category.name}
              </Link>
              <ChevronRight className="h-3 w-3 shrink-0" />
            </>
          )}
          <span className="truncate text-shop-ink">{title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Image gallery — multi-angle views. Stays in view on desktop
              while the cards on the right scroll past it. */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <ProductGallery key={colour?.key ?? 'all'} images={galleryImages} alt={title} productId={product.id} />

            {/* Colour — a dot per colour under the photos it changes. The
                chosen one is ringed and named in the header strip. */}
            {colour && colours.length > 0 && (
              <div className="mt-3 overflow-hidden rounded-2xl border border-shop-line bg-white">
                <div className="flex items-center gap-2 border-b border-shop-line px-4 py-2.5">
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-shop-ink/45">Colour</span>
                  <span className="text-sm font-semibold text-shop-ink">{colour.name}</span>
                  {!inStock && <span className="text-xs text-red-600">· Out of stock</span>}
                </div>
                <div role="radiogroup" aria-label="Colour" className="flex flex-wrap items-center gap-3 px-4 py-3.5">
                  {colours.map((c) => {
                    const on = c.key === colour.key;
                    const out = !(c.inStock ?? product.inStock);
                    return (
                      <button
                        key={c.key}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        aria-label={`${c.name}${out ? ' (out of stock)' : ''}`}
                        title={c.name}
                        onClick={() => chooseColour(c.key)}
                        className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-200 ${
                          on ? 'ring-2 ring-shop-ink ring-offset-2' : 'hover:scale-110'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`h-full w-full rounded-full border border-shop-ink/15 shadow-[inset_0_-5px_8px_rgba(0,0,0,0.12),inset_0_5px_8px_rgba(255,255,255,0.35)] ${
                            out ? 'opacity-45' : ''
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                        {out && (
                          <span aria-hidden="true" className="absolute h-px w-[115%] -rotate-45 bg-shop-ink/60" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {colour.images.length === 0 && (
                  <p className="border-t border-shop-line px-4 py-2 text-xs text-shop-ink/50">
                    {colour.name} is pictured in the range photo.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            {/* Buy card */}
            <div className="overflow-hidden rounded-2xl border border-shop-line bg-white">
              {/* Module — title */}
              <div className="px-5 py-5">
                <h1 className="text-2xl font-semibold leading-snug text-shop-ink sm:text-3xl" style={{ letterSpacing: '-0.02em' }}>
                  {title}
                </h1>
                {/* Only said when it matters: a product that cannot be bought. */}
                {!inStock && <p className="mt-2 text-sm font-medium text-red-600">Currently out of stock</p>}
              </div>

              {/* Module — price */}
              <div className="flex flex-wrap items-end justify-between gap-3 border-t border-shop-line px-5 py-4">
                <div>
                  <span className={MICRO_LABEL}>Price</span>
                  <div className="mt-1 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <span className="font-dm-sans text-3xl font-semibold tabular-nums text-shop-ink" style={{ letterSpacing: '-0.03em' }}>
                      {formatINR(product.price)}
                    </span>
                    {hasDiscount && (
                      <span className="font-inter text-sm tabular-nums text-shop-ink/40 line-through">{formatINR(product.mrp!)}</span>
                    )}
                  </div>
                </div>
                {hasDiscount && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] tabular-nums text-shop-ink/55">Save {formatINR(saving)}</span>
                    <span className="rounded-full bg-shop-accent px-2.5 py-1 font-mono text-xs font-bold tabular-nums leading-none text-white">
                      −{discount}%
                    </span>
                  </div>
                )}
              </div>

              {/* Module — actions */}
              <div className="flex items-stretch gap-2 border-t border-shop-line p-3">
                <button
                  type="button"
                  onClick={() => {
                    addToCart(product.id, 1, colour?.key);
                    setAdded(true);
                    setTimeout(() => setAdded(false), 1500);
                  }}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-shop-ink text-sm font-semibold text-white transition-colors duration-300 hover:bg-shop-accent"
                >
                  {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                  {added ? 'Added' : inCart(product.id, colour?.key) ? 'Add Another' : 'Add to Cart'}
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Toggle wishlist"
                  aria-pressed={wished}
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 ${
                    wished
                      ? 'border-shop-accent bg-shop-accent text-white'
                      : 'border-shop-line text-shop-ink hover:border-shop-ink/40'
                  }`}
                >
                  <Heart className="h-4 w-4" fill={wished ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Module — bulk enquiry row */}
              <Link
                to="/contact"
                className="group flex items-center justify-between border-t border-shop-line px-5 py-3 text-sm font-semibold text-shop-ink transition-colors duration-300 hover:bg-shop-canvas"
              >
                Enquire for bulk pricing
                <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Highlights card */}
            {highlights.length > 0 && (
              <SectionCard title="Highlights">
                <ul className="divide-y divide-shop-line">
                  {highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3 px-5 py-3 text-sm leading-relaxed text-shop-ink/75">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-shop-accent text-white">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* Technical details card — a grid of cells divided by hairlines.
                The hairlines are the grid's own background showing through a
                1px gap, so an odd number of specs gets one blank white cell
                to keep the last row from ending in a grey block. */}
            {specRows.length > 0 && (
              <SectionCard title="Technical details">
                <div className="grid grid-cols-1 gap-px bg-shop-line sm:grid-cols-2">
                  {specRows.map(([label, value]) => {
                    const Icon = iconForSpec(label);
                    return (
                      <div key={label} className="flex items-start gap-3 bg-white px-5 py-3.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-shop-canvas">
                          <Icon className="h-4 w-4 text-shop-ink" />
                        </span>
                        <div className="min-w-0">
                          <p className={MICRO_LABEL}>{label}</p>
                          <p className="mt-0.5 break-words text-sm font-medium leading-snug text-shop-ink">{value}</p>
                        </div>
                      </div>
                    );
                  })}
                  {specRows.length % 2 === 1 && <div className="hidden bg-white sm:block" aria-hidden="true" />}
                </div>
              </SectionCard>
            )}

            {/* Overview card */}
            {detail?.overview && (
              <SectionCard title="Overview">
                {overviewList ? (
                  <ul className="divide-y divide-shop-line">
                    {overviewList.map((item, i) => (
                      <li key={item} className="flex items-start gap-3 px-5 py-3 text-sm leading-relaxed text-shop-ink/75">
                        <span className="mt-0.5 shrink-0 font-mono text-[11px] tabular-nums text-shop-ink/35">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-5 py-4 text-sm leading-relaxed text-shop-ink/75">{detail.overview}</p>
                )}
              </SectionCard>
            )}
          </div>
        </div>

        <ProductReviews productId={product.id} />

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-14">
            <SectionHeading className="mb-5">You may also like</SectionHeading>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
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
