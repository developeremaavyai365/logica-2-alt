import { useState, type ReactNode } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { formatINR } from '../../data';
import { PriceRangeSlider } from './PriceRangeSlider';
import BrandLogoFilter from './BrandLogoFilter';
import DiscountFilter from './DiscountFilter';

export interface FilterSelection {
  brands: string[];
  price: [number, number];
  disc: number | undefined;
}

interface CountedOption {
  value: string;
  count: number;
}

export interface FilterSidebarProps {
  brands: CountedOption[];
  priceMin: number;
  priceMax: number;
  priceValue: [number, number];
  onPriceChange: (next: [number, number]) => void;
  discCounts: Map<number, number>;
  discMaxAvailable: number;
  selected: FilterSelection;
  onToggleBrand: (brand: string) => void;
  onClearBrands: () => void;
  onDiscChange: (next: number | undefined) => void;
  onClear: () => void;
  accent: string;
  activeCount: number;
  /** true inside the mobile bottom sheet — expands the brand panel inline
   *  instead of behind a popover trigger. */
  inline?: boolean;
}

/** One filter as its own module: a header row (name, what is currently
 *  chosen, a chevron to fold it away) over the control itself, divided from
 *  its neighbours by a hairline. The current value sits in the header so a
 *  folded module still says what it is filtering by. */
function FilterModule({
  title,
  summary,
  active,
  pad,
  children,
}: {
  title: string;
  summary: string;
  /** true when this filter is narrowing the results — tints the summary. */
  active: boolean;
  pad: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <section className="border-t border-shop-line">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-3 py-3 text-left outline-none shop-focus-ring ${pad}`}
      >
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-shop-ink">{title}</span>
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={`truncate font-mono text-[11px] tabular-nums ${active ? 'font-semibold text-shop-accent' : 'text-shop-ink/45'}`}
          >
            {summary}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-shop-ink/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>
      {open && <div className={`pb-4 ${pad}`}>{children}</div>}
    </section>
  );
}

export function FilterSidebar({
  brands,
  priceMin,
  priceMax,
  priceValue,
  onPriceChange,
  discCounts,
  discMaxAvailable,
  selected,
  onToggleBrand,
  onClearBrands,
  onDiscChange,
  onClear,
  accent,
  activeCount,
  inline = false,
}: FilterSidebarProps) {
  // On the desktop rail the filters are one bordered card; inside the mobile
  // sheet (which is already a white panel with its own title) the same
  // modules run edge to edge without a second frame around them.
  const pad = inline ? '' : 'px-4';
  const priceNarrowed = priceValue[0] > priceMin || priceValue[1] < priceMax;

  return (
    <div>
      <div className={inline ? '' : 'overflow-hidden rounded-2xl border border-shop-line bg-white'}>
        {/* Module — header strip */}
        <div className={`flex items-center justify-between gap-3 py-3 ${pad}`}>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-shop-ink">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-shop-accent px-1.5 font-mono text-[11px] font-bold leading-none text-white">
                {activeCount}
              </span>
            )}
          </h3>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-full border border-shop-line px-2.5 py-1 text-[11px] font-medium text-shop-ink/60 transition-colors hover:border-shop-ink hover:bg-shop-ink hover:text-white"
            >
              Clear all
            </button>
          )}
        </div>

        <FilterModule
          title="Price"
          summary={priceNarrowed ? `${formatINR(priceValue[0])} – ${formatINR(priceValue[1])}` : 'Any'}
          active={priceNarrowed}
          pad={pad}
        >
          <PriceRangeSlider
            min={priceMin}
            max={priceMax}
            value={priceValue}
            accent={accent}
            onChange={onPriceChange}
          />
        </FilterModule>

        <FilterModule
          title="Brand"
          summary={selected.brands.length > 0 ? `${selected.brands.length} selected` : 'All'}
          active={selected.brands.length > 0}
          pad={pad}
        >
          <BrandLogoFilter brands={brands} selected={selected.brands} onToggle={onToggleBrand} onClear={onClearBrands} inline={inline} />
        </FilterModule>

        <FilterModule
          title="Discount"
          summary={selected.disc !== undefined ? `${selected.disc}% or more` : 'Any'}
          active={selected.disc !== undefined}
          pad={pad}
        >
          <DiscountFilter value={selected.disc} counts={discCounts} maxAvailable={discMaxAvailable} onChange={onDiscChange} />
        </FilterModule>
      </div>
    </div>
  );
}
