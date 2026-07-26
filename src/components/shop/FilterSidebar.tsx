import { useMemo, useState, type ReactNode } from 'react';
import { ChevronDown, Minus, Plus, Search } from 'lucide-react';
import { PriceRangeSlider } from './PriceRangeSlider';
import type { FacetGroup } from '../../shop-facets';

export interface FilterSelection {
  attrs: Record<string, string[]>;
  brands: string[];
  price: [number, number];
}

interface CountedOption {
  value: string;
  count: number;
}

export interface FilterSidebarProps {
  facets: FacetGroup[];
  brands: CountedOption[];
  colors: CountedOption[];
  priceMin: number;
  priceMax: number;
  priceStep: number;
  priceValue: [number, number];
  onPriceChange: (next: [number, number]) => void;
  selected: FilterSelection;
  onToggle: (type: 'attr' | 'brand', group: string, value: string) => void;
  onClear: () => void;
  accent: string;
  activeCount: number;
}

function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#1f2a1d]/10">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-3.5 text-left"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1f2a1d]/80">{title}</span>
        {open ? <Minus className="h-3.5 w-3.5 text-[#4b5b47]/60" /> : <Plus className="h-3.5 w-3.5 text-[#4b5b47]/60" />}
      </button>
      {open && <div className="pb-4 pr-1">{children}</div>}
    </div>
  );
}

function CheckRow({
  label,
  count,
  checked,
  accent,
  swatch,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  accent: string;
  swatch?: string;
  onChange: () => void;
}) {
  return (
    <button type="button" onClick={onChange} className="group flex w-full items-center gap-2.5 rounded-md py-1.5 text-left">
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
          checked ? 'border-transparent' : 'border-[#1f2a1d]/25 group-hover:border-[#1f2a1d]/50'
        }`}
        style={checked ? { backgroundColor: accent } : undefined}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="h-3 w-3 text-[#1f2a1d]" fill="none">
            <path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {swatch && <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-[#1f2a1d]/15" style={{ background: swatch }} />}
      <span className={`flex-1 text-sm transition-colors ${checked ? 'text-[#1f2a1d]' : 'text-[#4b5b47] group-hover:text-[#1f2a1d]'}`}>
        {label}
      </span>
      {count !== undefined && <span className="text-xs text-[#4b5b47]/40">{count}</span>}
    </button>
  );
}

/** Best-effort CSS color from a marketing colour name, for the swatch dot. */
function swatchFor(name: string): string | undefined {
  const n = name.toLowerCase();
  const map: [string, string][] = [
    ['gold', '#d4af37'], ['silver', '#c0c4c9'], ['graphite', '#3a3a3c'], ['grey', '#8e8e93'],
    ['gray', '#8e8e93'], ['black', '#1c1c1e'], ['white', '#f2f2f7'], ['cream', '#f5f0e1'],
    ['beige', '#e8dcc4'], ['red', '#d0342c'], ['burgundy', '#800020'], ['rose', '#e0989a'],
    ['pink', '#ff6fa5'], ['orange', '#ff8c42'], ['amber', '#ffbf00'], ['yellow', '#ffd60a'],
    ['lime', '#b9e769'], ['mint', '#87e0c0'], ['teal', '#2aa198'], ['emerald', '#2ecc71'],
    ['forest', '#228b22'], ['olive', '#808000'], ['green', '#34c759'], ['aqua', '#4fd1c5'],
    ['navy', '#1b2a4a'], ['cobalt', '#1f47a3'], ['ultramarine', '#3f5fff'], ['sky', '#7dd3fc'],
    ['blue', '#3b82f6'], ['violet', '#8b5cf6'], ['purple', '#7c3aed'], ['lavendar', '#c4b5fd'],
    ['lavender', '#c4b5fd'], ['mauve', '#b784a7'], ['titanium', '#7c7c80'], ['midnight', '#0f1b2d'],
    ['starlight', '#eae7dc'], ['bronze', '#cd7f32'], ['copper', '#b87333'],
  ];
  for (const [k, v] of map) if (n.includes(k)) return v;
  return undefined;
}

function ColourSection({
  colors,
  selected,
  accent,
  onToggle,
}: {
  colors: CountedOption[];
  selected: string[];
  accent: string;
  onToggle: (value: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? colors.filter((c) => c.value.toLowerCase().includes(s)) : colors;
  }, [colors, q]);

  return (
    <div className="border-b border-[#1f2a1d]/10">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-3.5 text-left">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1f2a1d]/80">Colour</span>
        {open ? <Minus className="h-3.5 w-3.5 text-[#4b5b47]/60" /> : <Plus className="h-3.5 w-3.5 text-[#4b5b47]/60" />}
      </button>
      {open && (
        <div className="pb-4">
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#4b5b47]/50" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search colours..."
              className="w-full rounded-lg border border-[#1f2a1d]/15 bg-[#f4f8f3] py-1.5 pl-8 pr-2 text-xs text-[#1f2a1d] placeholder:text-[#4b5b47]/50 outline-none focus:border-[#1f2a1d]/40"
            />
          </div>
          <div className="max-h-56 overflow-y-auto pr-1">
            {filtered.map((c) => (
              <CheckRow key={c.value} label={c.value} checked={selected.includes(c.value)} accent={accent} swatch={swatchFor(c.value)} onChange={() => onToggle(c.value)} />
            ))}
            {filtered.length === 0 && <p className="py-2 text-xs text-[#4b5b47]/50">No colours match.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export function FilterSidebar({
  facets,
  brands,
  colors,
  priceMin,
  priceMax,
  priceStep,
  priceValue,
  onPriceChange,
  selected,
  onToggle,
  onClear,
  accent,
  activeCount,
}: FilterSidebarProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-semibold text-[#1f2a1d]">
          Filters
          {activeCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-[#1f2a1d]" style={{ backgroundColor: accent }}>
              {activeCount}
            </span>
          )}
        </h3>
        {activeCount > 0 && (
          <button type="button" onClick={onClear} className="text-xs font-medium text-[#4b5b47] transition-colors hover:text-[#1f2a1d]">
            Clear all
          </button>
        )}
      </div>

      <Section title="Pricing" defaultOpen>
        <PriceRangeSlider min={priceMin} max={priceMax} step={priceStep} value={priceValue} accent={accent} onChange={onPriceChange} />
      </Section>

      {colors.length > 0 && (
        <ColourSection colors={colors} selected={selected.attrs['Colour'] ?? []} accent={accent} onToggle={(value) => onToggle('attr', 'Colour', value)} />
      )}

      {facets.map((group, i) => (
        <Section key={group.key} title={group.key} defaultOpen={i === 0}>
          {group.options.map((opt) => (
            <CheckRow
              key={opt.value}
              label={opt.value}
              count={opt.count}
              checked={(selected.attrs[group.key] ?? []).includes(opt.value)}
              accent={accent}
              onChange={() => onToggle('attr', group.key, opt.value)}
            />
          ))}
        </Section>
      ))}

      <Section title="Brands" defaultOpen>
        {brands.map((b) => (
          <CheckRow key={b.value} label={b.value} count={b.count} checked={selected.brands.includes(b.value)} accent={accent} onChange={() => onToggle('brand', 'brand', b.value)} />
        ))}
      </Section>
    </div>
  );
}

export const FilterChevron = ChevronDown;
