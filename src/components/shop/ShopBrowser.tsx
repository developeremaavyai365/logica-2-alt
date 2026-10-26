import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ProductCard from '../ProductCard';
import { FilterSidebar, type FilterSelection } from './FilterSidebar';
import TypewriterSearchInput from './TypewriterSearchInput';
import CategoryNavBar from './CategoryNavBar';
import ResultsToolbar from './ResultsToolbar';
import Pagination from './Pagination';
import { buildActiveChips } from './ActiveFilterChips';
import { discountOf } from './DiscountFilter';
import DealsRow from './DealsRow';
import DeliveryBanner from './DeliveryBanner';
import BrandSpotlightSlider, { type BrandSlide } from './BrandSpotlightSlider';
import TopFiveStrip from './TopFiveStrip';
import { getPriceBounds } from '../../shop-facets';
import { parseShopParams, serializeShopParams } from '../../shop-filter-state';
import { matchProduct } from '../../shop-search';
import { categories, type Product } from '../../data';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const PAGE_SIZE = 24;

function scoreDiscount(p: Product) {
  if (!p.mrp || p.mrp <= p.price) return 0;
  return (p.mrp - p.price) / p.mrp;
}

export default function ShopBrowser({
  products,
  accent,
  initialBrand,
  lockCategory,
}: {
  products: Product[];
  accent: string;
  initialBrand?: string;
  /** When set (from CategoryPage), the category filter is fixed and the
   *  `?cat=` param is not used — `products` is already scoped. */
  lockCategory?: boolean;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const parsed = useMemo(() => parseShopParams(searchParams), [searchParams]);
  const reducedMotion = usePrefersReducedMotion();

  const [priceMin, priceMax] = useMemo(() => getPriceBounds(products), [products]);

  // Merchandising sections have no real slot/deal data behind them yet, so
  // every one is derived from the catalog that's already loaded, per a
  // fixed fallback formula rather than left empty or fabricated:
  //  - Deal of the Day: highest-discount in-stock product
  //  - Promo cards: the next 3 highest-discount in-stock products
  //  - "More top deals" grid: the 4 after those
  //  - Top 5: the 5 after those, so no product appears twice
  const merch = useMemo(() => {
    const byDiscount = [...products].filter((p) => p.inStock).sort((a, b) => scoreDiscount(b) - scoreDiscount(a));
    const dealProduct = byDiscount[0];
    const promoProducts = byDiscount.slice(1, 4);
    const gridProducts = byDiscount.slice(4, 8);
    const topFive = byDiscount.slice(8, 13);

    const brandSlideDefs: {
      key: string;
      brand: string;
      headline: string;
      category?: string;
      bg: string;
      video?: string;
      playThrough?: boolean;
      vimeoEmbedUrl?: string;
    }[] = [
      {
        key: 'apple',
        brand: 'Apple',
        headline: 'The latest from Apple',
        bg: '#000000',
        // A 66-second film, not a short loop — so the slide waits for it to
        // finish instead of cutting it off after the usual five seconds.
        video: '/video/iphone-duo.mp4',
        playThrough: true,
      },
      {
        key: 'samsung-phones',
        brand: 'Samsung',
        category: 'mobile-phones',
        headline: 'Galaxy, unlocked',
        bg: '#0a1929',
        video: '/video/samsung-z-fold.mp4',
      },
      {
        key: 'samsung-laptops',
        brand: 'Samsung',
        category: 'laptops',
        headline: 'Samsung, built for work',
        bg: '#111827',
        vimeoEmbedUrl: 'https://player.vimeo.com/video/1069639052?h=6d93e2a4ae&background=1&autoplay=1&loop=1&muted=1',
      },
    ];
    const brandSlides: BrandSlide[] = brandSlideDefs.map((def) => {
      const slideProducts = products.filter(
        (p) => p.brand === def.brand && (def.category ? p.category === def.category : true),
      );
      const params = new URLSearchParams({ brand: def.brand });
      if (def.category) params.set('cat', def.category);
      return {
        key: def.key,
        brand: def.brand,
        headline: def.headline,
        href: `/shop?${params.toString()}`,
        products: slideProducts.slice(0, 3),
        bg: def.bg,
        video: def.video,
        playThrough: def.playThrough,
        vimeoEmbedUrl: def.vimeoEmbedUrl,
      };
    });

    return { dealProduct, promoProducts, gridProducts, topFive, brandSlides };
  }, [products]);

  const [queryInput, setQueryInput] = useState(parsed.q);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  // Debounce the search box into the URL.
  useEffect(() => {
    const id = setTimeout(() => {
      if (queryInput !== parsed.q) update({ q: queryInput, page: 1 });
    }, 220);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryInput]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  // Seed the brand filter from `initialBrand` (e.g. a "View all" link from a
  // homepage brand rail) only if the URL doesn't already specify brands.
  useEffect(() => {
    if (initialBrand && searchParams.get('brand') === null) {
      update({ brands: [initialBrand] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBrand]);

  function update(patch: Partial<ReturnType<typeof parseShopParams>>) {
    const next = serializeShopParams({ ...parsed, ...patch });
    // `?sub=` belongs to the category page, not to the filters — carry it
    // through, or applying any filter on a sub-category page (MacBook, say)
    // would drop it and widen the list back to the whole category.
    const sub = searchParams.get('sub');
    if (sub) next.set('sub', sub);
    setSearchParams(next, { replace: true });
  }

  const brands: string[] = parsed.brands;
  const price: [number, number] = [parsed.min ?? priceMin, parsed.max ?? priceMax];
  const priceNarrowed = parsed.min !== undefined || parsed.max !== undefined;

  // Scoped by category first (locked or from ?cat=).
  const categoryScoped = useMemo(() => {
    if (lockCategory) return products;
    if (!parsed.cat) return products;
    return products.filter((p) => p.category === parsed.cat);
  }, [products, parsed.cat, lockCategory]);

  const q = parsed.q.trim().toLowerCase();

  // The same rule as the search suggestions: every word in the brand or
  // name, or a colour the product comes in ("blue iphone").
  const matchesText = (p: Product) => !q || matchProduct(p, q) !== null;
  const matchesBrand = (p: Product) => brands.length === 0 || brands.includes(p.brand);
  const matchesPrice = (p: Product) => p.price >= price[0] && p.price <= price[1];
  const matchesDisc = (p: Product) => parsed.disc === undefined || discountOf(p.mrp, p.price) >= parsed.disc;

  // Faceted counts: each facet is computed against the set filtered by
  // every OTHER active filter, standard faceted-search behaviour.
  const brandOptions = useMemo(() => {
    const scope = categoryScoped.filter((p) => matchesText(p) && matchesPrice(p) && matchesDisc(p));
    const counts = new Map<string, number>();
    for (const p of scope) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
    const all = new Set<string>([...categoryScoped.map((p) => p.brand)]);
    return Array.from(all)
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, count: counts.get(value) ?? 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryScoped, q, price[0], price[1], parsed.disc]);

  const discCounts = useMemo(() => {
    const scope = categoryScoped.filter((p) => matchesText(p) && matchesBrand(p) && matchesPrice(p));
    const buckets = [5, 10, 20, 30, 40, 50];
    const counts = new Map<number, number>();
    let maxAvailable = 0;
    for (const b of buckets) {
      const n = scope.filter((p) => discountOf(p.mrp, p.price) >= b).length;
      counts.set(b, n);
      if (n > 0) maxAvailable = b;
    }
    return { counts, maxAvailable };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryScoped, q, brands.join(','), price[0], price[1]]);

  const activeCount =
    brands.length + (priceNarrowed ? 1 : 0) + (parsed.disc !== undefined ? 1 : 0) + (!lockCategory && parsed.cat ? 1 : 0);

  const filtered = useMemo(() => {
    let list = categoryScoped.filter((p) => matchesText(p) && matchesBrand(p) && matchesPrice(p) && matchesDisc(p));
    switch (parsed.sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        list = [...list].sort((a, b) => scoreDiscount(b) - scoreDiscount(a));
        break;
      default:
        break;
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryScoped, q, brands.join(','), price[0], price[1], parsed.disc, parsed.sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, parsed.page), pageCount);
  const paged = useMemo(() => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filtered, currentPage]);

  function goToPage(next: number) {
    update({ page: Math.min(Math.max(1, next), pageCount) });
    topRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  const sel: FilterSelection = { brands, price, disc: parsed.disc };

  function toggleBrand(brand: string) {
    const has = brands.includes(brand);
    update({ brands: has ? brands.filter((b) => b !== brand) : [...brands, brand], page: 1 });
  }

  const catLabel = categories.find((c) => c.slug === parsed.cat)?.name;

  const chips = buildActiveChips({
    q: parsed.q,
    onClearQ: () => {
      setQueryInput('');
      update({ q: '', page: 1 });
    },
    cat: lockCategory ? '' : parsed.cat,
    catLabel,
    onClearCat: () => update({ cat: '', page: 1 }),
    brands,
    onRemoveBrand: toggleBrand,
    priceNarrowed,
    min: price[0],
    max: price[1],
    onClearPrice: () => update({ min: undefined, max: undefined, page: 1 }),
    disc: parsed.disc,
    onClearDisc: () => update({ disc: undefined, page: 1 }),
  });

  function clearAll() {
    setQueryInput('');
    update({ q: '', cat: lockCategory ? parsed.cat : '', brands: [], min: undefined, max: undefined, disc: undefined, page: 1 });
  }

  const rail = (
    <FilterSidebar
      brands={brandOptions}
      priceMin={priceMin}
      priceMax={priceMax}
      priceValue={price}
      onPriceChange={(next) => update({ min: next[0] === priceMin ? undefined : next[0], max: next[1] === priceMax ? undefined : next[1], page: 1 })}
      discCounts={discCounts.counts}
      discMaxAvailable={discCounts.maxAvailable}
      selected={sel}
      onToggleBrand={toggleBrand}
      onClearBrands={() => update({ brands: [], page: 1 })}
      onDiscChange={(next) => update({ disc: next, page: 1 })}
      onClear={clearAll}
      accent={accent}
      activeCount={activeCount}
    />
  );

  return (
    <div>
      {/* Row A — search, then (on the main shop page) the category
          navigation with its hover menus of sub-categories. */}
      <div className="flex flex-col gap-4">
        <TypewriterSearchInput value={queryInput} onChange={setQueryInput} />
        {!lockCategory && <CategoryNavBar accent={accent} />}
      </div>

      {/* The merchandising stack is the main shop page's alone. A category
          or sub-category page is where someone has already chosen what they
          want to see, so it goes straight from the search box to the
          products instead of making them scroll past banners first. */}
      {!lockCategory && (
        <>
          {/* Row A2 — Brand spotlight (Apple / Samsung videos), a full-width
              landscape banner directly under the category bar. */}
          <div className="mt-4">
            <BrandSpotlightSlider slides={merch.brandSlides} className="aspect-[16/9] sm:aspect-[5/2] xl:aspect-[3/1]" />
          </div>

          {/* Row B — the deal strip: Deal of the Day, three promo cards and
              a 2×2 card of four more deals */}
          <div className="mt-8">
            <DealsRow deal={merch.dealProduct} promos={merch.promoProducts} grid={merch.gridProducts} />
          </div>

          {/* Row B2 — Express delivery advertisement (Delhi NCR, under 1
              hour) with its pincode check. Full page width, as the break
              between the merchandising above and the product listing below. */}
          <div className="mt-8">
            <DeliveryBanner />
          </div>
        </>
      )}

      {/* Row C — Filter rail (left, 3/12) + main column (right, 9/12) */}
      <div className={`grid grid-cols-1 gap-8 xl:grid-cols-12 ${lockCategory ? 'mt-5' : 'mt-8'}`}>
        <aside aria-label="Product filters" className="hidden xl:col-span-3 xl:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-6 pr-1">{rail}</div>
        </aside>

        <div className="min-w-0 xl:col-span-9">
          {/* C1 — Top 5 this week (main shop page only) */}
          {!lockCategory && <TopFiveStrip products={merch.topFive} />}

          {/* C4 — Results toolbar */}
          <div ref={topRef} className={`scroll-mt-28 ${lockCategory ? '' : 'mt-8'}`}>
            <ResultsToolbar
              from={filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
              to={Math.min(currentPage * PAGE_SIZE, filtered.length)}
              total={filtered.length}
              page={currentPage}
              pageCount={pageCount}
              chips={chips}
              onClearAll={clearAll}
              onOpenFilters={() => setDrawerOpen(true)}
              activeCount={activeCount}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="mt-10 rounded-lg border border-shop-line bg-white py-16 text-center">
              <p className="text-sm font-medium text-shop-ink">No products match these filters.</p>
              <p className="mt-1 text-sm text-shop-ink/50">Try removing a filter or clearing everything.</p>
              {chips.length > 0 && (
                <button type="button" onClick={clearAll} className="mt-4 rounded-full bg-shop-ink px-5 py-2 text-sm font-medium text-white">
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3">
              <AnimatePresence initial={false}>
                {paged.map((product) => (
                  <motion.div
                    key={product.id}
                    layout={!reducedMotion}
                    initial={reducedMotion ? undefined : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <div className="mt-10">
            <Pagination current={currentPage} total={pageCount} accent={accent} onChange={goToPage} />
          </div>
        </div>
      </div>

      {/* Mobile / tablet filter sheet */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] xl:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-2xl sm:inset-y-0 sm:left-0 sm:right-auto sm:w-[86%] sm:max-w-sm sm:rounded-none sm:rounded-r-2xl">
            <div className="flex items-center justify-between border-b border-shop-line px-5 py-4">
              <span className="text-lg font-semibold text-shop-ink">Filters</span>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setDrawerOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-shop-ink/50 hover:bg-shop-canvas"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              <FilterSidebar
                brands={brandOptions}
                priceMin={priceMin}
                priceMax={priceMax}
                priceValue={price}
                          onPriceChange={(next) => update({ min: next[0] === priceMin ? undefined : next[0], max: next[1] === priceMax ? undefined : next[1], page: 1 })}
                discCounts={discCounts.counts}
                discMaxAvailable={discCounts.maxAvailable}
                selected={sel}
                onToggleBrand={toggleBrand}
                onClearBrands={() => update({ brands: [], page: 1 })}
                onDiscChange={(next) => update({ disc: next, page: 1 })}
                onClear={clearAll}
                accent={accent}
                activeCount={activeCount}
                inline
              />
            </div>
            <div className="border-t border-shop-line p-4">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-full rounded-full bg-shop-ink py-3 text-sm font-bold text-white"
              >
                Show {filtered.length} results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export type { FilterSelection };
