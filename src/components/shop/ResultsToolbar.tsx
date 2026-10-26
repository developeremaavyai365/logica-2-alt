import { SlidersHorizontal } from 'lucide-react';
import ActiveFilterChips, { type ActiveChip } from './ActiveFilterChips';

const MICRO_LABEL = 'font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-shop-ink/45';

/** One card divided into cells by hairlines: the result count, the current
 *  page, the Filters button (below the desktop layout, where the rail is
 *  hidden) and — only while something is filtered — a strip of the active
 *  filters underneath. */
export default function ResultsToolbar({
  from,
  to,
  total,
  page,
  pageCount,
  chips,
  onClearAll,
  onOpenFilters,
  activeCount,
}: {
  from: number;
  to: number;
  total: number;
  page: number;
  pageCount: number;
  chips: ActiveChip[];
  onClearAll: () => void;
  onOpenFilters: () => void;
  activeCount: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-shop-line bg-white">
      <div className="flex items-stretch">
        {/* Module — result count */}
        <div className="min-w-0 flex-1 px-4 py-3">
          <span className={`block ${MICRO_LABEL}`}>Results</span>
          <p className="mt-0.5 truncate text-sm text-shop-ink/60">
            {total === 0 ? (
              'No products found'
            ) : (
              <>
                <span className="font-mono font-bold tabular-nums text-shop-ink">
                  {from}–{to}
                </span>{' '}
                of <span className="font-mono font-bold tabular-nums text-shop-ink">{total}</span>{' '}
                {total === 1 ? 'product' : 'products'}
              </>
            )}
          </p>
        </div>

        {/* Module — page */}
        {total > 0 && (
          <div className="hidden shrink-0 border-l border-shop-line px-4 py-3 sm:block">
            <span className={`block ${MICRO_LABEL}`}>Page</span>
            <p className="mt-0.5 font-mono text-sm tabular-nums text-shop-ink/45">
              <span className="font-bold text-shop-ink">{String(page).padStart(2, '0')}</span> /{' '}
              {String(pageCount).padStart(2, '0')}
            </p>
          </div>
        )}

        {/* Module — filters (the rail replaces this on desktop) */}
        <button
          type="button"
          onClick={onOpenFilters}
          className="flex shrink-0 items-center gap-2 border-l border-shop-line px-4 text-sm font-semibold text-shop-ink transition-colors duration-300 hover:bg-shop-ink hover:text-white xl:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-shop-accent px-1.5 font-mono text-[11px] font-bold leading-none text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Module — active filters */}
      {chips.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-shop-line px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
          <span className={`shrink-0 ${MICRO_LABEL}`}>Active filters</span>
          <ActiveFilterChips chips={chips} onClearAll={onClearAll} />
        </div>
      )}
    </div>
  );
}
