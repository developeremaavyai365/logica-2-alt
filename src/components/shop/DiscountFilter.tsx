const BUCKETS = [5, 10, 20, 30, 40, 50];
const COLUMNS = 4;

export function discountOf(mrp: number | undefined, price: number): number {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/** Single-select "minimum discount" as a grid of cells divided by
 *  hairlines. `counts` maps each bucket threshold to how many in-scope
 *  products (respecting every other active filter) clear it; buckets above
 *  the max available discount are hidden, zero-result buckets are disabled
 *  rather than hidden.
 *
 *  The hairlines are the grid's own background showing through a 1px gap,
 *  so blank white cells pad out the last row to keep it from ending in a
 *  grey block. */
export default function DiscountFilter({
  value,
  counts,
  maxAvailable,
  onChange,
}: {
  value: number | undefined;
  counts: Map<number, number>;
  maxAvailable: number;
  onChange: (next: number | undefined) => void;
}) {
  const visible = BUCKETS.filter((b) => b <= maxAvailable);
  const fillers = (COLUMNS - ((visible.length + 1) % COLUMNS)) % COLUMNS;

  const cell = (active: boolean, disabled: boolean) =>
    `flex h-12 flex-col items-center justify-center transition-colors shop-focus-ring ${
      active
        ? 'bg-shop-ink text-white'
        : disabled
          ? 'cursor-not-allowed bg-white text-shop-ink/25'
          : 'bg-white text-shop-ink hover:bg-shop-canvas'
    }`;

  return (
    <div
      role="radiogroup"
      aria-label="Minimum discount"
      className="grid grid-cols-4 gap-px overflow-hidden rounded-xl border border-shop-line bg-shop-line"
    >
      <button
        type="button"
        role="radio"
        aria-checked={value === undefined}
        onClick={() => onChange(undefined)}
        className={cell(value === undefined, false)}
      >
        <span className="text-xs font-semibold leading-none">Any</span>
      </button>
      {visible.map((b) => {
        const count = counts.get(b) ?? 0;
        const active = value === b;
        const disabled = count === 0 && !active;
        return (
          <button
            key={b}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${b}% or more, ${count} products`}
            disabled={disabled}
            onClick={() => onChange(active ? undefined : b)}
            className={cell(active, disabled)}
          >
            <span className="text-xs font-semibold leading-none">{b}%+</span>
            <span className={`mt-1 font-mono text-[10px] tabular-nums leading-none ${active ? 'text-white/65' : 'text-shop-ink/40'}`}>
              {count}
            </span>
          </button>
        );
      })}
      {Array.from({ length: fillers }, (_, i) => (
        <span key={`filler-${i}`} className="bg-white" aria-hidden="true" />
      ))}
    </div>
  );
}
