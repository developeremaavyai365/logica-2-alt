import { X } from 'lucide-react';
import { formatINR } from '../../data';

export interface ActiveChip {
  key: string;
  label: string;
  onRemove: () => void;
}

export function buildActiveChips(opts: {
  q: string;
  onClearQ: () => void;
  cat: string;
  catLabel?: string;
  onClearCat: () => void;
  brands: string[];
  onRemoveBrand: (b: string) => void;
  priceNarrowed: boolean;
  min: number;
  max: number;
  onClearPrice: () => void;
  disc: number | undefined;
  onClearDisc: () => void;
}): ActiveChip[] {
  const chips: ActiveChip[] = [];
  if (opts.q) chips.push({ key: 'q', label: `"${opts.q}"`, onRemove: opts.onClearQ });
  if (opts.cat) chips.push({ key: 'cat', label: opts.catLabel ?? opts.cat, onRemove: opts.onClearCat });
  for (const b of opts.brands) chips.push({ key: `brand-${b}`, label: b, onRemove: () => opts.onRemoveBrand(b) });
  if (opts.priceNarrowed)
    chips.push({ key: 'price', label: `${formatINR(opts.min)} – ${formatINR(opts.max)}`, onRemove: opts.onClearPrice });
  if (opts.disc !== undefined) chips.push({ key: 'disc', label: `${opts.disc}%+ off`, onRemove: opts.onClearDisc });
  return chips;
}

export default function ActiveFilterChips({ chips, onClearAll }: { chips: ActiveChip[]; onClearAll: () => void }) {
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        // Two cells: the filter's value, and — past a hairline — the remove
        // mark, which fills in when the chip is hovered.
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          aria-label={`Remove filter: ${chip.label}`}
          className="group flex items-stretch overflow-hidden rounded-lg border border-shop-line bg-shop-canvas text-xs font-medium text-shop-ink transition-colors hover:border-shop-ink shop-focus-ring"
        >
          <span className="px-2.5 py-1">{chip.label}</span>
          <span className="flex w-6 items-center justify-center border-l border-shop-line text-shop-ink/50 transition-colors group-hover:border-shop-ink group-hover:bg-shop-ink group-hover:text-white">
            <X className="h-3 w-3" />
          </span>
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="rounded-lg border border-shop-line px-2.5 py-1 text-xs font-medium text-shop-ink/60 transition-colors hover:border-shop-ink hover:bg-shop-ink hover:text-white"
      >
        Clear all
      </button>
    </div>
  );
}
