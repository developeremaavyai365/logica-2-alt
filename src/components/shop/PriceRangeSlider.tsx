import type { CSSProperties } from 'react';
import { formatINR } from '../../data';

export function PriceRangeSlider({
  min,
  max,
  step,
  value,
  accent,
  onChange,
}: {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  accent: string;
  onChange: (next: [number, number]) => void;
}) {
  const [lo, hi] = value;
  const span = max - min || 1;
  const pct = (v: number) => ((v - min) / span) * 100;

  if (max <= min) {
    return <p className="py-1 text-sm text-[#6b6b6b]">{formatINR(min)}</p>;
  }

  return (
    <div className="pt-1">
      <div className="flex items-center justify-between text-sm font-medium text-[#000000]">
        <span>{formatINR(lo)}</span>
        <span className="text-[#6b6b6b]/50">—</span>
        <span>{formatINR(hi)}</span>
      </div>

      <div className="relative mt-6 h-4">
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#000000]/10" />
        <div
          className="price-cube"
          style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%`, '--cube-accent': accent } as CSSProperties}
        >
          <div className="price-cube-a" />
          <div className="price-cube-b" />
          <div className="price-cube-c" />
          <div className="price-cube-d" />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          aria-label="Minimum price"
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi - step), hi])}
          className="price-range"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          aria-label="Maximum price"
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + step)])}
          className="price-range"
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-[#6b6b6b]/60">
        <span>{formatINR(min)}</span>
        <span>{formatINR(max)}</span>
      </div>
    </div>
  );
}
