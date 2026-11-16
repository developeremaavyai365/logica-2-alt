import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Package } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import AccountShell from '../components/account/AccountShell';
import { listOrders, rupees as formatRupees, type OrderView as Order } from '../lib/checkout';

const MICRO_LABEL = 'block font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-shop-ink/45';

const STATUS_STYLE: Record<string, string> = {
  DELIVERED: 'bg-[#E8EBFD] text-[#3D4FE0]',
  PAYMENT_PENDING: 'bg-amber-50 text-amber-700',
  CANCELLED: 'bg-red-50 text-red-600',
  RETURNED: 'bg-red-50 text-red-600',
  REFUNDED: 'bg-red-50 text-red-600',
};

const STATUS_LABEL: Record<string, string> = {
  PAYMENT_PENDING: 'Payment pending',
  PLACED: 'Ordered',
};

function OrdersList() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    listOrders()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your orders right now.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AccountShell active="orders" eyebrow="Shopping" title="My orders">

        {error && (
          <div className="rounded-2xl border border-red-200 bg-white px-5 py-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* Loading — a placeholder in the shape of an order card */}
        {!error && orders === null && (
          <div className="overflow-hidden rounded-3xl border border-[#E7EAF3] bg-white shadow-[0_18px_40px_-24px_rgba(6,26,64,0.28)]" aria-busy="true" aria-label="Loading your orders">
            <div className="border-b border-[#EEF0F6] px-5 py-3.5">
              <div className="h-3 w-32 animate-pulse rounded bg-shop-canvas" />
            </div>
            <div className="grid grid-cols-3 gap-px bg-shop-line">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-white px-5 py-4">
                  <div className="h-2.5 w-12 animate-pulse rounded bg-shop-canvas" />
                  <div className="mt-2 h-4 w-20 animate-pulse rounded bg-shop-canvas" />
                </div>
              ))}
            </div>
          </div>
        )}

        {orders !== null && orders.length === 0 && (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-[#C7D2FE] bg-white px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-shop-canvas">
              <Package className="h-6 w-6 text-shop-ink/40" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-shop-ink">No orders yet</h2>
            <p className="mt-1 max-w-sm text-sm text-shop-ink/55">
              Once you place an order, it'll show up here with its status and delivery details.
            </p>
            <Link
              to="/shop"
              className="group mt-6 flex h-12 items-center gap-2 rounded-xl bg-[#061A40] px-6 text-sm font-semibold text-white transition-colors duration-300 hover:bg-shop-accent"
            >
              Start Shopping
              <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
            </Link>
          </div>
        )}

        {orders !== null && orders.length > 0 && (
          <ul className="flex flex-col gap-4">
            {orders.map((order) => {
              const units = order.items.reduce((sum, item) => sum + item.quantity, 0);
              return (
                <li key={order.id} className="overflow-hidden rounded-3xl border border-[#E7EAF3] bg-white shadow-[0_18px_40px_-24px_rgba(6,26,64,0.28)]">
                  {/* Module — header strip: order number + status */}
                  <div className="flex items-center justify-between gap-3 border-b border-[#EEF0F6] px-5 py-3">
                    <Link to={`/orders/${order.orderNumber}`} className="flex min-w-0 items-center gap-2.5 hover:opacity-70">
                      <Package className="h-4 w-4 shrink-0 text-shop-ink/45" />
                      <span className="truncate font-mono text-sm font-bold text-shop-ink">#{order.orderNumber}</span>
                    </Link>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] ${
                        STATUS_STYLE[order.status] ?? 'bg-shop-canvas text-shop-ink/60'
                      }`}
                    >
                      {STATUS_LABEL[order.status] ?? order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Module — the facts, as three cells */}
                  <div className="grid grid-cols-3 gap-px bg-shop-line">
                    <div className="bg-white px-5 py-3.5">
                      <span className={MICRO_LABEL}>Placed</span>
                      <span className="mt-0.5 block text-sm font-medium text-shop-ink">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="bg-white px-5 py-3.5">
                      <span className={MICRO_LABEL}>Items</span>
                      <span className="mt-0.5 block font-mono text-sm font-medium tabular-nums text-shop-ink">
                        {String(units).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="bg-white px-5 py-3.5">
                      <span className={MICRO_LABEL}>Total</span>
                      <span
                        className="mt-0.5 block font-dm-sans text-base font-semibold tabular-nums text-shop-ink"
                        style={{ letterSpacing: '-0.03em' }}
                      >
                        {formatRupees(order.totalPaise)}
                      </span>
                    </div>
                  </div>

                  {/* Module — what was ordered */}
                  {order.items.length > 0 && (
                    <ul className="divide-y divide-[#EEF0F6] border-t border-[#EEF0F6]">
                      {order.items.map((item, i) => (
                        <li key={i} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                          <span className="flex min-w-0 items-center gap-2.5">
                            <span className="shrink-0 font-mono text-[11px] tabular-nums text-shop-ink/40">
                              {item.quantity}×
                            </span>
                            <span className="truncate text-shop-ink/75">{item.name}</span>
                          </span>
                          <span className="shrink-0 font-mono text-xs tabular-nums text-shop-ink/55">
                            {formatRupees(item.unitPricePaise)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link
                    to={`/orders/${order.orderNumber}`}
                    className="flex items-center justify-between gap-3 border-t border-[#EEF0F6] px-5 py-3 text-sm font-semibold text-shop-ink/70 transition-colors hover:bg-shop-canvas hover:text-shop-ink"
                  >
                    {order.status === 'PAYMENT_PENDING' ? 'Complete payment' : 'View order details'}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
    </AccountShell>
  );
}

export default function Orders() {
  return (
    <ProtectedRoute>
      <OrdersList />
    </ProtectedRoute>
  );
}
