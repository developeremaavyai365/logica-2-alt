import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const MICRO_LABEL = 'font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-shop-ink/45';

/** The title bar for the cart and wishlist pages, as one card divided into
 *  cells by hairlines: the page title, a count, and the way back to the
 *  shop. */
export default function PageHeaderCard({
  label,
  title,
  count,
  countLabel,
}: {
  label: string;
  title: string;
  count: number;
  countLabel: string;
}) {
  return (
    <div className="flex items-stretch overflow-hidden rounded-2xl border border-shop-line bg-white">
      {/* Module — title */}
      <div className="min-w-0 flex-1 px-5 py-4">
        <span className={`flex items-center gap-2 ${MICRO_LABEL}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-shop-accent" aria-hidden="true" />
          {label}
        </span>
        <h1 className="mt-1 truncate text-2xl font-semibold text-shop-ink sm:text-3xl" style={{ letterSpacing: '-0.03em' }}>
          {title}
        </h1>
      </div>

      {/* Module — count */}
      <div className="flex shrink-0 flex-col justify-center border-l border-shop-line px-4 sm:px-5">
        <span className={MICRO_LABEL}>{countLabel}</span>
        <span className="mt-0.5 font-mono text-xl font-bold tabular-nums leading-none text-shop-ink">
          {String(count).padStart(2, '0')}
        </span>
      </div>

      {/* Module — back to the shop */}
      <Link
        to="/shop"
        className="group flex shrink-0 items-center gap-2 border-l border-shop-line px-4 text-sm font-semibold text-shop-ink transition-colors duration-300 hover:bg-shop-ink hover:text-white sm:px-5"
      >
        <span className="hidden sm:inline">Continue shopping</span>
        <span className="sm:hidden">Shop</span>
        <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
