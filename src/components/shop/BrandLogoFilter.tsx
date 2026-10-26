import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

interface BrandOption {
  value: string;
  count: number;
}

/** Brand multi-select as a dropdown: a trigger split into a value cell and
 *  a chevron cell, opening a panel with a search cell, a grid of brand cards
 *  and a footer.
 *
 *  Each brand is a card showing its name and product count — names only, no
 *  logos — that lifts on hover, dips when pressed, and takes the accent
 *  border, a tint and a tick that pops in when selected.
 *
 *  The panel opens in the flow of the filter card, pushing what is below it
 *  down, rather than floating over it — the rail it lives in scrolls, and a
 *  floating panel would be cut off at the rail's edge. Inside the mobile
 *  sheet (`inline`) the panel is simply always open. */
export default function BrandLogoFilter({
  brands,
  selected,
  onToggle,
  onClear,
  inline = false,
}: {
  brands: BrandOption[];
  selected: string[];
  onToggle: (brand: string) => void;
  onClear: () => void;
  inline?: boolean;
}) {
  const [open, setOpen] = useState(inline);
  const [q, setQ] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inline || !open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, inline]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? brands.filter((b) => b.value.toLowerCase().includes(s)) : brands;
  }, [brands, q]);

  const picked = brands.filter((b) => selected.includes(b.value));

  const panel = (
    <div className={`overflow-hidden rounded-xl border border-shop-line bg-white ${inline ? '' : 'mt-2'}`}>
      {/* Module — search */}
      <div className="flex items-stretch border-b border-shop-line bg-shop-canvas transition-colors focus-within:bg-white">
        <span className="flex w-10 shrink-0 items-center justify-center text-shop-ink/40">
          <Search className="h-3.5 w-3.5" />
        </span>
        <input
          ref={searchRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search brands"
          aria-label="Search brands"
          className="h-10 min-w-0 flex-1 bg-transparent text-sm text-shop-ink outline-none placeholder:text-shop-ink/40"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ('');
              searchRef.current?.focus();
            }}
            aria-label="Clear brand search"
            className="flex w-10 shrink-0 items-center justify-center border-l border-shop-line text-shop-ink/50 transition-colors hover:bg-shop-ink hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Module — brand cards. The padding leaves room for a card's lift
          and shadow inside the scrolling list. */}
      <ul
        role="listbox"
        aria-multiselectable="true"
        aria-label="Brands"
        className={`grid max-h-[22rem] gap-2 overflow-y-auto p-2.5 ${inline ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'}`}
      >
        {filtered.map((b) => {
          const isSelected = selected.includes(b.value);
          const disabled = b.count === 0 && !isSelected;
          return (
            <li key={b.value}>
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                aria-label={`${b.value}, ${b.count} ${b.count === 1 ? 'product' : 'products'}`}
                disabled={disabled}
                onClick={() => onToggle(b.value)}
                className={`relative block w-full overflow-hidden rounded-xl border text-left outline-none transition-all duration-200 ease-out shop-focus-ring ${
                  isSelected
                    ? 'border-shop-accent bg-[#F3F4FE] shadow-[0_0_0_3px_rgba(61,79,224,0.14)]'
                    : 'border-shop-line bg-white'
                } ${
                  disabled
                    ? 'cursor-not-allowed opacity-40'
                    : 'hover:border-shop-ink/30 hover:shadow-[0_12px_22px_-14px_rgba(0,0,0,0.45)] active:scale-[0.96] motion-safe:hover:-translate-y-0.5'
                }`}
              >
                <span className="flex h-11 items-center justify-between gap-1.5 px-3">
                  <span
                    className={`min-w-0 truncate text-[13px] font-semibold transition-colors duration-200 ${
                      isSelected ? 'text-shop-accent' : 'text-shop-ink'
                    }`}
                  >
                    {b.value}
                  </span>
                  {/* the tick pops in on selection, taking the count's place */}
                  {isSelected ? (
                    <span className="brand-tick flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-shop-accent text-white">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="shrink-0 font-mono text-[10px] tabular-nums text-shop-ink/40">{b.count}</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="col-span-full px-3 py-4 text-center text-xs text-shop-ink/45">No brands match.</li>
        )}
      </ul>

      {/* Module — footer */}
      <div className="flex items-center justify-between gap-3 border-t border-shop-line px-3 py-2">
        <span className="font-mono text-[11px] tabular-nums text-shop-ink/55">
          {String(selected.length).padStart(2, '0')} selected
        </span>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg border border-shop-line px-2.5 py-1 text-[11px] font-medium text-shop-ink/60 transition-colors hover:border-shop-ink hover:bg-shop-ink hover:text-white"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );

  if (inline) return panel;

  return (
    <div>
      {/* Trigger — value cell + chevron cell */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`group flex h-12 w-full items-stretch overflow-hidden rounded-xl border bg-white text-left transition-colors shop-focus-ring ${
          open ? 'border-shop-accent' : 'border-shop-line hover:border-shop-ink/30'
        }`}
      >
        <span className="flex min-w-0 flex-1 items-center px-3 text-sm">
          {picked.length === 0 ? (
            <span className="text-shop-ink/60">All brands</span>
          ) : (
            <span className="truncate font-semibold text-shop-ink">
              {picked
                .slice(0, 2)
                .map((b) => b.value)
                .join(', ')}
              {picked.length > 2 && <span className="font-mono text-[11px] font-normal text-shop-ink/55"> +{picked.length - 2}</span>}
            </span>
          )}
        </span>
        <span
          className={`flex w-10 shrink-0 items-center justify-center border-l transition-colors ${
            open ? 'border-shop-accent bg-shop-accent text-white' : 'border-shop-line text-shop-ink/50 group-hover:text-shop-ink'
          }`}
        >
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {open && panel}
    </div>
  );
}
