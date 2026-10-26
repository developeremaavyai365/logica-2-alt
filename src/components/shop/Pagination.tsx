import { ChevronLeft, ChevronRight } from 'lucide-react';

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

const STEP_CELL =
  'flex shrink-0 items-center gap-2 px-3 text-sm font-semibold text-shop-ink transition-colors duration-300 ' +
  'hover:bg-shop-ink hover:text-white disabled:cursor-not-allowed disabled:bg-transparent disabled:text-shop-ink/25 sm:px-5';

const NUMBER_CELL =
  'flex h-11 min-w-9 items-center justify-center border-r border-shop-line px-2 font-mono text-sm tabular-nums sm:min-w-11';

/** One bar divided into cells by hairlines — Previous, the page numbers,
 *  Next — in the same card language as the rest of the shop page, rather
 *  than a loose row of separate round buttons. */
export default function Pagination({
  current,
  total,
  accent,
  onChange,
}: {
  current: number;
  total: number;
  accent: string;
  onChange: (page: number) => void;
}) {
  if (total <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-stretch overflow-hidden rounded-2xl border border-shop-line bg-white"
    >
      {/* Module — previous */}
      <button
        type="button"
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        aria-label="Previous page"
        className={`${STEP_CELL} border-r border-shop-line`}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Module — page numbers */}
      <div className="flex min-w-0 flex-1 items-stretch justify-center">
        <div className="flex items-stretch border-l border-shop-line">
          {pageItems(current, total).map((it, i) =>
            it === '…' ? (
              <span key={`gap-${i}`} className={`${NUMBER_CELL} text-shop-ink/30`} aria-hidden="true">
                …
              </span>
            ) : it === current ? (
              <span
                key={it}
                aria-current="page"
                className={`${NUMBER_CELL} font-bold text-white`}
                style={{ backgroundColor: accent }}
              >
                {String(it).padStart(2, '0')}
              </span>
            ) : (
              <button
                key={it}
                type="button"
                onClick={() => onChange(it)}
                aria-label={`Page ${it}`}
                className={`${NUMBER_CELL} text-shop-ink/60 transition-colors duration-300 hover:bg-shop-canvas hover:text-shop-ink`}
              >
                {String(it).padStart(2, '0')}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Module — next */}
      <button
        type="button"
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        aria-label="Next page"
        className={`${STEP_CELL} border-l border-shop-line`}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
