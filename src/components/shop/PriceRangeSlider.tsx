import { useEffect, useRef, useState } from 'react';
import { formatINR } from '../../data';

const BREAK = 100_000; // ₹0–1L occupies the first 60% of the track
const BREAK_PCT = 60;

/** How many blocks the track is built from, and the thumb's width in px —
 *  the blocks are inset by half a thumb on each side so a thumb at either
 *  end sits squarely over the first or last block (a native range thumb
 *  never travels past its own half-width from the edge). */
const SEGMENTS = 24;
const THUMB_PX = 18;

function snapStep(v: number): number {
  if (v < 50_000) return 500;
  if (v < 200_000) return 1000;
  return 5000;
}

function valueToPct(v: number, max: number): number {
  if (v <= BREAK || max <= BREAK) return (v / Math.max(BREAK, 1)) * BREAK_PCT;
  const upperSpan = max - BREAK || 1;
  return BREAK_PCT + ((v - BREAK) / upperSpan) * (100 - BREAK_PCT);
}

function pctToValue(pct: number, max: number): number {
  if (pct <= BREAK_PCT) return (pct / BREAK_PCT) * Math.min(BREAK, max);
  const upperSpan = max - BREAK || 1;
  return BREAK + ((pct - BREAK_PCT) / (100 - BREAK_PCT)) * upperSpan;
}

const PRESETS: { label: string; range: [number, number] }[] = [
  { label: 'Under ₹20k', range: [0, 20_000] },
  { label: '₹20k–50k', range: [20_000, 50_000] },
  { label: '₹50k–1L', range: [50_000, 100_000] },
  { label: '₹1L+', range: [100_000, 500_000] },
];

const MICRO_LABEL = 'block font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-shop-ink/45';

/** Price filter in three modules: a Min | Max pair of cells, a dual-thumb
 *  slider whose track is a row of blocks (the ones inside the chosen range
 *  filled with the accent), and a grid of quick ranges. */
export function PriceRangeSlider({
  min,
  max,
  value,
  accent,
  onChange,
}: {
  min: number;
  max: number;
  value: [number, number];
  accent: string;
  onChange: (next: [number, number]) => void;
}) {
  const scaleMax = Math.min(Math.max(max, BREAK), 500_000);
  const [local, setLocal] = useState<[number, number]>(value);
  const dragging = useRef(false);
  const commitTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!dragging.current) setLocal(value);
  }, [value]);

  const commit = (next: [number, number]) => {
    clearTimeout(commitTimer.current);
    commitTimer.current = setTimeout(() => onChange(next), 300);
  };

  const [lo, hi] = local;

  if (max <= min) {
    return <p className="py-1 text-sm text-shop-ink/60 tabular-nums">{formatINR(min)}</p>;
  }

  const loPct = valueToPct(lo, scaleMax);
  const hiPct = valueToPct(hi, scaleMax);

  function moveLo(pct: number) {
    const step = snapStep(lo);
    const raw = Math.round(pctToValue(pct, scaleMax) / step) * step;
    const next: [number, number] = [Math.min(Math.max(min, raw), hi - step), hi];
    dragging.current = true;
    setLocal(next);
    commit(next);
  }
  function moveHi(pct: number) {
    const step = snapStep(hi);
    const raw = Math.round(pctToValue(pct, scaleMax) / step) * step;
    const next: [number, number] = [lo, Math.max(Math.min(scaleMax, raw), lo + step)];
    dragging.current = true;
    setLocal(next);
    commit(next);
  }

  const endDrag = () => {
    dragging.current = false;
  };

  return (
    <div>
      {/* Module — Min | Max */}
      <div className="flex items-stretch overflow-hidden rounded-xl border border-shop-line">
        <label className="min-w-0 flex-1 cursor-text bg-shop-canvas px-3 py-2 transition-colors focus-within:bg-white">
          <span className={MICRO_LABEL}>Min</span>
          <span className="mt-0.5 flex items-center">
            <span className="text-sm text-shop-ink/40">₹</span>
            <input
              type="number"
              value={lo}
              min={min}
              max={hi}
              onChange={(e) => {
                const v = Math.min(Number(e.target.value) || 0, hi);
                const next: [number, number] = [Math.max(min, v), hi];
                setLocal(next);
                commit(next);
              }}
              className="w-full min-w-0 bg-transparent pl-1 font-mono text-sm tabular-nums text-shop-ink outline-none"
              aria-label="Minimum price"
            />
          </span>
        </label>
        <label className="min-w-0 flex-1 cursor-text border-l border-shop-line bg-shop-canvas px-3 py-2 transition-colors focus-within:bg-white">
          <span className={MICRO_LABEL}>Max</span>
          <span className="mt-0.5 flex items-center">
            <span className="text-sm text-shop-ink/40">₹</span>
            <input
              type="number"
              value={hi}
              min={lo}
              max={scaleMax}
              onChange={(e) => {
                const v = Math.max(Number(e.target.value) || 0, lo);
                const next: [number, number] = [lo, Math.min(scaleMax, v)];
                setLocal(next);
                commit(next);
              }}
              className="w-full min-w-0 bg-transparent pl-1 font-mono text-sm tabular-nums text-shop-ink outline-none"
              aria-label="Maximum price"
            />
          </span>
        </label>
      </div>

      {/* Module — slider */}
      <div className="relative mt-4 h-7">
        <div
          className="absolute top-1/2 flex h-2.5 -translate-y-1/2 gap-[3px]"
          style={{ left: THUMB_PX / 2, right: THUMB_PX / 2 }}
          aria-hidden="true"
        >
          {Array.from({ length: SEGMENTS }, (_, i) => {
            const mid = ((i + 0.5) / SEGMENTS) * 100;
            const inRange = mid >= loPct && mid <= hiPct;
            return (
              <span
                key={i}
                className="flex-1 rounded-[2px] transition-colors duration-150"
                style={{ backgroundColor: inRange ? accent : '#E3E1DA' }}
              />
            );
          })}
        </div>

        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={loPct}
          aria-label="Minimum price"
          aria-valuetext={formatINR(lo)}
          onChange={(e) => moveLo(Number(e.target.value))}
          onMouseUp={endDrag}
          onTouchEnd={endDrag}
          onKeyUp={endDrag}
          className="shop-range"
        />
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={hiPct}
          aria-label="Maximum price"
          aria-valuetext={formatINR(hi)}
          onChange={(e) => moveHi(Number(e.target.value))}
          onMouseUp={endDrag}
          onTouchEnd={endDrag}
          onKeyUp={endDrag}
          className="shop-range"
        />
      </div>

      <div className="mt-1 flex items-center justify-between font-mono text-[10px] tabular-nums text-shop-ink/40">
        <span>{formatINR(min)}</span>
        <span>{formatINR(scaleMax)}+</span>
      </div>

      {/* Module — quick ranges */}
      <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-shop-line bg-shop-line">
        {PRESETS.map((p) => {
          const active = lo === Math.max(min, p.range[0]) && hi === Math.min(scaleMax, p.range[1]);
          return (
            <button
              key={p.label}
              type="button"
              aria-pressed={active}
              onClick={() => {
                const next: [number, number] = [Math.max(min, p.range[0]), Math.min(scaleMax, p.range[1])];
                dragging.current = false;
                setLocal(next);
                onChange(next);
              }}
              className={`h-10 text-xs font-semibold transition-colors shop-focus-ring ${
                active ? 'bg-shop-ink text-white' : 'bg-white text-shop-ink/70 hover:bg-shop-canvas hover:text-shop-ink'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
