import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../ProductCard';
import { FilterSidebar, type FilterSelection } from './FilterSidebar';
import TypewriterSearchInput from './TypewriterSearchInput';
import { FACET_ORDER, SHOP_COLORS, buildFacets, getPriceBounds, priceStepFor, type FacetKey } from '../../shop-facets';
import type { Product } from '../../data';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'discount';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'rating', label: 'Top Rated' },
  { key: 'discount', label: 'Biggest Discount' },
];

function scoreDiscount(p: Product) {
  if (!p.mrp || p.mrp <= p.price) return 0;
  return (p.mrp - p.price) / p.mrp;
}

const PAGE_SIZE = 24;

function pageItems(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | '…')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push('…');
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push('…');
  out.push(total);
  return out;
}

export default function ShopBrowser({
  products,
  accent,
  initialBrand,
}: {
  products: Product[];
  accent: string;
  initialBrand?: string;
}) {
  const [priceMin, priceMax] = useMemo(() => getPriceBounds(products), [products]);
  const priceStep = useMemo(() => priceStepFor(priceMax - priceMin), [priceMin, priceMax]);

  const emptySelection = useMemo<FilterSelection>(
    () => ({ attrs: {}, brands: initialBrand ? [initialBrand] : [], price: [priceMin, priceMax] }),
    [initialBrand, priceMin, priceMax],
  );

  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setQuery(queryInput), 220);
    return () => clearTimeout(id);
  }, [queryInput]);

  const [sort, setSort] = useState<SortKey>('featured');
  const [sel, setSel] = useState<FilterSelection>(emptySelection);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  // Reset selection whenever the underlying product set changes (e.g. switching category).
  useEffect(() => {
    setSel(emptySelection);
  }, [emptySelection]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const facets = useMemo(() => buildFacets(products), [products]);
  const brandOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [products]);

  const colorOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      const c = (p as Product & { attrs?: Partial<Record<FacetKey, string>> }).attrs?.Colour;
      if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    const all = new Set<string>([...SHOP_COLORS, ...counts.keys()]);
    return Array.from(all)
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, count: counts.get(value) ?? 0 }));
  }, [products]);

  const priceNarrowed = sel.price[0] > priceMin || sel.price[1] < priceMax;
  const activeCount = sel.brands.length + (priceNarrowed ? 1 : 0) + Object.values(sel.attrs).reduce((n, v) => n + v.length, 0);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const q = query.trim().toLowerCase();
      if (q && !(p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))) return false;
      if (sel.brands.length && !sel.brands.includes(p.brand)) return false;
      if (p.price < sel.price[0] || p.price > sel.price[1]) return false;
      for (const key of FACET_ORDER) {
        const picked = sel.attrs[key];
        if (picked && picked.length) {
          const v = (p as Product & { attrs?: Partial<Record<FacetKey, string>> }).attrs?.[key];
          if (!v || !picked.includes(v)) return false;
        }
      }
      return true;
    });

    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'discount':
        list = [...list].sort((a, b) => scoreDiscount(b) - scoreDiscount(a));
        break;
      default:
        break;
    }
    return list;
  }, [products, query, sel, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = useMemo(() => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filtered, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [query, sel, sort]);

  function goToPage(next: number) {
    setPage(Math.min(Math.max(1, next), pageCount));
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function toggle(type: 'attr' | 'brand', group: string, value: string) {
    setSel((prev) => {
      if (type === 'brand') {
        const has = prev.brands.includes(value);
        return { ...prev, brands: has ? prev.brands.filter((b) => b !== value) : [...prev.brands, value] };
      }
      const cur = prev.attrs[group] ?? [];
      const has = cur.includes(value);
      const next = has ? cur.filter((v) => v !== value) : [...cur, value];
      const attrs = { ...prev.attrs, [group]: next };
      if (next.length === 0) delete attrs[group];
      return { ...prev, attrs };
    });
  }

  const sidebar = (
    <FilterSidebar
      facets={facets}
      brands={brandOptions}
      colors={colorOptions}
      priceMin={priceMin}
      priceMax={priceMax}
      priceStep={priceStep}
      priceValue={sel.price}
      onPriceChange={(price) => setSel((prev) => ({ ...prev, price }))}
      selected={sel}
      onToggle={toggle}
      onClear={() => setSel(emptySelection)}
      accent={accent}
      activeCount={activeCount}
    />
  );

  return (
    <div className="flex gap-8">
      {/* Desktop sidebar — the toggle button lives here and filters expand in place */}
      <aside className={`hidden shrink-0 lg:block transition-[width] duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-12'}`}>
        <div className="sticky top-24">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? 'Collapse filters' : 'Expand filters'}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#000000]/20 text-[#000000] transition-colors hover:border-[#000000]/40"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeCount > 0 && (
              <span
                className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-[#000000]"
                style={{ backgroundColor: accent }}
              >
                {activeCount}
              </span>
            )}
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              sidebarOpen ? 'mt-4 max-h-[2000px] w-64 opacity-100' : 'mt-0 max-h-0 w-64 opacity-0'
            }`}
          >
            {sidebar}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <TypewriterSearchInput
            value={queryInput}
            onChange={(next) => {
              setQueryInput(next);
              if (next === '') setQuery('');
            }}
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[#000000]/20 px-4 py-2.5 text-sm font-medium text-[#000000] transition-colors hover:border-[#000000]/40 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-[#000000]" style={{ backgroundColor: accent }}>
                  {activeCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="hidden h-4 w-4 text-[#6b6b6b]/50 sm:block" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-full border border-[#000000]/15 bg-white py-2.5 pl-3 pr-8 text-sm text-[#000000] outline-none transition-colors focus:border-[#000000]/40"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div ref={topRef} className="mt-6 scroll-mt-28">
          <p className="text-sm text-[#6b6b6b]">
            {filtered.length === 0 ? (
              'No products'
            ) : (
              <>
                Showing{' '}
                <span className="text-[#000000] font-medium">
                  {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}
                </span>{' '}
                of {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
              </>
            )}
          </p>
        </div>

        <div
          className={`mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 transition-all duration-300 ${
            sidebarOpen ? 'lg:grid-cols-4' : 'lg:grid-cols-4 xl:grid-cols-5'
          }`}
        >
          {paged.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {pageCount > 1 && (
          <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="inline-flex h-9 items-center gap-1 rounded-full border border-[#000000]/15 px-3 text-sm text-[#6b6b6b] transition-colors hover:border-[#000000]/40 hover:text-[#000000] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {pageItems(currentPage, pageCount).map((it, i) =>
              it === '…' ? (
                <span key={`gap-${i}`} className="px-2 text-sm text-[#6b6b6b]/50">
                  …
                </span>
              ) : (
                <button
                  key={it}
                  type="button"
                  onClick={() => goToPage(it)}
                  aria-current={it === currentPage ? 'page' : undefined}
                  className={
                    it === currentPage
                      ? 'inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-bold text-[#000000]'
                      : 'inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-[#000000]/15 px-3 text-sm text-[#6b6b6b] transition-colors hover:border-[#000000]/40 hover:text-[#000000]'
                  }
                  style={it === currentPage ? { backgroundColor: accent } : undefined}
                >
                  {it}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === pageCount}
              aria-label="Next page"
              className="inline-flex h-9 items-center gap-1 rounded-full border border-[#000000]/15 px-3 text-sm text-[#6b6b6b] transition-colors hover:border-[#000000]/40 hover:text-[#000000] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#000000]/10 px-5 py-4">
              <span className="text-lg font-semibold text-[#000000]">Filters</span>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setDrawerOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#6b6b6b] hover:bg-[#f0f0f0]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-6">{sidebar}</div>
            <div className="border-t border-[#000000]/10 p-4">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="btn-liquid w-full rounded-full border-2 border-[#000000] py-3 text-sm font-bold text-[#000000] transition-colors"
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
